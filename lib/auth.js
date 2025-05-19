// lib/auth.js

import jwt from "jsonwebtoken";
import { findAdminByUsername } from "./admins.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // use your actual secret here

export async function getAdminFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  if (!token) return null;

  try {
    // Verify the token and get decoded payload
    const decoded = jwt.verify(token, JWT_SECRET);

    // decoded should have username or id inside
    if (!decoded || !decoded.username) return null;

    // Find admin by username inside token
    const admin = findAdminByUsername(decoded.username);
    return admin || null;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}
