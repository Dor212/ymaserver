import mongoose from "mongoose";

const referenceRequestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    projectType: {
      type: String,
      enum: ["landing", "business", "shop", "other"],
      default: "other",
    },
    assignedClients: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ReferenceClient",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ReferenceRequest = mongoose.model(
  "ReferenceRequest",
  referenceRequestSchema
);
