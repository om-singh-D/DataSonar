# DataSonar Architecture & Workflow Details

DataSonar is a distributed, real-time data pipeline quality monitoring and anomaly detection platform. It uses a microservices architecture driven by event-streaming (Kafka) and message-queueing (RabbitMQ) to ingest, validate, score, and alert on data pipeline characteristics.

---

## 1. System Components

The system is split into multiple independent services, robust infrastructure backing, and a frontend client.

### 1.1 Microservices (`/services`)

*   **Ingestion Service (`/services/ingestion`)**
    *   **Role:** The front-door for all incoming data events.
    *   **Tech Stack:** Node.js, Express, Zod (Validation), KafkaJS.
    *   **Responsibilities:** 
        *   Receives incoming JSON payloads via the `/api/v1/ingest` and `/batch` endpoints.
        *   Validates the structure of the incoming data against known schemas.
        *   If valid, publishes the event to the `datasonar.raw-events` Kafka topic.
        *   If invalid, responds with a 400 (if synchronous) alongside validation errors, and routes the bad payload to the `datasonar.dead-letter` Kafka topic.

*   **Quality Engine (`/services/quality-engine`)**
    *   **Role:** Processes raw data to compute data quality metrics.
    *   **Tech Stack:** Python, Kafka-Python, PyMongo.
    *   **Responsibilities:**
        *   Consumes events from the `datasonar.raw-events` Kafka topic.
        *   Evaluates metrics like completeness (null checks), accuracy, data type mismatches, and other domain-specific quality rules.
        *   Persists calculated scores into the MongoDB database (in collections like `quality_scores` and `schema_events`).
        *   Prepares data state for subsequent anomaly evaluation.

*   **Anomaly Detector (`/services/anomaly-detector`)**
    *   **Role:** The ML intelligence layer that flags unusual behavior.
    *   **Tech Stack:** Python, Scikit-Learn/PyTorch (ML), Kafka-Python, RabbitMQ (Pika), MinIO client.
    *   **Responsibilities:**
        *   Listens to quality score data or raw events.
        *   Fetches pre-trained machine learning models from MinIO (S3-compatible storage) using the `ml-models` bucket.
        *   Evaluates metrics over time to detect anomalies (e.g., sudden drop in record counts, spike in null values).
        *   When an anomaly is confirmed, it stores the anomaly record in MongoDB (`anomalies` collection).
        *   Publishes an alert event to RabbitMQ on the `alerts.exchange` exchange with the routing key `alert.anomaly.detected`.

*   **Alert Service (`/services/alert-service`)**
    *   **Role:** Notification dispatcher and deduplicator.
    *   **Tech Stack:** Node.js, RabbitMQ, Redis.
    *   **Responsibilities:**
        *   Consumes message events from the RabbitMQ `alerts.anomaly.queue`.
        *   Uses Redis to deduplicate alerts (employing a TTL, e.g., 900 seconds) so users aren't spammed with the same anomaly multiple times in a short window.
        *   Dispatches notifications to external channels like Slack, Webhooks, or SMTP.

*   **Dashboard API (`/services/dashboard-api`)**
    *   **Role:** Serves the frontend Next.js app and handles real-time updates.
    *   **Tech Stack:** Node.js, Express, Prisma (ORM for Postgres), Mongoose, WebSockets.
    *   **Responsibilities:**
        *   Provides REST/GraphQL endpoints for the frontend to query historical data, quality scores, and system configuration.
        *   Queries both PostgreSQL (relational configs, user data) and MongoDB (timeseries quality metrics, anomaly records).
        *   Maintains a WebSocket connection (`ws://`) to broadcast live events, anomalies, and ingestion statistics directly to the frontend.

*   **API Gateway (`/services/gateway`)** *(If active)*
    *   **Role:** Central routing and unified access point.
    *   **Responsibilities:** Handles routing, authentication, and rate-limiting before requests reach the internal microservices.

### 1.2 Frontend (`/frontend`)
*   **Tech Stack:** Next.js (React), Tailwind CSS.
*   **Responsibilities:** 
    *   Provides an interactive UI summarizing data health.
    *   Consumes the REST API and subscribes to WebSockets for real-time dashboards (pipelines, alerts, anomalies).

---

## 2. Infrastructure Backing

The system heavily relies on various stateful backends deployed via Docker/Kubernetes/Helm:

*   **Apache Kafka & Zookeeper:**
    *   **Topics:** `datasonar.raw-events`, `datasonar.dead-letter`, `datasonar.quality-scores`.
    *   **Purpose:** High-throughput, distributed event bus decoupling ingestion from processing.
*   **RabbitMQ:**
    *   **Purpose:** Pub/Sub message broker built specifically for reliable alerting. Separates ML anomaly evaluation from network-dependent webhook/Slack dispatching.
*   **MongoDB:**
    *   **Purpose:** Primary NoSQL data store for unstructured/semi-structured timeseries data (quality scores, anomaly traces, schema change events).
*   **PostgreSQL:**
    *   **Purpose:** Relational database mapping out system configurations, pipeline definitions, and user data.
*   **Redis:**
    *   **Purpose:** In-memory key-value store utilized primarily for fast alert deduplication (TTL rate-limiting) and session caching.
*   **MinIO:**
    *   **Purpose:** S3-compatible object storage. Used to store and version machine learning models (`ml-models` bucket) and potentially large file reports (`reports`).

---

## 3. The End-to-End Workflow

### Phase 1: Ingestion & Validation (The "Front Door")
1.  An external system pushes JSON pipeline data to `http://<ingestion-host>:3001/api/v1/ingest`.
2.  **Ingestion Service** evaluates the `schema`. 
    *   **Healthy Path:** Payload is valid. Service returns `202 Accepted`. Payload is serialized and sent to Kafka topic `datasonar.raw-events`.
    *   **Unhealthy Path (Attack Mode):** Payload fails validation (e.g., negative record count). Service returns `400 Bad Request` and routes the corrupt data + error context to Kafka topic `datasonar.dead-letter`.

### Phase 2: Processing & Scoring
3.  **Quality Engine** continuously polls `datasonar.raw-events`.
4.  It unpacks the event, runs statistical profiling and rule checks.
5.  It writes the resulting `quality_score` payload into MongoDB.

### Phase 3: Anomaly Detection
6.  **Anomaly Detector** processes the incoming scores/events.
7.  It pulls its current ML algorithm state from **MinIO**.
8.  If the new score deviates significantly from historical predictions, it flags an anomaly.
9.  The anomaly is written to MongoDB contextually.
10. An event payload is pushed to **RabbitMQ** mapping to `alert.anomaly.detected`.

### Phase 4: Alerting & Deduplication
11. **Alert Service** picks up the message from RabbitMQ.
12. It checks **Redis**: "Have I sent an alert for this specific pipeline's anomaly in the last 15 minutes?"
    *   If **Yes**: The message is discarded (deduplicated).
    *   If **No**: It registers the alert in Redis with a 15-minute TTL, then makes external HTTP calls to Slack/Webhooks.

### Phase 5: Consumption & Visualization (The User Loop)
13. Meanwhile, the **Dashboard API** monitors databases and/or message queues.
14. The Next.js **Frontend** has an open WebSocket connection with the Dashboard API.
15. When the user visits the dashboard, historical data is fetched via REST (Postgres/Mongo mapping).
16. As new anomalies or ingestion stats occur, they are pushed over WebSocket allowing the UI charts and alert panels to update in real-time without page reloads.
