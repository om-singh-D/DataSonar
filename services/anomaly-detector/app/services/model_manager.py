"""Model management and MinIO persistence."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.core.config import get_settings
from app.infra.minio_client import MinioModelClient
from app.services.outlier_detection import QualityOutlierDetector


class ModelManager:
    """Handles baseline loading, retraining metadata, and drift checks."""

    def __init__(self, minio_client: MinioModelClient, outlier_detector: QualityOutlierDetector):
        self._settings = get_settings()
        self._minio = minio_client
        self._outlier_detector = outlier_detector
        self._loaded_sources: set[str] = set()

    async def initialize(self) -> None:
        await self._minio.ensure_bucket()

    async def ensure_source_baseline(self, source_id: str) -> dict[str, Any]:
        object_name = f"baselines/{source_id}.json"
        payload = await self._minio.get_json(object_name)
        if payload is None:
            payload = {
                "source_id": source_id,
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "quality_mean": None,
            }
            await self._minio.put_json(object_name, payload)
        self._loaded_sources.add(source_id)
        return payload

    async def retrain_source(self, source_id: str) -> dict[str, Any]:
        baseline = {
            "source_id": source_id,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "quality_mean": self._outlier_detector.baseline_mean(source_id),
        }
        await self._minio.put_json(f"baselines/{source_id}.json", baseline)
        self._loaded_sources.add(source_id)
        return baseline

    async def detect_drift(self, source_id: str) -> bool:
        baseline = await self._minio.get_json(f"baselines/{source_id}.json")
        if not baseline:
            return False
        baseline_mean = baseline.get("quality_mean")
        current_mean = self._outlier_detector.baseline_mean(source_id)
        if baseline_mean is None or current_mean is None:
            return False
        return abs(float(current_mean) - float(baseline_mean)) >= self._settings.DRIFT_MEAN_DELTA_THRESHOLD

    def is_loaded(self, source_id: str) -> bool:
        return source_id in self._loaded_sources
