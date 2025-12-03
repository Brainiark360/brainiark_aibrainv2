// src/lib/models/AiLog.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  Types,
} from "mongoose";

const AiLogSchema = new Schema(
  {
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["system", "insight", "action"],
      default: "system",
    },
    message: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export type AiLogDocument = InferSchemaType<typeof AiLogSchema> & {
  _id: string;
};

export const AiLog: Model<AiLogDocument> =
  (models.AiLog as Model<AiLogDocument>) ||
  model<AiLogDocument>("AiLog", AiLogSchema);
