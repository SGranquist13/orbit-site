// Usage: node scripts/shoot-sections.mjs [reduced]  -> media/qa/sec-*.png
import { chromium } from "playwright";
const reduced = process.argv[2] === "reduced";
const b = await chromium.launch();
for (const [name, width, height] of [["1440", 1440, 900], ["390", 390, 844]]) {
  const p = await b.newPage({ viewport: { width, height }, reducedMotion: reduced ? "reduce" : "no-preference" });
  const errs = [];
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  await p.goto("http://localhost:4321", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const jump = async (y) => {
    await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), y);
    await p.waitForTimeout(1500);
  };
  // warm through the page so lazy images load
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await jump(y); }
  const top = (sel) => p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
  const tag = (reduced ? "rm-" : "") + name;
  for (const [sel, off] of [["#how", -40], ["#details", -40], ["#cta", -120]]) {
    await jump((await top(sel)) + off);
    await p.screenshot({ path: `media/qa/sec-${tag}-${sel.slice(1)}.png` });
  }
  if (width < 1024 || true) {
    await jump((await top("#details")) + (width > 1000 ? 380 : 700));
    await p.screenshot({ path: `media/qa/sec-${tag}-details2.png` });
  }
  await jump(h);
  await p.screenshot({ path: `media/qa/sec-${tag}-footer.png` });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(tag, "scrollWidth", sw, "height", h, "errors", errs);
  await p.close();
}
await b.close();
