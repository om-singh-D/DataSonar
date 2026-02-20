import { Router } from 'express';
import { IngestionController } from '../controllers/ingestion.controller';
import { KafkaProducerService } from '../producers/kafka.producer';

export function createIngestionRoutes(kafkaProducer: KafkaProducerService): Router {
  const router = Router();
  const controller = new IngestionController(kafkaProducer);

  router.post('/ingest', controller.ingestEvent);
  router.post('/ingest/batch', controller.ingestBatch);

  return router;
}