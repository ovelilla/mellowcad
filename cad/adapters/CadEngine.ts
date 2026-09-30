import { Listener } from "../shared/Observable"
import { Vec2 } from "../geometry/Vec2"
import { Layer } from "../domain/layers"
import { EntityId, EntityProperty } from "../domain/entities"
import { LengthUnit } from "../domain/units"
import { Scene } from "../scene/types"
import { DimStyle } from "../domain/dimStyles"
import { TextStyle } from "../domain/textStyles"
import {
  CadRuntime,
  KeyEventData,
  PointerEventData,
} from "../application/CadRuntime"
import { EngineState, StylesPanelTab } from "../application/EngineState"
import { DrawingStore, EngineHost } from "../application/ports"
import { SnapModeType } from "../application/SnapMode"
import { SnapType } from "../application/snapping/types"
import { ConstraintType } from "../application/constraints/types"
import { Tool } from "../application/tools/Tool"
import { Bounds } from "../domain/entities"
import type { EngineLocale } from "../locales/types"
import { CanvasScenePresenter } from "./CanvasScenePresenter"
import { createBrowserFileTransport } from "./browserFileTransport"
import { createBrowserClipboard } from "./browserClipboard"
import { createLocalStorageDrawingStore } from "./localStorageDrawingStore"

export interface CadEngineOptions {
  /**
   * Where the transparent autosave goes: by default this device's store, which
   * is the editor's drawing. An engine embedded anywhere else passes its own so
   * it can never write over that drawing; `null` turns autosave off.
   */
  readonly store?: DrawingStore | null
  /**
   * Embeds the engine in a page it does not own. Without a scope the engine
   * owns the whole document, as the editor needs: every key reaches it wherever
   * focus sits, the wheel always zooms and the native context menu never opens.
   *
   * With one, the engine is **active** from a press or a focus inside `scope`
   * until the next one outside it. Inactive, it hears no keys, leaves the wheel
   * to scroll the page and never takes focus. Active, it hears keys aimed at
   * the canvas or at the page body, and none of them scrolls the page; fields
   * inside the scope keep the editor's rule for fields, and any other control
   * there keeps its own keys.
   */
  readonly scope?: HTMLElement
  /**
   * The language the engine speaks — its prompts, keywords, palettes and what
   * it draws on the canvas. English, built in, when left out.
   */
  readonly locale?: EngineLocale
}

/**
 * The browser adapter and composition root: it owns the `<canvas>`, its DOM
 * event listeners, the `ResizeObserver` and the `requestAnimationFrame` loop,
 * and wires them to a DOM-free {@link CadRuntime} plus a Canvas 2D scene
 * presenter and, unless {@link CadEngineOptions} say otherwise, this device's
 * drawing store.
 *
 * It exposes the same façade the React layer has always used: construct it
 * with a canvas, subscribe to state, call imperative methods. React never
 * touches drawing logic — and the runtime never touches the DOM.
 */
export class CadEngine {
  private readonly runtime: CadRuntime
  private readonly presenter = new CanvasScenePresenter()
  private readonly canvas: HTMLCanvasElement
  private readonly ctx: CanvasRenderingContext2D
  private readonly resizeObserver: ResizeObserver
  private readonly scope: HTMLElement | null

  private dpr = 1
  private framePending = false
  private disposed = false
  private activePointerId: number | null = null
  /** Always true for an engine that owns the document; see `scope`. */
  private active: boolean

  constructor(canvas: HTMLCanvasElement, options: CadEngineOptions = {}) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2D canvas context is not available")
    this.ctx = ctx
    this.scope = options.scope ?? null
    this.active =
      this.scope === null ||
      this.scope.contains(canvas.ownerDocument.activeElement)

    const host: EngineHost = {
      requestRender: () => this.scheduleFrame(),
      setCursor: (cursor) => {
        this.canvas.style.cursor = cursor
      },
      // A command that ends after the user has clicked away from an embedded
      // engine (a paste resolving late) must not pull them back into it.
      focusSurface: () => {
        if (this.active) this.canvas.focus()
      },
    }

    this.runtime = new CadRuntime(
      host,
      options.store === undefined
        ? createLocalStorageDrawingStore()
        : options.store,
      createBrowserFileTransport(canvas.ownerDocument),
      createBrowserClipboard(),
      { locale: options.locale }
    )

    this.attachEvents()
    this.resizeObserver = new ResizeObserver(() => this.syncSize())
    this.resizeObserver.observe(canvas)
    this.syncSize()
  }

  subscribe(listener: Listener): () => void {
    return this.runtime.subscribe(listener)
  }

  getState(): EngineState {
    return this.runtime.getState()
  }

  /** Switches the language; what the command line already shows stays. */
  setLocale(locale: EngineLocale): void {
    this.runtime.setLocale(locale)
  }

  listTools(): Tool[] {
    return this.runtime.listTools()
  }

  registerTool(tool: Tool): void {
    this.runtime.registerTool(tool)
  }

  setActiveTool(id: string): void {
    this.runtime.setActiveTool(id)
  }

  deleteSelection(): void {
    this.runtime.deleteSelection()
  }

  clearAll(): void {
    this.runtime.clearAll()
  }

  undo(): void {
    this.runtime.undo()
  }

  redo(): void {
    this.runtime.redo()
  }

  zoomIn(): void {
    this.runtime.zoomIn()
  }

  zoomOut(): void {
    this.runtime.zoomOut()
  }

  resetView(): void {
    this.runtime.resetView()
  }

  zoomToFit(padding?: number): void {
    this.runtime.zoomToFit(padding)
  }

  zoomToBounds(bounds: Bounds, padding?: number): void {
    this.runtime.zoomToBounds(bounds, padding)
  }

  zoomPrevious(): boolean {
    return this.runtime.zoomPrevious()
  }

  toggleSnap(): void {
    this.runtime.toggleSnap()
  }

  setSnapEnabled(type: SnapType, enabled: boolean): void {
    this.runtime.setSnapEnabled(type, enabled)
  }

  setSnapOverride(override: SnapType | "none"): void {
    this.runtime.setSnapOverride(override)
  }

  closeSnapOverrideMenu(): void {
    this.runtime.closeSnapOverrideMenu()
  }

  toggleSelectionCycling(): void {
    this.runtime.toggleSelectionCycling()
  }

  setSelectionCyclingList(showList: boolean): void {
    this.runtime.setSelectionCyclingList(showList)
  }

  setUcsIconShown(shown: boolean): void {
    this.runtime.setUcsIconShown(shown)
  }

  chooseCyclingCandidate(id: EntityId): void {
    this.runtime.chooseCyclingCandidate(id)
  }

  previewCyclingCandidate(id: EntityId): void {
    this.runtime.previewCyclingCandidate(id)
  }

  closeCyclingList(): void {
    this.runtime.closeCyclingList()
  }

  toggleOrtho(): void {
    this.runtime.toggleOrtho()
  }

  togglePolar(): void {
    this.runtime.togglePolar()
  }

  setPolarAngleStep(step: number): void {
    this.runtime.setPolarAngleStep(step)
  }

  toggleObjectSnapTracking(): void {
    this.runtime.toggleObjectSnapTracking()
  }

  clearTracking(): void {
    this.runtime.clearTracking()
  }

  toggleGrid(): void {
    this.runtime.toggleGrid()
  }

  toggleSnapMode(): void {
    this.runtime.toggleSnapMode()
  }

  setSnapModeType(type: SnapModeType): void {
    this.runtime.setSnapModeType(type)
  }

  setSnapSpacing(x: number, y?: number): void {
    this.runtime.setSnapSpacing(x, y)
  }

  setSnapPolarDistance(distance: number): void {
    this.runtime.setSnapPolarDistance(distance)
  }

  setConstraintEnabled(type: ConstraintType, enabled: boolean): void {
    this.runtime.setConstraintEnabled(type, enabled)
  }

  createLayer(name?: string, color?: string, makeCurrent?: boolean): string {
    return this.runtime.createLayer(name, color, makeCurrent)
  }

  updateLayer(
    id: string,
    patch: Partial<
      Pick<
        Layer,
        "name" | "color" | "linetype" | "lineweight" | "visible" | "locked"
      >
    >
  ): void {
    this.runtime.updateLayer(id, patch)
  }

  setCurrentLayer(id: string): void {
    this.runtime.setCurrentLayer(id)
  }

  removeLayer(id: string): boolean {
    return this.runtime.removeLayer(id)
  }

  setSelectionLayer(id: string): void {
    this.runtime.setSelectionLayer(id)
  }

  setSelectionColor(color: string): void {
    this.runtime.setSelectionColor(color)
  }

  /** Starts the FROM point modifier (pick a base, then type an offset). */
  startFrom(): boolean {
    return this.runtime.startFrom()
  }

  setSelectionLinetype(linetype: string): void {
    this.runtime.setSelectionLinetype(linetype)
  }

  setSelectionLineweight(lineweight: number | "ByLayer"): void {
    this.runtime.setSelectionLineweight(lineweight)
  }

  /** Retypes one geometry value of the single selected object. */
  setSelectionProperty(property: EntityProperty, text: string): boolean {
    return this.runtime.setSelectionProperty(property, text)
  }

  setDynamicInputText(text: string, fieldId?: string): void {
    this.runtime.setDynamicInputText(text, fieldId)
  }

  setActiveDynamicField(fieldId: string): void {
    this.runtime.setActiveDynamicField(fieldId)
  }

  commitDynamicInput(): void {
    this.runtime.commitDynamicInput()
  }

  invokeToolOption(input: string): boolean {
    return this.runtime.invokeToolOption(input)
  }

  cancelDynamicInput(): void {
    this.runtime.cancelDynamicInput()
  }

  setCommandLineText(text: string): void {
    this.runtime.setCommandLineText(text)
  }

  submitCommandLine(): void {
    this.runtime.submitCommandLine()
  }

  runCommand(name: string): boolean {
    return this.runtime.runCommand(name)
  }

  completeCommandLine(): void {
    this.runtime.completeCommandLine()
  }

  recallCommand(direction: -1 | 1): void {
    this.runtime.recallCommand(direction)
  }

  toggleCommandLine(): void {
    this.runtime.toggleCommandLine()
  }

  /** Returns keyboard focus to the drawing surface. */
  focusSurface(): void {
    this.canvas.focus()
  }

  /**
   * Whether the engine's own UI (the dynamic-input box) may take keyboard
   * focus away from `from`. The editor owns the page, so from anywhere. An
   * embedded engine only while active, and only from its canvas, its scope or
   * the body — never from the rest of the page, nor from a control beside the
   * canvas that the user tabbed to.
   */
  mayTakeFocus(from: Element | null): boolean {
    if (this.scope === null) return true
    return (
      this.active &&
      (from === null ||
        from === this.canvas ||
        from === this.scope ||
        from === this.canvas.ownerDocument.body)
    )
  }

  setDocumentUnit(unit: LengthUnit): void {
    this.runtime.setDocumentUnit(unit)
  }

  setDocumentPrecision(precision: number): void {
    this.runtime.setDocumentPrecision(precision)
  }

  setLtScale(ltScale: number): void {
    this.runtime.setLtScale(ltScale)
  }

  setDimScale(scale: number): void {
    this.runtime.setDimScale(scale)
  }

  createDimStyle(name?: string, basedOn?: string, makeCurrent = true): string {
    return this.runtime.createDimStyle(name, basedOn, makeCurrent)
  }

  updateDimStyle(id: string, patch: Partial<Omit<DimStyle, "id">>): void {
    this.runtime.updateDimStyle(id, patch)
  }

  setCurrentDimStyle(id: string): void {
    this.runtime.setCurrentDimStyle(id)
  }

  removeDimStyle(id: string): boolean {
    return this.runtime.removeDimStyle(id)
  }

  setSelectionDimStyle(id: string): void {
    this.runtime.setSelectionDimStyle(id)
  }

  createTextStyle(name?: string, basedOn?: string, makeCurrent = true): string {
    return this.runtime.createTextStyle(name, basedOn, makeCurrent)
  }

  updateTextStyle(id: string, patch: Partial<Omit<TextStyle, "id">>): void {
    this.runtime.updateTextStyle(id, patch)
  }

  setCurrentTextStyle(id: string): void {
    this.runtime.setCurrentTextStyle(id)
  }

  removeTextStyle(id: string): boolean {
    return this.runtime.removeTextStyle(id)
  }

  setSelectionTextStyle(id: string): void {
    this.runtime.setSelectionTextStyle(id)
  }

  setStylesPanel(tab: StylesPanelTab | null): void {
    this.runtime.setStylesPanel(tab)
  }

  toggleStylesPanel(tab: StylesPanelTab): void {
    this.runtime.toggleStylesPanel(tab)
  }

  setBlocksPanel(open: boolean): void {
    this.runtime.setBlocksPanel(open)
  }

  toggleBlocksPanel(): void {
    this.runtime.toggleBlocksPanel()
  }

  insertBlock(id: string): void {
    this.runtime.insertBlock(id)
  }

  purgeBlocks(ids?: readonly string[]): number {
    return this.runtime.purgeBlocks(ids)
  }

  buildBlockPreview(id: string, width: number, height: number): Scene | null {
    return this.runtime.buildBlockPreview(id, width, height)
  }

  toggleLineweightDisplay(): void {
    this.runtime.toggleLineweightDisplay()
  }

  serializeDrawing(): string {
    return this.runtime.serializeDrawing()
  }

  suggestedFileName(): string {
    return this.runtime.suggestedFileName()
  }

  loadDrawing(text: string): void {
    this.runtime.loadDrawing(text)
  }

  saveDrawingToFile(): void {
    this.runtime.saveDrawingToFile()
  }

  openDrawingFromFile(): Promise<void> {
    return this.runtime.openDrawingFromFile()
  }

  pasteFromClipboard(): Promise<void> {
    return this.runtime.pasteFromClipboard()
  }

  selectAll(): void {
    this.runtime.selectAll()
  }

  dispose(): void {
    this.disposed = true
    this.resizeObserver.disconnect()
    this.detachEvents()
    this.runtime.dispose()
  }

  private scheduleFrame(): void {
    if (this.framePending || this.disposed) return
    this.framePending = true
    requestAnimationFrame(() => {
      this.framePending = false
      if (this.disposed) return
      this.presenter.draw(this.ctx, this.runtime.buildScene(), this.dpr)
    })
  }

  private syncSize(): void {
    const rect = this.canvas.getBoundingClientRect()
    const cssWidth = Math.max(1, Math.round(rect.width))
    const cssHeight = Math.max(1, Math.round(rect.height))
    this.dpr = window.devicePixelRatio || 1

    this.canvas.width = Math.round(cssWidth * this.dpr)
    this.canvas.height = Math.round(cssHeight * this.dpr)
    this.runtime.setViewSize(cssWidth, cssHeight)
  }

  private attachEvents(): void {
    const c = this.canvas
    c.tabIndex = 0 // make the canvas focusable so it receives key events
    c.addEventListener("pointerdown", this.onPointerDown)
    c.addEventListener("pointermove", this.onPointerMove)
    c.addEventListener("pointerup", this.onPointerUp)
    c.addEventListener("pointerleave", this.onPointerLeave)
    c.addEventListener("dblclick", this.onDoubleClick)
    c.addEventListener("wheel", this.onWheel, { passive: false })
    // Suppress the native context menu at the document level, not just on the
    // canvas: once the object-snap override menu opens (Shift+right-click) its
    // portalled backdrop sits over the canvas, so the OS `contextmenu` event —
    // which fires on right-button *release* on Windows — targets the backdrop,
    // not the canvas. A canvas-only listener would miss it and Windows' menu
    // would still pop. The document-level handler leaves editable fields alone.
    c.ownerDocument.addEventListener("contextmenu", this.onContextMenu)
    // Keyboard shortcuts (Escape, F8, Ctrl+Z, ...) listen at the document level
    // so they work regardless of which element holds focus. Relying on canvas
    // focus was fragile: acquiring a tracking point (or picking a tool from the
    // toolbar) leaves focus off the canvas, so Escape could not cancel the
    // command or clear tracking references. The handler skips keys aimed at the
    // dynamic-input box, which handles its own Enter/Escape.
    c.ownerDocument.addEventListener("keydown", this.onKeyDown)
    if (this.scope) {
      // Capture, so a press whose own handler stops it still moves the user's
      // attention in or out of the embedded engine.
      c.ownerDocument.addEventListener("pointerdown", this.onPagePress, true)
      c.ownerDocument.addEventListener("focusin", this.onPageFocus)
    }
  }

  private detachEvents(): void {
    const c = this.canvas
    c.removeEventListener("pointerdown", this.onPointerDown)
    c.removeEventListener("pointermove", this.onPointerMove)
    c.removeEventListener("pointerup", this.onPointerUp)
    c.removeEventListener("pointerleave", this.onPointerLeave)
    c.removeEventListener("dblclick", this.onDoubleClick)
    c.removeEventListener("wheel", this.onWheel)
    c.ownerDocument.removeEventListener("contextmenu", this.onContextMenu)
    c.ownerDocument.removeEventListener("keydown", this.onKeyDown)
    c.ownerDocument.removeEventListener("pointerdown", this.onPagePress, true)
    c.ownerDocument.removeEventListener("focusin", this.onPageFocus)
  }

  private onPagePress = (e: PointerEvent): void => {
    this.active = this.withinScope(e.target)
  }

  private onPageFocus = (e: FocusEvent): void => {
    this.active = this.withinScope(e.target)
  }

  private withinScope(target: EventTarget | null): boolean {
    return (
      this.scope !== null &&
      target instanceof Node &&
      this.scope.contains(target)
    )
  }

  /**
   * Which key targets an embedded engine hears while it is active: its canvas,
   * and the body — where focus falls when a focused field unmounts, as the
   * dynamic-input box does when OFFSET moves from its distance to picking.
   * Fields inside the scope are left to the editor's rule in `onKeyDown`; any
   * other control there (a button beside the canvas) keeps Enter, Space and Tab.
   */
  private hearsKeysFrom(target: HTMLElement | null): boolean {
    if (!this.active || target === null) return false
    if (target === this.canvas || target === this.scope) return true
    if (target === this.canvas.ownerDocument.body) return true
    return this.withinScope(target) && target.closest(EDITABLE) !== null
  }

  private screenFromEvent(e: PointerEvent | WheelEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  private pointerData(e: PointerEvent): PointerEventData {
    return {
      screen: this.screenFromEvent(e),
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    }
  }

  private onPointerDown = (e: PointerEvent): void => {
    this.canvas.focus()
    if (e.button === 1 || e.button === 2) e.preventDefault() // pan buttons
    this.activePointerId = e.pointerId
    this.canvas.setPointerCapture(e.pointerId)
    this.runtime.pointerDown(this.pointerData(e))
  }

  private onPointerMove = (e: PointerEvent): void => {
    this.runtime.pointerMove(this.pointerData(e))
  }

  private onPointerUp = (e: PointerEvent): void => {
    this.runtime.pointerUp(this.pointerData(e))
    this.releasePointer(e.pointerId)
  }

  private onPointerLeave = (): void => {
    this.runtime.pointerLeave()
  }

  private onDoubleClick = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    this.runtime.doubleClick({
      screen: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      button: e.button,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    })
  }

  private onWheel = (e: WheelEvent): void => {
    // WHY: AutoCAD zooms on every wheel turn over the drawing, but an engine
    // embedded in a page that scrolls would trap the scroll of anyone passing
    // over it. Until it is in use the wheel stays the page's.
    if (!this.active) return
    e.preventDefault()
    this.runtime.wheel({ screen: this.screenFromEvent(e), deltaY: e.deltaY })
  }

  private onContextMenu = (e: MouseEvent): void => {
    // Right-click pans and Shift+right-click opens the object-snap override
    // menu, so the native menu is never wanted over the drawing surface or the
    // override menu. Editable fields keep their native menu (e.g. paste), and
    // so does the rest of a page the engine is only embedded in.
    const target = e.target as HTMLElement | null
    if (target?.closest(EDITABLE)) return
    if (this.scope && !this.withinScope(target)) return
    e.preventDefault()
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const target = e.target as HTMLElement | null
    // WHY: AutoCAD takes every key while its window has focus. Embedded in a
    // page, that would take the page's keyboard, so keys count only while the
    // engine is in use. The runtime's routing order is untouched: this, like
    // the field rule below, decides only whether a key reaches it at all.
    if (this.scope && !this.hearsKeysFrom(target)) return
    // Keys typed into editable UI (the dynamic-input box) belong to that field,
    // which handles its own Enter/Escape/typing — don't hijack them here. Two
    // exceptions are global and must work wherever focus sits, as in AutoCAD:
    // function keys (F8 Ortho, F10 Polar, ...) and the file shortcuts, which
    // also have to be swallowed so the browser's Save/Open dialogs never open.
    const inEditable = !!target?.closest(EDITABLE)
    if (inEditable && !/^F\d+$/.test(e.key) && !isFileShortcut(e)) {
      return
    }
    const data: KeyEventData = {
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    }
    const consumed = this.runtime.keyDown(data)
    // A key the runtime passes on — Space confirming a selection set, an arrow
    // mid-command — does nothing in the editor, whose page cannot scroll. A
    // page an engine is embedded in can, and would, while the user draws.
    if (consumed || (this.scope && SCROLL_KEYS.has(e.key))) e.preventDefault()
  }

  private releasePointer(pointerId: number): void {
    if (this.activePointerId === pointerId) {
      try {
        this.canvas.releasePointerCapture(pointerId)
      } catch {
        // capture may already be gone; ignore
      }
      this.activePointerId = null
    }
  }
}

/** Elements whose keys and context menu belong to the text in them. */
const EDITABLE = 'input, textarea, select, [contenteditable="true"]'

/** Keys whose default action scrolls the page. */
const SCROLL_KEYS = new Set([
  " ",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
])

/**
 * Ctrl+S / Ctrl+O. The other Ctrl combos stay unforwarded from editable fields
 * on purpose (a global undo mid-draw desyncs the running tool), but saving and
 * opening are safe from anywhere and the browser must not handle them.
 *
 * The clipboard shortcuts must **never** join this list: Ctrl+C / Ctrl+X /
 * Ctrl+V / Ctrl+A inside a dynamic-input box or a layer name belong to that
 * text, and taking them would break copying a value out of the drawing's own UI.
 */
function isFileShortcut(e: KeyboardEvent): boolean {
  if (!e.ctrlKey || e.altKey) return false
  const key = e.key.toLowerCase()
  return key === "s" || key === "o"
}
