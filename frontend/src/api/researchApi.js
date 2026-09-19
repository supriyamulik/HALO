// MOCK LAYER — replace each function body with a real axios call
// to /api/v1/research/... when backend is ready. Do not change
// function signatures or return shapes.
//
// Swap checklist (one-file change):
//   1. Import `api` from "./client" instead of mock data
//   2. Replace each function body with an `await api.get/post(...)` call
//   3. Delete the `delay()` helper and the mockData import
//   4. Delete this file's mock data dependency entirely

import { ALL_RESULTS, RESULT_CLEAN, RESULT_MIXED, RESULT_WEAK } from "./mockData";

// ─── Utility: simulate network latency ────────────────────────────────────

const delay = (ms = 800) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Mock history derived from the three sample results ───────────────────

const MOCK_HISTORY = [
  {
    query_id: RESULT_CLEAN.query_id,
    query_text: "What is the doctrine of res judicata and its scope under Indian law?",
    date: "2024-11-15T09:23:41Z",
    confidence_score: RESULT_CLEAN.confidence_score,
    verification_summary: {
      total_claims: RESULT_CLEAN.claims.length,
      supported: RESULT_CLEAN.claims.filter((c) => c.verification_status === "supported").length,
      warnings: RESULT_CLEAN.claims.filter((c) => c.verification_status === "warning").length,
      failed: RESULT_CLEAN.claims.filter((c) => c.verification_status === "failed").length,
    },
    conflicts_detected: RESULT_CLEAN.conflicts_detected,
  },
  {
    query_id: RESULT_MIXED.query_id,
    query_text: "Director liability under Section 179 Income Tax Act — nominee director position",
    date: "2024-11-15T10:47:03Z",
    confidence_score: RESULT_MIXED.confidence_score,
    verification_summary: {
      total_claims: RESULT_MIXED.claims.length,
      supported: RESULT_MIXED.claims.filter((c) => c.verification_status === "supported").length,
      warnings: RESULT_MIXED.claims.filter((c) => c.verification_status === "warning").length,
      failed: RESULT_MIXED.claims.filter((c) => c.verification_status === "failed").length,
    },
    conflicts_detected: RESULT_MIXED.conflicts_detected,
  },
  {
    query_id: RESULT_WEAK.query_id,
    query_text: "Data localisation obligations under DPDPA 2023 for cross-border legal-tech platforms",
    date: "2024-11-15T11:58:22Z",
    confidence_score: RESULT_WEAK.confidence_score,
    verification_summary: {
      total_claims: RESULT_WEAK.claims.length,
      supported: RESULT_WEAK.claims.filter((c) => c.verification_status === "supported").length,
      warnings: RESULT_WEAK.claims.filter((c) => c.verification_status === "warning").length,
      failed: RESULT_WEAK.claims.filter((c) => c.verification_status === "failed").length,
    },
    conflicts_detected: RESULT_WEAK.conflicts_detected,
  },
];

// ─── Exported API functions ────────────────────────────────────────────────

/**
 * Submit a new research query.
 *
 * REAL: POST /api/v1/research/query  { query_text, filters }
 *       → { query_id: string, status: "processing" | "done" }
 *
 * @param {string} queryText
 * @param {Object} filters  e.g. { jurisdiction, dateRange, courtLevel }
 * @returns {Promise<{ query_id: string, status: string }>}
 */
export async function submitQuery(queryText, filters = {}) {
  await delay();
  // Pick a result deterministically based on query length so the UI isn't static
  const idx = queryText.length % ALL_RESULTS.length;
  return { query_id: ALL_RESULTS[idx].query_id, status: "done" };
}

/**
 * Fetch the full research result for a given query ID.
 *
 * REAL: GET /api/v1/research/result/{queryId}
 *       → ResearchResult (full contract object)
 *
 * @param {string} queryId
 * @returns {Promise<Object>} full research result
 */
export async function getResearchResult(queryId) {
  await delay();
  const result = ALL_RESULTS.find((r) => r.query_id === queryId);
  if (!result) throw new Error(`No result found for query_id: ${queryId}`);
  return result;
}

/**
 * Fetch only the claims array for a given query ID.
 *
 * REAL: GET /api/v1/research/result/{queryId}/claims
 *       → Claim[]
 *
 * @param {string} queryId
 * @returns {Promise<Array>} claims array
 */
export async function getClaims(queryId) {
  await delay();
  const result = ALL_RESULTS.find((r) => r.query_id === queryId);
  if (!result) throw new Error(`No result found for query_id: ${queryId}`);
  return result.claims;
}

/**
 * Fetch the evidence / sources for a given query ID.
 *
 * REAL: GET /api/v1/research/result/{queryId}/evidence
 *       → { sources: Source[], evidence_coverage: number }
 *
 * @param {string} queryId
 * @returns {Promise<{ sources: Array, evidence_coverage: number }>}
 */
export async function getEvidence(queryId) {
  await delay();
  const result = ALL_RESULTS.find((r) => r.query_id === queryId);
  if (!result) throw new Error(`No result found for query_id: ${queryId}`);
  return {
    sources: result.sources,
    evidence_coverage: result.evidence_coverage,
  };
}

/**
 * Fetch the current user's research history.
 *
 * REAL: GET /api/v1/research/history
 *       → HistoryItem[]
 *
 * @returns {Promise<Array>} array of past query summaries
 */
export async function getResearchHistory() {
  await delay(600);
  return MOCK_HISTORY;
}
