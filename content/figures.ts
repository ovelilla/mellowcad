import type { Bounds, DemoScript } from "@mellowcad/engine"

import { localFirst, type LocalFirstLabels } from "./demos/diagrams"
import {
  circleDiameter,
  endpointSnap,
  firstLine,
  offsetRectangle,
} from "./demos/docs"
import { sessions as arraySessions } from "./demos/commands/array"
import { sessions as arraypathSessions } from "./demos/commands/arraypath"
import { sessions as arraypolarSessions } from "./demos/commands/arraypolar"
import { sessions as arrayrectSessions } from "./demos/commands/arrayrect"
import { sessions as blockSessions } from "./demos/commands/block"
import { sessions as boxSessions } from "./demos/commands/box"
import { sessions as circleSessions } from "./demos/commands/circle"
import { sessions as copySessions } from "./demos/commands/copy"
import { sessions as dimalignedSessions } from "./demos/commands/dimaligned"
import { sessions as dimangularSessions } from "./demos/commands/dimangular"
import { sessions as dimbaselineSessions } from "./demos/commands/dimbaseline"
import { sessions as dimcontinueSessions } from "./demos/commands/dimcontinue"
import { sessions as dimdiameterSessions } from "./demos/commands/dimdiameter"
import { sessions as dimlinearSessions } from "./demos/commands/dimlinear"
import { sessions as dimradiusSessions } from "./demos/commands/dimradius"
import { sessions as dimstyleSessions } from "./demos/commands/dimstyle"
import { sessions as extendSessions } from "./demos/commands/extend"
import { sessions as extrudeSessions } from "./demos/commands/extrude"
import { sessions as filletSessions } from "./demos/commands/fillet"
import { sessions as hatchSessions } from "./demos/commands/hatch"
import { sessions as insertSessions } from "./demos/commands/insert"
import { sessions as intersectSessions } from "./demos/commands/intersect"
import { sessions as layerSessions } from "./demos/commands/layer"
import { sessions as lineSessions } from "./demos/commands/line"
import { sessions as mirrorSessions } from "./demos/commands/mirror"
import { sessions as moveSessions } from "./demos/commands/move"
import { sessions as mtextSessions } from "./demos/commands/mtext"
import { sessions as offsetSessions } from "./demos/commands/offset"
import { sessions as plineSessions } from "./demos/commands/pline"
import { sessions as presspullSessions } from "./demos/commands/presspull"
import { sessions as revolveSessions } from "./demos/commands/revolve"
import { sessions as rotateSessions } from "./demos/commands/rotate"
import { sessions as scaleSessions } from "./demos/commands/scale"
import { sessions as sliceSessions } from "./demos/commands/slice"
import { sessions as subtractSessions } from "./demos/commands/subtract"
import { sessions as textSessions } from "./demos/commands/text"
import { sessions as trimSessions } from "./demos/commands/trim"
import { sessions as unionSessions } from "./demos/commands/union"
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
  ...arraySessions,
  ...arraypathSessions,
  ...arraypolarSessions,
  ...arrayrectSessions,
  ...blockSessions,
  ...boxSessions,
  ...circleSessions,
  ...copySessions,
  ...dimalignedSessions,
  ...dimangularSessions,
  ...dimbaselineSessions,
  ...dimcontinueSessions,
  ...dimdiameterSessions,
  ...dimlinearSessions,
  ...dimradiusSessions,
  ...dimstyleSessions,
  ...extendSessions,
  ...extrudeSessions,
  ...filletSessions,
  ...hatchSessions,
  ...insertSessions,
  ...intersectSessions,
  ...layerSessions,
  ...lineSessions,
  ...mirrorSessions,
  ...moveSessions,
  ...mtextSessions,
  ...offsetSessions,
  ...plineSessions,
  ...presspullSessions,
  ...revolveSessions,
  ...rotateSessions,
  ...scaleSessions,
  ...sliceSessions,
  ...subtractSessions,
  ...textSessions,
  ...trimSessions,
  ...unionSessions,
}

/**
 * The docs' sessions (`<Session name="…" />` in a page): a figure and its
 * history from the command `from` names on, or none for a live figure.
 */
export const DOCS_SESSIONS = {
  ...COMMAND_SESSIONS,
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
  { readonly figure: FigureSpec; readonly from?: string }
>

export type DocsSessionId = keyof typeof DOCS_SESSIONS
