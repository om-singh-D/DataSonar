import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

let redis: Redis;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      retryStrategy: (times) => Math.min(times * 200, 5000),
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => logger.info('Redis connected'));
    redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
  }
  return redis;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const data = await getRedis().get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, data: unknown, ttl?: number): Promise<void> {
  try {
    const expiry = ttl || config.cache.ttl;
    await getRedis().setex(key, expiry, JSON.stringify(data));
  } catch (err) {
    logger.warn('Redis cache set failed', { key, error: (err as Error).message });
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    logger.info('Redis disconnected');
  }
}
