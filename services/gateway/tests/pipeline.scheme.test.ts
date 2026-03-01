import { CreatePipelineSchema, UpdatePipelineSchema } from '../src/schemas/pipeline.schema';

describe('CreatePipelineSchema', () => {
  it('should accept valid pipeline', () => {
    const result = CreatePipelineSchema.safeParse({
      name: 'orders-etl',
      description: 'ETL pipeline for orders',
      sourceType: 'database',
      sourceConfig: { host: 'db.example.com', port: 5432 },
    });
    expect(result.success).toBe(true);
  });

  it('should reject pipeline name with spaces', () => {
    const result = CreatePipelineSchema.safeParse({
      name: 'orders etl',
      sourceType: 'database',
      sourceConfig: {},
    });
    expect(result.success).toBe(false);
  });

  it('should reject pipeline name with uppercase', () => {
    const result = CreatePipelineSchema.safeParse({
      name: 'Orders-ETL',
      sourceType: 'database',
      sourceConfig: {},
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid sourceType', () => {
    const result = CreatePipelineSchema.safeParse({
      name: 'test-pipeline',
      sourceType: 'invalid',
      sourceConfig: {},
    });
    expect(result.success).toBe(false);
  });

  it('should accept without optional description', () => {
    const result = CreatePipelineSchema.safeParse({
      name: 'test-pipeline',
      sourceType: 'api',
      sourceConfig: { endpoint: 'https://api.example.com' },
    });
    expect(result.success).toBe(true);
  });

  it('should accept all valid sourceTypes', () => {
    const types = ['database', 'api', 'file', 'stream', 'webhook'];
    types.forEach((type) => {
      const result = CreatePipelineSchema.safeParse({
        name: 'test-pipeline',
        sourceType: type,
        sourceConfig: {},
      });
      expect(result.success).toBe(true);
    });
  });
});

describe('UpdatePipelineSchema', () => {
  it('should accept partial update', () => {
    const result = UpdatePipelineSchema.safeParse({
      description: 'Updated description',
    });
    expect(result.success).toBe(true);
  });

  it('should accept status update', () => {
    const result = UpdatePipelineSchema.safeParse({
      status: 'PAUSED',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = UpdatePipelineSchema.safeParse({
      status: 'RUNNING',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty object (no changes)', () => {
    const result = UpdatePipelineSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});