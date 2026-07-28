import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifyAdminCookieValue } from "../../../lib/admin";
import DashboardNav from "../DashboardNav";
import ContentReviewClient from "./ContentReviewClient";
import styles from "./content-review.module.css";

export const dynamic = "force-dynamic";

export default function ContentReviewPage() {
  if (!verifyAdminCookieValue(cookies().get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/dashboard/login");
  }

  return (
    <main className={styles.page}>
      <DashboardNav active="/dashboard/content-review" />
      <ContentReviewClient />
    </main>
  );
}
