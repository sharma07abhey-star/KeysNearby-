import { useState } from "react";
import Icon from "../../components/Icon";
import { vehicles } from "../mockData";
const positions = [
  ["28%", "44%"],
  ["46%", "67%"],
  ["66%", "38%"],
  ["57%", "20%"],
];
export default function NearbyMap() {
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState("");
  const visible = vehicles.filter((v) =>
    v.name.toLowerCase().includes(query.toLowerCase()),
  );
  const current =
    vehicles.find((v) => v.id === selected) || visible[0] || vehicles[0];
  return (
    <div className="page-content">
      <h1 className="page-title">Nearby Map</h1>
      <p className="page-subtitle">
        See available vehicles pinned around your current location.
      </p>
      <section className="map-layout">
        <div className="map-canvas">
          <i className="map-road road-one" />
          <i className="map-road road-two" />
          <span className="map-user" title="Your location" />
          {visible.map((v) => {
            const [top, left] = positions[v.id - 1];
            return (
              <button
                key={v.id}
                className={`map-marker ${selected === v.id ? "selected" : ""}`}
                style={{ top, left }}
                onClick={() => setSelected(v.id)}
                aria-label={`Select ${v.name}`}
              >
                <Icon name="car" />
              </button>
            );
          })}
        </div>
        <aside className="map-side">
          <div className="map-side-header">
            <input
              className="dash-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vehicles..."
              aria-label="Search map vehicles"
            />
          </div>
          <div className="map-list">
            {visible.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.id)}
                className={`map-item ${v.id === selected ? "selected" : ""}`}
              >
                <span className="map-item-art">
                  <Icon name="car" size={16} />
                </span>
                <span>
                  <strong>{v.name}</strong>
                  <small>
                    {v.location} · ★ {v.rating}
                  </small>
                  <small>₹{v.price.toLocaleString()}/day</small>
                </span>
              </button>
            ))}
          </div>
          <div className="selected-summary">
            <span>SELECTED VEHICLE</span>
            <strong>{current.name}</strong>
            <span>
              {current.location} · ₹{current.price.toLocaleString()}/day
            </span>
          </div>
        </aside>
      </section>
    </div>
  );
}
