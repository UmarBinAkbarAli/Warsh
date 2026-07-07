import { NextRequest, NextResponse } from "next/server";

// The production web app (Expo web build) is served from this origin and must
// always be able to reach the API, regardless of how CORS_ALLOWED_ORIGINS is set.
const ALWAYS_ALLOWED_ORIGINS = ["https://app.warsh.app"];

// Local Expo web dev server — only trusted outside production.
const DEV_ALLOWED_ORIGINS = ["http://localhost:8081", "http://127.0.0.1:8081"];

function getAllowedOrigins() {
  const envOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  // env origins are ADDITIVE to the always-allowed web origin, so a
  // misconfigured/empty CORS_ALLOWED_ORIGINS can never lock the web app out.
  const origins = [...ALWAYS_ALLOWED_ORIGINS, ...envOrigins];
  if (process.env.NODE_ENV !== "production") {
    origins.push(...DEV_ALLOWED_ORIGINS);
  }
  return Array.from(new Set(origins));
}

function applyCorsHeaders(response: NextResponse, origin: string | null) {
  if (!origin || !getAllowedOrigins().includes(origin)) {
    return response;
  }

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set("Access-Control-Allow-Credentials", "false");
  response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Warsh-Platform");
  response.headers.set("Access-Control-Max-Age", "86400");
  response.headers.append("Vary", "Origin");

  return response;
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), origin);
  }

  return applyCorsHeaders(NextResponse.next(), origin);
}

export const config = {
  matcher: "/api/:path*",
};
