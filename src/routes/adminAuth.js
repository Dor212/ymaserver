import express from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { Admin } from "../models/Admin.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from "../auth/tokens.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const COOKIE_NAME = "admin_rt";

function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/admin/auth",
    maxAge: 14 * 24 * 60 * 60 * 1000,
    domain: isProd ? ".yma-web.com" : undefined,
  });
}



router.get("/ping", (req, res) => {
  res.json({ ok: true, where: "adminAuth router" });
});




router.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  const admin = await Admin.findOne({
    email: String(email).toLowerCase().trim(),
  });
  if (!admin || !admin.isActive)
    return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken(admin);
  const refreshToken = signRefreshToken(admin);

  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, admin: { email: admin.email, role: admin.role } });
});

router.post("/refresh", async (req, res) => {
  const rt = req.cookies?.[COOKIE_NAME];
  if (!rt) return res.status(401).json({ error: "No refresh token" });

  let payload;
  try {
    payload = verifyRefresh(rt);
  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive)
    return res.status(401).json({ error: "Invalid admin" });

  const accessToken = signAccessToken(admin);
  res.json({ accessToken, admin: { email: admin.email, role: admin.role } });
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/api/admin/auth" });
  res.json({ ok: true });
});

export default router;
