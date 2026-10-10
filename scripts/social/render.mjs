// Renders share images (and a square video) from card.html with Playwright.
// Usage: node scripts/social/render.mjs
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const card = pathToFileURL(path.resolve("scripts/social/card.html")).href;
const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });

async function shot(name, w, h, layout) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`${card}?w=${w}&h=${h}&layout=${layout}`);
  await page.waitForFunction(() => window.__ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: name });
  await page.close();
  console.log("saved", name);
}

fs.mkdirSync("social", { recursive: true });
await shot("public/og.png", 1200, 627, "og");
await shot("social/linkedin-og.png", 1200, 627, "og");
await shot("social/github-social-preview.png", 1280, 640, "og");
await shot("social/linkedin-square.png", 1200, 1200, "square");

// Square video: CDP screencast of the page with both product videos playing (sharper than recordVideo).
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
await page.goto(`${card}?w=1080&h=1080&layout=square&video=1`);
await page.waitForFunction(() => window.__ready);
const dir = "social/tmp";
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
const cdp = await page.context().newCDPSession(page);
const ts = [];
cdp.on("Page.screencastFrame", async (f) => {
  fs.writeFileSync(`${dir}/${String(ts.length).padStart(5, "0")}.jpg`, Buffer.from(f.data, "base64"));
  ts.push(f.metadata.timestamp);
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await page.evaluate(() => document.querySelectorAll("video").forEach((v) => { v.currentTime = 0; v.play(); }));
await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: 1080, maxHeight: 1080 });
await page.waitForTimeout(15500);
await cdp.send("Page.stopScreencast");
await browser.close();

const name = (i) => `${String(i).padStart(5, "0")}.jpg`;
const lines = ts.map((t, i) => `file '${name(i)}'\nduration ${((ts[i + 1] ?? t + 0.04) - t).toFixed(4)}`);
fs.writeFileSync(`${dir}/list.txt`, `${lines.join("\n")}\nfile '${name(ts.length - 1)}'\n`);
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}/list.txt`,
  "-vf", "fps=30,format=yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-movflags", "+faststart", "-an", "social/linkedin-square.mp4"]);
fs.rmSync(dir, { recursive: true, force: true });
console.log("saved social/linkedin-square.mp4", ts.length, "frames");
