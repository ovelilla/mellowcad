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

// @group Pieces
export type { PieceProps } from "./piece"
export { CommandLine } from "./command-line"
export { DynamicInput } from "./dynamic-input"
export { NavigationBar } from "./navigation-bar"
export { PalettePanel } from "./palette-panel"
export { StatusBar, type StatusBarProps } from "./status-bar"
export { ToolRail } from "./tool-rail"
export { TopBar, type TopBarProps } from "./top-bar"
export { ViewCube } from "./view-cube"
export { ViewportControls } from "./viewport-controls"

// @group Languages
export type { EditorLocale } from "./locales/types"
