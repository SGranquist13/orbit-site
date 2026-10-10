import { chromium } from "playwright";
const b = await chromium.launch();
for (const w of [768, 1024, 1280]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto("http://localhost:4321", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(w, "scrollWidth", sw);
  const y = await p.evaluate(() => document.querySelector("[data-hero-window]").getBoundingClientRect().top + scrollY - 200);
  await p.evaluate((y) => (window.__lenis ? window.__lenis.scrollTo(y, { immediate: true, force: true }) : scrollTo(0, y)), y);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `media/qa/tablet-${w}-hero.png` });
  await p.close();
}
await b.close();
