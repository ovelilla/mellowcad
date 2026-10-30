import {
  engineText,
  transcript,
  type EngineLocale,
  type EngineText,
  type TranscriptLine,
} from "@mellowcad/engine"

import { DOCS_SESSIONS, type DocsSessionId } from "@/content/figures"
import { renderFigure, type RenderedFigure } from "@/lib/plot"

export interface RenderedSession {
  readonly figure: RenderedFigure
  /** Its history from the command it is about on; empty for a live figure. */
  readonly lines: readonly TranscriptLine[]
  readonly text: EngineText
}

/**
 * A `<Session>` of a written page, recorded in the page's language: its
 * figure, and its history as the command line writes it from the command it
 * shows on (`DOCS_SESSIONS`).
 */
export async function renderSession(
  id: DocsSessionId,
  locale: EngineLocale | undefined
): Promise<RenderedSession> {
  const session: { figure: (typeof DOCS_SESSIONS)[DocsSessionId]["figure"]; from?: string } =
    DOCS_SESSIONS[id]
  const figure = await renderFigure({ ...session.figure, locale })
  const text = engineText(locale)
  if (!session.from) return { figure, lines: [], text }
  const lines = transcript(figure.recording)
  // The command as its language names it (DESFASE in Spanish).
  const [name] = text.commandNames(session.from)
  const start = lines.findIndex((line) => line.kind === "command" && line.text === name)
  return { figure, lines: lines.slice(Math.max(start, 0)), text }
}

/** A history line as the command line writes it. */
export function historyLine(line: TranscriptLine, text: EngineText): string {
  if (line.kind === "command") return `${text.idlePrompt()} ${line.text}`
  if (line.kind === "input") return line.text ? `${line.prompt} ${line.text}` : line.prompt
  return line.text
}

/** Whether `id` names a session, for a page's `<Session name>`. */
export function isSession(id: string): id is DocsSessionId {
  return id in DOCS_SESSIONS
}
