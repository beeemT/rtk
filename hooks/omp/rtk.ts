// Oh-My-Pi RTK Extension
// Installed by: rtk init -g --omp
// Installs to: ~/.omp/agent/extensions/rtk.ts
//
// Implements Capability B only (system-prompt injection via before_agent_start).
// Capability A (tool_call command rewriting) is intentionally omitted — Oh-My-Pi's
// tool_call result type cannot replace tool-call input. Commands are not
// transparently rewritten; the extension injects RTK awareness into the system
// prompt instead. See hooks/omp/README.md.
import { execFileSync } from "node:child_process"

const MARKER = "<!-- rtk-omp -->"

const RTK_AWARENESS = [
  MARKER,
  "RTK is available as a token-saving CLI proxy. When you run shell commands, prefer `rtk <command>` for supported tools such as git, cargo, npm, pnpm, grep, find, docker, and kubectl so command output is compact before it reaches the model.",
  "",
  "Oh-My-Pi extensions can update this system prompt but cannot safely rewrite tool-call input, so choose the `rtk` prefix manually when planning shell commands. If a command is unsupported, `rtk` passes it through unchanged.",
  "<!-- /rtk-omp -->",
].join("\n")

type BeforeAgentStartEvent = {
  systemPrompt?: string
}

type PiExtensionHost = {
  on: (
    event: "before_agent_start",
    handler: (event: BeforeAgentStartEvent) => Promise<{ systemPrompt?: string }> | { systemPrompt?: string } | void,
  ) => void
}

function rtkAvailable(): boolean {
  try {
    execFileSync("rtk", ["--version"], { stdio: "ignore", timeout: 1_000 })
    return true
  } catch {
    return false
  }
}

export default function rtkOhMyPiExtension(pi: PiExtensionHost) {
  pi.on("before_agent_start", async (event) => {
    if (!rtkAvailable()) {
      return {}
    }

    const systemPrompt = typeof event.systemPrompt === "string" ? event.systemPrompt : ""
    if (systemPrompt.includes(MARKER)) {
      return { systemPrompt }
    }

    const separator = systemPrompt.length === 0 || systemPrompt.endsWith("\n") ? "" : "\n\n"
    return { systemPrompt: `${systemPrompt}${separator}${RTK_AWARENESS}` }
  })
}
