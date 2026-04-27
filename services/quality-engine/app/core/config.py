"""Application configuration loaded from environment variables."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Quality Engine configuration."""

    # Service
    SERVICE_NAME: str = "datasonar-quality-engine"
    SERVICE_PORT: int = 8000
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Kafka
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_GROUP_ID: str = "quality-engine-group"
    KAFKA_INPUT_TOPIC: str = "datasonar.raw-events"
    KAFKA_OUTPUT_TOPIC: str = "datasonar.quality-scores"
    KAFKA_DLQ_TOPIC: str = "datasonar.quality-engine-dlq"

    # MongoDB
    MONGODB_URI: str = "mongodb://datasonar:datasonar_secret@localhost:27017/datasonar?authSource=admin"
    MONGODB_DB_NAME: str = "datasonar"

    # Quality Engine
    QUALITY_BATCH_SIZE: int = 10
    QUALITY_BATCH_TIMEOUT_MS: int = 5000

    @property
    def kafka_brokers_list(self) -> List[str]:
        return self.KAFKA_BROKERS.split(",")

    class Config:
        env_file = "../../.env"
        case_sensitive = True


settings = Settings()