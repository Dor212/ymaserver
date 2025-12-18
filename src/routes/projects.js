import express from "express";
import { Project } from "../models/Project.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const all = String(req.query.all || "") === "1";
    const filter = all ? {} : { isActive: true };

    const projects = await Project.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    const normalized = projects.map((p) => {
      const obj = p.toObject();
      const finalUrl = obj.url || obj.liveUrl || "";
      return { ...obj, url: finalUrl, liveUrl: finalUrl };
    });

    res.json(normalized);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const all = String(req.query.all || "") === "1";
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Project not found" });
    if (!all && !project.isActive)
      return res.status(404).json({ error: "Project not found" });

    const obj = project.toObject();
    const finalUrl = obj.url || obj.liveUrl || "";
    res.json({ ...obj, url: finalUrl, liveUrl: finalUrl });
  } catch {
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      clientName,
      projectType,
      description,
      longDescription,
      url,
      liveUrl,
      images,
      order,
      isActive,
    } = req.body;

    if (!clientName || !projectType || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const finalUrl =
      typeof url === "string"
        ? url
        : typeof liveUrl === "string"
        ? liveUrl
        : "";

    const project = await Project.create({
      clientName: String(clientName).trim(),
      projectType: String(projectType).trim(),
      description: String(description).trim(),
      longDescription:
        typeof longDescription === "string" ? longDescription.trim() : "",
      url: finalUrl,
      liveUrl: finalUrl,
      images: Array.isArray(images)
        ? images.filter((x) => typeof x === "string" && x)
        : [],
      order: typeof order === "number" ? order : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    const obj = project.toObject();
    const normalizedUrl = obj.url || obj.liveUrl || "";
    res
      .status(201)
      .json({ ...obj, url: normalizedUrl, liveUrl: normalizedUrl });
  } catch {
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
