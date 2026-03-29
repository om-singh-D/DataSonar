"""FastAPI entrypoint for anomaly detector service."""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException

from app.infra.kafka_consumer import kafka_consumer_client
from app.infra.minio_client import minio_model_client
from app.infra.rabbitmq_producer import rabbitmq_producer
from app.processor import MessageProcessor
from app.schemas.alerts import ModelRetrainRequest
from app.services.model_manager import ModelManager
from app.services.outlier_detection import QualityOutlierDetector
from app.services.status_registry import status_registry
from app.services.time_series import TimeSeriesAnomalyDetector

quality_detector = QualityOutlierDetector()
time_series_detector = TimeSeriesAnomalyDetector()
model_manager = ModelManager(minio_model_client, quality_detector)

processor = MessageProcessor(
    consumer=kafka_consumer_client,
    producer=rabbitmq_producer,
    time_series_detector=time_series_detector,
    quality_detector=quality_detector,
    model_manager=model_manager,
    status_registry=status_registry,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await minio_model_client.ensure_bucket()
    await model_manager.initialize()
    await rabbitmq_producer.connect()
    await kafka_consumer_client.start()
    await processor.start()

    yield

    await processor.stop()
    await kafka_consumer_client.stop()
    await rabbitmq_producer.close()


app = FastAPI(
    title="DataSonar Anomaly Detector",
    description="Detects anomalous behavior from quality-scored pipeline events.",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health() -> dict:
    kafka_ok = await kafka_consumer_client.healthcheck()
    rabbitmq_ok = await rabbitmq_producer.healthcheck()
    minio_ok = await minio_model_client.healthcheck()

    healthy = kafka_ok and rabbitmq_ok and minio_ok
    return {
        "status": "ok" if healthy else "degraded",
        "checks": {
            "kafka": kafka_ok,
            "rabbitmq": rabbitmq_ok,
            "minio": minio_ok,
        },
    }


@app.post("/api/v1/models/retrain")
async def retrain_source_model(request: ModelRetrainRequest) -> dict:
    baseline = await model_manager.retrain_source(request.source_id)
    return {
        "message": "Retrain completed",
        "source_id": request.source_id,
        "baseline": baseline,
    }


@app.get("/api/v1/status/{source_id}")
async def get_source_status(source_id: str) -> dict:
    status = status_registry.get(source_id)
    if status.processed_events == 0:
        raise HTTPException(status_code=404, detail="No status found for source")
    return status.model_dump(mode="json")


@app.get("/api/v1/status")
async def list_source_statuses() -> list[dict]:
    return [status.model_dump(mode="json") for status in status_registry.list_all()]
