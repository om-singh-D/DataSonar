"""Event processing pipeline for anomaly detection."""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from app.core.config import get_settings
from app.infra.kafka_consumer import KafkaConsumerClient
from app.infra.rabbitmq_producer import RabbitMQProducer
from app.schemas.alerts import AnomalyAlert
from app.schemas.events import IncomingQualityEvent
from app.services.model_manager import ModelManager
from app.services.outlier_detection import QualityOutlierDetector
from app.services.status_registry import SourceStatusRegistry
from app.services.time_series import TimeSeriesAnomalyDetector


class MessageProcessor:
    """Coordinates ingest, anomaly detection, and alert publishing."""

    def __init__(
        self,
        consumer: KafkaConsumerClient,
        producer: RabbitMQProducer,
        time_series_detector: TimeSeriesAnomalyDetector,
        quality_detector: QualityOutlierDetector,
        model_manager: ModelManager,
        status_registry: SourceStatusRegistry,
    ) -> None:
        self._settings = get_settings()
        self._consumer = consumer
        self._producer = producer
        self._time_series_detector = time_series_detector
        self._quality_detector = quality_detector
        self._model_manager = model_manager
        self._status_registry = status_registry
        self._running = False
        self._task: asyncio.Task | None = None

    async def start(self) -> None:
        if self._running:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())

    async def stop(self) -> None:
        self._running = False
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _run_loop(self) -> None:
        while self._running:
            try:
                payload = await self._consumer.get_message()
                if payload is None:
                    await asyncio.sleep(0.2)
                    continue
                await self.process_message(payload)
            except asyncio.CancelledError:
                raise
            except Exception:
                await asyncio.sleep(0.5)

    async def process_message(self, payload: dict) -> dict:
        event = IncomingQualityEvent.model_validate(payload)
        await self._model_manager.ensure_source_baseline(event.source_id)

        volume_anomaly, volume_score = self._time_series_detector.detect(
            source_id=event.source_id,
            timestamp=event.timestamp,
            record_count=event.metadata.record_count,
        )
        quality_anomaly, quality_score = self._quality_detector.detect(
            source_id=event.source_id,
            overall_score=event.quality.overall_score,
        )

        drift = await self._model_manager.detect_drift(event.source_id)
        if drift:
            await self._model_manager.retrain_source(event.source_id)

        anomaly_types: list[str] = []
        anomaly_score = 0.0

        if volume_anomaly:
            anomaly_types.append("volume")
            anomaly_score = max(anomaly_score, volume_score)
        if quality_anomaly:
            anomaly_types.append("quality")
            anomaly_score = max(anomaly_score, quality_score)
        if event.metadata.schema_changed:
            anomaly_types.append("schema_change")
            anomaly_score = max(anomaly_score, 0.7)

        self._status_registry.record_processed(
            source_id=event.source_id,
            model_loaded=self._model_manager.is_loaded(event.source_id),
        )

        if anomaly_types and anomaly_score >= self._settings.ANOMALY_ALERT_THRESHOLD:
            severity = "high" if anomaly_score >= 0.85 else "medium"
            alert = AnomalyAlert(
                event_id=event.event_id,
                source_id=event.source_id,
                pipeline_id=event.pipeline_id,
                detected_at=datetime.now(timezone.utc),
                anomaly_types=anomaly_types,
                severity=severity,
                summary=f"Anomaly detected: {', '.join(anomaly_types)}",
                quality_score=event.quality.overall_score,
                record_count=event.metadata.record_count,
            )
            await self._producer.publish(alert.model_dump(mode="json"))
            self._status_registry.record_alert(event.source_id)

            return {
                "alert_published": True,
                "anomaly_types": anomaly_types,
                "anomaly_score": anomaly_score,
            }

        return {
            "alert_published": False,
            "anomaly_types": anomaly_types,
            "anomaly_score": anomaly_score,
        }
