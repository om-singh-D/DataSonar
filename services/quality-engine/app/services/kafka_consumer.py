
"""
Async Kafka consumer using aiokafka.
Reads raw events, scores them, saves reports to MongoDB,
and publishes quality scores to the output Kafka topic.
"""

from __future__ import annotations

import asyncio
import json
from typing import Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
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
        self._producer: Optional[AIOKafkaProducer] = None
        self._running = False
        self._task: Optional[asyncio.Task] = None

    @property
    def is_running(self) -> bool:
        return self._running

    async def start(self) -> None:
        """Start the Kafka processing loop in the background."""
        if self._task and not self._task.done():
            return

        self._task = asyncio.create_task(self._consume_with_retry())

        logger.info(
            "Kafka consumer task started",
            topic=_settings.kafka_raw_events_topic,
            group=_settings.kafka_group_id,
        )

    async def stop(self) -> None:
        """Gracefully stop the consumer and producer."""
        self._running = False

        if self._consumer is not None:
            await self._consumer.stop()
            self._consumer = None
            logger.info("Kafka consumer stopped")

        if self._producer is not None:
            await self._producer.stop()
            self._producer = None
            logger.info("Kafka producer stopped")

        if self._task and not self._task.done():
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

        self._task = None

    async def _consume_with_retry(self) -> None:
        """Connect with retry handling and consume events."""
        attempt = 0

        while attempt < _MAX_RETRIES:
            try:
                await self._connect()
                self._running = True
                attempt = 0

                await self._consume_loop()

                if not self._running:
                    break

                raise RuntimeError("Kafka consumer loop stopped unexpectedly")

            except asyncio.CancelledError:
                logger.info("Kafka consumer task cancelled")
                break

            except Exception as exc:
                attempt += 1

                logger.error(
                    "Unexpected error in Kafka consumer",
                    attempt=attempt,
                    error=str(exc),
                )

                await self._close_kafka_clients()

                if attempt >= _MAX_RETRIES:
                    break

                delay = _RETRY_DELAY_SECONDS * (2 ** min(attempt - 1, 5))

                logger.warning(
                    "Retrying Kafka connection",
                    attempt=attempt,
                    delay=delay,
                )

                await asyncio.sleep(delay)

        self._running = False
        logger.error(
            "Kafka consumer stopped after retries",
            max_retries=_MAX_RETRIES,
        )

    async def _connect(self) -> None:
        """Connect the consumer and producer to Kafka."""
        brokers = _settings.kafka_brokers_list

        if not brokers:
            raise ValueError("No Kafka brokers configured")

        self._producer = AIOKafkaProducer(
            bootstrap_servers=brokers,
            value_serializer=lambda value: json.dumps(value).encode("utf-8"),
        )
        await self._producer.start()

        try:
            self._consumer = AIOKafkaConsumer(
                _settings.kafka_raw_events_topic,
                bootstrap_servers=brokers,
                group_id=_settings.kafka_group_id,
                auto_offset_reset="earliest",
                enable_auto_commit=True,
                value_deserializer=lambda value: json.loads(
                    value.decode("utf-8")
                ),
            )
            await self._consumer.start()

        except Exception:
            await self._close_kafka_clients()
            raise

        logger.info(
            "Kafka consumer and producer connected",
            brokers=brokers,
            input_topic=_settings.kafka_raw_events_topic,
            output_topic=_settings.kafka_output_topic,
        )

    async def _close_kafka_clients(self) -> None:
        """Close Kafka clients safely after errors or shutdown."""
        if self._consumer is not None:
            try:
                await self._consumer.stop()
            except Exception as exc:
                logger.warning(
                    "Error stopping Kafka consumer",
                    error=str(exc),
                )
            finally:
                self._consumer = None

        if self._producer is not None:
            try:
                await self._producer.stop()
            except Exception as exc:
                logger.warning(
                    "Error stopping Kafka producer",
                    error=str(exc),
                )
            finally:
                self._producer = None

    async def _consume_loop(self) -> None:
        """Consume raw events and process them sequentially."""
        if self._consumer is None:
            raise RuntimeError("Kafka consumer is not initialized")

        async for msg in self._consumer:
            if not self._running:
                break

            try:
                await self._process_message(msg.value)

            except Exception as exc:
                logger.error(
                    "Failed to process Kafka message",
                    error=str(exc),
                    offset=msg.offset,
                    partition=msg.partition,
                )

    async def _process_message(self, payload: dict) -> None:
        """Validate, score, persist, and publish a quality report."""
        try:
            event = EnrichedEvent.model_validate(payload)
        except Exception as exc:
            logger.warning(
                "Failed to parse event payload",
                error=str(exc),
            )
            return

        # Calculate the six-dimensional quality score.
        report = score_event(event)

        # Persist the complete quality report in MongoDB.
        await mongodb_service.save_quality_report(report)

        if self._producer is None:
            raise RuntimeError("Kafka producer is not initialized")

        # Publish the fields expected by the anomaly detector.
        output_payload = {
            "eventId": report.event_id,
            "sourceId": report.source_id,
            "pipelineId": report.source_id,
            "timestamp": report.event_timestamp.isoformat(),
            "metadata": {
                "recordCount": report.record_count,
                "schemaChanged": (
                    event.event_type.value.lower() == "schema_change"
                ),
            },
            "quality": {
                "overallScore": report.composite_score,
            },
            "report": report.model_dump(mode="json"),
        }

        await self._producer.send_and_wait(
            _settings.kafka_output_topic,
            output_payload,
        )

        logger.info(
            "Quality report published",
            event_id=report.event_id,
            source_id=report.source_id,
            composite=report.composite_score,
            grade=report.grade,
            topic=_settings.kafka_output_topic,
        )


# Singleton instance shared by the application.
kafka_consumer = KafkaConsumerService()
