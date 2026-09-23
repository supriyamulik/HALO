"""
Pydantic Schemas for Research Query and Verification Results
===========================================================
Protocol: PRD Section 32 Contract
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class ResearchQueryRequest(BaseModel):
    query_text: str = Field(..., description="Legal question or statement to research and verify")
    jurisdiction: Optional[str] = Field("Supreme Court of India", description="Target jurisdiction filter")
    court_level: Optional[str] = Field("All Courts", description="Court hierarchy filter")
    date_range: Optional[str] = Field("all", description="Temporal context filter")
    candidate_answer: Optional[str] = Field(None, description="Optional pre-generated candidate answer")


class CitationModel(BaseModel):
    case_name: Optional[str] = None
    court: Optional[str] = None
    date: Optional[str] = None
    citation_no: Optional[str] = None
    paragraph: Optional[str] = None


class ClaimModel(BaseModel):
    claim_id: str
    claim_text: str
    citation: Optional[CitationModel] = None
    verification_status: str  # "supported" | "warning" | "failed"
    evidence_state: str       # "SUPPORTED_CURRENT" | "SUPPORTED_DISPUTED" | "CONTRADICTED" | etc.
    evidence_passage_id: Optional[str] = None
    tier_failed: Optional[str] = None
    explanation: Optional[str] = None


class SourceModel(BaseModel):
    id: str
    title: str
    court: Optional[str] = None
    year: Optional[str] = None
    relevance: float = 1.0


class ResearchResultResponse(BaseModel):
    query_id: str
    query_text: Optional[str] = None
    answer_text: str
    claims: List[ClaimModel] = []
    sources: List[SourceModel] = []
    confidence_score: float
    evidence_coverage: float
    warnings: List[str] = []
    conflicts_detected: bool = False
    temporal_context: str = "Doctrine stable under current Indian corporate law."
    corpus_version: str = "IND-SC-2024-Q4"
    model_version: str = "halo-verify-v1.0-FROZEN"
    verification_timestamp: str
    audit_id: Optional[str] = None
    content_hash: Optional[str] = None
    fail_closed: bool = False


class QuerySubmitResponse(BaseModel):
    query_id: str
    status: str = "done"
    result: Optional[ResearchResultResponse] = None


class HistoryItem(BaseModel):
    query_id: str
    query_text: str
    date: str
    confidence_score: float
    verification_summary: Dict[str, int]
    conflicts_detected: bool
