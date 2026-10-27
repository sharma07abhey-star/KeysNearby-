import Icon from "./Icon";
import VehicleArt from "./VehicleArt";
import { inr } from "../utils/format";

const fuelIcon = { Electric: "bolt", Petrol: "fuel", Diesel: "fuel" };

export default function VehicleCard({
  vehicle,
  isFavorite = false,
  onToggleFavorite,
  onRent,
  actionLabel = "Rent now",
  children,
}) {
  return (
    <article className="vehicle-card">
      <div className={`vehicle-art ${vehicle.color}`}>
        {vehicle.image ? (
          <img src={vehicle.image} alt={vehicle.name} className="vehicle-photo" loading="lazy" />
        ) : (
          <VehicleArt type={vehicle.type} color={vehicle.color} />
        )}

        <span className="vehicle-badge">{vehicle.type}</span>
        {vehicle.mine && <span className="vehicle-badge vehicle-badge-right is-mine">Your listing</span>}
        {onToggleFavorite && (
          <button
            type="button"
            className={`fav-button${isFavorite ? " is-on" : ""}`}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? `Remove ${vehicle.name} from saved` : `Save ${vehicle.name}`}
            onClick={() => onToggleFavorite(vehicle.id)}
          >
            <Icon name="heart" size={17} />
          </button>
        )}
      </div>

      <div className="vehicle-body">
        <div className="vehicle-title-row">
          <h3>{vehicle.name}</h3>
          <span className="rating">
            <Icon name="star" size={13} />
            {vehicle.rating ? vehicle.rating.toFixed(1) : "New"}
          </span>
        </div>

        <p className="vehicle-location">
          <Icon name="pin" size={13} /> {vehicle.location}
          {vehicle.distance != null && <span> · {vehicle.distance} km</span>}
        </p>

        <ul className="spec-row">
          <li><Icon name={fuelIcon[vehicle.fuel] || "fuel"} size={13} />{vehicle.fuel}</li>
          <li><Icon name="gear" size={13} />{vehicle.transmission}</li>
          <li><Icon name="users" size={13} />{vehicle.seats} seats</li>
        </ul>

        <div className="vehicle-foot">
          <div className="vehicle-price">
            <strong>{inr(vehicle.price)}</strong>
            <span>/day</span>
          </div>
          {onRent && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onRent(vehicle.id)}>
              {actionLabel}
            </button>
          )}
        </div>
        {children}
      </div>
    </article>
  );
}
