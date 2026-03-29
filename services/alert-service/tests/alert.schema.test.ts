import { alertSchema } from '../src/schemas/alert.schema';

describe('alertSchema', () => {
  const payload = {
    event_id: 'evt-1',
    source_id: 'source-1',
    pipeline_id: 'pipeline-1',
    detected_at: new Date().toISOString(),
    anomaly_types: ['quality'],
    severity: 'high',
    summary: 'Quality drop',
    quality_score: 0.42,
    record_count: 120,
  };

  it('accepts valid payload', () => {
    const result = alertSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects invalid severity', () => {
    const result = alertSchema.safeParse({ ...payload, severity: 'urgent' });
    expect(result.success).toBe(false);
  });
});
