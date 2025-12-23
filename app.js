import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminAuthRouter from "./routes/adminAuth.js";

const app = express();

const normalizeOrigin = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\/$/, "");

const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ORIGINS || "")
    .split(",")
    .map(normalizeOrigin)
    .filter(Boolean)
);

app.set("trust proxy", true);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const o = normalizeOrigin(origin);
      return callback(null, ALLOWED_ORIGINS.has(o));
    },
    credentials: true,
  })
);

app.options("*", cors(corsOptions));

app.use("/api/admin/auth", adminAuthRouter);

export default app;
