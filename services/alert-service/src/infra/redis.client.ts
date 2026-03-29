import Redis from 'ioredis';

export class RedisClient {
  private readonly redis: Redis;

  constructor(params: { host: string; port: number; password?: string }) {
    this.redis = new Redis({
      host: params.host,
      port: params.port,
      password: params.password,
      lazyConnect: true,
      maxRetriesPerRequest: 2,
    });
  }

  async connect(): Promise<void> {
    if (this.redis.status !== 'ready') {
      await this.redis.connect();
    }
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    await this.redis.set(key, value, 'EX', ttlSeconds);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async healthcheck(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG';
    } catch {
      return false;
    }
  }
}
