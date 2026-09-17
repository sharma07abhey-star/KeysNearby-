import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../../components/Icon";
import { useDemo } from "../../hooks/useDemo";

export default function RentVehicle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicles } = useDemo();
  const selectedId = searchParams.get("vehicle");
  const selectedVehicle =
    vehicles.find((vehicle) => vehicle.id === selectedId) || vehicles[0];

  if (!selectedVehicle) {
    return (
      <div className="page-content">
        <h1 className="page-title">Rent a Vehicle</h1>
        <div className="empty-state">
          No vehicles are currently available to rent.
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-nav-row">
        <button
          id="back-to-find-vehicle"
          className="back-button"
          type="button"
          aria-label="Back to Find a Vehicle"
          onClick={() => navigate("/dashboard/find-vehicle")}
        >
          <Icon name="arrow-left" size={18} />
          <span>Find a Vehicle</span>
        </button>
      </div>
      <h1 className="page-title">Rent a Vehicle</h1>
      <p className="page-subtitle">
        Review your selected vehicle and request your rental dates.
      </p>
      <div className="dash-grid two-column">
        <section className="form-card">
          <div className={`vehicle-art vehicle-art--hero ${selectedVehicle.color}`}>
            {selectedVehicle.image ? (
              <img
                src={selectedVehicle.image}
                alt={selectedVehicle.name}
                className="vehicle-photo"
              />
            ) : (
              <Icon name="car" />
            )}
          </div>
          <h2 className="section-heading">{selectedVehicle.name}</h2>
          <p className="page-subtitle">
            {selectedVehicle.type} · {selectedVehicle.location} · ★{" "}
            {selectedVehicle.rating || "New"}
          </p>
          <div className="vehicle-meta">
            <span>{selectedVehicle.distance} km away</span>
            <strong className="vehicle-price">
              ₹{selectedVehicle.price.toLocaleString()}/day
            </strong>
          </div>
        </section>
        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            alert(
              `🎉 Booking Confirmed!\n\nYour booking for ${selectedVehicle.name} has been confirmed. Our team will reach out to you shortly with pickup details.`
            );
            navigate("/dashboard/find-vehicle");
          }}
        >
          <h2 className="section-heading">Plan your trip</h2>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="start">Pickup date</label>
              <input id="start" className="dash-input" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="end">Return date</label>
              <input id="end" className="dash-input" type="date" required />
            </div>
          </div>
          <div className="price-summary">
            <span>Daily rental price</span>
            <span>₹{selectedVehicle.price.toLocaleString()}</span>
            <span>Service fee</span>
            <span>₹180</span>
            <strong>Total estimate</strong>
            <strong>Based on your dates</strong>
          </div>
          <button className="dash-button" type="submit">
            Request booking
          </button>
        </form>
      </div>
    </div>
  );
}
