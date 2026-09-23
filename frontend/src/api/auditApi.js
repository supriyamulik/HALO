/**
 * src/api/auditApi.js
 * ───────────────────
 * Live API service for Cryptographic Audit Trail (FR-14 / PRD Section 52).
 * Reads 100% real pipeline execution records from backend audit_store.jsonl.
 */

import api from "./client";

/**
 * Fetch list of audit logs with live metrics.
 * @param {Object} [params]
 * @param {string} [params.search]
 * @param {boolean} [params.failClosedOnly]
 * @param {number} [params.limit=50]
 * @param {number} [params.offset=0]
 * @returns {Promise<{ total: number, metrics: Object, records: Array }>}
 */
export async function getAuditLogs(params = {}) {
  const queryParams = {};
  if (params.search) queryParams.search = params.search;
  if (typeof params.failClosedOnly === "boolean") queryParams.fail_closed_only = params.failClosedOnly;
  if (params.limit) queryParams.limit = params.limit;
  if (params.offset) queryParams.offset = params.offset;

  const { data } = await api.get("/audit/logs", { params: queryParams });
  return data;
}

/**
 * Fetch a single full audit record by ID including raw claims,
 * NLI neural-symbolic check results, and cryptographic SHA-256 seal.
 * @param {string} auditId
 * @returns {Promise<Object>}
 */
export async function getAuditRecordDetail(auditId) {
  const { data } = await api.get(`/audit/logs/${auditId}`);
  return data;
}
