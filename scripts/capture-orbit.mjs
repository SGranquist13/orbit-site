// Captures real Orbit UI (mock backend at :1420) at 2x for the launch site.
// Usage: node scripts/capture-orbit.mjs [dark|light] [only-shot-name...]
import { chromium } from "playwright";

const URL = process.env.ORBIT_URL ?? "http://localhost:1420";
const scheme = process.argv[2] ?? "dark";
const only = new Set(process.argv.slice(3));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme });
const page = await ctx.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));

const w = (ms) => page.waitForTimeout(ms);
// Escape closes dialogs; popovers close on their full-screen backdrop.
const esc = async () => {
  await page.keyboard.press("Escape"); await w(150);
  const backdrop = page.locator("div.fixed.inset-0.z-10").first();
  if (await backdrop.count()) await backdrop.click({ position: { x: 5, y: 5 }, timeout: 2000 }).catch(() => {});
};
page.setDefaultTimeout(6000);
const want = (n) => only.size === 0 || only.has(n);
const shot = async (n) => {
  if (!want(n)) return;
  await w(800);
  await page.screenshot({ path: `media/raw/orbit-${scheme}-${n}.png` });
  console.log("saved", n);
};
const clickText = async (text, opts = {}) => {
  const loc = page.getByText(text, { exact: true, ...opts }).first();
  if (!(await loc.count())) { console.log("missing:", text); return false; }
  await loc.click(); return true;
};
const clickTitle = async (title) => {
  const loc = page.locator(`[title="${title}"]`).first();
  if (!(await loc.count())) { console.log("missing title:", title); return false; }
  await loc.click(); return true;
};
const home = async () => { await page.goto(URL); await w(1500); if (scheme === "light") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light")); };

await home();
await shot("home");

await clickText("Fix onboarding crash"); await shot("workspace");
const groups = page.getByText(/tool calls?/i);
if (await groups.count()) { await groups.first().click(); await shot("workspace-tools"); await groups.first().click(); }

await page.keyboard.press("Control+."); await shot("ship"); await page.keyboard.press("Control+.");
await page.keyboard.press("Control+k"); await shot("palette");
await page.keyboard.type("profile", { delay: 30 }); await shot("palette-profiles"); await esc();

// Attach + related projects popovers in the workspace header.
if (await clickTitle("Projects that use, or are used by, this repository")) { await shot("related"); await esc(); }
// Skill packs dialog.
if (await clickTitle("Skill packs & pins")) { await shot("packs"); await esc(); }
// Schedule-this-message popover.
if (await clickTitle("Schedule this message")) { await shot("schedule"); await esc(); }
// Context meter popover: the usage figure in the composer footer.
const meter = page.getByText(/170k \/ 200k/).first();
if (await meter.count()) { await meter.click(); await shot("context"); await esc(); }

// Simplify panel: needs an idle agent, so run it on a finished workspace.
await clickText("Migrate billing schema");
if (await clickTitle("Find and apply simplifications in this workspace's changes")) {
  await shot("simplify-empty");
  const find = page.getByRole("button", { name: /Find simplifications/ }).first();
  if (await find.isEnabled().catch(() => false)) {
    await find.click(); await w(4000); await shot("simplify");
    const apply = page.getByRole("button", { name: /Apply/ }).first();
    if (await apply.isEnabled().catch(() => false)) { await apply.click(); await w(5000); await shot("simplify-applying"); await w(9000); await shot("simplify-applied"); }
  }
  await clickTitle("Find and apply simplifications in this workspace's changes");
}
await clickText("Fix onboarding crash");

// Focus mode.
await page.keyboard.press("Control+\\"); await shot("focus"); await page.keyboard.press("Control+\\");

await page.keyboard.press("Control+n"); await w(400);
await page.keyboard.type("Add rate limiting to the public API. 100 requests a minute per key, with a 429 and a Retry-After header.", { delay: 8 });
await shot("new-workspace"); await esc();

await page.keyboard.press("Control+i"); await shot("inbox");
if (await clickText("All")) await shot("inbox-all");
await esc();

await page.keyboard.press("Control+Shift+g"); await shot("issues"); await esc();

await page.keyboard.press("Control+Shift+e");
await clickText("Triage new issues"); await shot("routines");
await clickText("Weekly simplify"); await shot("routines-simplify");
if (await clickText("New routine", { exact: false })) {
  const box = page.locator("textarea").first();
  if (await box.count()) await box.fill("Look at the GitHub issues opened since yesterday. Label them, flag duplicates, and reply to anything that's missing repro steps.");
  await shot("routine-editor"); await esc();
}

// Settings, every section.
await home();
await page.keyboard.press("Control+,"); await w(600);
for (const [title, name] of [["General", "general"], ["Agents", "agents"], ["Git", "git"], ["GitHub", "github"], ["Skills & profiles", "skills"],
  ["Inbox", "inbox-settings"], ["Models", "models"], ["Mobile", "mobile"], ["Usage", "usage"], ["Data", "data"], ["Keyboard shortcuts", "shortcuts"]]) {
  if (!want(`settings-${name}`)) continue;
  const nav = page.locator(`nav[aria-label="Settings sections"]`).getByText(title, { exact: true }).first();
  if (!(await nav.count())) { console.log("missing nav:", title); continue; }
  await nav.click(); await w(700);
  await shot(`settings-${name}`);
}

await browser.close();
