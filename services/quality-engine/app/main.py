"""
DataSonar Quality Engine — FastAPI entrypoint.

Lifecycle:
  - Startup: Connect MongoDB, start Kafka consumer background task
  - Shutdown: Stop Kafka consumer, disconnect MongoDB
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.core.config import get_settings
from app.core.logger import configure_logging, get_logger
from app.services.kafka_consumer import kafka_consumer
from app.services.mongodb_service import mongodb_service

configure_logging()
logger = get_logger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown of background services."""
    logger.info(
        "Starting Quality Engine",
        service=settings.service_name,
        environment=settings.environment,
    )

    # Connect MongoDB
    await mongodb_service.connect()

    # Start Kafka consumer (non-blocking background task)
    await kafka_consumer.start()

    yield  # App is running

    # Graceful shutdown
    logger.info("Shutting down Quality Engine")
    await kafka_consumer.stop()
    await mongodb_service.disconnect()


app = FastAPI(
    title="DataSonar Quality Engine",
    description=(
        "Real-time data quality scoring across 6 dimensions: "
        "completeness, accuracy, consistency, timeliness, validity, uniqueness."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
