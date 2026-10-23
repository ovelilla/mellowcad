import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { Axes3, arbitraryAxis, axesToWorld, worldToAxes } from "../geometry/ocs"
import { DocumentReader } from "../domain/Document"
import {
  BlockDefinition,
  BlockId,
  BlockLookup,
  Entity,
  EntityId,
  distanceToEntity,
  entityFromOcs,
  entityInOcs,
} from "../domain/entities"
import { Layer, LayerId } from "../domain/layers"
import { LinetypeId } from "../domain/linetypes"
import { Lineweight } from "../domain/lineweights"
import { TextStyle, TextStyleId } from "../domain/textStyles"
import { DimStyle, DimStyleId } from "../domain/dimStyles"
import { DocumentSettings } from "../domain/units"
import { Ucs, WORLD_UCS, createUcs, isUpright, ucsZAxis } from "../domain/ucs"
import { Viewport } from "./Viewport"

/**
 * The frame the tools work in: the object coordinate system of the UCS's Z
 * axis, a rotation of the WCS. AutoCAD asks for points in the UCS and keeps
 * each object in the OCS of its normal; in this frame the UCS's XY plane is
 * level — the case every tool already solves — and an object drawn on it has
 * exactly the coordinates it is stored with. With the UCS upright the frame is
 * the WCS and nothing is converted.
 *
 * Objects are converted once each (the drawing's are immutable), and one read
 * into the frame goes back as the very object it was read from, so an edit
 * that leaves it alone, and the undo of one that does not, are exact.
 */
export class UcsFrame {
  /** The frame's axes in the WCS, or `null` when the frame is the WCS. */
  readonly axes: Axes3 | null
  /** The UCS as the frame reads it: always level. */
  readonly ucs: Ucs
  /** The view, its points read in the frame. */
  readonly viewport: Viewport
  /** The drawing, its objects and UCSs read in the frame. */
  readonly document: DocumentReader
  private readonly read = new WeakMap<Entity, Entity>()
  private readonly originals = new WeakMap<Entity, Entity>()

  constructor(
    /** The current UCS, in the WCS, this frame was made for. */
    readonly source: Ucs,
    viewport: Viewport,
    document: DocumentReader
  ) {
    const z = ucsZAxis(source)
    const axes =
      isUpright(source) || (Math.abs(z.x) < 1e-12 && Math.abs(z.y) < 1e-12)
        ? null
        : arbitraryAxis(z)
    this.axes = axes
    if (!axes) {
      this.ucs = source
      this.viewport = viewport
      this.document = document
      return
    }
    this.ucs = { ...ucsInAxes(source, axes), wcs: ucsInAxes(WORLD_UCS, axes) }
    this.viewport = viewport.inFrame(axes)
    this.document = new FramedDocument(document, this)
  }

  /** A drawing object as the frame reads it. */
  entityToFrame(entity: Entity): Entity {
    if (!this.axes) return entity
    const cached = this.read.get(entity)
    if (cached) return cached
    const framed = entityInOcs(entity, this.axes.z)
    this.read.set(entity, framed)
    this.originals.set(framed, entity)
    return framed
  }

  /** An object of the frame in the WCS: the one it was read from, if it is unchanged. */
  entityToWorld(entity: Entity): Entity {
    if (!this.axes) return entity
    return this.originals.get(entity) ?? entityFromOcs(entity, this.axes.z)
  }

  pointToWorld(point: Vec3): Vec3 {
    return this.axes ? axesToWorld(this.axes, point) : point
  }

  pointToFrame(point: Vec3): Vec3 {
    return this.axes ? worldToAxes(this.axes, point) : point
  }

  /** A UCS of the WCS as the frame reads it. */
  ucsToFrame(ucs: Ucs): Ucs {
    if (!this.axes) return ucs
    return ucs === this.source ? this.ucs : ucsInAxes(ucs, this.axes)
  }
}

/** `ucs` read in `axes`: level when its Z is theirs. */
function ucsInAxes(ucs: Ucs, axes: Axes3): Ucs {
  const origin = worldToAxes(axes, ucs.origin)
  const xAxis = worldToAxes(axes, ucs.xAxis)
  const yAxis = worldToAxes(axes, ucs.yAxis)
  const z = worldToAxes(axes, ucsZAxis(ucs))
  if (Math.abs(z.x) < 1e-12 && Math.abs(z.y) < 1e-12 && z.z > 0) {
    return createUcs(origin, xAxis) ?? { origin, xAxis, yAxis }
  }
  return { origin, xAxis, yAxis }
}

/** The drawing as the frame reads it: the same tables, its objects and UCSs turned. */
class FramedDocument implements DocumentReader {
  private settings: {
    source: DocumentSettings
    framed: DocumentSettings
  } | null = null

  constructor(
    private readonly source: DocumentReader,
    private readonly frame: UcsFrame
  ) {}

  get size(): number {
    return this.source.size
  }

  getSettings(): DocumentSettings {
    const settings = this.source.getSettings()
    if (this.settings?.source !== settings) {
      this.settings = {
        source: settings,
        framed: {
          ...settings,
          ucs: this.frame.ucsToFrame(settings.ucs),
          namedUcs: settings.namedUcs.map((entry) => ({
            name: entry.name,
            ucs: this.frame.ucsToFrame(entry.ucs),
          })),
        },
      }
    }
    return this.settings.framed
  }

  getEntities(): Entity[] {
    return this.source.getEntities().map((entity) => this.toFrame(entity))
  }

  get(id: EntityId): Entity | undefined {
    const entity = this.source.get(id)
    return entity && this.toFrame(entity)
  }

  has(id: EntityId): boolean {
    return this.source.has(id)
  }

  pick(point: Vec2, tolerance: number): Entity | null {
    return this.pickAll(point, tolerance)[0] ?? null
  }

  pickAll(point: Vec2, tolerance: number): Entity[] {
    const blocks = this.blockLookup()
    return this.pickAllBy(
      (entity) => distanceToEntity(entity, point, blocks),
      tolerance
    )
  }

  pickAllBy(
    distanceOf: (entity: Entity) => number,
    tolerance: number,
    locked = false
  ): Entity[] {
    return this.source
      .pickAllBy(
        (entity) => distanceOf(this.toFrame(entity)),
        tolerance,
        locked
      )
      .map((entity) => this.toFrame(entity))
  }

  getLayers(): Layer[] {
    return this.source.getLayers()
  }

  getLayer(id: LayerId): Layer | undefined {
    return this.source.getLayer(id)
  }

  getCurrentLayerId(): LayerId {
    return this.source.getCurrentLayerId()
  }

  getTextStyles(): TextStyle[] {
    return this.source.getTextStyles()
  }

  getTextStyle(id: TextStyleId): TextStyle | undefined {
    return this.source.getTextStyle(id)
  }

  getCurrentTextStyleId(): TextStyleId {
    return this.source.getCurrentTextStyleId()
  }

  getDimStyles(): DimStyle[] {
    return this.source.getDimStyles()
  }

  getDimStyle(id: DimStyleId): DimStyle | undefined {
    return this.source.getDimStyle(id)
  }

  getCurrentDimStyleId(): DimStyleId {
    return this.source.getCurrentDimStyleId()
  }

  /** A block's objects are in its own coordinates, which no frame changes. */
  getBlocks(): BlockDefinition[] {
    return this.source.getBlocks()
  }

  getBlock(id: BlockId): BlockDefinition | undefined {
    return this.source.getBlock(id)
  }

  blockLookup(): BlockLookup {
    return this.source.blockLookup()
  }

  resolveEntityColor(entity: Entity): string {
    return this.source.resolveEntityColor(entity)
  }

  resolveEntityLinetype(entity: Entity): LinetypeId {
    return this.source.resolveEntityLinetype(entity)
  }

  resolveEntityLineweight(entity: Entity): Lineweight {
    return this.source.resolveEntityLineweight(entity)
  }

  isEntityVisible(entity: Entity): boolean {
    return this.source.isEntityVisible(entity)
  }

  isEntitySelectable(entity: Entity): boolean {
    return this.source.isEntitySelectable(entity)
  }

  isEntityEditable(entity: Entity): boolean {
    return this.source.isEntityEditable(entity)
  }

  private toFrame(entity: Entity): Entity {
    return this.frame.entityToFrame(entity)
  }
}
