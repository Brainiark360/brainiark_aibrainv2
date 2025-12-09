import { Schema, model, models, Types } from "mongoose";

export interface EvidenceDocument {
  _id: Types.ObjectId;
  brandSlug: string;
  brandWorkspaceId: Types.ObjectId;
  type: "website" | "document" | "social" | "manual" | "brand_name_search";
  value: string;
  status: "pending" | "processing" | "complete" | "failed";
  analyzedContent?: string;
  analysisSummary?: string;
  analysisError?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EvidenceSchema = new Schema<EvidenceDocument>(
  {
    brandSlug: { type: String, required: true, index: true },

    brandWorkspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        "website",
        "document",
        "social",
        "manual",
        "brand_name_search",
      ],
    },

    value: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "processing", "complete", "failed"],
      default: "pending",
    },

    analyzedContent: String,
    analysisSummary: String,
    analysisError: String,

    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

// Prevent model re-compilation
export const Evidence =
  models.Evidence || model<EvidenceDocument>("Evidence", EvidenceSchema);
