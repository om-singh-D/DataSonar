"""Application configuration for terminal-only anomaly detector."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Settings:
    """Anomaly detector configuration â€” terminal mode."""

    # â”€â”€ General â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    SERVICE_NAME: str = "datasonar-anomaly-detector"
    LOG_LEVEL: str = "INFO"
    KAFKA_BROKERS: str = field(default_factory=lambda: os.getenv("KAFKA_BROKERS", "kafka:29092"))
    KAFKA_CONSUMER_GROUP: str = field(default_factory=lambda: os.getenv("KAFKA_CONSUMER_GROUP", "anomaly-detector-group"))
    KAFKA_TOPIC_QUALITY_SCORED: str = field(default_factory=lambda: os.getenv("KAFKA_TOPIC_QUALITY_SCORED", "datasonar.quality-scores"))
    RABBITMQ_URL: str = field(default_factory=lambda: os.getenv("RABBITMQ_URL", "amqp://datasonar:datasonar_secret@localhost:5672/datasonar"))
    RABBITMQ_EXCHANGE: str = field(default_factory=lambda: os.getenv("RABBITMQ_EXCHANGE", "alerts.exchange"))
    RABBITMQ_ROUTING_KEY: str = field(default_factory=lambda: os.getenv("RABBITMQ_ROUTING_KEY", "alert.anomaly.detected"))

    # â”€â”€ Model storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MODEL_DIR: str = ""  # resolved in __post_init__
    BASELINE_DIR: str = ""  # resolved in __post_init__

    # â”€â”€ ML thresholds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    ANOMALY_ALERT_THRESHOLD: float = 0.6
    DRIFT_MEAN_DELTA_THRESHOLD: float = 0.1

    # â”€â”€ Training parameters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    PRETRAIN_PROFILES: list[str] = field(
        default_factory=lambda: ["stable", "volatile", "degrading"]
    )
    MIN_TRAINING_ROWS: int = 50
    ISO_FOREST_ESTIMATORS: int = 100
    ISO_FOREST_CONTAMINATION: float = 0.08
    ISO_FOREST_RANDOM_STATE: int = 42

    # â”€â”€ Time-series EWMA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    EWMA_SPAN: int = 24
    EWMA_Z_THRESHOLD: float = 3.0

    # â”€â”€ History limits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    QUALITY_HISTORY_LIMIT: int = 1000
    VOLUME_HISTORY_LIMIT: int = 500

    # â”€â”€ Batch processing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    BATCH_CHUNK_SIZE: int = 50_000

    @property
    def kafka_brokers_list(self) -> list[str]:
        return [b.strip() for b in self.KAFKA_BROKERS.split(",") if b.strip()]
    def __post_init__(self) -> None:
        project_root = Path(__file__).resolve().parents[2]
        if not self.MODEL_DIR:
            self.MODEL_DIR = str(project_root / "models" / "trained")
        if not self.BASELINE_DIR:
            self.BASELINE_DIR = str(project_root / "models" / "baselines")
        # Ensure directories exist
        os.makedirs(self.MODEL_DIR, exist_ok=True)
        os.makedirs(self.BASELINE_DIR, exist_ok=True)


# Module-level singleton
_settings: Settings | None = None


def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
