import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "../../../../lib/admin";
import UserDetailClient from "./UserDetailClient";

export const dynamic = "force-dynamic";

export default function UserDetailPage({ params }: { params: { id: string } }) {
  if (!verifyAdminCookieValue(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/dashboard/login");
  }
  return <UserDetailClient userId={params.id} />;
}
