import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "replace-me";

export interface AuthPayload {
  userId: string;
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}
