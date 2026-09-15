import { useState } from "react";
import Icon from "../../components/Icon";
export default function MapLocation() {
  const [location, setLocation] = useState("Koramangala, Bengaluru");
  const [saved, setSaved] = useState(false);
  return (
    <div className="page-content">
      <h1 className="page-title">Map & Location</h1>
      <p className="page-subtitle">
        Set your preferred area for nearby vehicle results.
      </p>
      <div className="dash-grid two-column">
        <section className="form-card">
          <div className="field">
            <label htmlFor="location">Search location</label>
            <input
              id="location"
              className="dash-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="quick-actions">
            <button className="dash-button secondary" type="button">
              <Icon name="pin" size={16} /> Use current location
            </button>
            <button
              className="dash-button"
              type="button"
              onClick={() => setSaved(true)}
            >
              Save location
            </button>
          </div>
          {saved && (
            <p className="form-note">
              Location preference saved for this frontend session.
            </p>
          )}
        </section>
        <section className="location-placeholder">
          <div>
            <Icon name="map" size={38} />
            <p>Interactive map preview</p>
            <small>A real location provider will be connected later.</small>
          </div>
        </section>
      </div>
    </div>
  );
}
