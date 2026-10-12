// Copies the captures the page uses from media/raw into src/assets/raw and videos into public/media.
// Run after re-capturing: node scripts/sync-media.mjs
import { readFileSync, copyFileSync, readdirSync, rmSync, mkdirSync } from "node:fs";

const manifest = readFileSync("src/data/features.ts", "utf8");
const fromManifest = [...manifest.matchAll(/(?:shot|phone):\s*"([^"]+\.png)"/g)].map((m) => m[1]);
const pinned = [
  "orbit-dark-workspace.png", "orbit-dark-inbox.png", "orbit-dark-ship.png", "orbit-dark-palette-profiles.png",
  "orbit-dark-issues.png", "orbit-dark-routine-editor.png", "orbit-dark-simplify-applying.png",
  "mobile-workspace.png", "mobile-inbox.png", "mobile-diff.png",
];
const wanted = new Set([...fromManifest, ...pinned]);

mkdirSync("src/assets/raw", { recursive: true });
for (const f of readdirSync("src/assets/raw")) if (!wanted.has(f)) rmSync(`src/assets/raw/${f}`);
for (const f of wanted) copyFileSync(`media/raw/${f}`, `src/assets/raw/${f}`);

const videos = [
  ["orbit-tour-dark-trim.mp4", "orbit-tour-dark.mp4"],
  ["orbit-tour-dark-trim.webm", "orbit-tour-dark.webm"],
  ["mobile-tour.mp4", "mobile-tour.mp4"],
  ["mobile-tour.webm", "mobile-tour.webm"],
  ["orbit-tour-dark-poster.jpg", "orbit-tour-dark-poster.jpg"],
];
for (const [from, to] of videos) copyFileSync(`media/${from}`, `public/media/${to}`);
console.log(`${wanted.size} images, ${videos.length} video files synced`);
