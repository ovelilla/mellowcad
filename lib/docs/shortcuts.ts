/**
 * The keys the editor answers, for the docs' shortcuts page: data only, held
 * to `CadRuntime.keyDown` by `lib/docs/generate.test.ts`, which presses each
 * one and checks what it did, and sweeps F1–F12 and Ctrl with a letter or a
 * digit for one the list lacks. What each does is named by its source: a
 * command by the engine's catalog, a mode by the editor's, the rest by the
 * site's messages (`Docs.shortcuts`).
 */

export interface KeyCombo {
  readonly key: string
  readonly ctrl?: true
  readonly shift?: true
}

/** A mode the editor's status bar or command line toggles, by its label there. */
export type ShortcutMode =
  | "commandHistory"
  | "objectSnap"
  | "selectionCycling"
  | "grid"
  | "ortho"
  | "snapMode"
  | "polarTracking"
  | "objectSnapTracking"
  | "commandLine"

/** What a key does that no command or mode names. */
export type ShortcutBehaviour =
  | "help"
  | "selectAll"
  | "enter"
  | "escape"
  | "recall"
  | "complete"
  | "cycle"

export type ShortcutAction =
  | { readonly command: readonly string[] }
  | { readonly mode: ShortcutMode }
  | { readonly behaviour: ShortcutBehaviour }

export interface Shortcut {
  /** Every combination that does it, the one to learn first. */
  readonly keys: readonly KeyCombo[]
  readonly action: ShortcutAction
}

export const SHORTCUT_SECTIONS = [
  {
    id: "aids",
    shortcuts: [
      { keys: [{ key: "F1" }], action: { behaviour: "help" } },
      { keys: [{ key: "F2" }], action: { mode: "commandHistory" } },
      { keys: [{ key: "F3" }], action: { mode: "objectSnap" } },
      { keys: [{ key: "F4" }], action: { mode: "selectionCycling" } },
      { keys: [{ key: "F7" }], action: { mode: "grid" } },
      { keys: [{ key: "F8" }, { key: "L", ctrl: true }], action: { mode: "ortho" } },
      { keys: [{ key: "F9" }], action: { mode: "snapMode" } },
      { keys: [{ key: "F10" }], action: { mode: "polarTracking" } },
      { keys: [{ key: "F11" }], action: { mode: "objectSnapTracking" } },
    ],
  },
  {
    id: "editing",
    shortcuts: [
      { keys: [{ key: "Z", ctrl: true }], action: { command: ["U"] } },
      {
        keys: [
          { key: "Y", ctrl: true },
          { key: "Z", ctrl: true, shift: true },
        ],
        action: { command: ["MREDO"] },
      },
      { keys: [{ key: "C", ctrl: true }], action: { command: ["COPYCLIP"] } },
      {
        keys: [{ key: "C", ctrl: true, shift: true }],
        action: { command: ["COPYBASE"] },
      },
      { keys: [{ key: "X", ctrl: true }], action: { command: ["CUTCLIP"] } },
      { keys: [{ key: "V", ctrl: true }], action: { command: ["PASTECLIP"] } },
      { keys: [{ key: "A", ctrl: true }], action: { behaviour: "selectAll" } },
      { keys: [{ key: "S", ctrl: true }], action: { command: ["QSAVE"] } },
      {
        keys: [{ key: "S", ctrl: true, shift: true }],
        action: { command: ["SAVEAS"] },
      },
      { keys: [{ key: "O", ctrl: true }], action: { command: ["OPEN"] } },
    ],
  },
  {
    id: "window",
    shortcuts: [
      {
        keys: [{ key: "1", ctrl: true }],
        action: { command: ["PROPERTIES", "PROPERTIESCLOSE"] },
      },
      {
        keys: [{ key: "0", ctrl: true }],
        action: { command: ["CLEANSCREENON", "CLEANSCREENOFF"] },
      },
      { keys: [{ key: "9", ctrl: true }], action: { mode: "commandLine" } },
    ],
  },
  {
    id: "commandLine",
    shortcuts: [
      { keys: [{ key: "Enter" }, { key: " " }], action: { behaviour: "enter" } },
      { keys: [{ key: "Escape" }], action: { behaviour: "escape" } },
      {
        keys: [{ key: "ArrowUp" }, { key: "ArrowDown" }],
        action: { behaviour: "recall" },
      },
      { keys: [{ key: "Tab" }], action: { behaviour: "complete" } },
      { keys: [{ key: " ", shift: true }], action: { behaviour: "cycle" } },
    ],
  },
] as const satisfies readonly {
  readonly id: string
  readonly shortcuts: readonly Shortcut[]
}[]

export type ShortcutSection = (typeof SHORTCUT_SECTIONS)[number]["id"]

/**
 * Keys the engine still takes but no browser hands a page, so the page does
 * not promise them. WHY: Chrome keeps Ctrl+W to close the tab, so selection
 * cycling is F4 (`CadRuntime.keyDown`, `docs/coverage/drafting-aids.md`).
 */
export const KEPT_BY_BROWSERS: readonly KeyCombo[] = [{ key: "W", ctrl: true }]
