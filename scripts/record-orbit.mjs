// Records a short real-UI tour of Orbit via CDP screencast, then encodes MP4/WebM with ffmpeg.
// Usage: node scripts/record-orbit.mjs [dark|light]
import { chromium } from "playwright";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const scheme = process.argv[2] ?? "dark";
const dir = `media/frames-${scheme}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1200, height: 750 }, deviceScaleFactor: 2, colorScheme: scheme });
const page = await ctx.newPage();
await page.addInitScript(() => { const si = window.setInterval.bind(window); window.setInterval = (f, t, ...a) => (t === 12000 ? 0 : si(f, t, ...a)); });
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
await w(800);
// Workspace: open it, ask for the fix in chat (the mock starts the agent's edit on w1).
const ws = page.getByText("Fix onboarding crash").first(); await mouse(ws); await w(150); await ws.click(); await w(500);
await page.locator('button:text-is("Goal") + button:text-is("Collapse")').first().click().catch(() => {}); await w(300);
await page.keyboard.press("Control+b"); await w(500);
const box = page.getByPlaceholder(/Ask Claude/).first(); await box.click(); await w(200);
await page.keyboard.type("Empty org names crash signup. Fix it, with a test.", { delay: 35 }); await w(250);
await page.keyboard.press("Enter"); await w(1800);
// Code view in Watch mode follows the agent's edits live.
await page.keyboard.press("Alt+2"); await w(600);
if (await page.getByText("Open a folder or a workspace").count()) await page.getByText("Fix onboarding crash", { exact: true }).last().click();
await w(11000);
// Ship panel, then Board and Inbox with the sidebar back.
await page.keyboard.press("Alt+2"); await w(300);
await page.keyboard.press("Control+b"); await w(300);
await page.keyboard.press("Alt+8"); await w(1800);
await page.keyboard.press("Alt+1"); await w(1800);
await cdp.send("Page.stopScreencast");
await browser.close();
// Write a concat list with real per-frame durations so pacing matches the session.
const lines = frames.map((t, i) => `file '${String(i).padStart(5, "0")}.jpg'\nduration ${((frames[i + 1] ?? t + 0.5) - t).toFixed(4)}`);
fs.writeFileSync(`${dir}/list.txt`, lines.join("\n") + `\nfile '${String(frames.length - 1).padStart(5, "0")}.jpg'\n`);
const base = `media/orbit-tour-${scheme}-trim`;
// Drop the load and play everything at 1.6x so the tour stays busy.
const vf = "trim=start=0.6,setpts=(PTS-STARTPTS)/1.6,fps=30,scale=1920:-2:flags=lanczos:out_range=tv,format=yuv420p";
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", vf, "-c:v", "libx264", "-crf", "20", "-preset", "slow", "-movflags", "+faststart", "-an", `${base}.mp4`]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`, "-vf", vf, "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", "-an", `${base}.webm`]);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", "6", "-i", `${base}.mp4`, "-frames:v", "1", "-q:v", "3", `media/orbit-tour-${scheme}-poster.jpg`]);
console.log(frames.length, "frames ->", base, ".mp4/.webm");
