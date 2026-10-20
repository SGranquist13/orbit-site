// Every feature that exists in Orbit and Orbit Mobile today, grouped into chapters for the
// "Everything in Orbit" section. Source of truth: agentic_ide/FEATURES.md and ide_mobile/FEATURES.md.
// Only built features belong here (✅ works, 🟢 built, 🟡 partial). Planned items and ideas stay out.
//
// media.shot is a file in src/assets/raw/. crop is the region to show, as percentages of the
// 2560×1600 (desktop) or 1170×2532 (phone) capture: [left, top, width, height].

export type Tag = "Optional" | "Experimental";

export interface Feature {
  title: string;
  body: string;
  keys?: string[][]; // each inner array is one shortcut, e.g. [["Ctrl", "N"]]
  tag?: Tag;
}

export interface Chapter {
  id: string;
  title: string;
  lead: string;
  media: { shot: string; crop?: [number, number, number, number]; alt: string; phone?: string };
  features: Feature[];
}

export const chapters: Chapter[] = [
  {
    id: "workspaces",
    title: "Workspaces",
    lead: "Every task gets its own worktree, branch, and agent.",
    media: { shot: "orbit-dark-new-workspace.png", crop: [25.5, 11.8, 48, 44], alt: "The New workspace dialog with a prompt, profile picker, repo, agent and model" },
    features: [
      { title: "One worktree per task", body: "Each workspace is a real git worktree on its own branch. Agents never touch your main checkout." },
      { title: "Start in one keystroke", body: "Write the task, pick repo, agent, model and profile. The agent starts the moment you hit Start.", keys: [["Ctrl", "N"]] },
      { title: "Run as many as you like", body: "Claude Code and Codex workspaces run side by side, in parallel, across repos." },
      { title: "A sidebar that tells you everything", body: "Repos, workspaces, live status, diff stats, and which agent is on each one." },
      { title: "Unread markers", body: "A workspace that finishes while you're elsewhere stays marked until you look." },
      { title: "Desktop notifications", body: "Orbit tells you when an agent finishes or fails while the window is in the background." },
      { title: "Jump by number", body: "The first nine workspaces are one shortcut away.", keys: [["Ctrl", "1–9"]] },
      { title: "Archive and restore", body: "Archiving removes the worktree and keeps the branch. Restore brings it back on the same branch." },
      { title: "Clean up merged work", body: "Finds worktrees whose branches have merged, shows a dry run, then clears the clean ones." },
      { title: "Names from your first prompt", body: "A small model turns your first message into a short workspace name.", tag: "Optional" },
    ],
  },
  {
    id: "inbox",
    title: "Attention inbox",
    lead: "One list of everything that is waiting on you.",
    media: { shot: "orbit-dark-inbox-all.png", crop: [27, 6.5, 62, 52], alt: "The inbox listing workspaces that finished, failed, asked a question or need a sync" },
    features: [
      { title: "Only what needs you", body: "Agents that finished, failed or asked a question, plus pull requests with red checks or requested changes.", keys: [["Alt", "1"]] },
      { title: "Suggested replies", body: "Each row offers next steps, from rules and from a small model. Press a number to send one." },
      { title: "Reply without leaving", body: "Answer inline, open the workspace, or dismiss it. Dismissed rows come back on new activity.", keys: [["Enter"], ["E"]] },
      { title: "Keyboard triage", body: "Move with j and k. Focus lands on the next row after every action.", keys: [["J"], ["K"]] },
      { title: "Snooze", body: "An hour, until tomorrow at 9, or next week. Snoozed rows wait in the All tab.", keys: [["S"]] },
      { title: "The All tab", body: "Every workspace and what it is doing right now, in one view." },
      { title: "Build this plan", body: "When a Planner finishes, hand its plan to a Builder in one click." },
      { title: "Remembers what you've seen", body: "Seen and dismissed state survives restarts." },
    ],
  },
  {
    id: "agents",
    title: "Agents and chat",
    lead: "Claude Code and Codex, driven natively, in one transcript.",
    media: { shot: "orbit-dark-workspace-tools.png", crop: [23, 5, 60, 60], alt: "A workspace transcript with an expanded group of tool calls" },
    features: [
      { title: "Claude Code and Codex", body: "Claude through its streaming JSON interface, Codex through its app server. Real CLIs, your own accounts." },
      { title: "Live streaming", body: "Text streams in with a caret, with a thinking indicator while the agent works." },
      { title: "Tool calls, folded", body: "Runs of tool calls collapse into one line. Expand any of them to read the output." },
      { title: "Interrupt any time", body: "Stop a turn mid-run. The workspace goes idle, with nothing lost.", keys: [["Esc"]] },
      { title: "Steer mid-turn", body: "Send a message while the agent is working. Codex takes it as a steer, Claude queues it." },
      { title: "Sessions survive restarts", body: "Quit Orbit mid-task. Every agent picks up with its context intact." },
      { title: "Workspace context", body: "Agents know their branch, the base branch, and any linked issue." },
      { title: "Model per workspace", body: "Pick the model when you start, per agent, with defaults in Settings." },
    ],
  },
  {
    id: "code",
    title: "Code view",
    lead: "An editor that watches the agent work.",
    media: { shot: "orbit-dark-code-watch.png", crop: [17, 0, 83, 58], alt: "Code view in Watch mode, with the editor following the agent, changed lines flashed and the Activity timeline listing each turn's edits" },
    features: [
      { title: "Open any folder", body: "A repo, any workspace's worktree, or a folder on disk.", keys: [["Alt", "2"]] },
      { title: "A real editor", body: "CodeMirror, themed for Void and Paper, with quick open, find and replace, and go to line.", keys: [["Ctrl", "P"]] },
      { title: "Watch mode", body: "The editor follows the agent to the file it is changing and types new files in as the agent writes them, before they reach disk. Changed lines flash as each edit lands." },
      { title: "Watch an agent", body: "Open a folder with no agent on it and pick any workspace to follow from the Watch an agent menu." },
      { title: "Activity timeline", body: "Every turn's edits with + and − counts. Click one to diff it against the start of that turn." },
      { title: "Manual mode", body: "No following. If a file you are editing changes on disk, choose Reload, Keep mine or Compare." },
      { title: "Ask about selection", body: "Send the selected lines and a question to the folder's workspace, or start a new one.", keys: [["Ctrl", "I"]] },
      { title: "Integrated terminal", body: "Several tabs, in your own shell.", keys: [["Ctrl", "`"]] },
      { title: "Project search", body: "Regex, case, whole word and globs, with results grouped by file.", keys: [["Ctrl", "Shift", "F"]] },
      { title: "Git gutter and diffs", body: "Changed lines are marked in the gutter, with a side-by-side diff against HEAD or the base branch." },
      { title: "Open in Code", body: "From the chat header, the Ship panel's changed files, or the palette." },
      { title: "Editor settings", body: "Font size, tabs, word wrap, autosave and whether to follow the agent." },
    ],
  },
  {
    id: "profiles",
    title: "Profiles and skills",
    lead: "Give each agent a job, and the tools for it.",
    media: { shot: "orbit-dark-packs.png", crop: [42.5, 5.5, 46, 63], alt: "The Skill packs dialog with the bundled shipkit pack and an installed pack" },
    features: [
      { title: "Six profiles", body: "Builder, Debugger, Planner, Reviewer, Shipper and Ticket writer. Packs can add more." },
      { title: "Read-only means read-only", body: "Planner and Reviewer are blocked from writing at the tool layer. Claude gets a strict allowlist, Codex a read-only sandbox." },
      { title: "Switch roles mid-session", body: "Change profile from the composer or palette. The agent is told its role changed." },
      { title: "shipkit, built in", body: "Ship, preflight, fix-ci, address-comments, rebase, write-ticket and start-issue, ready on day one." },
      { title: "Slash autocomplete", body: "Type / to search every skill across your packs. Tab completes.", keys: [["/"], ["Tab"]] },
      { title: "Pinned skills", body: "Your most-used skills sit as one-click chips above the composer." },
      { title: "Install packs from git", body: "Paste a URL to add a pack. Enable, disable, update or remove it later." },
      { title: "Your Claude plugins work", body: "Plugins you installed for Claude Code, like /codex:review, run inside Orbit workspaces." },
    ],
  },
  {
    id: "teammates",
    title: "Teammates",
    lead: "Hand work to a teammate, get a report back.",
    media: { shot: "orbit-dark-teammates.png", crop: [17, 0, 83, 62], alt: "The Teammates view with a list of teammates beside a thread holding a report and hand-off suggestions" },
    features: [
      { title: "Hand off a task in chat", body: "A teammate opens its own workspaces and reports back with links and a result.", keys: [["Alt", "4"]] },
      { title: "A starter team", body: "Chief, Builder, Debugger, Planner, Reviewer, Shipper and Ticket writer." },
      { title: "Make your own", body: "Create a teammate, or override a starter one and reset it later." },
      { title: "Memory", body: "Each teammate keeps a notes file it reads and adds to. You can edit it." },
      { title: "Chief plans the work", body: "A vague request becomes a plan card with parts. Start all, edit or cancel it." },
      { title: "Parts that wait", body: "A part that depends on another starts when that one finishes, and you get one combined report." },
      { title: "Hand-offs", body: "A finished report suggests the next teammate, like Planner to Builder to Reviewer. Or pick one from Hand to…" },
      { title: "Teammates own routines", body: "Each run shows up in their thread, marked Scheduled." },
      { title: "Avatars and status", body: "A status dot on each teammate, and a badge when one needs you." },
      { title: "Draft PRs only", body: "Teammates open draft PRs; merging is yours." },
    ],
  },
  {
    id: "context",
    title: "Context and usage",
    lead: "See what each session costs, before it costs too much.",
    media: { shot: "orbit-dark-context.png", crop: [56, 61.5, 37, 36.5], alt: "The context meter popover showing this session's tokens and cost" },
    features: [
      { title: "Context meter", body: "A bar and a percentage in the composer. It turns amber at 70% and red at 90%." },
      { title: "Compact or start fresh", body: "Compact the conversation, or begin a new session in the same workspace." },
      { title: "Per-turn cost", body: "Every turn ends with its duration, tokens and cost." },
      { title: "Usage report", body: "Today, 7 days, 30 days or all time. A 14-day chart, broken down by workspace and by agent." },
    ],
  },
  {
    id: "folders",
    title: "Across repos",
    lead: "Changes rarely stop at one repository.",
    media: { shot: "orbit-dark-related.png", crop: [17, 5, 34, 31], alt: "The related projects popover listing a dependency and a consumer to attach" },
    features: [
      { title: "Attach folders", body: "Give an agent other projects to read. Read-only by default.", keys: [["+ Attach"]] },
      { title: "Related projects, found for you", body: "Orbit reads package.json, Cargo.toml, pyproject and go.mod to find what uses this repo, and what it uses." },
      { title: "Edit across repos", body: "Make an attached repo editable and it gets its own worktree and branch too." },
      { title: "Always attach", body: "Per repo, the folders that should come along with every new workspace." },
    ],
  },
  {
    id: "ship",
    title: "Ship and GitHub",
    lead: "From fixed to merged without leaving Orbit.",
    media: { shot: "orbit-dark-ship.png", crop: [58.5, 0, 41.5, 62], alt: "The Ship panel showing a pull request's checks, review state and changed files" },
    features: [
      { title: "Ship", body: "One click commits, pushes and opens a draft pull request with a written summary.", keys: [["Ctrl", "Shift", "G"]] },
      { title: "A live PR card", body: "Checks with the failing names, review decision and changed files. It refreshes while checks run." },
      { title: "Fix CI", body: "Syncs the branch, reads the failing logs, fixes and pushes. From the Ship panel or the inbox." },
      { title: "Address comments, rebase, push", body: "Each is one button that hands the work back to the agent." },
      { title: "Ready and merge", body: "Mark ready for review, then squash and merge. Merge stays locked until checks are green." },
      { title: "Preflight", body: "Before you ship, a check of every boundary you changed, with a Safe, Risky or Breaking verdict and the callers it found." },
      { title: "Issues panel", body: "Search your repo's issues and start one. Enter starts the work, P asks a Planner for a plan.", keys: [["Alt", "5"]] },
      { title: "Issues become branches", body: "Starting from an issue names the branch after it and closes it from the PR." },
      { title: "Write a ticket", body: "Turn rough notes into a well-formed GitHub issue." },
      { title: "Your merge rules", body: "Choose the merge method and whether to delete the branch afterwards." },
    ],
  },
  {
    id: "trunk",
    title: "A clean trunk",
    lead: "Short branches, small commits, and nothing broken on main.",
    media: { shot: "orbit-dark-settings-git.png", crop: [39.5, 5, 53.5, 70], alt: "Git settings for save points, commit messages, squashing and checks before Ship" },
    features: [
      { title: "Save points", body: "After every turn that changes files, Orbit commits a save point. Undo last turn rolls one back." },
      { title: "Squashed before Ship", body: "Unpushed save points fold into one clean commit before the PR opens." },
      { title: "Checks before Ship", body: "Orbit runs your checks first. Off, warn, or block, with Fix and Ship anyway in the inbox." },
      { title: "A check command per repo", body: "Detected automatically and overridable, with a timeout. Installs dependencies once if a worktree needs them." },
      { title: "Auto-sync", body: "Idle, clean workspaces rebase onto the latest base. Conflicts land in the inbox as Needs sync." },
      { title: "Overlap detection", body: "See when two live workspaces touch the same files. After a merge, the overlapping ones sync first." },
      { title: "Tidy after merge", body: "Merged work archives itself, its worktree is removed and the branch deleted." },
      { title: "Stale branches surface", body: "Branches far behind base or open too long show up in the inbox." },
      { title: "Commit messages from a model", body: "Save-point messages written from the diff instead of the prompt.", tag: "Optional" },
    ],
  },
  {
    id: "simplify",
    title: "Simplify",
    lead: "Make the code simpler without changing what it does.",
    media: { shot: "orbit-dark-simplify-applying.png", crop: [58, 0, 42, 58], alt: "The Simplify panel with candidates, risk levels and two applied refactor commits" },
    features: [
      { title: "A read-only find pass", body: "Claude reads the workspace's changes and lists what could be simpler, with the reason and a risk level." },
      { title: "Applied one at a time", body: "Each candidate is its own turn. Orbit runs your checks, then commits it as refactor: or puts it back." },
      { title: "Tests are off limits", body: "Any edit that touches a test file is reverted automatically." },
      { title: "Apply all low-risk", body: "Take every low-risk change in one go, and pick the rest by hand." },
      { title: "Weekly simplify", body: "A routine that sweeps the week's changes on main and opens a draft PR with the results." },
    ],
  },
  {
    id: "routines",
    title: "Routines",
    lead: "Work that runs on a schedule.",
    media: { shot: "orbit-dark-routine-editor.png", crop: [48, 7.5, 49, 56], alt: "The routine editor with a prompt, repo, schedule and preset templates" },
    features: [
      { title: "Scheduled messages", body: "Once, hourly, daily, weekdays or weekly, with cron under Advanced.", keys: [["Alt", "3"]] },
      { title: "Fresh or standing", body: "Each run gets a new workspace, or keeps working in the same one." },
      { title: "Schedule from the composer", body: "The clock button sends the message you're writing later." },
      { title: "Run now, and history", body: "Trigger any routine on demand and see every past run." },
      { title: "Catches up", body: "Runs while Orbit is open. Missed runs catch up once on launch." },
      { title: "Quiet when there's nothing to do", body: "Runs that change nothing archive themselves and stay out of your inbox." },
      { title: "Summaries", body: "Every run ends with a short summary of what happened." },
      { title: "Templates", body: "Start from triage, nightly checks, a stale-branch sweep or weekly simplify." },
    ],
  },
  {
    id: "models",
    title: "Local models",
    lead: "Keep the small jobs on your own machine.",
    media: { shot: "orbit-dark-settings-models.png", crop: [39.5, 5, 53.5, 70], alt: "Model settings connected to a local Ollama server with three installed models" },
    features: [
      { title: "Ollama or any OpenAI-compatible server", body: "Point Orbit at a local server and see its status and installed models." },
      { title: "A model per task", body: "Inbox suggestions, workspace names, commit messages, routine summaries and PR drafts can each use a different model." },
      { title: "Falls back gracefully", body: "If the local model is slow or down, the task falls back instead of failing." },
      { title: "Use local for everything", body: "One switch moves every background task off the cloud." },
      { title: "Agents on local models", body: "Run Claude Code or Codex against a local model from the New workspace picker.", tag: "Experimental" },
    ],
  },
  {
    id: "mobile",
    title: "Orbit Mobile",
    lead: "The fleet, in your pocket.",
    media: { shot: "mobile-workspaces.png", phone: "mobile-activity.png", alt: "Orbit Mobile's workspaces dashboard and a workspace's activity timeline" },
    features: [
      { title: "Pair with a QR code", body: "Scan the code in Orbit's settings, or paste the pairing link." },
      { title: "End-to-end encrypted", body: "After the handshake every message is sealed. Works on your network or over Tailscale." },
      { title: "Inbox on the go", body: "Needs you first, with filters for input, review and errors." },
      { title: "Workspaces dashboard", body: "Active, waiting and completed, with search and a card per repo." },
      { title: "Live transcripts", body: "Chat, an activity timeline, and every file edit as +/− hunks." },
      { title: "Send and stop", body: "Answer an agent or interrupt a turn from your phone." },
      { title: "Push when a turn finishes", body: "A notification with the workspace and its status. Tap to open it." },
      { title: "You stay in control", body: "Revoke a phone from Orbit, or unpair from the phone." },
    ],
  },
  {
    id: "craft",
    title: "Look and keys",
    lead: "Quiet by design, fast by keyboard.",
    media: { shot: "orbit-dark-settings-shortcuts.png", crop: [38, 6, 55, 58], alt: "The keyboard shortcuts reference in Orbit's settings" },
    features: [
      { title: "Void and Paper", body: "A dark theme and a light one. The title bar follows.", keys: [["Ctrl", "K"], ["Ctrl", "T"]] },
      { title: "Colour means something", body: "The interface is greyscale. Colour only shows status: running, done, failed, merged." },
      { title: "VS Code keybindings", body: "The default VS Code map, Ctrl+K chords included. Rebind any command in Settings, with search and a warning when two keys collide.", keys: [["Ctrl", "K"], ["Ctrl", "S"]] },
      { title: "Command palette", body: "Jump to any workspace, run any skill or action.", keys: [["Ctrl", "Shift", "P"]] },
      { title: "Focus mode", body: "Hide the sidebar and the Ship panel. Just you and the agent.", keys: [["Ctrl", "K"], ["Z"]] },
      { title: "Ship panel on request", body: "It never opens on its own. The header shows the PR and its checks at a glance.", keys: [["Ctrl", "Shift", "G"]] },
      { title: "Collapsible sidebar", body: "Fold the sidebar down to an icon rail.", keys: [["Ctrl", "B"]] },
      { title: "Settings that save instantly", body: "Agents, Git, GitHub, models, mobile, usage and data, all in one place.", keys: [["Ctrl", ","]] },
      { title: "Agent safety controls", body: "Claude's permission mode and Codex's sandbox, with read-only profiles always enforced." },
      { title: "Diagnostics", body: "See which CLIs Orbit found, their versions, and your GitHub sign-in." },
    ],
  },
];

export const featureCount = chapters.reduce((n, c) => n + c.features.length, 0);
