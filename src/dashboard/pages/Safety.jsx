import { useState } from "react";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { useForm } from "../../hooks/useForm";
import { createValidator, phone, required } from "../../utils/validators";

const CHECKLIST = [
  "Match the number plate and owner/driver with your booking",
  "Share your trip details with someone you trust",
  "Meet at a public, well-lit pickup point",
  "Take photos of the vehicle before you start",
  "Keep your phone charged and location on",
];

function loadContact() {
  try {
    return JSON.parse(localStorage.getItem("keysNearbySafetyContact")) || { name: "", phone: "" };
  } catch {
    return { name: "", phone: "" };
  }
}

export default function Safety() {
  const toast = useToast();
  const [coords, setCoords] = useState(null);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [trip, setTrip] = useState(false);
  const [checked, setChecked] = useState([]);
  const [savedContact, setSavedContact] = useState(loadContact);

  const form = useForm({
    initialValues: savedContact,
    validate: createValidator({
      name: [required("Enter your contact's name.")],
      phone: [required("Enter a phone number."), phone()],
    }),
    onSubmit: (values) => {
      localStorage.setItem("keysNearbySafetyContact", JSON.stringify(values));
      setSavedContact(values);
      toast({ title: "Contact saved", message: "Stored on this device only. No alerts are sent automatically." });
    },
  });

  const mapLink = coords && `https://maps.google.com/?q=${coords.lat},${coords.lon}`;

  function locate() {
    setMessage("");
    if (!navigator.geolocation) {
      setMessage("This browser does not support location access.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: Math.round(pos.coords.accuracy) });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setMessage("Location permission wasn't granted. You can still use the checklist and emergency options.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function shareLocation() {
    if (!coords) return locate();
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Keys Nearby trip location", text: "My current location:", url: mapLink });
      } else {
        await navigator.clipboard.writeText(mapLink);
        toast({ title: "Link copied", message: "Send it to someone you trust." });
      }
    } catch {
      setMessage("Sharing was cancelled or isn't available. You can copy the map link below.");
    }
    return undefined;
  }

  const progress = Math.round((checked.length / CHECKLIST.length) * 100);

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title="Women’s safety & trip check-in" subtitle="Simple tools to help you and the people you trust stay informed." />

      <div className="safety-banner">
        <span className="safety-shield"><Icon name="shield" size={24} /></span>
        <div>
          <strong>Your safety comes first</strong>
          <p>Use verified hosts and drivers, check vehicle details, and share your plan before every trip.</p>
        </div>
        <a className="btn btn-danger" href="tel:112"><Icon name="phone" size={16} /> Call 112</a>
      </div>

      <div className="two-col">
        <section className="panel">
          <span className="eyebrow">Trip location</span>
          <h2>Share where you are</h2>
          <p className="muted">Location is only requested when you tap the button. This demo doesn't track you continuously or alert anyone automatically.</p>

          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={locate} disabled={locating}>
              <Icon name="pin" size={16} /> {locating ? "Locating…" : "Get my location"}
            </button>
            {coords && <button type="button" className="btn btn-ghost" onClick={shareLocation}><Icon name="send" size={16} /> Share</button>}
          </div>

          {coords && (
            <div className="location-result">
              <strong><i className="online-dot" /> Location found</strong>
              <small>Accuracy about {coords.accuracy} m</small>
              <a href={mapLink} target="_blank" rel="noreferrer">Open in Maps ↗</a>
            </div>
          )}
          {message && <p className="notice notice-warn" role="status"><Icon name="info" size={16} /> {message}</p>}

          <div className="trip-tracker">
            <div>
              <strong>{trip ? "Check-in active" : "Check-in off"}</strong>
              <small>{trip ? "Remember to end it when you arrive safely." : "Turn on before you set off."}</small>
            </div>
            <label className="switch">
              <input type="checkbox" checked={trip} onChange={(e) => { setTrip(e.target.checked); toast({ type: "info", title: e.target.checked ? "Check-in started" : "Check-in ended" }); }} />
              <span className="switch-track" />
            </label>
          </div>
        </section>

        <section className="panel">
          <span className="eyebrow">Trusted contact</span>
          <h2>Who should know?</h2>
          <form className="form-grid" onSubmit={form.handleSubmit} noValidate>
            <Field label="Contact name" full placeholder="Friend or family member" {...form.getFieldProps("name")} />
            <Field label="Phone number" full type="tel" placeholder="98765 43210" {...form.getFieldProps("phone")} />
            <div className="form-actions full">
              <button type="submit" className="btn btn-primary">Save contact</button>
              {savedContact.phone && <a className="btn btn-ghost" href={`tel:${savedContact.phone}`}><Icon name="phone" size={16} /> Call {savedContact.name.split(" ")[0] || "contact"}</a>}
            </div>
          </form>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head">
          <div><span className="eyebrow">Before you go</span><h2>Safety checklist</h2></div>
          <span className="progress-pill">{progress}% done</span>
        </div>
        <div className="progress-bar"><i style={{ width: `${progress}%` }} /></div>
        <ul className="checklist">
          {CHECKLIST.map((item) => (
            <li key={item}>
              <label className="check">
                <input type="checkbox" checked={checked.includes(item)} onChange={() => setChecked((c) => c.includes(item) ? c.filter((x) => x !== item) : [...c, item])} />
                <span>{item}</span>
              </label>
            </li>
          ))}
        </ul>
        <p className="demo-note">This is a prototype, not an emergency service. SOS alerts, live vehicle GPS and automatic sharing need a backend and device permissions. In an emergency, call 112.</p>
      </section>
    </div>
  );
}
