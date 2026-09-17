import { useState } from "react";
const faqs = [
  [
    "How do I book a vehicle?",
    "Choose a nearby vehicle, select your dates, and submit a booking request.",
  ],
  [
    "How do I list my car?",
    "Open List My Vehicle, add the details, availability, and photos, then save your listing.",
  ],
  [
    "When will payments be available?",
    "Payment handling is planned for a later phase of this application.",
  ],
];
export default function Help() {
  const [sent, setSent] = useState(false);
  return (
    <div className="page-content">
      <h1 className="page-title">Help & Support</h1>
      <p className="page-subtitle">
        Find answers or send our support team a message.
      </p>
      <div className="support-options">
        {[
          ["Getting started", "Browse guides for renting or listing."],
          ["Safety", "Learn about verification and trip safety."],
          ["Contact support", "We usually reply within one business day."],
        ].map(([title, text]) => (
          <article className="dash-card" key={title}>
            <strong>{title}</strong>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <h2 className="section-heading">Frequently asked questions</h2>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
      <h2 className="section-heading">Send a message</h2>
      <form
        className="form-card"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
      >
        <div className="field">
          <label htmlFor="support-message">How can we help?</label>
          <textarea
            id="support-message"
            className="dash-input"
            placeholder="Describe your question or issue."
            required
          />
        </div>
        <button className="dash-button">Send to support</button>
        {sent && (
          <p className="form-note">
            Your demo support request has been recorded.
          </p>
        )}
      </form>
    </div>
  );
}
