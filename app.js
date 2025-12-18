import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import adminAuthRouter from "./routes/adminAuth.js";

const app = express();

app.set("trust proxy", true);
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    credentials: true,
  })
);

app.use("/api/admin/auth", adminAuthRouter);

export default app;
