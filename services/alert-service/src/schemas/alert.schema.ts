import { z } from 'zod';

export const alertSchema = z.object({
  event_id: z.string().min(1),
  source_id: z.string().min(1),
  pipeline_id: z.string().min(1),
  detected_at: z.string().datetime(),
  anomaly_types: z.array(z.string().min(1)).min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  summary: z.string().min(1),
  quality_score: z.number().min(0).max(1),
  record_count: z.number().int().nonnegative(),
});

export type AlertPayload = z.infer<typeof alertSchema>;
