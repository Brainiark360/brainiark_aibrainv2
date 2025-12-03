// src/lib/models/Evidence.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  Types,
} from "mongoose";

const EvidenceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["website", "document", "social", "name"],
      required: true,
    },
    label: { type: String, required: true },
    url: { type: String },
    fileId: { type: String },
    rawText: { type: String },
    status: {
      type: String,
      enum: ["queued", "processing", "fused"],
      default: "queued",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export type EvidenceDocument = InferSchemaType<typeof EvidenceSchema> & {
  _id: string;
};

export const Evidence: Model<EvidenceDocument> =
  (models.Evidence as Model<EvidenceDocument>) ||
  model<EvidenceDocument>("Evidence", EvidenceSchema);
