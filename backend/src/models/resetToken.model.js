import mongoose from "mongoose";

// Single-use password reset tokens. MongoDB deletes the document the
// moment expiresAt passes (expireAfterSeconds: 0).
const resetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: false }
);

export const ResetToken = mongoose.model("ResetToken", resetTokenSchema);
