# 🔍 DataSonar

> Real-time data pipeline quality monitoring & anomaly detection platform

[![CI](https://github.com/om-singh-D/DataSonar/actions/workflows/ci.yml/badge.svg)](https://github.com/om-singh-D/DataSonar/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Problem

Bad data costs companies an average of **$12.9 million annually** (Gartner). Data pipeline failures go undetected for hours, there's no real-time visibility into data quality, and compliance suffers from data integrity issues.

## 💡 Solution

DataSonar monitors data pipelines in real-time, detects anomalies using ML, and provides instant alerts with root cause analysis.

### Key Features

- **Real-time Ingestion** — Stream pipeline metadata via Kafka
- **6-Dimension Quality Scoring** — Completeness, accuracy, consistency, timeliness, validity, uniqueness
- **ML Anomaly Detection** — Isolation Forest, Prophet, Z-score, DBSCAN
- **Instant Alerts** — RabbitMQ-powered notifications with deduplication
- **Interactive Dashboard** — Next.js real-time monitoring UI
- **Full Observability** — Prometheus, Grafana, ELK Stack

## 🏗️ Architecture

```
[Data Sources] → [Kafka] → [Quality Engine] → [Anomaly Detector]
                                                       ↓
[Dashboard] ← [Dashboard API] ← [Alert Service] ← [RabbitMQ]
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js, React, TailwindCSS, Recharts |
| **API Gateway** | Node.js, Express, JWT, OAuth2, Prisma |
| **Streaming** | Apache Kafka (KafkaJS), RabbitMQ |
| **ML/Quality** | Python, FastAPI, scikit-learn, Prophet, Pandas |
| **Databases** | PostgreSQL, MongoDB, Redis, Aerospike |
| **Storage** | MinIO (S3-compatible) |
| **Observability** | Prometheus, Grafana, ELK Stack |
| **DevOps** | Docker, Kubernetes, GitHub Actions |

## 📦 Project Structure

```
datasonar/
├── services/
│   ├── gateway/            # API Gateway (Node.js + Express + Prisma)
│   ├── ingestion/          # Data Ingestion (Node.js + KafkaJS)
│   ├── quality-engine/     # Quality Scoring (Python + FastAPI)
│   ├── anomaly-detector/   # ML Detection (Python + FastAPI)
│   ├── alert-service/      # Alerting (Node.js + RabbitMQ)
│   └── dashboard-api/      # Dashboard Backend (Node.js + Express)
├── frontend/               # Dashboard UI (Next.js)
├── infra/                  # Kubernetes & Terraform configs
├── monitoring/             # Prometheus, Grafana, ELK configs
├── docs/                   # Architecture docs & ADRs
└── scripts/                # Utility scripts
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- Git

### Run Locally

```bash
# Clone the repository
git clone https://github.com/om-singh-D/DataSonar.git
cd DataSonar

# Start all infrastructure services
docker-compose up -d

# Verify everything is running
docker-compose ps
```

## 📅 Development Roadmap

- [x] Project setup & folder structure
- [x] Docker Compose infrastructure
- [x] Ingestion Service (Kafka)
- [x] Gateway Service (Auth + API)
- [x] Quality Engine (FastAPI)
- [x] Anomaly Detection (ML)
- [ ] Alert Service (RabbitMQ)
- [ ] Dashboard (Next.js)
- [ ] Observability (Prometheus + ELK)
- [ ] Kubernetes deployment

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Om Singh** — [@om-singh-D](https://github.com/om-singh-D)
