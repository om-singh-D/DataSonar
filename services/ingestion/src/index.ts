import express from 'express';
import cors from 'cors';
import { config } from './config';
import { logger } from './utils/logger';
import { KafkaProducerService } from './producers/kafka.producer';
import { createIngestionRoutes } from './routes/ingestion.routes';
import { IngestionController } from './controllers/ingestion.controller';
import { DemoTelemetryService } from './services/demoTelemetry.service';

async function main(): Promise<void> {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.path}`, {
      ip: req.ip,
      contentLength: req.headers['content-length'],
    });
    next();
  });

  // Initialize Kafka producer
  const kafkaProducer = new KafkaProducerService();
  const telemetry = new DemoTelemetryService();

  try {
    await kafkaProducer.connect();
  } catch (error) {
    logger.error('Failed to connect to Kafka. Retrying in 5 seconds...', { error });
    await new Promise((resolve) => setTimeout(resolve, 5000));
    await kafkaProducer.connect();
  }

  await telemetry.connect();

  // Health check
  const controller = new IngestionController(kafkaProducer, telemetry);
  app.get('/health', controller.healthCheck);

  // API routes
  app.use('/api/v1', createIngestionRoutes(kafkaProducer, telemetry));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
  });

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  });

  // Start server
  app.listen(config.service.port, () => {
    logger.info(`🚀 Ingestion Service running on port ${config.service.port}`, {
      environment: config.service.env,
      kafkaBrokers: config.kafka.brokers,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    await telemetry.disconnect();
    await kafkaProducer.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Fatal error starting ingestion service', { error });
  process.exit(1);
});