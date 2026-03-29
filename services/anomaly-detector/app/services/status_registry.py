"""In-memory source status tracking."""

from __future__ import annotations

from datetime import datetime, timezone

from app.schemas.alerts import SourceStatus


class SourceStatusRegistry:
    """Stores latest processing status by source."""

    def __init__(self) -> None:
        self._status: dict[str, SourceStatus] = {}

    def record_processed(self, source_id: str, model_loaded: bool) -> None:
        status = self._status.get(source_id) or SourceStatus(source_id=source_id)
        status.last_processed_at = datetime.now(timezone.utc)
        status.processed_events += 1
        status.model_loaded = model_loaded
        self._status[source_id] = status

    def record_alert(self, source_id: str) -> None:
        status = self._status.get(source_id) or SourceStatus(source_id=source_id)
        status.last_alert_at = datetime.now(timezone.utc)
        status.anomaly_events += 1
        self._status[source_id] = status

    def get(self, source_id: str) -> SourceStatus:
        return self._status.get(source_id) or SourceStatus(source_id=source_id)

    def list_all(self) -> list[SourceStatus]:
        return [self._status[key] for key in sorted(self._status.keys())]


status_registry = SourceStatusRegistry()
