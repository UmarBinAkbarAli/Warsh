import { NextResponse } from "next/server";

export function getAdminWriteError(request: Request) {
  const configuredToken = process.env.ADMIN_DASHBOARD_TOKEN;

  if (!configuredToken && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Admin writes are disabled until ADMIN_DASHBOARD_TOKEN is configured.", code: "admin_disabled" },
      { status: 403 },
    );
  }

  if (!configuredToken) {
    return null;
  }

  const token = request.headers.get("x-admin-token");
  if (token !== configuredToken) {
    return NextResponse.json({ error: "Invalid admin token.", code: "forbidden" }, { status: 403 });
  }

  return null;
}
