export function siteOrigin() {
  const url = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thesafequote.com");
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) throw new Error("Invalid public site URL.");
  return url.origin;
}
export function siteIndexable() {
  return process.env.NODE_ENV === "production" && process.env.SITE_INDEXABLE !== "false" && new URL(siteOrigin()).protocol === "https:";
}
