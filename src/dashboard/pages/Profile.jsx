import { useState } from "react";
import Icon from "../../components/Icon";
export default function Profile() {
  const [editing, setEditing] = useState(false);
  return (
    <div className="page-content">
      <h1 className="page-title">Profile & Verification</h1>
      <p className="page-subtitle">
        Manage your details, verification status, and account preferences.
      </p>
      <div className="dash-grid two-column">
        <section className="form-card">
          <div className="profile-heading">
            <span className="profile-avatar">K</span>
            <div>
              <h2>Keys Nearby User</h2>
              <p>demo@keysnearby.app</p>
            </div>
          </div>
          {editing ? (
            <div className="form-grid">
              <div className="field">
                <label>Full name</label>
                <input className="dash-input" defaultValue="Keys Nearby User" />
              </div>
              <div className="field">
                <label>Phone</label>
                <input className="dash-input" placeholder="Add phone number" />
              </div>
            </div>
          ) : (
            <p className="profile-copy">
              Keep your contact details current so renters and owners can
              coordinate smoothly.
            </p>
          )}
          <button
            className="dash-button secondary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Save changes" : "Edit profile"}
          </button>
        </section>
        <section className="form-card">
          <h2 className="section-heading">Verification</h2>
          <div className="verification-row">
            <Icon name="check" />
            <div>
              <strong>Identity verification</strong>
              <span>Not started — add government ID</span>
            </div>
            <button className="dash-button secondary">Start</button>
          </div>
          <div className="verification-row">
            <Icon name="check" />
            <div>
              <strong>Driving licence</strong>
              <span>Required before your first rental</span>
            </div>
            <button className="dash-button secondary">Add</button>
          </div>
        </section>
      </div>
      <section className="form-card account-card">
        <h2 className="section-heading">Account settings</h2>
        <label className="toggle-row">
          Email updates <input type="checkbox" defaultChecked />
        </label>
        <label className="toggle-row">
          Booking reminders <input type="checkbox" defaultChecked />
        </label>
      </section>
    </div>
  );
}
