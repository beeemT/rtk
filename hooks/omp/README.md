# Oh-My-Pi Extension

> Part of [`hooks/`](../README.md) — installed by `rtk init -g --omp`

## Specifics

- TypeScript extension installed to `~/.omp/agent/extensions/rtk.ts`
- Registers `before_agent_start` and returns a replacement `systemPrompt`
- Adds an idempotent RTK awareness block guarded by `<!-- rtk-omp -->`
- No-ops if `rtk` is not available on `PATH`
- Prompt-level only: Oh-My-Pi extension results cannot mutate tool-call input, so commands are not transparently rewritten

## Behavior

The extension tells Oh-My-Pi to prefer `rtk <command>` for supported shell commands. All command rewrite and filtering logic remains in the RTK binary; this artifact only provides prompt awareness.
