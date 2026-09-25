import { onTestFinished } from "vitest"
import { CadDriver, type CadDriverOptions } from "../cad/application/CadDriver"
import type {
  Clipboard,
  DrawingStore,
  FileTransport,
} from "../cad/application/ports"

export type {
  PointerModifiers,
  RecordingHost,
} from "../cad/application/CadDriver"

/**
 * The engine's headless driver ({@link CadDriver}) set up for tests: a fresh
 * in-memory clipboard by default and disposal when the test ends.
 *
 * `CadRuntime` is deliberately DOM-free — it talks to the outside world only
 * through its ports — so a tool can be exercised exactly as a user would drive
 * it (move, click, type, press keys) without a browser, a canvas or a
 * screenshot. That makes tool behaviour *unit*-testable: no coordinate
 * calibration, no synthetic pointer events, no waiting for a render.
 *
 * ```ts
 * const cad = createHarness()
 * cad.command("LINE").type("0,0").enter().type("@100,0").enter().escape()
 * expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
 * ```
 */

export class MemoryStore implements DrawingStore {
  private text: string | null
  readonly writes: string[] = []

  constructor(initial: string | null = null) {
    this.text = initial
  }

  read(): string | null {
    return this.text
  }

  write(text: string): void {
    this.text = text
    this.writes.push(text)
  }
}

/**
 * In-memory {@link FileTransport}, for exercising SAVE/OPEN. `open()` hands
 * back {@link nextFile} — `null` stands for a cancelled pick.
 */
export class MemoryFileTransport implements FileTransport {
  readonly saved: { text: string; fileName: string }[] = []
  openCalls = 0
  nextFile: string | null = null
  /** Set to make `open()` reject, as an unreadable file would. */
  openError: Error | null = null

  constructor(nextFile: string | null = null) {
    this.nextFile = nextFile
  }

  save(text: string, fileName: string): void {
    this.saved.push({ text, fileName })
  }

  open(): Promise<string | null> {
    this.openCalls += 1
    if (this.openError) return Promise.reject(this.openError)
    return Promise.resolve(this.nextFile)
  }
}

/**
 * In-memory {@link Clipboard}, for exercising COPYCLIP/PASTECLIP. Set
 * {@link readError} / {@link writeError} to play a browser that refuses, which
 * is the case the runtime's session fallback exists for.
 */
export class MemoryClipboard implements Clipboard {
  text: string | null = null
  readonly writes: string[] = []
  readCalls = 0
  readError: Error | null = null
  writeError: Error | null = null
  /** Set to never settle, as a browser waiting on a permission prompt does. */
  readHangs = false

  write(text: string): Promise<void> {
    if (this.writeError) return Promise.reject(this.writeError)
    this.text = text
    this.writes.push(text)
    return Promise.resolve()
  }

  read(): Promise<string | null> {
    this.readCalls += 1
    if (this.readHangs) return new Promise(() => {})
    if (this.readError) return Promise.reject(this.readError)
    return Promise.resolve(this.text)
  }
}

export interface HarnessOptions extends CadDriverOptions {
  /** The system clipboard. A fresh {@link MemoryClipboard} by default. */
  readonly clipboard?: Clipboard | null
}

export class CadHarness extends CadDriver {
  constructor(options: HarnessOptions = {}) {
    super({
      ...options,
      clipboard:
        options.clipboard === undefined
          ? new MemoryClipboard()
          : options.clipboard,
    })
  }
}

/**
 * Creates a harness and disposes it when the test ends, so a forgotten teardown
 * can never leak a timer into the next test.
 */
export function createHarness(options: HarnessOptions = {}): CadHarness {
  const harness = new CadHarness(options)
  onTestFinished(() => harness.dispose())
  return harness
}
