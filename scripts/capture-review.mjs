// Review view stills from the Orbit mock (:1420) at 2x for the launch site.
// Usage: node scripts/capture-review.mjs   (then node scripts/sync-media.mjs --desktop-only)
import { chromium } from "playwright";

const URL = process.env.ORBIT_URL ?? "http://localhost:1420";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: "dark" });
const page = await ctx.newPage();
// The mock fires its own scripted agent turn every 12s; block that so shots stay still.
await page.addInitScript(() => { const si = window.setInterval.bind(window); window.setInterval = (f, t, ...a) => (t === 12000 ? 0 : si(f, t, ...a)); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.setDefaultTimeout(8000);
const w = (ms) => page.waitForTimeout(ms);
// Stills for the site's three-up grid are cropped to the diff column (16:10) so they stay legible small.
const CROP = { x: 520, y: 0, width: 760, height: 475 };
const shot = async (n, clip) => { await page.mouse.move(2, 790); await w(700); await page.screenshot({ path: `media/raw/orbit-dark-${n}.png`, clip }); console.log("saved", n); };
const num = (kind, n) => page.locator(`[data-review-diff] .rv-row.rv-${kind}`).filter({ has: page.locator(".rv-num", { hasText: new RegExp(`^${n}$`) }) }).first().locator(".rv-num").nth(kind === "del" ? 0 : 1);

try {
  await page.goto(URL); await w(1800);
  await page.keyboard.press("Control+b"); await w(300); // collapsed sidebar: the diff gets the width
  await page.keyboard.press("Alt+6"); await w(800);

  // 1. A pull request in split view: threads, a resolved one, and a pending suggestion.
  await page.locator('[data-testid="review-pr-842"]').click();
  await page.locator('[data-review-diff="src/auth/session.ts"]').waitFor();
  await page.locator('button[title="Unified"]').click(); await w(300);
  await num("add", 16).dispatchEvent("mousedown"); await w(250);
  await num("add", 19).dispatchEvent("mousedown", { shiftKey: true }); await w(300);
  await page.getByRole("button", { name: "± Suggest change" }).click();
  await page.locator("[data-composer] textarea").press("Control+Home");
  await page.keyboard.type("Refresh here too, so a session that expires mid-request is renewed.\n");
  await page.getByRole("button", { name: "Add review comment" }).click(); await w(900);
  await page.locator('button[title="Split"]').click(); await w(400);
  // Centre on the suggestion just added, with the threads above it in view.
  await page.locator("[data-draft]").first().evaluate((el) => el.scrollIntoView({ block: "center" }));
  await shot("review-pr");

  // 2. Finishing the review.
  await page.locator('[data-testid="review-submit-open"]').click(); await w(200);
  await page.keyboard.type("Nice work. One suggestion inline.");
  await page.getByText("Approve", { exact: true }).click();
  await shot("review-submit", CROP);
  await page.keyboard.press("Escape");

  // 3. An image change, side by side.
  await page.locator('[data-review-file="assets/logo.png"]').click();
  await page.locator("[data-image-diff] img").nth(1).waitFor();
  await shot("review-image", CROP);

  // 4. A local workspace: a comment on a removed line, ready to send to its agent.
  await page.locator('[data-testid^="review-local-"]').first().click();
  await page.locator('[data-review-file="src/main.ts"]').click();
  await page.locator('button[title="Unified"]').click();
  await page.locator("[data-review-diff] .rv-row.rv-del").first().waitFor();
  await page.locator("[data-review-diff] .rv-row.rv-del .rv-num").first().dispatchEvent("mousedown"); await w(250);
  await page.locator("[data-composer] textarea").fill("Keep this log line; it helps when debugging a stuck session.");
  await page.getByRole("button", { name: "Add comment", exact: true }).click();
  await shot("review-local", CROP);
} finally {
  await browser.close();
}
