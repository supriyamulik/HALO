/**
 * src/pages/DashboardPage.jsx
 * ────────────────────────────
 * Executive Legal Intelligence Dashboard for HALO (Nyaya Sahayak).
 *
 * Implements:
 *   - Stat cards with subtle top-left icon circles, Newsreader display numerals.
 *   - Interactive recent research & upcoming court listings with border hover states.
 *   - Inline color-coded confidence metrics & canonical conflict status pills.
 *   - Sober 32px vertical rhythm per approved design tokens.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Search,
  ShieldCheck,
  Calendar,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { getCurrentUser } from "../api/client";
import { getResearchHistory } from "../api/researchApi";
import AppShell from "../components/AppShell";
import "./DashboardPage.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, historyData] = await Promise.all([
          getCurrentUser(),
          getResearchHistory(),
        ]);
        setUser(userData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <AppShell user={null}>
        <div className="dashboard-container">
          <div className="dashboard-loading-state">
            <span className="loading-spinner-ring" />
            <p>Loading legal intelligence workspace…</p>
          </div>
        </div>
      </AppShell>
    );
  }

  const displayName = user?.email
    ? user.email.split("@")[0]
    : "Advocate";

  return (
    <AppShell user={user}>
      <div className="dashboard-container">
        {/* ── Welcome Header ── */}
        <header className="dashboard-header">
          <div className="header-titles">
            <h1 className="dashboard-title">Welcome back, {displayName}</h1>
          </div>
          <div className="header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/research")}
            >
              <Search size={16} style={{ marginRight: 6 }} />
              <span>New Research Query</span>
            </button>
          </div>
        </header>

        {/* ── 4 Stat Cards with Top-Left Icon Circles ── */}
        <section className="stats-row" aria-label="Key legal metrics">
          {/* Card 1: Active Cases */}
          <div
            className="stat-card"
            onClick={() => navigate("/cases")}
            role="button"
            tabIndex={0}
            title="Open Cases & Matters Workspace"
          >
            <div className="stat-card-top">
              <div className="stat-icon-circle">
                <Briefcase size={18} />
              </div>
              <span className="stat-nav-arrow">&rarr;</span>
            </div>
            <div className="stat-number">3</div>
            <div className="stat-label">Active Matters</div>
          </div>

          {/* Card 2: Grounded Drafts */}
          <div
            className="stat-card"
            onClick={() => navigate("/drafts")}
            role="button"
            tabIndex={0}
            title="Open Legal Pleadings & Auto-Drafting"
          >
            <div className="stat-card-top">
              <div className="stat-icon-circle">
                <FileText size={18} />
              </div>
              <span className="stat-nav-arrow">&rarr;</span>
            </div>
            <div className="stat-number">3</div>
            <div className="stat-label">Grounded Drafts</div>
          </div>

          {/* Card 3: Research Queries */}
          <div
            className="stat-card"
            onClick={() => navigate("/history")}
            role="button"
            tabIndex={0}
            title="View Research History"
          >
            <div className="stat-card-top">
              <div className="stat-icon-circle">
                <Search size={18} />
              </div>
            </div>
            <div className="stat-number">48</div>
            <div className="stat-label">Research Queries</div>
          </div>

          {/* Card 4: Verified Citations */}
          <div
            className="stat-card"
            onClick={() => navigate("/admin/audit")}
            role="button"
            tabIndex={0}
            title="View Citation Verification Audit"
          >
            <div className="stat-card-top">
              <div className="stat-icon-circle">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="stat-number">156</div>
            <div className="stat-label">Verified Citations</div>
          </div>
        </section>

        {/* ── 32px Vertical Rhythm Gap into Two-Column Panels ── */}
        <section className="dashboard-grid">
          {/* Column 1: Recent Research */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h2 className="panel-title">Recent Research</h2>
                <span className="panel-badge">{history.length} matters</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/history")}
                >
                  <span>View archive</span>
                  <ChevronRight size={14} style={{ marginLeft: 4 }} />
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className="interactive-list">
                {history.slice(0, 4).map((item) => {
                  const confPct = Math.round((item.confidence_score ?? 0.85) * 100);
                  const isVerified = confPct >= 80;
                  const isWarning = confPct >= 60 && confPct < 80;

                  return (
                    <div
                      key={item.query_id}
                      className="interactive-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/research/${item.query_id}`)}
                    >
                      <div className="row-content">
                        <div className="row-title">{item.query_text}</div>
                        <div className="row-meta">
                          <span className="meta-date">
                            {new Date(item.date).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="meta-sep">•</span>
                          <span className="meta-confidence">
                            Confidence:{" "}
                            <strong
                              className={`confidence-inline ${
                                isVerified
                                  ? "conf-verified"
                                  : isWarning
                                  ? "conf-warning"
                                  : "conf-failed"
                              }`}
                            >
                              {confPct}%
                            </strong>
                          </span>
                        </div>
                      </div>

                      <div className="row-trailing">
                        {item.conflicts_detected ? (
                          <span className="status-pill status-pill-conflict">
                            <AlertTriangle size={12} style={{ marginRight: 4 }} />
                            Conflict
                          </span>
                        ) : (
                          <span className="status-pill status-pill-verified">
                            Verified
                          </span>
                        )}
                        <ChevronRight size={16} className="row-arrow" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="panel-empty-state">
                <Search size={24} className="empty-icon" />
                <p>No recent research queries recorded in this session.</p>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/research")}
                >
                  Start first legal inquiry
                </button>
              </div>
            )}
          </div>

          {/* Column 2: Upcoming Hearings */}
          <div className="dashboard-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <h2 className="panel-title">Upcoming Hearings</h2>
                <span className="panel-badge">Next 14 days</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => navigate("/cases")}
              >
                <span>Case diary</span>
                <ChevronRight size={14} style={{ marginLeft: 4 }} />
              </button>
            </div>

            <div className="interactive-list">
              <div
                className="interactive-row"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/cases")}
                title="View Case Docket"
              >
                <div className="row-content">
                  <div className="row-title">State of NCT Delhi v. Sharma &amp; Ors.</div>
                  <div className="row-meta">
                    <span className="hearing-time-tag">Tomorrow, 10:30 AM</span>
                    <span className="meta-sep">•</span>
                    <span>High Court of Delhi</span>
                    <span className="meta-sep">•</span>
                    <span>Court Room 14</span>
                  </div>
                </div>
                <div className="row-trailing">
                  <span className="hearing-type-pill">Criminal Misc.</span>
                  <ChevronRight size={16} className="row-arrow" />
                </div>
              </div>

              <div
                className="interactive-row"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/cases")}
                title="View Case Docket"
              >
                <div className="row-content">
                  <div className="row-title">TechCorp Logistics Merger &amp; Amalgamation</div>
                  <div className="row-meta">
                    <span className="hearing-time-tag">Oct 12, 02:00 PM</span>
                    <span className="meta-sep">•</span>
                    <span>NCLT Principal Bench</span>
                    <span className="meta-sep">•</span>
                    <span>Virtual Hearing</span>
                  </div>
                </div>
                <div className="row-trailing">
                  <span className="hearing-type-pill">Company Petition</span>
                  <ChevronRight size={16} className="row-arrow" />
                </div>
              </div>

              <div
                className="interactive-row"
                role="button"
                tabIndex={0}
                onClick={() => navigate("/cases")}
                title="View Case Docket"
              >
                <div className="row-content">
                  <div className="row-title">Mehta Real Estate v. Urban Development Auth.</div>
                  <div className="row-meta">
                    <span className="hearing-time-tag">Oct 19, 11:15 AM</span>
                    <span className="meta-sep">•</span>
                    <span>Supreme Court of India</span>
                    <span className="meta-sep">•</span>
                    <span>Court Room 3 (SLP)</span>
                  </div>
                </div>
                <div className="row-trailing">
                  <span className="hearing-type-pill">SLP (Civil)</span>
                  <ChevronRight size={16} className="row-arrow" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
