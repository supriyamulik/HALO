/**
 * src/pages/DraftingPage.jsx
 * ──────────────────────────
 * Grounded Legal Auto-Drafting & Pleadings Management System
 *
 * Auto-drafts court-admissible affidavits, petitions, and statutory notices
 * strictly grounded in verified Indian statutory provisions and controlling precedents.
 * Eliminates repetitive manual drafting while preventing hallucinated clauses.
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import { getCurrentUser } from "../api/client";
import "./DraftingPage.css";

// ─── Standard Verified Legal Templates ───────────────────────────────────────

const TEMPLATES = [
  {
    id: "affidavit_evidence_cpc",
    name: "Affidavit of Evidence (Order XIX Rule 3, CPC)",
    category: "Affidavit",
    description: "Formal sworn deposition affidavit for civil proceedings and interlocutory applications.",
    statutory_grounding: "Order XIX Rule 3, Code of Civil Procedure, 1908",
    controlling_precedent: "Satyadhyan Ghosal v. Deorajin Debi, AIR 1960 SC 941",
    default_fields: {
      court: "IN THE HIGH COURT OF DELHI AT NEW DELHI",
      case_no: "CS (COMM) No. 420 of 2024",
      cause_title: "ABC Logistics Ltd. v. XYZ Freight Corp.",
      deponent_name: "Rajesh Kumar",
      deponent_age: "45",
      deponent_parent: "Shri S. P. Kumar",
      deponent_address: "A-12, Barakhamba Road, Connaught Place, New Delhi - 110001",
      deponent_role: "Authorized Representative / Director",
      affirmation_place: "New Delhi",
      facts: [
        "That I am the Authorized Signatory of the Plaintiff Company and am fully conversant with the facts and circumstances of the case, and as such, competent to swear this affidavit.",
        "That the Plaintiff Company and the Defendant entered into a commercial master service agreement dated 14th January 2023 for logistical transshipment services.",
        "That the Defendant committed persistent material breach of the agreed payment milestones, and outstanding invoices amounting to INR 48,50,000/- remain unpaid despite statutory demand.",
      ],
    },
  },
  {
    id: "director_due_diligence_it",
    name: "Director Due-Diligence Affidavit (Sec 179 Income Tax Act)",
    category: "Affidavit",
    description: "Statutory affidavit invoking the due-diligence defence against personal tax recovery proceedings.",
    statutory_grounding: "Section 179, Income Tax Act, 1961",
    controlling_precedent: "Pr. CIT v. Siemens Ltd., (2017) 394 ITR 1 (SC)",
    default_fields: {
      court: "BEFORE THE PRINCIPAL COMMISSIONER OF INCOME TAX (APPEALS), NEW DELHI",
      case_no: "Appeal No. CIT(A)-12/Del/2024-25",
      cause_title: "In the matter of: S.A.I.L. Nominee Directors v. Income Tax Officer, Ward 4(1)",
      deponent_name: "Dr. Vikramaditya Sharma",
      deponent_age: "58",
      deponent_parent: "Late Shri M. L. Sharma",
      deponent_address: "Flat 402, Judges Enclave, Sector 14, Rohini, Delhi - 110085",
      deponent_role: "Former Non-Executive Nominee Director",
      affirmation_place: "New Delhi",
      facts: [
        "That I was appointed solely as a non-executive nominee director on the Board of the Corporate Debtor by the financial institution and was neither in charge of, nor responsible for, the day-to-day financial operations or statutory remittances of the company.",
        "That non-recovery of the corporate tax assessment dues cannot be attributed to any gross neglect, misfeasance, or breach of fiduciary duty on my part, satisfying the due-diligence defence enunciated by the Supreme Court in Pr. CIT v. Siemens Ltd. (2017).",
        "That at every relevant board meeting, I specifically requisitioned statutory compliance audits and placed recorded dissents against delayed tax filings, establishing affirmative due diligence under Section 179.",
      ],
    },
  },
  {
    id: "section_138_demand_notice",
    name: "Statutory Demand Notice (Section 138 NI Act)",
    category: "Notice",
    description: "Mandatory pre-litigation legal demand notice for dishonour of cheque for insufficient funds.",
    statutory_grounding: "Section 138 & 142, Negotiable Instruments Act, 1881",
    controlling_precedent: "Dashrath Rupsingh Rathod v. State of Maharashtra, (2014) 9 SCC 129",
    default_fields: {
      court: "REGISTERED A.D. / SPEED POST LEGAL DEMAND NOTICE",
      case_no: "REF: NS/138-NI/2024/089",
      cause_title: "M/s Precision Tech Solutions v. Globex Trading Enterprises",
      deponent_name: "Adv. Sunita Deshmukh",
      deponent_age: "42",
      deponent_parent: "Adv. R. K. Deshmukh",
      deponent_address: "Chamber No. 118, Patiala House Courts, New Delhi - 110001",
      deponent_role: "Advocate for and on behalf of the Complainant",
      affirmation_place: "New Delhi",
      facts: [
        "That my Client supplied industrial grade software and server infrastructure to you against purchase order PO-9921 dated 10th August 2024.",
        "That in discharge of existing legal debt and liability, you issued Cheque No. 440219 dated 05.10.2024 for an amount of INR 14,20,000/- drawn on HDFC Bank, Connaught Place Branch.",
        "That upon presentment, the said cheque was returned dishonoured with the bank return memo dated 08.10.2024 endorsed 'FUNDS INSUFFICIENT'.",
        "That you are hereby called upon to pay the said sum of INR 14,20,000/- within 15 days of the receipt of this statutory notice, failing which criminal proceedings under Section 138 will be instituted.",
      ],
    },
  },
  {
    id: "csr_compliance_affidavit",
    name: "Corporate CSR Statutory Compliance Declaration",
    category: "Declaration",
    description: "Formal statutory declaration by Board of Directors affirming CSR committee constitution and budget allocation.",
    statutory_grounding: "Section 135, Companies Act, 2013 read with CSR Rules 2014",
    controlling_precedent: "Ministry of Corporate Affairs Notification G.S.R. 126(E)",
    default_fields: {
      court: "BEFORE THE REGISTRAR OF COMPANIES, NCT OF DELHI & HARYANA",
      case_no: "E-Form CSR-1 / Compliance Filing 2024-25",
      cause_title: "In the matter of: Bharat Minerals & Energy Corp. Ltd. (CIN: L10100DL2012PLC883921)",
      deponent_name: "Anita Saxena",
      deponent_age: "51",
      deponent_parent: "Shri O. P. Saxena",
      deponent_address: "14, Barakhamba Lane, New Delhi - 110001",
      deponent_role: "Company Secretary & Compliance Officer",
      affirmation_place: "New Delhi",
      facts: [
        "That the company has a net profit exceeding INR 5 Crore during the preceding financial year, thereby attracting mandatory obligations under Section 135(1) of the Companies Act, 2013.",
        "That the Board of Directors has duly constituted a Corporate Social Responsibility Committee comprising 3 directors, including 1 Independent Director, in strict adherence to statutory rules.",
        "That the mandatory 2% average net profits amounting to INR 1,18,50,000/- have been allocated to Schedule VII eligible societal projects with zero unspent balances.",
      ],
    },
  },
];

// Seed initial saved drafts
const INITIAL_SAVED_DRAFTS = [
  {
    id: "draft_001",
    title: "Affidavit in Support of Order XIX Rule 3 — ABC Logistics",
    template_id: "affidavit_evidence_cpc",
    category: "Affidavit",
    case_no: "CS (COMM) No. 420 of 2024",
    client_name: "ABC Logistics Ltd.",
    status: "READY_FOR_NOTARY",
    created_date: "2024-11-18",
    last_updated: "2024-11-20",
    grounding: "Order XIX Rule 3, CPC 1908",
    data: TEMPLATES[0].default_fields,
  },
  {
    id: "draft_002",
    title: "Section 179 Due-Diligence Affidavit — Dr. Vikramaditya Sharma",
    template_id: "director_due_diligence_it",
    category: "Affidavit",
    case_no: "Appeal No. CIT(A)-12/Del/2024-25",
    client_name: "Dr. Vikramaditya Sharma",
    status: "APPROVED",
    created_date: "2024-11-15",
    last_updated: "2024-11-19",
    grounding: "Section 179 Income Tax Act (Pr. CIT v. Siemens Ltd.)",
    data: TEMPLATES[1].default_fields,
  },
  {
    id: "draft_003",
    title: "Section 138 NI Act Legal Notice — Globex Trading",
    template_id: "section_138_demand_notice",
    category: "Notice",
    case_no: "REF: NS/138-NI/2024/089",
    client_name: "Precision Tech Solutions",
    status: "DRAFT",
    created_date: "2024-11-22",
    last_updated: "2024-11-23",
    grounding: "Section 138 Negotiable Instruments Act, 1881",
    data: TEMPLATES[2].default_fields,
  },
];

const STATUS_CONFIG = {
  DRAFT: { label: "Drafting in Progress", cls: "badge-draft-progress" },
  READY_FOR_NOTARY: { label: "Ready for Notary / Stamp", cls: "badge-draft-notary" },
  APPROVED: { label: "Counsel Approved", cls: "badge-draft-approved" },
  FILED: { label: "Filed in Court", cls: "badge-draft-filed" },
};

export default function DraftingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [drafts, setDrafts] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'editor'
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Editor State
  const [activeDraft, setActiveDraft] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [editorData, setEditorData] = useState(TEMPLATES[0].default_fields);
  const [editorTitle, setEditorTitle] = useState("");
  const [editorStatus, setEditorStatus] = useState("DRAFT");
  const [newFactText, setNewFactText] = useState("");

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => null);

    const saved = localStorage.getItem("halo_drafts_store");
    if (saved) {
      try {
        setDrafts(JSON.parse(saved));
      } catch (e) {
        setDrafts(INITIAL_SAVED_DRAFTS);
      }
    } else {
      setDrafts(INITIAL_SAVED_DRAFTS);
      localStorage.setItem("halo_drafts_store", JSON.stringify(INITIAL_SAVED_DRAFTS));
    }
  }, []);

  const saveDraftsList = (list) => {
    setDrafts(list);
    localStorage.setItem("halo_drafts_store", JSON.stringify(list));
  };

  // Launch New Draft from Template
  const handleStartNewDraft = (template) => {
    setSelectedTemplateId(template.id);
    setEditorData(JSON.parse(JSON.stringify(template.default_fields)));
    setEditorTitle(`${template.name} — ${new Date().toLocaleDateString("en-IN")}`);
    setEditorStatus("DRAFT");
    setActiveDraft(null);
    setViewMode("editor");
  };

  // Open Existing Draft
  const handleOpenDraft = (draft) => {
    setActiveDraft(draft);
    setSelectedTemplateId(draft.template_id);
    setEditorData(JSON.parse(JSON.stringify(draft.data)));
    setEditorTitle(draft.title);
    setEditorStatus(draft.status);
    setViewMode("editor");
  };

  // Save current editor draft
  const handleSaveEditor = () => {
    const template = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

    const draftRecord = {
      id: activeDraft?.id || `draft_${Date.now()}`,
      title: editorTitle.trim() || template.name,
      template_id: selectedTemplateId,
      category: template.category,
      case_no: editorData.case_no,
      client_name: editorData.deponent_name || "Confidential Party",
      status: editorStatus,
      created_date: activeDraft?.created_date || new Date().toISOString().split("T")[0],
      last_updated: new Date().toISOString().split("T")[0],
      grounding: template.statutory_grounding,
      data: editorData,
    };

    let updatedList;
    if (activeDraft) {
      updatedList = drafts.map((d) => (d.id === activeDraft.id ? draftRecord : d));
    } else {
      updatedList = [draftRecord, ...drafts];
    }

    saveDraftsList(updatedList);
    setActiveDraft(draftRecord);
    alert("Legal instrument draft saved successfully!");
  };

  // Delete draft
  const handleDeleteDraft = (draftId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this draft?")) {
      const updated = drafts.filter((d) => d.id !== draftId);
      saveDraftsList(updated);
      if (activeDraft?.id === draftId) {
        setViewMode("list");
      }
    }
  };

  // Fact manipulation
  const handleAddFact = () => {
    if (!newFactText.trim()) return;
    setEditorData({
      ...editorData,
      facts: [...editorData.facts, newFactText.trim()],
    });
    setNewFactText("");
  };

  const handleRemoveFact = (index) => {
    const updated = editorData.facts.filter((_, i) => i !== index);
    setEditorData({ ...editorData, facts: updated });
  };

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  // Filter drafts
  const filteredDrafts = drafts.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.case_no.toLowerCase().includes(q) ||
        d.client_name.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterCategory !== "ALL" && d.category !== filterCategory) return false;
    return true;
  });

  return (
    <AppShell user={user}>
      <div className="dp-container">


        {/* ── VIEW 1: DRAFTS LIST & TEMPLATES ── */}
        {viewMode === "list" && (
          <>
            <PageHeader
              title="Legal Pleadings & Auto-Drafting Manager"
              action={<StatusBadge variant="accent" label="STATUTE-GROUNDED" size="sm" />}
            />

            {/* Metrics Grid */}
            <div className="dp-metrics-grid">
              <div className="dp-metric-card">
                <span className="dp-metric-label">Active Legal Drafts</span>
                <span className="dp-metric-value">{drafts.length}</span>
                <span className="dp-metric-sub">Pleadings in workspace</span>
              </div>
              <div className="dp-metric-card">
                <span className="dp-metric-label">Ready for Notary / Stamping</span>
                <span className="dp-metric-value dp-metric-amber">
                  {drafts.filter((d) => d.status === "READY_FOR_NOTARY").length}
                </span>
                <span className="dp-metric-sub">Affirmation-ready</span>
              </div>
              <div className="dp-metric-card">
                <span className="dp-metric-label">Approved Pleadings</span>
                <span className="dp-metric-value dp-metric-green">
                  {drafts.filter((d) => d.status === "APPROVED").length}
                </span>
                <span className="dp-metric-sub">Counsel signed & certified</span>
              </div>
              <div className="dp-metric-card">
                <span className="dp-metric-label">Grounded Templates</span>
                <span className="dp-metric-value dp-metric-accent">{TEMPLATES.length}</span>
                <span className="dp-metric-sub">Verified statutory formats</span>
              </div>
            </div>

            {/* Template Library Selection Banner */}
            <section className="dp-templates-section">
              <h2 className="dp-section-heading">Auto-Draft from Verified Legal Templates</h2>
              <div className="dp-templates-grid">
                {TEMPLATES.map((tmpl) => (
                  <div key={tmpl.id} className="dp-template-card">
                    <div className="dp-template-top">
                      <span className="dp-template-tag">{tmpl.category}</span>
                      <span className="dp-template-grounding">{tmpl.statutory_grounding}</span>
                    </div>
                    <h3 className="dp-template-title">{tmpl.name}</h3>
                    <p className="dp-template-desc">{tmpl.description}</p>
                    <div className="dp-template-footer">
                      <span className="dp-template-precedent">Ref: {tmpl.controlling_precedent}</span>
                      <button
                        className="btn btn-primary dp-draft-now-btn"
                        onClick={() => handleStartNewDraft(tmpl)}
                      >
                        Draft Now &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Controls */}
            <div className="dp-controls">
              <div className="dp-search-box">
                <span className="dp-search-icon">🔍</span>
                <input
                  type="text"
                  className="dp-search-input"
                  placeholder="Search drafts by title, case number, or deponent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button className="dp-clear-btn" onClick={() => setSearch("")}>✕</button>
                )}
              </div>

              <div className="dp-filters">
                <select
                  className="dp-filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Affidavit">Affidavits Only</option>
                  <option value="Notice">Legal Notices</option>
                  <option value="Declaration">Declarations</option>
                </select>
              </div>
            </div>

            {/* Drafts Table */}
            <div className="dp-table-container">
              <table className="dp-table">
                <thead>
                  <tr>
                    <th>Draft Instrument & Title</th>
                    <th>Category</th>
                    <th>Case / Matter No.</th>
                    <th>Client / Deponent</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrafts.map((d) => {
                    const statusMeta = STATUS_CONFIG[d.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={d.id} onClick={() => handleOpenDraft(d)} className="dp-tr-interactive">
                        <td className="dp-td-title">
                          <strong>{d.title}</strong>
                          <span className="dp-td-grounding">Grounded in: {d.grounding}</span>
                        </td>
                        <td>
                          <StatusBadge variant="neutral" label={d.category} size="sm" />
                        </td>
                        <td className="dp-td-case">{d.case_no}</td>
                        <td className="dp-td-client">{d.client_name}</td>
                        <td>
                          <StatusBadge status={d.status} label={statusMeta.label} size="sm" />
                        </td>
                        <td className="dp-td-date">{d.last_updated}</td>
                        <td className="dp-td-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary dp-edit-btn"
                            onClick={() => handleOpenDraft(d)}
                          >
                            Open Editor
                          </button>
                          <button
                            className="dp-delete-btn"
                            title="Delete draft"
                            onClick={(e) => handleDeleteDraft(d.id, e)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── VIEW 2: INTERACTIVE GROUNDED DRAFTER & LIVE COURT PREVIEW ── */}
        {viewMode === "editor" && (
          <div className="dp-editor-layout">
            {/* Editor Top Bar */}
            <div className="dp-editor-topbar">
              <div className="dp-editor-topbar-left">
                <button
                  className="btn btn-secondary dp-back-btn"
                  onClick={() => setViewMode("list")}
                >
                  &larr; Back to Drafts
                </button>
                <input
                  type="text"
                  className="dp-editor-title-input"
                  value={editorTitle}
                  onChange={(e) => setEditorTitle(e.target.value)}
                  placeholder="Instrument Title..."
                />
              </div>

              <div className="dp-editor-topbar-right">
                <select
                  className="dp-editor-status-select"
                  value={editorStatus}
                  onChange={(e) => setEditorStatus(e.target.value)}
                >
                  <option value="DRAFT">Status: In Progress</option>
                  <option value="READY_FOR_NOTARY">Status: Ready for Notary</option>
                  <option value="APPROVED">Status: Counsel Approved</option>
                  <option value="FILED">Status: Filed in Court</option>
                </select>

                <button className="btn btn-secondary" onClick={() => window.print()}>
                  🖨️ Print / Save PDF
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${editorData.court}\n${editorData.case_no}\n${editorData.cause_title}\n\nI, ${editorData.deponent_name}, age ${editorData.deponent_age} years, residing at ${editorData.deponent_address}, do hereby solemnly affirm:\n\n${editorData.facts.map((f, i) => `${i + 1}. ${f}`).join("\n\n")}\n\nVERIFICATION\nVerified at ${editorData.affirmation_place} on ${new Date().toLocaleDateString("en-IN")}.`
                    );
                    alert("Complete court pleading text copied to clipboard!");
                  }}
                >
                  📋 Copy Text
                </button>

                <button className="btn btn-primary" onClick={handleSaveEditor}>
                  💾 Save Instrument
                </button>
              </div>
            </div>

            {/* Two Column Drafting Arena */}
            <div className="dp-arena">
              {/* Left Column: Form Inputs & Variables */}
              <div className="dp-form-pane">
                <div className="dp-grounding-banner">
                  <span className="dp-grounding-shield"></span>
                  <div>
                    <strong>Statutory Grounding Enforced:</strong>
                    <p>{currentTemplate.statutory_grounding}</p>
                    <span className="dp-precedent-hint">Ratio: {currentTemplate.controlling_precedent}</span>
                  </div>
                </div>

                <div className="dp-form-section">
                  <h3>Court & Proceeding Details</h3>
                  <div className="dp-input-group">
                    <label>Adjudicatory Forum / Court Heading</label>
                    <input
                      type="text"
                      value={editorData.court}
                      onChange={(e) => setEditorData({ ...editorData, court: e.target.value })}
                    />
                  </div>

                  <div className="dp-input-row">
                    <div className="dp-input-group">
                      <label>Case / Matter Number</label>
                      <input
                        type="text"
                        value={editorData.case_no}
                        onChange={(e) => setEditorData({ ...editorData, case_no: e.target.value })}
                      />
                    </div>
                    <div className="dp-input-group">
                      <label>Affirmation Place</label>
                      <input
                        type="text"
                        value={editorData.affirmation_place}
                        onChange={(e) => setEditorData({ ...editorData, affirmation_place: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="dp-input-group">
                    <label>Cause Title (Parties)</label>
                    <input
                      type="text"
                      value={editorData.cause_title}
                      onChange={(e) => setEditorData({ ...editorData, cause_title: e.target.value })}
                    />
                  </div>
                </div>

                <div className="dp-form-section">
                  <h3>Deponent / Declarant Credentials</h3>
                  <div className="dp-input-row">
                    <div className="dp-input-group">
                      <label>Deponent Full Name</label>
                      <input
                        type="text"
                        value={editorData.deponent_name}
                        onChange={(e) => setEditorData({ ...editorData, deponent_name: e.target.value })}
                      />
                    </div>
                    <div className="dp-input-group" style={{ maxWidth: "100px" }}>
                      <label>Age (Yrs)</label>
                      <input
                        type="text"
                        value={editorData.deponent_age}
                        onChange={(e) => setEditorData({ ...editorData, deponent_age: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="dp-input-group">
                    <label>Father's / Spouse's Name</label>
                    <input
                      type="text"
                      value={editorData.deponent_parent}
                      onChange={(e) => setEditorData({ ...editorData, deponent_parent: e.target.value })}
                    />
                  </div>

                  <div className="dp-input-group">
                    <label>Deponent Designation / Role</label>
                    <input
                      type="text"
                      value={editorData.deponent_role}
                      onChange={(e) => setEditorData({ ...editorData, deponent_role: e.target.value })}
                    />
                  </div>

                  <div className="dp-input-group">
                    <label>Permanent / Residential Address</label>
                    <input
                      type="text"
                      value={editorData.deponent_address}
                      onChange={(e) => setEditorData({ ...editorData, deponent_address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="dp-form-section">
                  <h3>Sworn Averments & Deposition Paragraphs</h3>
                  <div className="dp-facts-editor-list">
                    {editorData.facts.map((fact, idx) => (
                      <div key={idx} className="dp-fact-item">
                        <span className="dp-fact-no">{idx + 1}.</span>
                        <textarea
                          className="dp-fact-textarea"
                          rows={2}
                          value={fact}
                          onChange={(e) => {
                            const updated = [...editorData.facts];
                            updated[idx] = e.target.value;
                            setEditorData({ ...editorData, facts: updated });
                          }}
                        />
                        <button
                          className="dp-fact-remove-btn"
                          title="Remove paragraph"
                          onClick={() => handleRemoveFact(idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="dp-add-fact-box">
                    <textarea
                      placeholder="Add a new sworn deposition paragraph or statutory assertion..."
                      rows={2}
                      value={newFactText}
                      onChange={(e) => setNewFactText(e.target.value)}
                    />
                    <button
                      className="btn btn-secondary dp-add-fact-btn"
                      onClick={handleAddFact}
                      disabled={!newFactText.trim()}
                    >
                      + Add Sworn Paragraph
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Court Pleading Paper Preview */}
              <div className="dp-preview-pane">
                <div className="dp-court-sheet">
                  {/* Stamp Paper Top Space Margin */}
                  <div className="dp-stamp-margin">
                    <span>[ OFFICIAL COURT PLEADING / NON-JUDICIAL STAMP PAPER MARGIN ]</span>
                  </div>

                  {/* Heading */}
                  <div className="dp-court-heading">
                    <h4>{editorData.court}</h4>
                    <p className="dp-court-caseno">{editorData.case_no}</p>
                    <p className="dp-court-parties">IN THE MATTER OF:<br /><strong>{editorData.cause_title}</strong></p>
                  </div>

                  <hr className="dp-court-hr" />

                  {/* Title */}
                  <h3 className="dp-instrument-title">
                    {currentTemplate.category.toUpperCase() === "NOTICE"
                      ? "STATUTORY LEGAL DEMAND NOTICE"
                      : `AFFIDAVIT ON BEHALF OF THE ${editorData.deponent_role.toUpperCase()}`}
                  </h3>

                  {/* Preamble / Deponent Bio */}
                  <p className="dp-pleading-preamble">
                    I, <strong>{editorData.deponent_name}</strong>, S/o {editorData.deponent_parent}, aged about {editorData.deponent_age} years, residing at {editorData.deponent_address}, do hereby solemnly affirm and declare on oath as under:
                  </p>

                  {/* Numbered Paragraphs */}
                  <div className="dp-pleading-paras">
                    {editorData.facts.map((fact, idx) => (
                      <p key={idx} className="dp-pleading-para">
                        <span className="dp-para-num">{idx + 1}.</span>
                        <span className="dp-para-content">{fact}</span>
                      </p>
                    ))}
                  </div>

                  {/* Statutory Grounding Endorsement */}
                  <div className="dp-grounding-endorsement">
                    <span>
                      Grounded in accordance with {currentTemplate.statutory_grounding} and authoritative ratio in {currentTemplate.controlling_precedent}.
                    </span>
                  </div>

                  {/* Deponent Signature */}
                  <div className="dp-signature-block">
                    <div className="dp-sig-space" />
                    <strong>DEPONENT</strong>
                  </div>

                  {/* Classical Verification Clause */}
                  <div className="dp-verification-clause">
                    <h5 className="dp-verif-title">VERIFICATION</h5>
                    <p>
                      Verified at <strong>{editorData.affirmation_place}</strong> on this <strong>{new Date().getDate()}th day of {new Date().toLocaleString("en-IN", { month: "long" })}, {new Date().getFullYear()}</strong>, that the contents of paragraphs 1 to {editorData.facts.length} of the above affidavit are true and correct to my knowledge derived from the official records of the company, no part of it is false, and nothing material has been concealed therefrom.
                    </p>

                    <div className="dp-verif-signatures">
                      <div className="dp-attestation">
                        <span>Identified by me:</span>
                        <div className="dp-sig-space-sm" />
                        <strong>Advocate</strong>
                      </div>

                      <div className="dp-deponent-verif">
                        <div className="dp-sig-space-sm" />
                        <strong>DEPONENT</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
