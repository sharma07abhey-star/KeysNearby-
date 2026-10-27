import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AsyncState, { VehicleSkeletons } from "../../components/AsyncState";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import VehicleCard from "../../components/VehicleCard";
import { useDemo } from "../../hooks/useDemo";
import { inr } from "../../utils/format";

const TYPES = ["SUV", "Sedan", "Hatchback", "MPV", "Bike", "Scooter"];
const SORTS = [
  { value: "rating", label: "Top rated" },
  { value: "price", label: "Price: low to high" },
  { value: "distance", label: "Nearest first" },
];

export default function FindVehicle() {
  const navigate = useNavigate();
  const { vehicles, status, loadError, loadVehicles, favorites, toggleFavorite } = useDemo();

  // The URL query string is the single source of truth for the filters.
  // That makes results shareable, keeps them on browser "back", and lets
  // the chatbot deep-link here (e.g. ?type=SUV&max=2000).
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const type = params.get("type") || "";
  const fuel = params.get("fuel") || "";
  const trans = params.get("trans") || "";
  const seats = Number(params.get("seats")) || 0;
  const max = Number(params.get("max")) || 0;
  const sort = params.get("sort") || "rating";
  const savedOnly = params.get("saved") === "1";

  function setParam(key, value) {
    const next = new URLSearchParams(params);
    if (value === "" || value === 0 || value === false) next.delete(key);
    else next.set(key, String(value));
    setParams(next, { replace: true });
  }

  const rentable = useMemo(() => vehicles.filter((v) => !v.mine && v.available !== false), [vehicles]);
  const priceCeiling = useMemo(() => Math.max(3000, ...rentable.map((v) => v.price)), [rentable]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rentable
      .filter((v) => {
        const haystack = [v.name, v.location, v.type, v.fuel, v.owner].join(" ").toLowerCase();
        return (
          (!term || haystack.includes(term)) &&
          (!type || v.type === type) &&
          (!fuel || v.fuel === fuel) &&
          (!trans || v.transmission === trans) &&
          (!seats || v.seats >= seats) &&
          (!max || v.price <= max) &&
          (!savedOnly || favorites.includes(v.id))
        );
      })
      .sort((a, b) => {
        if (sort === "price") return a.price - b.price;
        if (sort === "distance") return a.distance - b.distance;
        return b.rating - a.rating;
      });
  }, [rentable, q, type, fuel, trans, seats, max, sort, savedOnly, favorites]);

  const activeFilters = [type, fuel, trans, seats, max, q, savedOnly].filter(Boolean).length;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Rent"
        title="Find a vehicle"
        subtitle="Cars, bikes and scooters from verified owners near you."
      />

      <section className="filter-panel" aria-label="Vehicle filters">
        <div className="search-box">
          <Icon name="search" size={18} />
          <input
            value={q}
            onChange={(e) => setParam("q", e.target.value)}
            placeholder="Search by name, area or owner"
            aria-label="Search vehicles"
          />
          {q && (
            <button type="button" aria-label="Clear search" onClick={() => setParam("q", "")}>
              <Icon name="close" size={14} />
            </button>
          )}
        </div>

        <div className="chip-row" role="group" aria-label="Vehicle type">
          <button type="button" className={`chip${!type ? " on" : ""}`} onClick={() => setParam("type", "")}>All</button>
          {TYPES.map((t) => (
            <button key={t} type="button" className={`chip${type === t ? " on" : ""}`} aria-pressed={type === t} onClick={() => setParam("type", type === t ? "" : t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <label className="mini-field">
            Fuel
            <select value={fuel} onChange={(e) => setParam("fuel", e.target.value)}>
              <option value="">Any</option><option>Petrol</option><option>Diesel</option><option>Electric</option>
            </select>
          </label>
          <label className="mini-field">
            Transmission
            <select value={trans} onChange={(e) => setParam("trans", e.target.value)}>
              <option value="">Any</option><option>Automatic</option><option>Manual</option>
            </select>
          </label>
          <label className="mini-field">
            Seats
            <select value={seats} onChange={(e) => setParam("seats", Number(e.target.value))}>
              <option value={0}>Any</option><option value={4}>4+</option><option value={5}>5+</option><option value={7}>7+</option>
            </select>
          </label>
          <label className="mini-field grow">
            <span>Max price: <b>{max ? `${inr(max)}/day` : "Any"}</b></span>
            <input
              type="range"
              min="400"
              max={priceCeiling}
              step="100"
              value={max || priceCeiling}
              onChange={(e) => setParam("max", Number(e.target.value) >= priceCeiling ? 0 : Number(e.target.value))}
              aria-label="Maximum daily price"
            />
          </label>
          <label className="mini-field">
            Sort by
            <select value={sort} onChange={(e) => setParam("sort", e.target.value === "rating" ? "" : e.target.value)}>
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
          <button type="button" className={`chip chip-heart${savedOnly ? " on" : ""}`} aria-pressed={savedOnly} onClick={() => setParam("saved", savedOnly ? "" : "1")}>
            <Icon name="heart" size={14} /> Saved ({favorites.length})
          </button>
        </div>
      </section>

      <AsyncState status={status} error={loadError} onRetry={() => loadVehicles()} skeleton={<VehicleSkeletons />}>
        <div className="result-bar">
          <p className="result-count">
            <strong>{results.length}</strong> vehicle{results.length === 1 ? "" : "s"} available nearby
          </p>
          {activeFilters > 0 && (
            <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>
              Clear all filters
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="vehicle-grid">
            {results.map((v) => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                isFavorite={favorites.includes(v.id)}
                onToggleFavorite={toggleFavorite}
                onRent={(id) => navigate(`/dashboard/rent-vehicle?vehicle=${encodeURIComponent(id)}`)}
              />
            ))}
          </div>
        ) : (
          <section className="state-box" aria-live="polite">
            <Icon name="search" size={30} />
            <h2>No vehicles match</h2>
            <p>Try a higher budget, a different type, or clear the filters.</p>
            <button type="button" className="btn btn-ghost" onClick={() => setParams({}, { replace: true })}>
              Clear filters
            </button>
          </section>
        )}
      </AsyncState>
    </div>
  );
}
