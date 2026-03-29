"""Inbound event payload schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class EventMetadata(BaseModel):
    record_count: int = Field(alias="recordCount")
    schema_changed: bool = Field(default=False, alias="schemaChanged")


class QualityMetrics(BaseModel):
    overall_score: float = Field(alias="overallScore")


class IncomingQualityEvent(BaseModel):
    event_id: str = Field(alias="eventId")
    source_id: str = Field(alias="sourceId")
    pipeline_id: str = Field(alias="pipelineId")
    timestamp: datetime
    metadata: EventMetadata
    quality: QualityMetrics
