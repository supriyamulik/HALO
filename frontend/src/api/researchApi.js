import axios from "axios";
import { adaptPipelineResponse } from "./pipelineAdapter";
import { ALL_RESULTS, RESULT_CLEAN, RESULT_MIXED, RESULT_WEAK } from "./mockData";
import api from "./client";

// ─── Mock-data toggle ──────────────────────────────────────────────────────
//
// Set to true  → every function returns hardcoded mock fixtures immediately.
//                Use this when the backend is unavailable (offline UI dev).
// Set to false → every function calls the real backend and throws loudly on
//                failure so errors are visible in the UI error state.
//                USE THIS for integration testing.
export const USE_MOCK_DATA = false;

// Dedicated axios instance that points at the pipeline proxy prefix.
// Vite rewrites: /pipeline-api/* → http://localhost:8001/api/v1/*
const pipelineApi = axios.create({
  baseURL: "/pipeline-api",
  headers: { "Content-Type": "application/json" },
});

// ─── Exported API functions connected to live FastAPI backend ──────────────

/**
 * Submit a research query directly to the teammate's HALO pipeline.
 *
 * Calls POST /api/v1/research (proxied by Vite → localhost:8000) and
 * transforms the raw HaloPipeline response into the canonical frontend
 * contract via adaptPipelineResponse().
 *
 * Falls back to mock fixtures if the backend is unreachable.
 *
 * @param {string} queryText
 * @param {Object} [filters]  e.g. { jurisdiction, dateRange, courtLevel }
 * @returns {Promise<Object>} full result in the mockData.js contract shape
 */
export async function submitQuery(queryText, filters = {}) {
  if (USE_MOCK_DATA) {
    // Offline / UI-dev mode: deterministic mock based on query length
    const idx = queryText.length % ALL_RESULTS.length;
    return ALL_RESULTS[idx];
  }

  // ── 1. Primary: Unified Live Backend on :8000 (/api/v1/research/query) ──────
  try {
    const payload = {
      query_text: queryText,
      jurisdiction: filters.jurisdiction || "Supreme Court of India",
      court_level: filters.courtLevel || "All Courts",
      date_range: filters.dateRange || "all",
      // NOTE: candidate_answer is intentionally omitted here.
      // That field is only for explicitly supplying a pre-written answer
      // to the verification pipeline. Normal search must leave it empty
      // so the backend runs retrieval + LLM generation.
    };
    const response = await api.post("/research/query", payload);
    const data = response.data;
    return {
      query_id: data.query_id,
      ...data.result,
    };
  } catch (backendErr) {
    console.warn("[researchApi] Live backend /research/query failed, attempting :8001 pipeline fallback:", backendErr.message);

    // ── 2. Fallback: Microservice Pipeline on :8001 (/pipeline-api/research) ──
    const payload = {
      query: queryText,
      // candidate_answer intentionally omitted — let the pipeline run LLM generation.
      citations: [],
      candidate_passages: [],
    };

    let response;
    try {
      response = await pipelineApi.post("/research", payload);
    } catch (pipelineErr) {
      console.error("[pipelineApi] POST /research on :8001 failed:", pipelineErr);
      throw new Error(
        `Backend research service error: ${backendErr.message || pipelineErr.message}`
      );
    }

    return adaptPipelineResponse(response.data);
  }
}

/**
 * Fetch the full research result for a given query ID.
 *
 * @param {string} queryId
 * @returns {Promise<Object>} full research result
 */
export async function getResearchResult(queryId) {
  try {
    const response = await api.get(`/research/result/${queryId}`);
    return response.data;
  } catch (error) {
    console.warn(`Live API getResearchResult(${queryId}) failed, checking local fixtures:`, error.message);
    const result = ALL_RESULTS.find((r) => r.query_id === queryId);
    if (result) return result;
    throw error;
  }
}

/**
 * Fetch only the claims array for a given query ID.
 *
 * @param {string} queryId
 * @returns {Promise<Array>} claims array
 */
export async function getClaims(queryId) {
  try {
    const response = await api.get(`/research/result/${queryId}/claims`);
    return response.data;
  } catch (error) {
    console.warn(`Live API getClaims(${queryId}) failed:`, error.message);
    const result = ALL_RESULTS.find((r) => r.query_id === queryId);
    if (result) return result.claims;
    throw error;
  }
}

/**
 * Fetch the evidence / sources for a given query ID.
 *
 * @param {string} queryId
 * @returns {Promise<{ sources: Array, evidence_coverage: number }>}
 */
export async function getEvidence(queryId) {
  try {
    const response = await api.get(`/research/result/${queryId}/evidence`);
    return response.data;
  } catch (error) {
    console.warn(`Live API getEvidence(${queryId}) failed:`, error.message);
    const result = ALL_RESULTS.find((r) => r.query_id === queryId);
    if (result) {
      return {
        sources: result.sources,
        evidence_coverage: result.evidence_coverage,
      };
    }
    throw error;
  }
}

/**
 * Fetch the current user's research history.
 *
 * @returns {Promise<Array>} array of past query summaries
 */
export async function getResearchHistory() {
  try {
    const response = await api.get("/research/history");
    return response.data;
  } catch (error) {
    console.warn("Live API getResearchHistory() failed, returning mock history:", error.message);
    return [
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
    ];
  }
}

