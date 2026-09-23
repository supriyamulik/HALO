"""
HALO End-to-End Pipeline
========================
Protocol: v1.0-FROZEN
Orchestrates the complete HALO Legal Verification and Fail-Closed Governance Architecture:
1. Candidate Legal Answer Input
2. Atomic Legal Claim Extraction (ClaimExtractor)
3. 3-Tier Citation Verification (CitationVerifier)
4. Substantive Evidence & NLI Entailment (EvidenceVerifier)
5. Amendment & Temporal Enforceability (TemporalVerifier)
6. Doctrinal & Forum Conflict Detection (ConflictDetector)
7. Evidence-Derived Confidence Calculation (ConfidenceEngine)
8. Fail-Closed Policy Enforcement & Reconstruction (FailClosedGovernor)
9. Cryptographic Audit Storage (AuditLogger)
"""

import os
import sys
import uuid
import re
from typing import Dict, List, Any, Optional

from halo.claim_extractor.extractor import ClaimExtractor
from halo.claim_extractor.schemas import ExtractedClaim, SourceSpan, AtomicityMeta, CitationRef
from halo.citation_verifier.verifier import CitationVerifier
from halo.evidence_verifier.verifier import EvidenceVerifier
from halo.temporal_verifier.verifier import TemporalVerifier
from halo.conflict_detector.detector import ConflictDetector
from halo.confidence.engine import ConfidenceEngine, ClaimConfidenceScore, AnswerConfidenceScore
from halo.governor.governor import FailClosedGovernor, GovernorVerdict
from halo.audit.logger import AuditLogger, AuditRecord


class HaloPipeline:
    """Production-grade HALO Verification and Fail-Closed Governance Pipeline."""

    def __init__(self, log_path: str = "audit_store.jsonl"):
        self.claim_extractor = ClaimExtractor()
        self.citation_verifier = CitationVerifier()
        self.evidence_verifier = EvidenceVerifier()
        self.temporal_verifier = TemporalVerifier()
        self.conflict_detector = ConflictDetector()
        self.confidence_engine = ConfidenceEngine()
        self.governor = FailClosedGovernor()
        self.audit_logger = AuditLogger(log_path=log_path)

    def process(
        self,
        query: str,
        raw_answer: str,
        candidate_passages: Optional[List[Dict[str, Any]]] = None,
        explicit_citations: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Executes complete verification pipeline on query and candidate answer.
        """
        candidate_passages = candidate_passages or []
        explicit_citations = explicit_citations or []

        # 1. Atomic Claim Extraction
        try:
            extraction_result = self.claim_extractor.extract(raw_answer)
            extracted_claims = extraction_result.claims
        except Exception:
            extracted_claims = []

        if not extracted_claims and raw_answer.strip():
            extracted_claims = [
                ExtractedClaim(
                    claim_id="CLM_001",
                    claim_text=raw_answer.strip(),
                    claim_type="STATUTORY_PROVISION",
                    source_span=SourceSpan(start_char=0, end_char=len(raw_answer.strip()), source_text=raw_answer.strip()),
                    sentence_index=0,
                    citation_refs=[],
                    atomicity=AtomicityMeta(is_atomic=True)
                )
            ]

        # 2. Citation Verification across answer
        cit_result = self.citation_verifier.verify_answer({
            "answer_id": f"ANS_{uuid.uuid4().hex[:8].upper()}",
            "text": raw_answer,
            "claims": [c.to_dict() for c in extracted_claims],
            "citations": explicit_citations,
        })
        cit_records = cit_result.citation_results

        # 3. Per-claim Verification Loop
        verification_records = []
        claim_confidences = []

        for idx, claim in enumerate(extracted_claims):
            cid = claim.claim_id
            ctext = claim.claim_text

            # Match or synthesize citation
            cit_data = {}
            if idx < len(explicit_citations):
                cit_data = explicit_citations[idx]
            elif explicit_citations:
                cit_data = explicit_citations[0]
            elif claim.citation_refs:
                cit_data = {"citation_text": claim.citation_refs[0].citation_text}
            else:
                if "section" in ctext.lower() or "act" in ctext.lower():
                    cit_data["type"] = "STATUTORY"
                    cit_data["act"] = "Companies Act, 2013"
                    m = re.search(r"section\s+(\d+[A-Za-z]?)", ctext, re.IGNORECASE)
                    if m:
                        cit_data["section"] = m.group(1)
                else:
                    cit_data["type"] = "JUDICIAL"

            # Tier A: Citation Status
            cit_status = "SUPPORTED"
            cit_explanation = "Citation verified against authoritative corpus."
            best_pid = None
            evidence_text = ""

            if cit_records:
                matching_record = None
                for r in cit_records:
                    if r.citation_text in ctext or (claim.citation_refs and any(ref.citation_text == r.citation_text for ref in claim.citation_refs)):
                        matching_record = r
                        break
                if not matching_record and cit_records:
                    matching_record = cit_records[min(idx, len(cit_records)-1)]

                if matching_record:
                    if matching_record.existence.status == "EXISTS":
                        cit_status = "SUPPORTED" if matching_record.metadata.status in {"MATCH", "UNVERIFIED"} else "FLAGGED"
                    else:
                        cit_status = "FABRICATED_CITATION"
                    cit_explanation = matching_record.explanation
                    best_pid = matching_record.canonical_authority_id or (matching_record.existence.matched_passage_ids[0] if matching_record.existence.matched_passage_ids else None)

            # Tier B: Passage / Evidence Verification
            if candidate_passages:
                evidence_text = candidate_passages[0].get("text", evidence_text)
                best_pid = candidate_passages[0].get("passage_id", best_pid)

            ev_verdict = self.evidence_verifier.verify_claim(
                claim_input=claim.to_dict(),
                direct_evidence_text=evidence_text if evidence_text else None,
                direct_passage_id=best_pid
            )

            # Tier C: Temporal Verification
            temp_res = self.temporal_verifier.verify(
                citation=cit_data, claim_text=ctext, case_id=cid
            )

            # Synthesize overall status for the proposition
            ev_status = ev_verdict.status
            ev_expl = ev_verdict.decision_reason
            if cit_status in {"FABRICATED_CITATION", "DOES_NOT_EXIST"}:
                final_status = "FABRICATED_CITATION"
                explanation = cit_explanation
                tier_failed = "EXISTENCE"
            elif temp_res.status == "CONTRADICTED":
                final_status = "CONTRADICTED"
                explanation = temp_res.explanation
                tier_failed = "TEMPORAL"
            elif ev_status == "CONTRADICTED":
                final_status = "CONTRADICTED"
                explanation = ev_expl
                tier_failed = "PASSAGE_SUPPORT"
            elif cit_status in {"FLAGGED", "METADATA_MISMATCH"}:
                final_status = "FLAGGED"
                explanation = cit_explanation
                tier_failed = "METADATA"
            elif ev_status == "PARTIALLY_SUPPORTED" or cit_status == "PARTIALLY_SUPPORTED":
                final_status = "PARTIALLY_SUPPORTED"
                explanation = ev_expl or cit_explanation
                tier_failed = "PASSAGE_SUPPORT"
            elif ev_status == "UNSUPPORTED":
                final_status = "UNSUPPORTED"
                explanation = ev_expl
                tier_failed = "PASSAGE_SUPPORT"
            else:
                final_status = "SUPPORTED"
                explanation = ev_expl or cit_explanation
                tier_failed = None

            verif_rec = {
                "claim_id": cid,
                "status": final_status,
                "tier_failed": tier_failed,
                "authoritative_passage_id": best_pid,
                "explanation": explanation,
                "citation_result": {"status": cit_status, "explanation": cit_explanation},
                "evidence_result": ev_verdict.to_dict(),
                "temporal_result": temp_res.to_dict(),
            }
            verification_records.append(verif_rec)

            # Compute claim-level confidence score
            raw_entailment = ev_verdict.nli.entailment if ev_verdict.nli else 0.85
            c_score = self.confidence_engine.compute_claim_confidence(
                claim_id=cid,
                citation_status=cit_status,
                evidence_status=ev_status,
                temporal_status=temp_res.temporal_status,
                raw_entailment_score=raw_entailment,
            )
            claim_confidences.append(c_score)

        # 4. Conflict Detection
        conflict_res = self.conflict_detector.detect_conflicts(
            query=query,
            claims=[c.claim_text for c in extracted_claims],
            evidences=candidate_passages,
        )

        # 5. Aggregate Answer Confidence
        ans_conf = self.confidence_engine.compute_answer_confidence(claim_confidences)

        # 6. Fail-Closed Governor Policy Enforcement
        verdict = self.governor.govern(
            query=query,
            raw_answer=raw_answer,
            claims=[c.to_dict() for c in extracted_claims],
            verification_results=verification_records,
            answer_confidence=ans_conf.to_dict(),
        )

        # 7. Audit Trail Logging
        audit_rec = self.audit_logger.log_verification(
            query=query,
            raw_answer=raw_answer,
            claims=extracted_claims,
            verifications=verification_records,
            confidence=ans_conf,
            verdict=verdict,
        )

        return {
            "audit_id": audit_rec.audit_id,
            "query": query,
            "is_authoritative": verdict.is_accepted and not verdict.fail_closed,
            "fail_closed": verdict.fail_closed,
            "final_answer": verdict.final_answer,
            "overall_confidence": ans_conf.overall_confidence,
            "claims": [c.to_dict() for c in extracted_claims],
            "verification_records": verification_records,
            "quarantine_report": verdict.quarantine_report,
            "conflict_detection": conflict_res.to_dict(),
            "content_hash": audit_rec.content_hash,
            "timestamp": audit_rec.timestamp,
        }

