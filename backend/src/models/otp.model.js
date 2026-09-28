import mongoose from "mongoose";

// One pending code per email. The TTL index deletes the document
// 10 minutes after creation, so expired codes vanish on their own.
const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // seconds — 10 minute code lifetime
    },
  },
  { timestamps: false }
);

export const Otp = mongoose.model("Otp", otpSchema);
