"""
Async Kafka consumer using aiokafka.
Reads from datasonar.raw-events, scores each event, saves to MongoDB.
"""
from __future__ import annotations

import asyncio
import json
from typing import Optional

from aiokafka import AIOKafkaConsumer
from aiokafka.errors import KafkaConnectionError

from app.core.config import get_settings
from app.core.logger import get_logger
from app.schemas.event import EnrichedEvent
from app.services.mongodb_service import mongodb_service
from app.services.quality_scorer import score_event

logger = get_logger(__name__)
_settings = get_settings()

_RETRY_DELAY_SECONDS = 5
_MAX_RETRIES = 10


class KafkaConsumerService:
    def __init__(self) -> None:
        self._consumer: Optional[AIOKafkaConsumer] = None
        self._running = False
        self._task: Optional[asyncio.Task] = None

    @property
    def is_running(self) -> bool:
        return self._running

    async def start(self) -> None:
        """Start the consumer loop as a background task."""
        self._task = asyncio.create_task(self._consume_with_retry())
        logger.info(
            "Kafka consumer task started",
            topic=_settings.kafka_raw_events_topic,
            group=_settings.kafka_group_id,
        )

    async def stop(self) -> None:
        """Gracefully stop the consumer."""
        self._running = False
        if self._consumer:
            await self._consumer.stop()
            logger.info("Kafka consumer stopped")
        if self._task and not self._task.done():
            self._task.cancel()

    async def _consume_with_retry(self) -> None:
        """Connect with exponential backoff, then consume indefinitely."""
        attempt = 0
        while attempt < _MAX_RETRIES:
            try:
                await self._connect()
                self._running = True
                await self._consume_loop()
            except KafkaConnectionError as e:
                attempt += 1
                delay = _RETRY_DELAY_SECONDS * (2 ** min(attempt, 5))
                logger.warning(
                    "Kafka connection failed, retrying",
                    attempt=attempt,
                    delay=delay,
                    error=str(e),
                )
                await asyncio.sleep(delay)
            except asyncio.CancelledError:
                logger.info("Kafka consumer task cancelled")
                break
            except Exception as e:
                logger.error("Unexpected error in Kafka consumer", error=str(e))
                attempt += 1
                await asyncio.sleep(_RETRY_DELAY_SECONDS)

        self._running = False
        logger.error("Kafka consumer gave up after max retries", max_retries=_MAX_RETRIES)

    async def _connect(self) -> None:
        brokers = _settings.kafka_brokers.split(",")
        self._consumer = AIOKafkaConsumer(
            _settings.kafka_raw_events_topic,
            bootstrap_servers=brokers,
            group_id=_settings.kafka_group_id,
            auto_offset_reset="earliest",
            enable_auto_commit=True,
            value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        )
        await self._consumer.start()
        logger.info("Kafka consumer connected", brokers=brokers)

    async def _consume_loop(self) -> None:
        """Main consumption loop — scores each message."""
        async for msg in self._consumer:
            if not self._running:
                break
            try:
                await self._process_message(msg.value)
            except Exception as e:
                logger.error(
                    "Failed to process Kafka message",
                    error=str(e),
                    offset=msg.offset,
                    partition=msg.partition,
                )

    async def _process_message(self, payload: dict) -> None:
        """Deserialize → validate → score → persist."""
        try:
            event = EnrichedEvent.model_validate(payload)
        except Exception as e:
            logger.warning("Failed to parse event payload", error=str(e))
            return

        # Score the event (CPU-bound but fast for small records)
        report = score_event(event)

        # Persist to MongoDB
        await mongodb_service.save_quality_report(report)

        logger.info(
            "Event scored and saved",
            event_id=event.event_id,
            source_id=event.source_id,
            composite=report.composite_score,
            grade=report.grade,
        )


# Singleton
kafka_consumer = KafkaConsumerService()
