// The pinned product story, shared by the home page and /features so the two cannot drift.
// Tags follow the v0.4.0 release: untagged = available, "Preview" = shipped in 0.4.0 as a preview,
// "Coming soon" = built after 0.4.0 and not released yet. `shot` is a file in src/assets/raw;
// planned shots that do not exist yet render as a placeholder (see "Shot list" in FEATURES-AUDIT.md).
import type { Tag } from "./features";

export interface StoryItem {
  title: string;
  body: string;
  kbd: string[];
  shot: string;
  alt: string;
  tag?: Tag;
}

export const story: StoryItem[] = [
  {
    title: "One task, one worktree.",
    body: "Start a workspace and Orbit cuts a fresh branch and worktree for it. Claude Code and Codex run side by side in their own checkouts, with live diff stats in the sidebar. Remote workspaces on an SSH host or in Docker are coming soon.",
    kbd: ["Ctrl N"],
    shot: "orbit-dark-workspace.png",
    alt: "Orbit workspace with the fleet listed in the sidebar and live diff stats.",
  },
  {
    title: "See the whole fleet.",
    body: "A fleet board shows every workspace at once, with bulk actions on several of them. A conflict forecast proposes a merge order, and a workspace can wait to start until another one lands.",
    kbd: ["Alt 8"],
    shot: "orbit-dark-fleet-board.png",
    alt: "Orbit's fleet board with several workspaces selected, a bulk action bar and conflict forecast badges.",
    tag: "Coming soon",
  },
  {
    title: "Only what needs you.",
    body: "The inbox collects every agent that asked a question, failed, or finished, plus any pull request with red checks. Suggested replies are one keystroke away. Approvals for risky agent actions are coming soon.",
    kbd: ["Alt 1", "J", "K", "E", "S"],
    shot: "orbit-dark-inbox.png",
    alt: "Orbit inbox listing agents that asked, failed, or finished.",
  },
  {
    title: "Give it a goal.",
    body: "Goal mode keeps an agent going until its acceptance checks pass, within a budget, and stops when it is stuck. The orchestrator splits one prompt into parts on Claude and Codex in parallel, cross-reviewed and merged into a lead workspace.",
    kbd: [],
    shot: "orbit-dark-goal-orchestrator.png",
    alt: "Orbit's goal card with acceptance checks beside the orchestrator's plan card assigning parts to Claude and Codex.",
    tag: "Coming soon",
  },
  {
    title: "Watch it write, then review it.",
    body: "Open Code view on any workspace and the editor follows the agent, flashing each edit, with an Activity timeline for every turn. Review (Preview) puts your agents' changes and your team's pull requests in one queue. Turn-by-turn time travel is coming soon.",
    kbd: ["Alt 2", "Alt 6"],
    shot: "orbit-dark-code-watch.png",
    alt: "Orbit Code view following an agent, with flashed edits and the Activity timeline.",
  },
  {
    title: "From fix to merge.",
    body: "Ship shows the draft PR, check status, review state, and every changed file. Fix CI and Address comments hand the failure straight back to the agent. Auto-addressed review comments, stacked PRs and a release helper are coming soon.",
    kbd: ["Ctrl Shift G"],
    shot: "orbit-dark-ship.png",
    alt: "Orbit Ship panel with the draft pull request, checks and changed files.",
  },
  {
    title: "It remembers, and works while you sleep.",
    body: "Routines send a message on a schedule, and Simplify tidies code one checked refactor at a time. Teammates take hand-offs and report back. Memory notes every agent reads, and a hand-off brief when a session restarts, are coming soon.",
    kbd: ["Alt 3"],
    shot: "orbit-dark-memory.png",
    alt: "Orbit's Memory view with a suggested note waiting for approval.",
  },
];
