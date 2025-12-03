// src/lib/models/OnboardingSession.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  Types,
} from "mongoose";

const OnboardingSessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    mode: {
      type: String,
      enum: ["first-time", "new-client", "new-workspace"],
      required: true,
    },
    step: {
      type: String,
      enum: ["boot", "greeting", "mode-select", "evidence", "processing", "review", "complete"],
      default: "boot",
    },
    inputMode: {
      type: String,
      enum: ["website", "documents", "social", "name", "hybrid"],
      default: "hybrid",
    },
    evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
    processingProgress: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export type OnboardingSessionDocument = InferSchemaType<
  typeof OnboardingSessionSchema
> & {
  _id: string;
};

export const OnboardingSession: Model<OnboardingSessionDocument> =
  (models.OnboardingSession as Model<OnboardingSessionDocument>) ||
  model<OnboardingSessionDocument>("OnboardingSession", OnboardingSessionSchema);
