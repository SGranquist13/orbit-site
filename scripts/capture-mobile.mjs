// Captures real Orbit Mobile UI (expo web :8099 paired with mock-orbit) at iPhone 3x.
// Usage: node scripts/capture-mobile.mjs   (needs the mobile-web launch config running)
import { chromium } from "playwright";
import { startMockOrbit } from "./demo-orbit.mjs";
const mock = await startMockOrbit({ port: 47823, hosts: ["studio.localhost"], name: "Studio" });
const link = mock.uri();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, colorScheme: "dark" });
const page = await ctx.newPage();
const shot = async (n) => { await page.waitForTimeout(1200); await page.screenshot({ path: `media/raw/mobile-${n}.png` }); console.log("saved", n, "|", (await page.evaluate(() => document.body.innerText)).replace(/\s+/g, " ").slice(0, 200)); };
await page.goto("http://localhost:8099"); await page.waitForTimeout(5000);
await shot("welcome");
await page.getByText("Enter pairing code").first().click(); await page.waitForTimeout(800);
await page.locator("textarea").fill(link);
await page.getByText("Connect", { exact: true }).click(); await page.waitForTimeout(4000);
await shot("inbox");
await page.goto("http://localhost:8099/workspaces"); await page.waitForTimeout(2500); await shot("workspaces");
await page.goBack().catch(() => {}); await page.waitForTimeout(800);
await page.goto("http://localhost:8099/"); await page.waitForTimeout(3000);
const first = page.getByText("Fix onboarding crash").first();
if (await first.count()) { await first.click(); await shot("workspace"); }
for (const tab of ["Activity", "Files"]) { const t = page.getByText(tab, { exact: true }); if (await t.count()) { await t.first().click(); await shot(tab.toLowerCase()); } }
const f = page.getByText("submit.ts", { exact: true }); if (await f.count()) { await f.first().click(); await shot("diff"); }
await browser.close();
await mock.close();
