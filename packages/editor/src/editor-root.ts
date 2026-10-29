import { THEME } from "@mellowcad/engine"

/**
 * The attribute that marks the editor's root (`CadWorkspace`). Its tokens, its
 * base styles and its variants are scoped to the element that carries it, and
 * its popups mount inside it, so the editor never styles or writes on the
 * host's `<html>` or `<body>`. Its stylesheet (`styles.css`), the head script
 * and a host's own CSS select it by name: it is API (`api.md`).
 */
export const EDITOR_ROOT_ATTRIBUTE = "data-mellowcad-editor"

/**
 * The tokens the root takes from the engine's THEME rather than from CSS: the
 * chrome's one accent is the grips' blue, so a mode that is on reads like the
 * drawing's own highlight, and a copy of it could drift from what the engine
 * draws.
 */
export const EDITOR_THEME_STYLE: { readonly "--active": string } = {
  "--active": THEME.grip,
}
