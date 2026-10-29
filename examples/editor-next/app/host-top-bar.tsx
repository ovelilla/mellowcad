"use client"

import type { TopBarProps } from "@mellowcad/editor"

const TOOLS = ["line", "circle", "rectangle"]

// It renders inside the editor's top zone and root: the editor's tokens and
// fonts reach it, and its classes are this app's Tailwind's.
export function HostTopBar({ engine, state }: TopBarProps) {
  const tools = state.tools.filter((tool) => TOOLS.includes(tool.id))
  return (
    <nav className="flex w-full items-center gap-1">
      <span className="px-2 font-semibold">My drawing app</span>
      {tools.map((tool) => (
        <button
          key={tool.id}
          className="h-7 rounded px-2 hover:bg-white/10 aria-pressed:bg-white/15"
          aria-pressed={state.activeToolId === tool.id}
          onClick={() => {
            engine.setActiveTool(tool.id)
            engine.focusSurface()
          }}
        >
          {tool.label}
        </button>
      ))}
      <span className="ms-auto px-2 font-mono">{state.entityCount}</span>
    </nav>
  )
}
