import { useState } from "react";
import { VehicleCard } from "./DashboardHome";
import { vehicles } from "../mockData";
export default function NearbyVehicles() {
  const [sort, setSort] = useState("Nearest");
  const [show, setShow] = useState(true);
  return (
    <div className="page-content">
      <h1 className="page-title">Nearby Vehicles</h1>
      <p className="page-subtitle">
        Discover vehicles available for rent close to your area.
      </p>
      <div className="filter-bar">
        <select
          className="dash-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option>Nearest</option>
          <option>Lowest price</option>
          <option>Highest rated</option>
        </select>
        <button
          className="dash-button secondary"
          onClick={() => setShow(!show)}
        >
          {show ? "Show empty state" : "Show vehicles"}
        </button>
      </div>
      {show ? (
        <>
          <p className="result-count">
            {vehicles.length} vehicles within 5 km · {sort}
          </p>
          <div className="vehicle-grid">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <strong>No vehicles available in this area right now.</strong>
          <p>Try expanding your distance or check back soon.</p>
        </div>
      )}
    </div>
  );
}
