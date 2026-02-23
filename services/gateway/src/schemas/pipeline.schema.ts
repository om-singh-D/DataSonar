import { z } from 'zod';

export const CreatePipelineSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Name must be lowercase alphanumeric with hyphens only'),
  description: z.string().max(1000).optional(),
  sourceType: z.enum(['database', 'api', 'file', 'stream', 'webhook']),
  sourceConfig: z.record(z.string(), z.unknown()),
});

export const UpdatePipelineSchema = z.object({
  description: z.string().max(1000).optional(),
  sourceConfig: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['ACTIVE', 'PAUSED']).optional(),
});

export type CreatePipelineInput = z.infer<typeof CreatePipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof UpdatePipelineSchema>;