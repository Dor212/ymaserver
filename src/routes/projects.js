import express from "express";
import { Project } from "../models/Project.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = req.query.all === "1" ? {} : { isActive: true };

    const projects = await Project.find(filter).sort({
      order: 1,
      createdAt: -1,
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});


router.post("/", async (req, res) => {
  try {
    const { clientName, projectType, description, images, order, isActive } =
      req.body;

    const project = await Project.create({
      clientName,
      projectType,
      description,
      images: Array.isArray(images) ? images : [],
      order: typeof order === "number" ? order : 0,
      isActive: typeof isActive === "boolean" ? isActive : true,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: "Failed to create project" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { clientName, projectType, description, images, order, isActive } =
      req.body;

    const project = await Project.findByIdAndUpdate(
      id,
      {
        clientName,
        projectType,
        description,
        images,
        order,
        isActive,
      },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    res.status(400).json({ error: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Failed to delete project" });
  }
});

export default router;
