"""Pydantic schemas for events and quality scores."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from enum import Enum


# ─────────────────────────────────────────────
# Inbound event schema (matches ingestion output)
# ─────────────────────────────────────────────

class SourceType(str, Enum):
    database = "database"
    api = "api"
    file = "file"
    stream = "stream"
    webhook = "webhook"


class EventType(str, Enum):
    snapshot = "snapshot"
    incremental = "incremental"
    schema_change = "schema_change"
    heartbeat = "heartbeat"


class EventData(BaseModel):
    schema_: Optional[Dict[str, str]] = Field(None, alias="schema")
    records: List[Dict[str, Any]] = Field(default_factory=list)
    record_count: int = Field(0, alias="recordCount")

    model_config = {"populate_by_name": True}


class EventMetadata(BaseModel):
    pipeline: Optional[str] = None
    environment: Optional[str] = None
    tags: Optional[List[str]] = None


class EnrichedEvent(BaseModel):
    """Matches the enriched event produced by the Ingestion Service."""
    event_id: str = Field(alias="eventId")
    source_id: str = Field(alias="sourceId")
    source_name: str = Field(alias="sourceName")
    source_type: SourceType = Field(alias="sourceType")
    event_type: EventType = Field(alias="eventType")
    timestamp: datetime
    received_at: str = Field(alias="receivedAt")
    ingestion_service: str = Field(alias="ingestionService")
    validation_status: str = Field(alias="validationStatus")
    data: EventData
    metadata: Optional[EventMetadata] = None

    model_config = {"populate_by_name": True}


# ─────────────────────────────────────────────
# Quality score schemas
# ─────────────────────────────────────────────

class DimensionScore(BaseModel):
    """Score and explanation for a single quality dimension."""
    score: float = Field(..., ge=0.0, le=1.0, description="Score 0–1")
    details: str = Field(..., description="Human-readable explanation")
    passed: int = Field(..., description="Records/fields that passed")
    total: int = Field(..., description="Total records/fields checked")


class QualityDimensions(BaseModel):
    completeness: DimensionScore
    accuracy: DimensionScore
    consistency: DimensionScore
    timeliness: DimensionScore
    validity: DimensionScore
    uniqueness: DimensionScore


class QualityReport(BaseModel):
    """Full quality report stored in MongoDB and returned via API."""
    event_id: str
    source_id: str
    source_name: str
    source_type: str
    event_type: str
    event_timestamp: datetime
    scored_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    record_count: int
    composite_score: float = Field(..., ge=0.0, le=1.0)
    grade: str  # A/B/C/D/F
    dimensions: QualityDimensions
    weights_used: Dict[str, float]


class QualityScoreSummary(BaseModel):
    """Lightweight summary for list endpoints."""
    event_id: str
    source_id: str
    source_name: str
    composite_score: float
    grade: str
    record_count: int
    scored_at: datetime


class ManualScoreRequest(BaseModel):
    """Request body for POST /api/v1/quality/score (manual trigger)."""
    source_id: str = Field(..., alias="sourceId")
    source_name: str = Field(..., alias="sourceName")
    source_type: str = Field(..., alias="sourceType")
    records: List[Dict[str, Any]]
    declared_schema: Optional[Dict[str, str]] = Field(None, alias="schema")
    timestamp: Optional[datetime] = None

    model_config = {"populate_by_name": True}
