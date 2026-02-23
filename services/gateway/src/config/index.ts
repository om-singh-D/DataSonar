import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  service: {
    name: 'datasonar-gateway',
    port: parseInt(process.env.GATEWAY_PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://datasonar:datasonar_secret@localhost:5432/datasonar',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRY || '24h',
    refreshExpiresIn: '7d',
  },
  bcrypt: {
    saltRounds: 12,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  services: {
    ingestion: process.env.INGESTION_SERVICE_URL || 'http://localhost:3001',
    qualityEngine: process.env.QUALITY_ENGINE_URL || 'http://localhost:8000',
    anomalyDetector: process.env.ANOMALY_DETECTOR_URL || 'http://localhost:8001',
  },
} as const;