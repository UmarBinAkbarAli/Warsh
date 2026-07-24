import { PUBLIC_SITE_URL } from "../../lib/publicSite";

export async function GET() {
  return Response.redirect(`${PUBLIC_SITE_URL}/privacy`, 308);
}
