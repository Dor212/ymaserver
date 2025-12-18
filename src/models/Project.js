import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    projectType: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, default: "", trim: true },
    url: { type: String, default: "", trim: true },
    liveUrl: { type: String, default: "", trim: true },
    images: { type: [String], default: [] },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
