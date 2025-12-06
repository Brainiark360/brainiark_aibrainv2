// src/models/Workspace.ts
import { mongoose } from "@/lib/mongoose";
import {
  Schema,
  type Document,
  type Model,
  models,
  type Types,
} from "mongoose";

export interface IBrandWorkspace extends Document {
  name: string;
  slug: string;
  ownerUserId: Types.ObjectId;
  aiThreadId?: string;
  brainId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BrandWorkspaceSchema = new Schema<IBrandWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aiThreadId: {
      type: String,
    },
    brainId: {
      type: Schema.Types.ObjectId,
      ref: "BrandBrain",
    },
  },
  { timestamps: true }
);

BrandWorkspaceSchema.index({ ownerUserId: 1, slug: 1 });

export const BrandWorkspace: Model<IBrandWorkspace> =
  models.BrandWorkspace ||
  mongoose.model<IBrandWorkspace>("BrandWorkspace", BrandWorkspaceSchema);
