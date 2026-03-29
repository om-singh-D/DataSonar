"""
Async MongoDB service using Motor.
Stores and queries QualityReport documents.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import DESCENDING

from app.core.config import get_settings
from app.core.logger import get_logger
from app.schemas.event import QualityReport

logger = get_logger(__name__)
_settings = get_settings()


class MongoDBService:
    def __init__(self) -> None:
        self._client: Optional[AsyncIOMotorClient] = None
        self._db: Optional[AsyncIOMotorDatabase] = None

    async def connect(self) -> None:
        self._client = AsyncIOMotorClient(_settings.mongodb_uri)
        self._db = self._client[_settings.mongodb_db_name]
        # Create indexes
        await self._db[_settings.mongodb_collection].create_index(
            [("source_id", DESCENDING), ("scored_at", DESCENDING)]
        )
        await self._db[_settings.mongodb_collection].create_index(
            [("composite_score", DESCENDING)]
        )
        await self._db[_settings.mongodb_collection].create_index("event_id", unique=True)
        logger.info("MongoDB connected", db=_settings.mongodb_db_name)

    async def disconnect(self) -> None:
        if self._client:
            self._client.close()
            logger.info("MongoDB disconnected")

    @property
    def collection(self):
        return self._db[_settings.mongodb_collection]

    async def save_quality_report(self, report: QualityReport) -> str:
        """Insert a quality report. Returns the inserted document ID."""
        doc = report.model_dump()
        # Convert datetime objects to ISO strings for MongoDB compatibility
        doc["event_timestamp"] = report.event_timestamp.isoformat()
        doc["scored_at"] = report.scored_at.isoformat()

        result = await self.collection.insert_one(doc)
        logger.info("Quality report saved", event_id=report.event_id, mongo_id=str(result.inserted_id))
        return str(result.inserted_id)

    async def get_reports(
        self,
        source_id: Optional[str] = None,
        min_score: Optional[float] = None,
        grade: Optional[str] = None,
        limit: int = 50,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """List quality reports with optional filters."""
        query: Dict[str, Any] = {}
        if source_id:
            query["source_id"] = source_id
        if min_score is not None:
            query["composite_score"] = {"$gte": min_score}
        if grade:
            query["grade"] = grade

        cursor = (
            self.collection.find(query, {"_id": 0})
            .sort("scored_at", DESCENDING)
            .skip(skip)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def get_latest_by_source(self, source_id: str) -> Optional[Dict[str, Any]]:
        """Return the most recent quality report for a source."""
        doc = await self.collection.find_one(
            {"source_id": source_id}, {"_id": 0}, sort=[("scored_at", DESCENDING)]
        )
        return doc

    async def get_summary_stats(self) -> Dict[str, Any]:
        """Aggregated stats across all pipelines."""
        pipeline = [
            {
                "$group": {
                    "_id": "$source_id",
                    "source_name": {"$last": "$source_name"},
                    "avg_score": {"$avg": "$composite_score"},
                    "min_score": {"$min": "$composite_score"},
                    "max_score": {"$max": "$composite_score"},
                    "report_count": {"$sum": 1},
                    "latest_scored_at": {"$max": "$scored_at"},
                }
            },
            {"$sort": {"avg_score": DESCENDING}},
        ]
        cursor = self.collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)

        total_reports = await self.collection.count_documents({})

        return {
            "total_reports": total_reports,
            "by_source": results,
        }

    async def count_reports(
        self,
        source_id: Optional[str] = None,
        min_score: Optional[float] = None,
        grade: Optional[str] = None,
    ) -> int:
        query: Dict[str, Any] = {}
        if source_id:
            query["source_id"] = source_id
        if min_score is not None:
            query["composite_score"] = {"$gte": min_score}
        if grade:
            query["grade"] = grade
        return await self.collection.count_documents(query)


# Singleton instance shared across the app
mongodb_service = MongoDBService()
