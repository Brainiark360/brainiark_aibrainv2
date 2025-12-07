// /lib/backend/validation.ts
import { z } from 'zod';
import { BrandBrainUpdateSchema, EvidenceItemSchema } from '../zod/schemas';
import { NextRequest } from 'next/server';


// Extend existing schemas
export const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.any().optional(),
  step: z.enum(['intro', 'collecting_evidence', 'waiting_for_analysis', 'analyzing', 'reviewing_brand_brain', 'complete']),
});

export const evidenceRequestSchema = EvidenceItemSchema;

export const stateUpdateSchema = z.object({
  step: z.enum(['intro', 'collecting_evidence', 'waiting_for_analysis', 'analyzing', 'reviewing_brand_brain', 'complete']),
});

// Use existing BrandBrainUpdateSchema from your validations
export const brainUpdateSchema = BrandBrainUpdateSchema.extend({
  recommendations: z.array(z.string()).optional(),
});

export const analyzeRequestSchema = z.object({
  evidenceIds: z.array(z.string()).optional(),
});

// Helper for validating requests
export async function validateRequest<T>(
  schema: z.ZodSchema<T>,
  request: NextRequest
): Promise<{ success: true; data: T } | { success: false; error: string; details?: any }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return {
        success: false,
        error: 'Invalid request data',
        details: result.error.format()
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON in request body'
    };
  }
}