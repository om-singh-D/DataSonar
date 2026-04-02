# DataSonar Expo Demo Runbook

This guide walks through a live "Break My Pipeline" demo using DataSonar's existing ingestion validation and dead-letter routing.

## Demo Goal

1. Show healthy events flowing into `datasonar.raw-events`.
2. Flip into attack mode and send malformed events.
3. Show malformed events getting `400 Bad Request` responses and being routed to `datasonar.dead-letter`.

## Prerequisites

- Docker Desktop running
- Node.js 18 or newer
- Dependencies installed for:
  - `services/ingestion`
  - `frontend`

## Start The Environment

Install demo emitter dependencies at repository root:

```bash
npm init -y
npm install -D @faker-js/faker axios
```

From repository root:

```bash
docker-compose up -d
```

Start ingestion service:

```bash
cd services/ingestion
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

## Open Monitoring Tabs

Open these in your browser:

1. `http://localhost:8090` -> Kafka UI, navigate to topic `datasonar.raw-events`
2. `http://localhost:8090` -> Kafka UI, navigate to topic `datasonar.dead-letter`
3. `http://localhost:3000/demo.html` -> interactive "Break My Pipeline" page

## Recommended Screen Layout

- Left panel: terminal running `scripts/run_demo.ts`
- Right top: Kafka UI on `datasonar.raw-events`
- Right bottom: Kafka UI on `datasonar.dead-letter`
- Optional tablet/phone: `http://<your-local-ip>:3000/demo.html`

## Run The Terminal Emitter

From repository root:

```bash
node scripts/run_demo.ts
```

Controls:

- Press Space to toggle attack mode on or off
- Press Q or Ctrl+C to quit

## Demo Flow

1. Start in healthy mode (attack mode off).
2. Watch terminal logs show `202 Accepted` responses.
3. Verify `datasonar.raw-events` receives traffic.
4. Press Space in terminal to enable attack mode.
5. Watch responses switch to `400 Bad Request` with validation errors.
6. Verify malformed events appear in `datasonar.dead-letter`.
7. Use `http://localhost:3000/demo.html` to manually edit payloads and submit custom bad JSON.

## Troubleshooting

- Ingestion unreachable:
  - Confirm ingestion service is running on `http://localhost:3001`
  - Check `INGESTION_PORT` in environment if customized
- Frontend page loads but requests fail:
  - Confirm ingestion is up and CORS is enabled
- No events in Kafka UI:
  - Confirm Kafka containers are healthy with `docker-compose ps`
  - Confirm ingestion logs show successful Kafka producer connection
