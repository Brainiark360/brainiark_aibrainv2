// lib/api/types.ts
import { z } from 'zod';

export const CreateBrandWorkspaceSchema = z.object({
  name: z.string().min(2, 'Brand name must be at least 2 characters').max(50),
});

export type CreateBrandWorkspaceInput = z.infer<typeof CreateBrandWorkspaceSchema>;

export const EvidenceInputSchema = z.object({
  type: z.enum(['website', 'document', 'social', 'manual']),
  value: z.string().url().optional().or(z.string().min(1)),
});

export type EvidenceInput = z.infer<typeof EvidenceInputSchema>;