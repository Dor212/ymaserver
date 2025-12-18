import jwt from "jsonwebtoken";

export function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), tokenType: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "14d" }
  );
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefresh(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}
