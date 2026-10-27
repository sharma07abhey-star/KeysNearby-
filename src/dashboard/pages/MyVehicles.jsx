import { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import VehicleArt from "../../components/VehicleArt";
import { useDemo } from "../../hooks/useDemo";
import { useHostStats } from "../../hooks/useHostStats";
import { inr, prettyDate } from "../../utils/format";

export default function MyVehicles() {
  const { respondToRequest, hostRequests, removeVehicle } = useDemo();
  const stats = useHostStats();
  const toast = useToast();
  const [toDelete, setToDelete] = useState(null);

  const handled = hostRequests.filter((r) => r.status !== "Pending");

  function answer(request, accept) {
    respondToRequest(request.id, accept);
    toast({
      type: accept ? "success" : "info",
      title: accept ? "Request accepted" : "Request declined",
      message: `${request.renter} · ${request.vehicle}`,
    });
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Host"
        title="My garage"
        subtitle="Manage your vehicles, prices and booking requests."
        actions={<Link to="/dashboard/list-vehicle" className="btn btn-primary"><Icon name="plus" size={16} /> List a vehicle</Link>}
      />

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon tone-green"><Icon name="wallet" size={20} /></span><div><span className="stat-label">Earned (recent)</span><strong className="stat-value">{inr(stats.earnedNow)}</strong></div></div>
        <div className="stat-card"><span className="stat-icon tone-blue"><Icon name="key" size={20} /></span><div><span className="stat-label">Vehicles listed</span><strong className="stat-value">{stats.mine.length}</strong></div></div>
        <div className="stat-card"><span className="stat-icon tone-amber"><Icon name="clock" size={20} /></span><div><span className="stat-label">Pending requests</span><strong className="stat-value">{stats.pending.length}</strong></div></div>
      </div>

      <div className="section-head"><h2>Booking requests</h2></div>
      {stats.pending.length === 0 ? (
        <div className="state-box"><Icon name="check" size={26} /><p>You're all caught up — no pending requests.</p></div>
      ) : (
        <div className="request-list panel">
          {stats.pending.map((r) => (
            <div className="request" key={r.id}>
              <div className="avatar">{r.renter.split(" ").map((p) => p[0]).join("")}</div>
              <div>
                <strong>{r.renter}</strong>
                <small>{r.vehicle} · {prettyDate(r.start)} → {prettyDate(r.end)} ({r.days} day{r.days > 1 ? "s" : ""})</small>
              </div>
              <b>{inr(r.payout)}</b>
              <div className="request-buttons">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => answer(r, true)}>Accept</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => answer(r, false)}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-head"><h2>Your vehicles</h2></div>
      {stats.mine.length === 0 ? (
        <div className="state-box">
          <Icon name="car" size={30} />
          <h2>No vehicles yet</h2>
          <p>List your first vehicle and start earning.</p>
          <Link to="/dashboard/list-vehicle" className="btn btn-primary">List a vehicle</Link>
        </div>
      ) : (
        <div className="listing-list">
          {stats.mine.map((v) => <ListingRow key={v.id} vehicle={v} onDelete={() => setToDelete(v)} />)}
        </div>
      )}

      {handled.length > 0 && (
        <>
          <div className="section-head"><h2>Past requests</h2></div>
          <div className="activity-list">
            {handled.map((r) => (
              <article className="activity-row" key={r.id}>
                <div className="activity-icon kind-listing"><Icon name="key" size={18} /></div>
                <div className="activity-info">
                  <h3>{r.renter}<span className={`status status-${r.status.toLowerCase()}`}>{r.status}</span></h3>
                  <p>{r.vehicle} · {prettyDate(r.start)}</p>
                </div>
                <strong className={`activity-amount${r.status === "Accepted" ? " is-income" : ""}`}>{r.status === "Accepted" ? `+${inr(r.payout)}` : "—"}</strong>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Remove this listing?"
        tone="danger"
        confirmLabel="Remove"
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          await removeVehicle(toDelete.id);
          toast({ type: "info", title: "Listing removed", message: toDelete.name });
          setToDelete(null);
        }}
      >
        <p>{toDelete?.name} will no longer appear to renters. Existing bookings are not affected.</p>
      </ConfirmDialog>
    </div>
  );
}

function ListingRow({ vehicle, onDelete }) {
  const { updateVehicle } = useDemo();
  const toast = useToast();
  const [price, setPrice] = useState(String(vehicle.price));
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingAvail, setSavingAvail] = useState(false);

  const n = Number(price);
  const valid = Number.isFinite(n) && n >= 300 && n <= 10000;
  const changed = valid && n !== vehicle.price;

  async function savePrice() {
    setSavingPrice(true);
    await updateVehicle(vehicle.id, { price: n });
    toast({ title: "Price updated", message: `${vehicle.name} is now ${n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })}/day` });
    setSavingPrice(false);
  }

  async function toggleAvail(checked) {
    setSavingAvail(true);
    await updateVehicle(vehicle.id, { available: checked });
    toast({ type: "info", title: checked ? "Listing is live" : "Listing paused", message: vehicle.name });
    setSavingAvail(false);
  }

  return (
    <article className="listing-row">
      <div className={`listing-thumb vehicle-art ${vehicle.color}`}>
        {vehicle.image ? <img src={vehicle.image} alt={vehicle.name} className="vehicle-photo" /> : <VehicleArt type={vehicle.type} color={vehicle.color} />}
      </div>
      <div className="listing-info">
        <h3>{vehicle.name}</h3>
        <p>{vehicle.type} · {vehicle.fuel} · {vehicle.location}</p>
        <small><Icon name="star" size={12} /> {vehicle.rating ? vehicle.rating.toFixed(1) : "New"} · {vehicle.trips} trips</small>
      </div>

      <label className="price-edit">
        <span>Daily price</span>
        <div>
          <i>₹</i>
          <input type="number" value={price} min="300" max="10000" onChange={(e) => setPrice(e.target.value)} aria-label={`Daily price for ${vehicle.name}`} className={price && !valid ? "has-error" : ""} />
          <button
            type="button"
            className="btn btn-primary btn-xs"
            disabled={!changed || savingPrice}
            onClick={savePrice}
          >
            {savingPrice ? "Saving…" : "Save"}
          </button>
        </div>
      </label>

      <label className="switch" title={vehicle.available ? "Visible to renters" : "Hidden from renters"}>
        <input
          type="checkbox"
          checked={vehicle.available}
          disabled={savingAvail}
          onChange={(e) => toggleAvail(e.target.checked)}
        />
        <span className="switch-track" />
        <span className="switch-text">{savingAvail ? "Saving…" : vehicle.available ? "Available" : "Paused"}</span>
      </label>

      <button type="button" className="icon-btn danger" aria-label={`Remove ${vehicle.name}`} onClick={onDelete}>
        <Icon name="trash" size={17} />
      </button>
    </article>
  );
}
