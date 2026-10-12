// Usage: node scripts/shoot-v2.mjs [reduced]   (dev or preview server on :4321)
// Writes media/qa/v2/*.png, logs console errors, horizontal overflow and transferred weight.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const reduced = process.argv[2] === "reduced";
const url = process.env.URL || "http://localhost:4321";
mkdirSync("media/qa/v2", { recursive: true });
const b = await chromium.launch();
const sizes = reduced ? [[1440, 900], [390, 844]] : [[1440, 900], [1024, 768], [768, 1024], [390, 844]];

for (const [width, height] of sizes) {
  const p = await b.newPage({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const errs = [];
  let bytes = 0;
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("response", async (r) => {
    try {
      const h = r.headers();
      bytes += Number(h["content-length"] || (await r.body()).length);
    } catch {}
  });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const jump = async (y, wait = 1400) => {
    await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), y);
    await p.waitForTimeout(wait);
  };
  const top = (sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
  const tag = (reduced ? "rm-" : "") + width;
  const shot = (name) => p.screenshot({ path: `media/qa/v2/${tag}-${name}.png` });

  // full scroll pass (lazy images, triggers)
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += Math.round(height * 0.6)) await jump(y, 250);
  await jump(0, 600);
  const pinTop = await top("[data-feat-pin]");

  await jump((await top("[data-marquee]")) - height * 0.35);
  await shot("marquee");
  await jump((await top("#everything")) - 40);
  await shot("everything-intro");
  await jump((await top("#everything")) + 520);
  await shot("everything-stats");

  for (const id of ["workspaces", "inbox", "agents", "profiles", "context", "folders", "ship", "trunk", "simplify", "routines", "models", "mobile", "craft"]) {
    if (!reduced && !["workspaces", "ship", "simplify", "mobile", "inbox", "context", "folders", "profiles", "trunk", "routines", "models", "craft", "agents"].includes(id)) continue;
    await jump((await top(`#ch-${id}`)) - (width >= 1024 ? 100 : 150));
    await shot(`ch-${id}`);
    if (!reduced || width === 1440) {
      // feature grid of this chapter
      await jump((await top(`#ch-${id} .ch-grid`)) - (width >= 1024 ? 120 : 160), 900);
      await shot(`ch-${id}-grid`);
    }
  }
  // sticky index mid-section
  await jump((await top("#ch-ship")) + 700);
  await shot("index-mid");

  // pinned story steps (desktop)
  if (width >= 1024 && !reduced) {
    for (const step of [0, 3, 6]) {
      await jump(pinTop + ((step + 0.5) / 7) * 0.8 * 7 * height);
      await shot(`pin-${step + 1}`);
    }
  }
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(tag, "scrollWidth", sw, "viewport", width, "pageHeight", h, "transferKB", Math.round(bytes / 1024), "errors", errs);
  await p.close();
}
await b.close();
