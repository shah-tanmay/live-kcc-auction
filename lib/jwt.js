import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "replace_this_with_a_strong_secret";

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}
