// Captures the velocity-feature stills from Orbit's demo mode (:1420, launch seed) at 2x.
// Usage: node scripts/capture-new.mjs [only-shot-name...]
import { chromium } from "playwright";

const BASE = (process.env.ORBIT_URL ?? "http://localhost:1420") + "/?seed=launch&ws=w1";
const only = new Set(process.argv.slice(2));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: "dark" });
const page = await ctx.newPage();
await page.addInitScript(() => { const si = window.setInterval.bind(window); window.setInterval = (f, t, ...a) => (t === 12000 ? 0 : si(f, t, ...a)); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.setDefaultTimeout(5000);

const w = (ms) => page.waitForTimeout(ms);
const fresh = async () => { await page.goto(BASE); await w(1500); };
const key = async (k) => { await page.keyboard.press(k); await w(400); };
const click = async (text, opts = {}) => {
  const loc = page.getByText(text, { exact: true, ...opts }).first();
  if (!(await loc.count())) { console.log("missing:", text); return false; }
  await loc.click({ timeout: 2500 }).catch(() => loc.click({ force: true })); await w(400); return true;
};
const goalCollapse = 'button:text-is("Goal") + button:text-is("Collapse")';
const shot = async (n) => { if (n !== "goal-card") { const g = page.locator(goalCollapse).first(); if (await g.count()) { await g.click().catch(() => {}); await w(300); } } await w(800); await page.screenshot({ path: `media/raw/orbit-dark-${n}.png` }); console.log("saved", n); };

const shots = {
  "fleet-board": async () => { await key("Alt+8"); },
  "goal-orchestrator": async () => { await click("Refactor auth flow"); },
  "goal-card": async () => { await click("Fix onboarding crash"); },
  memory: async () => { await key("Alt+7"); await page.getByText("relay", { exact: true }).last().click().catch(() => console.log("missing: relay scope")); await w(600); },
  approvals: async () => { await key("Alt+1"); await click("Needs you"); await click("Migrate billing schema"); },
  remote: async () => { await click("New workspace"); const sel = page.getByTestId("where-select"); const opt = await sel.locator("option").evaluateAll((o) => (o.find((x) => x.textContent.includes("relay-dev")) || {}).value).catch(() => null); if (opt) await sel.selectOption(opt); else console.log("missing: relay-dev"); await w(400); },
  "time-travel": async () => {
    await click("Fix onboarding crash"); await click("Open in Code");
    await key("Control+P"); await page.keyboard.type("src/onboarding/submit.ts"); await key("Enter");
    const turn = page.getByLabel("Workspace turn").first();
    if (await turn.count()) { await turn.focus(); await key("Home"); for (let i = 0; i < 4; i++) await key("ArrowRight"); } else console.log("missing: Workspace turn");
  },
  "ship-stack": async () => { await click("Billing webhooks"); await page.locator("button", { hasText: /Ship\s*#/ }).first().click().catch(() => console.log("missing: ship button")); await w(1200); },
  "release-helper": async () => { await page.getByText("relay", { exact: true }).first().click({ button: "right" }); await w(300); await click("Release..."); },
  backlog: async () => { await page.getByText("relay", { exact: true }).first().click({ button: "right" }); await w(300); await click("Backlog..."); },
  intake: async () => { await key("Alt+5"); await click("Linear"); await page.getByText("ENG-87").first().hover().catch(() => {}); },
  "pair-preview": async () => { await click("Fix onboarding crash"); await click("Pair: 1 notes", { exact: false }); await key("Control+K"); await key("p"); await click("Start"); await w(1500); },
};

for (const [n, run] of Object.entries(shots)) {
  if (only.size && !only.has(n)) continue;
  try { await fresh(); await run(); await shot(n); } catch (e) { console.log("failed", n, e.message.split("\n")[0]); }
}
await browser.close();
