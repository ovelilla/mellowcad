// Generated from en.json by `npm run locales`. Do not edit.
import type { ReactNode } from "react"

/** A rich tag: renders the chunks of the message it wraps. */
export type RichTag = (chunks: ReactNode) => ReactNode

/** What each message takes, by its dotted key; one absent takes nothing. */
export interface EditorValues {
  "Viewport.view": { name: string }
  "ShortcutMenu.repeat": { command: string }
  "Layers.setCurrentLabel": { name: string }
  "Layers.colorLabel": { name: string }
  "Layers.linetypeLabel": { name: string }
  "Layers.lineweightLabel": { name: string }
  "Layers.deleteLabel": { name: string }
  "Layers.renameLabel": { name: string }
  "Layers.dialog.nameInUse.instruction": { name: string }
  "Styles.current": { value: RichTag; name: string }
  "Styles.setCurrent": { name: string }
  "Styles.rename": { name: string }
  "Styles.delete": { name: string }
  "Blocks.references": { count: number; name: string }
  "Properties.lockedObjects.content": { count: number }
}
