import type {
  CommandOptionUi,
  ShortcutMenuAction,
  ShortcutMenuEntry,
  ShortcutMenuMode,
  ShortcutMenuUi,
} from "./EngineState"
import type { Vec2 } from "../geometry/Vec2"

/**
 * What a right-click on the drawing does with SHORTCUTMENU at its initial 11:
 * the Default and Edit menus are on, and the Command menu shows "only when
 * command options are currently available at the Command prompt" — "If no
 * options are available, a right-click is the same as pressing Enter". The
 * time-sensitive right-click (16) is off by default.
 */
export function rightClickResponse(
  idle: boolean,
  selected: boolean,
  options: number
): ShortcutMenuMode | "enter" {
  if (idle) return selected ? "edit" : "default"
  return options > 0 ? "command" : "enter"
}

/**
 * The commands behind the fixed entries, run as AutoCAD's menu macros run them
 * (`_erase`): echoed at the prompt, repeated by Enter and undone like a typed
 * one. Redo's macro answers a prompt too (`_mredo 1`), so the runtime runs it.
 */
export const SHORTCUT_MENU_COMMANDS: Partial<
  Readonly<Record<ShortcutMenuAction, string>>
> = {
  cut: "_CUTCLIP",
  copy: "_COPYCLIP",
  copyBase: "_COPYBASE",
  paste: "_PASTECLIP",
  undo: "_U",
  pan: "_PAN",
  erase: "_ERASE",
  move: "_MOVE",
  copySelection: "_COPY",
  scale: "_SCALE",
  rotate: "_ROTATE",
  properties: "_PROPERTIES",
}

const action = (name: ShortcutMenuAction): ShortcutMenuEntry => ({
  kind: "action",
  action: name,
})

const CLIPBOARD: ShortcutMenuEntry = {
  kind: "submenu",
  submenu: "clipboard",
  entries: [action("cut"), action("copy"), action("copyBase"), action("paste")],
}

/**
 * The entries of each menu that exist here, in the order of AutoCAD's
 * CMDEFAULT, CMEDIT and CMCOMMAND. Left out, as nothing here does what they
 * do: Recent Input, Isolate, transparent Pan and real-time Zoom, SteeringWheels,
 * Action Recorder, Subobject Selection Filter, Quick Select, QuickCalc, Find,
 * Options, Draw Order, Add Selected, Select Similar and Quick Properties.
 * Over dimensions alone the Edit menu adds their Dimension Style ▸ (d07-1).
 */
export function buildShortcutMenu(
  mode: ShortcutMenuMode,
  at: Vec2,
  context: {
    /** The last command, which Repeat runs; null before the first. */
    readonly repeat: string | null
    readonly options: ReadonlyArray<CommandOptionUi>
    /** Whether the running question takes a point, which Snap Overrides needs. */
    readonly takesPoint: boolean
    /** Dimension Style ▸, when every selected object is a dimension. */
    readonly dimensionStyle?: Extract<
      ShortcutMenuEntry,
      { kind: "dimensionStyle" }
    > | null
  }
): ShortcutMenuUi {
  const groups: ShortcutMenuEntry[][] =
    mode === "command"
      ? [
          [action("enter"), action("cancel")],
          // "the command's options (keywords within the square brackets) are
          // inserted into this menu"
          context.options.map((option) => ({ kind: "option", option })),
          // Absent where no point is asked (desktop offset/d04-2, at
          // `Select object to offset`; shown at its distance, d04-1).
          context.takesPoint ? [{ kind: "snapOverrides" }] : [],
        ]
      : [
          context.repeat !== null ? [action("repeat")] : [],
          // The dimensions' own group (desktop d07-1); Precision ▸, Remove
          // Style Overrides and Annotative Object Scale ▸ need overrides and
          // annotative scaling, not modelled.
          mode === "edit" && context.dimensionStyle
            ? [context.dimensionStyle]
            : [],
          [CLIPBOARD],
          mode === "edit"
            ? [
                action("erase"),
                action("move"),
                action("copySelection"),
                action("scale"),
                action("rotate"),
                action("deselectAll"),
              ]
            : [action("undo"), action("redo"), action("pan")],
          mode === "edit" ? [action("properties")] : [],
        ]
  return {
    mode,
    at,
    groups: groups.filter((group) => group.length > 0),
    repeat: context.repeat,
  }
}
