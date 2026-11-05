import type { DemoScript } from "@mellowcad/engine"

import type { FigureSpec } from "../../figures"

/**
 * The sessions of the commands' own pages (`/docs/commands/offset`), one file
 * per command: each runs its command the way its page explains it, as a
 * portable script — global names with `_`, keywords by id — so the engine
 * draws it and writes its history in every command language. The main one is
 * named after the command's slug (`offset`); one more for an option where a
 * figure says more (`hatchPatterns`) is named after it too.
 */
export type CommandSessions = Record<
  string,
  { readonly figure: FigureSpec; readonly from?: string }
>

/** The size of a command's session, as the docs' other sessions. */
export const COMMAND_FIGURE = {
  width: 320,
  height: 200,
  padding: 20,
} satisfies Omit<FigureSpec, "script"> & { script?: DemoScript }
