import { EntityColor } from "../../domain/colors"

/**
 * The RGB of each AutoCAD Color Index, 1 to 255, six hex digits apiece, as
 * AutoCAD 2027 gives them (its AcCmColor, read one by one in the desktop on
 * 2026-11-07, probe dxf/d001-aci.sh): 1–9 the named and grey ones, then each
 * hue in ten shades, then 250–255 the greys.
 */
const ACI_RGB =
  "ff0000ffff0000ff0000ffff0000ffff00ffffffff808080c0c0c0ff0000" +
  "ff7f7fcc0000cc6666990000994c4c7f00007f3f3f4c00004c2626ff3f00" +
  "ff9f7fcc3300cc7f66992600995f4c7f1f007f4f3f4c13004c2f26ff7f00" +
  "ffbf7fcc6600cc9966994c0099724c7f3f007f5f3f4c26004c3926ffbf00" +
  "ffdf7fcc9900ccb26699720099854c7f5f007f6f3f4c39004c4226ffff00" +
  "ffff7fcccc00cccc6699990099994c7f7f007f7f3f4c4c004c4c26bfff00" +
  "dfff7f99cc00b2cc6672990085994c5f7f006f7f3f394c00424c267fff00" +
  "bfff7f66cc0099cc664c990072994c3f7f005f7f3f264c00394c263fff00" +
  "9fff7f33cc007fcc662699005f994c1f7f004f7f3f134c002f4c2600ff00" +
  "7fff7f00cc0066cc660099004c994c007f003f7f3f004c00264c2600ff3f" +
  "7fff9f00cc3366cc7f0099264c995f007f1f3f7f4f004c13264c2f00ff7f" +
  "7fffbf00cc6666cc9900994c4c9972007f3f3f7f5f004c26264c3900ffbf" +
  "7fffdf00cc9966ccb20099724c9985007f5f3f7f6f004c39264c4200ffff" +
  "7fffff00cccc66cccc0099994c9999007f7f3f7f7f004c4c264c4c00bfff" +
  "7fdfff0099cc66b2cc0072994c8599005f7f3f6f7f00394c26424c007fff" +
  "7fbfff0066cc6699cc004c994c7299003f7f3f5f7f00264c26394c003fff" +
  "7f9fff0033cc667fcc0026994c5f99001f7f3f4f7f00134c262f4c0000ff" +
  "7f7fff0000cc6666cc0000994c4c9900007f3f3f7f00004c26264c3f00ff" +
  "9f7fff3300cc7f66cc2600995f4c991f007f4f3f7f13004c2f264c7f00ff" +
  "bf7fff6600cc9966cc4c0099724c993f007f5f3f7f26004c39264cbf00ff" +
  "df7fff9900ccb266cc720099854c995f007f6f3f7f39004c42264cff00ff" +
  "ff7fffcc00cccc66cc990099994c997f007f7f3f7f4c004c4c264cff00bf" +
  "ff7fdfcc0099cc66b2990072994c857f005f7f3f6f4c00394c2642ff007f" +
  "ff7fbfcc0066cc669999004c994c727f003f7f3f5f4c00264c2639ff003f" +
  "ff7f9fcc0033cc667f990026994c5f7f001f7f3f4f4c00134c262f333333" +
  "5b5b5b848484adadadd6d6d6ffffff"

/**
 * An index colour as the model holds colours, by its RGB. WHY not the index:
 * the model has no index colours (`docs/next-dxf.md`), so 30 opens as the
 * orange it shows. 0 (ByBlock) and 256 (ByLayer) are no colour of their own.
 */
export function aciColor(index: number): EntityColor | null {
  if (!Number.isInteger(index) || index < 1 || index > 255) return null
  return `#${ACI_RGB.slice((index - 1) * 6, index * 6)}`
}

/** A true colour (DXF 420, 0x00RRGGBB) as the model holds colours. */
export function trueColor(value: number): EntityColor | null {
  if (!Number.isInteger(value) || value < 0) return null
  return `#${(value & 0xffffff).toString(16).padStart(6, "0")}`
}

/**
 * The index colour a true colour is written as: the index whose RGB it is
 * (`exact`, the lowest one, so white is 7, not 255), else the nearest, which
 * AutoCAD writes beside the true colour (420) for programs that read only 62.
 */
export function aciIndex(rgb: number): { index: number; exact: boolean } {
  const r = (rgb >> 16) & 0xff
  const g = (rgb >> 8) & 0xff
  const b = rgb & 0xff
  let index = 7
  let nearest = Infinity
  for (let i = 1; i <= 255; i++) {
    const v = Number.parseInt(ACI_RGB.slice((i - 1) * 6, i * 6), 16)
    if (v === rgb) return { index: i, exact: true }
    const d =
      (((v >> 16) & 0xff) - r) ** 2 +
      (((v >> 8) & 0xff) - g) ** 2 +
      ((v & 0xff) - b) ** 2
    if (d < nearest) {
      nearest = d
      index = i
    }
  }
  return { index, exact: false }
}
