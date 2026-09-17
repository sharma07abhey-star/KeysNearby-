import { useState } from "react";
import { Activity } from "./DashboardHome";
import { historyItems } from "../mockData";
export default function History() {
  const [tab, setTab] = useState("all");
  const items =
    tab === "all" ? historyItems : historyItems.filter((x) => x.type === tab);
  return (
    <div className="page-content">
      <h1 className="page-title">History</h1>
      <p className="page-subtitle">
        View your vehicle listings and booking history in one place.
      </p>
      <div className="dash-grid stats-grid">
        {[
          ["Total bookings", "16"],
          ["Active listings", "2"],
          ["This month", "₹7,200"],
        ].map(([l, v]) => (
          <div className="dash-card" key={l}>
            <span className="dash-card-label">{l}</span>
            <strong className="dash-card-value">{v}</strong>
          </div>
        ))}
      </div>
      <h2 className="section-heading">Recent activity</h2>
      <div className="tabs">
        {[
          ["all", "All activity"],
          ["booking", "Bookings"],
          ["listing", "My listings"],
        ].map(([value, label]) => (
          <button
            key={value}
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="activity-list">
        {items.map((item) => (
          <Activity key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
