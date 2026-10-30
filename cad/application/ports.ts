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
  /** Hands the drawing text to the user as a named file. */
  save(text: string, fileName: string): void
  /**
   * Asks the user for a drawing file. Resolves with its text, or with `null`
   * when the pick was cancelled. Rejects only when the file cannot be read.
   */
  open(): Promise<string | null>
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
