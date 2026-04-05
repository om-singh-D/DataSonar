import { Router } from 'express';
import { IngestionController } from '../controllers/ingestion.controller';
import { KafkaProducerService } from '../producers/kafka.producer';
import { DemoTelemetryService } from '../services/demoTelemetry.service';

export function createIngestionRoutes(
  kafkaProducer: KafkaProducerService,
  telemetry: DemoTelemetryService
): Router {
  const router = Router();
  const controller = new IngestionController(kafkaProducer, telemetry);

  router.post('/ingest', controller.ingestEvent);
  router.post('/ingest/batch', controller.ingestBatch);

  return router;
}