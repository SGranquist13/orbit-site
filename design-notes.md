# Orbit launch site: design notes and build brief

This is the source of truth for the build. Every visual decision traces back to either a measured reference or the real product UI. Nothing here is decoration for its own sake.

---

## 1. What the references actually do (measured at 1440×900)

| | Antigravity 2.0 | ChatGPT Work | Claude overview | Reel Motion | Butter |
|---|---|---|---|---|---|
| H1 | 54px / 450 / -0.95px | 64px / 500 / -1.92px (-0.03em) | 72px serif / 500 | 66px / 700 / -1.65px | 108px / 400 |
| H2 | 42px / 450 / -0.73px | 48px / 500 / -1.44px | 52px / 500 | 48px / 700 / -1.2px | 60px / 400 |
| H3 | 20px / 450 | 22px / 500 | 19–32px | none | 24–45px |
| Body | 17.5px / lh 1.45, grey #45474d | 17px / lh 1.65; 14px secondary at 60% white | 17px / lh 1.6 | 17px / lh 1.55, #5b6472 | 16–20px |
| Media | 1281×721 video, **36px** radius, square 617px cards | 943×530, **6px** radius, product UI over a **space photo** | 16–19px radius, autoplay webm/mp4 | 3 phones at 300×621, **36px** radius | 32px radius video cards |
| Buttons | pill, 36–47h, dark on light | pill 40h, white primary + 12%-white ghost | 8px radius, 36h | pill 36h | n/a |
| Page height | 5.7k | 7.0k | 11.9k | 4.9k | 14.3k |
| Motion | static, gradient frames | tabbed feature list swaps one big image | autoplay loops | static | **Lenis smooth scroll**, word-by-word statement reveals, scroll-pinned feature stories |

Patterns we take:
1. **Product media leads.** Each section is mostly one large, real product shot. Copy is 1 headline + 1–2 sentences.
2. **OpenAI's vertical feature list beside one large media pane.** We turn it into a scroll-pinned story: the list on the left advances as you scroll, and the media on the right crossfades.
3. **Antigravity/OpenAI's backdrop behind the product shot.** OpenAI puts the UI on a space photo. We have our own: the dithered planet horizon and the black-hole art.
4. **Butter's large statement paragraph** whose words light up from grey to white as you scroll, plus Lenis smooth scroll.
5. **Reel Motion's three-phone fan** for the mobile section.
6. Restraint: body copy stays 16–18px, roughly 3 type sizes per section, and one primary CTA style.

## 2. What the product actually looks like (screenshots in `media/raw/`)

- Near-black **Void** background (`#050506`). Chrome is entirely greyscale. Colour only means status: amber = running, green = ok, red = failed, blue = asked/info, purple = merged.
- **1-bit Bayer dither** is the signature: the black-hole art, the dithered horizon, the dotted dividers (`······`) under headers, and the dither "glow" behind the active sidebar row. **The site's graphic language is this dither, not gradients.**
- Lowercase **"orbit"** wordmark set in Inter semibold beside the black-hole mark.
- **Hard offset shadows**: `4px 4px 0 0 #000, 4px 4px 0 1px #34343b` (dark). On light (Paper): `4px 4px 0 0 #111113`. Used on composers, cards and popovers.
- **JetBrains Mono uppercase micro-labels with wide tracking**: `SUPERSET`, `3 TOOL CALLS`, `SHIP`, `CHANGES`. Keyboard hints drawn as small outlined `kbd` boxes (`Ctrl I`).
- Small **square status pixels** (6–8px squares, not circles) before workspace names.
- Radii: 14px cards, 10px controls, pills only for chips and toggles.

## 3. Design spec (build against this)

### Tokens (copy exactly)
```
--bg:#050506; --panel:#0b0b0d; --raised:#121215; --line:#1f1f24; --line-strong:#34343b;
--fg:#ececef; --dim:#a2a2aa; --mute:#63636c;
--run:#f2b53a; --ok:#3fd88a; --bad:#ff5468; --info:#72a2ff; --merged:#b28cff;
--paper:#f3f3f1; --ink:#111113;
--hard:4px 4px 0 0 #000, 4px 4px 0 1px var(--line-strong);
--hard-sm:2px 2px 0 0 #000, 2px 2px 0 1px var(--line-strong);
--pop:0 40px 120px -20px rgb(0 0 0 / .9), 0 0 0 1px var(--line-strong);
```

### Type (Inter Variable + JetBrains Mono Variable via @fontsource-variable)
| Role | Size (clamp) | Weight | Tracking | Line height | Colour |
|---|---|---|---|---|---|
| Display (H1) | clamp(44px, 6.2vw, 84px) | 560 | -0.04em | 1.0 | fg |
| H2 | clamp(34px, 4.2vw, 56px) | 540 | -0.035em | 1.05 | fg; second clause in `--mute` |
| H3 | 22px | 520 | -0.015em | 1.25 | fg |
| Lead | clamp(17px, 1.4vw, 20px) | 400 | -0.005em | 1.55 | dim |
| Body | 16px | 400 | 0 | 1.6 | dim |
| Eyebrow / label | 12px JetBrains Mono, UPPERCASE | 500 | 0.08em | 1 | mute |
| Kbd | 12px JetBrains Mono | 500 | 0 | n/a | dim, 1px line border, 4px radius, 2px×6px padding |

Headlines use a two-tone pattern taken from the app's own hierarchy: the first clause in `--fg`, the second in `--mute`. Example: "Run a fleet of coding agents. <mute>Ship from anywhere.</mute>"

### Layout
- Container 1200px max with 24px gutters (16px under 640px). Media can break out to 1320px.
- Text columns max 600px (about 60ch).
- Section padding: 160px top and bottom desktop, 104px tablet, 80px mobile.
- 12-col grid. Feature split is 5/7 (text/media).
- Hairline section dividers: the app's **dotted dither rule**, a 1px-tall repeating `radial-gradient` dot pattern in `--line-strong`. No solid rules.

### Media framing
- Desktop screenshots sit in a **window frame**: 1px `--line-strong` border, 14px radius, `--pop` shadow, **no fake macOS traffic lights** (Orbit is a Tauri app on Windows, and its own chrome is already in the screenshot). Use `<picture>` with AVIF/WebP from Astro `<Image>`, widths 1280/1920/2560.
- Behind the hero and feature media: a **dither field**, a canvas-rendered Bayer 8×8 pattern of the radial glow / planet horizon in `--line-strong` to `--dim` greys. Never a colour gradient.
- Phones: CSS device frame with a 44px outer radius, a 10px bezel in #0b0b0d, a 1px `--line-strong` outline and a dynamic-island pill. Screens are the real 1170×2532 captures, or the video.
- Videos: `autoplay muted loop playsinline preload="none"` with a poster, started and paused by IntersectionObserver. WebM first, MP4 fallback.

### Buttons
- Primary: `--fg` background, `--bg` text, 44h, 10px radius, `--hard` shadow, 15px/550 text. Contents: GitHub mark + "Star on GitHub". Hover lifts -1px/-1px while the shadow grows to 5px. Active presses into the shadow (translate 4px, no shadow). This press mechanic is the app's.
- Secondary: transparent, 1px `--line-strong` border, `--fg` text, same size. Example: "Watch the tour" with a small play triangle.
- No pills on CTAs.

### Motion (GSAP 3.13 + ScrollTrigger + Lenis 1.3; all free)
Principles: **slow, smooth, never bouncy.** Ease `power3.out` for entrances. Scrubbed animations are linear-to-scroll with `scrub: 0.6`. Max translate 40px. Nothing rotates more than 10°. Everything is disabled under `prefers-reduced-motion` (show the final state).

1. **Lenis** smooth scroll globally (`lerp: 0.1`), wired to ScrollTrigger.
2. **Hero load** (one time, about 1.2s total): eyebrow, then H1 lines, then lead, then CTAs fade up 16px, staggered 80ms. The black hole fades in from a dither threshold (see 6).
3. **Hero → product window, scrubbed:** the window starts at `scale .9, rotateX 14deg, y 60` with perspective 1600px and settles to flat 1:1 as it reaches the viewport centre. The dither field behind it parallaxes at 0.5×.
4. **Statement paragraph, scrubbed:** each word goes from `--line-strong` to `--fg` as it passes 70%→40% of the viewport (Butter).
5. **Pinned feature story:** the section pins for 5 × 80vh. The left list item becomes active with a 2px `--fg` bar and its body expands. The right media crossfades plus scales from 1.02 to 1. A thin mono progress counter reads `01 / 05`. On mobile, no pin: stack each feature as text then media.
6. **Dither reveal (signature):** images and the black hole reveal through a Bayer 8×8 threshold mask animated from 0→1 over 700ms. Use a CSS `mask-image` driven by an 8×8 canvas pattern scaled with `image-rendering: pixelated`, or a canvas overlay of `--bg` cells removed in Bayer order. Use it on the hero art, the mobile phones and the final CTA only, never everywhere.
7. **Phone fan, scrubbed:** three phones start stacked at the centre, then the side ones translate ±(phone width × 0.72) and rotate ±6°, while the centre one rises 24px.
8. **Orbiting planet:** port `agentic_ide/src/components/OrbitHero.tsx`. The small planet circles the black-hole art on the tilted ellipse (16s period) and passes behind the event horizon on the far half. Pause it when off-screen.
9. Nav: transparent at the top. After 40px it gets a `--bg`/80% backdrop with blur(12px) and a dotted bottom rule.

## 4. Anti-slop rules (I will reject the section if any of these appear)
- No colour gradients, blobs, glows, glassmorphism cards, neon borders, or ✨ / 🚀 / emoji.
- No lucide-icon + 2-line feature cards in a 3×2 grid.
- No fake stats, testimonials, customer logos or "trusted by" strip.
- No invented features. Copy comes only from this brief.
- No lorem ipsum and no placeholder grey boxes in the final build.
- No mixed radii. Use only 14 (media and cards), 10 (controls), 4 (kbd) and 44 (phone).
- No centred body paragraphs wider than 600px.
- Don't animate everything. If two things move at once and neither is the point, cut one.

## 5. Page structure and copy (final copy; do not rewrite)

### Nav
`[mark] orbit` · Product · Mobile · How it works · **[GitHub ★ Star]** (secondary button, small, 36h)

### Hero
- Eyebrow: `ORBIT 0.1 — DESKTOP + IPHONE`
- H1: **Run a fleet of coding agents.** <mute>Ship from anywhere.</mute>
- Lead: Orbit is a desktop IDE for Claude Code and Codex. Every task gets its own worktree, branch, and agent, so ten things can move at once without stepping on each other.
- CTAs: [Star on GitHub] [▸ Watch the tour]
- Below the CTAs: the orbit art (black hole + orbiting planet) centred behind and above the product window, at about 520px, with the dither glow around it.
- Product window: `media/orbit-tour-dark.webm/.mp4`, poster `media/raw/orbit-dark-workspace.png`. A phone (`media/mobile-tour`) overlaps the lower-right corner by about 12% on desktop and is hidden on mobile.

### Statement (scrubbed word reveal)
Agents are fast. Waiting on them isn't. Orbit runs every task in its own worktree and tells you the moment one needs you: a question, a failed check, a finished pull request.

### Features (pinned story), eyebrow `PRODUCT`
H2: **One window for the whole fleet.** <mute>Start it, steer it, ship it.</mute>

01. **One task, one worktree.** Start a workspace and Orbit cuts a fresh branch and worktree for it. Claude Code and Codex run side by side in their own checkouts, with live diff stats in the sidebar. Media: `orbit-dark-workspace.png`. Kbd: `Ctrl N`.
02. **Only what needs you.** The inbox collects every agent that asked a question, failed, or finished, plus any pull request with red checks. Suggested replies are one keystroke away. Media: `orbit-dark-inbox.png`. Kbd: `Ctrl I` `J` `K` `E` `S`.
03. **From fix to merge in one panel.** Ship shows the draft PR, check status, review state, and every changed file. Fix CI and Address comments hand the failure straight back to the agent. Media: `orbit-dark-ship.png`. Kbd: `Ctrl .`
04. **Agents with a job description.** Builder, Debugger, Planner, Reviewer, Shipper. Read-only profiles are blocked from writing at the tool layer, not asked nicely in a prompt. Add skill packs from any git URL. Media: `orbit-dark-palette.png`. Kbd: `Ctrl K`.
05. **Work starts from the backlog.** Pull in GitHub issues and press Enter to start one in a fresh workspace. Routines send messages on a schedule while Orbit is open, like triage at nine and checks at two. Media: `orbit-dark-issues.png` crossfading to `orbit-dark-routines.png`. Kbd: `Ctrl Shift G`.

### Mobile, eyebrow `ORBIT MOBILE`
- H2: **Leave the desk.** <mute>Keep the fleet moving.</mute>
- Lead: Pair your iPhone by scanning a QR code in Orbit. Read transcripts, review diffs, answer questions, and stop a runaway turn, over your local network or Tailscale.
- Three phones (fan): left `mobile-inbox.png`, centre `mobile-tour` video (poster `mobile-workspace.png`), right `mobile-diff.png`.
- Three facts in a row, each a mono label plus one line, no icons:
  - `ENCRYPTED` End-to-end encrypted after the pairing handshake.
  - `LIVE` Transcripts stream as the agent works.
  - `IN CONTROL` Send a message or stop a turn from your phone.

### How it works, eyebrow `HOW IT WORKS`
H2: **Three steps.** <mute>No new workflow to learn.</mute>
Three columns, a big mono number, a title and one line, connected by a dotted dither rule:
1. **Add a repo.** Point Orbit at any git repository on your machine.
2. **Start workspaces.** Each one is a branch, a worktree, and an agent. Run as many as you like.
3. **Review and ship.** Answer from the inbox, open a PR from Ship, or do it all from your phone.

### Details (asymmetric grid of real UI crops, NOT an icon grid), eyebrow `DETAILS`
H2: **Built for the long session.**
Tiles. Each holds a real crop from a screenshot via `object-position`, plus a mono label and one line:
- **Context meter.** Crop the composer footer ("85% · 170k / 200k"). Line: See the context window fill up, and compact before it's full.
- **Sessions resume.** Crop the transcript ("1m 14s · 19k tok · $0.21"). Line: Close Orbit mid-run. Every session picks up where it left off.
- **Keeps up with main.** Crop the inbox row "Needs sync · Conflicts with base…". Line: Branches sync with base automatically, and conflicts reach your inbox.
- **Paper and Void.** Diagonal split of `orbit-light-workspace.png` / `orbit-dark-workspace.png`. Line: A light theme and a dark theme, both greyscale, so status colour always means something.
- **Keyboard first.** A large kbd cluster (`Ctrl K`, `Ctrl I`, `Ctrl N`, `Ctrl .`, `J`, `K`), no screenshot. Line: Every view has a shortcut.

### Final CTA
- Full-bleed band with `media/brand/planet-surface.png` as a dithered planet horizon rising from the bottom (dither-reveal on enter) and the orbit art small above the headline.
- H2: **Run your next ten tasks in parallel.**
- Lead: Orbit is in early access. Star the repo to follow along.
- CTAs: [Star on GitHub] [Orbit Mobile on GitHub]

### Footer
`[mark] orbit` · "Built by Steven Granquist" · GitHub · Orbit Mobile · © 2026. Dotted rule above. All links come from `src/config.ts`.

## 6. Assets
- Real UI: `media/raw/orbit-{dark,light}-*.png` (2560×1600), `media/raw/mobile-*.png` (1170×2532).
- Video: `media/orbit-tour-{dark,light}.{mp4,webm}` (1920w, about 18s loop) and `media/mobile-tour.{mp4,webm}` (780w).
- Brand: `media/brand/orbit-art.png` (black hole), `horizon.png`, `planet-surface.png`, `icon.png` (app icon, favicon source).
- Regenerate with `scripts/capture-orbit.mjs`, `scripts/capture-mobile.mjs`, `scripts/record-orbit.mjs` and `scripts/record-mobile.mjs`. The Orbit UI must be on :1420 and the mobile web build on :8099.
