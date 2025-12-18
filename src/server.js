import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db.js";
import referenceClientsRouter from "./routes/referenceClients.js";
import referenceRequestsRouter from "./routes/referenceRequests.js";
import projectsRouter from "./routes/projects.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.set("trust proxy", true);

const DEFAULT_ALLOWED = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const ENV_ALLOWED = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ALLOWED, ...ENV_ALLOWED])];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes(origin))
      return callback(null, true);
    return callback(null, false);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "YMA server is running" });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("ok");
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
