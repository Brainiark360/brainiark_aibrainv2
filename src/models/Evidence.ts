// /models/Evidence.ts - OPTIMIZED VERSION
import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema({
  brandSlug: {
    type: String,
    required: true,
    // REMOVED: index: true, // Will define at schema level
  },
  type: {
    type: String,
    enum: ['website', 'document', 'social', 'manual'],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'complete'],
    default: 'pending',
  },
  analyzedContent: {
    type: String,
  },
  brandWorkspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BrandWorkspace',
    // REMOVED: index: true, // Will define at schema level
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Define indexes at schema level only (no duplicates)
EvidenceSchema.index({ brandSlug: 1, status: 1 }); // For filtering by slug and status
EvidenceSchema.index({ brandSlug: 1, type: 1 }); // For filtering by slug and type
EvidenceSchema.index({ brandSlug: 1, createdAt: -1 }); // For sorting by latest
EvidenceSchema.index({ brandWorkspaceId: 1 }); // For workspace queries
EvidenceSchema.index({ status: 1, createdAt: 1 }); // For background processing

export const Evidence = mongoose.models.Evidence || 
  mongoose.model('Evidence', EvidenceSchema);