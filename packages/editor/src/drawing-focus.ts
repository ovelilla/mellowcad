import type { CadEngine } from "@mellowcad/engine"

const MODAL_DIALOG = '[role="dialog"][aria-modal="true"]'

/**
 * A popup's `finalFocus` that gives the drawing its keys back once the popup
 * has closed. WHY not `focusSurface()` as the pick acts: a modal list leaves
 * the page inert until it has closed, the call is lost and Base UI hands
 * focus to the trigger — where the next key is the trigger's, not a
 * command's: a letter picks the list's next entry that starts with it, Space
 * and the arrows open the list again. It returns false, so Base UI focuses
 * nothing itself. For a modal list only (a `Select`, a `Menu`): Base UI runs
 * it on every close, and a popover that is not modal also closes on a press
 * elsewhere, whose focus it would take.
 */
export function drawingFocus(
  engine: Pick<CadEngine, "focusSurface">
): () => false {
  return () => {
    // WHY: Base UI runs it once the popup has unmounted, after its exit
    // animation, when a dialog the pick opened (the application menu's
    // Units, Save As) may already hold the focus: that dialog keeps it.
    const held = globalThis.document?.activeElement
    if (!held?.closest(MODAL_DIALOG)) engine.focusSurface()
    return false
  }
}
