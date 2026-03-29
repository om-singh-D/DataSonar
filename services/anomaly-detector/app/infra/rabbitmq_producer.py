"""RabbitMQ producer for anomaly alerts."""

from __future__ import annotations

import json

import aio_pika
from aio_pika import ExchangeType, Message

from app.core.config import get_settings


class RabbitMQProducer:
    """Async RabbitMQ producer wrapper."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._connection: aio_pika.RobustConnection | None = None
        self._channel: aio_pika.abc.AbstractRobustChannel | None = None
        self._exchange: aio_pika.abc.AbstractExchange | None = None

    async def connect(self) -> None:
        if self._connection is not None:
            return

        self._connection = await aio_pika.connect_robust(self.settings.RABBITMQ_URL)
        self._channel = await self._connection.channel()
        self._exchange = await self._channel.declare_exchange(
            self.settings.RABBITMQ_EXCHANGE,
            ExchangeType.TOPIC,
            durable=True,
        )

    async def close(self) -> None:
        if self._connection is None:
            return
        await self._connection.close()
        self._connection = None
        self._channel = None
        self._exchange = None

    async def publish(self, payload: dict) -> None:
        if self._exchange is None:
            raise RuntimeError("RabbitMQ producer is not connected")

        message = Message(
            body=json.dumps(payload, default=str).encode("utf-8"),
            content_type="application/json",
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
        )
        await self._exchange.publish(message, routing_key=self.settings.RABBITMQ_ROUTING_KEY)

    async def healthcheck(self) -> bool:
        return bool(self._connection and not self._connection.is_closed)


rabbitmq_producer = RabbitMQProducer()
