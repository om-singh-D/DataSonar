import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  service: {
    name: 'datasonar-ingestion',
    port: parseInt(process.env.INGESTION_PORT || '3001', 10),
    env: process.env.NODE_ENV || 'development',
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID || 'datasonar-ingestion',
    groupId: 'datasonar-ingestion-group',
    topics: {
      rawEvents: 'datasonar.raw-events',
      deadLetter: 'datasonar.dead-letter',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  telemetry: {
    enabled: ['1', 'true', 'yes', 'on'].includes(
      String(process.env.INGESTION_TELEMETRY_ENABLED || 'true').toLowerCase()
    ),
    mongoUri:
      process.env.INGESTION_TELEMETRY_MONGODB_URI ||
      'mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin',
    mongoDbName: process.env.INGESTION_TELEMETRY_MONGODB_DB_NAME || 'datasonar',
  },
} as const;