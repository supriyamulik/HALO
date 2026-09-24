/**
 * src/pages/ResearchPage.jsx
 * ──────────────────────────
 * Full Research Interface for HALO (Nyaya Sahayak).
 *
 * Implements:
 *   - Query input card with 1px border, Newsreader/Plus Jakarta typography,
 *     and curated legal scenario chips with accent hover.
 *   - Search Options & Scope collapsible with smooth 200ms animation and accent controls.
 *   - Confident primary action button with clean pulse animation during loading.
 *   - Clean horizontal pipeline stepper (Query Expansion -> Retrieval -> NLI -> Conflict -> Synthesis).
 *   - Result cards with 3-tier relevance badges and monospace citation lines.
 *   - Filter sidebar harmonized with main options styling.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { submitQuery, getResearchResult } from "../api/researchApi";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import "./ResearchPage.css";

// ─── Constants & Pre-curated Scenarios ────────────────────────────────────────

const COURT_OPTIONS = ["Supreme Court", "High Courts", "Tribunals"];
const CONTENT_OPTIONS = ["Acts & Sections", "Legal Commentary"];
const RESULT_TABS = ["All Results", "Cases", "Articles", "Commentary"];

const SCENARIO_CHIPS = [
  "Section 138 NI Act: Notice validity & cause of action",
  "Article 21: Right to Privacy & digital evidence admissibility",
  "IBC Section 9: Pre-existing dispute threshold for operational debt",
  "Order XIX CPC: Evidentiary weight of affidavit without cross-examination",
];

const PIPELINE_STAGES = [
  "Query Expansion",
  "Retrieval",
  "NLI Entailment",
  "Conflict Resolution",
  "Synthesis",
];

const DEFAULT_FILTERS = {
  courts: { "Supreme Court": true, "High Courts": true, Tribunals: true },
  content: { "Acts & Sections": true, "Legal Commentary": true },
  jurisdiction: "all",
  yearFrom: 1950,
  yearTo: new Date().getFullYear(),
  relevanceThreshold: 60,
};

// ─── Relevance Badge Helper ───────────────────────────────────────────────────

function getRelevanceBadge(score) {
  const pct = Math.round(score * 100);
  if (pct >= 90) {
    return {
      label: `${pct}% relevant`,
      className: "relevance-tier-verified",
    };
  }
  if (pct >= 70) {
    return {
      label: `${pct}% relevant`,
      className: "relevance-tier-accent",
    };
  }
  return {
    label: `${pct}% relevant`,
    className: "relevance-tier-warning",
  };
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

function ResultCard({ source, claim, conflicts, queryId }) {
  const navigate = useNavigate();
  const relevance = source?.relevance ?? 0.85;
  const badge = getRelevanceBadge(relevance);

  return (
    <article className="result-card">
      <div className="result-card-top">
        <h3 className="result-title">
          {source?.title ?? claim?.citation?.case_name ?? "Supreme Court of India Ruling"}
        </h3>
        <StatusBadge
          variant={relevance >= 0.9 ? "verified" : relevance >= 0.7 ? "accent" : "warning"}
          label={`${Math.round(relevance * 100)}% relevant`}
          size="sm"
        />
      </div>

      <div className="result-meta">
        <span className="result-court">
          {source?.court ?? claim?.citation?.court ?? "Supreme Court of India"}
        </span>
        <span className="result-sep">·</span>
        <span className="result-year">
          {source?.year ?? claim?.citation?.date?.slice(0, 4) ?? "2023"}
        </span>
        {conflicts && (
          <>
            <span className="result-sep">·</span>
            <span className="result-conflict-flag">
              <AlertTriangle size={12} style={{ marginRight: 4 }} />
              Conflict detected
            </span>
          </>
        )}
      </div>

      {claim && <p className="result-excerpt">{claim.claim_text}</p>}

      {claim?.citation && (
        <div className="result-citation-block">
          <span className="citation-tag">Canonical Citation</span>
          <code className="citation-code">
            {claim.citation.citation_no}
            {claim.citation.paragraph ? ` · ${claim.citation.paragraph}` : ""}
          </code>
        </div>
      )}

      <div className="result-actions">
        <button
          type="button"
          className="btn btn-secondary result-btn"
          id={`view-case-${source?.id ?? claim?.claim_id}`}
          onClick={() => {
            if (queryId) {
              navigate(`/research/${queryId}`);
            }
          }}
        >
          <BookOpen size={14} style={{ marginRight: 5 }} />
          View Full Case
        </button>
        <button
          type="button"
          className="btn btn-ghost result-btn"
          id={`save-citation-${source?.id ?? claim?.claim_id}`}
        >
          <Bookmark size={14} style={{ marginRight: 5 }} />
          Save Citation
        </button>
      </div>
    </article>
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
    <aside className="filter-sidebar" aria-label="Research filters">
      <div className="filter-header">
        <SlidersHorizontal size={15} />
        <h3 className="filter-heading">Filter Results</h3>
      </div>

      <div className="filter-group">
        <p className="filter-group-label">Court Level</p>
        {COURT_OPTIONS.map((c) => (
          <label key={c} className="filter-check-label">
            <input
              type="checkbox"
              checked={!!filters.courts[c]}
              onChange={() => toggleCourt(c)}
            />
            <span>{c}</span>
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
            <span>{t}</span>
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
          <span className="year-range-sep">–</span>
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
        <div className="slider-label-row">
          <p className="filter-group-label">Relevance threshold</p>
          <strong className="slider-val-badge">{filters.relevanceThreshold}%</strong>
        </div>
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  const navigate = useNavigate();

  // Search state
  const [queryText, setQueryText] = useState("");
  const [aiSynthesis, setAiSynthesis] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ ...DEFAULT_FILTERS });

  // Execution state
  const [loading, setLoading] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("All Results");
  const [sideFilters, setSideFilters] = useState({ ...DEFAULT_FILTERS });
  const [page, setPage] = useState(1);

  // Stepper progression simulation during search
  useEffect(() => {
    let timer;
    if (loading) {
      setCurrentStageIndex(0);
      timer = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < PIPELINE_STAGES.length - 1) return prev + 1;
          return prev;
        });
      }, 700);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [loading]);

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
      setCurrentStageIndex(PIPELINE_STAGES.length - 1);
      setResult(data);
    } catch (err) {
      setError(err.message ?? "Search execution failed. Please verify connection.");
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
        {/* ── Page Header ── */}
        <PageHeader title="Legal Research Workstation" />

        {/* ── Query Input Card ── */}
        <section className="search-section" aria-label="Legal Inquiry Form">
          <form className="search-form" onSubmit={handleSearch} id="research-search-form">
            <div className="textarea-wrapper">
              <label className="search-textarea-label" htmlFor="query-input">
                Formulate your legal inquiry or proposition
              </label>
              <textarea
                id="query-input"
                className="search-textarea"
                rows={3}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g. Can an aggrieved home-buyer claim refund under RERA during ongoing insolvency proceedings under IBC?"
                disabled={loading}
                required
              />
            </div>

            {/* Legal Scenario Chips */}
            <div className="scenario-chips-row">
              <span className="scenario-chips-label">Scenario Presets:</span>
              <div className="scenario-chips-list">
                {SCENARIO_CHIPS.map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    className="scenario-chip"
                    onClick={() => setQueryText(chip)}
                    disabled={loading}
                    title="Load scenario into query input"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <label className="ai-synthesis-label">
              <input
                type="checkbox"
                id="ai-synthesis-check"
                checked={aiSynthesis}
                onChange={(e) => setAiSynthesis(e.target.checked)}
                disabled={loading}
              />
              <span>Enable neural-symbolic NLI entailment &amp; Article 141 conflict detection</span>
            </label>

            {/* Collapsible Search Options */}
            <div className="search-options-wrapper">
              <button
                type="button"
                className="options-toggle"
                onClick={() => setOptionsOpen((v) => !v)}
                aria-expanded={optionsOpen}
                id="toggle-search-options"
              >
                <ChevronDown
                  size={16}
                  className={`options-chevron ${optionsOpen ? "open" : ""}`}
                />
                <span>Search Options &amp; Jurisdictional Scope</span>
              </button>

              <div className={`search-options-collapse ${optionsOpen ? "is-open" : "is-closed"}`}>
                <div className="search-options-panel">
                  <div className="options-columns">
                    {/* Col 1: Courts */}
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
                          <span>{c}</span>
                        </label>
                      ))}
                    </div>

                    {/* Col 2: Content Type */}
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
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>

                    {/* Col 3: Jurisdiction & Year */}
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
                        <option value="all">All India (Apex + High Courts)</option>
                        <option value="sc">Supreme Court of India (Apex Only)</option>
                        <option value="delhi">Delhi High Court</option>
                        <option value="bombay">Bombay High Court</option>
                        <option value="madras">Madras High Court</option>
                      </select>

                      <p className="options-col-label" style={{ marginTop: "1rem" }}>
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
                        <span className="year-range-sep">–</span>
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

                    {/* Col 4: Relevance Threshold */}
                    <div className="options-col">
                      <div className="slider-label-row">
                        <p className="options-col-label">Relevance threshold</p>
                        <strong className="slider-val-badge">
                          {searchFilters.relevanceThreshold}%
                        </strong>
                      </div>
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
              </div>
            </div>

            {/* Primary Search Button with Pulse Animation */}
            <div className="search-actions-row">
              <button
                type="submit"
                className="btn btn-primary search-submit-btn"
                id="search-submit-btn"
                disabled={loading || !queryText.trim()}
              >
                {loading ? (
                  <span className="btn-loading-state">
                    <span className="pulse-dots">
                      <span className="pulse-dot" />
                      <span className="pulse-dot" />
                      <span className="pulse-dot" />
                    </span>
                    <span>Executing pipeline…</span>
                  </span>
                ) : (
                  <>
                    <Search size={16} style={{ marginRight: 6 }} />
                    <span>Search Legal Database</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ── Pipeline Stepper (Visible during execution and after result) ── */}
        {(loading || hasResult) && (
          <section className="pipeline-stepper-card" aria-label="Verification Pipeline Stages">
            <div className="stepper-track">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isCompleted = !loading || idx < currentStageIndex;
                const isActive = loading && idx === currentStageIndex;
                const isUpcoming = !loading ? false : idx > currentStageIndex;

                let stepClass = "step-upcoming";
                if (isCompleted) stepClass = "step-completed";
                if (isActive) stepClass = "step-active";

                return (
                  <div key={stage} className={`stepper-node ${stepClass}`}>
                    <div className="node-marker">
                      {isCompleted ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <span className="node-number">{idx + 1}</span>
                      )}
                    </div>
                    <span className="node-label">{stage}</span>
                    {idx < PIPELINE_STAGES.length - 1 && (
                      <div
                        className={`stepper-connector ${
                          isCompleted ? "connector-completed" : ""
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Results Section ── */}
        {(loading || hasResult) && (
          <section className="results-section">
            {/* Header row: count + confidence badge */}
            <div className="results-header-row">
              {loading ? (
                <div className="sk-line sk-count" aria-hidden="true" />
              ) : (
                <div className="results-meta">
                  <span className="results-count">
                    {cards.length} authoritative {cards.length === 1 ? "authority" : "authorities"} retrieved
                  </span>
                  <StatusBadge
                    variant="verified"
                    icon={<CheckCircle2 size={13} style={{ marginRight: 4 }} />}
                    label={`High confidence (${Math.round((result.confidence_score ?? 0.88) * 100)}%)`}
                  />
                  {result.conflicts_detected && (
                    <StatusBadge
                      variant="conflict"
                      icon={<AlertTriangle size={13} style={{ marginRight: 4 }} />}
                      label="Article 141 Conflict Flagged"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Warnings */}
            {!loading && result?.warnings?.length > 0 && (
              <div className="result-warnings-box">
                {result.warnings.map((w, i) => (
                  <p key={i} className="result-warning-item">
                    <AlertTriangle size={14} style={{ marginRight: 6 }} />
                    {w}
                  </p>
                ))}
              </div>
            )}

            {/* Temporal Context */}
            {!loading && result?.temporal_context && (
              <div className="temporal-context-bar">
                <Clock size={14} style={{ marginRight: 6 }} />
                <span>{result.temporal_context}</span>
              </div>
            )}

            {/* Category Filter Tabs */}
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

            {/* Body: Sidebar Filters + Cards */}
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
                      queryId={result.query_id}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    No judgments or statutory sections match your current filters.
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
                      type="button"
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
                      type="button"
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
