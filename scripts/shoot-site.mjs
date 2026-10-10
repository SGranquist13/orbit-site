// Usage: node scripts/shoot-site.mjs [url]   (dev server must be running)
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] || "http://localhost:4321";
mkdirSync("media/qa", { recursive: true });
const browser = await chromium.launch();
for (const [name, width, height] of [["site-1440", 1440, 900], ["site-390", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  // viewport shot at top
  await page.screenshot({ path: `media/qa/${name}-top.png` });
  // scroll through so scrubbed animations resolve, then return
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 300) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  // mid-hero state where the window is flat
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  console.log(name, "scrollWidth", sw, "innerWidth", width, "height", h, "errors", errors);
  await page.screenshot({ path: `media/qa/${name}.png`, fullPage: true });
  await page.evaluate(() => window.scrollTo(0, 520));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `media/qa/${name}-scrolled.png` });
  await page.evaluate(() => { const w = document.querySelector("[data-hero-window]"); const r = w.getBoundingClientRect(); window.scrollTo(0, window.scrollY + r.top + r.height / 2 - innerHeight / 2); });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `media/qa/${name}-flat.png` });
  await page.evaluate(() => window.scrollTo(0, document.querySelector("#statement").offsetTop - innerHeight * 0.3));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `media/qa/${name}-statement.png` });
  const jump = async (y) => {
    await page.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)), y);
    await page.waitForTimeout(1300);
  };
  const absTop = (sel) => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + window.scrollY, sel);
  await jump(0);
  if (width >= 1024) {
    const pinTop = await absTop("[data-feat-pin]");
    const vh = height;
    for (const [n, step] of [[1, 0], [3, 2], [5, 4], [6, 4.8]]) {
      await jump(pinTop + ((step + 0.5) / 5) * 4 * vh * (n === 6 ? 1.0 : 1));
      await page.screenshot({ path: `media/qa/${name}-feat-${n}.png` });
    }
  } else {
    for (const sel of ["#features", "#features .item:nth-child(3)"]) {
      await jump((await absTop(sel)) - 80);
      await page.screenshot({ path: `media/qa/${name}-feat-${sel.includes("nth") ? "3" : "1"}.png` });
    }
  }
  const mTop = await absTop("#mobile");
  await jump(mTop);
  await page.screenshot({ path: `media/qa/${name}-mobile-a.png` });
  await jump(mTop + (width >= 1024 ? 520 : 500));
  await page.screenshot({ path: `media/qa/${name}-mobile-b.png` });
  await jump(mTop + (width >= 1024 ? 900 : 1100));
  await page.screenshot({ path: `media/qa/${name}-mobile-c.png` });
  await page.close();
}
await browser.close();
