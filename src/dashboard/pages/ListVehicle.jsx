import { useRef, useState } from "react";

export default function ListVehicle() {
  // Incrementing this key forces React to unmount + remount the form,
  // which resets every uncontrolled input back to its default value.
  const [formKey, setFormKey] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    alert("Your vehicle is listed successfully.");
    setFormKey((k) => k + 1); // triggers a fresh empty form
  }

  return (
    <div className="page-content">
      <h1 className="page-title">List My Vehicle</h1>
      <p className="page-subtitle">
        Rent out your personal vehicle and earn when it is parked.
      </p>
      <VehicleForm key={formKey} onSubmit={handleSubmit} />
    </div>
  );
}

function VehicleForm({ onSubmit }) {
  const [photos, setPhotos] = useState([]);

  function handleFiles(e) {
    const chosen = Array.from(e.target.files).slice(0, 8);
    setPhotos(chosen);
  }

  return (
    <form className="form-card" onSubmit={onSubmit}>
      <div className="form-grid">
        <Field label="Vehicle make and model" placeholder="e.g. Tata Nexon" />
        <Field
          label="Vehicle type"
          select
          options={["SUV", "Sedan", "Hatchback", "Bike"]}
        />
        <Field label="Daily price" placeholder="₹ 1,500" />
        <Field label="Pickup location" placeholder="Area, city" />
        <Field label="Available from" type="date" />
        <Field label="Available until" type="date" />
        <div className="field full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="dash-input"
            placeholder="Tell renters about your vehicle, condition, and pickup details."
          />
        </div>

        {/* Vehicle photos — real file picker */}
        <div className="field full">
          <label>Vehicle photos</label>
          <input
            id="vehicle-photos"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            style={{ display: "none" }}
            onChange={handleFiles}
          />
          <label
            htmlFor="vehicle-photos"
            className="upload-box upload-box--clickable"
          >
            {photos.length === 0 ? (
              <>
                Drag photos here or <strong>choose files</strong>
                <br />
                <small>JPG, PNG or WEBP · up to 8 photos</small>
              </>
            ) : (
              <div className="upload-preview">
                <span className="upload-check">
                  ✓ {photos.length} photo{photos.length > 1 ? "s" : ""} selected
                </span>
                <ul className="upload-file-list">
                  {photos.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
                <small>Click to change selection</small>
              </div>
            )}
          </label>
        </div>
      </div>

      <button className="dash-button" type="submit">
        List Vehicle
      </button>
    </form>
  );
}

function Field({ label, placeholder, type = "text", select, options = [] }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {select ? (
        <select id={id} className="dash-select">
          {options.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          className="dash-input"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
