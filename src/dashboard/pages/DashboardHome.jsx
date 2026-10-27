import { Link, useNavigate } from "react-router-dom";
import ActivityRow from "../../components/ActivityRow";
import EarningsChart from "../../components/EarningsChart";
import Icon from "../../components/Icon";
import { useToast } from "../../components/useToast";
import VehicleCard from "../../components/VehicleCard";
import { VehicleSkeletons } from "../../components/AsyncState";
import { useActivity } from "../../hooks/useActivity";
import { useDemo } from "../../hooks/useDemo";
import { useHostStats } from "../../hooks/useHostStats";
import { greeting, inr, prettyDate } from "../../utils/format";

function Stat({ icon, label, value, tone = "blue", hint }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon tone-${tone}`}><Icon name={icon} size={20} /></span>
      <div>
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user, mode, vehicles, status, bookings, favorites, toggleFavorite, rideBookings } = useDemo();
  const activity = useActivity();
  const navigate = useNavigate();
  const firstName = user.name.split(" ")[0];

  return (
    <div className="page">
      <section className="hero-card">
        <div>
          <span className="eyebrow">{mode === "host" ? "Host dashboard" : "Your trips"}</span>
          <h1>{greeting()}, {firstName} 👋</h1>
          <p>
            {mode === "host"
              ? "See what your vehicles are earning and respond to new booking requests."
              : "Find a vehicle nearby, share a ride, or put your own car to work."}
          </p>
          <div className="hero-actions">
            {mode === "host" ? (
              <>
                <Link className="btn btn-primary" to="/dashboard/my-vehicles"><Icon name="key" size={16} /> Manage my garage</Link>
                <Link className="btn btn-ghost" to="/dashboard/list-vehicle"><Icon name="plus" size={16} /> List a vehicle</Link>
              </>
            ) : (
              <>
                <Link className="btn btn-primary" to="/dashboard/find-vehicle"><Icon name="search" size={16} /> Find a vehicle</Link>
                <Link className="btn btn-ghost" to="/dashboard/carpool"><Icon name="users" size={16} /> Pool a ride</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <Icon name={mode === "host" ? "key" : "car"} size={96} />
        </div>
      </section>

      {mode === "host" ? (
        <HostView />
      ) : (
        <>
          <RenterStats bookings={bookings} favorites={favorites} vehicles={vehicles} rideBookings={rideBookings} />
          <NextTrip bookings={bookings} navigate={navigate} />

          <div className="section-head">
            <h2>Recommended nearby</h2>
            <Link to="/dashboard/find-vehicle" className="link-more">See all <Icon name="chevron" size={14} /></Link>
          </div>
          {status === "loading" ? (
            <VehicleSkeletons count={3} />
          ) : (
            <div className="vehicle-grid">
              {vehicles
                .filter((v) => !v.mine && v.available !== false)
                .slice(0, 3)
                .map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    isFavorite={favorites.includes(v.id)}
                    onToggleFavorite={toggleFavorite}
                    onRent={(id) => navigate(`/dashboard/rent-vehicle?vehicle=${id}`)}
                  />
                ))}
            </div>
          )}

          <section className="promo-card">
            <span className="promo-icon"><Icon name="leaf" size={22} /></span>
            <div>
              <strong>Heading out of town? Share the ride.</strong>
              <p>Split fuel costs with people going your way and keep one car off the road.</p>
            </div>
            <Link to="/dashboard/carpool" className="btn btn-primary btn-sm">Find rides</Link>
          </section>
        </>
      )}

      <div className="section-head"><h2>Recent activity</h2><Link to="/dashboard/history" className="link-more">View all <Icon name="chevron" size={14} /></Link></div>
      <div className="activity-list">
        {activity.slice(0, 4).map((item) => <ActivityRow key={item.id} item={item} />)}
        {activity.length === 0 && <div className="state-box"><p>No activity yet. Book your first trip!</p></div>}
      </div>
    </div>
  );
}

function RenterStats({ bookings, favorites, vehicles, rideBookings }) {
  const upcoming = bookings.filter((b) => b.status === "Confirmed").length;
  const nearby = vehicles.filter((v) => !v.mine && v.available !== false).length;
  return (
    <div className="stats-grid">
      <Stat icon="calendar" label="Upcoming trips" value={upcoming} tone="blue" />
      <Stat icon="car" label="Available nearby" value={nearby} tone="cyan" />
      <Stat icon="heart" label="Saved vehicles" value={favorites.length} tone="rose" />
      <Stat icon="users" label="Shared rides" value={rideBookings.length} tone="green" />
    </div>
  );
}

function NextTrip({ bookings, navigate }) {
  const next = bookings.filter((b) => b.status === "Confirmed").sort((a, b) => a.start.localeCompare(b.start))[0];
  if (!next) return null;
  return (
    <section className="next-trip">
      <span className="eyebrow">Next trip</span>
      <div className="next-trip-row">
        <div>
          <h3>{next.vehicle}</h3>
          <p><Icon name="calendar" size={14} /> {prettyDate(next.start)} → {prettyDate(next.end)} · <Icon name="pin" size={14} /> {next.location}</p>
        </div>
        <div className="next-trip-actions">
          <strong>{inr(next.total)}</strong>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard/messages")}>
            <Icon name="message" size={15} /> Message owner
          </button>
        </div>
      </div>
    </section>
  );
}

function HostView() {
  const { respondToRequest } = useDemo();
  const toast = useToast();
  const stats = useHostStats();

  function answer(request, accept) {
    respondToRequest(request.id, accept);
    toast({
      type: accept ? "success" : "info",
      title: accept ? "Request accepted" : "Request declined",
      message: `${request.renter} · ${request.vehicle}`,
    });
  }

  return (
    <>
      <div className="stats-grid">
        <Stat icon="wallet" label="Earned (recent)" value={inr(stats.earnedNow)} tone="green" />
        <Stat icon="key" label="Active listings" value={stats.activeListings} tone="blue" />
        <Stat icon="clock" label="Pending requests" value={stats.pending.length} tone="amber" />
        <Stat icon="trend" label="Trips hosted" value={stats.totalTrips} tone="cyan" />
      </div>

      <div className="two-col">
        <section className="panel">
          <div className="panel-head"><h2>Earnings</h2><span className="muted">Last 6 months</span></div>
          <EarningsChart series={stats.series} />
        </section>

        <section className="panel">
          <div className="panel-head"><h2>Booking requests</h2><Link to="/dashboard/my-vehicles" className="link-more">All <Icon name="chevron" size={14} /></Link></div>
          {stats.pending.length === 0 && <p className="muted">No pending requests. 🎉</p>}
          <div className="request-list">
            {stats.pending.map((r) => (
              <div className="request" key={r.id}>
                <div>
                  <strong>{r.renter}</strong>
                  <small>{r.vehicle} · {prettyDate(r.start)} · {r.days} day{r.days > 1 ? "s" : ""}</small>
                </div>
                <b>{inr(r.payout)}</b>
                <div className="request-buttons">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => answer(r, true)}>Accept</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => answer(r, false)}>Decline</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
