"""API-level tests using FastAPI TestClient (no live Kafka/MongoDB needed)."""
from __future__ import annotations

from datetime import datetime, timezone
from unittest.mock import AsyncMock, PropertyMock, patch

import pytest
from fastapi.testclient import TestClient

import app.services.kafka_consumer as kafka_consumer_module
from app.main import app


@pytest.fixture
def client():
    """Test client with mocked MongoDB and Kafka (no real connections needed)."""
    with (
        patch("app.services.mongodb_service.mongodb_service.connect", new_callable=AsyncMock),
        patch("app.services.mongodb_service.mongodb_service.disconnect", new_callable=AsyncMock),
        patch("app.services.kafka_consumer.kafka_consumer.start", new_callable=AsyncMock),
        patch("app.services.kafka_consumer.kafka_consumer.stop", new_callable=AsyncMock),
        patch.object(
            type(kafka_consumer_module.kafka_consumer),
            "is_running",
            new_callable=PropertyMock,
            return_value=True,
        ),
    ):
        with TestClient(app) as c:
            yield c


class TestHealthEndpoint:
    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "kafka_consumer_running" in data


class TestManualScoreEndpoint:
    def test_score_valid_payload(self, client):
        with patch(
            "app.services.mongodb_service.mongodb_service.save_quality_report",
            new_callable=AsyncMock,
        ):
            payload = {
                "sourceId": "src-test",
                "sourceName": "Test Pipeline",
                "sourceType": "api",
                "records": [
                    {"name": "Alice", "age": 30},
                    {"name": "Bob", "age": 25},
                ],
                "schema": {"name": "string", "age": "integer"},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            response = client.post("/api/v1/quality/score", json=payload)
            assert response.status_code == 200
            data = response.json()
            assert "composite_score" in data
            assert "grade" in data
            assert "dimensions" in data
            assert data["grade"] in ("A", "B", "C", "D", "F")

    def test_score_missing_required_field(self, client):
        response = client.post("/api/v1/quality/score", json={"records": []})
        assert response.status_code == 422

    def test_score_empty_records(self, client):
        with patch(
            "app.services.mongodb_service.mongodb_service.save_quality_report",
            new_callable=AsyncMock,
        ):
            payload = {
                "sourceId": "src-empty",
                "sourceName": "Empty",
                "sourceType": "file",
                "records": [],
            }
            response = client.post("/api/v1/quality/score", json=payload)
            assert response.status_code == 200


class TestListScoresEndpoint:
    def test_list_scores_returns_paginated(self, client):
        mock_reports = [
            {
                "event_id": "evt-1",
                "source_id": "src-1",
                "composite_score": 0.85,
                "grade": "B",
                "scored_at": datetime.now(timezone.utc).isoformat(),
            }
        ]
        with (
            patch(
                "app.services.mongodb_service.mongodb_service.get_reports",
                new_callable=AsyncMock,
                return_value=mock_reports,
            ),
            patch(
                "app.services.mongodb_service.mongodb_service.count_reports",
                new_callable=AsyncMock,
                return_value=1,
            ),
        ):
            response = client.get("/api/v1/quality/scores")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert "pagination" in data["data"]
            assert len(data["data"]["scores"]) == 1

    def test_list_scores_with_filters(self, client):
        with (
            patch(
                "app.services.mongodb_service.mongodb_service.get_reports",
                new_callable=AsyncMock,
                return_value=[],
            ),
            patch(
                "app.services.mongodb_service.mongodb_service.count_reports",
                new_callable=AsyncMock,
                return_value=0,
            ),
        ):
            response = client.get("/api/v1/quality/scores?source_id=src-1&min_score=0.8&grade=A")
            assert response.status_code == 200


class TestLatestScoreEndpoint:
    def test_latest_found(self, client):
        mock_report = {"event_id": "evt-1", "source_id": "src-1", "composite_score": 0.9}
        with patch(
            "app.services.mongodb_service.mongodb_service.get_latest_by_source",
            new_callable=AsyncMock,
            return_value=mock_report,
        ):
            response = client.get("/api/v1/quality/scores/src-1/latest")
            assert response.status_code == 200
            assert response.json()["data"]["score"]["composite_score"] == 0.9

    def test_latest_not_found(self, client):
        with patch(
            "app.services.mongodb_service.mongodb_service.get_latest_by_source",
            new_callable=AsyncMock,
            return_value=None,
        ):
            response = client.get("/api/v1/quality/scores/nonexistent/latest")
            assert response.status_code == 404
