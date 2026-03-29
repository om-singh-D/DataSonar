"""MinIO client for model artifact operations."""

from __future__ import annotations

import asyncio
import io
import json
from typing import Any

from minio import Minio
from minio.error import S3Error

from app.core.config import get_settings


class MinioModelClient:
    """Object storage adapter for model baselines."""

    def __init__(self) -> None:
        self.settings = get_settings()
        self._client = Minio(
            endpoint=self.settings.MINIO_ENDPOINT,
            access_key=self.settings.MINIO_ACCESS_KEY,
            secret_key=self.settings.MINIO_SECRET_KEY,
            secure=self.settings.MINIO_SECURE,
        )

    async def ensure_bucket(self) -> None:
        exists = await asyncio.to_thread(
            self._client.bucket_exists,
            self.settings.MINIO_BUCKET_MODELS,
        )
        if not exists:
            await asyncio.to_thread(self._client.make_bucket, self.settings.MINIO_BUCKET_MODELS)

    async def get_json(self, object_name: str) -> dict[str, Any] | None:
        try:
            response = await asyncio.to_thread(
                self._client.get_object,
                self.settings.MINIO_BUCKET_MODELS,
                object_name,
            )
            try:
                payload = response.read().decode("utf-8")
                return json.loads(payload)
            finally:
                response.close()
                response.release_conn()
        except S3Error as exc:
            if exc.code in {"NoSuchKey", "NoSuchBucket"}:
                return None
            raise

    async def put_json(self, object_name: str, payload: dict[str, Any]) -> None:
        body = json.dumps(payload, default=str).encode("utf-8")
        data = io.BytesIO(body)
        await asyncio.to_thread(
            self._client.put_object,
            self.settings.MINIO_BUCKET_MODELS,
            object_name,
            data,
            len(body),
            "application/json",
        )

    async def healthcheck(self) -> bool:
        try:
            await asyncio.to_thread(self._client.list_buckets)
            return True
        except Exception:
            return False


minio_model_client = MinioModelClient()
