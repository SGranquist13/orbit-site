// Every feature that exists in Orbit and Orbit Mobile today, grouped into chapters for the
// "Everything in Orbit" section. Source of truth: agentic_ide/FEATURES.md and ide_mobile/FEATURES.md.
// Only built features belong here. Planned items and ideas stay out.
//
// Tags follow the v0.4.0 release (agentic_ide tag v0.4.0, FEATURES.md at that tag):
//   no tag / "Optional" / "Experimental" = available in 0.4.0
//   "Preview"      = shipped in 0.4.0 as a preview
//   "Coming soon"  = built after 0.4.0 (commits on next / feat/velocity), not released yet
//
// media.shot is a file in src/assets/raw/. crop is the region to show, as percentages of the
// 2560×1600 (desktop) or 1170×2532 (phone) capture: [left, top, width, height].

export type Tag = "Optional" | "Experimental" | "Preview" | "Coming soon";

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
      { title: "Open in your editor", body: "Open a workspace in VS Code, Cursor, Zed, Windsurf or JetBrains.", tag: "Preview" },
      { title: "Worktree setup", body: "Set per-repo setup and run scripts. Ignored files such as .env are copied into new worktrees, and the first message waits for setup.", tag: "Preview" },
      { title: "Best of N", body: "Run one prompt as two to four attempts. Compare checks, diff size, cost and time, then keep one and archive the rest.", tag: "Preview" },
      { title: "One worktree per task", body: "Each workspace is a real git worktree on its own branch. Agents never touch your main checkout." },
      { title: "Start in one keystroke", body: "Write the task, pick a repo, agent and model, and add a role if you want one. The agent starts the moment you hit Start.", keys: [["Ctrl", "N"]] },
      { title: "Run as many as you like", body: "Claude Code and Codex workspaces run side by side, in parallel, across repos." },
      { title: "A sidebar that tells you everything", body: "Repos, workspaces, live status, diff stats, and which agent is on each one." },
      { title: "Unread markers", body: "A workspace that finishes while you're elsewhere stays marked until you look.", tag: "Preview" },
      { title: "Desktop notifications", body: "Orbit tells you when an agent finishes or fails while the window is in the background.", tag: "Preview" },
      { title: "Jump by number", body: "The first nine workspaces are one shortcut away.", keys: [["Ctrl", "1–9"]] },
      { title: "Archive and restore", body: "Archiving removes the worktree and keeps the branch. Restore brings it back on the same branch." },
      { title: "Clean up merged work", body: "Finds worktrees whose branches have merged, shows a dry run, then clears the clean ones." },
      { title: "Names from your first prompt", body: "A small model turns your first message into a short workspace name.", tag: "Optional" },
    ],
  },
  {
    id: "fleet",
    title: "Fleet",
    lead: "See every workspace at once, and keep them from colliding.",
    media: { shot: "orbit-dark-fleet-board.png", alt: "The fleet board listing workspaces with several selected and a bulk action bar" },
    features: [
      { title: "Fleet board", body: "Every workspace on one board, with bulk actions on several at a time.", keys: [["Alt", "8"]], tag: "Coming soon" },
      { title: "Conflict forecast", body: "See which workspaces will collide, with a suggested merge order. Start a workspace after another finishes.", tag: "Coming soon" },
      { title: "Task templates and a backlog", body: "Keep reusable tasks and a per-repo backlog, started automatically when the fleet is idle.", tag: "Coming soon" },
      { title: "Remote workspaces", body: "Run a workspace on an SSH host or in a Docker container, driven from the same window.", tag: "Coming soon" },
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
      { title: "The All tab", body: "Every workspace and what it is doing right now, in one view.", tag: "Preview" },
      { title: "Build this plan", body: "When a Planner finishes, hand its plan to a Builder in one click.", tag: "Preview" },
      { title: "Remembers what you've seen", body: "Seen and dismissed state survives restarts." },
    ],
  },
  {
    id: "control",
    title: "Approvals and intake",
    lead: "Say yes to the risky part, and start work from where it begins.",
    media: { shot: "orbit-dark-approvals.png", alt: "The inbox with an approval row asking to allow or deny a risky command" },
    features: [
      { title: "Approvals inbox", body: "Risky agent actions wait for your allow or deny, in the inbox, instead of running unattended.", tag: "Coming soon" },
      { title: "Linear issues", body: "Start a workspace from a Linear issue.", tag: "Coming soon" },
      { title: "Slack mentions", body: "A mention in Slack can start a workspace.", tag: "Coming soon" },
      { title: "Debug a stack trace", body: "Paste a stack trace and Orbit starts a workspace to debug it.", tag: "Coming soon" },
    ],
  },
  {
    id: "agents",
    title: "Agents and chat",
    lead: "Claude Code and Codex, driven natively, in one transcript.",
    media: { shot: "orbit-dark-workspace-tools.png", crop: [23, 5, 60, 60], alt: "A workspace transcript with an expanded group of tool calls" },
    features: [
      { title: "Dictation", body: "Use the mic button or hold Ctrl+Shift+Space. Local Whisper puts your words at the chat cursor.", keys: [["Ctrl", "Shift", "Space"]], tag: "Preview" },
      { title: "Hands-free mode", body: "Talk, pause, and it sends. Replies are read aloud while the agent writes. Talk over it or say stop to interrupt; coughs and ums are ignored.", tag: "Preview" },
      { title: "Natural read-aloud", body: "Kokoro runs on your computer with eight voices to choose from. Windows voices are the fallback.", tag: "Preview" },
      { title: "Set up voice", body: "A one-time download dialog installs speech recognition and the natural voice together. Audio is never uploaded or saved.", tag: "Preview" },
      { title: "Voice tidy-up", body: "Optionally turn dictation into a clean prompt in Settings > Models > Voice tidy-up. Only transcript text goes to the model you choose.", tag: "Preview" },
      { title: "Images and files in chat", body: "Paste, drop or attach images and files. Images reach Claude and Codex natively; files arrive as paths. Browse thumbnails, file chips and a lightbox." },
      { title: "Images from the agent", body: "See screenshots the agent reads, Codex image views and generated images, and markdown images in the chat.", tag: "Preview" },
      { title: "Live agent plan", body: "The agent's own plan stays above the chat with live progress and a count in the sidebar.", tag: "Preview" },
      { title: "Model lists from the CLIs", body: "Choose from the Codex catalog, Claude aliases or a custom model ID. Refresh in Settings > Agents or the palette." },
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
      { title: "Time travel", body: "Step through any run turn by turn in the Code view, and see the files as they were at each turn.", tag: "Coming soon" },
      { title: "Search every transcript", body: "Find anything any agent said or did, across all your runs.", tag: "Coming soon" },
      { title: "Share a run", body: "Export a run as a single HTML page to send to a teammate.", tag: "Coming soon" },
      { title: "Diff comments", body: "Comment on lines or a range in the diff, then send all comments to the agent as one message.", tag: "Preview" },
      { title: "Live typing", body: "See the agent's edits stream into the editor as they are written, before they reach disk.", tag: "Preview" },
      { title: "Open any folder", body: "A repo, any workspace's worktree, or a folder on disk.", keys: [["Alt", "2"]] },
      { title: "A real editor", body: "CodeMirror, themed for Void and Paper, with quick open, find and replace, and go to line.", keys: [["Ctrl", "P"]] },
      { title: "Watch mode", body: "The editor follows the agent to the file it is changing and flashes changed lines as edits land. It stays read-only while the agent runs." },
      { title: "Watch an agent", body: "Open a folder with no agent on it and pick any workspace to follow from the Watch an agent menu.", tag: "Preview" },
      { title: "Activity timeline", body: "Every turn's edits with + and − counts. Click one to diff it against the start of that turn." },
      { title: "Manual mode", body: "No following. If a file you are editing changes on disk, choose Reload, Keep mine or Compare.", tag: "Preview" },
      { title: "Ask about selection", body: "Send the selected lines and a question to the folder's workspace, or start a new one.", keys: [["Ctrl", "I"]] },
      { title: "Integrated terminal", body: "Several tabs, in your own shell.", keys: [["Ctrl", "`"]] },
      { title: "Project search", body: "Regex, case, whole word and globs, with results grouped by file.", keys: [["Ctrl", "Shift", "F"]] },
      { title: "Git gutter and diffs", body: "Changed lines are marked in the gutter, with a side-by-side diff against HEAD or the base branch." },
      { title: "Open in Code", body: "From the chat header, the Ship panel's changed files, or the palette." },
      { title: "Editor settings", body: "Font size, tabs, word wrap, autosave and whether to follow the agent.", tag: "Preview" },
    ],
  },
  {
    id: "review",
    title: "Review",
    lead: "Your agents' changes and your pull requests, in one queue.",
    media: { shot: "orbit-dark-review-pr.png", alt: "The Review view on a GitHub pull request with inline comments and a file list" },
    features: [
      { title: "One review queue", body: "Workspaces with changes and GitHub pull requests waiting on you, with a sidebar badge for review requests.", keys: [["Alt", "6"]], tag: "Preview" },
      { title: "Review your agent's work", body: "Read a workspace's changes against its base, file by file. Comment on any line, a range or a removed line, then send everything to the agent as one message.", tag: "Preview" },
      { title: "Mark reviewed", body: "See when the agent changes a workspace again after you reviewed it.", tag: "Preview" },
      { title: "Review GitHub pull requests", body: "Open by link or number. Comment on either side, suggest changes, reply to and resolve threads, and mark files viewed.", tag: "Preview" },
      { title: "Submit your review", body: "Comment, Approve or Request changes, with a summary. Your pending review is saved on GitHub as you write it.", tag: "Preview" },
      { title: "Careful diffs", body: "Unified or split, syntax highlighting, word-level changes, and hide whitespace with W.", keys: [["W"]], tag: "Preview" },
      { title: "Since your last review", body: "See only what changed since you last looked, or one commit at a time.", tag: "Preview" },
      { title: "Images, Markdown and SVG", body: "Image diffs side by side, swipe or onion skin, and rendered Markdown and SVG.", tag: "Preview" },
      { title: "Check out and merge", body: "Check a PR out into a workspace, request reviewers, mark it ready and merge from the review.", tag: "Preview" },
      { title: "Open in Code", body: "Jump to the Code view at the line you're reading.", keys: [["O"]], tag: "Preview" },
    ],
  },
  {
    id: "goals",
    title: "Goals and orchestration",
    lead: "Set the outcome, and let the agents work to it.",
    media: { shot: "orbit-dark-goal-orchestrator.png", alt: "A goal card with acceptance checks next to an orchestrator plan card assigning parts to Claude and Codex" },
    features: [
      { title: "Goal mode", body: "Give an objective and acceptance checks. The agent keeps going within a budget, and stops when it is stuck so you can take over.", tag: "Coming soon" },
      { title: "Test-first gate", body: "Optionally require a failing test first, then the implementation.", tag: "Coming soon" },
      { title: "Orchestrator", body: "One prompt becomes parts that run on Claude and Codex in parallel, are cross-reviewed by the other agent, and merge into a lead workspace.", tag: "Coming soon" },
      { title: "Falls back at a plan limit", body: "When one agent hits its limit, the work moves to the other.", tag: "Coming soon" },
      { title: "Pair mode", body: "A cheap watcher model flags problems in the agent's edits as they happen.", tag: "Coming soon" },
      { title: "Live preview", body: "A preview panel per workspace, with a screenshot after each turn.", tag: "Coming soon" },
    ],
  },
  {
    id: "memory",
    title: "Memory",
    lead: "Agents that remember how your team works.",
    media: { shot: "orbit-dark-memory.png", alt: "The Memory view with a suggested note waiting for approval" },
    features: [
      { title: "Shared notes", body: "Personal and per-repo notes that every agent reads.", keys: [["Alt", "7"]], tag: "Coming soon" },
      { title: "Suggested notes", body: "After a turn, Orbit suggests notes worth keeping. You approve each one.", tag: "Coming soon" },
      { title: "Hand-off brief", body: "Start a new session and the agent gets a brief of where things stand. Orbit nudges you from the inbox when context is nearly full.", tag: "Coming soon" },
    ],
  },
  {
    id: "profiles",
    title: "Profiles and skills",
    lead: "Give each agent a job, and the tools for it.",
    media: { shot: "orbit-dark-packs.png", crop: [42.5, 5.5, 46, 63], alt: "The Skill packs dialog with the bundled shipkit pack and an installed pack" },
    features: [
      { title: "Optional roles", body: "New workspaces start with no role. Use + Add role, set a default in Settings > General, or choose No role in the chat footer.", tag: "Preview" },
      { title: "Skills per workspace", body: "Turn enabled skill packs off for individual workspaces; skills and profiles follow that selection.", tag: "Preview" },
      { title: "Shared MCP servers", body: "Add stdio or HTTP servers once for Claude and Codex in Settings > MCP servers. Test or import them, with workspace toggles for new sessions.", tag: "Preview" },
      { title: "Six profiles", body: "Builder, Debugger, Planner, Reviewer, Shipper and Ticket writer, plus Chief as a teammate. Packs can add more." },
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
      { title: "Teammate memory", body: "Each teammate keeps a notes file it reads and adds to. You can edit it." },
      { title: "Chief plans the work", body: "A vague request becomes a plan card with parts. Start all, edit or cancel it." },
      { title: "Parts that wait", body: "A part that depends on another starts when that one finishes, and you get one combined report." },
      { title: "Hand-offs", body: "A finished report suggests the next teammate, like Planner to Builder to Reviewer. Or pick one from Hand to…" },
      { title: "Teammates own routines", body: "Each run shows up in their thread, marked Scheduled." },
      { title: "Avatars and status", body: "A colourful avatar and a status dot on each teammate, and a badge when one needs you.", tag: "Preview" },
      { title: "Draft PRs only", body: "Teammates open draft PRs; merging is yours." },
    ],
  },
  {
    id: "context",
    title: "Context and usage",
    lead: "See what each session costs, before it costs too much.",
    media: { shot: "orbit-dark-context.png", crop: [56, 61.5, 37, 36.5], alt: "The context meter popover showing this session's tokens and cost" },
    features: [
      { title: "Plan limits", body: "See Claude and Codex five-hour and weekly limits in Settings > Usage, with a warning in the composer near the limit.", tag: "Preview" },
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
      { title: "Stacked PRs", body: "Split a change into a stack of pull requests, and restack as the lower ones merge.", tag: "Coming soon" },
      { title: "Auto-address review comments", body: "New comments on a PR are handed to the agent, which fixes, replies and resolves the thread.", tag: "Coming soon" },
      { title: "Release helper", body: "For your own repos: bump the version, write the changelog from merged PRs, and tag.", tag: "Coming soon" },
      { title: "AI review after Ship", body: "Enable a read-only Claude review in Settings > Git > Review. Read findings in Orbit, send them to the agent or post them to the PR.", tag: "Preview" },
      { title: "Ship", body: "One click commits, pushes and opens a draft pull request with a written summary.", keys: [["Ctrl", "Shift", "G"]] },
      { title: "A live PR card", body: "Checks with the failing names, review decision and changed files. It refreshes while checks run.", tag: "Preview" },
      { title: "Fix CI", body: "Syncs the branch, reads the failing logs, fixes and pushes. From the Ship panel or the inbox." },
      { title: "Address comments, rebase, push", body: "Each is one button that hands the work back to the agent." },
      { title: "Ready and merge", body: "Mark ready for review, then squash and merge. Merge stays locked until checks are green." },
      { title: "Preflight", body: "Before you ship, a check of every boundary you changed, with a Safe, Risky or Breaking verdict and the callers it found." },
      { title: "Issues panel", body: "Search your repo's issues and start one. Enter starts the work, P asks a Planner for a plan.", keys: [["Alt", "5"]] },
      { title: "Issues become branches", body: "Starting from an issue names the branch after it and closes it from the PR." },
      { title: "Issues from Linear and Slack", body: "Linear issues and Slack mentions can start workspaces, and a pasted stack trace starts a debugging one.", tag: "Coming soon" },
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
      { title: "Checks after every turn", body: "Run your checks when a turn ends, with optional automatic fix retries.", tag: "Coming soon" },
      { title: "Rewind or branch", body: "Return a workspace to an earlier turn, or branch a new workspace from it by hovering over one of your messages.", tag: "Preview" },
      { title: "Save points", body: "After every turn that changes files, Orbit commits a save point. Undo last turn rolls one back." },
      { title: "Squashed before Ship", body: "Unpushed save points fold into one clean commit before the PR opens." },
      { title: "Checks before Ship", body: "Orbit runs your checks first. Off, warn, or block, with Fix and Ship anyway in the inbox." },
      { title: "A check command per repo", body: "Detected automatically and overridable, with a timeout. Installs dependencies once if a worktree needs them." },
      { title: "Auto-sync", body: "Idle, clean workspaces rebase onto the latest base. Conflicts land in the inbox as Needs sync.", tag: "Preview" },
      { title: "Overlap detection", body: "See when two live workspaces touch the same files. After a merge, the overlapping ones sync first.", tag: "Preview" },
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
      { title: "Weekly simplify", body: "A routine that sweeps the week's changes on main and opens a draft PR with the results.", tag: "Preview" },
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
      { title: "Ollama or any OpenAI-compatible server", body: "Point Orbit at a local server and see its status and installed models.", tag: "Preview" },
      { title: "A model per task", body: "Inbox suggestions, workspace names, commit messages, routine summaries and PR drafts can each use a different model.", tag: "Preview" },
      { title: "Falls back gracefully", body: "If the local model is slow or down, the task falls back instead of failing." },
      { title: "Use local for everything", body: "One switch moves every background task off the cloud." },
      { title: "Agents on local models", body: "Run Claude Code or Codex against a local model from the New workspace picker.", tag: "Experimental" },
    ],
  },
  {
    id: "mobile",
    title: "Orbit Mobile",
    lead: "The fleet, in your pocket. The iPhone app is in development; the desktop side is in Preview.",
    media: { shot: "mobile-workspaces.png", phone: "mobile-activity.png", alt: "Orbit Mobile's workspaces dashboard and a workspace's activity timeline" },
    features: [
      { title: "Pair with a QR code", body: "Scan the code in Orbit's settings, or paste the pairing link." },
      { title: "End-to-end encrypted", body: "After the handshake every message is sealed." },
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
      { title: "VS Code keybindings", body: "The default VS Code map, Ctrl+K chords included. Rebind any command in Settings, with search and a warning when two keys collide.", keys: [["Ctrl", "K"], ["Ctrl", "S"]], tag: "Preview" },
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

// Counts. A feature is "released" when it ships in v0.4.0 (available or Preview). "Coming soon" ones are
// built but not released, and are never counted in featureCount or areaCount.
export const isSoon = (f: Feature) => f.tag === "Coming soon";
export const releasedIn = (c: Chapter) => c.features.filter((f) => !isSoon(f)).length;
export const featureCount = chapters.reduce((n, c) => n + releasedIn(c), 0);
export const previewCount = chapters.reduce((n, c) => n + c.features.filter((f) => f.tag === "Preview").length, 0);
export const availableCount = featureCount - previewCount;
export const soonCount = chapters.reduce((n, c) => n + c.features.filter(isSoon).length, 0);
// Areas with at least one released feature (chapters made only of coming-soon features are not counted).
export const areaCount = chapters.filter((c) => releasedIn(c) > 0).length;
