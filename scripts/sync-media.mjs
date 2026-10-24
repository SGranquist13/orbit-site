// Copies the captures the page uses from media/raw into src/assets/raw and videos into public/media.
// Run after re-capturing: node scripts/sync-media.mjs
import { readFileSync, copyFileSync, readdirSync, rmSync, mkdirSync, existsSync } from "node:fs";

const manifest = readFileSync("src/data/features.ts", "utf8");
const fromManifest = [...manifest.matchAll(/(?:shot|phone):\s*"([^"]+\.png)"/g)].map((m) => m[1]);
const pinned = [
  "orbit-dark-workspace.png", "orbit-dark-code-terminal.png", "orbit-dark-code-watch.png", "orbit-dark-inbox.png", "orbit-dark-teammates-chief.png",
  "orbit-dark-ship.png", "orbit-dark-routine-editor.png", "orbit-dark-simplify-applying.png",
  "mobile-workspace.png", "mobile-inbox.png", "mobile-diff.png",
];
const clipsOnly = process.argv.includes("--clips-only");
const desktopOnly = process.argv.includes("--desktop-only");
const voice = ["voice-setup", "settings-voice", "settings-voice-handsfree", "settings-voice-tidy"].map(n => `orbit-dark-${n}.png`);
pinned.push(...voice);
const wanted = new Set([...fromManifest, ...pinned]);

mkdirSync("src/assets/raw", { recursive: true });
for (const f of readdirSync("src/assets/raw")) if (!clipsOnly && !desktopOnly && !wanted.has(f)) rmSync(`src/assets/raw/${f}`);
for (const f of wanted) if (!clipsOnly && (!desktopOnly || f.startsWith("orbit-"))) copyFileSync(`media/raw/${f.replace("settings-shortcuts", "settings-keys")}`, `src/assets/raw/${f}`);

const videos = [
  ["orbit-tour-dark-trim.mp4", "orbit-tour-dark.mp4"],
  ["orbit-tour-dark-trim.webm", "orbit-tour-dark.webm"],
  ["mobile-tour-trim.mp4", "mobile-tour.mp4"],
  ["mobile-tour-trim.webm", "mobile-tour.webm"],
  ["orbit-tour-dark-poster.jpg", "orbit-tour-dark-poster.jpg"],
];
for (const [from, to] of (desktopOnly || clipsOnly ? [] : videos)) copyFileSync(`media/${from}`, `public/media/${to}`);
console.log(`${clipsOnly ? 0 : [...wanted].filter(f => !desktopOnly || f.startsWith("orbit-")).length} images, ${desktopOnly || clipsOnly ? 0 : videos.length} tour files synced`);

// Optional clips are published only as complete sets. --clips-only preserves all stills and tours.
for (const name of ["voice", "ide"]) {
  const files = [`${name}-trim.mp4`, `${name}-trim.webm`, `${name}-poster.jpg`];
  if (files.every(f => existsSync(`media/${f}`))) {
    for (const f of files) copyFileSync(`media/${f}`, `public/media/${f}`);
    console.log(`${name}: MP4, WebM and poster synced`);
  } else console.log(`${name}: no complete clip; keeping the static fallback`);
}
