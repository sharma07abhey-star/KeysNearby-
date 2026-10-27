import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { cities, maxFare, routeKm } from "../../data/rides";
import { useDemo } from "../../hooks/useDemo";
import { useForm } from "../../hooks/useForm";
import { inr, initials, prettyDate, shortDate, todayISO } from "../../utils/format";
import {
  createValidator, differentFrom, notBefore, numberBetween, required,
} from "../../utils/validators";

const today = todayISO();

function addMinutes(time, minutes) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export default function Carpool() {
  const { rides, rideBookings, addRide, joinRide, cancelRideBooking, user, verification } = useDemo();
  const toast = useToast();
  const [params] = useSearchParams();

  // search filters (initial values may come from the chatbot's link)
  const [from, setFrom] = useState(params.get("from") || "");
  const [to, setTo] = useState(params.get("to") || "");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [womenOnly, setWomenOnly] = useState(params.get("women") === "1");
  const [sort, setSort] = useState("earliest");
  const [offering, setOffering] = useState(params.get("offer") === "1");
  const [selected, setSelected] = useState(null); // ride waiting for confirmation
  const [saving, setSaving] = useState(false);

  const results = useMemo(() => {
    const f = from.trim().toLowerCase();
    const t = to.trim().toLowerCase();
    return rides
      .filter((r) =>
        (!f || r.from.toLowerCase().includes(f)) &&
        (!t || r.to.toLowerCase().includes(t)) &&
        (!date || r.date === date) &&
        (!womenOnly || r.womenOnly) &&
        r.date >= today,
      )
      .sort((a, b) =>
        sort === "cheapest"
          ? a.price - b.price
          : (a.date + a.time).localeCompare(b.date + b.time),
      );
  }, [rides, from, to, date, womenOnly, sort]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  async function confirmJoin() {
    setSaving(true);
    const booking = await joinRide(selected.id, passengers);
    setSaving(false);
    if (booking) {
      toast({
        title: "Seat booked",
        message: `${selected.from} → ${selected.to} · ${passengers} seat${passengers > 1 ? "s" : ""} · ${inr(booking.total)}`,
      });
    }
    setSelected(null);
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Travel together"
        title="Ride pooling"
        subtitle="Share a journey, split the fuel cost, and take a car off the road."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setOffering((o) => !o)}>
            <Icon name={offering ? "close" : "plus"} size={16} /> {offering ? "Close" : "Offer a ride"}
          </button>
        }
      />

      <section className="pool-search" aria-label="Search rides">
        <label className="pool-field">
          <Icon name="pin" size={18} />
          <span>Leaving from</span>
          <input list="city-list" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Rajpura" />
        </label>
        <button type="button" className="swap-btn" onClick={swap} aria-label="Swap origin and destination">
          <Icon name="swap" size={18} />
        </button>
        <label className="pool-field">
          <Icon name="route" size={18} />
          <span>Going to</span>
          <input list="city-list" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Chandigarh" />
        </label>
        <label className="pool-field">
          <Icon name="calendar" size={18} />
          <span>Date</span>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="pool-field narrow">
          <Icon name="users" size={18} />
          <span>Passengers</span>
          <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist>
      </section>

      {offering && <OfferRideForm user={user} verified={verification.identity} onDone={() => setOffering(false)} addRide={addRide} />}

      {rideBookings.length > 0 && (
        <section className="panel">
          <div className="panel-head"><h2>Your booked rides</h2></div>
          <div className="request-list">
            {rideBookings.map((rb) => (
              <div className="request" key={rb.id}>
                <span className="avatar">{initials(rb.ride.driver)}</span>
                <div>
                  <strong>{rb.ride.from} → {rb.ride.to}</strong>
                  <small>{shortDate(rb.ride.date)} · {rb.ride.time} · {rb.seatCount} seat{rb.seatCount > 1 ? "s" : ""} with {rb.ride.driver}</small>
                </div>
                <b>{inr(rb.total)}</b>
                <button type="button" className="link-btn danger" onClick={() => { cancelRideBooking(rb.id); toast({ type: "info", title: "Ride cancelled" }); }}>
                  Cancel
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="result-bar">
        <p className="result-count"><strong>{results.length}</strong> ride{results.length === 1 ? "" : "s"} found</p>
        <div className="filter-inline">
          <label className="switch small">
            <input type="checkbox" checked={womenOnly} onChange={(e) => setWomenOnly(e.target.checked)} />
            <span className="switch-track" />
            <span className="switch-text">Women only</span>
          </label>
          <div className="seg" role="group" aria-label="Sort rides">
            <button type="button" className={sort === "earliest" ? "on" : ""} onClick={() => setSort("earliest")}>Earliest</button>
            <button type="button" className={sort === "cheapest" ? "on" : ""} onClick={() => setSort("cheapest")}>Cheapest</button>
          </div>
        </div>
      </div>

      <div className="ride-list">
        {results.map((ride) => {
          const full = ride.seats < passengers;
          return (
            <article className="ride-card" key={ride.id}>
              <div className="ride-timeline">
                <div className="stop"><b>{ride.time}</b><span>{ride.from}</span></div>
                <div className="leg"><i /><small>{Math.floor(ride.durationMin / 60)}h {String(ride.durationMin % 60).padStart(2, "0")}m</small></div>
                <div className="stop"><b>{addMinutes(ride.time, ride.durationMin)}</b><span>{ride.to}</span></div>
              </div>

              <div className="ride-meta">
                <span className="ride-date"><Icon name="calendar" size={14} /> {shortDate(ride.date)}</span>
                <div className="ride-driver">
                  <span className="avatar">{initials(ride.driver)}</span>
                  <div>
                    <strong>{ride.driver} {ride.verified && <Icon name="shield" size={13} />}</strong>
                    <small>★ {ride.rating.toFixed(1)} · {ride.trips} rides · {ride.vehicle}</small>
                  </div>
                </div>
                <div className="chip-row tight">
                  {ride.prefs.map((p) => <span key={p} className={`chip chip-static${p === "Women only" ? " chip-rose" : ""}`}>{p}</span>)}
                </div>
              </div>

              <div className="ride-action">
                <div className="ride-price"><strong>{inr(ride.price)}</strong><small>per seat</small></div>
                <small className={ride.seats <= 1 ? "warn-text" : "muted"}>{ride.seats} seat{ride.seats === 1 ? "" : "s"} left</small>
                <button type="button" className="btn btn-primary btn-sm" disabled={full} onClick={() => setSelected(ride)}>
                  {ride.seats === 0 ? "Full" : full ? "Not enough seats" : "Request seat"}
                </button>
              </div>
            </article>
          );
        })}

        {results.length === 0 && (
          <div className="state-box">
            <Icon name="route" size={30} />
            <h2>No rides match</h2>
            <p>Try different towns or dates — or offer a ride of your own.</p>
            <button type="button" className="btn btn-primary" onClick={() => setOffering(true)}>Offer a ride</button>
          </div>
        )}
      </div>

      <p className="demo-note">
        Demo only: rides live in this browser session and no real booking or payment is made. Fares are meant to share fuel costs, not to earn a profit.
      </p>

      <ConfirmDialog
        open={!!selected}
        title="Request this seat?"
        confirmLabel={saving ? "Requesting…" : selected ? `Request · ${inr(selected.price * passengers)}` : "Request"}
        onCancel={() => setSelected(null)}
        onConfirm={confirmJoin}
        confirmDisabled={saving}
      >
        {selected && (
          <ul className="summary-list">
            <li><span>Route</span><b>{selected.from} → {selected.to}</b></li>
            <li><span>When</span><b>{prettyDate(selected.date)} · {selected.time}</b></li>
            <li><span>Driver</span><b>{selected.driver}</b></li>
            <li><span>Seats</span><b>{passengers}</b></li>
            <li><span>Total (cost share)</span><b>{inr(selected.price * passengers)}</b></li>
          </ul>
        )}
      </ConfirmDialog>
    </div>
  );
}

function OfferRideForm({ user, verified, onDone, addRide }) {
  const toast = useToast();

  const form = useForm({
    initialValues: { from: "", to: "", date: "", time: "", seats: "3", price: "", vehicle: "", womenOnly: false, quiet: false },
    validate: (values) => {
      const errors = createValidator({
        from: [required("Where does the ride start?")],
        to: [required("Where does it end?"), differentFrom("from", "Destination must differ from the start.")],
        date: [required("Pick a date."), notBefore(today, "Date can't be in the past.")],
        time: [required("Pick a departure time.")],
        seats: [required(), numberBetween(1, 6, "Offer between 1 and 6 seats.")],
        price: [required("Set a price per seat."), numberBetween(0, 2000, "Enter a fair amount up to ₹2,000.")],
        vehicle: [required("Which vehicle will you drive?")],
      })(values);

      // extra rule: stay within a cost-share cap when we know the distance
      const km = values.from && values.to ? routeKm(values.from, values.to) : null;
      if (!errors.price && km && Number(values.price) > maxFare(km)) {
        errors.price = `For ${km} km, fares should stay at or below ${inr(maxFare(km))} (cost sharing).`;
      }
      return errors;
    },
    onSubmit: async (v) => {
      const km = routeKm(v.from, v.to);
      const prefs = ["No smoking"];
      if (v.womenOnly) prefs.unshift("Women only");
      if (v.quiet) prefs.push("Quiet ride");
      const created = await addRide({
        driver: user.name,
        from: v.from.trim(), to: v.to.trim(), date: v.date, time: v.time,
        durationMin: km ? Math.round((km / 50) * 60) : 60, seats: Number(v.seats),
        price: Number(v.price), vehicle: v.vehicle.trim(), womenOnly: v.womenOnly, prefs,
      });
      if (created) {
        toast({ title: "Ride published", message: `${v.from} → ${v.to} on ${prettyDate(v.date)}` });
        onDone();
      }
    },
  });

  const km = form.values.from && form.values.to ? routeKm(form.values.from, form.values.to) : null;

  return (
    <section className="panel offer-panel">
      <div className="panel-head">
        <h2>Offer a ride</h2>
        {!verified && <span className="chip chip-static chip-amber"><Icon name="info" size={13} /> Verify your ID to get a verified badge</span>}
      </div>
      <form className="form-grid cols-4" onSubmit={form.handleSubmit} noValidate>
        <Field label="Leaving from" placeholder="Rajpura" {...form.getFieldProps("from")} />
        <Field label="Going to" placeholder="Chandigarh" {...form.getFieldProps("to")} />
        <Field label="Date" type="date" min={today} {...form.getFieldProps("date")} />
        <Field label="Departure time" type="time" {...form.getFieldProps("time")} />
        <Field label="Seats available" type="number" min="1" max="6" {...form.getFieldProps("seats")} />
        <Field
          label="Price per seat"
          type="number"
          prefix="₹"
          hint={km ? `${km} km route · suggested max ${inr(maxFare(km))}` : "Share fuel costs, don't aim for profit."}
          {...form.getFieldProps("price")}
        />
        <Field label="Vehicle" placeholder="e.g. Maruti Swift" {...form.getFieldProps("vehicle")} />
        <div className="field-block">
          <span className="field-label">Preferences</span>
          <label className="check"><input type="checkbox" name="womenOnly" checked={form.values.womenOnly} onChange={form.getFieldProps("womenOnly").onChange} /> Women passengers only</label>
          <label className="check"><input type="checkbox" name="quiet" checked={form.values.quiet} onChange={form.getFieldProps("quiet").onChange} /> Quiet ride</label>
        </div>
        <div className="form-actions full">
          <button type="submit" className="btn btn-primary">Publish ride</button>
          <button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button>
        </div>
      </form>
    </section>
  );
}
