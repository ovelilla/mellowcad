// Generated from en.json by `npm run locales`. Do not edit.
import type { ReactNode } from "react"

/** A rich tag: renders the chunks of the message it wraps. */
export type RichTag = (chunks: ReactNode) => ReactNode

/** What each message takes, by its dotted key; one absent takes nothing. */
export interface EditorValues {
  "TitleBar.undoCount": { count: number }
  "TitleBar.redoCount": { count: number }
  "Viewport.view": { name: string }
  "ShortcutMenu.repeat": { command: string }
  "Layers.setCurrentLabel": { name: string }
  "Layers.colorLabel": { name: string }
  "Layers.linetypeLabel": { name: string }
  "Layers.lineweightLabel": { name: string }
  "Layers.deleteLabel": { name: string }
  "Layers.renameLabel": { name: string }
  "Layers.dialog.nameInUse.instruction": { name: string }
  "TextStyle.current": { name: string }
  "DimStyle.current": { name: string }
  "DimStyle.newTitle": { name: string }
  "DimStyle.modifyTitle": { name: string }
  "Blocks.references": { count: number; name: string }
  "Properties.lockedObjects.content": { count: number }
}
