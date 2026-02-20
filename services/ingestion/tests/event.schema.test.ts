import { PipelineEventSchema } from '../src/schemas/event.schema';

describe('PipelineEventSchema', () => {
  const validEvent = {
    sourceId: 'postgres-orders-db',
    sourceName: 'Orders Database',
    sourceType: 'database',
    eventType: 'snapshot',
    timestamp: '2026-02-10T12:00:00.000Z',
    data: {
      schema: {
        id: 'integer',
        name: 'string',
        email: 'string',
        created_at: 'timestamp',
      },
      records: [
        { id: 1, name: 'Alice', email: 'alice@example.com', created_at: '2026-01-01' },
        { id: 2, name: 'Bob', email: 'bob@example.com', created_at: '2026-01-02' },
      ],
      recordCount: 2,
    },
    metadata: {
      pipeline: 'orders-etl',
      environment: 'production',
      tags: ['critical', 'pii'],
    },
  };

  it('should validate a correct event', () => {
    const result = PipelineEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('should reject an event without sourceId', () => {
    const { sourceId, ...invalid } = validEvent;
    const result = PipelineEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject an event with invalid sourceType', () => {
    const invalid = { ...validEvent, sourceType: 'unknown' };
    const result = PipelineEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject an event with invalid timestamp format', () => {
    const invalid = { ...validEvent, timestamp: 'not-a-date' };
    const result = PipelineEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should reject an event with negative recordCount', () => {
    const invalid = {
      ...validEvent,
      data: { ...validEvent.data, recordCount: -1 },
    };
    const result = PipelineEventSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('should accept an event without optional metadata', () => {
    const { metadata, ...withoutMeta } = validEvent;
    const result = PipelineEventSchema.safeParse(withoutMeta);
    expect(result.success).toBe(true);
  });

  it('should accept all valid sourceTypes', () => {
    const types = ['database', 'api', 'file', 'stream', 'webhook'];
    types.forEach((type) => {
      const event = { ...validEvent, sourceType: type };
      const result = PipelineEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  it('should accept all valid eventTypes', () => {
    const types = ['snapshot', 'incremental', 'schema_change', 'heartbeat'];
    types.forEach((type) => {
      const event = { ...validEvent, eventType: type };
      const result = PipelineEventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });
});