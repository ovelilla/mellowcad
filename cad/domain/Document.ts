import { Observable } from "../shared/Observable"
import { Vec2 } from "../geometry/Vec2"
import {
  assignEntityLayer,
  assignTextStyle,
  assignDimStyle,
  AttributeDisplay,
  BlockDefinition,
  BlockId,
  BlockLookup,
  blocksInUse,
  distanceToEntity,
  entityDrawOrder,
  Entity,
  EntityId,
} from "./entities"
import { createDefaultLayer, DEFAULT_LAYER_ID, Layer, LayerId } from "./layers"
import { LinetypeId } from "./linetypes"
import { Lineweight } from "./lineweights"
import {
  createDefaultTextStyle,
  DEFAULT_TEXT_STYLE_ID,
  TextStyle,
  TextStyleId,
} from "./textStyles"
import {
  createDefaultDimStyle,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
} from "./dimStyles"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  DocumentSettings,
  DraftingModes,
  LengthUnit,
  ViewCubeSetting,
} from "./units"

/**
 * Read-only view of the document. Tools, snapping providers and the scene
 * builder receive this interface instead of the mutable class, so the compiler
 * guarantees they cannot change the drawing behind the command layer's back.
 */
export interface DocumentReader {
  readonly size: number
  getSettings(): DocumentSettings
  getEntities(): Entity[]
  get(id: EntityId): Entity | undefined
  has(id: EntityId): boolean
  pick(point: Vec2, tolerance: number): Entity | null
  /** Every pickable entity under the pick box, topmost first. */
  pickAll(point: Vec2, tolerance: number): Entity[]
  /**
   * {@link pickAll} with the distance measured by `distanceOf` (a view off
   * the plan measures on screen) and `tolerance` in the same units; with
   * `locked`, a locked layer's objects too, as a pick at `Command:` takes them.
   */
  pickAllBy(
    distanceOf: (entity: Entity) => number,
    tolerance: number,
    locked?: boolean
  ): Entity[]
  /** All layers in creation order (the base layer `0` first). */
  getLayers(): Layer[]
  getLayer(id: LayerId): Layer | undefined
  /** The layer new geometry is drawn on. */
  getCurrentLayerId(): LayerId
  /** All text styles in creation order (the base style `Standard` first). */
  getTextStyles(): TextStyle[]
  getTextStyle(id: TextStyleId): TextStyle | undefined
  /** The style new text is created with. */
  getCurrentTextStyleId(): TextStyleId
  /** All dimension styles in creation order (the base `ISO-25` first). */
  getDimStyles(): DimStyle[]
  getDimStyle(id: DimStyleId): DimStyle | undefined
  /** The style new dimensions are created with. */
  getCurrentDimStyleId(): DimStyleId
  /** All block definitions, in creation order. */
  getBlocks(): BlockDefinition[]
  getBlock(id: BlockId): BlockDefinition | undefined
  /**
   * The block table as a plain function, for the pure helpers that have to look
   * inside a block reference (bounds, hit-testing, the scene builder).
   */
  blockLookup(): BlockLookup
  /** Resolves an entity's effective colour: its own override, else ByLayer. */
  resolveEntityColor(entity: Entity): string
  /** Resolves an entity's effective linetype: its own override, else ByLayer. */
  resolveEntityLinetype(entity: Entity): LinetypeId
  /** Resolves an entity's effective lineweight: its own override, else ByLayer. */
  resolveEntityLineweight(entity: Entity): Lineweight
  /** True when the entity's layer is on (visible). */
  isEntityVisible(entity: Entity): boolean
  /**
   * True when the entity can be selected at `Command:`: its layer is on. A
   * locked layer's objects are selected too (desktop properties/d02-1).
   */
  isEntitySelectable(entity: Entity): boolean
  /** True when the entity can be edited: selectable, its layer not locked. */
  isEntityEditable(entity: Entity): boolean
}

/**
 * The named tables a drawing carries alongside its geometry. Grouped rather
 * than passed positionally: {@link CadDocument.load} had grown eight trailing
 * optionals, and every new table would have added another two.
 */
export interface DocumentTables {
  readonly settings?: DocumentSettings
  readonly layers?: Iterable<Layer>
  readonly currentLayerId?: LayerId
  readonly textStyles?: Iterable<TextStyle>
  readonly currentTextStyleId?: TextStyleId
  readonly dimStyles?: Iterable<DimStyle>
  readonly currentDimStyleId?: DimStyleId
  readonly blocks?: Iterable<BlockDefinition>
}

/** An object with its index in the drawing's order, as it was found. */
export interface PlacedEntity {
  readonly entity: Entity
  readonly index: number
}

/**
 * The document is the single source of truth for the persistent drawing:
 * entities in world coordinates plus unit settings. Mutations notify
 * subscribers; in the application layer they flow through reversible Command
 * objects, so the raw mutators below are the primitives those commands use.
 */
export class CadDocument extends Observable implements DocumentReader {
  private entities = new Map<EntityId, Entity>()
  private settings: DocumentSettings = DEFAULT_DOCUMENT_SETTINGS
  private layers = new Map<LayerId, Layer>()
  private currentLayerId: LayerId = DEFAULT_LAYER_ID
  private textStyles = new Map<TextStyleId, TextStyle>()
  private currentTextStyleId: TextStyleId = DEFAULT_TEXT_STYLE_ID
  private dimStyles = new Map<DimStyleId, DimStyle>()
  private currentDimStyleId: DimStyleId = DEFAULT_DIM_STYLE_ID
  private blocks = new Map<BlockId, BlockDefinition>()
  private readonly lookup: BlockLookup = Object.defineProperty(
    (id: BlockId) => this.blocks.get(id),
    "attributeDisplay",
    { get: () => this.settings.attributeDisplay }
  )

  constructor() {
    super()
    const base = createDefaultLayer()
    this.layers.set(base.id, base)
    const style = createDefaultTextStyle()
    this.textStyles.set(style.id, style)
    const dimStyle = createDefaultDimStyle()
    this.dimStyles.set(dimStyle.id, dimStyle)
  }

  getSettings(): DocumentSettings {
    return this.settings
  }

  setUnit(unit: LengthUnit): void {
    if (this.settings.unit === unit) return
    this.settings = { ...this.settings, unit }
    this.emit()
  }

  setPrecision(precision: number): void {
    const clamped = Math.max(0, Math.min(8, Math.round(precision)))
    if (this.settings.precision === clamped) return
    this.settings = { ...this.settings, precision: clamped }
    this.emit()
  }

  /** Sets the global linetype scale (LTSCALE); clamped to a sane positive range. */
  setLtScale(ltScale: number): void {
    const clamped = Math.max(0.01, Math.min(1000, ltScale))
    if (!Number.isFinite(clamped) || this.settings.ltScale === clamped) return
    this.settings = { ...this.settings, ltScale: clamped }
    this.emit()
  }

  /** Turns thick lineweight rendering on or off (AutoCAD's LWDISPLAY). */
  setLwDisplay(lwDisplay: boolean): void {
    if (this.settings.lwDisplay === lwDisplay) return
    this.settings = { ...this.settings, lwDisplay }
    this.emit()
  }

  /** Sets ATTMODE, which ATTDISP changes and AutoCAD saves in the drawing. */
  setAttributeDisplay(attributeDisplay: AttributeDisplay): void {
    if (this.settings.attributeDisplay === attributeDisplay) return
    this.settings = { ...this.settings, attributeDisplay }
    this.emit()
  }

  /** NAVVCUBEDISPLAY and the Home view: presentation, so no command undoes them. */
  setViewCube(viewCube: ViewCubeSetting): void {
    const current = this.settings.viewCube
    if (
      current.visible === viewCube.visible &&
      current.home === viewCube.home
    ) {
      return
    }
    this.settings = { ...this.settings, viewCube }
    this.emit()
  }

  /**
   * ORTHOMODE, SNAPMODE, SNAPUNIT and GRIDMODE as F8, F9 and F7 set them:
   * saved in the drawing (rectang/p304), but no command (RECTANG-D44).
   */
  setDraftingModes(modes: Partial<DraftingModes>): void {
    const current = this.settings
    const changed = (Object.keys(modes) as (keyof DraftingModes)[]).some(
      (key) =>
        key === "snapUnit"
          ? modes.snapUnit!.x !== current.snapUnit.x ||
            modes.snapUnit!.y !== current.snapUnit.y
          : modes[key] !== current[key]
    )
    if (!changed) return
    this.settings = { ...current, ...modes }
    this.emit()
  }

  setSettings(settings: DocumentSettings): void {
    this.settings = settings
    this.emit()
  }

  updateSettings(patch: Partial<DocumentSettings>): void {
    this.settings = { ...this.settings, ...patch }
    this.emit()
  }

  /**
   * Replaces the entire drawing (entities and, optionally, settings and layers)
   * with a single notification. Used when loading a file so subscribers rebuild
   * once. When layers are supplied they replace the layer table wholesale (a
   * base layer `0` is always guaranteed); every entity's `layerId` is then
   * reconciled against the table so a dangling reference falls back to `0`.
   */
  load(entities: Iterable<Entity>, tables: DocumentTables = {}): void {
    if (tables.layers) this.replaceLayers(tables.layers)
    if (tables.textStyles) this.replaceTextStyles(tables.textStyles)
    if (tables.dimStyles) this.replaceDimStyles(tables.dimStyles)
    if (tables.blocks) {
      this.blocks.clear()
      for (const block of tables.blocks) this.blocks.set(block.id, block)
    }
    // Keep the existing current layer when none is supplied (e.g. undoing a
    // "clear"); only fall back to the base layer if it no longer exists.
    this.currentLayerId = this.resolveLayerId(
      tables.currentLayerId ?? this.currentLayerId
    )
    this.currentTextStyleId = this.resolveTextStyleId(
      tables.currentTextStyleId ?? this.currentTextStyleId
    )
    this.currentDimStyleId = this.resolveDimStyleId(
      tables.currentDimStyleId ?? this.currentDimStyleId
    )

    this.entities.clear()
    for (const entity of entities) {
      this.entities.set(entity.id, this.reconcile(entity))
    }
    if (tables.settings) this.settings = tables.settings
    this.emit()
  }

  getBlocks(): BlockDefinition[] {
    return Array.from(this.blocks.values())
  }

  getBlock(id: BlockId): BlockDefinition | undefined {
    return this.blocks.get(id)
  }

  blockLookup(): BlockLookup {
    return this.lookup
  }

  /** Defines a block, or redefines the one of the same name. */
  addBlock(block: BlockDefinition): BlockDefinition {
    this.blocks.set(block.id, block)
    this.emit()
    return block
  }

  /**
   * Whether the block is in use: placed by a reference in the drawing, or
   * nested in the definition of a block in use (`blocksInUse`).
   */
  blockInUse(id: BlockId): boolean {
    return blocksInUse(this.entities.values(), this.lookup).has(id)
  }

  /** Removes a block definition. A block still referenced stays (PURGE's rule). */
  removeBlock(id: BlockId): boolean {
    if (!this.blocks.has(id) || this.blockInUse(id)) return false
    this.blocks.delete(id)
    this.emit()
    return true
  }

  getTextStyles(): TextStyle[] {
    return Array.from(this.textStyles.values())
  }

  getTextStyle(id: TextStyleId): TextStyle | undefined {
    return this.textStyles.get(id)
  }

  getCurrentTextStyleId(): TextStyleId {
    return this.currentTextStyleId
  }

  /** Sets the style new text is created with. Unknown ids are ignored. */
  setCurrentTextStyle(id: TextStyleId): void {
    if (id === this.currentTextStyleId || !this.textStyles.has(id)) return
    this.currentTextStyleId = id
    this.emit()
  }

  addTextStyle(style: TextStyle): TextStyle {
    this.textStyles.set(style.id, style)
    this.emit()
    return style
  }

  updateTextStyle(style: TextStyle): void {
    if (!this.textStyles.has(style.id)) return
    this.textStyles.set(style.id, style)
    this.emit()
  }

  /**
   * Removes a text style. AutoCAD's Text Style dialog "deletes unused text
   * styles", so the base `Standard`, the current style and any style still worn
   * by an object stay. Returns whether the style was removed.
   */
  removeTextStyle(id: TextStyleId): boolean {
    if (!this.canRemoveTextStyle(id)) return false
    this.textStyles.delete(id)
    this.emit()
    return true
  }

  canRemoveTextStyle(id: TextStyleId): boolean {
    return (
      id !== DEFAULT_TEXT_STYLE_ID &&
      id !== this.currentTextStyleId &&
      this.textStyles.has(id) &&
      !this.textStyleInUse(id)
    )
  }

  /** Puts a removed text style back at `index` in the table's order. */
  restoreTextStyle(style: TextStyle, index: number): void {
    const entries = [...this.textStyles.values()].filter(
      (s) => s.id !== style.id
    )
    entries.splice(index, 0, style)
    this.textStyles = new Map(entries.map((s) => [s.id, s]))
    this.emit()
  }

  textStyleInUse(id: TextStyleId): boolean {
    for (const entity of this.entities.values()) {
      if (usesTextStyle(entity, id)) return true
    }
    for (const block of this.blocks.values()) {
      if (block.entities.some((entity) => usesTextStyle(entity, id))) {
        return true
      }
    }
    return false
  }

  getDimStyles(): DimStyle[] {
    return Array.from(this.dimStyles.values())
  }

  getDimStyle(id: DimStyleId): DimStyle | undefined {
    return this.dimStyles.get(id)
  }

  getCurrentDimStyleId(): DimStyleId {
    return this.currentDimStyleId
  }

  /** Sets the style new dimensions are created with. Unknown ids are ignored. */
  setCurrentDimStyle(id: DimStyleId): void {
    if (id === this.currentDimStyleId || !this.dimStyles.has(id)) return
    this.currentDimStyleId = id
    this.emit()
  }

  addDimStyle(style: DimStyle): DimStyle {
    this.dimStyles.set(style.id, style)
    this.emit()
    return style
  }

  /** Replaces an existing dimension style (same id); unknown ids are ignored. */
  updateDimStyle(style: DimStyle): void {
    if (!this.dimStyles.has(style.id)) return
    this.dimStyles.set(style.id, style)
    this.emit()
  }

  /**
   * Removes a dimension style. "You cannot delete a style that is current or in
   * use in the current drawing" (Dimension Style Manager), and the base
   * `ISO-25` always stays. Returns whether the style was removed.
   */
  removeDimStyle(id: DimStyleId): boolean {
    if (!this.canRemoveDimStyle(id)) return false
    this.dimStyles.delete(id)
    this.emit()
    return true
  }

  canRemoveDimStyle(id: DimStyleId): boolean {
    return (
      id !== DEFAULT_DIM_STYLE_ID &&
      id !== this.currentDimStyleId &&
      this.dimStyles.has(id) &&
      !this.dimStyleInUse(id)
    )
  }

  /** Puts a removed dimension style back at `index` in the table's order. */
  restoreDimStyle(style: DimStyle, index: number): void {
    const entries = [...this.dimStyles.values()].filter(
      (s) => s.id !== style.id
    )
    entries.splice(index, 0, style)
    this.dimStyles = new Map(entries.map((s) => [s.id, s]))
    this.emit()
  }

  dimStyleInUse(id: DimStyleId): boolean {
    for (const entity of this.entities.values()) {
      if (entity.type === "dimension" && entity.styleId === id) return true
    }
    return false
  }

  getLayers(): Layer[] {
    return Array.from(this.layers.values())
  }

  getLayer(id: LayerId): Layer | undefined {
    return this.layers.get(id)
  }

  getCurrentLayerId(): LayerId {
    return this.currentLayerId
  }

  /** Sets the layer new geometry is drawn on. Unknown ids are ignored. */
  setCurrentLayer(id: LayerId): void {
    if (id === this.currentLayerId || !this.layers.has(id)) return
    this.currentLayerId = id
    this.emit()
  }

  addLayer(layer: Layer): Layer {
    this.layers.set(layer.id, layer)
    this.emit()
    return layer
  }

  updateLayer(layer: Layer): void {
    if (!this.layers.has(layer.id)) return
    this.layers.set(layer.id, layer)
    this.emit()
  }

  /**
   * Whether an object holds the layer: one in the drawing, an attribute of a
   * reference, or one in a block definition, which counts even with no
   * reference left (p380; nested blocks are definitions of their own).
   */
  layerInUse(id: LayerId): boolean {
    const on = (entity: Entity) =>
      entity.layerId === id ||
      (entity.type === "insert" &&
        (entity.attributes ?? []).some((a) => a.layerId === id))
    for (const entity of this.entities.values()) if (on(entity)) return true
    for (const block of this.blocks.values()) {
      if (block.entities.some(on)) return true
    }
    return false
  }

  /**
   * Whether a layer may be removed: never the base layer `0`, the current
   * layer or one in use ({@link layerInUse}), as AutoCAD refuses them.
   */
  canRemoveLayer(id: LayerId): boolean {
    return (
      id !== DEFAULT_LAYER_ID &&
      id !== this.currentLayerId &&
      this.layers.has(id) &&
      !this.layerInUse(id)
    )
  }

  /** Removes a layer if {@link canRemoveLayer}; returns whether it did. */
  removeLayer(id: LayerId): boolean {
    if (!this.canRemoveLayer(id)) return false
    this.layers.delete(id)
    this.emit()
    return true
  }

  /** Puts a removed layer back at `index` in the table's order. */
  restoreLayer(layer: Layer, index: number): void {
    const entries = [...this.layers.values()].filter((l) => l.id !== layer.id)
    entries.splice(index, 0, layer)
    this.layers = new Map(entries.map((l) => [l.id, l]))
    this.emit()
  }

  resolveEntityColor(entity: Entity): string {
    if (entity.color) return entity.color
    return (
      this.layers.get(entity.layerId)?.color ??
      this.layers.get(DEFAULT_LAYER_ID)!.color
    )
  }

  resolveEntityLinetype(entity: Entity): LinetypeId {
    if (entity.linetype) return entity.linetype
    return (
      this.layers.get(entity.layerId)?.linetype ??
      this.layers.get(DEFAULT_LAYER_ID)!.linetype
    )
  }

  resolveEntityLineweight(entity: Entity): Lineweight {
    if (entity.lineweight !== undefined) return entity.lineweight
    return (
      this.layers.get(entity.layerId)?.lineweight ??
      this.layers.get(DEFAULT_LAYER_ID)!.lineweight
    )
  }

  isEntityVisible(entity: Entity): boolean {
    return this.layers.get(entity.layerId)?.visible ?? true
  }

  isEntitySelectable(entity: Entity): boolean {
    return this.isEntityVisible(entity)
  }

  isEntityEditable(entity: Entity): boolean {
    const layer = this.layers.get(entity.layerId)
    if (!layer) return true
    return layer.visible && !layer.locked
  }

  /** Rebuilds the layer table, always keeping a base layer `0`. */
  private replaceLayers(layers: Iterable<Layer>): void {
    this.layers.clear()
    for (const layer of layers) this.layers.set(layer.id, layer)
    if (!this.layers.has(DEFAULT_LAYER_ID)) {
      const base = createDefaultLayer()
      this.layers.set(base.id, base)
    }
  }

  /** Rebuilds the style table, always keeping the base style `Standard`. */
  private replaceTextStyles(styles: Iterable<TextStyle>): void {
    this.textStyles.clear()
    for (const style of styles) this.textStyles.set(style.id, style)
    if (!this.textStyles.has(DEFAULT_TEXT_STYLE_ID)) {
      const base = createDefaultTextStyle()
      this.textStyles.set(base.id, base)
    }
  }

  private resolveLayerId(id: LayerId | undefined): LayerId {
    return id && this.layers.has(id) ? id : DEFAULT_LAYER_ID
  }

  private resolveTextStyleId(id: TextStyleId | undefined): TextStyleId {
    return id && this.textStyles.has(id) ? id : DEFAULT_TEXT_STYLE_ID
  }

  /** Rebuilds the dimension-style table, always keeping the base `ISO-25`. */
  private replaceDimStyles(styles: Iterable<DimStyle>): void {
    this.dimStyles.clear()
    for (const style of styles) this.dimStyles.set(style.id, style)
    if (!this.dimStyles.has(DEFAULT_DIM_STYLE_ID)) {
      const base = createDefaultDimStyle()
      this.dimStyles.set(base.id, base)
    }
  }

  private resolveDimStyleId(id: DimStyleId | undefined): DimStyleId {
    return id && this.dimStyles.has(id) ? id : DEFAULT_DIM_STYLE_ID
  }

  /** Remaps an entity's dangling layer / style references onto the bases. */
  private reconcile(entity: Entity): Entity {
    const onLayer = this.layers.has(entity.layerId)
      ? entity
      : assignEntityLayer(entity, DEFAULT_LAYER_ID)
    if (
      (onLayer.type === "text" ||
        onLayer.type === "mtext" ||
        onLayer.type === "attdef") &&
      !this.textStyles.has(onLayer.styleId)
    ) {
      return assignTextStyle(onLayer, DEFAULT_TEXT_STYLE_ID)
    }
    if (onLayer.type === "dimension" && !this.dimStyles.has(onLayer.styleId)) {
      return assignDimStyle(onLayer, DEFAULT_DIM_STYLE_ID)
    }
    if (onLayer.type === "insert" && onLayer.attributes) {
      return {
        ...onLayer,
        attributes: onLayer.attributes.map((attribute) => ({
          ...attribute,
          layerId: this.resolveLayerId(attribute.layerId),
          styleId: this.resolveTextStyleId(attribute.styleId),
        })),
      }
    }
    return onLayer
  }

  getEntities(): Entity[] {
    return Array.from(this.entities.values())
  }

  get size(): number {
    return this.entities.size
  }

  get(id: EntityId): Entity | undefined {
    return this.entities.get(id)
  }

  has(id: EntityId): boolean {
    return this.entities.has(id)
  }

  add(entity: Entity): Entity {
    this.entities.set(entity.id, entity)
    this.emit()
    return entity
  }

  /** Adds several entities at once, emitting a single change event. */
  addMany(entities: Iterable<Entity>): void {
    let count = 0
    for (const entity of entities) {
      this.entities.set(entity.id, entity)
      count += 1
    }
    if (count > 0) this.emit()
  }

  /** Replaces an existing entity (same id) or adds it if new. */
  update(entity: Entity): void {
    this.entities.set(entity.id, entity)
    this.emit()
  }

  /** Replaces several entities at once, emitting a single change event. */
  updateMany(entities: Iterable<Entity>): void {
    let count = 0
    for (const entity of entities) {
      this.entities.set(entity.id, entity)
      count += 1
    }
    if (count > 0) this.emit()
  }

  remove(id: EntityId): boolean {
    const removed = this.entities.delete(id)
    if (removed) this.emit()
    return removed
  }

  removeMany(ids: Iterable<EntityId>): number {
    let count = 0
    for (const id of ids) {
      if (this.entities.delete(id)) count += 1
    }
    if (count > 0) this.emit()
    return count
  }

  /** Those of `ids` the drawing holds, each with its index, in the drawing's order. */
  placesOf(ids: Iterable<EntityId>): PlacedEntity[] {
    const wanted = new Set(ids)
    const placed: PlacedEntity[] = []
    let index = 0
    for (const entity of this.entities.values()) {
      if (wanted.has(entity.id)) placed.push({ entity, index })
      index += 1
    }
    return placed
  }

  /**
   * Puts objects back at the indices {@link placesOf} found them at, which
   * undo owes what a command removed: AutoCAD's U unerases an object where it
   * was, so `ERASE _L` and the paint order still see it older than what was
   * drawn after it (pieces/p262, p264). One the drawing still holds under its
   * id is moved there. Valid only against the drawing as it was right after
   * the removal, which the undo stack guarantees.
   */
  restoreMany(placed: readonly PlacedEntity[]): void {
    if (placed.length === 0) return
    const sorted = [...placed].sort((a, b) => a.index - b.index)
    const moving = new Set(sorted.map((place) => place.entity.id))
    const rest = [...this.entities.values()].filter((e) => !moving.has(e.id))
    this.entities.clear()
    let next = 0
    const putDue = () => {
      while (next < sorted.length && sorted[next].index <= this.entities.size) {
        const { entity } = sorted[next++]
        this.entities.set(entity.id, entity)
      }
    }
    for (const entity of rest) {
      putDue()
      this.entities.set(entity.id, entity)
    }
    for (; next < sorted.length; next++) {
      this.entities.set(sorted[next].entity.id, sorted[next].entity)
    }
    this.emit()
  }

  clear(): void {
    if (this.entities.size === 0) return
    this.entities.clear()
    this.emit()
  }

  /**
   * Finds the entity on top of those whose outline is within `tolerance`
   * world units of `point`, or `null` when nothing is close enough. Delegates to
   * {@link pickAll} so the two can never disagree about which object is on top.
   */
  pick(point: Vec2, tolerance: number): Entity | null {
    return this.pickAll(point, tolerance)[0] ?? null
  }

  /**
   * Every pickable entity whose outline is within `tolerance` of `point`,
   * ordered exactly the way {@link pick} chooses: whatever is drawn in front
   * first (a hatch is behind its boundary), then the most recently drawn,
   * however near the others lie — AutoCAD's `Select objects:` and TRIM take
   * the newer of two lines in the pick box though the pick is nearer the
   * older (probes trim/p257, p400–p403). This is the candidate list selection
   * cycling walks.
   */
  pickAll(point: Vec2, tolerance: number): Entity[] {
    return this.pickAllBy(
      (entity) => distanceToEntity(entity, point, this.lookup),
      tolerance
    )
  }

  pickAllBy(
    distanceOf: (entity: Entity) => number,
    tolerance: number,
    locked = false
  ): Entity[] {
    const hits: { entity: Entity; order: number }[] = []
    let order = 0
    for (const entity of this.entities.values()) {
      order += 1
      if (
        !(locked
          ? this.isEntitySelectable(entity)
          : this.isEntityEditable(entity))
      ) {
        continue
      }
      if (distanceOf(entity) <= tolerance) hits.push({ entity, order })
    }
    hits.sort(
      (a, b) =>
        entityDrawOrder(b.entity) - entityDrawOrder(a.entity) ||
        b.order - a.order
    )
    return hits.map((hit) => hit.entity)
  }
}

/** Whether `entity`, or an attribute of it, is drawn in text style `id`. */
function usesTextStyle(entity: Entity, id: TextStyleId): boolean {
  switch (entity.type) {
    case "text":
    case "mtext":
    case "attdef":
      return entity.styleId === id
    case "insert":
      return (entity.attributes ?? []).some((a) => a.styleId === id)
    case "line":
    case "circle":
    case "arc":
    case "ellipse":
    case "spline":
    case "polyline":
    case "polyline3d":
    case "dimension":
    case "hatch":
      return false
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}
