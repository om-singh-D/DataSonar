"""
6-Dimension Quality Scorer.

Dimensions:
  1. Completeness  — how many fields/records are non-null / non-empty
  2. Accuracy      — how well actual values conform to declared schema types
  3. Consistency   — absence of exact duplicate records
  4. Timeliness    — event age relative to configurable SLA threshold
  5. Validity      — records passing format/range rules (type coercion checks)
  6. Uniqueness    — unique records / total records (dedup ratio)

Composite score = weighted average of all 6 dimensions.
Grade: A ≥ 0.9, B ≥ 0.75, C ≥ 0.6, D ≥ 0.4, F < 0.4
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.core.config import get_settings
from app.core.logger import get_logger
from app.schemas.event import (
    DimensionScore,
    EnrichedEvent,
    ManualScoreRequest,
    QualityDimensions,
    QualityReport,
)

logger = get_logger(__name__)
_settings = get_settings()

# Python type-check map for declared schema types
_TYPE_MAP: Dict[str, tuple] = {
    "string": (str,),
    "str": (str,),
    "integer": (int,),
    "int": (int,),
    "float": (float, int),
    "number": (float, int),
    "boolean": (bool,),
    "bool": (bool,),
    "array": (list,),
    "object": (dict,),
}


def _grade(score: float) -> str:
    if score >= 0.9:
        return "A"
    if score >= 0.75:
        return "B"
    if score >= 0.6:
        return "C"
    if score >= 0.4:
        return "D"
    return "F"


# ─────────────────────────────────────────────────────
# Individual dimension scorers
# ─────────────────────────────────────────────────────

def _score_completeness(records: List[Dict[str, Any]]) -> DimensionScore:
    """Ratio of non-null, non-empty values across all fields of all records."""
    if not records:
        return DimensionScore(score=1.0, details="No records to evaluate", passed=0, total=0)

    total_fields = 0
    complete_fields = 0

    for record in records:
        for val in record.values():
            total_fields += 1
            if val is not None and val != "" and val != [] and val != {}:
                complete_fields += 1

    score = complete_fields / total_fields if total_fields > 0 else 1.0
    return DimensionScore(
        score=round(score, 4),
        details=f"{complete_fields}/{total_fields} non-null field values",
        passed=complete_fields,
        total=total_fields,
    )


def _score_accuracy(
    records: List[Dict[str, Any]],
    declared_schema: Optional[Dict[str, str]],
) -> DimensionScore:
    """Type conformance: actual values vs declared schema types."""
    if not declared_schema or not records:
        return DimensionScore(
            score=1.0,
            details="No schema declared — accuracy check skipped",
            passed=len(records),
            total=len(records),
        )

    total_checks = 0
    accurate = 0

    for record in records:
        for field, declared_type in declared_schema.items():
            if field not in record:
                continue
            total_checks += 1
            val = record[field]
            if val is None:
                # Null values don't fail accuracy (that's completeness)
                accurate += 1
                continue
            expected_types = _TYPE_MAP.get(declared_type.lower())
            if expected_types is None:
                # Unknown type — give benefit of doubt
                accurate += 1
                continue
            if isinstance(val, expected_types):
                accurate += 1

    if total_checks == 0:
        return DimensionScore(
            score=1.0, details="No schema fields found in records", passed=0, total=0
        )

    score = accurate / total_checks
    return DimensionScore(
        score=round(score, 4),
        details=f"{accurate}/{total_checks} fields match declared types",
        passed=accurate,
        total=total_checks,
    )


def _score_consistency(records: List[Dict[str, Any]]) -> DimensionScore:
    """Absence of exact duplicate records (hash-based dedup)."""
    if not records:
        return DimensionScore(score=1.0, details="No records to evaluate", passed=0, total=0)

    total = len(records)
    seen: set = set()
    duplicates = 0

    for record in records:
        key = hashlib.md5(
            json.dumps(record, sort_keys=True, default=str).encode()
        ).hexdigest()
        if key in seen:
            duplicates += 1
        else:
            seen.add(key)

    unique_count = total - duplicates
    score = unique_count / total
    return DimensionScore(
        score=round(score, 4),
        details=f"{duplicates} duplicate records found out of {total}",
        passed=unique_count,
        total=total,
    )


def _score_timeliness(event_timestamp: datetime) -> DimensionScore:
    """Linear decay: 1.0 at t=0, 0.0 at t=SLA_threshold."""
    sla = _settings.timeliness_sla_seconds
    now = datetime.now(timezone.utc)

    # Ensure event_timestamp is tz-aware
    if event_timestamp.tzinfo is None:
        event_timestamp = event_timestamp.replace(tzinfo=timezone.utc)

    age_seconds = (now - event_timestamp).total_seconds()
    age_seconds = max(0, age_seconds)  # guard against tiny clock skew

    if age_seconds >= sla:
        score = 0.0
        details = f"Event is {age_seconds:.0f}s old — exceeds SLA of {sla}s"
    else:
        score = 1.0 - (age_seconds / sla)
        details = f"Event is {age_seconds:.0f}s old (SLA: {sla}s)"

    return DimensionScore(
        score=round(score, 4),
        details=details,
        passed=1 if score > 0 else 0,
        total=1,
    )


def _score_validity(
    records: List[Dict[str, Any]],
    declared_schema: Optional[Dict[str, str]],
) -> DimensionScore:
    """
    Records that pass basic validity rules:
    - Numeric strings can be coerced to their declared numeric type
    - String fields don't exceed 10,000 chars
    - Array/object fields are parseable
    If no schema: checks that string values don't exceed length limit.
    """
    if not records:
        return DimensionScore(score=1.0, details="No records to evaluate", passed=0, total=0)

    total = len(records)
    valid = 0

    for record in records:
        record_valid = True

        for field, val in record.items():
            if val is None:
                continue

            declared_type = (declared_schema or {}).get(field, "").lower()

            # String length check
            if isinstance(val, str):
                if len(val) > 10_000:
                    record_valid = False
                    break
                # Try coercing to numeric if declared as such
                if declared_type in ("integer", "int"):
                    try:
                        int(val)
                    except (ValueError, TypeError):
                        record_valid = False
                        break
                elif declared_type in ("float", "number"):
                    try:
                        float(val)
                    except (ValueError, TypeError):
                        record_valid = False
                        break

        if record_valid:
            valid += 1

    score = valid / total
    return DimensionScore(
        score=round(score, 4),
        details=f"{valid}/{total} records pass validity rules",
        passed=valid,
        total=total,
    )


def _score_uniqueness(records: List[Dict[str, Any]]) -> DimensionScore:
    """Unique rows / total rows (complements consistency — measures data redundancy)."""
    if not records:
        return DimensionScore(score=1.0, details="No records to evaluate", passed=0, total=0)

    total = len(records)
    unique_hashes: set = set()

    for record in records:
        h = hashlib.sha256(
            json.dumps(record, sort_keys=True, default=str).encode()
        ).hexdigest()
        unique_hashes.add(h)

    unique_count = len(unique_hashes)
    score = unique_count / total
    return DimensionScore(
        score=round(score, 4),
        details=f"{unique_count} unique records out of {total}",
        passed=unique_count,
        total=total,
    )


# ─────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────

def score_event(event: EnrichedEvent) -> QualityReport:
    """Score an enriched event from the Kafka topic."""
    settings = get_settings()
    records = event.data.records
    declared_schema = event.data.schema_
    event_timestamp = event.timestamp

    return _build_report(
        event_id=event.event_id,
        source_id=event.source_id,
        source_name=event.source_name,
        source_type=event.source_type.value,
        event_type=event.event_type.value,
        event_timestamp=event_timestamp,
        records=records,
        declared_schema=declared_schema,
        settings=settings,
    )


def score_manual(req: ManualScoreRequest) -> QualityReport:
    """Score a manual request (synchronous, no Kafka)."""
    import uuid
    settings = get_settings()

    return _build_report(
        event_id=str(uuid.uuid4()),
        source_id=req.source_id,
        source_name=req.source_name,
        source_type=req.source_type,
        event_type="snapshot",
        event_timestamp=req.timestamp or datetime.now(timezone.utc),
        records=req.records,
        declared_schema=req.declared_schema,
        settings=settings,
    )


def _build_report(
    event_id: str,
    source_id: str,
    source_name: str,
    source_type: str,
    event_type: str,
    event_timestamp: datetime,
    records: List[Dict[str, Any]],
    declared_schema: Optional[Dict[str, str]],
    settings,
) -> QualityReport:
    completeness = _score_completeness(records)
    accuracy = _score_accuracy(records, declared_schema)
    consistency = _score_consistency(records)
    timeliness = _score_timeliness(event_timestamp)
    validity = _score_validity(records, declared_schema)
    uniqueness = _score_uniqueness(records)

    weights = {
        "completeness": settings.weight_completeness,
        "accuracy": settings.weight_accuracy,
        "consistency": settings.weight_consistency,
        "timeliness": settings.weight_timeliness,
        "validity": settings.weight_validity,
        "uniqueness": settings.weight_uniqueness,
    }

    composite = (
        completeness.score * weights["completeness"]
        + accuracy.score * weights["accuracy"]
        + consistency.score * weights["consistency"]
        + timeliness.score * weights["timeliness"]
        + validity.score * weights["validity"]
        + uniqueness.score * weights["uniqueness"]
    )
    composite = round(composite, 4)

    logger.info(
        "Quality scored",
        event_id=event_id,
        source_id=source_id,
        composite=composite,
        grade=_grade(composite),
    )

    return QualityReport(
        event_id=event_id,
        source_id=source_id,
        source_name=source_name,
        source_type=source_type,
        event_type=event_type,
        event_timestamp=event_timestamp,
        record_count=len(records),
        composite_score=composite,
        grade=_grade(composite),
        dimensions=QualityDimensions(
            completeness=completeness,
            accuracy=accuracy,
            consistency=consistency,
            timeliness=timeliness,
            validity=validity,
            uniqueness=uniqueness,
        ),
        weights_used=weights,
    )
