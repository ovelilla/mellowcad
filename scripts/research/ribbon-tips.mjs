/**
 * Reads, for one culture, the words of the ribbon's tooltips the editor shows
 * (docs/plans/autocad-ui.md, §6, phase 5, block 1), each from where AutoCAD 2027 keeps it:
 *
 * - a command button's: its macro in acad.CUIX (`MenuGroup.cui`), whose `HelpString` is the
 *   description and `CLICommand` the command line's word (the help's "Description" and "Command
 *   Display Name"), and its entry in AcCommandToolTips.resources.dll, the extended tooltip's
 *   paragraphs, both by the macro's id (`ID_Line`);
 * - a control with no macro (a toggle, a combo, a gallery: `Ac…ToggleButton`, `LayerControl`):
 *   its `TT_<class>` entry in AcWindows.resources.dll, whose properties are the title, the
 *   description and the command;
 * - `Press F1 for more help`: AdWindows.resources.dll's ribbon tooltip template (`mHelpInfo`).
 *
 * The BAML is read without running anything: a RibbonToolTip dictionary's keys are its
 * DefAttributeKeyString records (0x26: a string's id and the value's position), their names its
 * StringInfo records (0x20), the values follow in position order, each from its
 * `…:RibbonToolTip_N` uid; a value's properties are records 0x24 (1 the command, 2 the title, 3
 * the description) and its TextBlocks' text records (0x10, with their inline runs) the paragraphs.
 *
 *   node scripts/research/ribbon-tips.mjs --lang es            prints the culture's words as JSON
 *   node scripts/research/ribbon-tips.mjs --lang ja --pack ~/autocad-packs/ja
 *
 * `--pack <folder>` reads a pack that is not installed: its acad.CUIX, AcWindows, AdWindows and
 * AcCommandToolTips .resources.dll, flat (open-pack.sh's 7zz takes them out of the installer's
 * acadlp.adix). See .claude/skills/autocad-research/SKILL.md.
 */
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { inflateRawSync } from "node:zlib"

import { cultureOf, language } from "./tables.mjs"

const INSTALL = "/mnt/c/Program Files/Autodesk/AutoCAD 2027"

/**
 * Where each tooltip's words are: an editor catalog key (`Ribbon.items`' ids and the controls'
 * own) and its macro (`ID_…`, `MM_…`) or control (`TT_…`). Cut with Base Point and the drop-downs
 * that only list take their shown member's.
 */
export const TIP_SOURCES = {
  line: "ID_Line",
  polyline: "ID_Pline",
  circle: "ID_CircleRad",
  circlediameter: "ID_CircleDia",
  circle2p: "ID_Circle2pt",
  circle3p: "ID_Circle3pt",
  arc: "ID_Arc3point",
  arcsce: "ID_ArcStCeEn",
  arccse: "ID_ArcCeStEn",
  rectangle: "ID_Rectang",
  polygon: "ID_Polygon",
  ellipsecenter: "ID_EllipseCe",
  ellipse: "ID_EllipseAx",
  ellipsearc: "ID_EllipseAr",
  hatch: "ID_Bhatch",
  splinefit: "ID_SURF_SPLINE_KNOT",
  splinecv: "ID_SURF_SPLINECV",
  xline: "ID_Xline",
  ray: "ID_Ray",
  point: "ID_PointMult",
  divide: "ID_Divide",
  measuresegments: "ID_Measure",
  region: "ID_Region",
  wipeout: "ID_Wipeout",
  polyline3d: "ID_3dpoly",
  move: "ID_Move",
  copy: "ID_Copy",
  stretch: "ID_Stretch",
  rotate: "ID_Rotate",
  mirror: "ID_Mirror",
  scale: "ID_Scale",
  trim: "ID_Trim",
  extend: "ID_Extend",
  fillet: "ID_Fillet",
  chamfer: "ID_Chamfer",
  array: "ID_RectangularArray",
  arraypath: "ID_PathArray",
  arraypolar: "ID_PolarArray",
  erase: "ID_Erase",
  explode: "ID_Explode",
  offset: "ID_Offset",
  pedit: "ID_Pedit",
  splinedit: "ID_Splinedit",
  break: "ID_Break",
  breakatpoint: "ID_BreakSele",
  join: "ID_Join",
  mtext: "ID_Mtext",
  text: "ID_Text",
  dimlinear: "ID_Dimlinear",
  dimaligned: "ID_Dimaligne",
  dimangular: "ID_Dimangula",
  dimradius: "ID_Dimradius",
  dimdiameter: "ID_Dimdiamet",
  textStyle: "ID_Style",
  dimensionStyle: "ID_Ddim",
  layerProperties: "TT_AcLayerCommandToggleButton",
  insert: "TT_AcInsertBlockGalleryControl",
  block: "ID_Bmake",
  attedit: "ID_EAttEdit",
  attdef: "ID_Attdef",
  matchprop: "ID_Matchprop",
  list: "ID_List",
  measure: "ID_Dist",
  measurearea: "ID_Area",
  id: "ID_Id",
  ptype: "ID_Ddptype",
  paste: "ID_Pasteclip",
  cutclip: "ID_Cutclip",
  copyclip: "ID_Copyclip",
  copybase: "ID_Copybase",
  createBlock: "ID_Bmake",
  dimspace: "ID_Dimspace",
  dimensionUpdate: "ID_DimstyleA",
  dimcontinue: "ID_Dimcontin",
  dimbaseline: "ID_Dimbaseli",
  ucsIcon: "TT_AcUcsiconToggleButton",
  viewCube: "TT_AcViewCubeToggleButton",
  ucs: "ID_Ucs",
  ucsWorld: "ID_UcsWorld",
  ucsX: "ID_UcsXAxRot",
  ucsY: "ID_UcsYAxRot",
  ucsZ: "ID_UcsZAxRot",
  ucsPrevious: "ID_UcsPrevio",
  ucsOrigin: "ID_UcsOrigin",
  ucsZAxis: "ID_UcsZAxVec",
  ucs3Point: "ID_Ucs3point",
  ucsView: "ID_UcsView",
  ucsObject: "ID_UcsObject",
  ucsFace: "ID_UcsFace",
  propertiesPalette: "TT_AcPropertiesCommandToggleButton",
  blocksPalette: "TT_AcBlocksPaletteCommandToggleButton",
  commandLine: "TT_AcCommandLineCommandToggleButton",
  pan: "MM_1572",
  orbit: "ID_Constrained_Orbit",
  zoomExtents: "ID_ZoomExten",
  zoomWindow: "ID_ZoomWindo",
  zoomPrevious: "ID_ZoomPrevi",
  zoomIn: "ID_ZoomIn",
  zoomOut: "ID_ZoomOut",
  box: "ID_Box",
  cylinder: "ID_Cylinder",
  cone: "ID_Cone",
  sphere: "ID_Sphere",
  pyramid: "ID_Pyramid",
  wedge: "ID_Wedge",
  torus: "ID_Torus",
  extrude: "ID_Extrude2",
  revolve: "ID_Revolve2",
  presspull: "ID_Presspull",
  filletedge: "ID_FILLET_EDGE",
  chamferedge: "ID_CHAMFER_EDGE",
  slice: "ID_Slice",
  union: "ID_Union",
  subtract: "ID_Subtract",
  intersect: "ID_Intersect",
  solideditextrude: "ID_FaceExtru",
  solidedittaper: "ID_FaceTaper",
  solideditmove: "ID_FaceMove",
  solideditcopy: "ID_FaceCopy",
  solideditoffset: "ID_FaceOffse",
  solideditrotate: "ID_FaceRotat",
  solideditdelete: "ID_FaceDel",
  insertAttedit: "ID_EAttEdit",
  defineAttributes: "ID_Attdef",
  multilineText: "ID_Mtext",
  dimensionsLinear: "ID_Dimlinear",
  dimensionsAligned: "ID_Dimaligne",
  dimensionsAngular: "ID_Dimangula",
  dimensionsRadius: "ID_Dimradius",
  dimensionsDiameter: "ID_Dimdiamet",
  axisX: "ID_UcsXAxRot",
  axisY: "ID_UcsYAxRot",
  axisZ: "ID_UcsZAxRot",
  view3d: "ID_UcsView",
  world: "ID_UcsWorld",
  previous: "ID_UcsPrevio",
  attModeNormal: "TT_AcAttmode1",
  attModeOn: "TT_AcAttmode2",
  attModeOff: "TT_AcAttmode0",
  // The controls with no item of their own, and Properties' dialog launcher.
  layer: "TT_LayerControl",
  color: "TT_AcObjectColorCombo",
  lineweight: "TT_AcLineWeightCombo",
  linetype: "TT_AcLinetypeCombo",
  textStyleList: "TT_AcTextStyleCombo",
  dimensionStyleList: "TT_AcDimensionStyleCombo",
  visualStyleList: "TT_AcVisualStyleGalleryControl",
  propertiesLauncher: "ID_Modify",
  // Array Creation's fields and toggles (`ribbon.mjs --source RBN_01740514`),
  // whose RibbonToolTips name no command.
  arrayColumns: "TT_AcRectArrayColumnCount",
  arrayColumnSpacing: "TT_AcRectArrayColumnSpacing",
  arrayRows: "TT_AcArrayRowCount",
  arrayRowSpacing: "TT_AcArrayRowSpacing",
  arrayRowElevation: "TT_AcArrayRowElevation",
  arrayLevels: "TT_AcArrayLevelCount",
  arrayLevelSpacing: "TT_AcArrayLevelSpacing",
  arrayLevelTotal: "TT_AcArrayLevelSpan",
  arrayPolarItems: "TT_AcPolarArrayItemCount",
  arrayAngleBetween: "TT_AcPolarArrayItemSpacing",
  arrayFillAngle: "TT_AcPolarArrayItemSpan",
  arrayPathItems: "TT_AcPathArrayItemCount",
  arrayItemSpacing: "TT_AcPathArrayItemSpacing",
  arrayAssociative: "TT_AcArrayAssociativity",
  arrayRotateItems: "TT_AcPolarArrayRotateItemsToggle",
  arrayDirection: "TT_AcPolarArrayDirection",
  arrayDivide: "TT_AcPathArrayDivideMethod",
  arrayMeasure: "TT_AcPathArrayMeasureMethod",
  arrayAlignItems: "TT_AcPathArrayAlignItemsToggle",
  arrayClose: "TT_AcArrayCreationClose",
  hatchPickPoints: "TT_AcHatchPickPointsButton",
  hatchSelect: "TT_AcHatchSelectObjectsButton",
  hatchType: "TT_AcHatchTypeCombo",
  hatchSolid: "TT_AcHatchTypeSolid",
  hatchPattern: "TT_AcHatchTypePattern",
  hatchAngle: "TT_AcHatchPatternAngleSlider",
  hatchScale: "TT_AcHatchScaleSpinner",
  hatchClose: "MM_1928",
}

function zipParts(path) {
  const zip = readFileSync(path)
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  let p = zip.readUInt32LE(end + 16)
  const out = new Map()
  for (let i = zip.readUInt16LE(end + 10); i > 0; i--) {
    const method = zip.readUInt16LE(p + 10)
    const size = zip.readUInt32LE(p + 20)
    const nameLength = zip.readUInt16LE(p + 28)
    const extra = zip.readUInt16LE(p + 30)
    const comment = zip.readUInt16LE(p + 32)
    const header = zip.readUInt32LE(p + 42)
    const name = zip.toString("utf8", p + 46, p + 46 + nameLength)
    p += 46 + nameLength + extra + comment
    const start =
      header + 30 + zip.readUInt16LE(header + 26) + zip.readUInt16LE(header + 28)
    const raw = zip.subarray(start, start + size)
    out.set(name, (method === 8 ? inflateRawSync(raw) : raw).toString("utf8"))
  }
  return out
}

const decode = (text) =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&amp;/g, "&")

/** Each macro's name, description and command line word, by its UID. */
export function cuixMacros(file) {
  const xml = zipParts(file).get("MenuGroup.cui") ?? ""
  const out = new Map()
  for (const m of xml.matchAll(/<MenuMacro UID="([^"]+)">([\s\S]*?)<\/MenuMacro>/g)) {
    const field = (tag) => {
      const f = new RegExp(`<${tag}\\b[^>]*>([^<]*)</${tag}>`).exec(m[2])
      return f ? decode(f[1]) : undefined
    }
    out.set(m[1], {
      title: field("Name"),
      description: field("HelpString"),
      command: field("CLICommand"),
    })
  }
  return out
}

const MSBAML = Buffer.from("MSBAML", "utf16le")

function int7(bytes, p) {
  let v = 0
  let shift = 0
  for (;;) {
    const b = bytes[p++]
    v |= (b & 0x7f) << shift
    if (!(b & 0x80)) return [v, p]
    shift += 7
  }
}

// A text record (0x10) at p — its size, then its length-prefixed UTF-8 — or null.
function textAt(bytes, p, end) {
  if (bytes[p] !== 0x10) return null
  const [size, q] = int7(bytes, p + 1)
  const [len, r] = int7(bytes, q)
  if (size !== r - (p + 1) + len || r + len > end || len === 0) return null
  const text = bytes.toString("utf8", r, r + len)
  return text.includes("�") ? null : { text, next: r + len }
}

// Each TextBlock's text, its inline runs joined (`drawn parallel to the ` + `XY` + ` plane`).
function paragraphs(bytes, from, to) {
  const latin = bytes.toString("latin1", from, to)
  const blocks = [...latin.matchAll(/TextBlock_\d+\xfe\xff/g)].map(
    (m) => from + m.index + m[0].length
  )
  const out = []
  blocks.forEach((start, i) => {
    const end = i + 1 < blocks.length ? blocks[i + 1] : to
    let text = ""
    for (let p = start; p < end; p++) {
      const t = textAt(bytes, p, end)
      if (t) {
        text += t.text
        p = t.next - 1
      }
    }
    if (text.trim()) out.push(text.trim())
  })
  return out
}

// The value's property records (0x24): attribute id → its text.
function properties(bytes, from, to) {
  const props = {}
  for (let p = from; p < to; p++) {
    if (bytes[p] !== 0x24) continue
    const [, q] = int7(bytes, p + 1)
    const attr = bytes.readUInt16LE(q)
    if (attr > 8) continue
    const [len, r] = int7(bytes, q + 2)
    if (len === 0 || r + len > to) continue
    const text = bytes.toString("utf8", r, r + len)
    if (text.includes("�") || /[\x00-\x08]/.test(text)) continue
    if (!(attr in props)) props[attr] = text
    p = r + len - 1
  }
  return props
}

/** Every RibbonToolTip of a resources DLL's BAML dictionaries, by key. */
export function bamlTips(file) {
  const bytes = readFileSync(file)
  const starts = []
  for (let at = bytes.indexOf(MSBAML); at >= 0; at = bytes.indexOf(MSBAML, at + 1))
    starts.push(at)
  const out = new Map()
  starts.forEach((start, b) => {
    const end = b + 1 < starts.length ? starts[b + 1] : bytes.length
    const latin = bytes.toString("latin1", start, end)
    if (!latin.includes("RibbonToolTip_")) return
    const strings = new Map()
    for (const m of latin.matchAll(/\x20([\s\S])([\s\S])([\s\S])([\s\S])/g)) {
      const len = m[4].charCodeAt(0)
      if (len === 0 || m[1].charCodeAt(0) !== 4 + len) continue
      const at = start + m.index + 5
      const name = bytes.toString("utf8", at, at + len)
      if (/^[\w.\-]+$/.test(name))
        strings.set(m[2].charCodeAt(0) | (m[3].charCodeAt(0) << 8), name)
    }
    const keys = []
    for (const m of latin.matchAll(/\x26\x09([\s\S]{2})[\s\S]{4}[\x00\x01][\x00\x01]/g)) {
      const id = m[1].charCodeAt(0) | (m[1].charCodeAt(1) << 8)
      keys.push({ name: strings.get(id), pos: bytes.readUInt32LE(start + m.index + 4) })
    }
    keys.sort((x, y) => x.pos - y.pos)
    const marks = [...latin.matchAll(/\w+:RibbonToolTip_\w+/g)].map((m) => start + m.index)
    // A dictionary that holds other values beside its tooltips cannot be paired this way.
    if (keys.length !== marks.length) return
    keys.forEach((key, i) => {
      if (!key.name) return
      const to = i + 1 < marks.length ? marks[i + 1] : end
      const props = properties(bytes, marks[i], to)
      out.set(key.name, {
        command: props[1],
        title: props[2],
        description: props[3],
        extended: paragraphs(bytes, marks[i], to),
      })
    })
  })
  return out
}

/** `Press F1 for more help`, from the ribbon tooltip's template (`mHelpInfo`'s TextBlock). */
export function pressF1(file) {
  const bytes = readFileSync(file)
  const at = bytes.indexOf(Buffer.from("mHelpInfo"))
  if (at < 0) return undefined
  const block = bytes.indexOf(Buffer.from("TextBlock_"), at)
  // The Text property (0x24 … 0x92 0xff): its length-prefixed text.
  for (let p = block; p < block + 80; p++) {
    if (bytes[p] !== 0x92 || bytes[p + 1] !== 0xff) continue
    const [len, r] = int7(bytes, p + 2)
    return bytes.toString("utf8", r, r + len)
  }
  return undefined
}

/**
 * A paragraph that ends in a colon introduces the illustration, which is not drawn here
 * (`For example:`): it is dropped, as is what is then left empty.
 */
const extendedText = (paras) =>
  paras.filter((p, i) => !(i === paras.length - 1 && /[:：]$/.test(p))).join("\n\n")

export function cultureTips(culture, pack) {
  const folder = pack ?? join(INSTALL, culture)
  const cuix =
    pack !== undefined
      ? join(pack, "acad.CUIX")
      : join(INSTALL, "UserDataCache", culture.toLowerCase(), "Support/acad.CUIX")
  for (const file of [cuix, join(folder, "AcWindows.resources.dll")])
    if (!existsSync(file)) throw new Error(`${file} is missing`)
  const macros = cuixMacros(cuix)
  const extended = bamlTips(join(folder, "AcCommandToolTips.resources.dll"))
  const controls = bamlTips(join(folder, "AcWindows.resources.dll"))
  const tips = {}
  for (const [key, source] of Object.entries(TIP_SOURCES)) {
    const tip = source.startsWith("TT_")
      ? controls.get(source)
      : { ...macros.get(source), extended: extended.get(source)?.extended ?? [] }
    if (!tip) {
      tips[key] = null
      continue
    }
    tips[key] = {
      title: tip.title,
      description: tip.description,
      command: tip.command,
      extended: extendedText(tip.extended ?? []),
    }
  }
  return { pressF1: pressF1(join(folder, "AdWindows.resources.dll")), tips }
}

if (process.argv[1]?.endsWith("ribbon-tips.mjs")) {
  const { lang, rest } = language(process.argv.slice(2))
  const packAt = rest.indexOf("--pack")
  const pack = packAt >= 0 ? rest[packAt + 1] : undefined
  console.log(JSON.stringify(cultureTips(cultureOf(lang), pack), null, 1))
}
