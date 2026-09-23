/**
 * src/components/StatusBadge.jsx
 * ──────────────────────────────
 * Shared pill / status badge component across HALO frontend.
 * Provides unified markup, pill border-radius (4px), uppercase typography,
 * and exact semantic status color tokens.
 */

import React from "react";
import "./StatusBadge.css";

/**
 * Normalizes any semantic or domain status string to one of the canonical variants:
 * "verified" | "warning" | "failed" | "conflict" | "apex" | "subordinate" | "accent" | "neutral"
 */
export function normalizeVariant(status) {
  if (!status) return "neutral";
  const s = String(status).trim().toLowerCase().replace(/[-_\s]+/g, "");

  if (["verified", "clean", "supported", "approved", "active", "pass", "high", "accepted", "filed"].includes(s)) {
    return "verified";
  }
  if (["warning", "mixed", "review", "underreview", "inhearing", "hearing", "notary", "readyfornotary", "moderate", "qualified"].includes(s)) {
    return "warning";
  }
  if (["failed", "weak", "fail", "low", "failclosed", "danger", "error", "quarantined", "redacted"].includes(s)) {
    return "failed";
  }
  if (["conflict", "conflicts", "conflictsdetected"].includes(s)) {
    return "conflict";
  }
  if (["apex", "apexprecedent"].includes(s)) {
    return "apex";
  }
  if (["subordinate", "subordinatebench"].includes(s)) {
    return "subordinate";
  }
  if (["accent", "stage", "grounded", "statutegrounded"].includes(s)) {
    return "accent";
  }
  if (["draft", "drafting", "archived", "neutral", "unknown"].includes(s)) {
    return "neutral";
  }

  return "neutral";
}

export default function StatusBadge({
  status,
  variant,
  label,
  children,
  size = "md",
  dot = false,
  className = "",
  title,
  icon,
  style,
}) {
  const resolvedVariant = variant || normalizeVariant(status);
  const displayText = children || label || (status ? String(status).toUpperCase() : "");

  return (
    <span
      className={`halo-status-badge halo-status-badge--${resolvedVariant} halo-status-badge--${size} ${className}`.trim()}
      title={title}
      style={style}
    >
      {dot && <span className="halo-status-badge-dot" aria-hidden="true" />}
      {icon && <span className="halo-status-badge-icon" aria-hidden="true">{icon}</span>}
      {displayText}
    </span>
  );
}
