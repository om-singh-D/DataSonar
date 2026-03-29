import crypto from 'crypto';

import { RedisClient } from '../infra/redis.client';
import { AlertPayload } from '../schemas/alert.schema';

export class DedupService {
  private readonly redis: RedisClient;
  private readonly ttlSeconds: number;

  constructor(redis: RedisClient, ttlSeconds: number) {
    this.redis = redis;
    this.ttlSeconds = ttlSeconds;
  }

  generateSignature(alert: AlertPayload): string {
    const anomalyKey = [...alert.anomaly_types].sort().join(',');
    const raw = `${alert.source_id}|${anomalyKey}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async shouldSend(alert: AlertPayload): Promise<{ allow: boolean; signature: string }> {
    const signature = this.generateSignature(alert);
    const dedupKey = `alert:dedup:${signature}`;
    const suppressedKey = `alert:suppressed:${signature}`;

    const existing = await this.redis.get(dedupKey);
    if (existing) {
      await this.redis.incr(suppressedKey);
      return { allow: false, signature };
    }

    await this.redis.setex(dedupKey, this.ttlSeconds, '1');
    await this.redis.setex(suppressedKey, this.ttlSeconds, '0');
    return { allow: true, signature };
  }
}
