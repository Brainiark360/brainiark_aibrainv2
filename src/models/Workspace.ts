// /models/BrandWorkspace.ts - OPTIMIZED VERSION
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBrandWorkspace extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  slug: string;

  aiThreadId?: string;

  status: "not_started" | "in_progress" | "ready";
  onboardingStep: number;

  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BrandWorkspaceSchema = new Schema<IBrandWorkspace>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: [true, "Brand name is required"],
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    aiThreadId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "ready"],
      default: "not_started",
    },

    onboardingStep: {
      type: Number,
      default: 1,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// Modern async middleware
BrandWorkspaceSchema.pre("save", async function () {
  this.updatedAt = new Date();
  this.lastActiveAt = new Date();
});

// Add indexes at schema level
BrandWorkspaceSchema.index({ slug: 1 }, { unique: true });
BrandWorkspaceSchema.index({ ownerUserId: 1 }); // For user workspace queries
BrandWorkspaceSchema.index({ status: 1, lastActiveAt: -1 }); // For dashboard
BrandWorkspaceSchema.index({ slug: 1, status: 1 }); // For onboarding queries

export const BrandWorkspace: Model<IBrandWorkspace> =
  mongoose.models.BrandWorkspace ||
  mongoose.model<IBrandWorkspace>("BrandWorkspace", BrandWorkspaceSchema);