/**
 * src/components/AppShell.jsx
 * ────────────────────────────
 * Persistent layout wrapper used by all protected pages.
 * Renders the top nav bar and wraps page content in a consistent
 * main-area container.
 *
 * Props:
 *   user  – user object from /auth/me  (may be null while loading)
 *   children – page content
 */

import { NavLink, useNavigate } from "react-router-dom";
import "./AppShell.css";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/research",  label: "Research"  },
  { to: "/cases",     label: "Cases"     },
  { to: "/history",   label: "History"   },
];

export default function AppShell({ user, children }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "??";

  return (
    <div className="shell">
      {/* ── Top nav bar ─────────────────────────────────────────────── */}
      <header className="shell-header">
        <div className="shell-brand">
          <span className="shell-logo">⚖</span>
          <span className="shell-brand-name">Nyaya Sahayak</span>
        </div>

        <nav className="shell-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                "shell-nav-link" + (isActive ? " active" : "")
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="shell-user">
          {user && (
            <span className="shell-role-badge">{user.role.replace("_", " ")}</span>
          )}
          <div className="shell-avatar" title={user?.email ?? ""}>
            {initials}
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────────────── */}
      <main className="shell-main">{children}</main>
    </div>
  );
}
