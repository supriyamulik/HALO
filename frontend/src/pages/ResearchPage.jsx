/**
 * src/pages/ResearchPage.jsx
 * ──────────────────────────
 * Full research interface — search form, results list, sidebar filters.
 * Wired to researchApi.js mocks; swap to real API in researchApi.js only.
 */

import { useState } from "react";
import { submitQuery, getResearchResult } from "../api/researchApi";
import AppShell from "../components/AppShell";
import "./ResearchPage.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const COURT_OPTIONS = ["Supreme Court", "High Courts", "Tribunals"];
const CONTENT_OPTIONS = ["Acts & Sections", "Legal Commentary"];
const RESULT_TABS = ["All Results", "Cases", "Articles", "Commentary"];

const DEFAULT_FILTERS = {
  courts: { "Supreme Court": true, "High Courts": true, "Tribunals": true },
  content: { "Acts & Sections": true, "Legal Commentary": true },
  jurisdiction: "all",
  yearFrom: 1950,
  yearTo: new Date().getFullYear(),
  relevanceThreshold: 60,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function confidenceClass(score) {
  if (score >= 0.8) return "badge-green";
  if (score >= 0.55) return "badge-amber";
  return "badge-red";
}

function confidenceLabel(score) {
  if (score >= 0.8) return "High";
  if (score >= 0.55) return "Medium";
  return "Low";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="result-card skeleton-card" aria-hidden="true">
      <div className="sk-line sk-title" />
      <div className="sk-line sk-meta" />
      <div className="sk-line sk-body" />
      <div className="sk-line sk-body sk-body-short" />
      <div className="sk-actions">
        <div className="sk-line sk-btn" />
        <div className="sk-line sk-btn" />
      </div>
    </div>
  );
}

function ResultCard({ source, claim, conflicts }) {
  const relevancePct = Math.round((source?.relevance ?? 0) * 100);
  const badgeClass = confidenceClass(source?.relevance ?? 0);

  return (
    <div className="result-card">
      <div className="result-card-top">
        <h3 className="result-title">
          {source?.title ?? claim?.citation?.case_name ?? "Untitled"}
        </h3>
        <span className={`relevance-badge ${badgeClass}`}>{relevancePct}% relevant</span>
      </div>

      <div className="result-meta">
        <span className="result-court">
          {source?.court ?? claim?.citation?.court ?? "—"}
        </span>
        <span className="result-sep">·</span>
        <span className="result-year">
          {source?.year ?? claim?.citation?.date?.slice(0, 4) ?? "—"}
        </span>
        {conflicts && (
          <>
            <span className="result-sep">·</span>
            <span className="result-conflict-flag">⚠ Conflict detected</span>
          </>
        )}
      </div>

      {claim && <p className="result-excerpt">{claim.claim_text}</p>}

      {claim?.citation && (
        <p className="result-citation">
          <span className="citation-label">Citation:</span>{" "}
          {claim.citation.citation_no}
          {claim.citation.paragraph ? ` · ${claim.citation.paragraph}` : ""}
        </p>
      )}

      <div className="result-actions">
        <button
          className="btn btn-secondary result-btn"
          id={`view-case-${source?.id ?? claim?.claim_id}`}
        >
          View Full Case
        </button>
        <button
          className="btn btn-outline result-btn"
          id={`save-citation-${source?.id ?? claim?.claim_id}`}
        >
          Save Citation
        </button>
      </div>
    </div>
  );
}

function FilterSidebar({ filters, onChange }) {
  function toggleCourt(court) {
    onChange({
      ...filters,
      courts: { ...filters.courts, [court]: !filters.courts[court] },
    });
  }
  function toggleContent(type) {
    onChange({
      ...filters,
      content: { ...filters.content, [type]: !filters.content[type] },
    });
  }

  return (
    <aside className="filter-sidebar">
      <h3 className="filter-heading">Filter Results</h3>

      <div className="filter-group">
        <p className="filter-group-label">Court Level</p>
        {COURT_OPTIONS.map((c) => (
          <label key={c} className="filter-check-label">
            <input
              type="checkbox"
              checked={!!filters.courts[c]}
              onChange={() => toggleCourt(c)}
            />
            {c}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <p className="filter-group-label">Content Type</p>
        {CONTENT_OPTIONS.map((t) => (
          <label key={t} className="filter-check-label">
            <input
              type="checkbox"
              checked={!!filters.content[t]}
              onChange={() => toggleContent(t)}
            />
            {t}
          </label>
        ))}
      </div>

      <div className="filter-group">
        <p className="filter-group-label">Year Range</p>
        <div className="year-range-row">
          <input
            type="number"
            className="year-input"
            value={filters.yearFrom}
            min={1800}
            max={filters.yearTo}
            onChange={(e) =>
              onChange({ ...filters, yearFrom: Number(e.target.value) })
            }
            aria-label="From year"
          />
          <span>–</span>
          <input
            type="number"
            className="year-input"
            value={filters.yearTo}
            min={filters.yearFrom}
            max={new Date().getFullYear()}
            onChange={(e) =>
              onChange({ ...filters, yearTo: Number(e.target.value) })
            }
            aria-label="To year"
          />
        </div>
      </div>

      <div className="filter-group">
        <p className="filter-group-label">
          Relevance threshold: <strong>{filters.relevanceThreshold}%</strong>
        </p>
        <input
          type="range"
          min={0}
          max={100}
          value={filters.relevanceThreshold}
          onChange={(e) =>
            onChange({ ...filters, relevanceThreshold: Number(e.target.value) })
          }
          className="relevance-slider"
          aria-label="Relevance threshold"
        />
      </div>
    </aside>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  // Search form
  const [queryText, setQueryText] = useState("");
  const [aiSynthesis, setAiSynthesis] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ ...DEFAULT_FILTERS });

  // Results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All Results");
  const [sideFilters, setSideFilters] = useState({ ...DEFAULT_FILTERS });
  const [page, setPage] = useState(1);

  const hasResult = result !== null;

  async function handleSearch(e) {
    e.preventDefault();
    if (!queryText.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setPage(1);

    try {
      const { query_id } = await submitQuery(queryText, searchFilters);
      const data = await getResearchResult(query_id);
      setResult(data);
    } catch (err) {
      setError(err.message ?? "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Build card list from result — zip sources with claims
  const cards = result
    ? result.sources.map((src, i) => ({
        source: src,
        claim: result.claims[i] ?? null,
        conflicts: result.conflicts_detected,
      }))
    : [];

  const CARDS_PER_PAGE = 3;
  const totalPages = Math.max(1, Math.ceil(cards.length / CARDS_PER_PAGE));
  const pagedCards = cards.slice(
    (page - 1) * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE
  );

  return (
    <AppShell user={null}>
      <div className="research-page">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <header className="research-header">
          <h1>Legal Research</h1>
          <p>Search the Indian legal database — case law, statutes, and commentary.</p>
        </header>

        {/* ── Search form ──────────────────────────────────────────────── */}
        <section className="search-section">
          <form
            className="search-form"
            onSubmit={handleSearch}
            id="research-search-form"
          >
            <label className="search-textarea-label" htmlFor="query-input">
              Describe your legal question in detail
            </label>
            <textarea
              id="query-input"
              className="search-textarea"
              rows={4}
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="e.g. Can a tenant demand repayment if possession is delayed under RERA?"
              disabled={loading}
              required
            />

            <label className="ai-synthesis-label">
              <input
                type="checkbox"
                id="ai-synthesis-check"
                checked={aiSynthesis}
                onChange={(e) => setAiSynthesis(e.target.checked)}
                disabled={loading}
              />
              AI-assisted synthesis based on Indian legal database
            </label>

            {/* Collapsible options */}
            <div className="search-options-wrapper">
              <button
                type="button"
                className="options-toggle"
                onClick={() => setOptionsOpen((v) => !v)}
                aria-expanded={optionsOpen}
                id="toggle-search-options"
              >
                <span className={`options-chevron ${optionsOpen ? "open" : ""}`}>▶</span>
                Search Options &amp; Scope
              </button>

              {optionsOpen && (
                <div className="search-options-panel">
                  <div className="options-columns">

                    <div className="options-col">
                      <p className="options-col-label">Court Level</p>
                      {COURT_OPTIONS.map((c) => (
                        <label key={c} className="filter-check-label">
                          <input
                            type="checkbox"
                            checked={!!searchFilters.courts[c]}
                            onChange={() =>
                              setSearchFilters((f) => ({
                                ...f,
                                courts: { ...f.courts, [c]: !f.courts[c] },
                              }))
                            }
                          />
                          {c}
                        </label>
                      ))}
                    </div>

                    <div className="options-col">
                      <p className="options-col-label">Content Type</p>
                      {CONTENT_OPTIONS.map((t) => (
                        <label key={t} className="filter-check-label">
                          <input
                            type="checkbox"
                            checked={!!searchFilters.content[t]}
                            onChange={() =>
                              setSearchFilters((f) => ({
                                ...f,
                                content: { ...f.content, [t]: !f.content[t] },
                              }))
                            }
                          />
                          {t}
                        </label>
                      ))}
                    </div>

                    <div className="options-col">
                      <p className="options-col-label">Jurisdiction</p>
                      <select
                        className="jurisdiction-select"
                        id="jurisdiction-select"
                        value={searchFilters.jurisdiction}
                        onChange={(e) =>
                          setSearchFilters((f) => ({
                            ...f,
                            jurisdiction: e.target.value,
                          }))
                        }
                      >
                        <option value="all">All India</option>
                        <option value="state">State specific</option>
                      </select>

                      <p className="options-col-label" style={{ marginTop: "1.25rem" }}>
                        Year Range
                      </p>
                      <div className="year-range-row">
                        <input
                          type="number"
                          className="year-input"
                          value={searchFilters.yearFrom}
                          min={1800}
                          max={searchFilters.yearTo}
                          onChange={(e) =>
                            setSearchFilters((f) => ({
                              ...f,
                              yearFrom: Number(e.target.value),
                            }))
                          }
                          aria-label="From year"
                        />
                        <span>–</span>
                        <input
                          type="number"
                          className="year-input"
                          value={searchFilters.yearTo}
                          min={searchFilters.yearFrom}
                          max={new Date().getFullYear()}
                          onChange={(e) =>
                            setSearchFilters((f) => ({
                              ...f,
                              yearTo: Number(e.target.value),
                            }))
                          }
                          aria-label="To year"
                        />
                      </div>
                    </div>

                    <div className="options-col">
                      <p className="options-col-label">
                        Relevance threshold:{" "}
                        <strong>{searchFilters.relevanceThreshold}%</strong>
                      </p>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={searchFilters.relevanceThreshold}
                        onChange={(e) =>
                          setSearchFilters((f) => ({
                            ...f,
                            relevanceThreshold: Number(e.target.value),
                          }))
                        }
                        className="relevance-slider"
                        aria-label="Relevance threshold"
                      />
                    </div>

                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn search-btn"
              id="search-submit-btn"
              disabled={loading || !queryText.trim()}
            >
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Searching…
                </>
              ) : (
                "SEARCH DATABASE"
              )}
            </button>
          </form>
        </section>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        {/* ── Results (only after search) ───────────────────────────────── */}
        {(loading || hasResult) && (
          <section className="results-section">

            {/* Header row: count + confidence badge */}
            <div className="results-header-row">
              {loading ? (
                <div className="sk-line sk-count" aria-hidden="true" />
              ) : (
                <div className="results-meta">
                  <span className="results-count">
                    {cards.length} result{cards.length !== 1 ? "s" : ""} found
                  </span>
                  <span
                    className={`confidence-badge ${confidenceClass(result.confidence_score)}`}
                  >
                    {confidenceLabel(result.confidence_score)} confidence —{" "}
                    {Math.round(result.confidence_score * 100)}%
                  </span>
                  {result.conflicts_detected && (
                    <span className="conflict-warning-badge">⚠ Conflicts detected</span>
                  )}
                </div>
              )}
            </div>

            {/* Warnings */}
            {!loading && result?.warnings?.length > 0 && (
              <div className="result-warnings-box">
                {result.warnings.map((w, i) => (
                  <p key={i} className="result-warning-item">
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}

            {/* Temporal context */}
            {!loading && result?.temporal_context && (
              <div className="temporal-context-bar">
                🕐 <em>{result.temporal_context}</em>
              </div>
            )}

            {/* Tabs */}
            <div className="results-tabs" role="tablist">
              {RESULT_TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`results-tab ${activeTab === tab ? "results-tab-active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                  id={`tab-${tab.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Body: sidebar + cards */}
            <div className="results-body">
              <FilterSidebar filters={sideFilters} onChange={setSideFilters} />

              <div className="results-cards">
                {loading ? (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                ) : pagedCards.length > 0 ? (
                  pagedCards.map(({ source, claim, conflicts }) => (
                    <ResultCard
                      key={source?.id ?? claim?.claim_id}
                      source={source}
                      claim={claim}
                      conflicts={conflicts}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No results match your current filters.
                  </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div
                    className="pagination"
                    role="navigation"
                    aria-label="Results pagination"
                  >
                    <button
                      className="btn btn-secondary pagination-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      id="pagination-prev"
                    >
                      ← Previous
                    </button>
                    <span className="pagination-info">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="btn btn-secondary pagination-btn"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      id="pagination-next"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>
            </div>

          </section>
        )}

      </div>
    </AppShell>
  );
}
