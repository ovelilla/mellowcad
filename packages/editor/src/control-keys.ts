import type { KeyboardEvent } from "react"

import type { CadEngine } from "@mellowcad/engine"

/**
 * The keys a bar's control keeps (the ribbon's, the title bar's), as the
 * palettes' do: stopped in the capture, or the engine's listener on the
 * document runs them too — Delete on a closed drop-down erased the
 * selection, Enter on a button repeated the last command before the click.
 * Its popups' lists and menus (portalled, reached through React) keep theirs:
 * the engine leaves those alone, and a stop here would starve Base UI's.
 */
export function keepControlKeys(
  event: KeyboardEvent<HTMLElement>,
  engine: Pick<CadEngine, "focusSurface">
): void {
  const target = event.target as HTMLElement
  if (target.closest('[role="listbox"], [role="menu"]')) return
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault()
    event.stopPropagation()
  } else if (
    (event.key === "Enter" || event.key === " ") &&
    target.closest("button")
  ) {
    // Its default action, the click, is kept.
    event.stopPropagation()
    // But a tab's: a composite item, Base UI clicks it from its own key-down,
    // which the stop starves, and cancels the native click on Space's key-up.
    const tab = target.closest<HTMLElement>('[role="tab"]')
    if (tab) {
      event.preventDefault()
      tab.click()
    }
  } else if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    // A letter types a command, as on the drawing, which takes the keys after
    // it: the Enter that ends the command is the engine's, not a click on the
    // control.
    engine.focusSurface()
  }
}
