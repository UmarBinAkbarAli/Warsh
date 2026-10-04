import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "../../../lib/admin";
import Core500Client from "./Core500Client";
export const dynamic = "force-dynamic";
export default function Core500Page() {
  if (!verifyAdminCookieValue(cookies().get(ADMIN_COOKIE_NAME)?.value)) redirect("/dashboard/login");
  return <Core500Client />;
}
