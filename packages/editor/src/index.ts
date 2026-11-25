/**
 * Each `// @group` heads the exports below it in `packages/editor/api.md`, the
 * reference the docs serve: a name joins the group a host would look for it in.
 */

// @group The editor
export {
  CadEditor,
  type CadEditorComponents,
  type CadEditorProps,
  type HelpLinks,
} from "./cad-editor"
export { paletteLayoutScript } from "./palette-layout"
export { ribbonLayoutScript } from "./ribbon-layout"

// @group Pieces
export type { PieceProps } from "./piece"
export { CommandLine } from "./command-line"
export { DynamicInput } from "./dynamic-input"
export { NavigationBar } from "./navigation-bar"
export { PaletteContent } from "./palette-content"
export type { PaletteProps } from "./palettes"
export { StatusBar, type StatusBarProps } from "./status-bar"
export { Ribbon } from "./ribbon"
export {
  useRibbonLayout,
  type RibbonLayoutControl,
} from "./ribbon-layout-context"
export type {
  RibbonLayout,
  RibbonMinimizeMode,
  RibbonState,
} from "./ribbon-layout"
export { TitleBar, type TitleBarProps } from "./title-bar"
export { ViewCube } from "./view-cube"
export { ViewportControls } from "./viewport-controls"

// @group Languages
export type { EditorLocale } from "./locales/types"
