import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import VehicleArt from "../../components/VehicleArt";
import { useDemo } from "../../hooks/useDemo";
import { useForm } from "../../hooks/useForm";
import { addDaysISO, inr, prettyDate, todayISO } from "../../utils/format";
import { PROTECTION_PER_DAY, quote } from "../../utils/pricing";
import { afterField, createValidator, notBefore, required } from "../../utils/validators";

export default function RentVehicle() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const { vehicles, status, addBooking, verification, ensureConversation, favorites, toggleFavorite } = useDemo();
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const vehicle = vehicles.find((v) => v.id === searchParams.get("vehicle") && !v.mine);
  const today = todayISO();

  const form = useForm({
    initialValues: { start: addDaysISO(today, 1), end: addDaysISO(today, 2), protection: false },
    validate: createValidator({
      start: [required("Choose a pickup date."), notBefore(today, "Pickup can't be in the past.")],
      end: [required("Choose a return date."), afterField("start", "Return must be after pickup.")],
    }),
    onSubmit: () => setConfirming(true),
  });

  if (status === "loading") return <div className="page-loading"><span className="spinner" /> Loading vehicle…</div>;

  if (!vehicle) {
    return (
      <div className="page">
        <PageHeader title="Rent a vehicle" back={{ to: "/dashboard/find-vehicle", label: "Find a vehicle" }} />
        <div className="state-box">
          <Icon name="car" size={30} />
          <h2>Vehicle not found</h2>
          <p>It may have been removed or is no longer available.</p>
          <Link to="/dashboard/find-vehicle" className="btn btn-primary">Browse vehicles</Link>
        </div>
      </div>
    );
  }

  const valid = form.isValid;
  const q = valid ? quote(vehicle, form.values.start, form.values.end, { protection: form.values.protection }) : null;
  const needsVerification = !verification.identity || !verification.licence;

  async function confirmBooking() {
    setSaving(true);
    const created = await addBooking({
      vehicleId: vehicle.id,
      vehicle: vehicle.name,
      location: vehicle.location,
      start: form.values.start,
      end: form.values.end,
      days: q.days,
      total: q.total,
      protection: form.values.protection,
    });
    setSaving(false);
    if (created) {
      setConfirming(false);
      toast({
        title: "Request sent ✅",
        message: `The owner will confirm soon · ${vehicle.name} · ${prettyDate(form.values.start)} → ${prettyDate(form.values.end)}`,
      });
      navigate("/dashboard/history");
    }
  }

  // Must await ensureConversation (it's async); guard against missing ownerName
  async function messageOwner() {
    const ownerName = vehicle.ownerName ?? vehicle.owner;
    if (!ownerName) {
      toast({ type: "error", title: "Can't message owner", message: "Owner details are missing for this vehicle." });
      return;
    }
    const id = await ensureConversation(ownerName, vehicle.name);
    if (id) navigate(`/dashboard/messages?c=${id}`);
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Rent"
        title={vehicle.name}
        subtitle={`${vehicle.type} · ${vehicle.year} · ${vehicle.location}`}
        back={{ to: "/dashboard/find-vehicle", label: "Find a vehicle" }}
      />

      <div className="two-col two-col-wide">
        <div className="stack">
          <section className="panel flush">
            <div className={`vehicle-art vehicle-art--hero ${vehicle.color}`}>
              {vehicle.image ? <img src={vehicle.image} alt={vehicle.name} className="vehicle-photo" /> : <VehicleArt type={vehicle.type} color={vehicle.color} />}
              <button
                type="button"
                className={`fav-button${favorites.includes(vehicle.id) ? " is-on" : ""}`}
                aria-pressed={favorites.includes(vehicle.id)}
                aria-label="Save vehicle"
                onClick={() => toggleFavorite(vehicle.id)}
              >
                <Icon name="heart" size={18} />
              </button>
            </div>
            <div className="panel-pad">
              <ul className="spec-row spec-row-lg">
                <li><Icon name="fuel" size={15} />{vehicle.fuel}</li>
                <li><Icon name="gear" size={15} />{vehicle.transmission}</li>
                <li><Icon name="users" size={15} />{vehicle.seats} seats</li>
                <li><Icon name="pin" size={15} />{vehicle.distance} km away</li>
              </ul>
              <h3 className="mini-heading">Highlights</h3>
              <div className="chip-row">
                {vehicle.features.map((f) => <span className="chip chip-static" key={f}><Icon name="check" size={13} /> {f}</span>)}
              </div>
            </div>
          </section>

          <section className="panel owner-card">
            <div className="avatar avatar-lg">{vehicle.owner.split(" ").map((p) => p[0]).join("").slice(0, 2)}</div>
            <div>
              <strong>Hosted by {vehicle.owner}</strong>
              <small><Icon name="shield" size={13} /> Verified owner · ★ {vehicle.rating.toFixed(1)} · {vehicle.trips} trips</small>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={messageOwner}>
              <Icon name="message" size={15} /> Message
            </button>
          </section>
        </div>

        <form className="panel booking-panel" onSubmit={form.handleSubmit} noValidate>
          <div className="booking-price">
            <strong>{inr(vehicle.price)}</strong><span>/ day</span>
          </div>

          {needsVerification && (
            <div className="notice notice-warn">
              <Icon name="info" size={16} />
              <span>
                Verify your identity and driving licence before pickup. <Link to="/dashboard/profile">Do it now</Link>
              </span>
            </div>
          )}

          <div className="form-grid">
            <Field label="Pickup date" type="date" min={today} {...form.getFieldProps("start")} />
            <Field label="Return date" type="date" min={form.values.start || today} {...form.getFieldProps("end")} />
          </div>

          <label className="option-card">
            <input type="checkbox" name="protection" checked={form.values.protection} onChange={(e) => form.setValue("protection", e.target.checked)} />
            <span>
              <strong>Add protection plan</strong>
              <small>Damage cover + roadside help · {inr(PROTECTION_PER_DAY)}/day</small>
            </span>
          </label>

          {q ? (
            <dl className="price-breakdown">
              <div><dt>{inr(vehicle.price)} × {q.days} day{q.days > 1 ? "s" : ""}</dt><dd>{inr(q.base)}</dd></div>
              {q.discount > 0 && <div className="good"><dt>Weekly discount (10%)</dt><dd>− {inr(q.discount)}</dd></div>}
              {q.protectionFee > 0 && <div><dt>Protection plan</dt><dd>{inr(q.protectionFee)}</dd></div>}
              <div><dt>Service fee (5%)</dt><dd>{inr(q.serviceFee)}</dd></div>
              <div className="total"><dt>Total</dt><dd>{inr(q.total)}</dd></div>
              <p className="muted">Plus a refundable {inr(q.deposit)} deposit held at pickup.</p>
            </dl>
          ) : (
            <p className="muted">Choose valid dates to see the price.</p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>Request booking</button>
          <small className="muted center">You won't be charged yet — payments are not part of this demo.</small>
        </form>
      </div>

      <ConfirmDialog
        open={confirming && !!q}
        title="Confirm your booking"
        confirmLabel={saving ? "Confirming…" : `Confirm · ${q ? inr(q.total) : ""}`}
        onCancel={() => setConfirming(false)}
        onConfirm={confirmBooking}
        confirmDisabled={saving}
      >
        {q && (
          <ul className="summary-list">
            <li><span>Vehicle</span><b>{vehicle.name}</b></li>
            <li><span>Pickup</span><b>{prettyDate(form.values.start)}</b></li>
            <li><span>Return</span><b>{prettyDate(form.values.end)}</b></li>
            <li><span>Location</span><b>{vehicle.location}</b></li>
            <li><span>Protection</span><b>{form.values.protection ? "Included" : "Not added"}</b></li>
          </ul>
        )}
      </ConfirmDialog>
    </div>
  );
}
