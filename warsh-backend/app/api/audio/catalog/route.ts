import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "../../../../lib/auth";
import { catalogAudioUrl, normalizeCatalogAudioText } from "../../../../lib/audioCatalog";
import { getUserSubscriptionState, requiresSubscription } from "../../../../lib/subscription";

const MAX_AUDIO_TEXT_LENGTH = 500;

export async function GET(request: Request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }

  const subscriptionState = await getUserSubscriptionState(userId);
  if (!subscriptionState) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 });
  }
  if (requiresSubscription(subscriptionState)) {
    return NextResponse.json({ error: "Subscription required", code: "subscription_required" }, { status: 402 });
  }

  const text = normalizeCatalogAudioText(new URL(request.url).searchParams.get("text") ?? "");
  if (!text) {
    return NextResponse.json({ error: "Missing text", code: "bad_request" }, { status: 400 });
  }
  if (text.length > MAX_AUDIO_TEXT_LENGTH) {
    return NextResponse.json({ error: "Text is too long for catalogue audio", code: "bad_request" }, { status: 400 });
  }

  // The admin audit proves catalogue completeness before deployment. Runtime
  // requests redirect directly to the deterministic public object; if an asset
  // is ever removed, R2 returns 404 and no generation fallback exists.
  return NextResponse.redirect(catalogAudioUrl(text), 307);
}
