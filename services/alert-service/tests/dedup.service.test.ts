import { DedupService } from '../src/services/dedup.service';

const payload = {
  event_id: 'evt-1',
  source_id: 'source-1',
  pipeline_id: 'pipeline-1',
  detected_at: new Date().toISOString(),
  anomaly_types: ['quality'],
  severity: 'high' as const,
  summary: 'Quality drop',
  quality_score: 0.42,
  record_count: 120,
};

describe('DedupService', () => {
  it('allows first alert and drops second alert within ttl', async () => {
    const state = new Map<string, string>();
    const redis = {
      get: jest.fn(async (key: string) => state.get(key) ?? null),
      setex: jest.fn(async (key: string, _ttl: number, value: string) => {
        state.set(key, value);
      }),
      incr: jest.fn(async (_key: string) => 1),
    };

    const service = new DedupService(redis as never, 900);

    const first = await service.shouldSend(payload);
    const second = await service.shouldSend(payload);

    expect(first.allow).toBe(true);
    expect(second.allow).toBe(false);
    expect(redis.incr).toHaveBeenCalledTimes(1);
  });
});
