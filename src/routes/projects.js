import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Project } from "../models/Project.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../../uploads/projects");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ext && ext.length <= 8 ? ext : "";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 7 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype?.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image uploads are allowed"));
  },
});

router.get("/", async (req, res) => {
  try {
    const all = String(req.query.all || "") === "1";
    const filter = all ? {} : { isActive: true };

    const projects = await Project.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(projects);
  } catch {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.post("/", upload.array("images", 8), async (req, res) => {
  try {
    const { clientName, projectType, description, order, isActive } = req.body;

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const uploaded = Array.isArray(req.files) ? req.files : [];

    const uploadedUrls = uploaded.map(
      (f) => `${baseUrl}/uploads/projects/${f.filename}`
    );

    const project = await Project.create({
      clientName,
      projectType,
      description,
      images: uploadedUrls,
      order: Number(order) || 0,
      isActive: String(isActive) === "true" || isActive === true,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err?.message || "Failed to create project" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  } catch {
    res.status(400).json({ error: "Failed to delete project" });
  }
});

export default router;
