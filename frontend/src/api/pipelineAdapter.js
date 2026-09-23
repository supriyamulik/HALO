/**
 * src/api/pipelineAdapter.js
 * ──────────────────────────
 * Pure translation layer — NO business logic lives here.
 *
 * Takes the raw JSON emitted by the teammate's HaloPipeline.process()
 * (as serialised by FastAPI's ResearchResponse Pydantic model) and maps
 * it to the canonical frontend contract defined in mockData.js.
 *
 * Field mapping reference
 * ───────────────────────
 * Pipeline (raw)                  Frontend contract (target)
 * ──────────────────────────────  ────────────────────────────────────────
 * final_answer                 →  answer_text
 * overall_confidence           →  confidence_score
 * claims[].claim_id            →  claims[].claim_id
 * claims[].claim_text          →  claims[].claim_text
 * verification_records[]       →  merged into claims[] (join on claim_id)
 *   .status (SUPPORTED …)      →    .verification_status (supported …)
 *   .authoritative_passage_id  →    .evidence_passage_id
 *   .status                    →    .evidence_state (best-effort mapping)
 * conflict_detection.has_conflicts → conflicts_detected (bool)
 * conflict_detection.conflicts[]   → warnings[] (human-readable strings)
 * timestamp                    →  verification_timestamp
 * audit_id                     →  query_id   (used as stable key)
 *
 * Fields with no pipeline equivalent are synthesised / given safe defaults:
 *   sources            – built from claims that have citation metadata
 *   evidence_coverage  – derived from fraction of SUPPORTED claims
 *   temporal_context   – pulled from conflict_detection.temporal_notes if present
 *   corpus_version     – static placeholder ("HALO-v1.0")
 *   model_version      – static placeholder ("halo-verify-v1.0-FROZEN")
 *   retrieval_trace    – empty array (pipeline does not expose this yet)
 */

// ─── Status enum normalisation ─────────────────────────────────────────────

/**
 * Map pipeline status strings → frontend verification_status strings.
 *
 * Pipeline emits: SUPPORTED | PARTIALLY_SUPPORTED | CONTRADICTED |
 *                 FLAGGED | FABRICATED_CITATION | UNSUPPORTED
 * Frontend expects: "supported" | "warning" | "failed"
 */
function mapVerificationStatus(rawStatus) {
  switch ((rawStatus || "").toUpperCase()) {
    case "SUPPORTED":
      return "supported";
    case "PARTIALLY_SUPPORTED":
    case "FLAGGED":
      return "warning";
    case "CONTRADICTED":
    case "FABRICATED_CITATION":
    case "UNSUPPORTED":
      return "failed";
    default:
      return "warning"; // safe degraded state
  }
}

/**
 * Map pipeline status strings → frontend evidence_state strings.
 *
 * The frontend uses descriptive state labels (SUPPORTED_CURRENT, etc.).
 * We synthesise a reasonable label from the pipeline status.
 */
function mapEvidenceState(rawStatus) {
  switch ((rawStatus || "").toUpperCase()) {
    case "SUPPORTED":
      return "SUPPORTED_CURRENT";
    case "PARTIALLY_SUPPORTED":
      return "SUPPORTED_DISPUTED";
    case "FLAGGED":
      return "SUPPORTED_DISPUTED";
    case "CONTRADICTED":
      return "CONTRADICTED";
    case "FABRICATED_CITATION":
      return "CONTRADICTED";
    case "UNSUPPORTED":
      return "UNVERIFIED";
    default:
      return "UNVERIFIED";
  }
}

// ─── Citation helper ───────────────────────────────────────────────────────

/**
 * Build a frontend citation object from a raw pipeline claim dict.
 * The claim extractor stores citation info inside claim.citation_ids[] but
 * actual metadata lives inside the verification_record's citation_result.
 */
function buildCitation(verifRecord) {
  const cr = verifRecord?.citation_result || {};
  return {
    case_name: cr.case_name || cr.citation_text || "Unknown Source",
    court: cr.court || cr.jurisdiction || "",
    date: cr.date || cr.year || "",
    citation_no: cr.citation_no || cr.citation_id || "",
    paragraph: cr.paragraph || "",
  };
}

// ─── Sources helper ────────────────────────────────────────────────────────

/**
 * Derive a de-duplicated sources array from the adapted claims list.
 * Each unique case_name becomes one source entry.
 */
function buildSources(adaptedClaims) {
  const seen = new Set();
  const sources = [];

  adaptedClaims.forEach((claim, idx) => {
    const cit = claim.citation || {};
    const key = cit.case_name || `source_${idx}`;
    if (!seen.has(key)) {
      seen.add(key);
      sources.push({
        id: `s_${String(idx + 1).padStart(3, "0")}`,
        title: cit.case_name || "Unknown Source",
        court: cit.court || "",
        year: cit.date ? cit.date.split("-")[0] : cit.year || "",
        relevance: claim.verification_status === "supported" ? 0.85 : 0.6,
      });
    }
  });

  return sources;
}

// ─── Evidence coverage helper ──────────────────────────────────────────────

function computeEvidenceCoverage(adaptedClaims) {
  if (!adaptedClaims.length) return 0;
  const weighted = adaptedClaims.reduce((sum, c) => {
    if (c.verification_status === "supported") return sum + 1;
    if (c.verification_status === "warning") return sum + 0.5;
    return sum;
  }, 0);
  return parseFloat((weighted / adaptedClaims.length).toFixed(2));
}

// ─── Warnings / conflict helper ────────────────────────────────────────────

function buildWarnings(conflictDetection, adaptedClaims) {
  const warnings = [];

  // Conflict detection warnings
  const cd = conflictDetection || {};
  if (cd.conflicts && Array.isArray(cd.conflicts)) {
    cd.conflicts.forEach((conflict) => {
      if (typeof conflict === "string") {
        warnings.push(conflict);
      } else if (conflict?.description) {
        warnings.push(conflict.description);
      } else if (conflict?.summary) {
        warnings.push(conflict.summary);
      }
    });
  }
  if (cd.explanation && typeof cd.explanation === "string") {
    warnings.push(cd.explanation);
  }

  // Add warnings for claims that couldn't be verified
  adaptedClaims.forEach((claim) => {
    if (claim.verification_status === "failed") {
      const excerpt = claim.claim_text.length > 80
        ? claim.claim_text.slice(0, 80) + "\u2026"
        : claim.claim_text;
      warnings.push(
        `Claim "${excerpt}" could not be verified — review manually before relying on it.`
      );
    }
  });

  return warnings;
}

// ─── Main adapter ──────────────────────────────────────────────────────────

/**
 * Transforms raw HaloPipeline JSON → canonical frontend contract shape.
 *
 * @param {Object} raw  The JSON body from POST /api/v1/research
 * @returns {Object}    A result object matching the mockData.js contract
 */
export function adaptPipelineResponse(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("adaptPipelineResponse: expected a non-null object");
  }

  // Build lookup map: claim_id → verification_record
  const verifMap = {};
  (raw.verification_records || []).forEach((rec) => {
    verifMap[rec.claim_id] = rec;
  });

  // Adapt claims by merging extracted claim + its verification record
  const adaptedClaims = (raw.claims || []).map((claim, idx) => {
    const cid = claim.claim_id || `CLM_${String(idx + 1).padStart(3, "0")}`;
    const verif = verifMap[cid] || {};
    const rawStatus = verif.status || "UNSUPPORTED";

    return {
      claim_id: cid,
      claim_text: claim.claim_text || "",
      citation: buildCitation(verif),
      verification_status: mapVerificationStatus(rawStatus),
      evidence_state: mapEvidenceState(rawStatus),
      evidence_passage_id: verif.authoritative_passage_id || null,
    };
  });

  const conflictDetection = raw.conflict_detection || {};
  const hasConflicts =
    conflictDetection.has_conflicts ??
    (Array.isArray(conflictDetection.conflicts) &&
      conflictDetection.conflicts.length > 0) ??
    false;

  return {
    // Stable key for this result (audit_id is a UUID from the pipeline)
    query_id: raw.audit_id || `q_${Date.now()}`,

    // Core answer
    answer_text: raw.final_answer || "",

    // Verified claims (merged)
    claims: adaptedClaims,

    // Evidence sources (derived from claim citations)
    sources: buildSources(adaptedClaims),

    // Scalar scores
    confidence_score:
      typeof raw.overall_confidence === "number"
        ? parseFloat(raw.overall_confidence.toFixed(2))
        : 0,
    evidence_coverage: computeEvidenceCoverage(adaptedClaims),

    // Warnings & conflict flag
    warnings: buildWarnings(conflictDetection, adaptedClaims),
    conflicts_detected: Boolean(hasConflicts),

    // Temporal / metadata
    temporal_context:
      conflictDetection.temporal_notes ||
      conflictDetection.temporal_context ||
      (raw.fail_closed
        ? "Answer flagged as fail-closed — treat with caution."
        : ""),
    corpus_version: "HALO-v1.0",
    model_version: "halo-verify-v1.0-FROZEN",
    verification_timestamp: raw.timestamp || new Date().toISOString(),

    // Retrieval trace (not yet exposed by pipeline)
    retrieval_trace: [],

    // Pass-through metadata (not in PRD contract but useful for debugging)
    _meta: {
      audit_id: raw.audit_id,
      is_authoritative: raw.is_authoritative,
      fail_closed: raw.fail_closed,
      query: raw.query,
    },
  };
}
