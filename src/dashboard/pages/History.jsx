import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActivityRow from "../../components/ActivityRow";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { useActivity } from "../../hooks/useActivity";
import { useDemo } from "../../hooks/useDemo";
import { inr } from "../../utils/format";

const TABS = [
  ["all", "All activity"],
  ["booking", "My trips"],
  ["listing", "Hosting"],
  ["ride", "Shared rides"],
];

export default function History() {
  const { cancelBooking, cancelRideBooking, bookings, hostRequests, rideBookings, loadAll } = useDemo();
  const activity = useActivity();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const [target, setTarget] = useState(null);

  // Re-fetch on mount so status changes made by a host (accept/decline) show up
  useEffect(() => { loadAll(); }, [loadAll]);

  const items = tab === "all" ? activity : activity.filter((a) => a.kind === tab);
  const spent = bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + b.total, 0)
    + rideBookings.reduce((s, r) => s + r.total, 0);
  const earned = hostRequests.filter((r) => r.status === "Accepted").reduce((s, r) => s + r.payout, 0);

  async function confirmCancel() {
    if (target.kind === "ride") await cancelRideBooking(target.id);
    else await cancelBooking(target.id);
    toast({ type: "info", title: "Cancelled", message: target.title });
    setTarget(null);
  }

  return (
    <div className="page">
      <PageHeader eyebrow="Activity" title="History" subtitle="Your trips, hosted bookings and shared rides in one place." />

      <div className="stats-grid">
        <div className="stat-card"><span className="stat-icon tone-blue"><Icon name="calendar" size={20} /></span><div><span className="stat-label">Trips booked</span><strong className="stat-value">{bookings.filter((b) => b.status !== "Cancelled").length}</strong></div></div>
        <div className="stat-card"><span className="stat-icon tone-rose"><Icon name="wallet" size={20} /></span><div><span className="stat-label">Total spent</span><strong className="stat-value">{inr(spent)}</strong></div></div>
        <div className="stat-card"><span className="stat-icon tone-green"><Icon name="trend" size={20} /></span><div><span className="stat-label">Total earned</span><strong className="stat-value">{inr(earned)}</strong></div></div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map(([value, label]) => (
          <button key={value} type="button" role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>
            {label}
          </button>
        ))}
      </div>

      <div className="activity-list">
        {items.map((item) => (
          <ActivityRow key={item.id} item={item}>
            {(item.status === "Confirmed" || item.status === "Pending") && (item.kind === "booking" || item.kind === "ride") && (
              <button type="button" className="link-btn danger" onClick={() => setTarget(item)}>Cancel</button>
            )}
          </ActivityRow>
        ))}
        {items.length === 0 && (
          <div className="state-box">
            <Icon name="history" size={28} />
            <h2>Nothing here yet</h2>
            <p>Your {tab === "all" ? "activity" : "items"} will show up here.</p>
            <Link to="/dashboard/find-vehicle" className="btn btn-primary">Find a vehicle</Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!target}
        title="Cancel this booking?"
        tone="danger"
        confirmLabel="Yes, cancel"
        cancelLabel="Keep it"
        onCancel={() => setTarget(null)}
        onConfirm={confirmCancel}
      >
        <p>{target?.title} · {target?.detail}</p>
        <p className="muted">Free cancellation applies more than 24 hours before pickup.</p>
      </ConfirmDialog>
    </div>
  );
}
