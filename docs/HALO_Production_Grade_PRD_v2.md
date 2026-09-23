# HALO
## Hallucination-Aware Retrieval and Verification Framework for AI-Assisted Legal Research

**Production-Grade Product Requirements Document (PRD)**  
**Version:** 2.0  
**Status:** Architecture-ready / implementation-ready  
**Target:** SIH 2026 + research-grade prototype + production evolution

---

## 1. Executive Summary

HALO is an evidence-first legal research system designed to reduce hallucinated, outdated, or unsupported legal answers produced by general-purpose LLMs.

The core principle is simple:

> **An LLM may generate a legal answer, but it is never the source of truth. Authoritative legal evidence is the source of truth, and verification is a mandatory gate before claims are presented as supported.**

HALO combines:

- Natural-language legal query understanding
- Hybrid lexical + semantic retrieval
- Authority-aware ranking
- Temporal legal-version filtering
- Cross-encoder reranking
- Evidence-grounded generation
- Claim-level verification
- Three-tier citation verification
- Conflict detection
- Evidence provenance
- Confidence and calibration
- Fail-closed abstention
- Full auditability
- Evaluation and monitoring

The system deliberately avoids free-form multi-agent orchestration in its core research path. A deterministic pipeline makes the system easier to test, reproduce, secure, and evaluate.

---

# 2. Problem Statement

General-purpose LLMs are increasingly used for legal research, but they primarily generate answers from pretrained knowledge rather than verified, current legal sources. This creates serious risks:

- fabricated case names
- non-existent judgments
- incorrect citation numbers
- misquoted or invented paragraphs
- misstatement of statutory provisions
- application of outdated law
- failure to distinguish historical from current law
- unsupported legal conclusions
- inability to explain exactly why a claim is trusted

Traditional keyword-based legal search systems are more reliable for source discovery but require the user to know the correct legal terminology, section, citation, or case name. They also do not naturally synthesize evidence across multiple sources.

HALO addresses the gap by treating authoritative legal sources as evidence and adding explicit verification between LLM generation and final presentation.

---

# 3. Product Vision

## Vision

Build a trustworthy legal research infrastructure in which every AI-generated legal claim is traceable to authoritative evidence, temporally valid where required, and explicitly marked when verification is insufficient.

## Mission

Help lawyers research faster without requiring them to blindly trust an LLM.

## Positioning

> **HALO is not an AI lawyer. It is an evidence-verification layer for AI-assisted legal research.**

---

# 4. Product Principles

1. **Evidence over model memory**
2. **Verification before presentation**
3. **Fail closed rather than hallucinate**
4. **Every claim is independently checkable**
5. **Citation existence is not enough**
6. **Relevance is not the same as authority**
7. **Current law is not the same as historical law**
8. **Evidence support is not a guarantee of absolute legal correctness**
9. **Every important decision is auditable**
10. **Research quality must be measurable**
11. **LLMs remain replaceable components**
12. **Scope is deliberately constrained before quality is expanded**

---

# 5. Goals

## 5.1 Primary Goals

- Retrieve relevant legal evidence from a controlled corpus.
- Combine keyword and semantic retrieval.
- Prioritize authoritative and temporally applicable sources.
- Generate answers grounded in retrieved passages.
- Decompose answers into discrete legal claims.
- Verify claims against evidence.
- Verify citations at multiple levels.
- Detect conflicts between authorities.
- Suppress or flag unsupported claims.
- Preserve complete provenance.
- Measure retrieval and verification quality objectively.

## 5.2 Secondary Goals

- Support local LLM inference.
- Provide an explainable research interface.
- Maintain reproducible corpus/model/prompt versions.
- Support future enterprise and government deployments.
- Provide an evaluation framework suitable for academic publication.

## 5.3 Non-Goals for MVP

- Full coverage of all Indian law.
- Autonomous legal advice.
- Autonomous filing or court action.
- Fully automated legal drafting.
- Mobile application.
- Telegram/WhatsApp bot.
- Multilingual support.
- Free-form agentic workflows.
- Automatic determination of the legally superior interpretation in every conflict.
- Replacement of a qualified lawyer.

---

# 6. Target Users

## 6.1 Primary User — Lawyer / Legal Researcher

### Needs

- Ask questions in natural language.
- Discover relevant judgments and statutory provisions.
- Obtain synthesized answers.
- Inspect supporting passages.
- Verify citations quickly.
- Understand uncertainty and conflicts.

### Pain Points

- Searching using exact legal terminology is time-consuming.
- Large result sets require manual review.
- LLM citations can be unreliable.
- Old and current legal positions may be mixed.
- Cross-checking every generated statement is expensive.

---

## 6.2 Secondary User — Law Student / Academic Researcher

Needs:

- Case discovery
- Statutory research
- Source tracing
- Comparison of authorities
- Learning how claims map to evidence

---

## 6.3 Enterprise User — Law Firm

Needs:

- Shared research workspaces
- Team-level audit logs
- Private corpora
- SSO/RBAC
- Usage analytics
- Research history
- Compliance controls

---

## 6.4 Government / Institutional User

Needs:

- Controlled authoritative corpus
- On-premise/private deployment
- Strong provenance
- Auditability
- Data residency
- Model and corpus governance

---

# 7. Core User Journey

```text
Lawyer enters natural-language question
              ↓
Query validation and normalization
              ↓
Legal entity + temporal intent extraction
              ↓
Hybrid retrieval
      ┌───────┴────────┐
      ↓                ↓
    BM25          Semantic Search
      └───────┬────────┘
              ↓
       Candidate Pool
              ↓
      Authority Filtering
              ↓
      Temporal Filtering
              ↓
         Reranking
              ↓
       Evidence Selection
              ↓
       Grounded Generation
              ↓
       Claim Extraction
              ↓
 ┌────────────┴────────────┐
 ↓                         ↓
Claim Verification   Citation Verification
 └────────────┬────────────┘
              ↓
       Conflict Detection
              ↓
       Provenance Assembly
              ↓
       Confidence/Calibration
              ↓
        Fail-Closed Gate
              ↓
      Evidence-backed Answer
```

---

# 8. Functional Requirements

## FR-01 Query Input

The system shall accept a natural-language legal research question.

Optional metadata:

- domain
- jurisdiction
- court
- date/historical context
- language

## FR-02 Query Understanding

The system shall:

- normalize the query
- detect legal entities
- identify section/case references
- identify temporal intent
- identify jurisdiction where possible
- detect out-of-scope queries

## FR-03 Hybrid Retrieval

The system shall combine:

- BM25 lexical retrieval
- dense semantic retrieval

Neither method alone shall constitute the final retrieval architecture.

## FR-04 Authority-Aware Ranking

The system shall incorporate authority metadata into ranking.

## FR-05 Temporal Filtering

The system shall retrieve provisions and authorities applicable to the requested legal time period.

## FR-06 Reranking

A cross-encoder or equivalent reranker shall reorder the candidate pool.

## FR-07 Grounded Generation

The generator shall receive selected evidence passages and structured source metadata.

## FR-08 Claim Extraction

The system shall decompose generated output into independently checkable claims.

## FR-09 Claim Verification

Every claim intended for presentation as supported shall pass the verification policy.

## FR-10 Citation Verification

Citations shall be verified at three levels:

1. Existence
2. Citation/metadata correctness
3. Passage-level support

## FR-11 Conflict Detection

The system shall detect potentially conflicting authorities and surface them to the user.

## FR-12 Abstention

The system shall flag, remove, or reject unsupported claims according to policy.

## FR-13 Provenance

Each supported claim shall have a traceable evidence chain.

## FR-14 Auditability

Verification decisions shall be logged.

---

# 9. Mandatory Capability Matrix

| Capability | Priority | Success Criterion |
|---|---|---|
| BM25 retrieval | P0 | Meets Recall@10 target on exact statutory queries |
| Semantic retrieval | P0 | Meets Recall@10 target on paraphrased queries |
| Hybrid retrieval | P0 | Outperforms either method alone on agreed test set |
| Reranking | P1 | Improves nDCG/MRR over unre-ranked candidate set |
| Grounded generation | P0 | High sentence/claim traceability |
| Citation existence | P0 | 100% of synthetic fabricated citations flagged in test set |
| Citation-number verification | P0 | 100% of synthetic mismatches flagged in test set |
| Passage verification | P0/P1 | Detection rate honestly reported by failure category |
| Temporal validity | P0 | Correct version selected in historical/current tests |
| Authority ranking | P0 | Appropriate authority appears within target top-K |
| Conflict detection | P1 | Known conflict cases surfaced |
| Provenance | P0 | Every supported claim traceable to source version/passage |
| Confidence | P1 | Calibrated against human judgments |
| Fail-closed gate | P0 | Unsupported claims never marked supported |

---

# 10. Legal Corpus Architecture

The corpus is the authoritative evidence layer.

```text
Legal Corpus
│
├── Acts
│   ├── Act Metadata
│   ├── Sections
│   ├── Amendments
│   └── Versions
│
├── Judgments
│   ├── Case Metadata
│   ├── Paragraphs
│   ├── Citations
│   └── Versions
│
├── Courts
│
└── Source Records
```

## 10.1 Required Metadata

Every document should store, where applicable:

```text
document_id
document_type
title
court
case_number
citation
date_of_judgment
jurisdiction
source
source_url
language
effective_from
effective_to
version
status
content_hash
ingestion_timestamp
corpus_version
```

---

# 11. Temporal Legal Versioning

Temporal validity is a first-class feature.

A legal provision may have multiple versions:

```text
Section X
Version 1 → 2015–2020

Section X
Version 2 → 2020–2024

Section X
Version 3 → 2024–Current
```

## Required Fields

```text
effective_from
effective_to
version
status
supersedes
superseded_by
amended_by
repealed_by
```

## Query Behavior

For:

> “What was the legal position in 2021?”

the retrieval pipeline must apply the relevant temporal filter before final evidence selection.

The system must distinguish:

- current law
- historical law
- amended provision
- repealed provision
- superseded authority

---

# 12. Authority Hierarchy

Relevance alone must not determine ranking.

The system should maintain authority metadata appropriate to the selected jurisdiction and corpus.

Conceptually:

```text
Legal Authority
      +
Semantic Relevance
      +
Lexical Relevance
      +
Temporal Validity
      +
Citation Match
      ↓
Final Evidence Ranking
```

The authority model must be configurable rather than universally hard-coded.

Example metadata:

```text
authority_level
court_level
jurisdiction
precedential_status
decision_date
statutory_status
```

HALO must not automatically treat semantic similarity as legal superiority.

---

# 13. Evidence Provenance

Every supported claim must be traceable through:

```text
Answer
 ↓
Claim
 ↓
Evidence
 ↓
Passage
 ↓
Document
 ↓
Document Version
 ↓
Authoritative Source
 ↓
Ingestion Record
```

## Provenance Fields

```text
claim_id
evidence_id
passage_id
document_id
document_version_id
source_id
retrieval_run_id
verification_run_id
model_version
prompt_version
corpus_version
timestamp
```

This enables the system to answer:

> “Why did HALO present this claim?”

with a complete evidence chain.

---

# 14. Data Architecture

## 14.1 Canonical Store

PostgreSQL shall be the canonical metadata and transactional store.

Stores:

- users
- documents
- document versions
- legal metadata
- claims
- verification records
- research sessions
- audit events

## 14.2 Vector Store

Qdrant or equivalent:

- embeddings
- passage IDs
- document/version references
- semantic retrieval metadata

## 14.3 Lexical Index

BM25-compatible search index for:

- exact section references
- case names
- citations
- statutory terms
- legal phrases

## 14.4 Object Storage

Stores original/legal source files where licensing and deployment policy permit.

## 14.5 Cache

Redis or equivalent for:

- repeated queries
- frequently accessed metadata
- short-lived retrieval results
- rate-limit state

---

# 15. Database / ER Model

```text
USER
 │
 ├──< RESEARCH_QUERY
 │          │
 │          └──< RETRIEVAL_RUN
 │                     │
 │                     └──< RETRIEVAL_RESULT
 │
 └──< AUDIT_EVENT

LEGAL_DOCUMENT
 │
 └──< DOCUMENT_VERSION
          │
          └──< PASSAGE
                    │
                    └──< EVIDENCE
                               │
                               └──< CLAIM
                                          │
                                          └──< VERIFICATION_RESULT

LEGAL_DOCUMENT
 ├── belongs to COURT
 ├── has CITATION
 └── may have TEMPORAL_RELATIONSHIP
```

## Core Tables

### users

```sql
id
email
name
role
created_at
updated_at
```

### legal_documents

```sql
id
document_type
title
court_id
jurisdiction
source_id
canonical_identifier
created_at
```

### document_versions

```sql
id
document_id
version
effective_from
effective_to
status
content_hash
source_url
ingested_at
```

### passages

```sql
id
document_version_id
paragraph_number
text
page_number
content_hash
```

### research_queries

```sql
id
user_id
query_text
domain_hint
temporal_context
created_at
```

### claims

```sql
id
research_query_id
claim_text
claim_order
status
created_at
```

### evidence

```sql
id
claim_id
passage_id
relevance_score
authority_score
temporal_score
retrieval_method
```

### verification_results

```sql
id
claim_id
tier
result
score
reason
model_version
created_at
```

### audit_events

```sql
id
user_id
research_query_id
event_type
event_payload
created_at
```

## Constraints

- document version must belong to an existing document
- passage must belong to a document version
- verification result must reference a claim
- client cannot directly set verification status
- content hashes must detect accidental duplicate/corrupted records
- canonical legal identifiers should be unique where applicable

---

# 16. Indexing Strategy

PostgreSQL indexes:

- `document_type`
- `court_id`
- `jurisdiction`
- `effective_from`
- `effective_to`
- `canonical_identifier`
- `content_hash`
- `research_queries.user_id`
- `claims.research_query_id`

Search index:

- case names
- citations
- section identifiers
- statutory terms
- paragraph text

Vector index:

- passage embeddings
- filtered by jurisdiction/document type/version where supported

---

# 17. Partitioning Strategy

For initial deployment, avoid premature partitioning.

At large scale, consider partitioning:

- audit events by time
- research queries by time
- verification logs by time

Legal corpus partitioning should primarily use retrieval filters rather than physically splitting data unless scale requires it.

---

# 18. Backup Strategy

Production:

- automated PostgreSQL backups
- point-in-time recovery
- object-storage versioning
- vector index rebuild capability
- immutable corpus manifests
- periodic disaster-recovery drills

Target metrics:

```text
RPO: defined according to deployment tier
RTO: defined according to deployment tier
```

---

# 19. System Architecture

```text
                    ┌──────────────────────┐
                    │     React Client     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    API Gateway       │
                    │ Authentication/RBAC  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Query Understanding  │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
       ┌──────────────┐                  ┌──────────────┐
       │ BM25 Search  │                  │ Vector Search│
       └──────┬───────┘                  └──────┬───────┘
              └────────────────┬────────────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Candidate Merge      │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Authority Filter     │
                    │ Temporal Filter       │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Cross-Encoder        │
                    │ Reranker             │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Evidence Selector    │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ LLM Generation       │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Claim Extraction     │
                    └──────────┬───────────┘
                               ▼
                ┌──────────────┴──────────────┐
                ▼                             ▼
      ┌─────────────────┐           ┌─────────────────┐
      │ Claim Verifier  │           │ Citation        │
      │                 │           │ Verifier        │
      └────────┬────────┘           └────────┬────────┘
               └──────────────┬──────────────┘
                              ▼
                    ┌──────────────────────┐
                    │ Conflict Detection   │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Provenance +         │
                    │ Confidence           │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Fail-Closed Gate     │
                    └──────────┬───────────┘
                               ▼
                    ┌──────────────────────┐
                    │ Final Response       │
                    └──────────────────────┘
```

---

# 20. Service Architecture

For the initial implementation, use a modular monolith rather than unnecessary microservices.

Recommended modules:

```text
api
auth
query
retrieval
reranking
generation
claims
verification
citations
temporal
authority
provenance
evaluation
audit
ingestion
```

As scale grows, independently extract:

- retrieval service
- embedding service
- generation service
- verification worker
- ingestion worker

---

# 21. Why Modular Monolith First?

The team is small and the academic timeline is constrained.

A modular monolith provides:

- simpler local development
- easier debugging
- lower operational complexity
- shared type contracts
- faster integration

The internal module boundaries should still be clean enough for later service extraction.

---

# 22. Query Processing

Execution loop:

```text
1. Interpret
2. Normalize
3. Validate
4. Detect entities
5. Detect temporal context
6. Plan retrieval
7. Retrieve
8. Filter by authority/temporal validity
9. Rerank
10. Generate
11. Extract claims
12. Verify
13. Validate citations
14. Detect conflicts
15. Compute evidence state
16. Apply fail-closed policy
17. Respond
18. Log trace
```

No free-form tool-calling agent is required.

---

# 23. Retrieval Architecture

## 23.1 BM25

Best for:

- exact case names
- statutory sections
- citation numbers
- legal terminology
- rare legal phrases

## 23.2 Semantic Retrieval

Best for:

- paraphrased questions
- concept similarity
- legal reasoning expressed differently
- discovery of conceptually related judgments

## 23.3 Hybrid Merge

Candidate scores should be normalized before combination.

Conceptually:

```text
HybridScore =
α * LexicalScore +
β * SemanticScore
```

Weights must be tuned only on development data, never on the frozen final evaluation set.

---

# 24. Authority-Aware Reranking

Candidate ranking should consider:

```text
Lexical relevance
Semantic relevance
Authority
Temporal applicability
Citation exactness
Document quality
```

Conceptual ranking function:

```text
FinalScore =
w1 * semantic
+ w2 * lexical
+ w3 * authority
+ w4 * temporal
+ w5 * citation_match
```

Weights must be empirically evaluated.

---

# 25. Claim Extraction

A generated answer must be transformed into discrete claims.

Example:

```text
Generated sentence:
"The Supreme Court held X in 2022 and therefore Y applies."

Claims:
C1: Supreme Court held X.
C2: The decision occurred in 2022.
C3: Y applies.
```

## Claim Extraction Metrics

- Precision
- Recall
- Claim boundary accuracy
- Claim verification coverage

Claim extraction errors must be measured separately because an incorrect claim decomposition can corrupt downstream verification.

---

# 26. Claim Verification

Each claim is checked against its evidence.

Possible internal evidence states:

```text
SUPPORTED_CURRENT
SUPPORTED_HISTORICAL
PARTIALLY_SUPPORTED
CONFLICTING
UNSUPPORTED
UNVERIFIABLE
```

User-facing status may remain:

```text
supported
flagged
rejected
```

---

# 27. Three-Tier Citation Verification

## Tier 1 — Existence

Does the cited legal document actually exist in the authoritative corpus?

## Tier 2 — Citation / Metadata

Do:

- case name
- citation number
- court
- date
- identifier

match the authoritative record?

## Tier 3 — Passage-Level Support

Does the cited passage actually support the generated claim?

Tier 3 may use:

- semantic similarity
- NLI/entailment
- structural metadata
- optional LLM-as-judge comparison

Tier 3 must never be described as perfect.

---

# 28. Tier-3 Feasibility Spike

Before full integration:

- collect 20 real judgment excerpts
- create 10 genuine paraphrases
- create 10 fabricated paraphrases
- test at least two approaches
- record accuracy
- record false acceptance and false rejection

Candidate approaches:

1. embedding similarity
2. NLI cross-encoder
3. optional LLM-as-judge

If no approach meets the predefined detection bar, prototype behavior becomes:

> **flag for human review rather than automatically reject.**

This decision must be made before the team becomes dependent on Tier-3 assumptions.

---

# 29. Conflict Detection

HALO must not silently select one authority when evidence contains potentially conflicting positions.

Pipeline:

```text
Retrieved Authorities
        ↓
Relevant Propositions
        ↓
Temporal Comparison
        ↓
Authority Comparison
        ↓
Conflict Detection
        ↓
User Warning
```

Example output:

```text
Potentially conflicting authorities identified.

Authority A:
...

Authority B:
...

HALO has not automatically determined which interpretation should be preferred.
```

---

# 30. Fail-Closed Policy

If evidence is unavailable:

```text
Do not fabricate.
```

If a claim is unsupported:

```text
Flag or remove it.
```

If a citation does not exist:

```text
Reject the citation.
```

If a citation exists but metadata is wrong:

```text
Flag the mismatch.
```

If a passage does not support the claim:

```text
Flag or reject according to Tier-3 policy.
```

If legal versions conflict:

```text
Surface the temporal/authority conflict.
```

---

# 31. Confidence and Calibration

Confidence is an evidence-quality indicator.

It is NOT:

> “Probability that the legal conclusion is objectively correct.”

Signals may include:

- supported-claim proportion
- retrieval relevance
- reranker score
- authority score
- temporal validity
- verification strength
- conflict status

Evaluate confidence using:

- human-judged correctness
- calibration curves
- Expected Calibration Error
- Brier score where applicable

Never use the LLM's self-reported confidence as the authoritative confidence value.

---

# 32. Final Response Contract

```json
{
  "answer_text": "...",
  "claims": [
    {
      "claim_id": "...",
      "claim_text": "...",
      "citation": {
        "case_name": "...",
        "court": "...",
        "date": "...",
        "citation_no": "...",
        "paragraph": "..."
      },
      "verification_status": "supported",
      "evidence_state": "SUPPORTED_CURRENT",
      "evidence_passage_id": "..."
    }
  ],
  "sources": [],
  "confidence_score": 0.87,
  "evidence_coverage": 0.94,
  "warnings": [],
  "conflicts_detected": false,
  "temporal_context": "...",
  "corpus_version": "...",
  "model_version": "...",
  "verification_timestamp": "...",
  "retrieval_trace": []
}
```

The frontend cannot set:

- verification status
- confidence
- evidence state
- source identity

These are server-controlled.

---

# 33. REST API

## POST /api/v1/research/query

Request:

```json
{
  "query_text": "What is the legal position regarding ...?",
  "domain_hint": "constitutional",
  "temporal_context": "2021",
  "jurisdiction": "India"
}
```

Response:

```json
{
  "query_id": "q_123",
  "status": "completed",
  "answer": {},
  "warnings": []
}
```

## GET /api/v1/research/{query_id}

Returns complete research result.

## GET /api/v1/research/{query_id}/claims

Returns claim-level verification.

## GET /api/v1/research/{query_id}/evidence

Returns evidence passages and provenance.

## GET /api/v1/citations/{citation_id}/verify

Runs/returns citation verification information.

## GET /api/v1/documents/{document_id}

Returns canonical document metadata.

## GET /api/v1/health

Health check.

## Internal/Admin APIs

```text
POST /api/v1/ingestion/documents
GET  /api/v1/evaluation/runs
GET  /api/v1/audit/{query_id}
```

---

# 34. Error Handling

Standard response:

```json
{
  "error": {
    "code": "INSUFFICIENT_EVIDENCE",
    "message": "No authoritative evidence was found for the requested claim.",
    "request_id": "..."
  }
}
```

Error categories:

```text
INVALID_QUERY
OUT_OF_SCOPE
INSUFFICIENT_EVIDENCE
VERIFICATION_FAILED
CITATION_NOT_FOUND
TEMPORAL_CONFLICT
AUTHORITY_CONFLICT
INGESTION_ERROR
MODEL_TIMEOUT
RATE_LIMITED
INTERNAL_ERROR
```

---

# 35. Security Architecture

## Authentication

Use:

- OAuth2/OIDC for production
- secure session/JWT strategy
- short-lived access tokens
- refresh-token rotation where applicable

## Authorization

RBAC roles:

```text
LAWYER
RESEARCHER
ADMIN
INSTITUTION_ADMIN
```

## Encryption

- TLS in transit
- encryption at rest
- managed secrets
- key rotation

## API Security

- authentication
- authorization
- rate limiting
- request validation
- payload size limits
- timeout limits
- structured error responses

## Audit Logging

Log:

- user
- query
- retrieval run
- source set
- model version
- verification results
- final decision
- timestamp

Do not log unnecessary sensitive user data.

---

# 36. Prompt Injection Defense

Retrieved legal documents are **untrusted data**, never instructions.

Architecture:

```text
System Instructions
       ↓
User Query
       ↓
Retrieved Evidence [DATA ONLY]
       ↓
Generation
```

Controls:

- explicit evidence delimiters
- structured prompt templates
- output schema validation
- instruction/data separation
- no tool execution based on retrieved text
- adversarial retrieval tests

---

# 37. OWASP-Oriented Controls

Address:

- broken access control
- injection
- authentication failures
- insecure deserialization
- security misconfiguration
- vulnerable dependencies
- insufficient logging
- SSRF where relevant
- denial-of-service
- sensitive data exposure

---

# 38. Frontend / UX

## Design Language

Professional legal-research interface.

Prioritize:

- readability
- evidence visibility
- low cognitive load
- clear verification states
- source traceability

Avoid:

- excessive AI visual effects
- misleading “100% accurate” badges
- unexplained confidence scores

## Core Components

- search bar
- query context controls
- answer panel
- claim cards
- verification badges
- evidence viewer
- citation panel
- warnings
- conflict panel
- research history

---

# 39. Screens

## Screen 1 — Research Dashboard

Purpose:

Start and manage legal research.

Components:

- query input
- domain filter
- jurisdiction
- date/historical context
- recent searches

Validation:

- query cannot be empty
- unsupported scope must be identified

---

## Screen 2 — Research Result

Components:

- synthesized answer
- claim list
- verification status
- confidence/evidence indicators
- source list
- warnings

User action:

Click a claim to inspect evidence.

---

## Screen 3 — Evidence View

Shows:

```text
Claim
 ↓
Source
 ↓
Document version
 ↓
Exact passage
```

---

## Screen 4 — Citation Verification

Displays:

```text
Existence       ✓
Metadata        ✓
Passage Support ✓
```

or the corresponding failure state.

---

## Screen 5 — Conflict View

Displays:

- authority A
- authority B
- dates
- courts
- supporting passages
- temporal relationship
- warning

---

## Screen 6 — Research History

Shows:

- previous queries
- answers
- evidence
- verification outcome
- timestamps

---

# 40. Explainability

Instead of showing only:

```text
Confidence: 0.91
```

show:

```text
Why this answer is supported

✓ 5/5 claims have supporting evidence
✓ Citation metadata verified
✓ Source exists in authoritative corpus
✓ Passage support verified
✓ No unresolved authority conflict detected
✓ Evidence is valid for requested time period
```

---

# 41. Backend Folder Structure

```text
halo/
├── app/
│   ├── api/
│   ├── auth/
│   ├── query/
│   ├── retrieval/
│   ├── reranking/
│   ├── generation/
│   ├── claims/
│   ├── verification/
│   ├── citations/
│   ├── temporal/
│   ├── authority/
│   ├── provenance/
│   ├── conflict/
│   ├── ingestion/
│   ├── evaluation/
│   ├── audit/
│   └── core/
├── tests/
├── scripts/
├── migrations/
├── data/
└── configs/
```

Each module should follow:

```text
controller
service
repository
schema
model
tests
```

---

# 42. AI/ML Architecture

## Generator

Baseline:

- local LLM through Ollama
- model selected based on local hardware and evaluation

Cloud LLMs may be used for development/evaluation but must not be required for the baseline deployment.

## Embeddings

Sentence-transformer family or equivalent local embedding model.

## Reranker

Cross-encoder.

## Verification

Candidate approaches:

- embedding similarity
- NLI model
- optional LLM judge

The verifier must remain logically independent from the generator.

---

# 43. Model Governance

Track:

```text
model_name
model_version
provider
quantization
context_length
embedding_model
reranker_model
verification_model
prompt_version
```

Every evaluation and answer should be reproducible from the relevant version identifiers.

---

# 44. Data Ingestion Pipeline

```text
Source
 ↓
Download/Acquire
 ↓
Validate
 ↓
Parse
 ↓
Metadata Resolution
 ↓
OCR if necessary
 ↓
Normalize
 ↓
Version Assignment
 ↓
Content Hash
 ↓
Passage Segmentation
 ↓
Lexical Index
 ↓
Embedding
 ↓
Vector Index
 ↓
Corpus Manifest
```

Metadata resolution priority:

1. structured source metadata
2. parsed document metadata
3. OCR as last resort

If identity cannot be established with sufficient confidence:

> Do not ingest as authoritative evidence.

---

# 45. Data Quality Controls

Check:

- missing metadata
- duplicate documents
- duplicate passages
- broken paragraph numbering
- OCR corruption
- invalid citation identifiers
- inconsistent dates
- invalid temporal ranges
- content hash collisions
- source licensing metadata

---

# 46. Evaluation Framework

## Retrieval

- Precision@K
- Recall@K
- MRR
- nDCG

## Generation

- sentence grounding
- claim grounding
- answer completeness

## Verification

- fabricated citation detection rate
- wrong citation-number detection rate
- fabricated paragraph detection rate
- false acceptance rate
- false rejection rate
- unsupported claim rate

## Temporal

- correct version selection
- historical applicability accuracy

## Authority

- Authority@K
- authoritative-source retrieval rate

## System

- P50 latency
- P95 latency
- P99 latency
- throughput
- cost/query

## Calibration

- Expected Calibration Error
- Brier score where appropriate

---

# 47. Frozen Evaluation Policy

Two datasets must be frozen before tuning:

1. hand-labeled retrieval dataset
2. synthetic fabricated-citation dataset

They must not be used to tune:

- retrieval thresholds
- prompts
- verification thresholds
- ranking weights

They are reserved for final reporting.

---

# 48. Ablation Study

Required comparisons:

```text
A. LLM-only

B. Vector-only RAG

C. Hybrid BM25 + Vector RAG

D. Hybrid + Reranking

E. Hybrid + Reranking + Verification
```

Additional:

```text
Three-tier verification
vs.
Existence-only verification
```

Optional:

```text
Local LLM
vs.
Cloud LLM
```

The key research comparison is:

> **Hybrid RAG without verification vs. Hybrid RAG with verification.**

---

# 49. Robustness Test Suite

| Test | Expected Behavior |
|---|---|
| Fabricated case | Reject/flag |
| Real case, wrong citation number | Detect mismatch |
| Real case, fabricated paragraph | Tier-3 flags |
| Vague query | Clarify or lower-confidence answer |
| No evidence | Abstain |
| OCR corruption | Avoid silently trusting corrupted text |
| Out-of-domain query | Decline/redirect |
| User asks to fabricate citation | Verification cannot be bypassed |
| Later amendment | Correct temporal version selected |
| Conflicting judgments | Surface conflict |
| Prompt injection in document | Ignore document instructions |
| Duplicate judgment | Deduplicate |
| Repealed provision | Mark historical/inapplicable |
| Superseded authority | Account for supersession |

---

# 50. Observability

Track:

```text
request latency
retrieval latency
reranking latency
generation latency
verification latency
P50
P95
P99
```

Trust metrics:

```text
abstention rate
unsupported claim rate
citation failure rate
verification failure rate
conflict rate
```

Operational metrics:

```text
CPU
memory
GPU usage if available
queue depth
database latency
vector search latency
error rate
```

---

# 51. Scalability Strategy

## 1–100 users

Modular monolith.

## 100–10,000 users

- horizontal API replicas
- Redis
- worker queue
- independent retrieval workers

## Larger scale

Separate:

- retrieval service
- embedding service
- generation service
- verification workers
- ingestion workers

Vector and relational storage scale independently.

---

# 52. High Availability

Production deployment:

```text
Load Balancer
      ↓
API Replicas
      ↓
Service Layer
 ┌────┴─────────┐
 ↓              ↓
PostgreSQL    Search/Vector
 ↓              ↓
Backup        Replication
```

Requirements:

- health checks
- readiness checks
- graceful degradation
- retry policies
- timeouts
- circuit breakers where needed

---

# 53. Deployment Architecture

## Development

```text
React
+
FastAPI
+
SQLite
+
local/in-memory vector index
+
local LLM
```

## Target Production

```text
React
 ↓
Reverse Proxy / Load Balancer
 ↓
FastAPI instances
 ↓
PostgreSQL
Qdrant
BM25 Search
Redis
Object Storage
Worker Queue
Ollama/Model Runtime
Monitoring
Logging
```

Infrastructure may be introduced gradually.

Implementation sequencing does not change the target architecture.

---

# 54. Docker / Kubernetes Strategy

Docker:

- frontend container
- API container
- worker container
- model runtime container where appropriate
- PostgreSQL/Qdrant development services

Kubernetes becomes relevant when:

- multiple replicas are required
- autoscaling is required
- enterprise deployment demands orchestration

Do not introduce Kubernetes merely for demonstration value.

---

# 55. CI/CD

Pipeline:

```text
Git Push
 ↓
Lint
 ↓
Unit Tests
 ↓
Security Scan
 ↓
Build
 ↓
Integration Tests
 ↓
Evaluation Smoke Tests
 ↓
Container Build
 ↓
Deployment
 ↓
Health Check
```

Every model/prompt/corpus change that can affect verification should trigger evaluation.

---

# 56. Testing Strategy

## Unit Tests

- query parsing
- temporal filtering
- authority scoring
- claim extraction
- citation parsing
- verification rules

## Integration Tests

- retrieval → reranking
- retrieval → generation
- generation → claim extraction
- claim → verification
- citation → metadata lookup

## System Tests

End-to-end research query.

## Performance Tests

- latency
- throughput
- concurrent queries

## Security Tests

- authentication
- authorization
- injection
- prompt injection
- rate limits
- access-control bypass

## Regression Tests

Frozen hallucination/citation cases.

---

# 57. Example Critical Test Cases

### TC-01 Fabricated Case

Input:

A question causing the generator to cite a non-existent judgment.

Expected:

```text
Tier 1 = FAIL
Claim = REJECTED
```

### TC-02 Wrong Citation Number

Expected:

```text
Case exists = TRUE
Citation metadata = MISMATCH
Claim = FLAGGED/REJECTED
```

### TC-03 Fabricated Paragraph

Expected:

```text
Case exists = TRUE
Citation = TRUE
Passage support = FALSE
```

### TC-04 Historical Question

Expected:

```text
Requested year = 2021
Retrieved provision = version valid in 2021
```

### TC-05 Conflicting Authorities

Expected:

```text
Conflict detected
User warning shown
```

---

# 58. Business Model

## Free / Research

- limited queries
- basic evidence view

## Professional

- higher query limits
- full verification
- history
- advanced evidence inspection

## Law Firm

- team workspace
- private corpus
- RBAC
- audit
- SSO
- analytics

## Enterprise / Government

- private/on-premise deployment
- custom corpus
- dedicated infrastructure
- SLA
- security/compliance controls

The business model should be validated through user interviews before committing to pricing.

---

# 59. Competitive Positioning

| Capability | Traditional Search | General LLM | HALO |
|---|---:|---:|---:|
| Keyword search | ✓ | — | ✓ |
| Semantic search | Limited | ✓ | ✓ |
| Answer synthesis | — | ✓ | ✓ |
| Citation existence verification | Limited | ✗ | ✓ |
| Citation metadata verification | Limited | ✗ | ✓ |
| Passage-level claim verification | ✗ | ✗ | ✓ |
| Temporal validity | Varies | ✗ | ✓ |
| Authority-aware ranking | Limited | ✗ | ✓ |
| Evidence provenance | Limited | ✗ | ✓ |
| Claim-level verification | ✗ | ✗ | ✓ |
| Fail-closed behavior | — | ✗ | ✓ |
| Conflict surfacing | Limited | Unreliable | ✓ |

---

# 60. Technical Moat

HALO's moat is not the LLM.

It is the evidence infrastructure:

1. curated authoritative corpus
2. legal document/version model
3. hybrid retrieval
4. authority-aware ranking
5. temporal legal reasoning
6. claim-level verification
7. three-tier citation verification
8. evidence provenance
9. evaluation datasets
10. verification benchmarks
11. audit trail

Over time, evaluation data and verification failure patterns can improve the system without changing the core architecture.

---

# 61. Hackathon Demo Strategy

## Demo 1 — Normal Legal Question

```text
Query
 ↓
HALO retrieves evidence
 ↓
Answer generated
 ↓
Claims verified
 ↓
Evidence displayed
```

## Demo 2 — Fabricated Citation

Show:

```text
LLM-only → fabricated citation
HALO → citation does not exist → rejected
```

## Demo 3 — Wrong Citation Number

Show:

```text
Real case
+
Wrong citation number
 ↓
Tier 2 detects mismatch
```

## Demo 4 — Fabricated Paragraph

Show:

```text
Real case
+
invented paragraph
 ↓
Tier 3 detects lack of passage support
```

## Demo 5 — Historical Law

Show:

```text
Question asks for historical position
 ↓
Temporal filtering
 ↓
Correct historical version
```

## Demo 6 — Conflict

Show:

```text
Authority A
vs.
Authority B
 ↓
HALO surfaces conflict
```

---

# 62. Judge Psychology

Judges are likely to ask:

### “Isn't this just RAG?”

Answer:

> No. RAG retrieves evidence, but HALO adds authority-aware retrieval, temporal filtering, claim-level verification, three-tier citation verification, conflict detection, and fail-closed presentation.

### “Can you guarantee no hallucinations?”

Answer:

> No. We do not claim to eliminate hallucinations. We guarantee a narrower and measurable property: unsupported claims are not presented as verified facts.

### “Why not use a legal database directly?”

Answer:

> Traditional databases are strong at retrieval but require users to formulate precise searches. HALO combines source discovery with evidence-grounded synthesis and explicit verification.

### “Why not use agents?”

Answer:

> The core research contribution is verification, not autonomous orchestration. A deterministic pipeline is easier to audit, reproduce, secure, and evaluate.

### “What happens when law changes?”

Answer:

> Legal provisions are versioned with effective dates and temporal relationships, so historical and current legal positions are treated separately.

### “What happens when two judgments conflict?”

Answer:

> HALO surfaces the conflict with source, date, authority, and evidence context rather than silently choosing one.

---

# 63. 3-Minute Pitch

HALO addresses a dangerous problem in legal AI: fluent answers are not necessarily trustworthy answers.

General LLMs can fabricate cases, misstate sections, invent citations, and mix outdated law with current law.

Traditional legal search is more reliable but forces lawyers to already know what they are looking for.

HALO combines the two approaches.

A lawyer asks a natural-language question. HALO performs hybrid BM25 and semantic retrieval, applies authority and temporal filters, reranks evidence, and generates an answer grounded in authoritative legal passages.

But generation is not the final step.

HALO extracts every legal claim and verifies it. Citations are checked for existence, metadata correctness, and passage-level support. Conflicts and historical versions are surfaced.

If evidence is missing, HALO does not guess.

It flags or withholds the claim.

Our goal is not to claim perfect AI.

Our goal is measurable trustworthiness.

---

# 64. 5-Minute Pitch Structure

1. Problem — 45 sec
2. Existing gap — 30 sec
3. HALO architecture — 60 sec
4. Live hallucination demo — 60 sec
5. Verification demo — 60 sec
6. Evaluation results — 45 sec
7. Impact/business — 30 sec

---

# 65. 10-Minute Pitch Structure

1. Problem and case study
2. User pain
3. Existing approaches
4. HALO architecture
5. Hybrid retrieval
6. Authority and temporal layer
7. Claim verification
8. Citation verification
9. Conflict handling
10. Live demo
11. Ablation results
12. Security
13. Scalability
14. Business model
15. Future roadmap

---

# 66. Research Contribution

HALO's research contribution is:

> **An evidence-first legal RAG architecture in which retrieval, authority, temporal applicability, claim verification, and citation verification are treated as explicit measurable stages rather than assuming that retrieval context alone guarantees trustworthy generation.**

Research questions:

1. Does hybrid retrieval improve legal retrieval recall?
2. Does reranking improve evidence quality?
3. Does verification reduce unsupported claims?
4. Does three-tier citation verification detect failure modes missed by existence-only checks?
5. Does temporal filtering reduce outdated-law errors?
6. Does authority-aware ranking improve source quality?
7. Can confidence be calibrated against human judgments?

---

# 67. Primary Risks

## Risk 1 — Tier-3 Generalization

Mitigation:

- feasibility spike
- multiple signals
- category-level reporting
- human-review fallback

## Risk 2 — Claim Extraction

Mitigation:

- structured output
- claim-level evaluation
- manual annotations

## Risk 3 — OCR

Mitigation:

- OCR quality checks
- source metadata priority
- abstention on uncertain metadata

## Risk 4 — Corpus Completeness

Mitigation:

- explicit scope
- corpus manifest
- “insufficient evidence” behavior

## Risk 5 — Outdated Law

Mitigation:

- document versioning
- effective dates
- temporal filters

## Risk 6 — Authority Misranking

Mitigation:

- authority metadata
- configurable ranking
- Authority@K evaluation

## Risk 7 — Prompt Injection

Mitigation:

- evidence/data separation
- output schema
- adversarial testing

---

# 68. MVP Definition

## P0 — Never Cut

- authoritative corpus
- BM25
- semantic retrieval
- hybrid retrieval
- basic grounded generation
- Tier-1 citation verification
- provenance
- fail-closed behavior
- core evaluation harness

## P1 — Core Quality

- reranking
- Tier-2 verification
- Tier-3 verification
- temporal validity
- authority ranking
- confidence
- conflict detection

## P2 — Product Expansion

- team workspace
- advanced dashboard
- private corpus
- enterprise RBAC
- multiple model backends

## P3 — Cut First

- mobile app
- Telegram
- multilingual support
- notifications
- autonomous legal drafting

---

# 69. Development Roadmap

## Sprint 1 — Corpus + Data Model

Tasks:

- define legal scope
- ingest 50–100 real judgments
- ingest 2–3 Acts
- design database
- implement document/version model
- build metadata validator
- create frozen retrieval dataset

Deliverables:

- queryable corpus
- canonical metadata
- versioned documents

---

## Sprint 2 — Retrieval + Tier-3 Spike

Tasks:

- BM25
- embeddings
- vector retrieval
- hybrid merge
- temporal filtering
- authority metadata
- run Tier-3 spike

Deliverables:

- Recall@K results
- Tier-3 decision
- retrieval API

---

## Sprint 3 — Reranking + Generation

Tasks:

- cross-encoder
- evidence selection
- local LLM
- structured generation
- claim extraction

Deliverables:

- grounded answer pipeline
- claim extraction benchmark

---

## Sprint 4 — Verification + Product

Tasks:

- Tier 1
- Tier 2
- Tier 3
- provenance
- conflict detection
- confidence
- React dashboard

Deliverables:

- end-to-end verified research experience

---

## Sprint 5 — Evaluation + Hardening

Tasks:

- ablation
- robustness tests
- security tests
- performance tests
- observability
- Docker
- deployment
- demo preparation

Deliverables:

- final evaluation report
- production-style deployment
- hackathon demo

---

# 70. Implementation Order

Build in this exact order:

```text
1. Define corpus scope
2. Inspect real legal data
3. Design canonical data model
4. Build ingestion + validation
5. Build frozen retrieval dataset
6. Implement BM25
7. Implement semantic retrieval
8. Implement hybrid retrieval
9. Measure Recall@K
10. Implement temporal filtering
11. Implement authority metadata
12. Run Tier-3 feasibility spike
13. Implement reranking
14. Integrate local LLM
15. Implement structured generation
16. Implement claim extraction
17. Implement Tier-1 verification
18. Implement Tier-2 verification
19. Implement Tier-3 verification according to spike outcome
20. Implement provenance
21. Implement conflict detection
22. Implement confidence/calibration
23. Implement fail-closed gate
24. Build API
25. Build React UI
26. Add authentication/RBAC
27. Add audit logging
28. Add security tests
29. Add observability
30. Containerize
31. Run ablation
32. Run robustness suite
33. Benchmark performance
34. Prepare demo
35. Document limitations
```

---

# 71. Production Readiness Audit

| Dimension | Target |
|---|---:|
| Innovation | 9/10 |
| Retrieval quality | 9/10 |
| Verification architecture | 9.5/10 |
| Temporal reasoning | 8.5/10 |
| Data architecture | 9/10 |
| Security | 8.5/10 |
| Scalability | 8.5/10 |
| Reliability | 9/10 |
| Explainability | 9/10 |
| Research rigor | 9.5/10 |
| Business potential | 8/10 |
| Hackathon impact | 9.5/10 |

**Target overall architecture maturity: ~90/100 after implementation and validation.**

These are architecture targets, not claimed benchmark results.

---

# 72. Production Readiness Checklist

## Data

- [ ] authoritative corpus defined
- [ ] metadata validated
- [ ] document versioning
- [ ] temporal relationships
- [ ] provenance
- [ ] source licensing tracked

## AI

- [ ] retrieval benchmark
- [ ] reranking benchmark
- [ ] claim extraction benchmark
- [ ] citation verification benchmark
- [ ] Tier-3 feasibility result
- [ ] model versioning

## Security

- [ ] authentication
- [ ] authorization
- [ ] RBAC
- [ ] encryption
- [ ] secrets management
- [ ] prompt injection defense
- [ ] audit logs
- [ ] rate limiting

## Infrastructure

- [ ] Docker
- [ ] health checks
- [ ] monitoring
- [ ] backups
- [ ] disaster recovery
- [ ] logging

## Reliability

- [ ] fail closed
- [ ] timeouts
- [ ] retries
- [ ] graceful degradation
- [ ] conflict handling
- [ ] temporal validation

---

# 73. Acceptance Gates

HALO is not considered MVP-complete until:

### Gate 1 — Corpus

A defined legal subset is queryable.

### Gate 2 — Retrieval

Hybrid retrieval meets the predefined Recall@K target.

### Gate 3 — Generation

Answers are grounded in retrieved evidence.

### Gate 4 — Verification

Known fabricated citation patterns are detected at the required rates.

### Gate 5 — Temporal

Historical/current test cases select correct document versions.

### Gate 6 — Provenance

Every supported claim has a traceable source path.

### Gate 7 — Fail Closed

Unsupported claims cannot be marked supported by the client or generator.

### Gate 8 — Evaluation

All frozen test sets and ablations are reported.

---

# 74. Long-Term Roadmap

## Phase 1

Trusted legal research.

## Phase 2

Law-firm research workspaces.

## Phase 3

Private enterprise legal corpora.

## Phase 4

Government/institutional deployments.

## Phase 5

Legal intelligence infrastructure:

- legal change monitoring
- precedent tracking
- structured legal knowledge graphs
- amendment alerts
- organization-specific evidence systems

---

# 75. Final Engineering Principles

HALO should always follow these rules:

1. **The LLM is not the source of truth.**
2. **The legal corpus is the evidence layer.**
3. **Retrieval is not verification.**
4. **Citation existence is not citation correctness.**
5. **Citation correctness is not passage support.**
6. **Evidence support is not absolute legal correctness.**
7. **Current law and historical law must be distinguishable.**
8. **Authority matters in addition to relevance.**
9. **Every supported claim must have provenance.**
10. **Unsupported claims must be flagged or withheld.**
11. **Verification must be measurable.**
12. **Failure must be visible rather than silently hidden.**
13. **Security must treat retrieved documents as untrusted data.**
14. **The architecture must scale independently by workload.**
15. **Research claims must be supported by evaluation, not marketing language.**

---

# 76. Final Product Definition

## Product

**HALO — Hallucination-Aware Retrieval and Verification Framework for AI-Assisted Legal Research**

## Tagline

> **Search the law. Verify the evidence. Trust the answer.**

## One-Line Description

> HALO is an evidence-first legal research platform that combines hybrid retrieval, authority-aware and time-aware legal evidence selection, grounded generation, claim-level verification, and citation validation before presenting AI-assisted legal research results.

## Core Differentiator

> **HALO does not ask lawyers to trust an LLM. It makes the LLM prove its claims against authoritative evidence before those claims are presented as supported.**

---

# 77. Final Position

HALO should not compete by claiming to be the most conversational legal AI.

It should compete on:

```text
Evidence
+
Verification
+
Provenance
+
Temporal Validity
+
Authority
+
Auditability
```

The central product promise is therefore:

> **If HALO cannot establish an evidence chain for a claim, HALO does not present that claim as verified fact.**

That principle is the foundation of the product, architecture, evaluation methodology, security model, and long-term startup strategy.
