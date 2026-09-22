/**
 * src/pages/ClaimVerificationPage.jsx
 * ─────────────────────────────────────
 * Deep-dive verification view for /research/:queryId/verify.
 *
 * Uses the same getResearchResult() call as ResearchResultPage — no new
 * API contract. Each claim is expanded into a numbered card with three
 * explicit sub-checks (Source Exists, Citation Accurate, Passage Supports)
 * derived from the citation and evidence_state fields in the fixture.
 *
 * API swap: change researchApi.js only. Never edit this file to change
 * data source.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getResearchResult } from "../api/researchApi";
import AppShell from "../components/AppShell";
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

/**
 * Returns sub-check statuses for the three checks based on claim status.
 *   "pass"    → green tick
 *   "fail"    → red cross
 *   "caution" → amber caution
 */
function deriveSubChecks(verificationStatus, evidenceState) {
  if (verificationStatus === "supported") {
    return { sourceExists: "pass", citationAccurate: "pass", passageSupports: "pass" };
  }

  if (verificationStatus === "warning") {
    // Source and citation were found; the passage support is disputed
    return { sourceExists: "pass", citationAccurate: "caution", passageSupports: "caution" };
  }

  // "failed" — we differentiate slightly on evidence_state
  if (evidenceState === "CONTRADICTED") {
    // Source exists in corpus but actively contradicts the claim
    return { sourceExists: "pass", citationAccurate: "fail", passageSupports: "fail" };
  }

  // Generic failed — source or citation not found at all
  return { sourceExists: "fail", citationAccurate: "fail", passageSupports: "fail" };
}

// ─── Sub-check icon ───────────────────────────────────────────────────────────

function SubCheckIcon({ state }) {
  if (state === "pass")
    return <span className="cvp-subcheck-icon cvp-subcheck-pass" aria-label="Pass">✓</span>;
  if (state === "caution")
    return <span className="cvp-subcheck-icon cvp-subcheck-caution" aria-label="Caution">⚠</span>;
  return <span className="cvp-subcheck-icon cvp-subcheck-fail" aria-label="Fail">✗</span>;
}

// ─── Sub-check row ────────────────────────────────────────────────────────────

function SubCheckRow({ state, label, detail }) {
  return (
    <div className={`cvp-subcheck-row cvp-subcheck-row--${state}`}>
      <SubCheckIcon state={state} />
      <div className="cvp-subcheck-content">
        <span className="cvp-subcheck-label">{label}</span>
        <span className="cvp-subcheck-detail">{detail}</span>
      </div>
    </div>
  );
}

// ─── Claim card ───────────────────────────────────────────────────────────────

function ClaimCard({ claim, index }) {
  const { claim_text, verification_status, citation, evidence_state } = claim;

  const STATUS_MAP = {
    supported: { label: "VERIFIED", cls: "cvp-badge--verified" },
    warning:   { label: "WARNING",  cls: "cvp-badge--warning"  },
    failed:    { label: "FAILED",   cls: "cvp-badge--failed"   },
  };

  const { label: badgeLabel, cls: badgeCls } =
    STATUS_MAP[verification_status] ?? {
      label: verification_status.toUpperCase(),
      cls: "",
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
    <div className={`cvp-claim-card cvp-claim-card--${verification_status}`}>
      {/* Card header */}
      <div className="cvp-card-header">
        <div className="cvp-card-number">{String(index + 1).padStart(2, "0")}</div>
        <h3 className="cvp-card-claim-text">{claim_text}</h3>
        <span className={`cvp-status-badge ${badgeCls}`}>{badgeLabel}</span>
      </div>

      {/* Three sub-checks */}
      <div className="cvp-subchecks">
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

      {/* Cited case source footer */}
      {citation && (
        <div className="cvp-case-source">
          <span className="cvp-case-source-icon">📎</span>
          <span className="cvp-case-source-text">
            <strong>{citation.case_name}</strong>
            {" · "}
            {citation.court}
            {formattedDate && ` · ${formattedDate}`}
            {citation.paragraph && (
              <span className="cvp-case-paragraph"> — {citation.paragraph}</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Summary strip ────────────────────────────────────────────────────────────

function SummaryStrip({ claims }) {
  const total    = claims.length;
  const verified = claims.filter((c) => c.verification_status === "supported").length;
  const warnings = claims.filter((c) => c.verification_status === "warning").length;
  const failed   = claims.filter((c) => c.verification_status === "failed").length;

  return (
    <div
      className="cvp-summary-strip"
      role="status"
      aria-label="Claim verification summary"
    >
      <div className="cvp-summary-item cvp-summary-total">
        <span className="cvp-summary-num">{total}</span>
        <span className="cvp-summary-lbl">Total Claims Analyzed</span>
      </div>
      <div className="cvp-summary-divider" />
      <div className="cvp-summary-item cvp-summary-verified">
        <span className="cvp-summary-num">{verified}</span>
        <span className="cvp-summary-lbl">Verified</span>
      </div>
      <div className="cvp-summary-divider" />
      <div className="cvp-summary-item cvp-summary-warnings">
        <span className="cvp-summary-num">{warnings}</span>
        <span className="cvp-summary-lbl">Warnings</span>
      </div>
      <div className="cvp-summary-divider" />
      <div className="cvp-summary-item cvp-summary-failed">
        <span className="cvp-summary-num">{failed}</span>
        <span className="cvp-summary-lbl">Failed</span>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <AppShell user={null}>
      <div className="cvp-page">
        <div className="cvp-topbar">
          <div className="sk-line sk-back" aria-hidden="true" />
          <div className="sk-line cvp-sk-title" aria-hidden="true" />
          <div style={{ width: 120 }} />
        </div>
        <div className="cvp-sk-strip" aria-hidden="true" />
        <div className="cvp-cards-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="cvp-sk-card" aria-hidden="true">
              <div className="sk-line sk-heading" />
              <div className="sk-line sk-para" />
              <div className="sk-line sk-para sk-para-short" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

function ErrorState({ queryId }) {
  return (
    <AppShell user={null}>
      <div className="cvp-page">
        <div className="rrp-error-box">
          <div className="rrp-error-icon">⚠</div>
          <h2>Result not found</h2>
          <p>
            No research result exists for query ID{" "}
            <code>{queryId}</code>. It may have expired or been entered
            incorrectly.
          </p>
          <Link to="/research" className="btn rrp-back-btn">
            ← Back to Research
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ClaimVerificationPage() {
  const { queryId } = useParams();
  const navigate    = useNavigate();

  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setResult(null);

    getResearchResult(queryId)
      .then((data) => { if (!cancelled) setResult(data); })
      .catch(()    => { if (!cancelled) setError(true);  })
      .finally(()  => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
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

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="cvp-topbar">
          <button
            className="btn btn-ghost cvp-back-link"
            onClick={() => navigate(`/research/${queryId}`)}
            id="cvp-back-to-answer-btn"
          >
            ← Back to Answer
          </button>

          <div className="cvp-topbar-center">
            <h1 className="cvp-page-title">Claim &amp; Citation Verification</h1>
            <span className="cvp-query-id-label">Query: {queryId}</span>
          </div>

          {/* Spacer to balance the back button */}
          <div style={{ minWidth: 140 }} aria-hidden="true" />
        </div>

        {/* ── Summary strip ────────────────────────────────────────────── */}
        <SummaryStrip claims={claims} />

        {/* ── Claim cards ──────────────────────────────────────────────── */}
        <div className="cvp-cards-list">
          {claims.map((claim, index) => (
            <ClaimCard key={claim.claim_id} claim={claim} index={index} />
          ))}
        </div>

        {/* ── Bottom action bar ────────────────────────────────────────── */}
        <div className="cvp-action-bar">
          <button
            className="btn btn-secondary cvp-action-btn"
            onClick={() => navigate(`/research/${queryId}`)}
            id="cvp-action-back-btn"
          >
            Back to Answer
          </button>

          <div className="cvp-action-bar-right">
            {hasIssues && (
              <button
                className="btn cvp-action-btn cvp-review-btn"
                onClick={() => navigate(`/research/${queryId}?reviewed=true`)}
                id="cvp-review-warnings-btn"
              >
                ⚠ Review Warnings
              </button>
            )}

            <button
              className="btn cvp-action-btn cvp-accept-btn"
              onClick={() => navigate(`/research/${queryId}?verified=true`)}
              id="cvp-accept-verified-btn"
            >
              ✓ Accept Verified
            </button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
