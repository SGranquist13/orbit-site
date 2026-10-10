import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
mkdirSync('media/qa', { recursive: true });
const browser = await chromium.launch();
let failed = false;
for (const [width, reducedMotion] of [[1440, 'no-preference'], [390, 'no-preference'], [390, 'reduce']]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  await page.goto(process.argv[2] || 'http://127.0.0.1:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => { await Promise.all([...document.images].map(async i => { i.loading = 'eager'; try { await i.decode(); } catch {} })); });
  const result = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).length, og: document.querySelector('[property="og:image"]').content, links: [...document.querySelectorAll('a[href^="https"]')].map(a => a.href) }));
  for (const sel of ['#how', '#details', '#cta']) {
    const locator = page.locator(sel);
    if (await locator.count()) { await locator.scrollIntoViewIfNeeded(); await page.waitForTimeout(700); }
  }
  await page.screenshot({ path: `media/qa/launch-${width}-${reducedMotion}.png` });
  console.log(JSON.stringify({ width, reducedMotion, errors, ...result }));
  if (errors.length || result.overflow || result.brokenImages) failed = true;
  await page.close();
}
await browser.close();
if (failed) process.exit(1);
