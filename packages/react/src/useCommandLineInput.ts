"use client"

import { type ChangeEvent, type KeyboardEvent, useCallback } from "react"
import type { CadEngine } from "@mellowcad/engine"

import { useEngineSelector } from "./useEditorState"

/** What the command line's `<input>` is spread with. */
interface CommandLineInputProps {
  readonly value: string
  readonly onChange: (event: ChangeEvent<HTMLInputElement>) => void
  readonly onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  // WHY: the browser's own list would take the arrows that recall commands.
  readonly autoComplete: "off"
  readonly spellCheck: false
}

/**
 * The command line's field, wired to the engine's buffer: what is typed there
 * and on the drawing is the same text. Its keys are the engine's
 * (`commandLineKey`: Space as Enter, the arrows' history, Tab's completion),
 * and the browser's action is prevented for every key the engine takes.
 */
export function useCommandLineInput(engine: CadEngine): CommandLineInputProps {
  const value = useEngineSelector(engine, (state) => state.commandLine.buffer)
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      engine.setCommandLineText(event.target.value),
    [engine]
  )
  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (engine.commandLineKey(event.key)) event.preventDefault()
    },
    [engine]
  )
  return { value, onChange, onKeyDown, autoComplete: "off", spellCheck: false }
}
