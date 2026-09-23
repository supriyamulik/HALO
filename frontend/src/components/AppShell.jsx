/**
 * src/components/AppShell.jsx
 * ────────────────────────────
 * Persistent expandable sidebar layout wrapper for HALO (Nyaya Sahayak).
 *
 * Sidebar Features:
 *   - Default collapsed: 64px width (icons only, tooltips on hover)
 *   - Expandable: 220px width via smooth 200ms transition
 *   - State persistence in localStorage ('halo_sidebar_expanded')
 *   - When expanded: icon + label rows, active item gets subtle accent bg + 3px left bar
 *   - Expanded bottom section: avatar + full email/name + role label + sign-out button
 */

import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileEdit,
  History,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Scale,
} from "lucide-react";
import "./AppShell.css";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    matchExact: true,
  },
  {
    to: "/research",
    label: "Research",
    icon: Search,
    matchPrefix: "/research",
  },
  {
    to: "/cases",
    label: "Cases",
    icon: Briefcase,
    matchPrefix: "/cases",
  },
  {
    to: "/drafts",
    label: "Drafting",
    icon: FileEdit,
    matchPrefix: "/drafts",
  },
  {
    to: "/history",
    label: "History",
    icon: History,
    matchPrefix: "/history",
  },
  {
    to: "/admin/audit",
    label: "Audit Trail",
    icon: ShieldCheck,
    matchPrefix: "audit",
  },
];

export default function AppShell({ user, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [expanded, setExpanded] = useState(() => {
    try {
      return localStorage.getItem("halo_sidebar_expanded") === "true";
    } catch {
      return false;
    }
  });

  function handleToggleSidebar() {
    setExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("halo_sidebar_expanded", String(next));
      } catch {
        /* ignore localStorage quota/disabled errors */
      }
      return next;
    });
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "AD";

  const displayName = user?.email
    ? user.email.split("@")[0]
    : "Advocate";

  const roleText = user?.role
    ? user.role.replace("_", " ")
    : "Counsel";

  return (
    <div className="shell-layout">
      {/* ── Persistent Expandable Left Sidebar ── */}
      <aside
        className={`shell-sidebar ${expanded ? "expanded" : "collapsed"}`}
        aria-label="Main sidebar navigation"
      >
        {/* Top Header: Brand Monogram + Title + Toggle Button */}
        <div className="sidebar-top">
          <div className="sidebar-brand-wrapper">
            <NavLink
              to="/dashboard"
              className="sidebar-brand-btn"
              title="Nyaya Sahayak Home"
              aria-label="Nyaya Sahayak Home"
            >
              <span className="brand-scales">
                <Scale size={20} color="#FFFFFF" strokeWidth={2.5} />
              </span>
            </NavLink>
            {expanded && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">Nyaya Sahayak HALO</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={handleToggleSidebar}
            title={expanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            if (item.matchExact) {
              isActive = location.pathname === item.to;
            } else if (item.matchPrefix === "audit") {
              isActive = location.pathname.includes("audit");
            } else if (item.matchPrefix) {
              isActive = location.pathname.startsWith(item.matchPrefix);
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="nav-item-icon">
                  <Icon size={19} />
                </span>
                {expanded && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
                {!expanded && (
                  <span className="sidebar-tooltip">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Pinned User Section */}
        <div className="sidebar-bottom">
          {expanded ? (
            <div className="sidebar-user-expanded">
              <div className="sidebar-user-profile">
                <div className="sidebar-user-avatar">
                  <span>{initials}</span>
                </div>
                <div className="sidebar-user-meta">
                  <span className="sidebar-user-name" title={user?.email || "Advocate"}>
                    {displayName}
                  </span>
                  <span className="sidebar-user-role">{roleText}</span>
                </div>
              </div>

              <button
                id="logout-btn"
                type="button"
                className="sidebar-logout-btn-expanded"
                onClick={handleLogout}
                title="Sign out"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <div className="sidebar-user-collapsed">
              <div
                className="sidebar-user-avatar"
                aria-label="User Profile"
              >
                <span>{initials}</span>
                <span className="sidebar-tooltip">
                  {user?.email || "Advocate"}
                  <span className="tooltip-role">{roleText}</span>
                </span>
              </div>

              <button
                id="logout-btn"
                type="button"
                className="sidebar-logout-btn"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <LogOut size={17} />
                <span className="sidebar-tooltip">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area (Dynamic Margin) ── */}
      <div className={`shell-content ${expanded ? "sidebar-expanded" : "sidebar-collapsed"}`}>
        <main className="shell-main shell-main-canvas">{children}</main>
      </div>
    </div>
  );
}
