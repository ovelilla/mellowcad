/**
 * The view transition between the landing and the editor, a cross-document
 * one since they are two root layouts: the hero's sheet grows into the canvas.
 * Both stylesheets time the `drawing-sheet` group by that literal name.
 */

/** The name the hero's sheet and the editor's canvas share for the trip. */
export const SHEET_TRANSITION = "drawing-sheet"

/**
 * The cross-document opt-in, inlined into each root layout's `<head>`. From a
 * stylesheet it raced the new page's first style pass, and Chrome skipped about
 * one transition in five ("ViewTransition opt-in disabled").
 */
export const VIEW_TRANSITION_OPT_IN =
  "@media (prefers-reduced-motion: no-preference){@view-transition{navigation:auto}}"
