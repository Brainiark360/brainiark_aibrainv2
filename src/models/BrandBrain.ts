import { Schema, model, models, Types } from "mongoose";

export interface BrandBrainDocument {
  _id: Types.ObjectId;

  brandWorkspaceId: Types.ObjectId;
  brandSlug: string;

  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  offers: string;
  competitors: string[];
  channels: string[];
  recommendations?: string[];

  status: "not_started" | "in_progress" | "ready" | "failed";
  isActivated: boolean;
  onboardingStep: number;

  analysisMethod?: string;
  lastAnalyzedAt?: Date;
  analysisStartedAt?: Date;
  analysisCompletedAt?: Date;
  analysisDurationMs?: number;

  evidenceCount?: number;
  evidenceType?: string;
  gptAnalysisData?: Record<string, unknown>;

  lastError?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BrandBrainSchema = new Schema<BrandBrainDocument>(
  {
    brandWorkspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    brandSlug: {
      type: String,
      required: true,
      unique: true,
    },

    summary: { type: String, default: "" },
    audience: { type: String, default: "" },
    tone: { type: String, default: "" },
    pillars: { type: [String], default: [] },
    offers: { type: String, default: "" },
    competitors: { type: [String], default: [] },
    channels: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "ready", "failed"],
      default: "not_started",
    },

    isActivated: { type: Boolean, default: false },

    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },

    analysisMethod: String,
    lastAnalyzedAt: Date,
    analysisStartedAt: Date,
    analysisCompletedAt: Date,
    analysisDurationMs: Number,

    evidenceCount: Number,
    evidenceType: String,
    gptAnalysisData: Object,

    lastError: String,
  },
  { timestamps: true }
);

BrandBrainSchema.index({ brandWorkspaceId: 1 });
BrandBrainSchema.index({ brandSlug: 1 }, { unique: true });
BrandBrainSchema.index({ brandSlug: 1, status: 1 });

export const BrandBrain =
  models.BrandBrain ||
  model<BrandBrainDocument>("BrandBrain", BrandBrainSchema);
