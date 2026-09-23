import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getCurrentUser } from "../api/client";
import { getResearchHistory } from "../api/researchApi";
import "./HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'verified' | 'warnings' | 'conflicts'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'confidence-high' | 'confidence-low'

  useEffect(() => {
    let cancelled = false;
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [userData, historyData] = await Promise.all([
          getCurrentUser().catch(() => null),
          getResearchHistory(),
        ]);
        if (!cancelled) {
          setUser(userData);
          setHistory(Array.isArray(historyData) ? historyData : []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load history:", err);
          setError("Unable to retrieve research history. Please check backend connection.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute analytics metrics
  const analytics = useMemo(() => {
    if (!history.length) {
      return { total: 0, avgConfidence: 0, verifiedCount: 0, conflictCount: 0 };
    }
    const total = history.length;
    const avgConfidence = Math.round(
      (history.reduce((acc, h) => acc + (h.confidence_score || 0), 0) / total) * 100
    );
    const verifiedCount = history.filter((h) => (h.confidence_score || 0) >= 0.8).length;
    const conflictCount = history.filter((h) => h.conflicts_detected).length;
    return { total, avgConfidence, verifiedCount, conflictCount };
  }, [history]);

  // Filtered & sorted history items
  const filteredItems = useMemo(() => {
    let items = [...history];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.query_text?.toLowerCase().includes(q) ||
          item.query_id?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "verified") {
      items = items.filter((h) => (h.confidence_score || 0) >= 0.8);
    } else if (statusFilter === "warnings") {
      items = items.filter(
        (h) =>
          (h.confidence_score || 0) < 0.8 ||
          (h.verification_summary && (h.verification_summary.warnings > 0 || h.verification_summary.failed > 0))
      );
    } else if (statusFilter === "conflicts") {
      items = items.filter((h) => h.conflicts_detected);
    }

    items.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.date || 0) - new Date(b.date || 0);
      }
      if (sortBy === "confidence-high") {
        return (b.confidence_score || 0) - (a.confidence_score || 0);
      }
      if (sortBy === "confidence-low") {
        return (a.confidence_score || 0) - (b.confidence_score || 0);
      }
      return 0;
    });

    return items;
  }, [history, searchQuery, statusFilter, sortBy]);

  function getConfidenceBadge(score) {
    const pct = Math.round((score || 0) * 100);
    if (pct >= 80) return { label: `${pct}% Verified`, className: "hp-score-high" };
    if (pct >= 60) return { label: `${pct}% Qualified`, className: "hp-score-mid" };
    return { label: `${pct}% Unresolved`, className: "hp-score-low" };
  }

  return (
    <AppShell user={user}>
      <div className="hp-container">
        <PageHeader
          title="Research History & Analytics"
          action={
            <button
              className="btn btn-primary hp-new-query-btn"
              onClick={() => navigate("/research")}
            >
              + New Legal Query
            </button>
          }
        />

        {/* Analytics Top Bar */}
        <section className="hp-analytics-grid">
          <div className="hp-metric-card">
            <span className="hp-metric-label">Total Queries</span>
            <span className="hp-metric-value">{analytics.total}</span>
          </div>
          <div className="hp-metric-card">
            <span className="hp-metric-label">Average Confidence</span>
            <span className="hp-metric-value">{analytics.avgConfidence}%</span>
          </div>
          <div className="hp-metric-card">
            <span className="hp-metric-label">High-Confidence Verified</span>
            <span className="hp-metric-value hp-text-success">{analytics.verifiedCount}</span>
          </div>
          <div className="hp-metric-card">
            <span className="hp-metric-label">Judicial Conflicts Flagged</span>
            <span className="hp-metric-value hp-text-warning">{analytics.conflictCount}</span>
          </div>
        </section>

        {/* Toolbar: Search, Filters, Sort */}
        <div className="hp-toolbar">
          <div className="hp-search-box">
            <span className="hp-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search past legal questions, statutes, or query IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hp-search-input"
            />
            {searchQuery && (
              <button
                className="hp-search-clear"
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hp-filter-group">
            <div className="hp-chips">
              <button
                className={`hp-chip ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All Queries ({history.length})
              </button>
              <button
                className={`hp-chip ${statusFilter === "verified" ? "active" : ""}`}
                onClick={() => setStatusFilter("verified")}
              >
                ✓ High Confidence ({analytics.verifiedCount})
              </button>
              <button
                className={`hp-chip ${statusFilter === "warnings" ? "active" : ""}`}
                onClick={() => setStatusFilter("warnings")}
              >
                ⚠ Flagged / Warnings
              </button>
              <button
                className={`hp-chip ${statusFilter === "conflicts" ? "active" : ""}`}
                onClick={() => setStatusFilter("conflicts")}
              >
                ⚡ Conflicts ({analytics.conflictCount})
              </button>
            </div>

            <div className="hp-sort-wrap">
              <label htmlFor="hp-sort" className="hp-sort-label">Sort:</label>
              <select
                id="hp-sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="hp-sort-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="confidence-high">Confidence (High &rarr; Low)</option>
                <option value="confidence-low">Confidence (Low &rarr; High)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content State */}
        {loading ? (
          <div className="hp-loading-state">
            <div className="hp-skeleton-card"></div>
            <div className="hp-skeleton-card"></div>
            <div className="hp-skeleton-card"></div>
          </div>
        ) : error ? (
          <div className="hp-error-box">
            <p className="hp-error-text">⚠ {error}</p>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="hp-empty-box">
            <span className="hp-empty-icon">📂</span>
            <h3>No matching research queries</h3>
            <p>
              {searchQuery
                ? `No past queries match "${searchQuery}". Try changing your search filters.`
                : "You haven't conducted any legal research queries yet."}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/research")}
            >
              Start First Research Query
            </button>
          </div>
        ) : (
          <div className="hp-list">
            {filteredItems.map((item) => {
              const badge = getConfidenceBadge(item.confidence_score);
              const summary = item.verification_summary || {};
              const formattedDate = item.date
                ? new Date(item.date).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "Unknown date";

              return (
                <article key={item.query_id} className="hp-card">
                  <div className="hp-card-main">
                    <div className="hp-card-top">
                      <span className="hp-query-id">{item.query_id}</span>
                      <time className="hp-query-date">{formattedDate}</time>
                      {item.conflicts_detected && (
                        <StatusBadge
                          variant="conflict"
                          label="Conflict Detected"
                          size="sm"
                        />
                      )}
                    </div>

                    <h2
                      className="hp-card-title"
                      onClick={() => navigate(`/research/${item.query_id}`)}
                    >
                      {item.query_text}
                    </h2>

                    <div className="hp-card-summary">
                      {summary.total_claims !== undefined ? (
                        <span className="hp-summary-pill">
                          Claims: <strong>{summary.total_claims}</strong> (
                          <span className="hp-text-success">{summary.supported || 0} supported</span>
                          {summary.warnings > 0 && (
                            <span className="hp-text-warning">, {summary.warnings} warning</span>
                          )}
                          {summary.failed > 0 && (
                            <span className="hp-text-danger">, {summary.failed} failed</span>
                          )}
                          )
                        </span>
                      ) : (
                        <span className="hp-summary-pill">Authoritative Verification Passed</span>
                      )}
                    </div>
                  </div>

                  <div className="hp-card-side">
                    <div className="hp-score-container">
                      <div className="hp-score-row">
                        <span className="hp-score-label">Confidence</span>
                        <StatusBadge
                          variant={item.confidence_score >= 0.85 ? "verified" : item.confidence_score >= 0.65 ? "warning" : "failed"}
                          label={badge.label}
                          size="sm"
                        />
                      </div>
                      <div className="hp-score-bar-bg">
                        <div
                          className={`hp-score-bar-fill ${badge.className}`}
                          style={{
                            width: `${Math.min(100, Math.max(8, Math.round((item.confidence_score || 0) * 100)))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="hp-card-actions">
                      <button
                        className="btn btn-secondary hp-action-btn"
                        onClick={() => navigate(`/research/${item.query_id}/verify`)}
                        title="Inspect claims and 3-tier sub-checks"
                      >
                        Claims & Tiers
                      </button>
                      <button
                        className="btn btn-primary hp-action-btn"
                        onClick={() => navigate(`/research/${item.query_id}`)}
                      >
                        View Answer &rarr;
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
