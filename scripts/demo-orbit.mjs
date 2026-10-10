#!/usr/bin/env node
// Mock of Orbit's side of docs/protocol.md, for developing and testing the phone app without Orbit.
//   npm run mock            -> prints a pairing URI + QR using this machine's LAN IPs
// Copied from ide_mobile/scripts/mock-orbit.mjs with a marketing demo fleet.
// Also importable: `startMockOrbit({ port: 0 })` for tests (see tests/handshake.test.ts).
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import nacl from "tweetnacl";
import { WebSocketServer } from "ws";

const require = createRequire(import.meta.url);

export const DEFAULT_PORT = 47821;
const STD = (u8) => Buffer.from(u8).toString("base64");
const URLSAFE = (u8) => Buffer.from(u8).toString("base64url");
const FROM = (s) => new Uint8Array(Buffer.from(s, "base64")); // accepts b64 and b64url

const utf8 = (s) => new TextEncoder().encode(s);
const unutf8 = (b) => new TextDecoder().decode(b);

function seal(obj, theirPk, mySk) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const c = nacl.box(utf8(JSON.stringify(obj)), nonce, theirPk, mySk);
  return { n: STD(nonce), c: STD(c) };
}
function open(sealed, theirPk, mySk) {
  const plain = nacl.box.open(FROM(sealed.c), FROM(sealed.n), theirPk, mySk);
  if (!plain) throw new Error("bad box");
  return JSON.parse(unutf8(plain));
}

export function lanHosts() {
  const hosts = [];
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) hosts.push(a.address);
    }
  }
  // Tailscale (100.64.0.0/10) last, mirroring "LAN and Tailscale addresses" in the spec.
  hosts.sort((a, b) => Number(a.startsWith("100.")) - Number(b.startsWith("100.")));
  return hosts.length ? hosts : ["127.0.0.1"];
}

// ---- fake fleet --------------------------------------------------------------------------------

function seedFleet() {
  // Marketing demo fleet: mirrors agentic_ide/src/lib/mock.ts so desktop and phone shots tell one story.
  const now = Date.now();
  const repos = [
    { id: "r1", name: "superset", path: "C:/code/superset", baseBranch: "main" },
    { id: "r2", name: "marketing-site", path: "C:/code/marketing-site", baseBranch: "main" },
  ];
  const mk = (id, repoId, name, status, agent = "claude") => ({
    id, repoId, name, branch: `steven/${name.toLowerCase().replace(/\W+/g, "-")}`, path: `C:/Users/steven/.orbit/worktrees/${id}`,
    agent, model: agent === "claude" ? "opus" : null, status,
    agentSessionId: null, issueNumber: null, createdAt: now - 86400000, updatedAt: now,
    seenSeq: 0, dismissedSeq: 0, profile: null, snoozedUntil: 0,
  });
  const workspaces = [
    mk("w1", "r1", "Fix onboarding crash", "done"),
    mk("w2", "r1", "Billing webhooks", "done", "codex"),
    mk("w3", "r1", "Refactor auth flow", "idle"),
    mk("w4", "r2", "Refresh homepage hero", "error"),
    mk("w5", "r1", "Migrate billing schema", "idle"),
    mk("w6", "r2", "Try new pricing layout", "idle", "codex"),
  ];
  const events = Object.fromEntries(workspaces.map((w) => [w.id, []]));
  const push = (wsId, event, ts = Date.now()) => {
    const list = events[wsId];
    const seq = list.length + 1;
    list.push({ seq, ts, event });
    return seq;
  };
  const turn = (wsId, user, tools, reply, age, extra = {}) => {
    push(wsId, { type: "userMessage", text: user }, now - age);
    push(wsId, { type: "turnStarted" }, now - age);
    for (const t of tools) {
      push(wsId, { type: "toolCall", id: t.id, name: t.name, input: t.input }, now - age);
      push(wsId, { type: "toolResult", id: t.id, output: t.output ?? "ok", isError: !!t.isError }, now - age);
    }
    if (reply) push(wsId, { type: "message", text: reply }, now - age);
    push(wsId, {
      type: "turnCompleted", durationMs: extra.ms ?? 74000, costUsd: extra.cost ?? 0.214,
      isError: !!extra.error, error: extra.error ?? null,
    }, now - age);
  };
  turn("w1", "The onboarding flow crashes when the org name is empty. Find the cause and fix it, with a test.", [
    { id: "t1", name: "Grep", input: { pattern: "createOrganization" }, output: "src/onboarding/submit.ts:42\nsrc/api/org.ts:17" },
    { id: "t2", name: "Read", input: { file_path: "C:/code/superset/src/onboarding/submit.ts" }, output: "…" },
    { id: "t3", name: "Bash", input: { command: "bun test src/onboarding" }, output: "1 fail: slugify(undefined)", isError: true },
    {
      id: "t4", name: "Edit",
      input: {
        file_path: "C:/code/superset/src/onboarding/submit.ts",
        old_string: `export async function submit(org: OrgInput) {
  const slug = slugify(org.name);
  return createOrganization({ ...org, slug });`,
        new_string: `export async function submit(org: OrgInput) {
  const name = org.name?.trim();
  if (!name) throw new ValidationError("Organization name is required");
  const slug = slugify(name) || generateSlug();
  return createOrganization({ ...org, name, slug });`,
      },
    },
    {
      id: "t5", name: "Write",
      input: {
        file_path: "C:/code/superset/src/onboarding/submit.test.ts",
        content: `import { submit } from "./submit";

test("rejects an empty org name", async () => {
  await expect(submit({ name: "" })).rejects.toThrow("required");
});

test("falls back to a generated slug", async () => {
  const org = await submit({ name: "!!!" });
  expect(org.slug).toMatch(/^org-[a-z0-9]{6}$/);
});
`,
      },
    },
    { id: "t6", name: "Bash", input: { command: "bun test src/onboarding" }, output: "6 pass, 0 fail" },
  ], "Found it: `slugify(org.name)` runs before validation, so an empty name reaches `name.trim()` as `undefined`.\n\n**Fix**\n- Validate the org name before slugging\n- Fall back to a generated slug\n- Added `submit.test.ts` covering the empty case\n\nAll 6 onboarding tests pass. Want me to open a PR?", 4 * 60_000);
  turn("w3", "Refactor the auth flow", [
    { id: "a1", name: "Glob", input: { pattern: "src/auth/**" }, output: "src/auth/session.ts\nsrc/auth/token.ts\nsrc/auth/cookie.ts" },
    { id: "a2", name: "Read", input: { file_path: "C:/code/superset/src/auth/session.ts" }, output: "…" },
  ], "I can split the auth flow into session and token modules.\n\nDo you want me to keep the legacy cookie path working during the migration?", 55 * 60_000, { ms: 38000, cost: 0.091 });
  turn("w2", "Make the Stripe webhook handler idempotent", [
    { id: "b1", name: "Read", input: { file_path: "C:/code/superset/src/billing/webhook.ts" }, output: "…" },
    { id: "b2", name: "Bash", input: { command: "bun test src/billing" }, output: "14 pass, 0 fail" },
  ], "Webhook retries now back off exponentially and the handler is idempotent. Added tests for duplicate delivery.", 2 * 3600_000, { ms: 121000, cost: 0.31 });
  turn("w4", "Refresh the homepage hero", [
    { id: "h1", name: "Bash", input: { command: "bun run build" }, output: "error: cannot resolve ./hero.png", isError: true },
  ], null, 3 * 3600_000, { error: "Build failed: cannot resolve ./hero.png" });
  return { repos, workspaces, events, push };
}

function summarize(wsId, events) {
  const list = events[wsId];
  const s = {
    workspaceId: wsId, lastSeq: 0, lastActivityTs: 0, lastTurnSeq: 0, lastTurnError: null,
    lastTurnInterrupted: false, lastAssistantText: null, lastUserText: null,
  };
  for (const { seq, ts, event: e } of list) {
    s.lastSeq = seq;
    s.lastActivityTs = ts;
    if (e.type === "message") s.lastAssistantText = e.text;
    if (e.type === "userMessage") s.lastUserText = e.text;
    if (e.type === "turnCompleted") {
      s.lastTurnSeq = seq;
      s.lastTurnError = e.isError ? (e.error ?? "Turn failed") : null;
      s.lastTurnInterrupted = !!e.interrupted;
    }
  }
  return s;
}

// ---- server ------------------------------------------------------------------------------------

/**
 * @param {{port?: number, host?: string, hosts?: string[], persist?: string|null, stepMs?: number,
 *          quiet?: boolean, name?: string, codeTtlMs?: number}} opts
 */
export async function startMockOrbit(opts = {}) {
  const { port = 0, host = "0.0.0.0", persist = null, stepMs = 350, quiet = true, name = os.hostname(), codeTtlMs = 5 * 60_000 } = opts;
  const log = (...a) => { if (!quiet) console.log("[mock-orbit]", ...a); };

  let saved = {};
  if (persist && fs.existsSync(persist)) {
    try { saved = JSON.parse(fs.readFileSync(persist, "utf8")); } catch { /* ignore */ }
  }
  const kp = saved.sk ? nacl.box.keyPair.fromSecretKey(FROM(saved.sk)) : nacl.box.keyPair();
  /** @type {{id:string,name:string,publicKey:string,pushToken:string|null,pairedAt:number,lastSeenAt:number}[]} */
  const devices = saved.devices ?? [];
  const save = () => { if (persist) fs.writeFileSync(persist, JSON.stringify({ sk: STD(kp.secretKey), devices }, null, 2)); };
  save();

  const fleet = seedFleet();
  const clients = new Set();
  const timers = new Map(); // wsId -> {cancel}

  let current = null; // {code, expires}
  const newCode = () => {
    current = { code: URLSAFE(nacl.randomBytes(16)), expires: Date.now() + codeTtlMs };
    return current.code;
  };
  newCode();

  const wss = new WebSocketServer({ host, port, path: "/v1" });
  await new Promise((res) => wss.once("listening", res));
  const actualPort = wss.address().port;

  const pairingUri = (hosts = opts.hosts ?? lanHosts()) =>
    `orbit://pair?v=1&pk=${URLSAFE(kp.publicKey)}&code=${current.code}&port=${actualPort}&hosts=${hosts.join(",")}&name=${encodeURIComponent(name)}`;

  const broadcast = (msg) => {
    for (const c of clients) c.send(msg);
  };
  const emitEvent = (wsId, event, durable = true) => {
    let seq = null;
    const ts = Date.now();
    if (durable) seq = fleet.push(wsId, event, ts);
    broadcast({ t: "event", workspaceId: wsId, seq, ts, event });
    return seq;
  };
  const setStatus = (wsId, status) => {
    const w = fleet.workspaces.find((x) => x.id === wsId);
    w.status = status;
    w.updatedAt = Date.now();
    broadcast({ t: "workspace", workspace: w });
  };

  function runTurn(wsId, text) {
    const steps = [];
    const at = (fn) => steps.push(fn);
    at(() => emitEvent(wsId, { type: "userMessage", text }));
    at(() => { setStatus(wsId, "running"); emitEvent(wsId, { type: "turnStarted" }); });
    // Demo turn: the phone asks the agent to ship, and it opens a draft PR.
    const say = (parts) => { for (const w of parts) at(() => emitEvent(wsId, { type: "textDelta", text: w }, false)); at(() => emitEvent(wsId, { type: "message", text: parts.join("") })); };
    const tool = (name, input, output) => {
      const id = `tc${Date.now()}${steps.length}`;
      at(() => emitEvent(wsId, { type: "toolCall", id, name, input }));
      at(() => emitEvent(wsId, { type: "toolResult", id, output, isError: false }));
    };
    say(["Pushing ", "the branch ", "and opening ", "a draft PR."]);
    tool("Bash", { command: "git push -u origin HEAD" }, "branch steven/fix-onboarding-crash set up to track origin\n");
    tool("Bash", { command: "gh pr create --draft --fill" }, "https://github.com/acme/superset/pull/827\n");
    say(["Opened draft ", "**#827** ", "fix(onboarding): ", "handle empty org name. ", "CI is running. ", "I'll ping you ", "if a check fails."]);
    at(() => emitEvent(wsId, { type: "usage", inputTokens: 1200, outputTokens: 340, cacheReadTokens: 9000, cacheWriteTokens: 0, contextTokens: 10540, contextWindow: 200000, costUsd: 0.012, model: "mock" }));
    at(() => { emitEvent(wsId, { type: "turnCompleted", durationMs: steps.length * stepMs, costUsd: 0.012, isError: false, error: null }); setStatus(wsId, "done"); });
    let i = 0;
    let timer = null;
    const tick = () => {
      if (i >= steps.length) { timers.delete(wsId); return; }
      steps[i++]();
      timer = setTimeout(tick, i <= 2 ? 50 : stepMs);
      timers.set(wsId, { cancel: () => clearTimeout(timer) });
    };
    tick();
  }

  function interrupt(wsId) {
    const t = timers.get(wsId);
    if (!t) return;
    t.cancel();
    timers.delete(wsId);
    emitEvent(wsId, { type: "turnCompleted", durationMs: null, costUsd: null, isError: false, error: null, interrupted: true });
    setStatus(wsId, "idle");
  }

  const ws404 = (id) => { const w = fleet.workspaces.find((x) => x.id === id); if (!w) throw new Error("unknown workspace"); return w; };

  function handleRpc(device, method, params) {
    switch (method) {
      case "snapshot":
        return { repos: fleet.repos, workspaces: fleet.workspaces, summaries: fleet.workspaces.map((w) => summarize(w.id, fleet.events)) };
      case "events": {
        ws404(params.workspaceId);
        const since = params.sinceSeq ?? 0;
        return fleet.events[params.workspaceId].filter((e) => e.seq > since);
      }
      case "send":
        ws404(params.workspaceId);
        if (!params.text) throw new Error("empty message");
        runTurn(params.workspaceId, params.text);
        return null;
      case "interrupt":
        ws404(params.workspaceId);
        interrupt(params.workspaceId);
        return null;
      case "markSeen": {
        const w = ws404(params.workspaceId);
        w.seenSeq = fleet.events[w.id].length;
        broadcast({ t: "workspace", workspace: w });
        return w.seenSeq;
      }
      case "registerPush":
        device.pushToken = params.token ?? null;
        save();
        log("push token", device.pushToken);
        return null;
      default:
        throw new Error("unknown method");
    }
  }

  wss.on("connection", (sock) => {
    const challenge = nacl.randomBytes(32);
    let device = null;
    let devicePk = null;
    let ready = false;
    const rawSend = (o) => sock.readyState === 1 && sock.send(JSON.stringify(o));
    const fail = (code, message) => { rawSend({ t: "error", code, message }); sock.close(); };
    const handshakeTimer = setTimeout(() => { if (!ready) sock.close(); }, 10_000);
    const client = { send: (m) => ready && rawSend({ t: "box", ...seal(m, devicePk, kp.secretKey) }) };

    rawSend({ t: "hello", v: 1, pk: STD(kp.publicKey), challenge: STD(challenge), name });
    sock.isAlive = true;
    sock.on("pong", () => { sock.isAlive = true; });

    sock.on("message", (data) => {
      let f;
      try { f = JSON.parse(data.toString()); } catch { return fail("protocol", "invalid json"); }
      if (!ready) {
        if (f.t !== "pair" && f.t !== "auth") return fail("protocol", "expected pair or auth");
        let pk, body;
        try {
          pk = FROM(f.pk);
          body = open(f.box, pk, kp.secretKey);
        } catch { return fail("bad_box", "could not open box"); }
        if (body.challenge !== STD(challenge)) return fail("bad_challenge", "challenge mismatch");
        if (f.t === "pair") {
          if (!current || body.code !== current.code) return fail("bad_code", "wrong code");
          if (Date.now() > current.expires) return fail("code_expired", "code expired");
          device = { id: `d_${URLSAFE(nacl.randomBytes(6))}`, name: body.name || "phone", publicKey: STD(pk), pushToken: null, pairedAt: Date.now(), lastSeenAt: Date.now() };
          devices.push(device);
          current = null;
          save();
          log("paired", device.name);
        } else {
          device = devices.find((d) => d.publicKey === STD(pk));
          if (!device) return fail("unknown_device", "not paired");
          device.lastSeenAt = Date.now();
          save();
        }
        devicePk = pk;
        ready = true;
        clearTimeout(handshakeTimer);
        clients.add(client);
        rawSend({ t: "ready", box: seal({ deviceId: device.id, orbit: { name, version: "mock-0.1" } }, pk, kp.secretKey) });
        return;
      }
      if (f.t !== "box") return fail("protocol", "expected box");
      let m;
      try { m = open({ n: f.n, c: f.c }, devicePk, kp.secretKey); } catch { return fail("bad_box", "could not open"); }
      if (m.t !== "rpc") return fail("protocol", "expected rpc");
      let reply;
      try {
        reply = { t: "rpc-result", id: m.id, ok: true, result: handleRpc(device, m.method, m.params ?? {}) };
      } catch (e) {
        reply = { t: "rpc-result", id: m.id, ok: false, error: String(e.message ?? e) };
      }
      client.send(reply);
    });
    sock.on("close", () => { clearTimeout(handshakeTimer); clients.delete(client); });
    sock.on("error", () => {});
  });

  const pinger = setInterval(() => {
    for (const s of wss.clients) {
      if (s.isAlive === false) { s.terminate(); continue; }
      s.isAlive = false;
      s.ping();
    }
  }, 20_000);
  pinger.unref?.();

  return {
    port: actualPort,
    publicKey: kp.publicKey,
    devices,
    fleet,
    newCode,
    uri: pairingUri,
    revoke(deviceId) {
      const i = devices.findIndex((d) => d.id === deviceId);
      if (i >= 0) devices.splice(i, 1);
      save();
    },
    closeClients() { for (const s of wss.clients) s.terminate(); },
    broadcast,
    emitEvent,
    close: () => new Promise((res) => {
      clearInterval(pinger);
      for (const t of timers.values()) t.cancel();
      for (const s of wss.clients) s.terminate();
      wss.close(() => res());
    }),
    expireCode() { if (current) current.expires = Date.now() - 1; },
  };
}

// ---- CLI ---------------------------------------------------------------------------------------

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  // `--port N` (or PORT) lets the mock run beside a real Orbit, which owns 47821.
  const portArg = process.argv.indexOf("--port");
  const port = Number(portArg > 0 ? process.argv[portArg + 1] : process.env.PORT ?? DEFAULT_PORT);
  const persist = path.resolve(process.cwd(), ".mock-orbit.json");
  const mock = await startMockOrbit({ port, persist: null, quiet: false, hosts: ["studio.localhost"], name: "Studio" });
  const qr = require("qrcode-terminal");
  const show = () => {
    const uri = mock.uri();
    console.log("\nScan this in Orbit Mobile (or paste the link):\n");
    qr.generate(uri, { small: true });
    console.log(`\n${uri}\n`);
    console.log("Press Enter for a fresh code. Ctrl+C to quit.\n");
  };
  show();
  process.stdin.on("data", () => { mock.newCode(); show(); });
  process.on("SIGINT", async () => { await mock.close(); process.exit(0); });
}
