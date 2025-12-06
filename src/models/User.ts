// /src/models/User.ts
import { mongoose } from "@/lib/mongoose";
import { Schema, Model, models, Document, Types } from "mongoose";

export type OnboardingStatus = "not_started" | "in_progress" | "completed";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  onboardingStatus: OnboardingStatus;
  onboardingStep: number;
  workspaceId: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    onboardingStatus: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
    },
    onboardingStep: {
      type: Number,
      default: 0,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "BrandWorkspace",
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

export const User: Model<IUser> =
  models.User || mongoose.model<IUser>("User", UserSchema);