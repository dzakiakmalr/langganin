/**
 * Brand registry — curated list of services the Indonesian user actually
 * subscribes to (PRD §2). Each entry maps a human-typed name to:
 *   - the public domain (Logo.dev looks up by domain — most reliable)
 *   - the brand's official color (used to tint the card + the price text)
 *
 * Match strategy: case-insensitive name + alias lookup. If a user types
 * "Netflix Premium" we match the "Netflix" entry via its alias list.
 *
 * Adding a new brand: add an entry below with its public domain. The
 * form auto-attach + Logo.dev lookup will pick it up with no other
 * code changes.
 */

export type Brand = {
  /** Stable key — used as a Map key and for debugging */
  key: string;
  /** Canonical display name (used as a fallback label) */
  name: string;
  /** Variants the user might type — matched case-insensitively */
  aliases: string[];
  /** Public domain — used by Logo.dev to fetch the logo */
  domain: string;
  /** Official brand color in hex (e.g. "#E50914") — used to tint the card + the price text */
  color: string;
};

export const BRANDS: Brand[] = [
  // ── Streaming (Western) ──
  { key: "netflix", name: "Netflix", aliases: ["Netflix Premium", "Netflix Standard", "Netflix Basic"], domain: "netflix.com", color: "#E50914" },
  { key: "disney-plus", name: "Disney+ Hotstar", aliases: ["Disney+", "Disney Plus", "Disney+ Hotstar", "Hotstar"], domain: "hotstar.com", color: "#0F4486" },
  { key: "prime-video", name: "Prime Video", aliases: ["Amazon Prime Video", "Amazon Prime"], domain: "primevideo.com", color: "#00A8E1" },
  { key: "apple-tv", name: "Apple TV+", aliases: ["Apple TV Plus", "Apple TV"], domain: "tv.apple.com", color: "#000000" },
  { key: "hbo-go", name: "HBO Go", aliases: ["HBO Max", "HBO"], domain: "hbomax.com", color: "#9D2235" },
  { key: "paramount-plus", name: "Paramount+", aliases: ["Paramount Plus", "Paramount+ Premium"], domain: "paramountplus.com", color: "#0064FF" },
  { key: "crunchyroll", name: "Crunchyroll", aliases: ["Crunchyroll Mega Fan", "Crunchyroll Ultimate Fan"], domain: "crunchyroll.com", color: "#F47521" },
  { key: "iqiyi", name: "iQIYI", aliases: ["iQiyi Premium", "iQiyi VIP"], domain: "iqiyi.com", color: "#00BE06" },

  // ── Streaming (Indonesian / regional) ──
  { key: "vidio", name: "Vidio", aliases: ["Vidio Premier", "Vidio Platinum"], domain: "vidio.com", color: "#E63946" },
  { key: "wetv", name: "WeTV", aliases: ["WeTV Premium"], domain: "wetv.vip", color: "#FF6B00" },
  { key: "viu", name: "Viu", aliases: ["Viu Premium"], domain: "viu.com", color: "#1D1656" },

  // ── Music / Audio ──
  { key: "spotify", name: "Spotify", aliases: ["Spotify Premium", "Spotify Family"], domain: "spotify.com", color: "#1DB954" },
  { key: "apple-music", name: "Apple Music", aliases: ["Apple Music Premium"], domain: "music.apple.com", color: "#FA243C" },
  { key: "youtube-music", name: "YouTube Music", aliases: ["YT Music", "YouTube Music Premium"], domain: "music.youtube.com", color: "#FF0000" },
  { key: "youtube-premium", name: "YouTube Premium", aliases: ["YouTube Red", "YT Premium"], domain: "youtube.com", color: "#FF0000" },

  // ── Productivity ──
  { key: "notion", name: "Notion", aliases: ["Notion Plus", "Notion AI"], domain: "notion.so", color: "#000000" },
  { key: "figma", name: "Figma", aliases: ["Figma Professional", "Figma Org"], domain: "figma.com", color: "#A259FF" },
  { key: "canva", name: "Canva", aliases: ["Canva Pro", "Canva for Teams", "Canva Free"], domain: "canva.com", color: "#00C4CC" },
  { key: "adobe-cc", name: "Adobe Creative Cloud", aliases: ["Adobe CC", "Adobe", "Adobe Photography"], domain: "adobe.com", color: "#FA0F00" },
  { key: "microsoft-365", name: "Microsoft 365", aliases: ["Office 365", "MS 365", "Microsoft Office"], domain: "microsoft365.com", color: "#F25022" },
  { key: "google-workspace", name: "Google Workspace", aliases: ["G Suite", "Google One"], domain: "workspace.google.com", color: "#4285F4" },
  { key: "trello", name: "Trello", aliases: ["Trello Premium"], domain: "trello.com", color: "#0079BF" },
  { key: "slack", name: "Slack", aliases: ["Slack Pro"], domain: "slack.com", color: "#611F69" },
  { key: "dropbox", name: "Dropbox", aliases: ["Dropbox Plus", "Dropbox Professional"], domain: "dropbox.com", color: "#0061FF" },

  // ── AI / Dev ──
  { key: "chatgpt", name: "ChatGPT", aliases: ["ChatGPT Plus", "ChatGPT Pro", "ChatGPT Go", "OpenAI"], domain: "chatgpt.com", color: "#10A37F" },
  { key: "claude", name: "Claude", aliases: ["Claude Pro", "Claude Max", "Anthropic"], domain: "claude.ai", color: "#D97757" },
  { key: "github-copilot", name: "GitHub Copilot", aliases: ["Copilot", "Copilot Pro"], domain: "github.com", color: "#000000" },
  { key: "midjourney", name: "Midjourney", aliases: ["Midjourney Pro"], domain: "midjourney.com", color: "#000000" },
  { key: "cursor", name: "Cursor", aliases: ["Cursor Pro"], domain: "cursor.com", color: "#000000" },
  { key: "1password", name: "1Password", aliases: ["1Password Families"], domain: "1password.com", color: "#0572EC" },
  { key: "nordvpn", name: "NordVPN", aliases: ["Nord VPN"], domain: "nordvpn.com", color: "#4687FF" },

  // ── Communication / Other ──
  { key: "zoom", name: "Zoom", aliases: ["Zoom Pro", "Zoom One"], domain: "zoom.us", color: "#2D8CFF" },
  { key: "linkedin-premium", name: "LinkedIn Premium", aliases: ["LinkedIn", "LinkedIn Career"], domain: "linkedin.com", color: "#0A66C2" },
  { key: "icloud", name: "iCloud", aliases: ["iCloud+", "Apple iCloud"], domain: "icloud.com", color: "#3693F3" },

  // ── Indonesian / regional ──
  { key: "shopee-vip", name: "Shopee VIP", aliases: ["Shopee Premium", "Shopee Mall"], domain: "shopee.co.id", color: "#EE4D2D" },
  { key: "gopay", name: "GoPay", aliases: ["GoPay Plus", "GoPay Premium"], domain: "gopay.co.id", color: "#00A79D" },
  { key: "ovo", name: "OVO", aliases: ["OVO Premier", "OVO Premium"], domain: "ovo.id", color: "#4A2691" },
  { key: "dana", name: "DANA", aliases: ["DANA Premium"], domain: "dana.id", color: "#0A6EBD" },
  { key: "indihome", name: "IndiHome", aliases: ["IndiHome TV"], domain: "indihome.co.id", color: "#EE2E24" },
];

const BRAND_BY_KEY: Record<string, Brand> = Object.fromEntries(
  BRANDS.map((b) => [b.key, b]),
);

/**
 * Logo.dev publishable key — safe client-side per their docs.
 * (https://www.logo.dev/docs/logo-images/introduction)
 * If you rotate the key, update only this constant.
 */
const LOGO_DEV_TOKEN = "pk_Tyc_cTBmTyepYzhnLPDjww";

/**
 * Build a Logo.dev URL for the given company name. Name-based lookup
 * is more reliable than domain-based (Logo.dev's name index has wider
 * coverage than its domain index, especially for Indonesian/regional
 * services and brands where the parent domain differs from the consumer
 * brand name — e.g. "hotstar.com" returns nothing but "Disney+ Hotstar"
 * returns the right logo).
 *
 * Default size=128, retina-friendly. Logo.dev returns a monogram with
 * 200 OK if the logo isn't found, so this URL is safe to use as
 * <img src> without error handling.
 */
export function buildLogoUrl(name: string): string {
  return `https://img.logo.dev/name/${encodeURIComponent(name)}?token=${LOGO_DEV_TOKEN}&size=128&retina=true`;
}

const NORMALIZE = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");

/**
 * Match a user-typed name to a brand. Tries:
 *   1. exact name match (case-insensitive, punctuation-stripped)
 *   2. alias match
 *   3. contains-match: any alias token that appears in the input
 * Returns null if no match.
 */
export function findBrandByName(name: string): Brand | null {
  const normalized = NORMALIZE(name);
  if (!normalized) return null;

  for (const b of BRANDS) {
    if (NORMALIZE(b.name) === normalized) return b;
    for (const alias of b.aliases) {
      if (NORMALIZE(alias) === normalized) return b;
    }
  }

  for (const b of BRANDS) {
    for (const alias of b.aliases) {
      const nAlias = NORMALIZE(alias);
      if (nAlias && normalized.includes(nAlias)) return b;
    }
  }

  return null;
}

export function getBrandByKey(key: string | null | undefined): Brand | null {
  if (!key) return null;
  return BRAND_BY_KEY[key] ?? null;
}

/**
 * Resolve a subscription to its brand. Three tiers:
 *   1. Curated match → use the registry's clean name (better Logo.dev match
 *      + correct brand color for the card tint)
 *   2. No curated match, but the user typed a real-looking name → still
 *      query Logo.dev with the raw name. Logo.dev's name index covers
 *      most real services ("Paramount+", "iQIYI", "Babbel", "Calm", …)
 *      even if we haven't curated them yet. If Logo.dev has nothing,
 *      it returns a monogram with 200 OK.
 *   3. No curated match, no usable name → no logo at all (caller renders
 *      a generic monogram in the brand color).
 */
export function resolveBrand(
  name: string,
  logoUrl?: string | null,
): {
  color: string;
  /** Logo.dev URL (curated or raw), or the user-provided logoUrl, or null */
  logoSrc: string | null;
  /** True if matched against the curated list */
  isCurated: boolean;
} {
  const curated = findBrandByName(name);
  if (curated) {
    return {
      color: curated.color,
      logoSrc: buildLogoUrl(curated.name),
      isCurated: true,
    };
  }
  // Fall back to Logo.dev with whatever the user typed — covers the long
  // tail of real services we haven't curated. Logo.dev returns a monogram
  // for unknown names so the card still gets a tile instead of a blank.
  if (name && name.trim()) {
    return { color: "#8C8884", logoSrc: buildLogoUrl(name.trim()), isCurated: false };
  }
  if (logoUrl) {
    return { color: "#8C8884", logoSrc: logoUrl, isCurated: false };
  }
  return { color: "#8C8884", logoSrc: null, isCurated: false };
}
