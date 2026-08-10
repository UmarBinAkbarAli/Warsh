// Backward-compatible route for already-distributed builds. Runtime speech
// generation is intentionally disabled: old clients now receive only a
// prebuilt R2 catalogue asset, or a closed failure when the asset is missing.
export { GET } from "../catalog/route";
