/**
 * src/pages/LoginPage.jsx
 * ────────────────────────
 * Combined Login / Register page for Nyaya Sahayak.
 *
 * Behaviour:
 *   • Register tab → calls registerUser(), shows success, switches to Login
 *   • Login tab    → calls loginUser(), stores token, confirms with getCurrentUser(),
 *                    then navigates to /dashboard
 *   • Errors       → shows the exact detail string from the backend response
 *   • Loading      → button is disabled and labelled "Please wait…" during requests
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, registerUser } from "../api/client";
import "./LoginPage.css";

const ROLES = ["LAWYER", "RESEARCHER", "ADMIN", "INSTITUTION_ADMIN"];

// ─── Sub-form: Login ───────────────────────────────────────────────────────

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { access_token } = await loginUser(email, password);
      localStorage.setItem("access_token", access_token);
      // Confirm token works before navigating
      await getCurrentUser();
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="field-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          placeholder="advocate@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="field-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="login-extras">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>
        <a href="#forgot" className="link-muted">
          Forgot Password?
        </a>
      </div>

      <button
        id="login-submit"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Please wait…" : "LOGIN"}
      </button>
    </form>
  );
}

// ─── Sub-form: Register ────────────────────────────────────────────────────

function RegisterForm({ onRegistered }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("RESEARCHER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await registerUser(email, password, role);
      setSuccess(
        "Account created successfully! You can now log in."
      );
      // Switch to Login tab after a short delay so user reads the message
      setTimeout(() => onRegistered(), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="status">
          {success}
        </div>
      )}

      <div className="field-group">
        <label htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="field-group">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="field-group">
        <label htmlFor="reg-role">Role</label>
        <select
          id="reg-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <button
        id="register-submit"
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Please wait…" : "CREATE ACCOUNT"}
      </button>
    </form>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  function handleLoginSuccess() {
    navigate("/dashboard", { replace: true });
  }

  function handleRegistered() {
    setActiveTab("login");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* ── Brand header ── */}
        <div className="auth-brand">
          <h1 className="brand-title">Nyaya Sahayak</h1>
          <p className="brand-tagline">
            AI Assisted Legal Research &amp; Citation Verification
          </p>
        </div>

        {/* ── Tab toggles ── */}
        <div className="tab-bar" role="tablist">
          <button
            id="tab-login"
            role="tab"
            aria-selected={activeTab === "login"}
            className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            id="tab-register"
            role="tab"
            aria-selected={activeTab === "register"}
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Register
          </button>
        </div>

        {/* ── Active form ── */}
        <div className="tab-content">
          {activeTab === "login" ? (
            <LoginForm onSuccess={handleLoginSuccess} />
          ) : (
            <RegisterForm onRegistered={handleRegistered} />
          )}
        </div>
      </div>
    </div>
  );
}
