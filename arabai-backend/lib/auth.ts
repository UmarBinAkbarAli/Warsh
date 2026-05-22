import jwt from "jsonwebtoken";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required.");
  }
  return secret;
}

export interface AuthPayload {
  userId: string;
}

export function signToken(userId: string) {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

// Allows extracting the userId from an expired token — used only by the refresh endpoint.
export function verifyTokenAllowExpired(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { ignoreExpiration: true }) as AuthPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "") ?? "";
  const payload = verifyToken(token);
  return payload?.userId ?? null;
}
