import type { CommandLineController } from "./CommandLine"

/** What a line keyed in at the command window typed, and where the engine said no. */
export interface KeyedInLine {
  /**
   * What the command window wrote meanwhile, a history line each: the
   * commands echoed, each question with its answer, what the commands
   * reported.
   */
  readonly lines: readonly string[]
  /** The answer the engine refused; null when it took the whole line. */
  readonly refused: RefusedAnswer | null
}

export interface RefusedAnswer {
  /** As typed: `foo`, or `CHAIR` that `Command:` does not know. */
  readonly answer: string
  /** The first line of the refusal: `Point or option keyword required.` */
  readonly message: string
  /** What followed it on the line, never typed. */
  readonly untyped: string
}

/**
 * Types `line` in the command window key by key and presses Enter, through
 * the field's own two inputs: `type` replaces what is typed, `key` sends a
 * key that acts and says whether the engine took it. A Space the engine does
 * not take (in a text) is typed as a character. Stops at the first answer the
 * command window answers with an error.
 */
export function keyInLine(
  line: string,
  commandLine: CommandLineController,
  type: (text: string) => void,
  key: (key: string) => boolean
): KeyedInLine {
  if (/[\r\n]/.test(line)) {
    throw new Error("keyIn types one line: key each line in apart.")
  }
  const start = commandLine.mark()
  const written = (since: number) => {
    const count = commandLine.mark() - since
    return count === 0 ? [] : commandLine.getLines().slice(-count)
  }
  for (let at = 0; at <= line.length; at++) {
    const pressed = at < line.length ? line[at] : "Enter"
    if (pressed !== " " && pressed !== "Enter") {
      type(commandLine.getBuffer() + pressed)
      continue
    }
    const answer = commandLine.getBuffer().trim()
    const mark = commandLine.mark()
    if (!key(pressed)) {
      type(commandLine.getBuffer() + pressed)
      continue
    }
    const refusal = written(mark).find((entry) => entry.kind === "error")
    if (refusal) {
      return {
        lines: written(start).map((entry) => entry.text),
        refused: {
          answer,
          message: refusal.text,
          untyped: line.slice(at + 1),
        },
      }
    }
  }
  return {
    lines: written(start).map((entry) => entry.text),
    refused: null,
  }
}
