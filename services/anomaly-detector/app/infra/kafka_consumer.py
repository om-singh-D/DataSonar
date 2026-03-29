"""Kafka consumer client for anomaly detector."""

from __future__ import annotations

import asyncio
import json
from typing import Any

from aiokafka import AIOKafkaConsumer

from app.core.config import get_settings


class KafkaConsumerClient:
    """Async Kafka consumer wrapper."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._consumer: AIOKafkaConsumer | None = None

    async def start(self) -> None:
        if self._consumer is not None:
            return

        self._consumer = AIOKafkaConsumer(
            self.settings.KAFKA_TOPIC_QUALITY_SCORED,
            bootstrap_servers=self.settings.kafka_brokers_list,
            group_id=self.settings.KAFKA_CONSUMER_GROUP,
            value_deserializer=lambda value: json.loads(value.decode("utf-8")),
            enable_auto_commit=True,
            auto_offset_reset="latest",
        )
        await self._consumer.start()

    async def stop(self) -> None:
        if self._consumer is None:
            return
        await self._consumer.stop()
        self._consumer = None

    async def get_message(self, timeout_ms: int = 1000) -> dict[str, Any] | None:
        if self._consumer is None:
            return None

        batches = await self._consumer.getmany(timeout_ms=timeout_ms, max_records=1)
        for records in batches.values():
            if records:
                return records[0].value
        return None

    async def healthcheck(self) -> bool:
        if self._consumer is None:
            return False

        try:
            await asyncio.wait_for(self._consumer.client.force_metadata_update(), timeout=2)
            return True
        except Exception:
            return False


kafka_consumer_client = KafkaConsumerClient()
