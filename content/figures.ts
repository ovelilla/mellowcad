import type { Bounds, DemoScript } from "@mellowcad/engine"

import { localFirst, type LocalFirstLabels } from "./demos/diagrams"
import {
  circleDiameter,
  endpointSnap,
  firstLine,
  offsetRectangle,
} from "./demos/docs"
import { sessions as osnapDashSessions } from "./demos/commands/-osnap"
import { sessions as orbit3dSessions } from "./demos/commands/3dorbit"
import { sessions as poly3dSessions } from "./demos/commands/3dpoly"
import { sessions as arcSessions } from "./demos/commands/arc"
import { sessions as areaSessions } from "./demos/commands/area"
import { sessions as arraySessions } from "./demos/commands/array"
import { sessions as arraypathSessions } from "./demos/commands/arraypath"
import { sessions as arraypolarSessions } from "./demos/commands/arraypolar"
import { sessions as arrayrectSessions } from "./demos/commands/arrayrect"
import { sessions as attdefSessions } from "./demos/commands/attdef"
import { sessions as attdispSessions } from "./demos/commands/attdisp"
import { sessions as atteditSessions } from "./demos/commands/attedit"
import { sessions as blockSessions } from "./demos/commands/block"
import { sessions as boxSessions } from "./demos/commands/box"
import { sessions as breakSessions } from "./demos/commands/break"
import { sessions as chamferSessions } from "./demos/commands/chamfer"
import { sessions as chamferedgeSessions } from "./demos/commands/chamferedge"
import { sessions as chpropSessions } from "./demos/commands/chprop"
import { sessions as circleSessions } from "./demos/commands/circle"
import { sessions as colorSessions } from "./demos/commands/color"
import { sessions as coneSessions } from "./demos/commands/cone"
import { sessions as copySessions } from "./demos/commands/copy"
import { sessions as copyclipSessions } from "./demos/commands/copyclip"
import { sessions as cylinderSessions } from "./demos/commands/cylinder"
import { sessions as dimalignedSessions } from "./demos/commands/dimaligned"
import { sessions as dimangularSessions } from "./demos/commands/dimangular"
import { sessions as dimbaselineSessions } from "./demos/commands/dimbaseline"
import { sessions as dimcontinueSessions } from "./demos/commands/dimcontinue"
import { sessions as dimdiameterSessions } from "./demos/commands/dimdiameter"
import { sessions as dimlinearSessions } from "./demos/commands/dimlinear"
import { sessions as dimradiusSessions } from "./demos/commands/dimradius"
import { sessions as dimspaceSessions } from "./demos/commands/dimspace"
import { sessions as dimstyleSessions } from "./demos/commands/dimstyle"
import { sessions as distSessions } from "./demos/commands/dist"
import { sessions as eatteditSessions } from "./demos/commands/eattedit"
import { sessions as ellipseSessions } from "./demos/commands/ellipse"
import { sessions as eraseSessions } from "./demos/commands/erase"
import { sessions as explodeSessions } from "./demos/commands/explode"
import { sessions as extendSessions } from "./demos/commands/extend"
import { sessions as extrudeSessions } from "./demos/commands/extrude"
import { sessions as filletSessions } from "./demos/commands/fillet"
import { sessions as filletedgeSessions } from "./demos/commands/filletedge"
import { sessions as hatchSessions } from "./demos/commands/hatch"
import { sessions as idSessions } from "./demos/commands/id"
import { sessions as insertSessions } from "./demos/commands/insert"
import { sessions as intersectSessions } from "./demos/commands/intersect"
import { sessions as joinSessions } from "./demos/commands/join"
import { sessions as layerSessions } from "./demos/commands/layer"
import { sessions as lineSessions } from "./demos/commands/line"
import { sessions as linetypeSessions } from "./demos/commands/linetype"
import { sessions as listSessions } from "./demos/commands/list"
import { sessions as ltscaleSessions } from "./demos/commands/ltscale"
import { sessions as lweightSessions } from "./demos/commands/lweight"
import { sessions as masspropSessions } from "./demos/commands/massprop"
import { sessions as matchpropSessions } from "./demos/commands/matchprop"
import { sessions as mirrorSessions } from "./demos/commands/mirror"
import { sessions as moveSessions } from "./demos/commands/move"
import { sessions as mtextSessions } from "./demos/commands/mtext"
import { sessions as offsetSessions } from "./demos/commands/offset"
import { sessions as panSessions } from "./demos/commands/pan"
import { sessions as peditSessions } from "./demos/commands/pedit"
import { sessions as planSessions } from "./demos/commands/plan"
import { sessions as plineSessions } from "./demos/commands/pline"
import { sessions as polygonSessions } from "./demos/commands/polygon"
import { sessions as presspullSessions } from "./demos/commands/presspull"
import { sessions as propertiesSessions } from "./demos/commands/properties"
import { sessions as purgeSessions } from "./demos/commands/purge"
import { sessions as pyramidSessions } from "./demos/commands/pyramid"
import { sessions as rectangSessions } from "./demos/commands/rectang"
import { sessions as redoSessions } from "./demos/commands/redo"
import { sessions as regionSessions } from "./demos/commands/region"
import { sessions as revolveSessions } from "./demos/commands/revolve"
import { sessions as rotateSessions } from "./demos/commands/rotate"
import { sessions as scaleSessions } from "./demos/commands/scale"
import { sessions as sectionSessions } from "./demos/commands/section"
import { sessions as sliceSessions } from "./demos/commands/slice"
import { sessions as snapSessions } from "./demos/commands/snap"
import { sessions as solideditSessions } from "./demos/commands/solidedit"
import { sessions as sphereSessions } from "./demos/commands/sphere"
import { sessions as splineSessions } from "./demos/commands/spline"
import { sessions as splineditSessions } from "./demos/commands/splinedit"
import { sessions as stretchSessions } from "./demos/commands/stretch"
import { sessions as styleSessions } from "./demos/commands/style"
import { sessions as subtractSessions } from "./demos/commands/subtract"
import { sessions as textSessions } from "./demos/commands/text"
import { sessions as texteditSessions } from "./demos/commands/textedit"
import { sessions as torusSessions } from "./demos/commands/torus"
import { sessions as trimSessions } from "./demos/commands/trim"
import { sessions as ucsSessions } from "./demos/commands/ucs"
import { sessions as ucsiconSessions } from "./demos/commands/ucsicon"
import { sessions as undoSessions } from "./demos/commands/undo"
import { sessions as unionSessions } from "./demos/commands/union"
import { sessions as unitsSessions } from "./demos/commands/units"
import { sessions as viewSessions } from "./demos/commands/view"
import { sessions as vscurrentSessions } from "./demos/commands/vscurrent"
import { sessions as wedgeSessions } from "./demos/commands/wedge"
import { sessions as zoomSessions } from "./demos/commands/zoom"
import { EXERCISE_SESSIONS } from "./demos/exercises/sessions"
import { GUIDE_SESSIONS } from "./demos/guides/sessions"
import { hero, heroDrawing } from "./demos/hero"
import {
  crossingSelection,
  osnapTangent,
  otrack,
  polar,
  windowSelection,
} from "./demos/precision"
import { conceptualSolid, hiddenSolid, wireframeSolid } from "./demos/solids"
import {
  annotateGroup,
  drawGroup,
  modifyGroup,
  organizeGroup,
} from "./demos/toolset"

export interface FigureSpec {
  readonly script: DemoScript
  readonly width: number
  readonly height: number
  /** Screen padding around the framed drawing (stills only). */
  readonly padding?: number
  /** What a still frames, when the drawing's own extents are not enough. */
  readonly frame?: Bounds
  /**
   * Show the editor's own last frame — cursor, markers, tooltips — rather than
   * a still of the drawing. For figures that are about the aids.
   */
  readonly live?: boolean
}

/**
 * The hero: the flange drafted in plan, its objects plotted stroke by stroke,
 * then modelled as a solid and seen as the editor's last frame from the step
 * that turns the view (-VIEW's answer). Its plan's frame is set by hand
 * because a dimension's text runs past its definition points, which is all a
 * drawing's extents know about.
 */
export const HERO_FIGURE = {
  script: hero,
  /** The flange drafted, the steps whose objects are plotted in plan. */
  drawing: heroDrawing,
  width: 720,
  height: 480,
  padding: 12,
  frame: { min: { x: -78, y: -62 }, max: { x: 104, y: 86 } },
  drafted: heroDrawing.actions.length,
  turn:
    hero.actions.findIndex(
      (action) => action.kind === "command" && action.text === "_-VIEW"
    ) + 1,
} satisfies FigureSpec & {
  readonly drawing: DemoScript
  readonly drafted: number
  readonly turn: number
}

export const FIGURES = {
  osnap: { script: osnapTangent, width: 320, height: 220, live: true },
  otrack: { script: otrack, width: 320, height: 220, live: true },
  polar: { script: polar, width: 320, height: 220, live: true },
  window: { script: windowSelection, width: 320, height: 220, live: true },
  crossing: { script: crossingSelection, width: 320, height: 220, live: true },
  draw: { script: drawGroup, width: 240, height: 150, padding: 14 },
  modify: { script: modifyGroup, width: 240, height: 150, padding: 14 },
  annotate: {
    script: annotateGroup,
    width: 240,
    height: 150,
    padding: 8,
    frame: { min: { x: -4, y: -4 }, max: { x: 104, y: 68 } },
  },
  organize: { script: organizeGroup, width: 240, height: 150, padding: 14 },
  wireframe: { script: wireframeSolid, width: 320, height: 200, live: true },
  hidden: { script: hiddenSolid, width: 320, height: 200, live: true },
  conceptual: { script: conceptualSolid, width: 320, height: 200, live: true },
} satisfies Record<string, FigureSpec>

/** The figures that carry words, built in the page's language. */
export const DIAGRAMS = {
  localFirst: (labels: LocalFirstLabels) => ({
    script: localFirst(labels),
    width: 560,
    height: 250,
    padding: 8,
  }),
} satisfies Record<string, (labels: never) => FigureSpec>

export type FigureId = keyof typeof FIGURES

/**
 * The sessions of the commands' own pages (`content/demos/commands/`), each
 * named after its command's slug (`offset`): the page of a command with notes
 * shows it.
 */
export const COMMAND_SESSIONS = {
  ...osnapDashSessions,
  ...orbit3dSessions,
  ...poly3dSessions,
  ...arcSessions,
  ...areaSessions,
  ...arraySessions,
  ...arraypathSessions,
  ...arraypolarSessions,
  ...arrayrectSessions,
  ...attdefSessions,
  ...attdispSessions,
  ...atteditSessions,
  ...blockSessions,
  ...boxSessions,
  ...breakSessions,
  ...chamferSessions,
  ...chamferedgeSessions,
  ...chpropSessions,
  ...circleSessions,
  ...colorSessions,
  ...coneSessions,
  ...copySessions,
  ...copyclipSessions,
  ...cylinderSessions,
  ...dimalignedSessions,
  ...dimangularSessions,
  ...dimbaselineSessions,
  ...dimcontinueSessions,
  ...dimdiameterSessions,
  ...dimlinearSessions,
  ...dimradiusSessions,
  ...dimspaceSessions,
  ...dimstyleSessions,
  ...distSessions,
  ...eatteditSessions,
  ...ellipseSessions,
  ...eraseSessions,
  ...explodeSessions,
  ...extendSessions,
  ...extrudeSessions,
  ...filletSessions,
  ...filletedgeSessions,
  ...hatchSessions,
  ...idSessions,
  ...insertSessions,
  ...intersectSessions,
  ...joinSessions,
  ...layerSessions,
  ...lineSessions,
  ...linetypeSessions,
  ...listSessions,
  ...ltscaleSessions,
  ...lweightSessions,
  ...masspropSessions,
  ...matchpropSessions,
  ...mirrorSessions,
  ...moveSessions,
  ...mtextSessions,
  ...offsetSessions,
  ...panSessions,
  ...peditSessions,
  ...planSessions,
  ...plineSessions,
  ...polygonSessions,
  ...presspullSessions,
  ...propertiesSessions,
  ...purgeSessions,
  ...pyramidSessions,
  ...rectangSessions,
  ...redoSessions,
  ...regionSessions,
  ...revolveSessions,
  ...rotateSessions,
  ...scaleSessions,
  ...sectionSessions,
  ...sliceSessions,
  ...snapSessions,
  ...solideditSessions,
  ...sphereSessions,
  ...splineSessions,
  ...splineditSessions,
  ...stretchSessions,
  ...styleSessions,
  ...subtractSessions,
  ...textSessions,
  ...texteditSessions,
  ...torusSessions,
  ...trimSessions,
  ...ucsSessions,
  ...ucsiconSessions,
  ...undoSessions,
  ...unionSessions,
  ...unitsSessions,
  ...viewSessions,
  ...vscurrentSessions,
  ...wedgeSessions,
  ...zoomSessions,
}

/**
 * The docs' sessions (`<Session name="…" />` in a page): a figure and its
 * history from the command `from` names on, or from the action `fromAction`
 * (an exercise's step), or none for a live figure.
 */
export const DOCS_SESSIONS = {
  ...COMMAND_SESSIONS,
  ...EXERCISE_SESSIONS,
  ...GUIDE_SESSIONS,
  firstLine: {
    figure: { script: firstLine, width: 320, height: 200, padding: 20 },
    from: "LINE",
  },
  circleDiameter: {
    figure: { script: circleDiameter, width: 320, height: 200, padding: 20 },
    from: "CIRCLE",
  },
  endpointSnap: {
    figure: { script: endpointSnap, width: 320, height: 200, live: true },
  },
  offsetRectangle: {
    figure: { script: offsetRectangle, width: 320, height: 200, padding: 20 },
    from: "OFFSET",
  },
} satisfies Record<
  string,
  {
    readonly figure: FigureSpec
    readonly from?: string
    readonly fromAction?: number
  }
>

export type DocsSessionId = keyof typeof DOCS_SESSIONS
