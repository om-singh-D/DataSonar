"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Anomaly detector configuration."""

    SERVICE_NAME: str = "datasonar-anomaly-detector"
    SERVICE_PORT: int = 8002
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_CONSUMER_GROUP: str = "anomaly-detector-group"
    KAFKA_TOPIC_QUALITY_SCORED: str = "datasonar.quality-scores"

    RABBITMQ_URL: str = "amqp://datasonar:datasonar_secret@localhost:5672/datasonar"
    RABBITMQ_EXCHANGE: str = "alerts.exchange"
    RABBITMQ_ROUTING_KEY: str = "alert.anomaly.detected"

    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "datasonar"
    MINIO_SECRET_KEY: str = "datasonar_secret"
    MINIO_SECURE: bool = False
    MINIO_BUCKET_MODELS: str = "ml-models"

    MONGODB_URI: str = (
        "mongodb://datasonar:datasonar_secret@localhost:27017/"
        "datasonar?authSource=admin"
    )
    MONGODB_DB_NAME: str = "datasonar"

    ANOMALY_ALERT_THRESHOLD: float = 0.6
    MODEL_RETRAIN_INTERVAL_SECONDS: int = 3600
    DRIFT_MEAN_DELTA_THRESHOLD: float = 0.1

    model_config = SettingsConfigDict(
        env_file="../../.env",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def kafka_brokers_list(self) -> list[str]:
        return [item.strip() for item in self.KAFKA_BROKERS.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
