import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  // Disable version key
  versionKey: false,
  // Disable automatic timestamps since we're handling them manually
  timestamps: false,
});

// Remove ALL pre-save hooks
// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string) {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.models.User || mongoose.model('User', UserSchema);