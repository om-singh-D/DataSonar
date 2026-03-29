"""Unit tests for the 6-dimension quality scorer."""
from __future__ import annotations

import pytest
from datetime import datetime, timezone, timedelta

from app.schemas.event import ManualScoreRequest
from app.services.quality_scorer import (
    _score_completeness,
    _score_accuracy,
    _score_consistency,
    _score_timeliness,
    _score_validity,
    _score_uniqueness,
    score_manual,
)


# ─────────────────────────────────────────────────────────────
# Completeness
# ─────────────────────────────────────────────────────────────

class TestCompleteness:
    def test_all_fields_present(self):
        records = [{"name": "Alice", "age": 30}, {"name": "Bob", "age": 25}]
        result = _score_completeness(records)
        assert result.score == 1.0

    def test_half_null(self):
        records = [{"name": "Alice", "age": None}, {"name": None, "age": 25}]
        result = _score_completeness(records)
        assert result.score == 0.5
        assert result.passed == 2
        assert result.total == 4

    def test_all_null(self):
        records = [{"name": None, "age": None}]
        result = _score_completeness(records)
        assert result.score == 0.0

    def test_empty_string_counts_as_missing(self):
        records = [{"name": "", "age": 30}]
        result = _score_completeness(records)
        assert result.score == 0.5

    def test_empty_records(self):
        result = _score_completeness([])
        assert result.score == 1.0


# ─────────────────────────────────────────────────────────────
# Accuracy
# ─────────────────────────────────────────────────────────────

class TestAccuracy:
    def test_correct_types(self):
        records = [{"name": "Alice", "age": 30}]
        schema = {"name": "string", "age": "integer"}
        result = _score_accuracy(records, schema)
        assert result.score == 1.0

    def test_wrong_type(self):
        records = [{"name": "Alice", "age": "not_a_number"}]
        schema = {"name": "string", "age": "integer"}
        result = _score_accuracy(records, schema)
        assert result.score == 0.5  # name correct, age wrong

    def test_no_schema_returns_perfect(self):
        records = [{"name": "Alice", "age": 30}]
        result = _score_accuracy(records, None)
        assert result.score == 1.0

    def test_null_values_dont_fail_accuracy(self):
        records = [{"name": None, "age": 30}]
        schema = {"name": "string", "age": "integer"}
        result = _score_accuracy(records, schema)
        assert result.score == 1.0

    def test_float_type(self):
        records = [{"price": 9.99}]
        schema = {"price": "float"}
        result = _score_accuracy(records, schema)
        assert result.score == 1.0


# ─────────────────────────────────────────────────────────────
# Consistency
# ─────────────────────────────────────────────────────────────

class TestConsistency:
    def test_no_duplicates(self):
        records = [{"id": 1, "val": "a"}, {"id": 2, "val": "b"}]
        result = _score_consistency(records)
        assert result.score == 1.0

    def test_all_duplicates(self):
        records = [{"id": 1}, {"id": 1}, {"id": 1}]
        result = _score_consistency(records)
        assert pytest.approx(result.score, 0.01) == 1 / 3

    def test_half_duplicates(self):
        records = [{"id": 1}, {"id": 2}, {"id": 1}]
        result = _score_consistency(records)
        assert pytest.approx(result.score, 0.01) == 2 / 3

    def test_single_record(self):
        records = [{"id": 1}]
        result = _score_consistency(records)
        assert result.score == 1.0


# ─────────────────────────────────────────────────────────────
# Timeliness
# ─────────────────────────────────────────────────────────────

class TestTimeliness:
    def test_fresh_event_scores_high(self):
        fresh = datetime.now(timezone.utc) - timedelta(seconds=10)
        result = _score_timeliness(fresh)
        assert result.score > 0.99

    def test_event_at_sla_scores_zero(self):
        # Default SLA is 3600s — event exactly at SLA boundary
        at_sla = datetime.now(timezone.utc) - timedelta(seconds=3600)
        result = _score_timeliness(at_sla)
        assert result.score == 0.0

    def test_very_old_event_scores_zero(self):
        old = datetime.now(timezone.utc) - timedelta(days=2)
        result = _score_timeliness(old)
        assert result.score == 0.0

    def test_halfway_through_sla(self):
        halfway = datetime.now(timezone.utc) - timedelta(seconds=1800)
        result = _score_timeliness(halfway)
        # ~0.5 with some tolerance for test execution time
        assert 0.45 <= result.score <= 0.55

    def test_naive_datetime_handled(self):
        naive = datetime.utcnow() - timedelta(seconds=60)
        result = _score_timeliness(naive)
        assert result.score > 0.9


# ─────────────────────────────────────────────────────────────
# Validity
# ─────────────────────────────────────────────────────────────

class TestValidity:
    def test_valid_records(self):
        records = [{"name": "Alice", "age": 30}]
        result = _score_validity(records, None)
        assert result.score == 1.0

    def test_string_too_long(self):
        records = [{"name": "x" * 10_001}]
        result = _score_validity(records, None)
        assert result.score == 0.0

    def test_string_coercion_to_int(self):
        records = [{"age": "abc"}]
        schema = {"age": "integer"}
        result = _score_validity(records, schema)
        assert result.score == 0.0

    def test_numeric_string_passes(self):
        records = [{"age": "30"}]
        schema = {"age": "integer"}
        result = _score_validity(records, schema)
        assert result.score == 1.0


# ─────────────────────────────────────────────────────────────
# Uniqueness
# ─────────────────────────────────────────────────────────────

class TestUniqueness:
    def test_all_unique(self):
        records = [{"id": 1}, {"id": 2}, {"id": 3}]
        result = _score_uniqueness(records)
        assert result.score == 1.0

    def test_all_same(self):
        records = [{"id": 1}, {"id": 1}, {"id": 1}]
        result = _score_uniqueness(records)
        assert pytest.approx(result.score, 0.01) == 1 / 3

    def test_empty(self):
        result = _score_uniqueness([])
        assert result.score == 1.0


# ─────────────────────────────────────────────────────────────
# Composite scoring via score_manual
# ─────────────────────────────────────────────────────────────

class TestScoreManual:
    def test_perfect_data(self):
        req = ManualScoreRequest.model_validate({
            "sourceId": "src-001",
            "sourceName": "Test Source",
            "sourceType": "api",
            "records": [
                {"name": "Alice", "age": 30},
                {"name": "Bob", "age": 25},
            ],
            "schema": {"name": "string", "age": "integer"},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        report = score_manual(req)
        assert report.composite_score > 0.8
        assert report.grade in ("A", "B")
        assert report.record_count == 2

    def test_empty_records_returns_report(self):
        req = ManualScoreRequest.model_validate({
            "sourceId": "src-002",
            "sourceName": "Empty Source",
            "sourceType": "database",
            "records": [],
        })
        report = score_manual(req)
        assert report.record_count == 0
        assert 0.0 <= report.composite_score <= 1.0

    def test_grade_computed(self):
        # All nulls → low completeness → low overall score
        req = ManualScoreRequest.model_validate({
            "sourceId": "src-003",
            "sourceName": "Null Source",
            "sourceType": "file",
            "records": [{"name": None, "age": None}, {"name": None, "age": None}],
        })
        report = score_manual(req)
        assert report.grade in ("D", "F", "C")
