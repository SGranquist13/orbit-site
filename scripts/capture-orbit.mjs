// Captures real Orbit UI (mock backend at :1420) at 2x for the launch site.
// Usage: node scripts/capture-orbit.mjs [dark|light] [only-shot-name...]
import { chromium } from "playwright";

const URL = process.env.ORBIT_URL ?? "http://localhost:1420";
const scheme = process.argv[2] ?? "dark";
const only = new Set(process.argv.slice(3));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2, colorScheme: scheme });
const page = await ctx.newPage();
// The mock fires its own scripted agent turn every 12s; block that so shots only see the turn we trigger.
await page.addInitScript(() => { const si = window.setInterval.bind(window); window.setInterval = (f, t, ...a) => (t === 12000 ? 0 : si(f, t, ...a)); });
page.on("pageerror", (e) => console.log("pageerror:", e.message));

const w = (ms) => page.waitForTimeout(ms);
// Escape closes dialogs; popovers close on their full-screen backdrop.
const esc = async () => {
  await page.keyboard.press("Escape"); await w(150);
  const backdrop = page.locator("div.fixed.inset-0.z-10").first();
  if (await backdrop.count()) await backdrop.click({ position: { x: 5, y: 5 }, timeout: 2000 }).catch(() => {});
};
page.setDefaultTimeout(6000);
const want = (n) => only.size === 0 || only.has(n) || (n === "settings-keys-recorder" && only.has("settings-keys"));
const shot = async (n) => {
  if (!want(n)) return;
  // The demo goal card on Fix onboarding crash fills the chat; collapse it to its one-line bar.
  const goal = page.locator('button:text-is("Goal") + button:text-is("Collapse")').first();
  if (await goal.count()) { await goal.click().catch(() => {}); await w(300); }
  await w(800);
  await page.screenshot({ path: `media/raw/orbit-${scheme}-${n}.png` });
  console.log("saved", n);
};
const clickText = async (text, opts = {}) => {
  const loc = page.getByText(text, { exact: true, ...opts }).first();
  if (!(await loc.count())) { console.log("missing:", text); return false; }
  await loc.click({ timeout: 2500 }).catch(() => loc.click({ force: true })); return true;
};
const clickTitle = async (title) => {
  const loc = page.locator(`[title="${title}"]`).first();
  if (!(await loc.count())) { console.log("missing title:", title); return false; }
  await loc.click({ timeout: 2500 }).catch(() => loc.click({ force: true })); return true;
};
const chord = async (a, b) => { await page.keyboard.press(a); await w(150); await page.keyboard.press(b); await w(300); };
const home = async () => { await page.goto(URL); await w(1500); if (scheme === "light") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "light")); };

const voiceOnly = only.size > 0 && [...only].every(n => n.startsWith("voice-") || n.startsWith("settings-voice"));
if (!voiceOnly) {
await home();
await shot("home");

await clickText("Fix onboarding crash"); await shot("workspace");
// The first message carries the two screenshots the user pasted: scroll the transcript to the top.
if (want("workspace-top")) {
  await page.evaluate(() => { for (const el of document.querySelectorAll("*")) if (el.scrollHeight > el.clientHeight + 40 && getComputedStyle(el).overflowY !== "visible" && el.querySelector("img")) el.scrollTop = 0; });
  await shot("workspace-top");
}
const groups = page.getByText(/tool calls?/i);
if (await groups.count()) { await groups.first().click(); await shot("workspace-tools"); await groups.first().click(); }

await page.keyboard.press("Control+Shift+g"); await shot("ship"); await page.keyboard.press("Control+Shift+g");
await page.keyboard.press("Control+Shift+p"); await shot("palette");
await page.keyboard.type("switch profile", { delay: 30 }); await shot("palette-profiles"); await esc();

// Attach + related projects popovers in the workspace header.
if (await clickTitle("Projects that use, or are used by, this repository")) { await shot("related"); await esc(); }
// Skill packs dialog.
if (await clickTitle("Add or manage skill shortcuts")) { await shot("packs"); await esc(); }
// Schedule-this-message popover.
if (await clickTitle("Schedule this message")) { await shot("schedule"); await esc(); }
// Context meter popover: the usage figure in the composer footer.
const meter = page.getByText(/170k \/ 200k/).first();
if (await meter.count()) { await meter.click({ force: true }).catch(() => {}); await shot("context"); await esc(); }

// Simplify panel: needs an idle agent, so run it on a finished workspace.
await home(); await clickText("Refactor auth flow"); await w(600);
if (await clickTitle("Find and apply simplifications in this workspace's changes")) {
  await shot("simplify-empty");
  const find = page.getByRole("button", { name: /Find simplifications/ }).first();
  if (await find.isEnabled().catch(() => false)) {
    await find.click(); await w(4000); await shot("simplify");
    for (const i of [2, 3]) await page.getByRole("checkbox").nth(i).check().catch(() => {}); // also try the two medium-risk ones: one fails its checks and is reverted
    const apply = page.getByRole("button", { name: /Apply/ }).first();
    if (await apply.isEnabled().catch(() => false)) { await apply.click(); await w(5000); await shot("simplify-applying"); await w(9000); await shot("simplify-applied"); }
  }
  await clickTitle("Find and apply simplifications in this workspace's changes");
}
await clickText("Fix onboarding crash");

// Focus mode.
await chord("Control+k", "z"); await shot("focus"); await chord("Control+k", "z");

await page.keyboard.press("Control+n"); await w(400);
await page.keyboard.type("Add rate limiting to the public API. 100 requests a minute per key, with a 429 and a Retry-After header.", { delay: 8 });
await shot("new-workspace"); await esc();

await page.keyboard.press("Alt+1"); await shot("inbox");
if (await clickText("All")) await shot("inbox-all");
await esc();

await page.keyboard.press("Alt+5"); await shot("issues"); await esc();

await page.keyboard.press("Alt+3"); await w(800);
await clickText("Triage new issues"); await shot("routines");
await clickText("Weekly simplify"); await shot("routines-simplify");
if (await clickText("New routine", { exact: false })) {
  const box = page.locator("textarea").first();
  if (await box.count()) await box.fill("Look at the GitHub issues opened since yesterday. Label them, flag duplicates, and reply to anything that's missing repro steps.");
  await shot("routine-editor"); await esc();
}

// ---- Code view ----
const openCode = async () => {
  await home(); await page.keyboard.press("Alt+2"); await w(500);
  if (await page.getByText("Open a folder or a workspace").count()) await page.getByText("Fix onboarding crash", { exact: true }).last().click();
  await w(1500);
};
const simulate = () => page.evaluate(() => window.dispatchEvent(new CustomEvent("orbit-simulate-agent-edit")));
if (want("code-watch") || want("code-diff") || want("code-ask") || want("code-terminal") || want("code-search")) {
  await openCode();
  await simulate();
  await page.getByText(/^(Writing|Editing) /).first().waitFor({ timeout: 10000 });
  await w(Number(process.env.WATCH_DELAY ?? 700));
  if (want("code-watch")) { await page.screenshot({ path: `media/raw/orbit-${scheme}-code-watch.png` }); console.log("saved code-watch"); }
  // wait for the turn to finish, then open a per-turn diff from the Activity timeline
  await page.getByText(/^Fixed the signup crash/).first().waitFor({ timeout: 25000 });
  await w(1500);
  await page.getByText("submit.ts", { exact: true }).last().click(); await w(1000);
  await shot("code-diff");
  await page.getByRole("button", { name: "Back to file" }).click().catch(() => {}); await w(300);
  // Ask about selection
  await page.locator(".cm-line", { hasText: "Names like" }).first().click();
  await page.keyboard.press("Home"); await page.keyboard.press("Shift+ArrowDown"); await page.keyboard.press("Shift+ArrowDown");
  await page.keyboard.press("Control+i"); await w(500);
  const q = page.getByLabel("Question about selection");
  if (await q.count()) await q.fill("Could the generated slug be checked against existing orgs so two signups never collide?");
  await shot("code-ask");
  await page.keyboard.press("Escape"); await w(300);
  // Terminal, then search
  await page.keyboard.press("Control+`"); await w(1200);
  await page.keyboard.type("ls", { delay: 20 }); await page.keyboard.press("Enter"); await w(800);
  await shot("code-terminal");
  await page.keyboard.press("Control+Shift+f"); await w(500);
  await page.getByLabel("Search in files").fill("slug"); await page.keyboard.press("Enter"); await w(1200);
  await shot("code-search");
}

// ---- Teammates ----
if (["teammates", "teammates-chief", "teammate-editor", "teammate-memory"].some(want)) {
  await home(); await page.keyboard.press("Alt+4"); await w(900);
  await shot("teammates-chief");
  await page.mouse.click(380, 190); await w(800); await shot("teammates");
  await page.mouse.click(380, 190); await w(600); // Builder: the only starter teammate with seeded memory
  await page.getByRole("button", { name: "Edit", exact: true }).click(); await w(800);
  await shot("teammate-editor");
  await page.getByRole("button", { name: "memory", exact: true }).click(); await w(800);
  await shot("teammate-memory"); await esc();
}

// Settings, every section.
await home();
await page.keyboard.press("Control+,"); await w(600);
for (const [title, name] of [["General", "general"], ["Agents", "agents"], ["Git", "git"], ["GitHub", "github"], ["Skills & profiles", "skills"],
  ["Inbox", "inbox-settings"], ["Models", "models"], ["Mobile", "mobile"], ["Usage", "usage"], ["Data", "data"], ["Keyboard shortcuts", "keys"]]) {
  if (!want(`settings-${name}`)) continue;
  const nav = page.locator(`nav[aria-label="Settings sections"]`).getByText(title, { exact: true }).first();
  if (!(await nav.count())) { console.log("missing nav:", title); continue; }
  await nav.click(); await w(700);
  if (name === "keys") {
    await page.getByPlaceholder("Search commands or keybindings").fill("ctrl k"); await w(500);
    await page.getByPlaceholder("Search commands or keybindings").evaluate((e) => e.closest("section,div")?.scrollIntoView({ block: "start", behavior: "instant" })); await page.getByRole("heading", { name: "Keyboard shortcuts" }).first().evaluate((e) => e.scrollIntoView({ block: "start", behavior: "instant" })).catch(() => {}); await w(600);
    await shot("settings-keys");
    await shot("settings-shortcuts");
    await page.getByText("Focus mode", { exact: true }).first().dblclick().catch(() => {}); await w(500);
    await page.keyboard.press("Control+k"); await w(250); await page.keyboard.press("y"); await w(500);
    await shot("settings-keys-recorder"); await page.keyboard.press("Escape"); await w(300);
    continue;
  }
  await shot(`settings-${name}`);
}

}

// Voice controls and setup are captured directly from the mock UI, without downloading models.
if (["voice-chat", "voice-setup", "settings-voice", "settings-voice-handsfree", "settings-voice-tidy"].some(want)) {
  await home(); await clickText("Fix onboarding crash");
  await page.getByRole("button", { name: "Dictate", exact: true }).waitFor();
  await shot("voice-chat");
  if (want("voice-setup")) {
    await page.getByRole("button", { name: "Dictate", exact: true }).click();
    await page.getByRole("dialog", { name: "Set up voice" }).waitFor();
    await shot("voice-setup"); await esc();
  }
  await home(); await page.keyboard.press("Control+,"); await w(600);
  const settingsNav = page.getByRole("navigation", { name: "Settings sections" });
  await settingsNav.getByText("Voice", { exact: true }).click(); await shot("settings-voice");
  await page.getByText("Hands-free", { exact: true }).last().evaluate(e => e.scrollIntoView({block: "start"}));
  await shot("settings-voice-handsfree");
  await settingsNav.getByText("Models", { exact: true }).click();
  await page.getByRole("combobox", { name: "Voice tidy-up", exact: true }).scrollIntoViewIfNeeded();
  await shot("settings-voice-tidy");
}

await browser.close();
