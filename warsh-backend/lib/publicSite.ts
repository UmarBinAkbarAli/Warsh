const configuredPublicSiteUrl = process.env.PUBLIC_SITE_URL?.trim();

export const PUBLIC_SITE_URL = (
  configuredPublicSiteUrl || "https://warsh.app"
).replace(/\/$/, "");
