// Records a short real-UI tour of Orbit via CDP screencast, then encodes MP4/WebM with ffmpeg.
// Usage: node scripts/record-orbit.mjs [dark|light]
import { chromium } from "playwright";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const scheme = process.argv[2] ?? "dark";
const dir = `media/frames-${scheme}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme });
const page = await ctx.newPage();
await page.goto("http://localhost:1420"); await page.waitForTimeout(1500);
if (scheme === "light") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light"));
const cdp = await ctx.newCDPSession(page);
const frames = [];
cdp.on("Page.screencastFrame", async (f) => {
  const n = frames.length; fs.writeFileSync(`${dir}/${String(n).padStart(5, "0")}.jpg`, Buffer.from(f.data, "base64"));
  frames.push(f.metadata.timestamp); await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 92, maxWidth: 2560, maxHeight: 1600, everyNthFrame: 1 });
const w = (ms) => page.waitForTimeout(ms);
const mouse = async (loc) => { const b = await loc.boundingBox(); await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 25 }); };
await w(1200);
const ws = page.getByText("Fix onboarding crash").first(); await mouse(ws); await w(200); await ws.click(); await w(2200);
await page.keyboard.press("Control+."); await w(2400); await page.keyboard.press("Control+.");
await w(500); await page.keyboard.press("Control+i"); await w(1600);
await page.keyboard.press("j"); await w(900); await page.keyboard.press("j"); await w(900); await page.keyboard.press("k"); await w(1200);
await page.keyboard.press("Escape"); await w(400);
await page.keyboard.press("Control+k"); await w(600); await page.keyboard.type("profile", { delay: 110 }); await w(1400);
await page.keyboard.press("ArrowDown"); await w(500); await page.keyboard.press("ArrowDown"); await w(1200);
await page.keyboard.press("Escape"); await w(1200);
await cdp.send("Page.stopScreencast");
await browser.close();
// Write a concat list with real per-frame durations so pacing matches the session.
const lines = frames.map((t, i) => `file '${String(i).padStart(5, "0")}.jpg'\nduration ${((frames[i + 1] ?? t + 0.5) - t).toFixed(4)}`);
fs.writeFileSync(`${dir}/list.txt`, lines.join("\n") + `\nfile '${String(frames.length - 1).padStart(5, "0")}.jpg'\n`);
const base = `media/orbit-tour-${scheme}`;
const vf = "fps=30,scale=1920:-2:flags=lanczos,format=yuv420p";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", "-an", `${base}.mp4`]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-an", `${base}.webm`]);
console.log(frames.length, "frames ->", base, ".mp4/.webm");
