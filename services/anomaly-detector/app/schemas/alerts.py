"""Outgoing anomaly payload schemas."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AnomalyAlert(BaseModel):
    event_id: str
    source_id: str
    pipeline_id: str
    detected_at: datetime
    anomaly_types: list[str]
    severity: str
    summary: str
    quality_score: float
    record_count: int


class ModelRetrainRequest(BaseModel):
    source_id: str


class SourceStatus(BaseModel):
    source_id: str
    last_processed_at: datetime | None = None
    last_alert_at: datetime | None = None
    processed_events: int = 0
    anomaly_events: int = 0
    model_loaded: bool = False
