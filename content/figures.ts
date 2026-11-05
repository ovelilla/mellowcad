import type { Bounds, DemoScript } from "@mellowcad/engine"

import {
  engineLayers,
  localFirst,
  type LocalFirstLabels,
} from "./demos/diagrams"
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
import { sessions as filletSessions } from "./demos/commands/fillet"
import { sessions as hatchSessions } from "./demos/commands/hatch"
import { sessions as insertSessions } from "./demos/commands/insert"
import { sessions as layerSessions } from "./demos/commands/layer"
import { sessions as lineSessions } from "./demos/commands/line"
import { sessions as mirrorSessions } from "./demos/commands/mirror"
import { sessions as moveSessions } from "./demos/commands/move"
import { sessions as mtextSessions } from "./demos/commands/mtext"
import { sessions as offsetSessions } from "./demos/commands/offset"
import { sessions as plineSessions } from "./demos/commands/pline"
import { sessions as rotateSessions } from "./demos/commands/rotate"
import { sessions as scaleSessions } from "./demos/commands/scale"
import { sessions as textSessions } from "./demos/commands/text"
import { sessions as trimSessions } from "./demos/commands/trim"
import { hero } from "./demos/hero"
import { offsetSession } from "./demos/offset"
import {
  crossingSelection,
  osnapTangent,
  otrack,
  polar,
  windowSelection,
} from "./demos/precision"
import {
  annotateGroup,
  drawGroup,
  filesGroup,
  inquiryGroup,
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
 * The hero's frame is set by hand because a dimension's text runs past its
 * definition points, which is all a drawing's extents know about.
 */
export const HERO_FIGURE = {
  script: hero,
  width: 720,
  height: 480,
  padding: 12,
  frame: { min: { x: -78, y: -62 }, max: { x: 104, y: 86 } },
} satisfies FigureSpec

export const FIGURES = {
  offset: { script: offsetSession, width: 360, height: 200, padding: 16 },
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
  inquiry: { script: inquiryGroup, width: 240, height: 150, live: true },
  files: { script: filesGroup, width: 240, height: 150, live: true },
} satisfies Record<string, FigureSpec>

/** The figures that carry words, built in the page's language. */
export const DIAGRAMS = {
  localFirst: (labels: LocalFirstLabels) => ({
    script: localFirst(labels),
    width: 560,
    height: 250,
    padding: 8,
  }),
  engineLayers: (imports: string) => ({
    script: engineLayers(imports),
    width: 420,
    height: 300,
    padding: 8,
    frame: { min: { x: -28, y: -4 }, max: { x: 92, y: 79 } },
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
  ...filletSessions,
  ...hatchSessions,
  ...insertSessions,
  ...layerSessions,
  ...lineSessions,
  ...mirrorSessions,
  ...moveSessions,
  ...mtextSessions,
  ...offsetSessions,
  ...plineSessions,
  ...rotateSessions,
  ...scaleSessions,
  ...textSessions,
  ...trimSessions,
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
