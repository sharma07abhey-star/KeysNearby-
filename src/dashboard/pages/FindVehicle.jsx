import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { useDemo } from "../../hooks/useDemo";

export default function FindVehicle() {
  const navigate = useNavigate();
  const { vehicles } = useDemo();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All types");

  const vehicleTypes = useMemo(
    () => [...new Set(vehicles.map((vehicle) => vehicle.type))],
    [vehicles],
  );

  const matchingVehicles = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch = [vehicle.name, vehicle.location, vehicle.type]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm);
      const matchesType =
        selectedType === "All types" || vehicle.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [query, selectedType, vehicles]);

  function handleRentNow(vehicleId) {
    navigate(
      `/dashboard/rent-vehicle?vehicle=${encodeURIComponent(vehicleId)}`,
    );
  }

  return (
    <div className="page-content">
      <h1 className="page-title">Find a Vehicle</h1>
      <p className="page-subtitle">
        Search and filter vehicles available near your location.
      </p>

      <section className="filter-bar" aria-label="Vehicle filters">
        <input
          className="dash-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search vehicle, location, or type"
          aria-label="Search vehicles"
        />
        <select
          className="dash-select"
          value={selectedType}
          onChange={(event) => setSelectedType(event.target.value)}
          aria-label="Filter by vehicle type"
        >
          <option>All types</option>
          {vehicleTypes.map((vehicleType) => (
            <option key={vehicleType}>{vehicleType}</option>
          ))}
        </select>
      </section>

      <p className="result-count">
        {matchingVehicles.length} vehicle
        {matchingVehicles.length === 1 ? "" : "s"} available nearby
      </p>

      {matchingVehicles.length > 0 ? (
        <div className="vehicle-grid">
          {matchingVehicles.map((vehicle) => (
            <article className="vehicle-card" key={vehicle.id}>
              <div className={`vehicle-art ${vehicle.color}`}>
                {vehicle.image ? (
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="vehicle-photo"
                  />
                ) : (
                  <Icon name="car" />
                )}
              </div>
              <div className="vehicle-body">
                <h2>{vehicle.name}</h2>
                <p>
                  {vehicle.type} · {vehicle.fuel} · {vehicle.transmission}
                </p>
                <p>
                  {vehicle.location} · {vehicle.distance} km away
                </p>
                <div className="vehicle-meta">
                  <span>★ {vehicle.rating || "New"}</span>
                  <strong className="vehicle-price">
                    ₹{vehicle.price.toLocaleString()}/day
                  </strong>
                </div>
                <button
                  className="vehicle-rent-button"
                  type="button"
                  onClick={() => handleRentNow(vehicle.id)}
                >
                  Rent Now
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="empty-state" aria-live="polite">
          <Icon name="search" size={28} />
          <h2>No vehicles found</h2>
          <p>Try another vehicle name, location, or vehicle type.</p>
          <button
            className="dash-button secondary"
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedType("All types");
            }}
          >
            Clear filters
          </button>
        </section>
      )}
    </div>
  );
}
