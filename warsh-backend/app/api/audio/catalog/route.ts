import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
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
  //
  // A missing or non-absolute R2_PUBLIC_URL used to surface as an unhandled
  // "URL is malformed" crash out of NextResponse.redirect — an opaque 500 for
  // the client and a stack trace naming Next internals for the operator. Report
  // it as the configuration fault it is, and answer with the standard envelope.
  let target: string;
  try {
    target = catalogAudioUrl(text);
  } catch (error) {
    Sentry.captureException(error, { tags: { misconfiguration: "R2_PUBLIC_URL" } });
    console.error("[audio/catalog] cannot build the catalogue URL:", (error as Error)?.message ?? error);
    return NextResponse.json(
      { error: "Audio is unavailable right now.", code: "audio_unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.redirect(target, 307);
}
