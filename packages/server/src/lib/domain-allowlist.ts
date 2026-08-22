// List of domains that we 100% trust. Links pointing to these will not be checked by our API safe link checker.
// Also, we will not show a secondary page to users upon redirects (The one that says "are you sure that you want to be redirected to this link?")
const ALLOWLISTED_DOMAINS = [
  "instagram.com",
  "youtube.com",
  "youtu.be",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "facebook.com",
  "amazon.com",
  "google.com",
  "github.com",
];

export function isAllowlistedDomain(url: string): boolean {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }

  return ALLOWLISTED_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );
}
