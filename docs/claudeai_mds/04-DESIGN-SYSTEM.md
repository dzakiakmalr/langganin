# Design System — Langganin

Direction: **claymorphism** as the base tactile language (soft, puffy, pushed-out-of-clay surfaces), **glassmorphism** (frosted panels) reserved for floating/structural chrome, warm terracotta-orange as the accent. **Responsive** — built mobile-first-capable (≥360px phones through desktop); the sidebar collapses to a drawer on small screens and cards/list have explicit mobile breakpoints.

## 1. Why these two styles together, not one or the other
Clay and glass are opposite instincts (solid/soft vs. transparent/sharp), so mixing them randomly reads messy. The rule that keeps it coherent:
- **Clay = things you touch.** Subscription cards, buttons, toggles, form inputs, the "add subscription" action — anything interactive and grounded on the base layer.
- **Glass = things that float.** Sidebar nav, top bar, modals, the command palette, tooltips — anything that sits structurally above the content.

This gives a real depth hierarchy instead of decoration for its own sake: base layer is clay, chrome above it is glass.

## 2. Color Tokens
**Direction:** warm-neutral gray surfaces, terracotta-orange brand color concentrated in a single brand-glow radial behind glass panels (the signature). The yellow/cream wash is fixed by (a) replacing the cream bg with a true neutral gray, (b) neutralizing all clay shadows from brown to slate, and (c) removing the orange tint from every clay surface. Orange now lives in fewer places, louder.

| Token | Hex | Usage |
|---|---|---|
| `--color-brand-50` | `#FBE4D8` | Softest brand wash, decorative callouts, "today" pill bg |
| `--color-brand-100` | `#F7D4C2` | Light accent fills, icon backgrounds, hover wash |
| `--color-brand-400` | `#EE8A66` | Highlight on neutral surfaces |
| `--color-brand-500` | `#E26B43` | Terracotta-orange — primary actions, active nav item, key category dots |
| `--color-brand-600` | `#C95A36` | Primary hover/pressed |
| `--color-brand-glow` | `rgba(226,107,67,0.18)` | **Signature** — the single radial-gradient blob behind glass panels (sidebar, top bar) |
| `--color-bg` | `#F2EFEC` | Page background — warm-neutral **gray** (not cream) |
| `--color-bg-elevated` | `#EAE6E0` | Subtle section elevation (rare use) |
| `--color-surface` | `#FFFFFF` | Raised cards (dashboard base, summary, charts, mini-calendar, subscription cards) |
| `--color-surface-soft` | `#FAF8F6` | Inputs, search bars, selects — barely-warm white |
| `--color-clay-100` | `#F4F1ED` | Interactive clay layer — *closer to the page bg* than the old beige, so clay now reads as elevation, not as a separate material |
| `--color-clay-200` | `#ECE7E1` | Deeper clay, for row hover, secondary buttons |
| `--color-text` | `#1F2024` | Primary text — slightly cool, deep slate |
| `--color-text-muted` | `#5C5A57` | Secondary text, labels |
| `--color-text-subtle` | `#8C8884` | Placeholder / disabled |
| `--color-success` | `#2F8F5E` | Active subscription (deeper than before for AA on `#FFFFFF`) |
| `--color-warning` | `#C77B1E` | Trial ending / renewal within 3 days (deeper amber, not yellow) |
| `--color-danger` | `#B43C2C` | Delete, cancelled, overdue — clearly distinct from brand orange |
| `--color-info` | `#3D6FCC` | Info blue |
| `--color-glass-fill` | `rgba(255,255,255,0.62)` | Glass panel background |
| `--color-glass-border` | `rgba(255,255,255,0.75)` | Glass panel top/edge highlight (visible — this is what sells "glass") |

**Layer hierarchy (4 distinct layers, no shared hue):**
- L1 page — `--color-bg` (warm-neutral gray)
- L2 clay — `--color-clay-100` / `--color-clay-200` (interactive elements)
- L3 card — `--color-surface` (white, raised via `shadow-md`)
- L4 glass — translucent, floats above via `backdrop-filter` over the brand-glow blob

## 3. Typography
Two-face pairing — don't default to a single font for everything, and don't reach for Inter-everywhere:

| Role | Font | Weight | Why |
|---|---|---|---|
| Display / headings | **Space Grotesk** (Google Fonts, free, variable) | 600–700 | Clean, geometric grotesk with a slightly techy/quirky character — gives titles a distinct, modern personality instead of reading as another generic SaaS dashboard. |
| Body / UI text | **Plus Jakarta Sans** (Google Fonts, free, variable) | 400–500 | Rounded terminals and a generous x-height make it comfortable to read at length — important here, since the person reads this screen while genuinely weighing "should I keep paying for this?" It stays calm and legible instead of feeling clinical, which is the "betah" (comfortable-to-linger) quality you're after. |
| Numbers / amounts | Plus Jakarta Sans, **tabular figures** (`font-variant-numeric: tabular-nums`) | 600 | Keeps price columns aligned and easy to scan — small detail, but matters a lot on a screen full of prices. |

Both fonts are free, self-hosted via `next/font/google` at build time, and pair well: Space Grotesk's character shows up only where it counts (titles), while Plus Jakarta Sans keeps the actual reading work comfortable. (Note: the earlier Bricolage Grotesque was replaced with Space Grotesk — `--font-display` in `app/globals.css` + `lib/fonts.ts`.)

## 4. Claymorphism Recipe (for cards, buttons, inputs, toggles)
- Fill: `--color-clay-100` (or `--color-clay-200` for hover/secondary). For the primary CTA, use `--color-brand-500`.
- Border-radius: large — `24px` on cards, fully pill-shaped (`9999px`) on buttons/toggles/badges.
- No hard 1px border. Separation comes entirely from the dual shadow below.
- Resting state shadow (the "puffed out" look) — **neutral slate, not warm/brown**:
  ```css
  box-shadow:
    -6px -6px 16px rgba(255, 255, 255, 0.85),
     8px 8px 22px rgba(15, 23, 42, 0.08);
  ```
- Hover state: increase both shadow offsets/blur slightly (~15%) to suggest the element lifting toward the cursor:
  ```css
  box-shadow:
    -7px -7px 18px rgba(255, 255, 255, 0.9),
    10px 10px 26px rgba(15, 23, 42, 0.10);
  ```
- Active/pressed state: flip to an **inset** shadow so it reads as pressed in:
  ```css
  box-shadow:
    inset 4px 4px 10px rgba(15, 23, 42, 0.07),
    inset -4px -4px 10px rgba(255, 255, 255, 0.7);
  ```
- **Reserved role:** full clay is now used *only* on the primary CTA (orange button), the avatar pebble, and interactive row hovers. Static cards use `--color-surface` (white) + `shadow-md` — clay on every card was the source of the yellow wash.

## 5. Glassmorphism Recipe (for sidebar, top bar, modals, command palette)
- Glass only reads as "glass" if there's something visually interesting behind it to blur — never place a glass panel directly on a flat `--color-bg`.
- **The signature: the brand-glow blob.** Place a single low-opacity terracotta radial (`--color-brand-glow`, ~18% opacity, 60px blur) behind the sidebar and topbar. The glass then blurs *through* it, making the orange show *through* the surface rather than being added as a fill. This is the one place full-saturation brand color lives in the chrome.
- Three blur tiers — use the right one per role:
  ```css
  /* Toolbar / search */
  backdrop-filter: blur(12px) saturate(140%);
  /* Sidebar / top bar (default) */
  backdrop-filter: blur(20px) saturate(160%);
  /* Modals / command palette */
  backdrop-filter: blur(32px) saturate(180%);
  ```
- Panel style (sidebar/topbar default):
  ```css
  background: var(--color-glass-fill);     /* rgba(255,255,255,0.62) */
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--color-glass-border);  /* rgba(255,255,255,0.75) — the visible edge */
  border-radius: 24px;
  ```
- The 1px white edge highlight is what actually sells "glass" — keep it visible, not subtle.
- Keep glass panels' own drop shadow neutral and subtle (`shadow-md`) — the blur does most of the work; don't double up with a heavy clay-style shadow on top of glass.

## 6. Signature Element: Topbar Search
The topbar (desktop) has a **functional search field** with a glass-pill style: typing shows a live-results dropdown (logo + name + price, max ~7 matches), clicking a result opens that subscription's detail modal, and pressing Enter navigates to `/dashboard/subscriptions?q=…`. It replaced the earlier "Cmd+K — coming soon" placeholder. On mobile the topbar search is hidden (the Subscriptions page has its own search input).

## 7. Responsive Notes
- Layout: persistent left sidebar (glass style, ~256px expanded / ~64px collapsed) on desktop; on mobile it becomes a fixed drawer opened from the topbar hamburger (near-solid `glass-drawer` background so menu text stays readable over dense content).
- Target widths: phones ≥360px, tablets, and desktop ≥1280px. Use Tailwind responsive prefixes (`sm:` = 640px, `lg:` = 1024px) rather than building separate mobile screens.
- Hover states (clay lift, glass highlight) are desktop-only; touch devices fall back to tap states. Keyboard support: visible focus rings on every interactive element.

## 8. Status Badges
| Status | Color token | Style |
|---|---|---|
| `active` | success | pill badge, flat fill |
| `trial` | warning | pill badge, label reads "Trial" (with a warning-colored pill in the detail modal) |
| `paused` | text-muted | pill badge, flat fill |
| `cancelled` (soft-deleted) | text-muted | pill badge "Baru dihapus" + a "Pulihkan" (restore) action; item is dimmed/grayscale |
| renewal within 3 days | warning/danger | shown as a colored days-left badge/dot, not a separate status badge |
