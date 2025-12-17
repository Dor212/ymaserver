import express from "express";
import { ReferenceClient } from "../models/ReferenceClient.js";
import { ReferenceRequest } from "../models/ReferenceRequest.js";
import { sendReferenceEmails } from "../services/referenceEmailService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message, projectType } = req.body;

    if (!name || !phone || !email || !message) {
      return res.status(400).json({
        error: "name, phone, email, message הם שדות חובה",
      });
    }

    const matchStage = {
      isActive: true,
    };

    if (
      projectType &&
      ["landing", "business", "shop", "other"].includes(projectType)
    ) {
      matchStage.projectType = { $in: [projectType, "other"] };
    }

    const candidates = await ReferenceClient.aggregate([
      { $match: matchStage },
      { $sample: { size: 2 } },
    ]);

    if (!candidates.length) {
      return res.status(503).json({
        error: "כרגע אין לקוחות זמינים לקבל פניות. נסו שוב מאוחר יותר.",
      });
    }

    const assignedIds = candidates.map((c) => c._id);

    const referenceRequest = await ReferenceRequest.create({
      name,
      phone,
      email,
      message,
      projectType: projectType || "other",
      assignedClients: assignedIds,
    });

    await Promise.all(
      candidates.map((client) =>
        ReferenceClient.findByIdAndUpdate(client._id, {
          $inc: { leadsSentThisWeek: 1 },
          $set: { lastLeadSentAt: new Date() },
        })
      )
    );

    await sendReferenceEmails({
      request: referenceRequest,
      clients: candidates,
    });

    res.status(201).json({
      message: "הפניה נשלחה ללקוחות שלנו. תודה!",
    });
  } catch (err) {
    console.error("Error in POST /api/reference-requests:", err);
    res.status(500).json({
      error: "משהו השתבש, נסה שוב מאוחר יותר.",
    });
  }
});

export default router;
