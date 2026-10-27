import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useDemo } from "../../hooks/useDemo";
import { inr } from "../../utils/format";

const RADII = [2, 5, 10];

export default function NearbyMap() {
  const navigate = useNavigate();
  const { vehicles, status, user } = useDemo();
  const [radius, setRadius] = useState(5);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return vehicles
      .filter((v) => !v.mine && v.available !== false && v.distance <= radius)
      .filter((v) => !term || `${v.name} ${v.type} ${v.location}`.toLowerCase().includes(term))
      .sort((a, b) => a.distance - b.distance);
  }, [vehicles, radius, query]);

  const current = visible.find((v) => v.id === selectedId) || visible[0];

  return (
    <div className="page">
      <PageHeader eyebrow="Rent" title="Nearby map" subtitle={`Vehicles available around ${user.location}.`} />

      <div className="map-toolbar">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search vehicles on the map" aria-label="Search map vehicles" />
        </div>
        <div className="seg" role="group" aria-label="Search radius">
          {RADII.map((r) => (
            <button key={r} type="button" className={radius === r ? "on" : ""} aria-pressed={radius === r} onClick={() => setRadius(r)}>
              {r} km
            </button>
          ))}
        </div>
      </div>

      <section className="map-layout">
        <div className="map-canvas" aria-label="Map of nearby vehicles">
          <svg className="map-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <rect width="100" height="100" fill="#0c1424" />
            <path d="M-5 78 C 25 60, 40 92, 70 72 S 100 60, 108 66 L108 80 C 90 76, 80 92, 60 88 S 20 76, -5 92Z" fill="#0f2a4a" opacity=".7" />
            <rect x="8" y="10" width="18" height="16" rx="4" fill="#0f2a22" />
            <rect x="70" y="8" width="22" height="14" rx="4" fill="#0f2a22" />
            <g stroke="#1b2a47" strokeWidth="1.1" fill="none" strokeLinecap="round">
              <path d="M0 40 L100 34" /><path d="M0 62 L100 58" /><path d="M30 0 L38 100" /><path d="M64 0 L58 100" />
              <path d="M0 14 L100 20" strokeWidth=".6" /><path d="M82 0 L90 100" strokeWidth=".6" /><path d="M10 0 L16 100" strokeWidth=".6" />
            </g>
            <g stroke="#26395f" strokeWidth="1.8" fill="none" strokeLinecap="round">
              <path d="M0 50 C 30 46, 60 54, 100 48" />
              <path d="M48 0 C 46 30, 52 70, 50 100" />
            </g>
          </svg>

          <span className="radius-ring" style={{ "--ring": `${radius * 8}%` }} aria-hidden="true" />
          <span className="map-user" title="Your location"><i /></span>

          {status === "loading" && <div className="map-loading"><span className="spinner" /> Loading vehicles…</div>}

          {visible.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`map-pin${current?.id === v.id ? " selected" : ""}`}
              style={{ left: `${v.pos.x}%`, top: `${v.pos.y}%` }}
              onClick={() => setSelectedId(v.id)}
              aria-label={`${v.name}, ${inr(v.price)} per day`}
            >
              {inr(v.price)}
            </button>
          ))}
        </div>

        <aside className="map-side">
          <div className="map-list">
            {visible.length === 0 && <p className="muted pad">No vehicles within {radius} km. Try a larger radius.</p>}
            {visible.map((v) => (
              <button type="button" key={v.id} className={`map-item${current?.id === v.id ? " selected" : ""}`} onClick={() => setSelectedId(v.id)}>
                <span className="map-item-art"><Icon name="car" size={18} /></span>
                <span>
                  <strong>{v.name}</strong>
                  <small>{v.location.split(",")[0]} · {v.distance} km · ★ {v.rating}</small>
                </span>
                <b>{inr(v.price)}</b>
              </button>
            ))}
          </div>

          {current && (
            <div className="selected-summary">
              <span className="eyebrow">Selected</span>
              <strong>{current.name}</strong>
              <small>{current.type} · {current.fuel} · {current.seats} seats</small>
              <button type="button" className="btn btn-primary btn-block" onClick={() => navigate(`/dashboard/rent-vehicle?vehicle=${current.id}`)}>
                View & rent · {inr(current.price)}/day
              </button>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
