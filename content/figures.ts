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
 * The docs' sessions (`<Session name="…" />` in a written page): a figure and
 * its history from the command `from` names on, or none for a live figure.
 */
export const DOCS_SESSIONS = {
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
