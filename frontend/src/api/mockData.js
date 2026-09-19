/**
 * src/api/mockData.js
 * ────────────────────
 * Frozen contract — these three objects define the canonical shape of
 * a research result returned by the backend pipeline.
 *
 * DO NOT change field names. When the real backend is ready, the only
 * thing that changes is researchApi.js — this file can be deleted or
 * kept as a test fixture.
 *
 * Sample A  →  "clean"  : all claims supported, no conflicts, high confidence
 * Sample B  →  "mixed"  : mix of supported/warning/failed, conflicts detected
 * Sample C  →  "weak"   : low confidence, several warnings
 */

// ─── Sample A — Clean Result ───────────────────────────────────────────────

export const RESULT_CLEAN = {
  query_id: "q_001",
  answer_text:
    "The principle of res judicata bars re-litigation of issues already decided by a competent court. " +
    "In Satyadhyan Ghosal v. Deorajin Debi (1960), the Supreme Court held that this doctrine extends " +
    "not only to the points upon which the court was actually required to adjudicate, but also to every " +
    "point which properly belonged to the subject of litigation and which the parties, exercising " +
    "reasonable diligence, might have brought forward at the time.\n\n" +
    "This principle has been consistently upheld in subsequent judgments. The court in Workmen of " +
    "Cochin Port Trust v. Board of Trustees (1978) further clarified that constructive res judicata " +
    "equally applies to matters that could have been — but were not — raised in the earlier proceedings.",
  claims: [
    {
      claim_id: "c_001_1",
      claim_text:
        "Res judicata bars re-litigation of issues already decided by a competent court.",
      citation: {
        case_name: "Satyadhyan Ghosal v. Deorajin Debi",
        court: "Supreme Court of India",
        date: "1960-04-12",
        citation_no: "AIR 1960 SC 941",
        paragraph: "Para 8",
      },
      verification_status: "supported",
      evidence_state: "SUPPORTED_CURRENT",
      evidence_passage_id: "ep_001_a",
    },
    {
      claim_id: "c_001_2",
      claim_text:
        "The doctrine extends to every point which the parties might have brought forward exercising reasonable diligence.",
      citation: {
        case_name: "Satyadhyan Ghosal v. Deorajin Debi",
        court: "Supreme Court of India",
        date: "1960-04-12",
        citation_no: "AIR 1960 SC 941",
        paragraph: "Para 12",
      },
      verification_status: "supported",
      evidence_state: "SUPPORTED_CURRENT",
      evidence_passage_id: "ep_001_b",
    },
    {
      claim_id: "c_001_3",
      claim_text:
        "Constructive res judicata applies to matters that could have been raised in earlier proceedings.",
      citation: {
        case_name: "Workmen of Cochin Port Trust v. Board of Trustees",
        court: "Supreme Court of India",
        date: "1978-09-05",
        citation_no: "AIR 1978 SC 1283",
        paragraph: "Para 19",
      },
      verification_status: "supported",
      evidence_state: "SUPPORTED_CURRENT",
      evidence_passage_id: "ep_001_c",
    },
  ],
  sources: [
    {
      id: "s_001_a",
      title: "Satyadhyan Ghosal v. Deorajin Debi",
      court: "Supreme Court of India",
      year: "1960",
      relevance: 0.97,
    },
    {
      id: "s_001_b",
      title: "Workmen of Cochin Port Trust v. Board of Trustees",
      court: "Supreme Court of India",
      year: "1978",
      relevance: 0.89,
    },
    {
      id: "s_001_c",
      title: "Daryao v. State of U.P.",
      court: "Supreme Court of India",
      year: "1962",
      relevance: 0.74,
    },
  ],
  confidence_score: 0.94,
  evidence_coverage: 0.91,
  warnings: [],
  conflicts_detected: false,
  temporal_context: "Doctrine stable; no legislative amendments since 1960 judgment.",
  corpus_version: "IND-SC-2024-Q4",
  model_version: "halo-verify-v1.2.0",
  verification_timestamp: "2024-11-15T09:23:41Z",
  retrieval_trace: [],
};

// ─── Sample B — Mixed / Conflicted Result ──────────────────────────────────

export const RESULT_MIXED = {
  query_id: "q_002",
  answer_text:
    "The liability of directors for company debts under Section 179 of the Income Tax Act has been " +
    "the subject of significant judicial debate. Early High Court decisions imposed near-strict liability " +
    "on all directors, while later Supreme Court pronouncements introduced a due-diligence defence.\n\n" +
    "However, a subsequent bench of the Delhi High Court appears to diverge from the Supreme Court " +
    "position in cases involving nominee directors, creating a potential conflict in the applicable " +
    "standard across jurisdictions. Practitioners should exercise caution pending a definitive ruling.",
  claims: [
    {
      claim_id: "c_002_1",
      claim_text:
        "Section 179 imposes liability on every person who was a director of a private company when the tax was recoverable.",
      citation: {
        case_name: "Ravindranath Bajaj v. Commissioner of Income Tax",
        court: "Bombay High Court",
        date: "2003-07-21",
        citation_no: "(2003) 263 ITR 556 (Bom)",
        paragraph: "Para 14",
      },
      verification_status: "supported",
      evidence_state: "SUPPORTED_CURRENT",
      evidence_passage_id: "ep_002_a",
    },
    {
      claim_id: "c_002_2",
      claim_text:
        "A director can escape liability by proving they exercised all due diligence to prevent non-recovery.",
      citation: {
        case_name: "Pr. CIT v. Siemens Ltd.",
        court: "Supreme Court of India",
        date: "2017-03-14",
        citation_no: "(2017) 394 ITR 1 (SC)",
        paragraph: "Para 22",
      },
      verification_status: "warning",
      evidence_state: "SUPPORTED_DISPUTED",
      evidence_passage_id: "ep_002_b",
    },
    {
      claim_id: "c_002_3",
      claim_text:
        "Nominee directors are categorically exempt from Section 179 liability regardless of due diligence.",
      citation: {
        case_name: "Steel Authority of India v. ITO",
        court: "Delhi High Court",
        date: "2022-08-30",
        citation_no: "(2022) 447 ITR 211 (Del)",
        paragraph: "Para 9",
      },
      verification_status: "failed",
      evidence_state: "CONTRADICTED",
      evidence_passage_id: "ep_002_c",
    },
  ],
  sources: [
    {
      id: "s_002_a",
      title: "Ravindranath Bajaj v. Commissioner of Income Tax",
      court: "Bombay High Court",
      year: "2003",
      relevance: 0.88,
    },
    {
      id: "s_002_b",
      title: "Pr. CIT v. Siemens Ltd.",
      court: "Supreme Court of India",
      year: "2017",
      relevance: 0.82,
    },
    {
      id: "s_002_c",
      title: "Steel Authority of India v. ITO",
      court: "Delhi High Court",
      year: "2022",
      relevance: 0.71,
    },
  ],
  confidence_score: 0.61,
  evidence_coverage: 0.73,
  warnings: [
    "Conflicting standards detected between Supreme Court (2017) and Delhi HC (2022) on nominee director exemption.",
    "Claim c_002_3 could not be corroborated against the current corpus — verify manually before relying on it.",
  ],
  conflicts_detected: true,
  temporal_context: "Law in flux; Delhi HC 2022 ruling under appeal. Monitor SC outcome.",
  corpus_version: "IND-SC-2024-Q4",
  model_version: "halo-verify-v1.2.0",
  verification_timestamp: "2024-11-15T10:47:03Z",
  retrieval_trace: [],
};

// ─── Sample C — Low Confidence Result ─────────────────────────────────────

export const RESULT_WEAK = {
  query_id: "q_003",
  answer_text:
    "Questions of data localisation obligations for legal-tech platforms operating across Indian and EU " +
    "jurisdictions remain largely unsettled. The Digital Personal Data Protection Act 2023 does not " +
    "explicitly mandate on-shore storage for all categories of personal data, but cross-border transfer " +
    "restrictions may apply depending on the classification of data principals involved.\n\n" +
    "EU GDPR Chapter V adequacy decisions for India have not been granted as of the knowledge cut-off, " +
    "adding further complexity. Practitioners must monitor subordinate legislation expected in 2025.",
  claims: [
    {
      claim_id: "c_003_1",
      claim_text:
        "DPDPA 2023 does not mandate universal on-shore storage for personal data.",
      citation: {
        case_name: "Digital Personal Data Protection Act, 2023",
        court: "Parliament of India",
        date: "2023-08-11",
        citation_no: "Act No. 22 of 2023, Section 16",
        paragraph: "Section 16(1)",
      },
      verification_status: "warning",
      evidence_state: "SUPPORTED_PENDING_RULES",
      evidence_passage_id: "ep_003_a",
    },
    {
      claim_id: "c_003_2",
      claim_text:
        "An adequacy decision under GDPR Article 45 for India has not been granted.",
      citation: {
        case_name: "European Commission Adequacy Decisions Register",
        court: "European Commission",
        date: "2024-06-01",
        citation_no: "EC/2024/ADEQUACY-REGISTER",
        paragraph: "India entry",
      },
      verification_status: "warning",
      evidence_state: "SUPPORTED_EXTERNAL_SOURCE",
      evidence_passage_id: "ep_003_b",
    },
    {
      claim_id: "c_003_3",
      claim_text:
        "Subordinate rules under DPDPA are expected to clarify cross-border transfer obligations by Q1 2025.",
      citation: {
        case_name: "Ministry of Electronics and Information Technology — Press Release",
        court: "MeitY",
        date: "2024-02-14",
        citation_no: "MeitY/PR/2024/DPDP-RULES",
        paragraph: "Para 3",
      },
      verification_status: "warning",
      evidence_state: "UNVERIFIED_REGULATORY_FORECAST",
      evidence_passage_id: "ep_003_c",
    },
  ],
  sources: [
    {
      id: "s_003_a",
      title: "Digital Personal Data Protection Act, 2023",
      court: "Parliament of India",
      year: "2023",
      relevance: 0.93,
    },
    {
      id: "s_003_b",
      title: "GDPR Article 45 — Adequacy Decisions",
      court: "European Commission",
      year: "2024",
      relevance: 0.78,
    },
    {
      id: "s_003_c",
      title: "MeitY DPDP Rules Consultation Paper",
      court: "MeitY",
      year: "2024",
      relevance: 0.65,
    },
  ],
  confidence_score: 0.41,
  evidence_coverage: 0.54,
  warnings: [
    "This area of law is rapidly evolving — corpus may not reflect the latest regulatory guidance.",
    "Two of three claims rely on non-judicial sources (regulatory press releases); treat with caution.",
    "Subordinate rules under DPDPA were not available in the corpus at verification time.",
    "EU adequacy status sourced from external register, not verified against primary EU Official Journal.",
  ],
  conflicts_detected: false,
  temporal_context: "DPDPA rules pending as of corpus cut-off. Reassess after Q1 2025.",
  corpus_version: "IND-SC-2024-Q4",
  model_version: "halo-verify-v1.2.0",
  verification_timestamp: "2024-11-15T11:58:22Z",
  retrieval_trace: [],
};

export const ALL_RESULTS = [RESULT_CLEAN, RESULT_MIXED, RESULT_WEAK];
