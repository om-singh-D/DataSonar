import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { logger } from './utils/logger';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import pipelineRoutes from './routes/pipeline.routes';
import alertConfigRoutes from './routes/alertconfig.routes';

async function main(): Promise<void> {
  const app = express();

  // ============================================
  // GLOBAL MIDDLEWARE
  // ============================================

  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Request logging
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => logger.info(message.trim()),
    },
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      status: 'error',
      message: 'Too many requests. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // ============================================
  // ROUTES
  // ============================================

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      service: config.service.name,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DataSonar API Documentation',
  }));

  // Serve raw spec
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/pipelines', pipelineRoutes);
  app.use('/api/v1/alert-configs', alertConfigRoutes);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found',
    });
  });

  // Global error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
    });

    res.status(500).json({
      status: 'error',
      message: config.service.env === 'production'
        ? 'Internal server error'
        : err.message,
    });
  });

  // ============================================
  // START SERVER
  // ============================================

  app.listen(config.service.port, () => {
    logger.info(`🚀 Gateway Service running on port ${config.service.port}`, {
      environment: config.service.env,
      docs: `http://localhost:${config.service.port}/api/docs`,
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((error) => {
  logger.error('Fatal error starting gateway service', { error });
  process.exit(1);
});