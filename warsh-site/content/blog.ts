// Blog content is authored in Warsh Studio (api.warsh.app/dashboard/blog) and
// served over the public /api/blog routes. These helpers fetch it with ISR so
// a new post shows up here without a redeploy.
import sanitizeHtml from 'sanitize-html';

const API_BASE = 'https://api.warsh.app';

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string; // ISO
  readingTime: string;
  author: string;
  coverImageUrl: string | null;
  body: string; // sanitized HTML authored via Warsh Studio's rich-text editor
};

// Revalidate at most once a minute — fast enough that a publish shows up
// promptly, cheap enough not to hammer the backend on every request.
const REVALIDATE_SECONDS = 60;

// The backend already sanitizes on write and on read (see
// warsh-backend/lib/blogSanitize.ts) — this is a second, independent pass at
// the trust boundary right before the HTML reaches dangerouslySetInnerHTML on
// a public page. Keep this allowlist in sync with the backend's.
export function sanitizeBlogBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'h2', 'h3', 'strong', 'em', 'u', 's',
      'ul', 'ol', 'li', 'a', 'img', 'iframe', 'blockquote', 'video', 'source',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen'],
      video: ['src', 'controls', 'width', 'height'],
      source: ['src', 'type'],
    },
    allowedSchemes: ['http', 'https'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${API_BASE}/api/blog`, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return [];
    const payload = await res.json();
    return (payload?.data?.posts ?? []) as BlogPost[];
  } catch {
    // Backend hiccup: an empty blog index is a better failure mode for a
    // marketing page than a hard 500.
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${API_BASE}/api/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const payload = await res.json();
    return (payload?.data?.post ?? null) as BlogPost | null;
  } catch {
    return null;
  }
}
