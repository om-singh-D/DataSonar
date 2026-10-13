
"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Quality Engine configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    # Service
    service_name: str = "datasonar-quality-engine"
    service_port: int = 8000
    environment: str = "development"
    log_level: str = "INFO"

    # Kafka
    kafka_brokers: str = "kafka:29092"
    kafka_group_id: str = "quality-engine-group"
    kafka_raw_events_topic: str = "datasonar.raw-events"
    kafka_output_topic: str = "datasonar.quality-scores"
    kafka_dlq_topic: str = "datasonar.quality-engine-dlq"

    @property
    def kafka_brokers_list(self) -> list[str]:
        return [
            broker.strip()
            for broker in self.kafka_brokers.split(",")
            if broker.strip()
        ]

    # MongoDB
    mongodb_uri: str = (
        "mongodb://datasonar:datasonar_secret@mongodb:27017/"
        "datasonar?authSource=admin"
    )
    mongodb_db_name: str = "datasonar"
    mongodb_collection: str = "quality_reports"

    # Quality scoring
    timeliness_sla_seconds: int = 300
    weight_completeness: float = 0.20
    weight_accuracy: float = 0.20
    weight_consistency: float = 0.15
    weight_timeliness: float = 0.15
    weight_validity: float = 0.15
    weight_uniqueness: float = 0.15

    # Batch processing
    quality_batch_size: int = 10
    quality_batch_timeout_ms: int = 5000


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""
    return Settings()