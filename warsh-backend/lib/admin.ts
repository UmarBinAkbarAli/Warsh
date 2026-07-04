import { NextResponse } from "next/server";

export function getAdminWriteError(request: Request) {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;

  if (!configuredToken) {
    // Only bypass admin auth when explicitly opted into for local development —
    // never infer this from NODE_ENV alone, since a misconfigured non-production
    // deploy (e.g. staging) would otherwise leave every admin route open.
    if (process.env.ALLOW_UNAUTHENTICATED_ADMIN === "true" && process.env.NODE_ENV !== "production") {
      return null;
    }
    return NextResponse.json(
      { error: "Admin writes are disabled until ADMIN_DASHBOARD_TOKEN is configured.", code: "admin_disabled" },
      { status: 403 },
    );
  }

  const token = request.headers.get("x-admin-token");
  if (token !== configuredToken) {
    return NextResponse.json({ error: "Invalid admin token.", code: "forbidden" }, { status: 403 });
  }

  return null;
}
