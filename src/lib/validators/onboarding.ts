// src/lib/validators/onboarding.ts
import { z } from "zod";

export const startOnboardingSchema = z.object({
  mode: z.enum(["first-time", "new-client", "new-workspace"]),
  workspaceName: z.string().min(1).max(200),
  inputMode: z.enum(["website", "documents", "social", "name", "hybrid"]),
});

export type StartOnboardingInput = z.infer<typeof startOnboardingSchema>;

export const addEvidenceSchema = z.object({
  sessionId: z.string().min(1),
  type: z.enum(["website", "document", "social", "name"]),
  label: z.string().min(1),
  url: z.string().url().optional(),
  fileId: z.string().optional(),
  rawText: z.string().optional(),
});

export const removeEvidenceSchema = z.object({
  sessionId: z.string().min(1),
  evidenceId: z.string().min(1),
});

export const analyzeSchema = z.object({
  sessionId: z.string().min(1),
});

export const statusSchema = z.object({
  sessionId: z.string().min(1),
});

export const completeSchema = z.object({
  sessionId: z.string().min(1),
});
