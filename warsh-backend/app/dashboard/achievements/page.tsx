import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "../../../lib/admin";
import AchievementsClient from "./AchievementsClient";

export const dynamic = "force-dynamic";

export default function AchievementsPage() {
  if (!verifyAdminCookieValue(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/dashboard/login");
  }
  return <AchievementsClient />;
}
