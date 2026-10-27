import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import VehicleCard from "../../components/VehicleCard";
import { useDemo } from "../../hooks/useDemo";
import { useForm } from "../../hooks/useForm";
import { addDaysISO, inr, todayISO } from "../../utils/format";
import { estimateMonthly, suggestedRange } from "../../utils/pricing";
import {
  afterField, createValidator, minLength, notBefore, numberBetween, required,
} from "../../utils/validators";

const TYPES = ["Hatchback", "Sedan", "SUV", "MPV", "Bike", "Scooter"];
const FEATURES = ["Bluetooth", "Rear camera", "Sunroof", "Cruise control", "Helmet included", "GPS", "Child seat"];
const today = todayISO();

const validate = createValidator({
  brand: [required("Enter the brand, e.g. Hyundai.")],
  model: [required("Enter the model, e.g. i20.")],
  year: [required("Enter the year."), numberBetween(2005, new Date().getFullYear() + 1, "Enter a year from 2005 onwards.")],
  price: [required("Set a daily price."), numberBetween(300, 10000, "Price must be between ₹300 and ₹10,000.")],
  location: [required("Where will renters pick it up?"), minLength(3, "Add the area and city.")],
  from: [required("Choose a start date."), notBefore(today, "Start date can't be in the past.")],
  until: [required("Choose an end date."), afterField("from", "End date must be after the start date.")],
  description: [required("Describe your vehicle."), minLength(20, "Write at least 20 characters so renters know what to expect.")],
});

export default function ListVehicle() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addVehicle } = useDemo();
  const [photoFiles, setPhotoFiles] = useState([]); // raw File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // blob URLs for preview
  const [photoError, setPhotoError] = useState("");
  const [saving, setSaving] = useState(false);

  const form = useForm({
    initialValues: {
      brand: "", model: "", type: "Hatchback", fuel: "Petrol", transmission: "Manual",
      seats: "5", year: "", price: "", location: "", from: today,
      until: addDaysISO(today, 60), description: "", features: [],
    },
    validate,
    onSubmit: async (v) => {
      setSaving(true);
      // Requirement 12: pass raw File so context can canvas-downscale it
      const created = await addVehicle({
        brand: v.brand.trim(), model: v.model.trim(), type: v.type, fuel: v.fuel,
        transmission: v.transmission, seats: Number(v.seats), year: Number(v.year),
        price: Number(v.price), location: v.location.trim(), description: v.description.trim(),
        features: v.features.length ? v.features : ["Well maintained"],
        availableFrom: v.from,
        availableUntil: v.until,
        _photoFile: photoFiles[0] || null,
        image: null,
      });
      setSaving(false);
      if (created) {
        toast({ title: "Vehicle listed", message: `${created.name} is now live for renters nearby.` });
        navigate("/dashboard/my-vehicles");
      }
    },
  });

  const { values } = form;
  const [low, high] = suggestedRange(values.type);
  const price = Number(values.price);

  function onPhotos(event) {
    const files = Array.from(event.target.files);
    const bad = files.find((f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024);
    if (bad) {
      setPhotoError(`${bad.name}: use a JPG, PNG or WEBP under 5 MB.`);
      return;
    }
    setPhotoError("");
    setPhotoFiles((cur) => [...cur, ...files].slice(0, 6));
    setPhotoPreviews((cur) =>
      [...cur, ...files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))].slice(0, 6),
    );
    event.target.value = "";
  }

  function toggleFeature(name) {
    const set = new Set(values.features);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    form.setValue("features", [...set]);
  }

  const preview = {
    id: "preview",
    name: `${values.brand || "Brand"} ${values.model || "Model"}`,
    type: values.type, fuel: values.fuel, transmission: values.transmission,
    seats: Number(values.seats) || 5, price: price || low, rating: 0,
    location: values.location || "Your pickup area", distance: 0.3,
    color: "blue", image: photoPreviews[0]?.url || null, mine: true,
  };

  return (
    <div className="page">
      <PageHeader
        eyebrow="Host"
        title="List your vehicle"
        subtitle="Turn a parked car or bike into monthly income. You choose the price and who rents it."
      />

      <div className="two-col two-col-wide">
        <form className="panel stack-lg" onSubmit={form.handleSubmit} noValidate>
          <fieldset className="fieldset">
            <legend>1 · Vehicle details</legend>
            <div className="form-grid">
              <Field label="Brand" placeholder="e.g. Hyundai" {...form.getFieldProps("brand")} />
              <Field label="Model" placeholder="e.g. i20" {...form.getFieldProps("model")} />
              <Field label="Vehicle type" as="select" options={TYPES} {...form.getFieldProps("type")} />
              <Field label="Year" type="number" placeholder="2022" {...form.getFieldProps("year")} />
              <Field label="Fuel" as="select" options={["Petrol", "Diesel", "Electric", "CNG"]} {...form.getFieldProps("fuel")} />
              <Field label="Transmission" as="select" options={["Manual", "Automatic"]} {...form.getFieldProps("transmission")} />
              <Field label="Seats" as="select" options={["2", "4", "5", "7"]} {...form.getFieldProps("seats")} />
              <Field label="Pickup location" placeholder="Area, city" {...form.getFieldProps("location")} />
            </div>
            <div className="field-block">
              <span className="field-label">Features</span>
              <div className="chip-row">
                {FEATURES.map((f) => (
                  <button key={f} type="button" className={`chip${values.features.includes(f) ? " on" : ""}`} aria-pressed={values.features.includes(f)} onClick={() => toggleFeature(f)}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend>2 · Price & availability</legend>
            <div className="form-grid">
              <Field label="Daily price" type="number" prefix="₹" placeholder="1500" hint={`Similar ${values.type.toLowerCase()}s: ${inr(low)} – ${inr(high)} per day`} {...form.getFieldProps("price")} />
              <div className="suggest-box">
                <Icon name="sparkle" size={18} />
                <div>
                  <strong>{price >= 300 ? `~${inr(estimateMonthly(price))} / month` : "Estimated earnings"}</strong>
                  <small>{price >= 300 ? "if booked ~40% of days, after the 5% fee" : "Enter a price to see an estimate"}</small>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => form.setValue("price", String(Math.round((low + high) / 2 / 50) * 50))}>
                  Suggest
                </button>
              </div>
              <Field label="Available from" type="date" min={today} {...form.getFieldProps("from")} />
              <Field label="Available until" type="date" min={values.from} {...form.getFieldProps("until")} />
            </div>
          </fieldset>

          <fieldset className="fieldset">
            <legend>3 · Photos & description</legend>
            <div className="photo-grid">
              {photoPreviews.map((p, i) => (
                <div className="photo-thumb" key={p.url}>
                  <img src={p.url} alt={p.name} />
                  {i === 0 && <span>Cover</span>}
                  <button type="button" aria-label={`Remove ${p.name}`} onClick={() => {
                    setPhotoFiles((cur) => cur.filter((_, idx) => idx !== i));
                    setPhotoPreviews((cur) => cur.filter((x) => x.url !== p.url));
                  }}>
                    <Icon name="close" size={12} />
                  </button>
                </div>
              ))}
              {photoPreviews.length < 1 && (
                <label className="photo-add">
                  <Icon name="camera" size={22} />
                  <span>Add cover photo</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPhotos} hidden />
                </label>
              )}
            </div>
            {photoError ? <small className="ui-error" role="alert">{photoError}</small> : <small className="ui-hint">Add one cover photo (JPG, PNG or WEBP, under 5 MB).</small>}
            <Field label="Description" as="textarea" placeholder="Condition, pickup instructions, rules (no smoking, fuel policy)…" {...form.getFieldProps("description")} />
          </fieldset>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Icon name="check" size={16} /> {saving ? "Publishing…" : "Publish listing"}
            </button>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => { form.reset(); setPhotoFiles([]); setPhotoPreviews([]); }}>Reset</button>
          </div>
        </form>

        <aside className="sticky-col">
          <span className="eyebrow">Live preview</span>
          <VehicleCard vehicle={preview} />
          <div className="panel tips">
            <strong>Tips for more bookings</strong>
            <ul>
              <li>Add a clear cover photo in daylight</li>
              <li>Price within the suggested range</li>
              <li>Reply to requests within an hour</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
