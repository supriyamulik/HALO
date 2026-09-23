# HALO — Project Status
Last updated: 2026-09-22

---

## 1. What's Fully Built & Working

### 1.1 Auth & RBAC (Backend)
- **What it does**: Provides user registration, password hashing (bcrypt), token issuance (HS256 JWT bearer tokens), current user retrieval (`/api/v1/auth/me`), and role-based access control with 4 distinct roles (`LAWYER`, `RESEARCHER`, `ADMIN`, `INSTITUTION_ADMIN`).
- **Implementation Files**:
  - Model & Enum: [`backend/app/auth/model.py`](file:///d:/HALO/backend/app/auth/model.py) (Lines 7–22)
  - Schemas: [`backend/app/auth/schema.py`](file:///d:/HALO/backend/app/auth/schema.py) (Lines 6–28)
  - Controller/Routes: [`backend/app/auth/controller.py`](file:///d:/HALO/backend/app/auth/controller.py) (Lines 13–33)
  - Business Logic & JWT: [`backend/app/auth/service.py`](file:///d:/HALO/backend/app/auth/service.py) (Lines 13–72)
  - Database & Session Repository: [`backend/app/auth/repository.py`](file:///d:/HALO/backend/app/auth/repository.py) (Lines 6–33)
  - Core Config & Security Dependencies: [`backend/app/core/config.py`](file:///d:/HALO/backend/app/core/config.py) and [`backend/app/core/security.py`](file:///d:/HALO/backend/app/core/security.py) (Lines 15–47)
  - Entry Point: [`backend/app/api/main.py`](file:///d:/HALO/backend/app/api/main.py) (Lines 1–19)
- **Verification Status**: Verified via live backend tests on port 8000 and 13/13 passing automated pytest unit tests in [`backend/tests/test_auth.py`](file:///d:/HALO/backend/tests/test_auth.py) and [`backend/tests/test_rbac.py`](file:///d:/HALO/backend/tests/test_rbac.py).

### 1.2 Login / Register Screen (Frontend)
- **What it does**: Unified auth screen with Login and Register tab switching, form validation, error banner display that cleanly parses FastAPI 422 array responses into readable text (preventing `[object Object]`), role selection dropdown, token storage in `localStorage.access_token`, and auto-navigation to `/dashboard`.
- **Implementation Files**:
  - Component: [`frontend/src/pages/LoginPage.jsx`](file:///d:/HALO/frontend/src/pages/LoginPage.jsx) (Lines 1–261)
  - Styling: [`frontend/src/pages/LoginPage.css`](file:///d:/HALO/frontend/src/pages/LoginPage.css)
  - API Client & Interceptors: [`frontend/src/api/client.js`](file:///d:/HALO/frontend/src/api/client.js) (Lines 31–78)
  - Route Guard: [`frontend/src/components/ProtectedRoute.jsx`](file:///d:/HALO/frontend/src/components/ProtectedRoute.jsx) (Lines 1–21)
- **Verification Status**: Verified end-to-end in browser and through Vite dev proxy.

### 1.3 Dashboard Screen (Frontend)
- **What it does**: Landing hub post-login showing quick stats, action cards for initiating research or inspecting history, and a summary list of recent legal queries.
- **Implementation Files**:
  - Component: [`frontend/src/pages/DashboardPage.jsx`](file:///d:/HALO/frontend/src/pages/DashboardPage.jsx) (Lines 1–105)
  - Styling: [`frontend/src/pages/DashboardPage.css`](file:///d:/HALO/frontend/src/pages/DashboardPage.css)
- **Verification Status**: Verified with mock history and authenticated user session.

### 1.4 Research Search Screen (Frontend — PRD Screen 1)
- **What it does**: Query submission interface with natural-language legal question input, jurisdiction filter, court level selector, date/historical context filters, and quick suggestions.
- **Implementation Files**:
  - Component: [`frontend/src/pages/ResearchPage.jsx`](file:///d:/HALO/frontend/src/pages/ResearchPage.jsx) (Lines 1–510)
  - Styling: [`frontend/src/pages/ResearchPage.css`](file:///d:/HALO/frontend/src/pages/ResearchPage.css)
- **Verification Status**: Verified against deterministic search triggers returning query IDs `q_001`, `q_002`, and `q_003`.

### 1.5 Research Result / AI Answer Screen (Frontend — PRD Screen 2 & Section 40)
- **What it does**: Synthesized legal answer presentation, claim blocks with verification status badges (`VERIFIED`, `WARNING`, `FAILED`), 2-metric breakdown (`Confidence Score` and `Evidence Coverage`), authoritative source list, warnings banner, conflict detection alert, Section 40 explainability checklist ("Why this answer is supported"), and CTA to deep-dive claim verification.
- **Implementation Files**:
  - Component: [`frontend/src/pages/ResearchResultPage.jsx`](file:///d:/HALO/frontend/src/pages/ResearchResultPage.jsx) (Lines 1–395)
  - Styling: [`frontend/src/pages/ResearchResultPage.css`](file:///d:/HALO/frontend/src/pages/ResearchResultPage.css)
- **Verification Status**: Verified across all 3 test fixtures (`q_001` clean, `q_002` conflicted, `q_003` low-confidence).

### 1.6 Claim & Citation Verification Screen (Frontend — PRD Screen 4)
- **What it does**: Deep-dive verification page displaying a top-level summary strip (`Total Claims Analyzed`, `Verified`, `Warnings`, `Failed`), numbered claim cards with status badges, three explicit sub-checks per claim (`Source Exists`, `Citation Accurate`, `Passage Supports`) with status-coded icons (`✓`, `⚠`, `✗`) and plain-language legal explanations, cited case footer, and bottom action bar (`Back to Answer`, `Review Warnings`, `Accept Verified`).
- **Implementation Files**:
  - Component: [`frontend/src/pages/ClaimVerificationPage.jsx`](file:///d:/HALO/frontend/src/pages/ClaimVerificationPage.jsx) (Lines 1–372)
  - Styling: [`frontend/src/pages/ClaimVerificationPage.css`](file:///d:/HALO/frontend/src/pages/ClaimVerificationPage.css) (Lines 1–436)
  - Route in Router: [`frontend/src/App.jsx`](file:///d:/HALO/frontend/src/App.jsx#L60-L66)
- **Verification Status**: Verified with zero build errors (`npm run build`), tested against `q_001`, `q_002` (verifying mixed statuses), and `q_003`.

### 1.7 Live Research API & HaloPipeline Integration
- **What it does**: Fully integrated real-time legal research verification engine with `HaloPipeline` orchestrating atomic claim extraction, 3-tier citation verification against D1 (Companies Act 2013) & D2 (Supreme Court Judgments) corpora, neural-symbolic evidence verification, temporal currency checks, judicial conflict detection, fail-closed policy enforcement, and cryptographic SHA-256 audit logging.
- **Implementation Files**:
  - Research Controller: [`backend/app/research/controller.py`](file:///d:/HALO/backend/app/research/controller.py)
  - Contract Adapter: [`backend/app/research/adapter.py`](file:///d:/HALO/backend/app/research/adapter.py)
  - Pydantic Schemas: [`backend/app/research/schema.py`](file:///d:/HALO/backend/app/research/schema.py)
  - Pipeline Engine: [`backend/halo/pipeline.py`](file:///d:/HALO/backend/halo/pipeline.py)
  - Verification Subsystems: [`backend/halo/`](file:///d:/HALO/backend/halo/) (`claim_extractor`, `citation_verifier`, `evidence_verifier`, `temporal_verifier`, `conflict_detector`, `confidence`, `governor`, `audit`)
  - Primary Corpora: [`backend/data/`](file:///d:/HALO/backend/data/) (`dataset_1`, `dataset2`)
  - Frontend Client Service: [`frontend/src/api/researchApi.js`](file:///d:/HALO/frontend/src/api/researchApi.js)
- **Verification Status**: 16/16 automated pytest unit & integration tests passing across Auth, RBAC, and Research pipeline. Frontend build verified with 0 errors (`npm run build`).

---

## 2. What's Stubbed / In Progress

The following secondary views currently render [`PlaceholderPage.jsx`](file:///d:/HALO/frontend/src/pages/PlaceholderPage.jsx) in [`frontend/src/App.jsx`](file:///d:/HALO/frontend/src/App.jsx#L68-L88):

| Route in `App.jsx` | Target PRD Screen / Feature | Description |
| :--- | :--- | :--- |
| `/cases` | **Cases / Case Workspace** | Multi-case workspace for advocates: list of active cases, attached research briefs, document repository. |
| `/history` | **Research History & Analytics** (PRD Screen 6) | Dedicated history page listing past research queries, confidence metrics, and verification outcomes (API is live). |
| `/research/:queryId/evidence` | **Evidence / Judgment Viewer** (PRD Screen 3) | Deep-dive viewer tracing: `Claim` &rarr; `Source` &rarr; `Document Version` &rarr; `Exact Passage` with highlighted text spans. |
| `/research/:queryId/conflict` | **Standalone Conflict View** (PRD Screen 5) | Dual-column judicial conflict inspector displaying Authority A vs Authority B and conflicting paragraphs. |

---

## 3. Test Coverage Summary

Running `pytest -v` from [`backend/`](file:///d:/HALO/backend) produces **16 passed tests**:

| Test File | Test Case | Status |
| :--- | :--- | :--- |
| `tests/test_auth.py` | `test_register_success` | ✅ PASSED |
| `tests/test_auth.py` | `test_duplicate_email_409` | ✅ PASSED |
| `tests/test_auth.py` | `test_short_password_422` | ✅ PASSED |
| `tests/test_auth.py` | `test_login_success` | ✅ PASSED |
| `tests/test_auth.py` | `test_wrong_password_401` | ✅ PASSED |
| `tests/test_auth.py` | `test_unknown_email_401` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_with_valid_token` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_without_token_401_or_403` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_with_invalid_token_401` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_lawyer` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_researcher` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_institution_admin` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_admin` | ✅ PASSED |
| `tests/test_research_api.py` | `test_research_query_submit` | ✅ PASSED |
| `tests/test_research_api.py` | `test_research_history_get` | ✅ PASSED |
| `tests/test_research_api.py` | `test_research_result_get` | ✅ PASSED |

## 4. Known Gaps / Open Issues

1. **`verification_status` Naming Mismatch (PRD Section 26 vs Frontend)**:
   - *PRD Section 26 (Line 1064)* specifies user-facing statuses: `supported`, `flagged`, `rejected`.
   - *Current Frontend & Mock Data* use: `supported`, `warning`, `failed` (rendered as badges: `VERIFIED`, `WARNING`, `FAILED`).
   - *Status*: Open decision. An adapter layer or enum normalization should be established before pipeline integration.
2. **Confidence Breakdown Mismatch (3 Bars vs 2 Metrics)**:
   - Wireframes show 3 separate confidence bars: *Source Quality*, *Citation Accuracy*, *Groundedness*.
   - PRD Section 32 Response Contract only specifies 2 root metrics: `confidence_score` (float) and `evidence_coverage` (float).
   - *Status*: Open decision whether the pipeline will provide the 3-bar breakdown or if the frontend derives them from verification sub-checks.
3. **Cases / Case Workspace Scope**:
   - `/cases` (My Cases / Case Workspace) is included in wireframes and PRD Section 69 long-term roadmap, but is not in the initial 6-screen MVP list in Section 39.
   - *Status*: Settle whether this is in-scope for the immediate hackathon milestone or a post-MVP addition.
4. **Email / Identifier Input Formatting**:
   - Backend enforces strict Pydantic `EmailStr` on login/registration. Bar Council ID strings (e.g., `MH/1234/2020`) without standard email formatting are future scope and not yet supported.

---

## 5. Test Coverage Summary

Running `pytest -v` from [`backend/`](file:///d:/HALO/backend) produces **13 passed tests**:

| Test File | Test Case | Status |
| :--- | :--- | :--- |
| `tests/test_auth.py` | `test_register_success` | ✅ PASSED |
| `tests/test_auth.py` | `test_duplicate_email_409` | ✅ PASSED |
| `tests/test_auth.py` | `test_short_password_422` | ✅ PASSED |
| `tests/test_auth.py` | `test_login_success` | ✅ PASSED |
| `tests/test_auth.py` | `test_wrong_password_401` | ✅ PASSED |
| `tests/test_auth.py` | `test_unknown_email_401` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_with_valid_token` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_without_token_401_or_403` | ✅ PASSED |
| `tests/test_auth.py` | `test_me_with_invalid_token_401` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_lawyer` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_researcher` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_institution_admin` | ✅ PASSED |
| `tests/test_rbac.py` | `test_role_admin` | ✅ PASSED |

**Frontend Build Verification**:
- `npm run build` in `frontend/` succeeds with **0 errors** (Bundle size: 357 kB JS, 32 kB CSS).

---

## 6. Tech Stack Confirmed

- **Backend**:
  - Python 3.10.11
  - FastAPI 0.115+
  - SQLModel 0.0.22 / SQLAlchemy 2.0+
  - SQLite (development storage at `backend/halo.db`)
  - Passlib (bcrypt password hashing)
  - Python-Jose (HS256 JWT access tokens)
  - Uvicorn (ASGI server)
- **Frontend**:
  - React 19.2.8
  - Vite 8.3.0
  - React Router DOM 7.18.4
  - Axios 1.20.0
  - Vanilla CSS (Custom Design System tokens in `index.css`)
- **Repository**:
  - `origin https://github.com/supriyamulik/HALO.git` (branch: `main`)

---

## 7. Next Planned Screens & Roadmap (In Order)

1. **Evidence Viewer Screen** (PRD Screen 3 & Details.txt Screen 7)
   - Route: `/research/:queryId/evidence`
   - Goal: Side-by-side passage viewer with highlighted legal text, paragraph anchors, and source metadata.
2. **Standalone Conflict View Screen** (PRD Screen 5)
   - Route: `/research/:queryId/conflict`
   - Goal: Dedicated split-view comparing Authority A vs Authority B with temporal divergence notes.
3. **Research History & Analytics Screen** (PRD Screen 6 & Details.txt Screen 10)
   - Route: `/history`
   - Goal: Filterable repository of historical queries, confidence score trends, and saved answers.
4. **Cases & Case Workspace Screens** (Details.txt Screens 8 & 9)
   - Routes: `/cases` and `/cases/:caseId` (pending team scope confirmation).
5. **Non-Pipeline API Layer (Phase 3)**:
   - Backend endpoints: `GET /api/v1/research/{query_id}`, `GET /api/v1/research/{query_id}/claims`, `GET /api/v1/research/{query_id}/evidence`, `GET /api/v1/health`.
6. **Security & Audit Logging (Phase 4)**:
   - Audit trail table recording user ID, query string, timestamp, corpus version, and verification outcomes.
