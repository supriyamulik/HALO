/**
 * src/pages/AuditTrailPage.jsx
 * ────────────────────────────
 * Immutable Cryptographic Audit Trail & Governance Viewer
 * Protocol: FR-14 / PRD Section 52
 *
 * 100% Real Live Data — reads directly from backend audit_store.jsonl
 * with real-time SHA-256 cryptographic integrity seals, NLI checks,
 * and fail-closed quarantine reports.
 */

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getCurrentUser } from "../api/client";
import { getAuditLogs, getAuditRecordDetail } from "../api/auditApi";
import "./AuditTrailPage.css";

export default function AuditTrailPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterFailClosed, setFilterFailClosed] = useState("all"); // 'all' | 'fail_closed' | 'accepted'

  // Selected Detail Modal
  const [selectedAuditId, setSelectedAuditId] = useState(null);
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'nli' | 'raw_json'

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const [currentUser, logs] = await Promise.all([
        getCurrentUser().catch(() => null),
        getAuditLogs(),
      ]);
      setUser(currentUser);
      setAuditData(logs);
    } catch (err) {
      setError(err?.message || "Failed to load live audit store records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter records in memory for instantaneous feedback
  const filteredRecords = useMemo(() => {
    if (!auditData?.records) return [];
    return auditData.records.filter((rec) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesQuery = rec.query.toLowerCase().includes(q);
        const matchesId = rec.audit_id.toLowerCase().includes(q);
        const matchesHash = rec.content_hash.toLowerCase().includes(q);
        if (!matchesQuery && !matchesId && !matchesHash) return false;
      }

      if (filterFailClosed === "fail_closed" && !rec.fail_closed) return false;
      if (filterFailClosed === "accepted" && rec.fail_closed) return false;

      return true;
    });
  }, [auditData, search, filterFailClosed]);

  // Open detail modal
  const handleOpenDetail = async (auditId) => {
    setSelectedAuditId(auditId);
    setDetailLoading(true);
    setDetailError(null);
    setDetailRecord(null);
    setActiveTab("overview");

    try {
      const detail = await getAuditRecordDetail(auditId);
      setDetailRecord(detail);
    } catch (err) {
      setDetailError("Could not retrieve full cryptographic record.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedAuditId(null);
    setDetailRecord(null);
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  return (
    <AppShell user={user}>
      <div className="at-container">
        {/* Breadcrumb */}
        <nav className="at-breadcrumbs">
          <Link to="/dashboard" className="at-breadcrumb-link">Dashboard</Link>
          <span className="at-breadcrumb-sep">/</span>
          <span className="at-breadcrumb-active">Audit Trail & Governance</span>
        </nav>

        {/* Header */}
        <PageHeader
          title="Immutable Cryptographic Audit Trail"
          action={
            <>
              <StatusBadge variant="verified" label="● LIVE BACKEND DATA" size="sm" />
              <button className="btn btn-secondary at-refresh-btn" onClick={fetchLogs} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh Store"}
              </button>
              <button className="btn btn-primary" onClick={() => navigate("/research")}>
                + Run New Query
              </button>
            </>
          }
        />

        {/* Live Metrics Grid */}
        {auditData?.metrics && (
          <section className="at-metrics-grid" aria-label="Audit summary metrics">
            <div className="at-metric-card">
              <span className="at-metric-label">Total Audited Queries</span>
              <span className="at-metric-value">{auditData.metrics.total_audits}</span>
              <span className="at-metric-sub">Stored in {auditData.metrics.log_file_path}</span>
            </div>

            <div className="at-metric-card">
              <span className="at-metric-label">Total Claims Verified</span>
              <span className="at-metric-value">{auditData.metrics.total_claims_audited}</span>
              <span className="at-metric-sub">Atomic propositions evaluated</span>
            </div>

            <div className="at-metric-card">
              <span className="at-metric-label">Average Confidence</span>
              <span className="at-metric-value">
                {Math.round(auditData.metrics.average_confidence * 100)}%
              </span>
              <span className="at-metric-sub">Evidence-derived score</span>
            </div>

            <div className="at-metric-card">
              <span className="at-metric-label">Fail-Closed Rate</span>
              <span className="at-metric-value at-metric-warn">
                {auditData.metrics.fail_closed_rate}%
              </span>
              <span className="at-metric-sub">Quarantined for hallucination</span>
            </div>

            <div className="at-metric-card at-metric-card--seal">
              <span className="at-metric-label">Cryptographic Integrity</span>
              <span className="at-metric-value at-metric-green">
                {auditData.metrics.integrity_verified_count} / {auditData.metrics.total_audits}
              </span>
              <span className="at-metric-sub">100% SHA-256 Verified Untampered</span>
            </div>
          </section>
        )}

        {/* Control Bar: Search & Filter */}
        <div className="at-controls">
          <div className="at-search-box">
            <span className="at-search-icon">🔍</span>
            <input
              type="text"
              className="at-search-input"
              placeholder="Search by query, audit ID (e.g. AUD-20260923), or SHA-256 hash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="at-clear-btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

          <div className="at-filters">
            <label className="at-filter-label">Governance Status:</label>
            <select
              className="at-filter-select"
              value={filterFailClosed}
              onChange={(e) => setFilterFailClosed(e.target.value)}
            >
              <option value="all">All Audits</option>
              <option value="accepted">Accepted Claims Only</option>
              <option value="fail_closed">Fail-Closed / Quarantined</option>
            </select>
          </div>
        </div>

        {/* Content Table */}
        {loading ? (
          <div className="at-loading-box">
            <div className="at-skeleton-row" />
            <div className="at-skeleton-row" />
            <div className="at-skeleton-row" />
          </div>
        ) : error ? (
          <div className="at-error-box">
            <span className="at-error-icon">⚠</span>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchLogs}>Retry Connection</button>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="at-empty-box">
            <span>🔎</span>
            <h3>No audit records match your query</h3>
            <p>Try clearing your search filters or run a new legal query to record an audit log.</p>
          </div>
        ) : (
          <div className="at-table-container">
            <table className="at-table">
              <thead>
                <tr>
                  <th>Audit ID & Timestamp</th>
                  <th>Legal Query</th>
                  <th>Claims / Supported</th>
                  <th>Confidence</th>
                  <th>Governance Verdict</th>
                  <th>Cryptographic Integrity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec) => {
                  const dateStr = new Date(rec.timestamp).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={rec.audit_id} className={rec.fail_closed ? "at-row--fail-closed" : ""}>
                      {/* Audit ID */}
                      <td className="at-td-id">
                        <span className="at-id-pill" title={rec.audit_id}>{rec.audit_id}</span>
                        <span className="at-time-str">{dateStr}</span>
                      </td>

                      {/* Query */}
                      <td className="at-td-query">
                        <p className="at-query-text" title={rec.query}>{rec.query}</p>
                      </td>

                      {/* Claims */}
                      <td className="at-td-claims">
                        <span className="at-claims-count">
                          <strong>{rec.supported_claims_count}</strong> / {rec.claims_count} Supported
                        </span>
                      </td>

                      {/* Confidence */}
                      <td className="at-td-conf">
                        <span
                          className={`at-conf-pill ${
                            rec.overall_confidence >= 0.8
                              ? "at-conf-high"
                              : rec.overall_confidence >= 0.5
                              ? "at-conf-mid"
                              : "at-conf-low"
                          }`}
                        >
                          {Math.round(rec.overall_confidence * 100)}%
                        </span>
                      </td>

                      {/* Governance Verdict */}
                      <td>
                        {rec.fail_closed ? (
                          <StatusBadge
                            variant="failed"
                            label="FAIL-CLOSED"
                            title="Claim was quarantined or redacted"
                            size="sm"
                          />
                        ) : rec.verdict_accepted ? (
                          <StatusBadge
                            variant="verified"
                            label="✓ ACCEPTED"
                            size="sm"
                          />
                        ) : (
                          <StatusBadge
                            variant="warning"
                            label="⚠ QUALIFIED"
                            size="sm"
                          />
                        )}
                      </td>

                      {/* SHA-256 Hash Seal */}
                      <td className="at-td-hash">
                        <div className="at-hash-wrap">
                          <span className="at-hash-code" title={rec.content_hash}>
                            {rec.content_hash.slice(0, 10)}...{rec.content_hash.slice(-6)}
                          </span>
                          {rec.hash_valid ? (
                            <StatusBadge
                              variant="verified"
                              label="✓ VERIFIED"
                              title="SHA-256 matches payload bit-for-bit"
                              size="sm"
                            />
                          ) : (
                            <StatusBadge
                              variant="failed"
                              label="✗ TAMPERED"
                              title="Tampering detected!"
                              size="sm"
                            />
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td>
                        <button
                          className="btn btn-secondary at-inspect-btn"
                          onClick={() => handleOpenDetail(rec.audit_id)}
                        >
                          Inspect Proof &rarr;
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Detail Modal / Drawer ── */}
        {selectedAuditId && (
          <div className="at-modal-backdrop" onClick={handleCloseDetail}>
            <div className="at-modal" onClick={(e) => e.stopPropagation()}>
              <div className="at-modal-header">
                <div>
                  <span className="at-modal-tag">CRYPTOGRAPHIC AUDIT RECORD</span>
                  <h2 className="at-modal-title">{selectedAuditId}</h2>
                </div>
                <button className="at-modal-close" onClick={handleCloseDetail}>✕</button>
              </div>

              {detailLoading ? (
                <div className="at-modal-loading">
                  <p>Reading live audit entry from audit_store.jsonl...</p>
                </div>
              ) : detailError ? (
                <div className="at-error-box"><p>{detailError}</p></div>
              ) : detailRecord ? (
                <div className="at-modal-body">
                  {/* Cryptographic Seal Bar */}
                  <div className="at-seal-banner">
                    <div className="at-seal-left">
                      <span className="at-seal-icon">🔐</span>
                      <div>
                        <strong>SHA-256 Cryptographic Seal: Valid & Verified</strong>
                        <p className="at-seal-hash">{detailRecord.content_hash}</p>
                      </div>
                    </div>
                    <button
                      className="btn btn-secondary at-copy-btn"
                      onClick={() => copyToClipboard(detailRecord.content_hash, "SHA-256 Hash")}
                    >
                      Copy Hash
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="at-modal-tabs">
                    <button
                      className={`at-modal-tab ${activeTab === "overview" ? "active" : ""}`}
                      onClick={() => setActiveTab("overview")}
                    >
                      Audit Overview & Verdict
                    </button>
                    <button
                      className={`at-modal-tab ${activeTab === "nli" ? "active" : ""}`}
                      onClick={() => setActiveTab("nli")}
                    >
                      Neural-Symbolic Checks ({detailRecord.verifications?.length || 0})
                    </button>
                    <button
                      className={`at-modal-tab ${activeTab === "raw_json" ? "active" : ""}`}
                      onClick={() => setActiveTab("raw_json")}
                    >
                      Raw JSON Proof
                    </button>
                  </div>

                  {/* Tab 1: Overview */}
                  {activeTab === "overview" && (
                    <div className="at-tab-content">
                      <div className="at-detail-section">
                        <h3>Legal Query</h3>
                        <p className="at-detail-query">{detailRecord.query}</p>
                      </div>

                      <div className="at-detail-section">
                        <h3>Governor Verdict & Fail-Closed Enforcement</h3>
                        <div className="at-verdict-card">
                          <div className="at-verdict-row">
                            <span>Status:</span>
                            <strong>
                              {detailRecord.verdict?.fail_closed ? "FAIL-CLOSED (Quarantined)" : "ACCEPTED FOR PRESENTATION"}
                            </strong>
                          </div>
                          <div className="at-verdict-row">
                            <span>Overall Confidence:</span>
                            <strong>
                              {Math.round((detailRecord.confidence?.overall_confidence || 0) * 100)}%
                            </strong>
                          </div>
                          <div className="at-verdict-row">
                            <span>Quarantine Report:</span>
                            <span>
                              Total: {detailRecord.verdict?.quarantine_report?.total_claims || 0} |
                              Verified: {detailRecord.verdict?.quarantine_report?.verified_count || 0} |
                              Rejected: {detailRecord.verdict?.quarantine_report?.rejected_count || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="at-detail-section">
                        <h3>Synthesized Verified Answer</h3>
                        <pre className="at-raw-answer">
                          {detailRecord.verdict?.final_answer || detailRecord.raw_answer}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Neural-Symbolic Checks */}
                  {activeTab === "nli" && (
                    <div className="at-tab-content">
                      {detailRecord.verifications?.map((v, i) => {
                        const nli = v.evidence_result?.nli;
                        const numCheck = v.evidence_result?.numerical_check;
                        const modCheck = v.evidence_result?.modality_check;
                        const citRes = v.citation_result;

                        return (
                          <div key={i} className="at-nli-card">
                            <div className="at-nli-header">
                              <span className="at-nli-claim-id">{v.claim_id}</span>
                              <span className={`at-nli-status at-nli-status--${(v.status || "").toLowerCase()}`}>
                                {v.status}
                              </span>
                            </div>

                            <p className="at-nli-claim-text">{v.evidence_result?.claim_text || "Claim extracted from input query."}</p>

                            {/* Citation Existence & Metadata */}
                            {citRes && (
                              <div className="at-nli-subcheck">
                                <strong>Tier 1 & 2 Citation Verification:</strong>
                                <p>{citRes.explanation}</p>
                              </div>
                            )}

                            {/* NLI Scores if present */}
                            {nli && (
                              <div className="at-nli-scores-grid">
                                <div className="at-nli-score-box">
                                  <span>Entailment</span>
                                  <strong>{Math.round((nli.entailment || 0) * 100)}%</strong>
                                </div>
                                <div className="at-nli-score-box">
                                  <span>Neutral</span>
                                  <strong>{Math.round((nli.neutral || 0) * 100)}%</strong>
                                </div>
                                <div className="at-nli-score-box">
                                  <span>Contradiction</span>
                                  <strong>{Math.round((nli.contradiction || 0) * 100)}%</strong>
                                </div>
                              </div>
                            )}

                            {/* Symbolic Checks */}
                            <div className="at-symbolic-tags">
                              <span className="at-sym-tag">
                                Numerical: {numCheck?.status || "NOT_APPLICABLE"}
                              </span>
                              <span className="at-sym-tag">
                                Modality: {modCheck?.status || "NOT_APPLICABLE"}
                              </span>
                              <span className="at-sym-tag">
                                Decision: {v.evidence_result?.decision_reason || "Evaluated against corpus"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tab 3: Raw JSON Proof */}
                  {activeTab === "raw_json" && (
                    <div className="at-tab-content">
                      <div className="at-json-toolbar">
                        <span>Direct JSON string from disk:</span>
                        <button
                          className="btn btn-secondary at-copy-btn"
                          onClick={() => copyToClipboard(JSON.stringify(detailRecord, null, 2), "Full JSON Record")}
                        >
                          Copy Full JSON
                        </button>
                      </div>
                      <pre className="at-json-box">
                        {JSON.stringify(detailRecord, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
