import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  NODE_ENV: z.string().default('development'),
  DASHBOARD_API_PORT: z.coerce.number().int().positive().default(4001),
  DASHBOARD_WS_PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().default('postgresql://datasonar:datasonar_secret@localhost:5432/datasonar'),
  MONGODB_URI: z.string().default('mongodb://datasonar:datasonar_secret@localhost:27018/datasonar?authSource=admin'),
  MONGODB_DB_NAME: z.string().default('datasonar'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().default('datasonar_secret'),
  CACHE_TTL: z.coerce.number().int().positive().default(60),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DASHBOARD_WS_BRIDGE_MODE: z.enum(['mongo', 'kafka']).default('mongo'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_TOPIC_QUALITY_SCORED: z.string().default('datasonar.quality-scores'),
  KAFKA_TOPIC_ANOMALIES: z.string().default('datasonar.anomalies'),
  KAFKA_TOPIC_ALERTS: z.string().default('datasonar.alerts'),
});

const env = envSchema.parse(process.env);

export const config = {
  service: {
    name: 'dashboard-api',
    port: env.DASHBOARD_API_PORT,
    wsPort: env.DASHBOARD_WS_PORT,
    env: env.NODE_ENV,
  },
  postgres: {
    url: env.DATABASE_URL,
  },
  mongodb: {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD,
  },
  cache: {
    ttl: env.CACHE_TTL,
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
  websocketBridge: {
    mode: env.DASHBOARD_WS_BRIDGE_MODE,
    kafkaBrokers: env.KAFKA_BROKERS.split(',').map((item) => item.trim()).filter(Boolean),
    topics: {
      quality: env.KAFKA_TOPIC_QUALITY_SCORED,
      anomalies: env.KAFKA_TOPIC_ANOMALIES,
      alerts: env.KAFKA_TOPIC_ALERTS,
    },
  },
} as const;
