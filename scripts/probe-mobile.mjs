import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
await page.goto("http://localhost:8099"); await page.waitForTimeout(6000);
await page.screenshot({ path: "media/raw/probe.png" });
console.log(await page.evaluate(() => document.body.innerText));
await browser.close();
