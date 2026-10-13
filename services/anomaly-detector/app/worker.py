"""Kafka-to-ML-to-RabbitMQ streaming worker for DataSonar."""

import asyncio
import logging
from datetime import datetime, timezone

from app.core.config import get_settings
from app.infra.kafka_consumer import kafka_consumer_client
from app.infra.rabbitmq_producer import rabbitmq_producer
from app.schemas.alerts import AnomalyAlert
from app.services.local_storage import LocalModelStorage
from app.services.model_manager import ModelManager
from app.services.outlier_detection import QualityOutlierDetector
from app.services.time_series import TimeSeriesAnomalyDetector

logging.basicConfig(
    level=get_settings().LOG_LEVEL,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("datasonar.anomaly-worker")


async def process_message(
    payload: dict,
    quality_detector: QualityOutlierDetector,
    time_detector: TimeSeriesAnomalyDetector,
) -> None:
    """Run existing detectors against one quality-score event."""
    source_id = str(payload.get("sourceId") or "")
    if not source_id:
        logger.warning("Ignoring quality event without sourceId")
        return

    quality = payload.get("quality") or {}
    metadata = payload.get("metadata") or {}

    score = float(quality["overallScore"])
    record_count = int(metadata.get("recordCount", 0))

    timestamp_value = payload.get("timestamp")
    if timestamp_value:
        timestamp = datetime.fromisoformat(
            str(timestamp_value).replace("Z", "+00:00")
        )
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
    else:
        timestamp = datetime.now(timezone.utc)

    quality_anomaly, quality_strength = quality_detector.detect(
        source_id, score
    )
    volume_anomaly, volume_strength = time_detector.detect(
        source_id, timestamp, record_count
    )

    anomaly_types = []
    strengths = []

    if quality_anomaly:
        anomaly_types.append("quality_degradation")
        strengths.append(quality_strength)

    if volume_anomaly:
        anomaly_types.append("volume_anomaly")
        strengths.append(volume_strength)

    logger.info(
        "Processed source=%s score=%.3f quality_anomaly=%s volume_anomaly=%s",
        source_id,
        score,
        quality_anomaly,
        volume_anomaly,
    )

    if not anomaly_types:
        return

    strength = max(strengths, default=0.0)
    settings = get_settings()

    alert = AnomalyAlert(
        event_id=str(payload.get("eventId") or ""),
        source_id=source_id,
        pipeline_id=str(payload.get("pipelineId") or source_id),
        detected_at=datetime.now(timezone.utc),
        anomaly_types=anomaly_types,
        severity="HIGH" if strength >= 0.8 else "MEDIUM",
        summary=(
            f"Detected {', '.join(anomaly_types)} for source "
            f"{source_id}; quality score={score:.3f}, "
            f"records={record_count}."
        ),
        quality_score=score,
        record_count=record_count,
    )

    await rabbitmq_producer.publish(alert.model_dump(mode="json"))
    logger.warning(
        "Anomaly alert published for source=%s types=%s",
        source_id,
        anomaly_types,
    )


async def run() -> None:
    """Initialize existing models and consume quality scores."""
    storage = LocalModelStorage()
    quality_detector = QualityOutlierDetector()
    time_detector = TimeSeriesAnomalyDetector()

    manager = ModelManager(storage, quality_detector, time_detector)
    manager.initialize()

    logger.info("Loaded persisted anomaly models")

    try:
        await rabbitmq_producer.connect()
        await kafka_consumer_client.start()
        logger.info("Streaming worker started")

        while True:
            payload = await kafka_consumer_client.get_message(timeout_ms=1000)
            if payload is None:
                continue

            try:
                await process_message(
                    payload,
                    quality_detector,
                    time_detector,
                )
            except Exception:
                logger.exception("Failed to process quality-score event")

    finally:
        await kafka_consumer_client.stop()
        await rabbitmq_producer.close()


if __name__ == "__main__":
    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        logger.info("Streaming worker stopped")
