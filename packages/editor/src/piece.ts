import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"

/**
 * What a piece of the editor is handed, and so a host's replacement for it
 * (`CadEditorComponents`): the engine to call and the chrome's state. A
 * pointer field is not in `state` (`POINTER_KEYS`): read it with
 * `useEngineSelector(engine, …)` in the smallest component that shows it.
 */
export interface PieceProps {
  readonly engine: CadEngine
  readonly state: EditorState
}
