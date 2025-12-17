import mongoose from "mongoose";

const referenceClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    projectType: {
      type: String,
      enum: ["landing", "business", "shop", "other"],
      default: "other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxLeadsPerWeek: {
      type: Number,
      default: 3,
    },
    leadsSentThisWeek: {
      type: Number,
      default: 0,
    },
    niche: { type: String, trim: true },
    note: { type: String, trim: true },

    lastLeadSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ReferenceClient = mongoose.model(
  "ReferenceClient",
  referenceClientSchema
);
