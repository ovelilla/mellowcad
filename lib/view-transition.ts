/**
 * The view transition between the landing and the editor, a cross-document
 * one since they are two root layouts: the hero's sheet grows into the canvas.
 * Both stylesheets time the `drawing-sheet` group by that literal name.
 */

/** The name the hero's sheet and the editor's canvas share for the trip. */
export const SHEET_TRANSITION = "drawing-sheet"

/**
 * The editor's element with that name, which its layout waits for before the
 * first frame (`<link rel="expect">`). Otherwise Chrome paints the editor
 * before the parser reaches it — the theme script ahead of it holds the parser
 * until the stylesheet loads — the transition finds nothing to grow into, and
 * the hero only fades out where it stood.
 */
export const EDITOR_SHEET_ID = "editor-sheet"

/**
 * The cross-document opt-in, inlined into each root layout's `<head>`. From a
 * stylesheet it raced the new page's first style pass, and Chrome skipped about
 * one transition in five ("ViewTransition opt-in disabled").
 */
export const VIEW_TRANSITION_OPT_IN =
  "@media (prefers-reduced-motion: no-preference){@view-transition{navigation:auto}}"
