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

---

## 7. v2 pass (2026-10-11): refreshed media and "Everything in Orbit"

Goal: the page should tell a visitor **exactly what exists in Orbit today**, and be good enough to keep them scrolling. The quality bar is still a design studio. Every rule above still applies.

### 7.1 Media refresh
All captures were retaken on 2026-10-11 from the current app (`media/raw/`, 2560×1600 desktop and 1170×2532 phone) and include the new Simplify button, Routines and the full Settings page.
- Replace every `src/assets/raw/*` image with the new file of the same name, and copy in the new ones the manifest uses (see `src/data/features.ts`, `media.shot` / `media.phone`).
- Replace the hero video with `media/orbit-tour-dark-trim.{mp4,webm}` and the poster with `media/orbit-tour-dark-poster.jpg`. Replace the phone video with `media/mobile-tour.{mp4,webm}`.
- Regenerate the Details crops from the new captures, or drop them; the manifest replaces that section.

### 7.2 Pinned feature story: 5 → 7 steps
Keep the mechanics. The steps are now:
01. **One task, one worktree.** No change. Media: `orbit-dark-workspace.png`.
02. **Only what needs you.** No change. Media: `orbit-dark-inbox.png`.
03. **From fix to merge in one panel.** No change. Media: `orbit-dark-ship.png`.
04. **Agents with a job description.** No change. Media: `orbit-dark-palette-profiles.png`.
05. **Work starts from the backlog.** Body: Pull in GitHub issues and press Enter to start one in a fresh workspace, or P to have a Planner write the plan first. Media: `orbit-dark-issues.png`. Kbd: `Ctrl Shift G`.
06. **Work that runs while you sleep.** Body: Routines send a message on a schedule: triage at nine, checks at two, a sweep of stale branches on Fridays. Runs with nothing to do archive themselves. Media: `orbit-dark-routine-editor.png`. Kbd: `Ctrl Shift E`.
07. **Simpler code, same behaviour.** Body: Simplify reads what changed, lists what could be simpler, and applies one candidate at a time. Each one is checked and committed as a refactor, or put back. Media: `orbit-dark-simplify-applying.png`.
- Counter reads `0N / 07`. The "Watch the tour" and nav links still land on the section.

### 7.3 New section: the feature marquee (between Statement and Features)
A slim, full-bleed band that hints at how much is coming.
- Two rows of feature titles from `features.ts` (all 96, shuffled deterministically, split across rows), set in 15px Inter 500 in `--mute`, separated by a 6px square status pixel in `--line-strong`. Every 7th pixel uses a status colour (run/ok/info/merged) so the band twinkles like the app's sidebar.
- The rows drift in opposite directions at about 30px/s, CSS-only (two duplicated tracks, `translateX` keyframes). Scroll velocity briefly speeds them up via GSAP (`timeScale` 1 → up to 4, eased back). Pause on hover. Under reduced motion it is static.
- Edges fade into the background through a **dither falloff**, not an opacity gradient. Use a canvas Bayer mask, or overlay the edges with `--bg` dither cells.
- Hairline dotted rules above and below. Height about 120px. No heading.

### 7.4 Replace "Details" with "Everything in Orbit" (`#everything`)
This is the centrepiece of the pass. Data: `src/data/features.ts` (13 chapters, 96 features). **Do not edit the copy.** Render it.

**Intro**
- Eyebrow `EVERYTHING IN ORBIT`.
- H2: **Every feature, already built.** <mute>Here's the whole list.</mute>
- Under it, a big stat row in JetBrains Mono: `96` FEATURES · `13` AREAS · `2` APPS (desktop + iPhone). Use the display size for the numbers in `--fg` and the 12px eyebrow style for the labels. The numbers count up from 0 once when the row enters the viewport (≈1.2s, `power2.out`). Compute them from the data; never hard-code.

**Layout, desktop ≥1024**
- Two columns.
- **Left: sticky chapter index** (3/12, `top: 96px`). Each row is a mono index `01`–`13`, the chapter title, and its count right-aligned in `--mute`.
  - The active chapter is `--fg` with a 2px bar. Inactive rows are `--mute`.
  - A 1px progress line runs down the left edge of the index and fills (`scaleY`) as you scroll through the section.
  - Clicking a row Lenis-scrolls to that chapter.
- **Right: the chapters** (9/12). For each chapter:
  1. A header row: mono `01` + the chapter title as H3 at about 32px/540/-0.03em, then the `lead` in `--dim` 18px.
  2. The **media**: a `WindowFrame` showing the crop of `media.shot` defined by `media.crop` (percent of the source image: left, top, width, height).
     - Implement the crop as an aspect-ratio box (aspect = crop w/h × source aspect) with the image absolutely positioned and scaled, so the crop fills the box. Use Astro `<Picture>` with widths [1280, 1920, 2560].
     - Never show a crop at below 1:1 legibility on desktop. If the box gets too small, the crop is too big; tell me rather than shrinking text into mush.
     - For `mobile`, render two `PhoneFrame`s side by side (`shot` and `phone`) instead of a window.
  3. A **feature grid**: 2 columns on desktop. Each feature has:
     - the title in 16px/540 `--fg`;
     - the body in 15px/1.55 `--dim`;
     - optional Kbd chips under the body;
     - an optional tag (`Optional` / `Experimental`) as a 11px mono uppercase pill with a 1px `--line-strong` border, beside the title.
     Separate rows with the dotted dither rule. No icons, no cards around each feature.
- Spacing: 120px between chapters, 40px between media and grid, 28px between features vertically.

**Layout, mobile/tablet <1024**
- The index becomes a **sticky horizontal chip bar** under the nav: scrollable, with the active chip `--fg` on `--raised`. It auto-scrolls so the active chip stays in view.
- Chapters stack, with media full width and the feature grid in 1 column.

**Motion**
- Each chapter's media gets a scrubbed clip reveal: `clip-path: inset(6% 6% 6% 6% round 14px)` → `inset(0 round 14px)` with scale 0.98→1 as it enters (scrub 0.6).
- Features fade up 12px with a 40ms stagger, once, on enter.
- The DitherReveal runs only on the Orbit Mobile phones in this section.
- Everything respects reduced motion.

**Performance**
- 13 large screenshots. Lazy-load every chapter image (`loading="lazy"`, `decoding="async"`) and keep only the first chapter eager when it's near.
- Check the total transferred weight for a full scroll and report it.

### 7.5 Copy changes elsewhere
- Hero eyebrow: `ORBIT 0.1 — DESKTOP + IPHONE` (no change).
- Statement: unchanged.
- The final CTA lead stays as the user set it. Don't change CTA copy or `src/config.ts`.

### 7.6 QA (required before reporting)
- Run `npm run build`. It must be clean.
- Take Playwright screenshots at 1440, 1024, 768 and 390 into `media/qa/v2/`: the marquee band, the manifest intro with its stat row, at least 4 chapters (workspaces, ship, simplify, mobile), the sticky index mid-section, and the mobile chip bar.
- Read every crop at 1440 and confirm the UI text is legible and that the crop shows what its `alt` says.
- Check there is no horizontal scroll and no console errors.
- Run once with Playwright `reducedMotion: "reduce"` and confirm every section shows its final state.

## 8. v3 pass: Code view, teammates, new key map (2026-10-19)

### Where things stand

- **The IDE work is on `main` in `agentic_ide`, and it is merged and committed.** Code view landed 10/18. VS Code keybindings and live Write/Edit drafts landed today. Nothing is uncommitted there. The `typing` worktree sits at the same commit as main.
- **The site was last synced to FEATURES.md on 10/12** (`features.ts`, 13 chapters). Since then the app has gained three things the site never mentions:
  1. **Code view**, the built-in IDE (FEATURES.md §"Code view", all ✅/🟢).
  2. **AI teammates**, with Chief, hand-offs, memory and owned routines (§"AI teammates", ✅/🟢). It has zero mentions on the site.
  3. **VS Code keybindings**, rebindable, with Ctrl+K chords.
- **Many shortcuts on the site are now wrong.** The keybindings commit moved them:

  | Action | Site says | App now |
  |---|---|---|
  | Command palette | Ctrl K | **Ctrl Shift P** / F1 (Ctrl K is now a chord prefix) |
  | Ship panel | Ctrl . | **Ctrl Shift G** |
  | Issues | Ctrl Shift G | **Alt 5** |
  | Routines | Ctrl Shift E | **Alt 3** (Ctrl Shift E now opens the Code explorer) |
  | Inbox | Ctrl I | **Alt 1** (Ctrl I is now Ask about selection in the editor) |
  | Focus mode | Ctrl \ | **Ctrl K Z** |
  | Theme | Ctrl Shift L | **Ctrl K Ctrl T** |
  | Code view | — | **Alt 2** / Ctrl Shift E |
  | Teammates | — | **Alt 4** |

  `scripts/capture-orbit.mjs` and `record-orbit.mjs` press the old keys, so they will capture the wrong screens until they're fixed.
- **Every existing screenshot is stale.** The sidebar and nav now include Code and Teammates, so every capture is out of date, not just the new features.
- **Mobile:** `ide_mobile` has uncommitted icon and splash work. Its new FEATURES rows (dashboard, tabs, file edits) are already on the site. Nothing new to document; only re-shoot the phone screens if the new icon shows in them.
- Uncommitted in this repo from an earlier session: `scripts/demo-orbit.mjs`, `capture-mobile.mjs`, `record-mobile.mjs`, and `video/`. I'll leave them alone unless you say otherwise.

### Scope

### 1. `src/data/features.ts`: two new chapters, fixes elsewhere

These are built features only, using the same voice as the existing copy (short title, one plain sentence).

**New chapter: Code view** (`id: "code"`, lead: *"An editor that watches the agent work."*). Place it after Agents and chat.
- Open any folder: a repo, any workspace's worktree, or a folder on disk. `Alt 2`
- A real editor: CodeMirror, themed for Void and Paper, with quick open, find and replace, and go to line. `Ctrl P`
- Watch mode: follows the agent to the file it's editing, reloads as the edit lands, and flashes the changed lines.
- Activity timeline: every turn's edits with +/− counts. Click any one to diff it against the turn's start.
- Manual mode: no following. If a file you're editing changes on disk, choose Reload, Keep mine or Compare.
- Ask about selection: send the selected lines and a question to the workspace's agent. `Ctrl I`
- Integrated terminal: several tabs, your shell. `` Ctrl ` ``
- Project search: regex, case, whole word and globs, with results grouped by file. `Ctrl Shift F`
- Git gutter and diffs, against HEAD or the base branch.
- Open in Code from the chat header, the Ship panel's changed files, or the palette.
- Editor settings: font, tabs, wrap, autosave, and whether to follow the agent.

**New chapter: Teammates** (`id: "teammates"`, lead: *"Hand work to a teammate, get a report back."*). Place it after Profiles and skills.
- Give a teammate a task in chat. It opens its own workspaces and reports back with links and a result. `Alt 4`
- Starter team: Chief, Builder, Debugger, Planner, Reviewer, Shipper and Ticket writer.
- Make your own teammates, or override a starter one and reset it later.
- Memory: each teammate keeps a notes file it reads and adds to. You can edit it.
- Chief splits a vague request into parts with a plan card (Start all, Edit, Cancel). Dependent parts start once the parts they need finish, and you get one combined report.
- Hand-offs: a finished report suggests the next teammate (Planner → Builder → Reviewer → Shipper), or use "Hand to…".
- Teammates can own routines. Each run shows in their thread as a Scheduled task.
- Avatars, with a status dot and a needs-you badge.
- Never merges: teammates stop at a draft PR.

**Other chapter edits**
- *Agents and chat*: add **Live file drafts** (Write and Edit stream into the chat as the agent types them; I'll confirm in the mock what the UI shows) and **Watch an agent** (the picker).
- *Look and keys*: replace "Command palette" with **VS Code keybindings**: the default map, Ctrl+K chords, and rebinding in Settings with conflict detection. Fix every Kbd chip using the table above.
- Fix the Kbd chips in every other chapter too (inbox, ship, issues, routines).
- Total goes from 96 to about 118 features in 15 areas. The stat row and marquee compute this themselves.

### 2. Homepage (`src/pages/index.astro`)

The homepage was trimmed in `d420b89`, so I'm not proposing more sections. Changes:
- **Pinned story: 7 steps to 8.** See open question A.
  - New step **"Watch it write."**: Code view in Watch mode, with the editor following the agent, flashed lines and the Activity timeline. Media: `orbit-dark-code-watch.png`. Kbd `Alt 2`.
  - New step **"A team, not a prompt."**: Chief's plan card, with parts going to Builder and Reviewer. It absorbs "Agents with a job description" (profiles become teammates). Media: `orbit-dark-teammates-chief.png`. Kbd `Alt 4`.
  - Drop **"Work starts from the backlog"** (Issues) from the story. It stays on /features.
  - New order: worktree → watch it write → inbox → team → ship → routines → simplify → (mobile stays its own section).
- Fix the Kbd chips on every step to the new map.
- **Feature section H2** ("One window for the whole fleet. Start it, steer it, ship it."): unchanged, but make sure the hero/feature screenshot is re-shot with the new nav.
- **Why Orbit**: add one line on not leaving for another editor ("Watch the diff land in a real editor, not a chat bubble"). I'll draft it; you approve the copy.
- **FAQ**: add "Do I still need VS Code?" (Orbit has an editor and terminal built in, and Open in Code; keep your editor for the deep stuff) and "What are teammates?" Draft copy goes into the plan once approved.
- The Areas grid and marquee update automatically from the data.

### 3. Screenshots and video

**Capture-script fixes first** (`scripts/capture-orbit.mjs`): new key map, plus navigating views with `Alt 1`–`5` instead of the old shortcuts.

**Re-shoot all existing `orbit-dark-*` captures** against today's mock (`bun run dev` in `agentic_ide`, :1420).

**New captures** (dark; light only where a chapter needs it):
| File | What it shows |
|---|---|
| `orbit-dark-code-watch.png` | Code view mid-turn (`simulateCodeTurn`): agent strip, flashed lines, gutter marks, Activity timeline |
| `orbit-dark-code-diff.png` | Per-turn diff opened from the timeline |
| `orbit-dark-code-terminal.png` | Terminal panel + project search results |
| `orbit-dark-code-ask.png` | Ask about selection popover |
| `orbit-dark-teammates.png` | Teammates view: list + a thread with a report and hand-off chips |
| `orbit-dark-teammates-chief.png` | Chief plan card with parts and dependencies |
| `orbit-dark-teammate-editor.png` | Teammate editor (avatar picker, Memory tab) |
| `orbit-dark-settings-keys.png` | New keybindings settings (recorder, search, chords) |

Then run `scripts/sync-media.mjs`, and set the chapter crops for the two new chapters at 1:1 legibility (§7.4 rule).

**Tour video** (`orbit-tour-dark.mp4`): re-record with `record-orbit.mjs` so it includes a few seconds of Code Watch mode and a teammate report. See open question C.

### 4. QA (same bar as §7.6)
- `npm run build` is clean.
- Playwright shots at 1440/1024/768/390 into `media/qa/v3/`: the new story steps, both new chapters, the chip bar with 15 chips, and the FAQ.
- Read every new crop at 1440 for legibility and check it matches its `alt`.
- Check for no horizontal scroll, no console errors, and that reduced motion shows final states.
- Grep the built site for every old shortcut string (`Ctrl .`, `Ctrl Shift L`, `Ctrl \`) and confirm none are left.
- Don't commit or push until you've reviewed it.

### How the work splits (Sonnet agents, I review)

| # | Agent | Task | Depends on |
|---|---|---|---|
| 1 | Sonnet | Fix `capture-orbit.mjs` and add the new capture steps, then shoot all captures from the mock | — |
| 2 | Sonnet | `features.ts`: two new chapters, Kbd fixes, Agents/Look edits | — (copy above) |
| 3 | Sonnet | `index.astro`: story to 8 steps, Kbd fixes, Why line, FAQ | 1 (media names), 2 |
| 4 | Sonnet | Re-record the tour video | 1 |
| 5 | Me | Review screenshots against the real app, check crops and copy, run QA, report weight | all |

1 and 2 run in parallel. 3 starts once the captures exist. Before each handoff I review the output with screenshots.

### Open questions for you

A. **Story length.** I propose 8 steps (add Watch + Team, drop Issues, fold Profiles into Team). The alternative is to keep 7 and also drop Simplify, or go to 9 and keep everything.
B. **Hero.** Keep the workspace chat as the hero shot, or lead with Code view in Watch mode? The second is the most visually distinct thing Orbit does now.
C. **Video.** Re-record the tour now, or ship the stills first and do the video in a second pass?
D. **Status bar for 🟢 (mock-verified) features.** The last sync included them as built. Same rule now? Manual mode, Settings > Editor, the keybinding recorder and avatars are 🟢.
E. **FEATURES.md mismatch.** The Code view entry says `Ctrl+Shift+O`, but the keymap binds `Alt 2` / `Ctrl Shift E`. I'll use the keymap unless you say otherwise. You may want to fix FEATURES.md.

### As shipped
- The story stayed at 7 steps: it added Watch it write and A team, not a prompt, and dropped Issues and the profiles step.
- The built-in IDE got headline billing: hero and meta copy, an #ide section with the code-terminal shot, and an IDE nav link.
- The Areas CTA cell spans whatever the last grid row leaves empty, computed from the chapter count.
- Hero choice: the workspace video stays (re-shot stills only; the tour video was not re-recorded).
