"""DataSonar Quality Engine — configuration via environment variables."""
from pathlib import Path
from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache

# Resolve the root .env file (4 levels up from this file)
_ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    # Service
    service_name: str = "datasonar-quality-engine"
    service_port: int = Field(default=8000, alias="QUALITY_ENGINE_PORT")
    environment: str = Field(default="development", alias="NODE_ENV")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    # Kafka
    kafka_brokers: str = Field(default="localhost:9092", alias="KAFKA_BROKERS")
    kafka_group_id: str = "datasonar-quality-engine"
    kafka_raw_events_topic: str = "datasonar.raw-events"
    kafka_quality_scores_topic: str = "datasonar.quality-scores"

    # MongoDB
    mongodb_uri: str = Field(
        default="mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin",
        alias="MONGODB_URI",
    )
    mongodb_db_name: str = Field(default="datasonar", alias="MONGODB_DB_NAME")
    mongodb_collection: str = "quality_scores"

    # Quality scoring weights (must sum to 1.0)
    weight_completeness: float = 0.20
    weight_accuracy: float = 0.20
    weight_consistency: float = 0.15
    weight_timeliness: float = 0.15
    weight_validity: float = 0.15
    weight_uniqueness: float = 0.15

    # Timeliness SLA threshold in seconds (events older than this score 0)
    timeliness_sla_seconds: int = Field(default=3600, alias="TIMELINESS_SLA_SECONDS")

    model_config = {"env_file": str(_ROOT_ENV), "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
