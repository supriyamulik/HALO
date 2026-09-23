/**
 * src/pages/LoginPage.jsx
 * ────────────────────────
 * Redesigned Split-Panel Authentication Gateway for HALO (Nyaya Sahayak).
 *
 * Left Panel:  Calm, authoritative deep navy field with editorial headline
 *              and 3 simple stacked system pillars.
 * Right Panel: Restrained white form surface with underline-style tab switcher,
 *              clean bordered inputs, and primary action button.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, loginUser, registerUser } from "../api/client";
import "./LoginPage.css";

const ROLES = [
  { value: "LAWYER", label: "Advocate / Counsel" },
  { value: "RESEARCHER", label: "Judicial Researcher" },
  { value: "ADMIN", label: "Chambers Administrator" },
  { value: "INSTITUTION_ADMIN", label: "Institution Admin" },
];

// ─── Sub-form: Login ──────────────────────────────────────────────────────────

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
      await getCurrentUser();
      onSuccess();
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          placeholder="advocate@chambers.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <div className="auth-field-header">
          <label htmlFor="login-password">Password</label>
          <a href="#forgot" className="auth-link-forgot" tabIndex="-1">
            Forgot password?
          </a>
        </div>
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

      <div className="auth-options">
        <label className="auth-checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span>Remember this workstation</span>
        </label>
      </div>

      <button
        id="login-submit"
        type="submit"
        className="auth-btn-submit"
        disabled={loading}
      >
        {loading ? "Authenticating…" : "Sign in"}
      </button>
    </form>
  );
}

// ─── Sub-form: Register ─────────────────────────────────────────────────────

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
      setSuccess("Account registered successfully. Redirecting to sign in…");
      setTimeout(() => onRegistered(), 1400);
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="auth-alert auth-alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="auth-alert auth-alert-success" role="status">
          {success}
        </div>
      )}

      <div className="auth-field">
        <label htmlFor="reg-email">Email address</label>
        <input
          id="reg-email"
          type="email"
          placeholder="counsel@highcourt.gov.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          placeholder="Minimum 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="reg-role">Designation / Role</label>
        <select
          id="reg-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <button
        id="register-submit"
        type="submit"
        className="auth-btn-submit"
        disabled={loading}
      >
        {loading ? "Registering account…" : "Create account"}
      </button>
    </form>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

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
    <div className="login-layout">
      {/* ── Left Editorial Panel (~55% width) ── */}
      <aside className="login-editorial-panel">
        <div className="editorial-inner">
          <div className="editorial-brand">
            <span className="editorial-emblem"></span>
            <span className="editorial-wordmark">Nyaya Sahayak</span>
            <span className="editorial-divider">/</span>
            <span className="editorial-subname">Legal AI Intelligence</span>
          </div>

          <div className="editorial-statement">
            <h2 className="editorial-headline">
              Evidence-first legal research for Indian law.
            </h2>
            <p className="editorial-subtext">
              Authoritative statutory retrieval, strict multi-tier citation verification,
              and hierarchical conflict resolution for advocates and researchers.
            </p>
          </div>

          <div className="editorial-pillars">
            <div className="pillar-item">
              <span className="pillar-title">Hallucination-resistant synthesis</span>
              <p className="pillar-desc">
                Every statement is grounded against primary Indian Kanoon and Supreme Court records.
              </p>
            </div>

            <div className="pillar-item">
              <span className="pillar-title">Multi-tier citation verification</span>
              <p className="pillar-desc">
                Verifies canonical existence, metadata match, and substantive textual entailment.
              </p>
            </div>

            <div className="pillar-item">
              <span className="pillar-title">High Court vs. Supreme Court conflict detection</span>
              <p className="pillar-desc">
                Identifies forum hierarchy divergences and binding Article 141 precedential authority.
              </p>
            </div>
          </div>

          <div className="editorial-footer">
            <span>Supreme Court of India &amp; High Court Jurisprudence</span>
          </div>
        </div>
      </aside>

      {/* ── Right Form Panel ── */}
      <main className="login-form-panel">
        <div className="form-container">
          <div className="form-header">
            <h1 className="form-title">
              {activeTab === "login" ? "Sign in" : "Create account"}
            </h1>
            <p className="form-subtitle">
              {activeTab === "login"
                ? "Enter your credentials to access your legal workspace."
                : "Register your advocate profile to begin verified legal research."}
            </p>
          </div>

          {/* Underline-style tab toggle */}
          <div className="tab-nav" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={activeTab === "login"}
              className={`tab-link ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Sign in
            </button>
            <button
              id="tab-register"
              role="tab"
              aria-selected={activeTab === "register"}
              className={`tab-link ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Register
            </button>
          </div>

          <div className="form-body">
            {activeTab === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} />
            ) : (
              <RegisterForm onRegistered={handleRegistered} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
