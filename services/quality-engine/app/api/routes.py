"""FastAPI routes for the Quality Engine."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.logger import get_logger
from app.schemas.event import ManualScoreRequest, QualityReport
from app.services.kafka_consumer import kafka_consumer
from app.services.mongodb_service import mongodb_service
from app.services.quality_scorer import score_manual

logger = get_logger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────

@router.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "datasonar-quality-engine",
        "kafka_consumer_running": kafka_consumer.is_running,
    }


# ─────────────────────────────────────────────
# Quality Score Endpoints
# ─────────────────────────────────────────────

@router.get("/api/v1/quality/scores", tags=["Quality"])
async def list_quality_scores(
    source_id: Optional[str] = Query(None, description="Filter by pipeline source ID"),
    min_score: Optional[float] = Query(None, ge=0.0, le=1.0, description="Minimum composite score"),
    grade: Optional[str] = Query(None, description="Filter by grade: A, B, C, D, F"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
):
    """List quality scores with optional filters. Paginated."""
    skip = (page - 1) * limit

    reports = await mongodb_service.get_reports(
        source_id=source_id,
        min_score=min_score,
        grade=grade,
        limit=limit,
        skip=skip,
    )
    total = await mongodb_service.count_reports(
        source_id=source_id,
        min_score=min_score,
        grade=grade,
    )

    return {
        "status": "success",
        "data": {
            "scores": reports,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": -(-total // limit),  # ceiling division
            },
        },
    }


@router.get("/api/v1/quality/scores/{source_id}/latest", tags=["Quality"])
async def get_latest_score(source_id: str):
    """Return the most recent quality report for a specific pipeline source."""
    report = await mongodb_service.get_latest_by_source(source_id)
    if not report:
        raise HTTPException(
            status_code=404, detail=f"No quality reports found for source '{source_id}'"
        )
    return {"status": "success", "data": {"score": report}}


@router.post("/api/v1/quality/score", response_model=QualityReport, tags=["Quality"])
async def score_manually(req: ManualScoreRequest):
    """
    Manually trigger quality scoring for a given payload.
    Returns the full 6-dimension report synchronously.
    Does NOT require data to flow through Kafka first.
    """
    report = score_manual(req)

    # Also persist it
    await mongodb_service.save_quality_report(report)

    return report


@router.get("/api/v1/quality/summary", tags=["Quality"])
async def get_summary():
    """Aggregated quality stats across all pipelines."""
    stats = await mongodb_service.get_summary_stats()
    return {"status": "success", "data": stats}
