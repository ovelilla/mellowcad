/**
 * Ports (hexagonal architecture): the interfaces the application core needs
 * the outside world to implement, so adapters and test fakes can plug in.
 */

/**
 * The host environment driving the engine: it schedules frames and reflects
 * interaction affordances (cursor, focus). Implemented by the DOM/canvas
 * adapter; a headless test host can be three no-ops.
 */
export interface EngineHost {
  /**
   * Asks the host to draw a frame soon. When the host is ready it pulls the
   * current {@link ../scene/types.Scene} from the runtime and presents it.
   */
  requestRender(): void
  /** Sets the pointer cursor shown over the drawing surface (CSS names). */
  setCursor(cursor: string): void
  /** Returns keyboard focus to the drawing surface (e.g. after typed input). */
  focusSurface(): void
  /**
   * Shows the help of `command`, its global name, or the help's start when
   * none is running: AutoCAD's F1. A host without it leaves F1 to its
   * platform.
   */
  showHelp?(command: string | null): void
}

/**
 * Key/value persistence for the transparent auto-save. Implemented by
 * localStorage in the browser; could be a file or IndexedDB elsewhere.
 */
export interface DrawingStore {
  /** Returns the stored drawing text, or `null` when none exists / unreadable. */
  read(): string | null
  /** Persists the drawing text. Failures must not throw (fail quietly). */
  write(text: string): void
}

/**
 * Explicit file save/open, the counterpart of {@link DrawingStore}'s implicit
 * auto-save. Implemented by a download + file picker in the browser; a host
 * embedding the engine can point it at its own backend instead.
 */
export interface FileTransport {
  /**
   * Hands a file to the user under its name: the drawing as text, what a
   * command writes beside it (MASSPROP's `.mpr`), or a DXF as bytes (SAVEAS
   * and DXFOUT: a binary one, or one up to 2004 in its code page).
   */
  save(content: string | Uint8Array, fileName: string): void
  /**
   * Asks the user for a file of the kinds `request` names — AutoCAD's Select
   * File and its Files of type: OPEN offers drawings and DXF, DXFIN DXF
   * alone. Resolves with the file's name and bytes, or with `null` when the
   * pick was cancelled; a host that reads only text may resolve with the
   * text, which serves a drawing and an ASCII DXF in UTF-8 (a binary DXF,
   * and one up to 2004 in its code page, need the bytes). Rejects only when
   * the file cannot be read.
   */
  open(request?: OpenRequest): Promise<OpenedFile | string | null>
}

/** A kind of file the engine opens: its own drawings, or a DXF. */
export type FileKind = "drawing" | "dxf"

/** What a file pick asks for: the kinds to offer, in AutoCAD's order. */
export interface OpenRequest {
  readonly kinds: readonly FileKind[]
}

/** A file the user picked: its name (`plan.dxf`) and its contents. */
export interface OpenedFile {
  readonly name: string
  readonly bytes: Uint8Array
}

/**
 * The system clipboard, behind COPYCLIP / CUTCLIP / PASTECLIP. Both halves are
 * asynchronous because the browser's is: a write can be refused and a read can
 * prompt for permission or not exist at all. Neither is an error the user needs
 * to hear about — the runtime keeps what it last copied, so copy and paste go
 * on working inside the session whatever the host answers.
 */
export interface Clipboard {
  /** Puts `text` on the clipboard. Rejects when the host refuses. */
  write(text: string): Promise<void>
  /** The clipboard's text, or `null` when there is none. */
  read(): Promise<string | null>
}
