import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Field from "../components/form/Field";
import { useDemo } from "../hooks/useDemo";
import { useForm } from "../hooks/useForm";
import { createUser, getUserByEmail } from "../services/api";
import { createValidator, email, minLength, required } from "../utils/validators";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signIn } = useDemo();
  const [mode, setMode] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [saving, setSaving] = useState(false);

  const goTo = location.state?.from || "/dashboard";

  const form = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: (values) =>
      createValidator({
        name: mode === "signup" ? [required("Name is required."), minLength(2)] : [],
        email: [required("Email is required."), email()],
        password: [required("Password is required."), minLength(6, "Minimum 6 characters.")],
      })(values),
    onSubmit: async (values) => {
      setAuthError("");
      setSaving(true);
      try {
        if (mode === "signin") {
          // getUserByEmail normalises to lowercase inside api.js
          const found = await getUserByEmail(values.email.trim());
          if (!found || found.password !== values.password) {
            setAuthError("Incorrect email or password.");
            setSaving(false);
            return;
          }
          // Strip password before passing to context — security requirement 9
          // eslint-disable-next-line no-unused-vars
          const { password: _pw, ...safe } = found;
          signIn(safe);
        } else {
          // Reject duplicate email (api.js lowercases before querying)
          const existing = await getUserByEmail(values.email.trim());
          if (existing) {
            setAuthError("An account with this email already exists.");
            setSaving(false);
            return;
          }
          // createUser strips password before returning — see api.js
          // Passwords stored plain text in db.json (mock only).
          // A real backend would hash with bcrypt / Argon2.
          const newUser = await createUser({
            name: values.name.trim(),
            email: values.email.trim(),
            password: values.password,
            phone: "",
            location: "Koramangala, Bengaluru",
            verification: { email: true, phone: false, identity: false, licence: false },
          });
          signIn(newUser);
        }
        navigate(goTo, { replace: true });
      } catch (err) {
        setAuthError(err.message);
        setSaving(false);
      }
    },
  });

  if (user) return <Navigate to={goTo} replace />;

  function switchMode(next) {
    setMode(next);
    setAuthError("");
    form.reset();
  }

  async function demoLogin() {
    setSaving(true);
    setAuthError("");
    try {
      const demo = await getUserByEmail("abhey@example.com");
      if (demo) {
        // eslint-disable-next-line no-unused-vars
        const { password: _pw, ...safe } = demo;
        signIn(safe);
      } else {
        const created = await createUser({
          name: "Abhey Sharma",
          email: "abhey@example.com",
          password: "demo123",
          phone: "",
          location: "Koramangala, Bengaluru",
          verification: { email: true, phone: false, identity: false, licence: false },
        });
        signIn(created);
      }
      navigate(goTo, { replace: true });
    } catch (err) {
      setAuthError(err.message);
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-logo">
          <span id="auth-heading">Keys Nearby</span>
        </div>
        <p className="auth-lead">
          {mode === "signin" ? "Welcome back. Sign in to continue." : "Create an account to rent, host and pool rides."}
        </p>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")} role="tab" aria-selected={mode === "signin"} type="button">Sign In</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} role="tab" aria-selected={mode === "signup"} type="button">Create Account</button>
        </div>

        <form className="auth-form" onSubmit={form.handleSubmit} noValidate>
          {mode === "signup" && <Field label="Full name" placeholder="Your full name" autoComplete="name" {...form.getFieldProps("name")} />}
          <Field label="Email" type="email" placeholder="you@example.com" autoComplete="email" {...form.getFieldProps("email")} />
          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            {...form.getFieldProps("password")}
          />
          <label className="auth-check">
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show password
          </label>

          {authError && (
            <p className="ui-error" role="alert" style={{ margin: "0 0 4px" }}>{authError}</p>
          )}

          <button className="auth-submit-btn" type="submit" disabled={saving}>
            {saving ? "Please wait…" : "Continue →"}
          </button>
        </form>

        <button type="button" className="auth-demo-btn" onClick={demoLogin} disabled={saving}>
          Explore with a demo account
        </button>

        <div className="auth-footer">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
        <Link className="auth-back-link" to="/">← Back to Home</Link>
      </section>
    </main>
  );
}
