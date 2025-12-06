// /src/models/BrandBrain.ts
import { mongoose } from "@/lib/mongoose";
import {
  Schema,
  type Document,
  type Model,
  models,
  type Types,
} from "mongoose";

export type EvidenceType = "website" | "document" | "social" | "manual";
export type EvidenceStatus = "pending" | "processing" | "complete";

export interface EvidenceItem {
  type: EvidenceType;
  value: string;
  status: EvidenceStatus;
}

export interface IBrandBrain extends Document {
  brandId: Types.ObjectId; // Changed from brandWorkspaceId to brandId
  summary: string;
  audience: string;
  tone: string;
  pillars: string[];
  offers: string;
  competitors: string[];
  channels: string[];
  evidence: EvidenceItem[];
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<EvidenceItem>(
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
  },
  { _id: false }
);

const BrandBrainSchema = new Schema<IBrandBrain>(
  {
    brandId: { // Changed from brandWorkspaceId to brandId
      type: Schema.Types.ObjectId,
      ref: "BrandWorkspace",
      required: true,
      unique: true, // This is causing the duplicate key error
    },

    summary: { type: String, default: "" },
    audience: { type: String, default: "" },
    tone: { type: String, default: "" },
    pillars: { type: [String], default: [] },
    offers: { type: String, default: "" },
    competitors: { type: [String], default: [] },
    channels: { type: [String], default: [] },

    evidence: {
      type: [EvidenceSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Update the index to match the field name
BrandBrainSchema.index({ brandId: 1 }, { unique: true });

export const BrandBrain: Model<IBrandBrain> =
  models.BrandBrain ||
  mongoose.model<IBrandBrain>("BrandBrain", BrandBrainSchema);