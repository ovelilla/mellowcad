import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"

import { CommandLine } from "./command-line"

/** The command line through the server renderer, against a stand-in engine. */
function render(command: string | null): string {
  const commandLine = {
    visible: true,
    historyOpen: false,
    prompt: command ? `${command} Select objects:` : "Command:",
    buffer: "",
    suggestions: [],
    lines: [],
    recent: [],
    command,
    lang: "en",
  }
  const engine = {
    subscribe: () => () => {},
    getState: () => ({ commandLine }),
  } as unknown as CadEngine
  const state = { commandLine } as unknown as EditorState
  return renderToString(createElement(CommandLine, { engine, state }))
}

describe("the command line's field", () => {
  // desktop regions/d01-1, d01-2, d02-1: `Type a command` only at `Command:`,
  // an empty field after `REGION Select objects:`.
  it("shows its placeholder only while no command runs (desktop regions/d01-2)", () => {
    expect(render(null)).toContain("placeholder=")
    expect(render("REGION")).not.toContain("placeholder=")
  })
})
