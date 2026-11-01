/**
 * The values AutoCAD's solid primitives offer as `<default>`, one set shared
 * by them all (solid/x01–x07): BOX and WEDGE share a length and a width; they,
 * CYLINDER, CONE and PYRAMID a height, kept with its sign (w09: `<-5.0000>`);
 * CYLINDER, CONE, SPHERE, TORUS and PYRAMID a radius, PYRAMID's the circle
 * its base is inscribed in (x01: `<9.8995>` after a circumscribed 7); CONE and
 * PYRAMID a top radius, 0 at first. A length or a width is the size made, a
 * negative one's or a doubled one's too (p10, w09). Per drawing and not saved,
 * as CIRCLERAD is (**unverified**: no OPEN probe).
 */
export interface SolidDefaults {
  length: number | null
  width: number | null
  height: number | null
  radius: number | null
  topRadius: number
  /** PYRAMID's sides and Type, which every PYRAMID starts with (y02). */
  sides: number
  inscribed: boolean
}

export function solidDefaults(): SolidDefaults {
  return {
    length: null,
    width: null,
    height: null,
    radius: null,
    topRadius: 0,
    sides: 4,
    inscribed: false,
  }
}

/** Back to a new drawing's: what each tool's `onNewDrawing` does. */
export function resetSolidDefaults(defaults: SolidDefaults): void {
  Object.assign(defaults, solidDefaults())
}
