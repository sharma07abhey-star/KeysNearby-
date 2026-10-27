import { useDispatch, useSelector } from "react-redux";
import Field from "../../components/form/Field";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/useToast";
import { useForm } from "../../hooks/useForm";
import { addFeedback, clearFeedback } from "../../store/feedbackSlice";
import { createValidator, minLength, required } from "../../utils/validators";

const CATEGORIES = ["General experience", "Vehicle listing", "Booking experience", "Ride pooling", "Women’s safety", "AI assistant", "Bug or technical issue"];

export default function Feedback() {
  const dispatch = useDispatch();
  const toast = useToast();
  const submissions = useSelector((state) => state.feedback.submissions);

  const form = useForm({
    initialValues: { category: CATEGORIES[0], rating: 5, message: "" },
    validate: createValidator({
      message: [required("Tell us a little about your experience."), minLength(8, "Please write at least 8 characters.")],
    }),
    onSubmit: (values) => {
      dispatch(addFeedback({ ...values, message: values.message.trim(), date: new Date().toISOString() }));
      toast({ title: "Thank you!", message: "Your feedback was saved." });
      form.reset();
    },
  });

  const { rating } = form.values;

  return (
    <div className="page">
      <PageHeader eyebrow="Account" title="Feedback & suggestions" subtitle="Help us make Keys Nearby safer, simpler and more useful." />

      <div className="two-col">
        <form className="panel" onSubmit={form.handleSubmit} noValidate>
          <Field label="What is this about?" as="select" options={CATEGORIES} {...form.getFieldProps("category")} />

          <div className="field-block">
            <span className="field-label" id="rating-label">Rating</span>
            <div className="star-row" role="radiogroup" aria-labelledby="rating-label">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  className={n <= rating ? "star on" : "star"}
                  onClick={() => form.setValue("rating", n)}
                >
                  ★
                </button>
              ))}
              <span className="muted">{rating}/5</span>
            </div>
          </div>

          <Field label="Your feedback" as="textarea" rows={5} placeholder="What worked well? What could we improve?" {...form.getFieldProps("message")} />
          <div className="form-actions"><button type="submit" className="btn btn-primary">Submit feedback</button></div>
        </form>

        <aside className="panel">
          <div className="panel-head">
            <h2>Your recent feedback</h2>
            {submissions.length > 0 && <button type="button" className="link-btn" onClick={() => dispatch(clearFeedback())}>Clear</button>}
          </div>
          {submissions.length === 0 && <p className="muted">Nothing submitted yet. Your entries appear here (stored in Redux and this browser).</p>}
          <ul className="feedback-list">
            {submissions.slice(0, 5).map((s) => (
              <li key={s.date}>
                <div><strong>{s.category}</strong><span className="stars-static">{"★".repeat(s.rating)}{"☆".repeat(5 - s.rating)}</span></div>
                <p>{s.message}</p>
                <small>{new Date(s.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</small>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
