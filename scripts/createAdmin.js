import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { Admin } from "../src/models/Admin.js";

await mongoose.connect(process.env.MONGODB_URI);

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) throw new Error("Missing ADMIN_EMAIL/ADMIN_PASSWORD");

const exists = await Admin.findOne({ email: email.toLowerCase() });
if (exists) {
  console.log("Admin already exists");
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 12);
await Admin.create({ email, passwordHash });

console.log("✅ Admin created:", email);
process.exit(0);
