# HALO (Nyaya Sahayak)
## Hallucination-Aware Retrieval & Verification Framework for AI-Assisted Legal Research

> **"An LLM may generate a legal answer, but it is never the source of truth. Authoritative legal evidence is the source of truth, and verification is a mandatory gate before claims are presented as supported."**  
> — *HALO Engineering Principle (PRD v2.0)*

---

## 🏛️ Overview

**HALO** (*Nyaya Sahayak*) is an evidence-first legal research and verification infrastructure built specifically for the Indian legal domain (Supreme Court of India, High Courts, Companies Act, Income Tax Act, and IBC).

General-purpose LLMs hallucinate citations, invent case numbers, cite outdated amendments, and misquote statutory paragraphs. HALO solves this by implementing an explicit **neural-symbolic verification and fail-closed governance pipeline** between AI generation and advocate presentation.

---

## 📁 Directory Structure

```text
HALO/
├── backend/                  # FastAPI & Python Verification Pipeline
│   ├── app/                  # REST API Controllers & Routers
│   │   ├── api/              # FastAPI Application Entry & Middleware
│   │   ├── auth/             # JWT Authentication & RBAC (Lawyer / Researcher / Admin)
│   │   ├── research/         # Research Query Execution & Contract Adapters
│   │   └── audit/            # Live Cryptographic Audit Trail Endpoints
│   ├── halo/                 # Core HALO Verification Engine
│   │   ├── claim_extractor/  # Atomic Proposition & Citation Decomposer
│   │   ├── citation_verifier/# 3-Tier Citation Existence & Metadata Validator
│   │   ├── evidence_verifier/# NLI Entailment & Numerical/Polarity Subsystem
│   │   ├── temporal_verifier/# Historical vs. Current Law Enforcement
│   │   ├── conflict_detector/# Doctrinal Split & Forum Hierarchy Engine
│   │   ├── confidence/       # Multi-factor Evidence Calibration Engine
│   │   ├── governor/         # Fail-Closed Quarantine & Reconstruction
│   │   └── audit/            # SHA-256 Tamper-Proof JSONL Audit Store
│   ├── data/                 # Authoritative Statutory Acts & Corpora (PDF / Text)
│   ├── tests/                # Unit, RBAC, and Integration Test Suites
│   └── requirements.txt      # Backend Python Dependencies
│
├── frontend/                 # React + Vite Modern Legal-Tech UI
│   ├── src/
│   │   ├── api/              # Unified API Client Layer (Axios & Adapters)
│   │   ├── components/       # AppShell, Navigation, ProtectedRoute
│   │   └── pages/            # PRD Core Screens
│   │       ├── DashboardPage.jsx          # Screen 1: Research Dashboard & Metrics
│   │       ├── ResearchResultPage.jsx     # Screen 2: Evidence-First Answer View
│   │       ├── EvidenceViewPage.jsx       # Screen 3: 4-Tier Provenance & Text Anchor
│   │       ├── ClaimVerificationPage.jsx  # Screen 4: 3-Tier Claim Inspector
│   │       ├── ConflictViewPage.jsx       # Screen 5: Judicial Conflict & Precedence
│   │       ├── HistoryPage.jsx            # Screen 6: Research History & Analytics
│   │       ├── CasesPage.jsx              # Case Workspace & Court Brief Export
│   │       ├── AuditTrailPage.jsx         # Cryptographic Audit Ledger (FR-14)
│   │       └── LoginPage.jsx              # Authentication & Role Gateway
│   └── package.json          # Frontend Dependencies & Scripts
│
├── docs/                     # Specifications, Research & Design Documentation
│   ├── HALO_Production_Grade_PRD_v2.md    # Master PRD (v2.0, 77 Sections)
│   ├── HALO_Project_Synopsis latest.docx   # Academic Architecture Synopsis
│   ├── PROJECT_STATUS.md                  # Milestone & Implementation Tracker
│   ├── Details.txt                        # Feature Requirements & Architecture Notes
│   └── synopsis_extracted.txt             # Plaintext Synopsis Extract
│
└── README.md                 # Project Overview & Quickstart Guide
```

---

## ⚡ Core Verification Pipeline (PRD Architecture)

1. **Atomic Legal Claim Extraction**: Decomposes LLM text into atomic propositions and pinpoints citation spans.
2. **Three-Tier Citation Verification**:
   - **Tier 1 (Existence)**: Validates against official Supreme Court and Central Act registries.
   - **Tier 2 (Metadata)**: Validates court hierarchy, bench type, year, and reporter volume.
   - **Tier 3 (Substantive Support)**: Evaluates whether the cited paragraph actually entails the legal claim.
3. **Temporal Validity**: Distinguishes historical law from current in-force statutory amendments.
4. **Judicial Conflict Detector**: Identifies forum hierarchy tensions (e.g. High Court vs. Supreme Court) and renders binding resolution advisories under Article 141 of the Constitution.
5. **Fail-Closed Governance**: Automatically quarantines unsupported or contradictory claims rather than presenting hallucinations to advocates.
6. **Immutable Cryptographic Audit Trail**: Records every pipeline decision to disk with SHA-256 integrity hashes (FR-14).

---

## 🚀 Running Locally

### 1. Backend Service (FastAPI)

```bash
cd backend
# Activate Python Virtual Environment
venv\Scripts\activate      # Windows
# or: source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs & Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Application (React + Vite)

```bash
cd frontend
# Install dependencies
npm install

# Start Vite dev server on port 5173
npm run dev
```
- Web Application: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Default Test Credentials

| Role | Email | Password |
|---|---|---|
| **Advocate (Lawyer)** | `advocate@nyayasahayak.in` | `halo2024` |
| **Researcher** | `researcher@nyayasahayak.in` | `halo2024` |
| **System Admin** | `admin@nyayasahayak.in` | `admin2024` |

---

## 📄 Key Application Routes

| Path | Screen Description |
|---|---|
| `/dashboard` | Research Dashboard with recent matters and confidence tracking |
| `/research` | Interactive Legal Research Query Runner |
| `/research/:queryId` | Evidence-first Answer with claim badges & sources panel |
| `/research/:queryId/evidence` | 4-Tier Provenance Stepper & interactive passage viewer |
| `/research/:queryId/verify` | 3-Tier Existence, Metadata & Substantive claim inspector |
| `/research/:queryId/conflict` | Dual-column Judicial Conflict Inspector & Article 141 advisory |
| `/cases` | Case & Matter Dossier Workspace with one-click Legal Brief export |
| `/drafts` | Grounded Legal Pleadings, Affidavits & Notice Auto-Drafting Manager |
| `/history` | Research query search, filtering, and aggregate analytics |
| `/admin/audit` | Live Cryptographic Audit Trail with real-time SHA-256 validation |

---

## 👥 Contributors

- **Supriya Mulik**
- **Prithviraj Patil**
