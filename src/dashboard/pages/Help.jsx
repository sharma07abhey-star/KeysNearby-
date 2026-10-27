import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Field from "../../components/form/Field";
import Icon from "../../components/Icon";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { useForm } from "../../hooks/useForm";
import { openChat } from "../../store/chatSlice";
import { createValidator, minLength, required } from "../../utils/validators";

const FAQS = [
  ["How do I book a vehicle?", "Open Find a vehicle, choose one, pick your dates and request the booking. You'll see the full price before confirming."],
  ["How do I list my car or bike?", "Go to List a Vehicle, add details, a daily price and photos, then publish. Manage prices, availability and requests in My Garage."],
  ["How does ride pooling work?", "Drivers post a trip with spare seats and passengers request a seat. Fares are a cost share for fuel and tolls, not a profit."],
  ["Can I cancel a booking?", "Yes. Open History and choose Cancel on an upcoming booking. Free cancellation applies more than 24 hours before pickup."],
  ["When will payments be available?", "Online payments are planned for a later phase. This prototype only records booking requests."],
  ["How do I stay safe on a trip?", "Verify the vehicle and owner, share your trip with a trusted contact and use the Women's Safety tools."],
];

export default function Help() {
  const dispatch = useDispatch();
  const toast = useToast();
  const [term, setTerm] = useState("");

  const form = useForm({
    initialValues: { topic: "Booking help", message: "" },
    validate: createValidator({
      message: [required("Describe your question or issue."), minLength(10, "Add a few more details so we can help.")],
    }),
    onSubmit: () => {
      toast({ title: "Message sent", message: "We usually reply within one business day (demo)." });
      form.reset();
    },
  });

  const faqs = FAQS.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(term.trim().toLowerCase()));

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title="Help & support" subtitle="Find an answer fast, or ask KeyBot." />

      <section className="assistant-promo">
        <span className="promo-icon"><Icon name="sparkle" size={22} /></span>
        <div>
          <strong>Ask KeyBot, our AI assistant</strong>
          <p>Get price quotes, find vehicles, check rides and learn how things work, any time.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => dispatch(openChat())}>Chat now</button>
      </section>

      <div className="support-options">
        <Link to="/dashboard/safety" className="panel link-card"><Icon name="shield" size={22} /><strong>Safety</strong><p>Verification and trip safety tools.</p></Link>
        <Link to="/dashboard/profile" className="panel link-card"><Icon name="user" size={22} /><strong>Verification</strong><p>Add ID and driving licence.</p></Link>
        <Link to="/dashboard/messages" className="panel link-card"><Icon name="message" size={22} /><strong>Message an owner</strong><p>Questions about a specific trip.</p></Link>
      </div>

      <div className="section-head"><h2>Frequently asked questions</h2></div>
      <div className="search-box slim">
        <Icon name="search" size={18} />
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search help articles" aria-label="Search FAQs" />
      </div>
      <div className="faq-list">
        {faqs.map(([q, a]) => (
          <details key={q}><summary>{q}</summary><p>{a}</p></details>
        ))}
        {faqs.length === 0 && <p className="muted">No matching articles. Try asking KeyBot.</p>}
      </div>

      <div className="section-head"><h2>Contact support</h2></div>
      <form className="panel" onSubmit={form.handleSubmit} noValidate>
        <Field label="Topic" as="select" options={["Booking help", "Hosting a vehicle", "Ride pooling", "Account & verification", "Something else"]} {...form.getFieldProps("topic")} />
        <Field label="How can we help?" as="textarea" placeholder="Describe your question or issue." {...form.getFieldProps("message")} />
        <div className="form-actions"><button type="submit" className="btn btn-primary">Send to support</button></div>
      </form>
    </div>
  );
}
