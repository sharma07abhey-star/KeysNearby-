import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

const initial = { name: "", email: "", password: "" };

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  function switchMode(next) {
    setMode(next);
    setValues(initial);
    setErrors({});
  }

  function submit(event) {
    event.preventDefault();
    const next = {};
    if (mode === "signup" && !values.name.trim()) {
      next.name = "Name is required.";
    }

    if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      next.email = values.email ? "Enter a valid email." : "Email is required.";
    }

    if (values.password.length < 6) {
      next.password = values.password
        ? "Minimum 6 characters."
        : "Password is required.";
    }

    setErrors(next);

    // This is only a frontend demonstration flow, not real authentication.
    if (!Object.keys(next).length) {
      // Persist user identity so the sidebar can display the real name/email.
      localStorage.setItem("userEmail", values.email);
      if (values.name) {
        localStorage.setItem("userName", values.name);
      } else {
        localStorage.removeItem("userName");
      }
      navigate("/dashboard");
    }
  }
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-heading">
        <div className="auth-logo">
          <span id="auth-heading">Keys Nearby</span>
        </div>
        <div
          className="auth-toggle"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            className={mode === "signin" ? "active" : ""}
            onClick={() => switchMode("signin")}
            role="tab"
            aria-selected={mode === "signin"}
            type="button"
          >
            Sign In
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => switchMode("signup")}
            role="tab"
            aria-selected={mode === "signup"}
            type="button"
          >
            Create Account
          </button>
        </div>
        <form className="auth-form" onSubmit={submit} noValidate>
          {mode === "signup" && (
            <Field
              label="Full Name"
              id="full-name"
              value={values.name}
              error={errors.name}
              placeholder="Your full name"
              onChange={(value) => setValues({ ...values, name: value })}
            />
          )}
          <Field
            label="Email"
            id="email"
            type="email"
            value={values.email}
            error={errors.email}
            placeholder="you@example.com"
            onChange={(value) => setValues({ ...values, email: value })}
          />
          <Field
            label="Password"
            id="password"
            type="password"
            value={values.password}
            error={errors.password}
            placeholder="Min. 6 characters"
            onChange={(value) => setValues({ ...values, password: value })}
          />
          <button className="auth-submit-btn" type="submit">
            Continue →
          </button>
        </form>
        <div className="auth-footer">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
        <Link className="auth-back-link" to="/">
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

function Field({
  label,
  id,
  type = "text",
  value,
  error,
  placeholder,
  onChange,
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className={error ? "error" : ""}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
