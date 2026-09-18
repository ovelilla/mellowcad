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
import { EngineHost } from "../application/ports"
import { SnapModeType } from "../application/SnapMode"
import { SnapType } from "../application/snapping/types"
import { ConstraintType } from "../application/constraints/types"
import { Tool } from "../application/tools/Tool"
import { CanvasScenePresenter } from "./CanvasScenePresenter"
import { createBrowserFileTransport } from "./browserFileTransport"
import { createBrowserClipboard } from "./browserClipboard"
import { createLocalStorageDrawingStore } from "./localStorageDrawingStore"

/**
 * The browser adapter and composition root: it owns the `<canvas>`, its DOM
 * event listeners, the `ResizeObserver` and the `requestAnimationFrame` loop,
 * and wires them to a DOM-free {@link CadRuntime} plus a Canvas 2D scene
 * presenter and a localStorage drawing store.
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

  private dpr = 1
  private framePending = false
  private disposed = false
  private activePointerId: number | null = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("2D canvas context is not available")
    this.ctx = ctx

    const host: EngineHost = {
      requestRender: () => this.scheduleFrame(),
      setCursor: (cursor) => {
        this.canvas.style.cursor = cursor
      },
      focusSurface: () => this.canvas.focus(),
    }

    this.runtime = new CadRuntime(
      host,
      createLocalStorageDrawingStore(),
      createBrowserFileTransport(canvas.ownerDocument),
      createBrowserClipboard()
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

  invokeToolOption(key: string): boolean {
    return this.runtime.invokeToolOption(key)
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
    e.preventDefault()
    this.runtime.wheel({ screen: this.screenFromEvent(e), deltaY: e.deltaY })
  }

  private onContextMenu = (e: MouseEvent): void => {
    // Right-click pans and Shift+right-click opens the object-snap override
    // menu, so the native menu is never wanted over the drawing surface or the
    // override menu. Editable fields keep their native menu (e.g. paste).
    const target = e.target as HTMLElement | null
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
      return
    }
    e.preventDefault()
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    // Keys typed into editable UI (the dynamic-input box) belong to that field,
    // which handles its own Enter/Escape/typing — don't hijack them here. Two
    // exceptions are global and must work wherever focus sits, as in AutoCAD:
    // function keys (F8 Ortho, F10 Polar, ...) and the file shortcuts, which
    // also have to be swallowed so the browser's Save/Open dialogs never open.
    const target = e.target as HTMLElement | null
    const inEditable = !!target?.closest(
      'input, textarea, select, [contenteditable="true"]'
    )
    if (inEditable && !/^F\d+$/.test(e.key) && !isFileShortcut(e)) {
      return
    }
    const data: KeyEventData = {
      key: e.key,
      shiftKey: e.shiftKey,
      ctrlKey: e.ctrlKey,
      altKey: e.altKey,
    }
    if (this.runtime.keyDown(data)) e.preventDefault()
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
