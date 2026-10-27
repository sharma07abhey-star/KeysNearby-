import { useState } from "react";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { useDemo } from "../../hooks/useDemo";
import { useForm } from "../../hooks/useForm";
import { createValidator, minLength, phone, required } from "../../utils/validators";

const STEPS = [
  { key: "email", title: "Email address", text: "Confirmed when you signed up", icon: "message" },
  { key: "phone", title: "Mobile number", text: "Lets owners and drivers reach you", icon: "phone" },
  { key: "identity", title: "Government ID", text: "Aadhaar, passport or voter ID", icon: "shield" },
  { key: "licence", title: "Driving licence", text: "Required before your first rental", icon: "car" },
];

export default function Profile() {
  const { user, userInitials, updateProfile, verification, verify } = useDemo();
  const toast = useToast();
  const [prefs, setPrefs] = useState({ email: true, reminders: true, offers: false });

  const form = useForm({
    initialValues: { name: user.name, phone: user.phone, location: user.location },
    validate: createValidator({
      name: [required("Your name can't be empty."), minLength(2)],
      phone: [phone()],
      location: [required("Add your home area."), minLength(3)],
    }),
    onSubmit: async (values) => {
      await updateProfile({ name: values.name.trim(), phone: values.phone.trim(), location: values.location.trim() });
      if (values.phone.trim() && !verification.phone) await verify("phone");
      toast({ title: "Profile saved" });
    },
  });

  const done = STEPS.filter((s) => verification[s.key]).length;
  const percent = Math.round((done / STEPS.length) * 100);

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title="Profile & verification" subtitle="Verified profiles get approved faster and build trust with owners." />

      <div className="two-col">
        <form className="panel" onSubmit={form.handleSubmit} noValidate>
          <div className="profile-heading">
            <span className="avatar avatar-xl">{userInitials}</span>
            <div><h2>{user.name}</h2><p className="muted">{user.email}</p></div>
          </div>
          <div className="form-grid">
            <Field label="Full name" full {...form.getFieldProps("name")} />
            <Field label="Mobile number" type="tel" placeholder="98765 43210" {...form.getFieldProps("phone")} />
            <Field label="Home area" placeholder="Area, city" {...form.getFieldProps("location")} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save changes</button>
            <button type="button" className="btn btn-ghost" onClick={() => form.reset({ name: user.name, phone: user.phone, location: user.location })}>Reset</button>
          </div>
        </form>

        <section className="panel">
          <div className="panel-head">
            <h2>Verification</h2>
            <span className="progress-pill">{percent}%</span>
          </div>
          <div className="progress-bar"><i style={{ width: `${percent}%` }} /></div>
          <div className="verify-list">
            {STEPS.map((step) => {
              const ok = verification[step.key];
              return (
                <div className={`verify-row${ok ? " ok" : ""}`} key={step.key}>
                  <span className="verify-icon"><Icon name={ok ? "check" : step.icon} size={18} /></span>
                  <div><strong>{step.title}</strong><small>{ok ? "Verified" : step.text}</small></div>
                  {!ok && step.key !== "phone" && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => { verify(step.key); toast({ title: `${step.title} verified`, message: "Demo only: no document was checked." }); }}>
                      Verify
                    </button>
                  )}
                  {!ok && step.key === "phone" && <small className="muted">Save a number above</small>}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="panel">
        <h2>Notifications</h2>
        {[
          ["email", "Email updates", "Receipts and booking confirmations"],
          ["reminders", "Trip reminders", "A nudge before pickup and return"],
          ["offers", "Offers & tips", "Occasional product news"],
        ].map(([key, title, text]) => (
          <label className="toggle-row" key={key}>
            <span><strong>{title}</strong><small>{text}</small></span>
            <span className="switch">
              <input type="checkbox" checked={prefs[key]} onChange={(e) => setPrefs({ ...prefs, [key]: e.target.checked })} />
              <span className="switch-track" />
            </span>
          </label>
        ))}
      </section>
    </div>
  );
}
