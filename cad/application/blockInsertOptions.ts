import type { Vec3 } from "../geometry/Vec3"
import {
  DocumentSettings,
  formatAngle,
  formatLength,
  parseAngleDegrees,
  parseNumber,
} from "../domain/units"

/**
 * The Blocks palette's Options, those -INSERT does here (2027 help, Blocks
 * Palette: "When checked, you specify the insertion point when inserting the
 * block … When cleared, previously specified coordinates are used", and so
 * Scale and Rotation). AutoCAD keeps them for the program, not the drawing
 * (its profile's Dialogs\BlockStream holds the Scale, Uniform Scale and
 * Rotation checks), so they outlive NEW and OPEN and no U takes one back.
 * The checks start as that profile's: only the insertion point is asked
 * (desktop blocks/d06-3). They last the page's life: AutoCAD's profile keeps
 * them, and the view, across sessions.
 */
export interface BlockInsertOptions {
  /** Insertion Point: picked when the block is inserted, else {@link at}. */
  readonly pickPoint: boolean
  /** In the UCS, as the fields are read. */
  readonly at: Vec3
  /** Scale: asked when the block is inserted, else {@link scaleX} and Y. */
  readonly pickScale: boolean
  /** The drop-down's Uniform Scale: X alone, for X and Y. */
  readonly uniformScale: boolean
  readonly scaleX: number
  readonly scaleY: number
  /** Rotation: asked when the block is inserted, else {@link angle}. */
  readonly pickRotation: boolean
  /** Degrees from the UCS's X axis. */
  readonly angle: number
}

export const BLOCK_INSERT_OPTIONS: BlockInsertOptions = {
  pickPoint: true,
  at: { x: 0, y: 0, z: 0 },
  pickScale: false,
  uniformScale: false,
  scaleX: 1,
  scaleY: 1,
  pickRotation: false,
  angle: 0,
}

/**
 * How the Blocks palette shows the blocks, its view drop-down's entries in
 * their order (AcWindows' ViewModeSwitcher, Details left out: its one column,
 * Annotative / Dynamic, is no block's here). The palette opens on the
 * profile's CurrentViewMode 1, Large Icon.
 */
export type BlocksView = "extraLarge" | "large" | "medium" | "small" | "list"

export const BLOCKS_VIEWS: readonly BlocksView[] = [
  "extraLarge",
  "large",
  "medium",
  "small",
  "list",
]

/** The checks and the drop-down, which a host turns on and off. */
export type BlockInsertCheck =
  "pickPoint" | "pickScale" | "uniformScale" | "pickRotation"

/** The fields a host types into. */
export type BlockInsertField = "x" | "y" | "z" | "scaleX" | "scaleY" | "angle"

/** The Options as the palette shows them: each value written by the drawing's units. */
export interface BlockInsertUi {
  readonly pickPoint: boolean
  readonly x: string
  readonly y: string
  readonly z: string
  readonly pickScale: boolean
  readonly uniformScale: boolean
  readonly scaleX: string
  readonly scaleY: string
  readonly pickRotation: boolean
  readonly angle: string
}

export function blockInsertUi(
  options: BlockInsertOptions,
  settings: DocumentSettings
): BlockInsertUi {
  return {
    pickPoint: options.pickPoint,
    x: formatLength(options.at.x, settings),
    y: formatLength(options.at.y, settings),
    z: formatLength(options.at.z, settings),
    pickScale: options.pickScale,
    uniformScale: options.uniformScale,
    scaleX: factorText(options.scaleX),
    scaleY: factorText(options.scaleY),
    pickRotation: options.pickRotation,
    angle: formatAngle(options.angle, settings),
  }
}

/**
 * A field's typed text read as AutoCAD reads a number or an angle, or null
 * where it takes none: a scale of 0 reflects nothing and squashes the block,
 * which -INSERT refuses too (`Value must be nonzero.`, probe blocks/p205).
 */
export function typedBlockInsertValue(
  options: BlockInsertOptions,
  field: BlockInsertField,
  text: string
): BlockInsertOptions | null {
  if (field === "angle") {
    const angle = parseAngleDegrees(text)
    return angle === null ? null : { ...options, angle }
  }
  const value = parseNumber(text)
  if (value === null) return null
  switch (field) {
    case "x":
    case "y":
    case "z":
      return { ...options, at: { ...options.at, [field]: value } }
    case "scaleX":
    case "scaleY":
      return value === 0 ? null : { ...options, [field]: value }
  }
}

/**
 * What the palette's options leave to ask when it inserts: null where the
 * value is asked, else the value. With Uniform Scale, X stands for Y too.
 */
export interface PaletteInsert {
  readonly at: Vec3 | null
  readonly scale: { readonly x: number; readonly y: number } | null
  /** Degrees from the UCS's X axis. */
  readonly rotation: number | null
}

export function paletteInsert(options: BlockInsertOptions): PaletteInsert {
  return {
    at: options.pickPoint ? null : options.at,
    scale: options.pickScale
      ? null
      : {
          x: options.scaleX,
          y: options.uniformScale ? options.scaleX : options.scaleY,
        },
    rotation: options.pickRotation ? null : options.angle,
  }
}

/**
 * A scale factor as -INSERT's `<default>` writes it, C's `%g`: `1`, `2.5`, six
 * significant digits (probes blocks/p02, p204); the palette's field shows `1`
 * too (desktop blocks/d06-3).
 */
export function factorText(factor: number): string {
  return String(Number(factor.toPrecision(6)))
}
