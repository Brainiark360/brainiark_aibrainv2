import { z } from 'zod';

export const RegisterSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const BrandCreateSchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100),
});

export const EvidenceItemSchema = z.object({
  type: z.enum(['website', 'document', 'social', 'manual']),
  value: z.string().min(1, 'Value is required'),
});

export const BrandBrainUpdateSchema = z.object({
  summary: z.string().optional(),
  audience: z.string().optional(),
  tone: z.string().optional(),
  pillars: z.array(z.string()).optional(),
  offers: z.string().optional(),
  competitors: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  status: z.enum(['not_started', 'in_progress', 'ready']).optional(),
});