import { Link } from "react-router-dom";
import Icon from "../../components/Icon";
import { historyItems, vehicles } from "../mockData";

export default function DashboardHome() {
  return (
    <div className="page-content">
      <h1 className="page-title">Welcome back</h1>
      <p className="page-subtitle">
        Your Keys Nearby activity, all in one place.
      </p>
      <div className="dash-grid stats-grid">
        {[
          ["Available nearby", "24"],
          ["Active bookings", "2"],
          ["This month", "₹7,200"],
        ].map(([label, value]) => (
          <div className="dash-card" key={label}>
            <span className="dash-card-label">{label}</span>
            <strong className="dash-card-value">{value}</strong>
          </div>
        ))}
      </div>
      <h2 className="section-heading">Quick actions</h2>
      <div className="quick-actions">
        <Link className="dash-button" to="/dashboard/find-vehicle">
          <Icon name="search" size={16} /> Find a vehicle
        </Link>
        <Link className="dash-button secondary" to="/dashboard/list-vehicle">
          <Icon name="car" size={16} /> List my vehicle
        </Link>
        <Link className="dash-button secondary" to="/dashboard/nearby-map">
          <Icon name="map" size={16} /> View map
        </Link>
      </div>
      <h2 className="section-heading">Recommended nearby</h2>
      <div className="vehicle-grid">
        {vehicles.slice(0, 3).map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
      <h2 className="section-heading">Recent activity</h2>
      <div className="activity-list">
        {historyItems.slice(0, 3).map((item) => (
          <Activity key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
export function VehicleCard({ vehicle }) {
  return (
    <article className="vehicle-card">
      <div className={`vehicle-art ${vehicle.color}`}>
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.name} className="vehicle-photo" />
        ) : (
          <Icon name="car" />
        )}
      </div>
      <div className="vehicle-body">
        <h3>{vehicle.name}</h3>
        <p>
          {vehicle.type} · {vehicle.location}
        </p>
        <div className="vehicle-meta">
          <span>
            ★ {vehicle.rating} · {vehicle.trips} trips
          </span>
          <span className="vehicle-price">
            ₹{vehicle.price.toLocaleString()}/day
          </span>
        </div>
      </div>
    </article>
  );
}
export function Activity({ item }) {
  return (
    <article className="activity-row">
      <div className="activity-icon">
        <Icon name={item.type === "listing" ? "car" : "calendar"} />
      </div>
      <div className="activity-info">
        <h3>
          {item.vehicle}
          <span
            className={`status ${item.status === "Cancelled" ? "cancelled" : ""}`}
          >
            {item.status}
          </span>
        </h3>
        <p>
          {item.detail} · {item.date}
        </p>
      </div>
      <strong className="activity-amount">{item.amount}</strong>
    </article>
  );
}
