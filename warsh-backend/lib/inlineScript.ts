// Helpers for embedding server-side values into an inline <script> block.
//
// JSON.stringify escapes for JavaScript STRING context but NOT for the HTML
// parser, which ends a <script> element at the first literal `</script>`
// regardless of JS quoting. A value containing one therefore breaks out of the
// script and injects markup — a reflected XSS. Escaping `<` and `>` as unicode
// sequences keeps the value an inert JS string with identical runtime value.
//
// U+2028/U+2029 are escaped too: they are valid inside JSON strings but are
// line terminators to older JavaScript parsers.
export function toInlineScriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

// Shape of the JWTs Warsh issues for password resets and deep links. Values
// that do not match are dropped before reaching a page, so the escaping above
// is a second layer rather than the only one.
const JWT_SHAPE = /^[A-Za-z0-9._-]{20,2048}$/;

export function asSafeJwtParam(raw: string | null | undefined): string {
  const value = raw ?? "";
  return JWT_SHAPE.test(value) ? value : "";
}
