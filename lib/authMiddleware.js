import { verifyToken } from "./jwt";

export function getUserFromRequest(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request, allowedRoles = []) {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Unauthorized");
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role))
    throw new Error("Forbidden");
  return user;
}
