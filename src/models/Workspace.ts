// src/lib/models/Workspace.ts
import {
  Schema,
  model,
  models,
  type Model,
  type InferSchemaType,
  Types,
} from "mongoose";

const WorkspaceSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    mode: {
      type: String,
      enum: ["first-time", "new-client", "new-workspace"],
      required: true,
    },
    evidenceIds: [{ type: Types.ObjectId, ref: "Evidence" }],
  },
  {
    timestamps: true,
  }
);

export type WorkspaceDocument = InferSchemaType<typeof WorkspaceSchema> & {
  _id: string;
};

export const Workspace: Model<WorkspaceDocument> =
  (models.Workspace as Model<WorkspaceDocument>) ||
  model<WorkspaceDocument>("Workspace", WorkspaceSchema);
