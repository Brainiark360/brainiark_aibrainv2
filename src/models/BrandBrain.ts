// /models/BrandBrain.ts - FIXED VERSION
import mongoose, { Schema, Document, Model } from "mongoose";

export type EvidenceType = "website" | "document" | "social" | "manual";
export type EvidenceStatus = "pending" | "processing" | "complete";

export interface EvidenceItem {
  type: EvidenceType;
  value: string;
  status: EvidenceStatus;
  analyzedContent?: string;
}

export interface IBrandBrain extends Document {
  brandWorkspaceId: mongoose.Types.ObjectId;
  brandSlug: string;

  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  offers: string;
  competitors: string[];
  channels: string[];

  evidence: EvidenceItem[];

  status: "not_started" | "in_progress" | "ready";
  isActivated: boolean;
  onboardingStep: number;

  lastAnalyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceItemSchema = new Schema<EvidenceItem>(
  {
    type: {
      type: String,
      enum: ["website", "document", "social", "manual"],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "complete"],
      default: "pending",
    },
    analyzedContent: {
      type: String,
    },
  },
  { _id: false }
);

const BrandBrainSchema = new Schema<IBrandBrain>(
  {
    brandWorkspaceId: {
      type: Schema.Types.ObjectId,
      ref: "BrandWorkspace",
      required: true,
      // REMOVED: index: true, // Remove inline index to avoid duplicates
    },

    brandSlug: {
      type: String,
      required: true,
      // REMOVED: index: true, // Remove inline index to avoid duplicates
    },

    summary: { type: String, default: "" },
    audience: { type: String, default: "" },
    tone: { type: String, default: "" },
    pillars: { type: [String], default: [] },
    offers: { type: String, default: "" },
    competitors: { type: [String], default: [] },
    channels: { type: [String], default: [] },

    evidence: {
      type: [EvidenceItemSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "ready"],
      default: "not_started",
    },

    isActivated: {
      type: Boolean,
      default: false,
    },

    onboardingStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 5,
    },

    lastAnalyzedAt: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// KEEP ONLY schema-level indexes (remove inline indexes above)
BrandBrainSchema.index({ brandWorkspaceId: 1 }, { unique: true });
BrandBrainSchema.index({ brandSlug: 1 }, { unique: true });

// Add compound index for common queries
BrandBrainSchema.index({ brandSlug: 1, status: 1 });
BrandBrainSchema.index({ brandWorkspaceId: 1, isActivated: 1 });

export const BrandBrain: Model<IBrandBrain> =
  mongoose.models.BrandBrain ||
  mongoose.model<IBrandBrain>("BrandBrain", BrandBrainSchema);