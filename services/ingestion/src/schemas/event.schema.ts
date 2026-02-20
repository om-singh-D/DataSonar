import { z } from 'zod';

/**
 * Schema for incoming pipeline data events.
 * 
 * Every data source sends events in this format.
 * The Quality Engine downstream will process these.
 */
export const PipelineEventSchema = z.object({
  // Source identification
  sourceId: z.string().min(1, 'sourceId is required'),
  sourceName: z.string().min(1, 'sourceName is required'),
  sourceType: z.enum(['database', 'api', 'file', 'stream', 'webhook']),

  // Event metadata
  eventType: z.enum(['snapshot', 'incremental', 'schema_change', 'heartbeat']),
  timestamp: z.string().datetime({ message: 'timestamp must be ISO 8601 format' }),

  // Data payload
  data: z.object({
    schema: z.record(z.string(), z.string()).optional(), // field_name -> type
    records: z.array(z.record(z.string(), z.unknown())),
    recordCount: z.number().int().min(0),
  }),

  // Optional metadata
  metadata: z.object({
    pipeline: z.string().optional(),
    environment: z.enum(['production', 'staging', 'development']).optional(),
    tags: z.array(z.string()).optional(),
    batchId: z.string().optional(),
  }).optional(),
});

export type PipelineEvent = z.infer<typeof PipelineEventSchema>;

/**
 * Internal enriched event (after validation and enrichment)
 */
export const EnrichedEventSchema = PipelineEventSchema.extend({
  eventId: z.string().uuid(),
  receivedAt: z.string().datetime(),
  ingestionService: z.string(),
  validationStatus: z.enum(['valid', 'invalid']),
});

export type EnrichedEvent = z.infer<typeof EnrichedEventSchema>;