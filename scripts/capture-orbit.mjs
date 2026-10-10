// Captures real Orbit UI (mock backend at :1420) at 2x for the launch site.
// Usage: node scripts/capture-orbit.mjs [dark|light]
import { chromium } from "playwright";
const URL = process.env.ORBIT_URL ?? "http://localhost:1420";
const scheme = process.argv[2] ?? "dark";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme });
const page = await ctx.newPage();
await page.goto(URL); await page.waitForTimeout(1500);
if (scheme === "light") { await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light")); }
const shot = async (n) => { await page.waitForTimeout(800); await page.screenshot({ path: `media/raw/orbit-${scheme}-${n}.png` }); console.log("saved", n); };
const esc = () => page.keyboard.press("Escape");
await shot("home");
await page.getByText("Fix onboarding crash").first().click(); await shot("workspace");
const groups = page.getByText(/tool calls?/i);
if (await groups.count()) { await groups.first().click(); await shot("workspace-tools"); await groups.first().click(); }
await page.keyboard.press("Control+."); await shot("ship"); await page.keyboard.press("Control+.");
await page.keyboard.press("Control+k"); await shot("palette"); await esc();
await page.keyboard.press("Control+i"); await shot("inbox"); await esc();
await page.keyboard.press("Control+Shift+g"); await shot("issues"); await esc();
await page.keyboard.press("Control+Shift+e"); await page.getByText("Triage new issues").first().click(); await shot("routines");
await browser.close();
