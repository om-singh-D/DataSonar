import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './utils/logger';
import { connectMongo, disconnectMongo } from './db/mongo';
import { getRedis, disconnectRedis } from './db/redis';
import { disconnectPrisma, getPrisma } from './db/prisma';
import { startWebSocketServer, stopWebSocketServer } from './websocket/server';
import { errorHandler } from './middleware/error';
import metricsRoutes from './routes/metrics.routes';
import pipelinesRoutes from './routes/pipelines.routes';
import alertsRoutes from './routes/alerts.routes';

async function main(): Promise<void> {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors({ origin: config.cors.origin, credentials: true }));
  app.use(express.json());
  app.use(morgan('combined', {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
  }));

  // Connect databases
  await connectMongo();
  getRedis(); // Initialize Redis connection

  // Health check
  app.get('/health', async (_req, res) => {
    const checks = {
      mongo: false,
      redis: false,
      postgres: false,
    };

    try {
      const mongo = await connectMongo();
      await mongo.command({ ping: 1 });
      checks.mongo = true;
    } catch {
      checks.mongo = false;
    }

    try {
      const redis = getRedis();
      const pong = await redis.ping();
      checks.redis = pong === 'PONG';
    } catch {
      checks.redis = false;
    }

    try {
      await getPrisma().$queryRaw`SELECT 1`;
      checks.postgres = true;
    } catch {
      checks.postgres = false;
    }

    const healthy = checks.mongo && checks.redis && checks.postgres;

    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'healthy' : 'degraded',
      checks,
      service: config.service.name,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/metrics', metricsRoutes);
  app.use('/api/pipelines', pipelinesRoutes);
  app.use('/api/alerts', alertsRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use(errorHandler);

  // Start HTTP server
  app.listen(config.service.port, () => {
    logger.info(`🚀 Dashboard API running on port ${config.service.port}`, {
      environment: config.service.env,
      health: `http://localhost:${config.service.port}/health`,
    });
  });

  // Start WebSocket server
  startWebSocketServer();

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    stopWebSocketServer();
    await disconnectMongo();
    await disconnectRedis();
    await disconnectPrisma();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Fatal error starting dashboard-api', { error });
  process.exit(1);
});
