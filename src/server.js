import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import referenceClientsRouter from "./routes/referenceClients.js";
import referenceRequestsRouter from "./routes/referenceRequests.js";
import projectsRouter from "./routes/projects.js";



dotenv.config();

const app = express();

app.set("trust proxy", true);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = (process.env.CORS_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (!origin) return callback(null, true);
      if (!allowed.length || allowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "YMA server is running" });
});

app.use("/api/reference-clients", referenceClientsRouter);
app.use("/api/reference-requests", referenceRequestsRouter);
app.use("/api/projects", projectsRouter);


app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 YMA server listening on port ${PORT}`);
  });
});
