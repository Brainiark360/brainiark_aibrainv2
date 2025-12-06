// src/lib/zod-schemas.ts
import { z } from "zod";

/**
 * Shared Zod primitives
 */
export const emailSchema = z
  .string()
  .min(5, "Email is too short.")
  .max(254, "Email is too long.")
  .email("Please enter a valid email address.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

export const phoneSchema = z
  .string()
  .min(6, "Phone number is too short.")
  .max(32, "Phone number is too long.")
  .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Please enter a valid phone number");

export const firstNameSchema = z
  .string()
  .min(2, "First name must be at least 2 characters.")
  .max(50, "First name is too long.");

export const lastNameSchema = z
  .string()
  .min(2, "Last name must be at least 2 characters.")
  .max(50, "Last name is too long.");

/**
 * Auth-specific schemas
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  password: passwordSchema,
});

export const resetRequestSchema = z.object({
  email: emailSchema,
});

export const resetCompleteSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

/**
 * Onboarding / Brand-specific schemas
 */
export const createBrandWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Brand name must be at least 2 characters.")
    .max(200, "Brand name is too long."),
});

export const evidenceItemSchema = z.object({
  type: z.enum(["website", "document", "social", "manual"]),
  value: z.string().min(1, "Evidence value is required."),
  status: z.enum(["pending", "processing", "complete"]).optional(),
});

export const analyzeEvidenceSchema = z.object({
  evidence: z.array(evidenceItemSchema).min(1, "Please provide at least one piece of evidence."),
});

export const brandBrainUpdateSchema = z.object({
  section: z.enum([
    "summary",
    "audience",
    "tone",
    "pillars",
    "offers",
    "competitors",
    "channels",
  ]),
  // For most sections we send a single block of text.
  value: z.string().min(1, "Value cannot be empty."),
});

/**
 * Exported types
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetRequestInput = z.infer<typeof resetRequestSchema>;
export type ResetCompleteInput = z.infer<typeof resetCompleteSchema>;

export type CreateBrandWorkspaceInput = z.infer<typeof createBrandWorkspaceSchema>;
export type EvidenceItemInput = z.infer<typeof evidenceItemSchema>;
export type AnalyzeEvidenceInput = z.infer<typeof analyzeEvidenceSchema>;
export type BrandBrainUpdateInput = z.infer<typeof brandBrainUpdateSchema>;
