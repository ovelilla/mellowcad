import type { DrawingStore } from "@mellowcad/engine"

import { fitsScriptLimits } from "@/lib/command-script"

/**
 * A link that opens the editor and types a script of commands in it
 * (`/draw#run=CIRCLE+0,0+50;LINE+0,0+100,0%0A`): what the MCP server answers
 * an agent with (`docs/next-mcp.md`). The script travels in the fragment,
 * which no server sees, and is written to stay legible: a space is `+` and
 * a line break `;`, as an AutoCAD menu macro writes Enter.
 */

/** The fragment's parameter holding the script. */
export const RUN_PARAM = "run"

/**
 * What else may stay unescaped: what a point or an angle is written with.
 * `(`, `)`, `'`, `!` and `*` encodeURIComponent leaves are escaped, since a
 * Markdown link ends at `)`. An autolink drops every punctuation mark it
 * ends on, a script's last Enters (`;;`) too, which would leave its last
 * command asking: the link's end is escaped.
 */
const LEGIBLE: Readonly<Record<string, string>> = {
  "%2C": ",",
  "%40": "@",
  "%3A": ":",
  "%2F": "/",
  "%3D": "=",
}

const escaped = (c: string): string =>
  `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")}`

export function encodeScript(script: string): string {
  return encodeURIComponent(script.replace(/\r\n?/g, "\n"))
    .replace(/[()'!*]/g, escaped)
    .replace(/%2C|%40|%3A|%2F|%3D/g, (code) => LEGIBLE[code])
    .replace(/%20/g, "+")
    .replace(/%0A/g, ";")
    .replace(/[;.,:_~]+$/, (end) =>
      [...end].map((c) => (c === ";" ? "%0A" : escaped(c))).join("")
    )
}

/** The script a link carries, or null for text that is no script's. */
export function decodeScript(encoded: string): string | null {
  try {
    return decodeURIComponent(
      encoded.replace(/\+/g, "%20").replace(/;/g, "%0A")
    )
  } catch {
    return null
  }
}

/** The editor's URL that types `script`: `editor` and the fragment. */
export function runHref(editor: string, script: string): string {
  const url = new URL(editor, "https://host.invalid")
  return `${url.pathname}${url.search}#${RUN_PARAM}=${encodeScript(script)}`
}

/**
 * The script a page's fragment carries (`#run=…`), or null: none, one that
 * does not decode, or one longer than a run takes.
 */
export function scriptOfHash(hash: string): string | null {
  for (const part of hash.replace(/^#/, "").split("&")) {
    const at = part.indexOf("=")
    if (at < 0 || part.slice(0, at) !== RUN_PARAM) continue
    const script = decodeScript(part.slice(at + 1))
    return script !== null && fitsScriptLimits(script) ? script : null
  }
  return null
}

/** A link of the page's that keeps the script open: the editor in another language. */
export function withRun(href: string, script: string): string {
  const url = new URL(href, "https://host.invalid")
  return runHref(`${url.pathname}${url.search}`, script)
}

/**
 * Where this browser keeps the drawing a link typed, with the script it was
 * typed from: one place, never the editor's own autosave, so a link neither
 * reads nor writes the drawing someone was working on, and `/draw` alone
 * brings that back. One, not one per script as an exercise has: links have
 * no end, and a full storage would silence the autosave. Script and drawing
 * in one entry, so two tabs on two links never show one the other's
 * drawing. FROZEN: a renamed key forgets the drawing left there.
 */
const RUN_KEY = "mellowcad:run:v1"

interface RunEntry {
  readonly script: string
  readonly drawing: string
}

/** The store a link's drawing lives in, and whether its script is still to type. */
export interface RunDrawing {
  readonly store: DrawingStore
  /**
   * True when the place holds another script's drawing, or none: the script
   * is typed once the engine is up. False on a reload, or a return to the
   * link, which find the drawing as it was left.
   */
  readonly pending: boolean
}

/**
 * The place for `script`'s drawing in `storage`. Storage blocked or full (a
 * private window) keeps nothing, and the script is typed on each visit.
 */
export function runDrawing(script: string, storage: () => Storage): RunDrawing {
  const held = (): string | null => {
    try {
      const entry = JSON.parse(
        storage().getItem(RUN_KEY) ?? "null"
      ) as Partial<RunEntry> | null
      return entry?.script === script && typeof entry.drawing === "string"
        ? entry.drawing
        : null
    } catch {
      return null
    }
  }
  return {
    pending: held() === null,
    store: {
      read: held,
      write(drawing: string): void {
        try {
          const entry: RunEntry = { script, drawing }
          storage().setItem(RUN_KEY, JSON.stringify(entry))
        } catch {
          // as the port's contract: a failed autosave is quiet
        }
      },
    },
  }
}
