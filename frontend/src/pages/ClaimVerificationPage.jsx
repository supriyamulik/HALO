/**
 * src/pages/ClaimVerificationPage.jsx
 * ─────────────────────────────────────
 * Deep-dive verification view for /research/:queryId/verify.
 *
 * Implements:
 *   - Technical inspection top bar with ghost back button and monospace query badge.
 *   - 4 compact status stat chips (Total / Verified / Warnings / Failed).
 *   - Claim cards with 3px status left border and 24px monospace number circle.
 *   - Clean unboxed sub-check rows with hairlines.
 *   - Cited Case Source footer with scale glyph and monospace citation.
 *   - Right-aligned bottom action bar using consistent buttons.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { getResearchResult } from "../api/researchApi";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import "./ClaimVerificationPage.css";

// ─── Evidence-state → human-readable passage description ─────────────────────

const EVIDENCE_STATE_LABELS = {
  SUPPORTED_CURRENT:
    "Passage directly supports this claim and reflects current law.",
  SUPPORTED_DISPUTED:
    "Passage supports the claim but a conflicting authority exists — treat with caution.",
  SUPPORTED_PENDING_RULES:
    "Claim supported by the Act text; subordinate rules are still pending.",
  SUPPORTED_EXTERNAL_SOURCE:
    "Claim supported by an external register, not a primary judicial source.",
  UNVERIFIED_REGULATORY_FORECAST:
    "Passage is a regulatory forecast; no corroborating judicial record found.",
  CONTRADICTED:
    "Passage contradicts or fails to corroborate this claim in the corpus.",
};

function evidencePassageLabel(evidenceState) {
  return (
    EVIDENCE_STATE_LABELS[evidenceState] ??
    `Evidence state: ${evidenceState ?? "unknown"}.`
  );
}

// ─── Sub-check state derivation ───────────────────────────────────────────────

function deriveSubChecks(verificationStatus, evidenceState) {
  if (verificationStatus === "supported") {
    return { sourceExists: "pass", citationAccurate: "pass", passageSupports: "pass" };
  }

  if (verificationStatus === "warning") {
    return { sourceExists: "pass", citationAccurate: "caution", passageSupports: "caution" };
  }

  if (evidenceState === "CONTRADICTED") {
    return { sourceExists: "pass", citationAccurate: "fail", passageSupports: "fail" };
  }

  return { sourceExists: "fail", citationAccurate: "fail", passageSupports: "fail" };
}

// ─── Sub-check row ────────────────────────────────────────────────────────────

function SubCheckRow({ state, label, detail }) {
  let Icon = CheckCircle2;
  let iconCls = "subcheck-icon-pass";
  if (state === "caution") {
    Icon = AlertTriangle;
    iconCls = "subcheck-icon-caution";
  } else if (state === "fail") {
    Icon = XCircle;
    iconCls = "subcheck-icon-fail";
  }

  return (
    <div className={`cvp-subcheck-row cvp-subcheck-${state}`}>
      <span className={`cvp-subcheck-icon ${iconCls}`}>
        <Icon size={16} />
      </span>
      <div className="cvp-subcheck-content">
        <span className="cvp-subcheck-label">{label}</span>
        <span className="cvp-subcheck-detail">{detail}</span>
      </div>
    </div>
  );
}

// ─── Claim card ───────────────────────────────────────────────────────────────

function ClaimCard({ claim, index, queryId }) {
  const { claim_text, verification_status, citation, evidence_state, claim_id } = claim;

  const STATUS_CONFIG = {
    supported: {
      label: "VERIFIED",
      pillClass: "status-pill-verified",
      cardClass: "claim-verified",
    },
    warning: {
      label: "WARNING",
      pillClass: "status-pill-warning",
      cardClass: "claim-warning",
    },
    failed: {
      label: "FAILED",
      pillClass: "status-pill-failed",
      cardClass: "claim-failed",
    },
  };

  const config = STATUS_CONFIG[verification_status] ?? {
    label: verification_status?.toUpperCase() ?? "UNKNOWN",
    pillClass: "status-pill-warning",
    cardClass: "claim-warning",
  };

  const checks = deriveSubChecks(verification_status, evidence_state);

  const formattedDate = citation?.date
    ? new Date(citation.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <article className={`cvp-claim-card ${config.cardClass}`}>
      {/* Card Header: 24px Number Circle + Claim Text + Status Pill */}
      <div className="cvp-card-header">
        <div className="cvp-header-left">
          <div className="cvp-claim-num-circle">
            {String(index + 1).padStart(2, "0")}
          </div>
          <h3 className="cvp-card-claim-text">{claim_text}</h3>
        </div>
        <StatusBadge status={verification_status} label={config.label} />
      </div>

      {/* Sub-checks: Clean List Rows with Hairlines (No box-in-box) */}
      <div className="cvp-subchecks-list">
        <SubCheckRow
          state={checks.sourceExists}
          label="Source Exists"
          detail={
            citation
              ? `${citation.case_name} · ${citation.court} located in verified corpus.`
              : "No source citation provided in corpus."
          }
        />
        <SubCheckRow
          state={checks.citationAccurate}
          label="Citation Accurate"
          detail={
            citation?.citation_no
              ? `${citation.citation_no} ${
                  checks.citationAccurate === "pass"
                    ? "matches primary record."
                    : checks.citationAccurate === "caution"
                    ? "matches record — subject to conflicting judicial authority."
                    : "located in record — cited ratio does not substantiate claim proposition."
                }`
              : "Citation record unavailable."
          }
        />
        <SubCheckRow
          state={checks.passageSupports}
          label="Passage Supports"
          detail={evidencePassageLabel(evidence_state)}
        />
      </div>

      {/* Cited Case Source Footer Line with Scale Glyph */}
      {citation && (
        <div className="cvp-case-source-footer">
          <div className="source-info-group">
            <Scale size={15} className="source-scale-icon" />
            <span className="source-case-name">{citation.case_name}</span>
            <span className="source-sep">·</span>
            <code className="source-citation-no">{citation.citation_no}</code>
            <span className="source-sep">·</span>
            <span className="source-court-name">{citation.court}</span>
            {formattedDate && (
              <>
                <span className="source-sep">·</span>
                <span className="source-date">{formattedDate}</span>
              </>
            )}
            {citation.paragraph && (
              <span className="source-paragraph"> — {citation.paragraph}</span>
            )}
          </div>

          {queryId && (
            <Link
              to={`/research/${queryId}/evidence?claimId=${claim_id}`}
              className="source-evidence-link"
              title="Inspect provenance in dual-pane passage viewer"
            >
              <span>Inspect Passage</span>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Summary Strip (4 Compact Stat Chips) ─────────────────────────────────────

function SummaryStrip({ claims }) {
  const total = claims.length;
  const verified = claims.filter((c) => c.verification_status === "supported").length;
  const warnings = claims.filter((c) => c.verification_status === "warning").length;
  const failed = claims.filter((c) => c.verification_status === "failed").length;

  return (
    <div
      className="cvp-summary-chips-grid"
      role="status"
      aria-label="Claim verification summary metrics"
    >
      {/* Chip 1: Total */}
      <div className="stat-chip chip-total">
        <div className="chip-icon-circle">
          <Layers size={16} />
        </div>
        <div className="chip-meta">
          <span className="chip-number">{total}</span>
          <span className="chip-label">Analyzed Claims</span>
        </div>
      </div>

      {/* Chip 2: Verified */}
      <div className="stat-chip chip-verified">
        <div className="chip-icon-circle">
          <CheckCircle2 size={16} />
        </div>
        <div className="chip-meta">
          <span className="chip-number">{verified}</span>
          <span className="chip-label">Strictly Verified</span>
        </div>
      </div>

      {/* Chip 3: Warnings */}
      <div className="stat-chip chip-warning">
        <div className="chip-icon-circle">
          <AlertTriangle size={16} />
        </div>
        <div className="chip-meta">
          <span className="chip-number">{warnings}</span>
          <span className="chip-label">Warnings</span>
        </div>
      </div>

      {/* Chip 4: Failed */}
      <div className="stat-chip chip-failed">
        <div className="chip-icon-circle">
          <XCircle size={16} />
        </div>
        <div className="chip-meta">
          <span className="chip-number">{failed}</span>
          <span className="chip-label">Unverified / Failed</span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <AppShell user={null}>
      <div className="cvp-page">
        <div className="cvp-topbar">
          <div className="sk-line sk-btn" style={{ width: 140 }} />
          <div className="sk-line" style={{ width: 220, height: 24 }} />
          <div className="sk-line sk-btn" style={{ width: 160 }} />
        </div>
        <div className="cvp-summary-chips-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-chip" style={{ height: 60 }} />
          ))}
        </div>
        <div className="cvp-cards-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cvp-claim-card" style={{ height: 160 }} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ queryId }) {
  return (
    <AppShell user={null}>
      <div className="cvp-page">
        <div className="error-banner" role="alert">
          <AlertTriangle size={18} />
          <div>
            <strong>Result not found: </strong>
            No research result exists for query ID <code>{queryId}</code>.
          </div>
          <Link to="/research" className="btn btn-secondary" style={{ marginLeft: "auto" }}>
            Back to Research
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClaimVerificationPage() {
  const { queryId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setResult(null);

    getResearchResult(queryId)
      .then((data) => {
        if (!cancelled) setResult(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryId]);

  if (loading) return <Skeleton />;
  if (error || !result) return <ErrorState queryId={queryId} />;

  const { claims } = result;

  const hasIssues = claims.some(
    (c) =>
      c.verification_status === "warning" ||
      c.verification_status === "failed"
  );

  return (
    <AppShell user={null}>
      <div className="cvp-page">
        {/* ── Page Header ── */}
        <PageHeader
          title="Claim & Citation Verification"
          action={
            <>
              <button
                type="button"
                className="btn btn-ghost cvp-back-btn"
                onClick={() => navigate(`/research/${queryId}`)}
                id="cvp-back-to-answer-btn"
              >
                <ArrowLeft size={15} style={{ marginRight: 6 }} />
                <span>Back to Answer</span>
              </button>
              <Link
                to={`/research/${queryId}/evidence`}
                className="btn btn-secondary cvp-inspect-btn"
                id="cvp-evidence-view-btn"
              >
                <span>Inspect Evidence</span>
                <ChevronRight size={14} style={{ marginLeft: 4 }} />
              </Link>
            </>
          }
        />

        {/* ── Summary Strip (4 Compact Stat Chips) ── */}
        <SummaryStrip claims={claims} />

        {/* ── Claim Cards ── */}
        <section className="cvp-cards-list" aria-label="Verified Claims List">
          {claims.map((claim, index) => (
            <ClaimCard
              key={claim.claim_id}
              claim={claim}
              index={index}
              queryId={queryId}
            />
          ))}
        </section>

        {/* ── Bottom Action Bar (Right-Aligned) ── */}
        <footer className="cvp-action-bar">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => navigate(`/research/${queryId}`)}
            id="cvp-action-back-btn"
          >
            <ArrowLeft size={15} style={{ marginRight: 6 }} />
            <span>Back to Answer</span>
          </button>

          <div className="cvp-action-bar-right">
            {hasIssues && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/research/${queryId}?reviewed=true`)}
                id="cvp-review-warnings-btn"
              >
                <AlertTriangle size={15} style={{ marginRight: 6 }} />
                <span>Review Warnings</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/research/${queryId}?verified=true`)}
              id="cvp-accept-verified-btn"
            >
              <CheckCircle2 size={15} style={{ marginRight: 6 }} />
              <span>Accept Verified</span>
            </button>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
