import { createHash } from "crypto";

export const NOOR_PACK_PRODUCT_ID = "warsh_noor_pack";
export const NOOR_PACK_MESSAGES = 20;

export function hashPurchaseToken(purchaseToken: string) {
  return createHash("sha256").update(purchaseToken.trim()).digest("hex");
}

// Google Play accepts up to 64 characters for obfuscated account identifiers.
// A SHA-256 hex digest binds a purchase to a Warsh user without exposing that
// user's database id to Google or trusting an account id supplied by the client.
export function getStoreAccountId(userId: string) {
  return createHash("sha256").update(userId).digest("hex");
}

export function getNoorPackCredits(quantity: number) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Invalid Noor pack quantity.");
  }
  return NOOR_PACK_MESSAGES * quantity;
}
