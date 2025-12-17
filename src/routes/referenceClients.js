import express from "express";
import { ReferenceClient } from "../models/ReferenceClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const clients = await ReferenceClient.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("Error in GET /api/reference-clients:", err);
    res.status(500).json({ error: "שגיאה בטעינת הלקוחות" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      name,
      businessName,
      email,
      phone,
      projectType,
      isActive,
      maxLeadsPerWeek,
      niche,
      note,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "name ו-email הם שדות חובה",
      });
    }

    const client = await ReferenceClient.create({
      name,
      businessName,
      email,
      phone,
      niche,
      note,
      projectType: projectType || "other",
      isActive: typeof isActive === "boolean" ? isActive : true,
      maxLeadsPerWeek: maxLeadsPerWeek || 3,
    });

    res.status(201).json(client);
  } catch (err) {
    console.error("Error in POST /api/reference-clients:", err);
    res.status(500).json({ error: "שגיאה ביצירת לקוח חדש" });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await ReferenceClient.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "לקוח לא נמצא" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Error in PATCH /api/reference-clients/:id:", err);
    res.status(500).json({ error: "שגיאה בעדכון הלקוח" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await ReferenceClient.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "לקוח לא נמצא" });
    }

    res.json({ message: "הלקוח נמחק" });
  } catch (err) {
    console.error("Error in DELETE /api/reference-clients/:id:", err);
    res.status(500).json({ error: "שגיאה במחיקת הלקוח" });
  }
});

export default router;
