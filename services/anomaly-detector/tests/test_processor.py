from __future__ import annotations

from datetime import datetime, timezone

import pytest

from app.processor import MessageProcessor
from app.services.model_manager import ModelManager
from app.services.outlier_detection import QualityOutlierDetector
from app.services.status_registry import SourceStatusRegistry
from app.services.time_series import TimeSeriesAnomalyDetector


class FakeConsumer:
    async def get_message(self):
        return None


class FakeProducer:
    def __init__(self) -> None:
        self.messages: list[dict] = []

    async def publish(self, payload: dict) -> None:
        self.messages.append(payload)


class FakeMinioClient:
    def __init__(self) -> None:
        self.storage: dict[str, dict] = {}

    async def ensure_bucket(self) -> None:
        return None

    async def get_json(self, object_name: str):
        return self.storage.get(object_name)

    async def put_json(self, object_name: str, payload: dict):
        self.storage[object_name] = payload


class AlwaysAnomalyTimeSeries(TimeSeriesAnomalyDetector):
    def detect(self, source_id: str, timestamp: datetime, record_count: int):
        return True, 0.9


class NeverAnomalyQuality(QualityOutlierDetector):
    def detect(self, source_id: str, overall_score: float):
        return False, 0.1


def _sample_payload() -> dict:
    return {
        "eventId": "evt-1",
        "sourceId": "source-a",
        "pipelineId": "pipeline-1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "recordCount": 100,
            "schemaChanged": False,
        },
        "quality": {
            "overallScore": 0.92,
        },
    }


@pytest.mark.asyncio
async def test_processor_publishes_alert_when_anomaly_detected():
    producer = FakeProducer()
    model_manager = ModelManager(FakeMinioClient(), NeverAnomalyQuality())

    processor = MessageProcessor(
        consumer=FakeConsumer(),
        producer=producer,
        time_series_detector=AlwaysAnomalyTimeSeries(),
        quality_detector=NeverAnomalyQuality(),
        model_manager=model_manager,
        status_registry=SourceStatusRegistry(),
    )

    result = await processor.process_message(_sample_payload())

    assert result["alert_published"] is True
    assert len(producer.messages) == 1
    assert producer.messages[0]["source_id"] == "source-a"


@pytest.mark.asyncio
async def test_processor_skips_alert_when_no_anomaly():
    producer = FakeProducer()
    quality_detector = NeverAnomalyQuality()
    model_manager = ModelManager(FakeMinioClient(), quality_detector)

    processor = MessageProcessor(
        consumer=FakeConsumer(),
        producer=producer,
        time_series_detector=TimeSeriesAnomalyDetector(),
        quality_detector=quality_detector,
        model_manager=model_manager,
        status_registry=SourceStatusRegistry(),
    )

    result = await processor.process_message(_sample_payload())

    assert result["alert_published"] is False
    assert producer.messages == []
