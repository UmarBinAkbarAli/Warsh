import sanitizeHtml from "sanitize-html";

// Blog bodies are authored as HTML by the Tiptap editor in Warsh Studio and
// rendered directly (dangerouslySetInnerHTML) on warsh.app. Sanitizing on every
// admin write — and again defensively on public read — is the XSS boundary:
// even a compromised admin session or an editor bug can only ever produce
// output that fits this allowlist.
const ALLOWED_IFRAME_HOSTS = ["www.youtube.com", "youtube.com", "player.vimeo.com"];

export function sanitizeBlogHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "strong", "em", "u", "s",
      "ul", "ol", "li", "a", "img", "iframe", "blockquote", "video", "source",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen"],
      video: ["src", "controls", "width", "height"],
      source: ["src", "type"],
    },
    allowedSchemes: ["http", "https"],
    // Only youtube/vimeo embeds are allowed as iframes — anything else is dropped
    // rather than silently rewritten, so a bad embed fails loudly in the editor.
    exclusiveFilter: (frame) => {
      if (frame.tag !== "iframe") return false;
      try {
        const host = new URL(frame.attribs.src ?? "").host;
        return !ALLOWED_IFRAME_HOSTS.includes(host);
      } catch {
        return true;
      }
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
  });
}

// Reading-time estimate needs plain text, not markup weight.
export function estimateReadingMinutesFromHtml(html: string): number {
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
