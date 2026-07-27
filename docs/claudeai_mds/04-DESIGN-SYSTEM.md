# Design System — Langganin

Direction: **claymorphism** as the base tactile language (soft, puffy, pushed-out-of-clay surfaces), **glassmorphism** (Raycast-style frosted panels) reserved for floating/structural chrome, warm terracotta-orange as the accent, desktop-first (≥1280px canvas; mobile adaptation comes in a later phase — see `AGENTS.md` build checklist).

## 1. Why these two styles together, not one or the other
Clay and glass are opposite instincts (solid/soft vs. transparent/sharp), so mixing them randomly reads messy. The rule that keeps it coherent:
- **Clay = things you touch.** Subscription cards, buttons, toggles, form inputs, the "add subscription" action — anything interactive and grounded on the base layer.
- **Glass = things that float.** Sidebar nav, top bar, modals, the command palette, tooltips — anything that sits structurally above the content.

This gives a real depth hierarchy instead of decoration for its own sake: base layer is clay, chrome above it is glass.

## 2. Color Tokens
| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FBF6EF` | Page background (warm off-white, not stark white) |
| `--color-bg-gradient-a` | `#FFD9C2` | Soft blob gradient behind glass panels (see §5) |
| `--color-bg-gradient-b` | `#FFEEE3` | Second gradient stop |
| `--color-clay-surface` | `#F5EEE3` | Fill for clay cards/buttons — slightly warmer/darker than page bg so the clay shadow reads |
| `--color-primary` | `#D97757` | Terracotta-orange accent — primary actions, active nav item |
| `--color-primary-hover` | `#C9694A` | Primary hover/pressed |
| `--color-primary-tint` | `#F3C4AC` | Light accent fills, selected states |
| `--color-text` | `#2B2420` | Warm charcoal, not pure black |
| `--color-text-muted` | `#7A6F63` | Secondary text, placeholders |
| `--color-success` | `#4E9B6D` | Active subscription |
| `--color-warning` | `#D9A441` | Trial ending / renewal within 3 days |
| `--color-danger` | `#C1503F` | Delete, cancelled, overdue — kept distinct from primary orange (more red, less orange) |
| `--color-glass-fill` | `rgba(255,255,255,0.55)` | Glass panel background |
| `--color-glass-border` | `rgba(255,255,255,0.45)` | Glass panel top/edge highlight |

## 3. Typography
Two-face pairing — don't default to a single font for everything, and don't reach for Inter-everywhere:

| Role | Font | Weight | Why |
|---|---|---|---|
| Display / headings | **Bricolage Grotesque** (Google Fonts, free, variable) | 600–700 | Has real character — slightly quirky curves and warmth without tipping into "playful/childish." Gives the app a distinct, happy personality on titles and section headers instead of reading as another generic SaaS dashboard. |
| Body / UI text | **Plus Jakarta Sans** (Google Fonts, free, variable) | 400–500 | Rounded terminals and a generous x-height make it comfortable to read at length — important here, since the person reads this screen while genuinely weighing "should I keep paying for this?" It stays calm and legible instead of feeling clinical, which is the "betah" (comfortable-to-linger) quality you're after. |
| Numbers / amounts | Plus Jakarta Sans, **tabular figures** (`font-variant-numeric: tabular-nums`) | 600 | Keeps price columns aligned and easy to scan — small detail, but matters a lot on a screen full of prices. |

Both fonts are free, self-hostable (no runtime dependency on Google's CDN if you want full self-hosting later), and pair well: Bricolage Grotesque's character shows up only where it counts (titles), while Plus Jakarta Sans keeps the actual reading work comfortable.

## 4. Claymorphism Recipe (for cards, buttons, inputs, toggles)
- Fill: `--color-clay-surface` (or `--color-primary` for the primary CTA).
- Border-radius: large — `20px` on cards, fully pill-shaped (`9999px`) on buttons/toggles/badges.
- No hard 1px border. Separation comes entirely from the dual shadow below.
- Resting state shadow (the "puffed out" look):
  ```css
  box-shadow:
    -6px -6px 14px rgba(255, 255, 255, 0.75),
     8px 8px 20px rgba(180, 120, 90, 0.25);
  ```
- Hover state: increase both shadow offsets/blur slightly (~15%) to suggest the element lifting toward the cursor.
- Active/pressed state: flip to an **inset** shadow so it reads as pressed in:
  ```css
  box-shadow:
    inset 4px 4px 10px rgba(180, 120, 90, 0.25),
    inset -4px -4px 10px rgba(255, 255, 255, 0.6);
  ```
- Keep the palette low-saturation for clay surfaces themselves — save full-saturation `--color-primary` for the one or two things per screen that should visually win (the main CTA, the active status).

## 5. Glassmorphism Recipe (for sidebar, top bar, modals, command palette)
- Glass only reads as "glass" if there's something visually interesting behind it to blur — don't place a glass panel directly on a flat `--color-bg`. Put a soft, low-opacity gradient blob (`--color-bg-gradient-a` → `--color-bg-gradient-b`) behind any glass surface (e.g. positioned behind the sidebar and behind modal overlays).
- Panel style:
  ```css
  background: var(--color-glass-fill);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--color-glass-border);
  border-radius: 20px;
  ```
- Keep glass panels' own drop shadow subtle (`0 8px 32px rgba(0,0,0,0.08)`) — the blur itself does most of the visual work; don't double up with a heavy clay-style shadow on top of glass.

## 6. Signature Element: Command Palette
Given the Raycast inspiration, don't stop at borrowing the blur — borrow the actual interaction: a `Cmd+K` / `Ctrl+K` command palette (glass panel, centered, floating over a dimmed/blurred backdrop) for quick actions like "Add subscription," "Go to Calendar," "Search subscriptions by name." This is the one place worth spending real interaction-design effort — see `05-SITEMAP-AND-FLOWS.md` for where it plugs into the flows. Keep everything else in the app calmer and more restrained so this doesn't get lost among competing effects.

## 7. Desktop-First Notes
- Design canvas: **1440px** wide as the primary target; a comfortable minimum of **1280px**. Don't design mobile breakpoints yet — see `AGENTS.md` build checklist, mobile is a later phase.
- Layout: persistent left sidebar (glass style, ~240–260px) + main content area using a multi-column dashboard grid. Desktop gives you room for hover states — use them: clay elements should visibly lift on hover (§4), which has no real equivalent on touch, so don't over-invest in touch-specific interactions yet.
- Because this is desktop-first, keyboard support matters more than usual: visible focus states on every interactive element, and the command palette (§6) as a first-class navigation method, not just a nice-to-have.

## 8. Status Badges
| Status | Color token | Style |
|---|---|---|
| `active` | success | pill badge, clay-lite (flat fill, no heavy shadow — badges are small enough that a full clay shadow looks noisy) |
| `trial` | warning | pill badge, label reads "Trial — ends in Xd" |
| `paused` | text-muted | pill badge, flat fill |
| `cancelled` | text-muted | pill badge, strikethrough text |
| renewal within 3 days | warning | shown as a small dot/accent on the card, not a separate badge, to avoid badge clutter |
