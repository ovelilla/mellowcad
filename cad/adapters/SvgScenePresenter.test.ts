import { describe, expect, it } from "vitest"
import type { ArcEntity, EllipseEntity } from "../domain/entities"
import {
  arcMidpoint,
  ellipseEndPoint,
  ellipsePointAt,
  ellipseStartPoint,
} from "../domain/entities"
import type { Scene, ScenePrimitive } from "../scene/types"
import { THEME } from "../scene/theme"
import { buildDrawingPreview } from "../application/drawingPreview"
import { createHarness } from "../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  documentWith,
  ellipseOf,
  lineOf,
  p,
} from "../../test/builders"
import {
  SvgScenePresenter,
  primitiveLength,
  themeCustomProperties,
  themePalette,
} from "./SvgScenePresenter"

/**
 * The SVG presenter runs in Node — at build time on the server — so it is
 * tested like any pure function: build a scene, render it, read the markup.
 */

const stroke = { color: "#e2e8f0", width: 1.25 }

function sceneOf(...primitives: ScenePrimitive[]): Scene {
  return { width: 200, height: 100, background: THEME.background, primitives }
}

function attribute(markup: string, name: string): string | null {
  return new RegExp(`${name}="([^"]*)"`).exec(markup)?.[1] ?? null
}

/** Reads `M x y A rx ry rot large sweep x y [A …]` into numbers. */
function parseArcPath(d: string) {
  const numbers = d.match(/-?\d+(\.\d+)?/g)!.map(Number)
  const [x0, y0, ...rest] = numbers
  const arcs = []
  for (let i = 0; i + 7 <= rest.length; i += 7) {
    const [rx, ry, rotation, large, sweep, x, y] = rest.slice(i, i + 7)
    arcs.push({ rx, ry, rotation, large, sweep, x, y })
  }
  return { start: { x: x0, y: y0 }, arcs }
}

/**
 * SVG's own endpoint → centre conversion (SVG 1.1 appendix F.6.5), used to find
 * the point halfway along the arc the flags select — the only way to tell the
 * four candidate arcs through two points apart.
 */
function svgArcMidpoint(
  from: { x: number; y: number },
  arc: ReturnType<typeof parseArcPath>["arcs"][number]
) {
  const phi = (arc.rotation * Math.PI) / 180
  const cos = Math.cos(phi)
  const sin = Math.sin(phi)
  const dx = (from.x - arc.x) / 2
  const dy = (from.y - arc.y) / 2
  const x1 = cos * dx + sin * dy
  const y1 = -sin * dx + cos * dy
  const { rx, ry } = arc
  const numerator = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1
  const denominator = rx * rx * y1 * y1 + ry * ry * x1 * x1
  const sign = arc.large !== arc.sweep ? 1 : -1
  const k = sign * Math.sqrt(Math.max(0, numerator / denominator))
  const cx1 = (k * rx * y1) / ry
  const cy1 = (-k * ry * x1) / rx
  const cx = cos * cx1 - sin * cy1 + (from.x + arc.x) / 2
  const cy = sin * cx1 + cos * cy1 + (from.y + arc.y) / 2
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy)
  const theta1 = angle(1, 0, (x1 - cx1) / rx, (y1 - cy1) / ry)
  let delta = angle(
    (x1 - cx1) / rx,
    (y1 - cy1) / ry,
    (-x1 - cx1) / rx,
    (-y1 - cy1) / ry
  )
  if (arc.sweep === 0 && delta > 0) delta -= 2 * Math.PI
  if (arc.sweep === 1 && delta < 0) delta += 2 * Math.PI
  const t = theta1 + delta / 2
  return {
    x: cx + rx * Math.cos(t) * cos - ry * Math.sin(t) * sin,
    y: cy + rx * Math.cos(t) * sin + ry * Math.sin(t) * cos,
  }
}

describe("the Y flip", () => {
  it("draws an arc between its projected ends, through its projected middle", () => {
    const cad = createHarness({
      entities: [arcOf(p(20, -10), 60, deg(20), deg(250), { id: "A1" })],
    })
    const primitive = cad
      .scene()
      .primitives.find((candidate) => candidate.kind === "arc")!
    const svg = new SvgScenePresenter({ precision: 4 }).elements([primitive])
    const { start, arcs } = parseArcPath(attribute(svg, "d")!)
    const arc = cad.byId<ArcEntity>("A1")
    const project = (point: { x: number; y: number }) =>
      cad.runtime.viewport.worldToScreen(point)

    expect(arcs).toHaveLength(1)
    expect(start).toBeCloseToPoint(
      project({
        x: arc.center.x + arc.radius * Math.cos(arc.startAngle),
        y: arc.center.y + arc.radius * Math.sin(arc.startAngle),
      }),
      3
    )
    expect(arcs[0]).toMatchObject({ large: 1 })
    expect({ x: arcs[0].x, y: arcs[0].y }).toBeCloseToPoint(
      project({
        x: arc.center.x + arc.radius * Math.cos(arc.endAngle),
        y: arc.center.y + arc.radius * Math.sin(arc.endAngle),
      }),
      3
    )
    expect(svgArcMidpoint(start, arcs[0])).toBeCloseToPoint(
      project(arcMidpoint(arc)),
      3
    )
  })

  it("draws an elliptical arc the same way the canvas does", () => {
    const cad = createHarness({
      entities: [
        ellipseOf(p(0, 0), p(100, 50), 0.5, {
          id: "E1",
          startParam: deg(30),
          endParam: deg(200),
        }),
      ],
    })
    const primitive = cad
      .scene()
      .primitives.find((candidate) => candidate.kind === "ellipse")!
    const svg = new SvgScenePresenter({ precision: 4 }).elements([primitive])
    const { start, arcs } = parseArcPath(attribute(svg, "d")!)
    const ellipse = cad.byId<EllipseEntity>("E1")
    const project = (point: { x: number; y: number }) =>
      cad.runtime.viewport.worldToScreen(point)

    expect(arcs).toHaveLength(1)
    expect(start).toBeCloseToPoint(project(ellipseStartPoint(ellipse)), 3)
    expect({ x: arcs[0].x, y: arcs[0].y }).toBeCloseToPoint(
      project(ellipseEndPoint(ellipse)),
      3
    )
    const middle = ellipsePointAt(ellipse, (deg(30) + deg(200)) / 2)
    expect(svgArcMidpoint(start, arcs[0])).toBeCloseToPoint(project(middle), 2)
  })

  it("closes a full turn with two half arcs, since one arc cannot", () => {
    const svg = new SvgScenePresenter().elements([
      {
        kind: "ellipse",
        center: p(100, 50),
        radiusX: 40,
        radiusY: 20,
        rotation: 0,
        startAngle: 0,
        endAngle: Math.PI * 2,
        counterclockwise: false,
        stroke,
      },
    ])
    const { start, arcs } = parseArcPath(attribute(svg, "d")!)
    expect(start).toBeCloseToPoint(p(140, 50))
    expect(arcs).toHaveLength(2)
    expect({ x: arcs[0].x, y: arcs[0].y }).toBeCloseToPoint(p(60, 50))
    expect({ x: arcs[1].x, y: arcs[1].y }).toBeCloseToPoint(p(140, 50))
  })
})

describe("markup", () => {
  it("is a standalone, labelled document framed like the scene", () => {
    const svg = new SvgScenePresenter().render(
      sceneOf({ kind: "segment", a: p(0, 0), b: p(10, 0), stroke }),
      { title: "A line", description: "Ten units long.", background: true }
    )

    expect(svg).toMatch(/^<svg [^>]*xmlns="http:\/\/www.w3.org\/2000\/svg"/)
    expect(attribute(svg, "viewBox")).toBe("0 0 200 100")
    expect(attribute(svg, "role")).toBe("img")
    expect(svg).toContain("<title>A line</title><desc>Ten units long.</desc>")
    expect(svg).toContain(`fill="${THEME.background}"`)
  })

  it("gives each primitive kind its SVG element", () => {
    const svg = new SvgScenePresenter().elements([
      { kind: "segment", a: p(0, 0), b: p(10, 0), stroke },
      { kind: "circle", center: p(5, 5), radius: 3, stroke },
      { kind: "rect", min: p(0, 0), width: 4, height: 2, fill: "#fff" },
      {
        kind: "path",
        points: [p(0, 0), p(4, 0), p(4, 4)],
        closed: true,
        fill: "#fff",
      },
      { kind: "label", at: p(1, 1), text: "Endpoint", color: "#fff" },
    ])

    expect(svg.match(/<(\w+)/g)).toEqual([
      "<line",
      "<circle",
      "<rect",
      "<path",
      "<text",
    ])
    expect(svg).toContain('d="M0 0L4 0L4 4Z"')
    expect(svg).toContain('fill-rule="evenodd"')
  })

  it("punches a nested ring out of a fill, as the canvas's even-odd fill does", () => {
    const svg = new SvgScenePresenter().elements([
      {
        kind: "path",
        points: [p(0, 0), p(10, 0), p(10, 10), p(0, 10)],
        closed: true,
        subpaths: [[p(3, 3), p(6, 3), p(6, 6)]],
        fill: "#fff",
      },
    ])
    expect(attribute(svg, "d")).toBe("M0 0L10 0L10 10L0 10ZM3 3L6 3L6 6Z")
    expect(attribute(svg, "fill-rule")).toBe("evenodd")
  })

  it("rounds coordinates to one decimal and never writes -0", () => {
    const svg = new SvgScenePresenter().elements([
      { kind: "segment", a: p(-0.01, 1.2345), b: p(9.96, -0.04), stroke },
    ])
    expect(svg).toContain('x1="0" y1="1.2" x2="10" y2="0"')
  })

  it("clips a segment to the frame, as the canvas does", () => {
    const presenter = new SvgScenePresenter({
      frame: { width: 200, height: 100 },
    })
    const guide = presenter.elements([
      {
        kind: "segment",
        a: p(-2_000_000, 50),
        b: p(2_000_000, 50),
        stroke: { ...stroke, dash: [7, 5] },
      },
    ])
    expect(guide).toContain('x1="-8" y1="50" x2="208" y2="50"')
    expect(
      presenter.elements([
        { kind: "segment", a: p(-50, -50), b: p(-20, -40), stroke },
      ])
    ).toBe("")
    expect(
      presenter.elements([
        { kind: "segment", a: p(10, 10), b: p(20, 20), stroke },
      ])
    ).toContain('x1="10" y1="10" x2="20" y2="20"')
  })

  it("frames a whole document by the scene's size", () => {
    const svg = new SvgScenePresenter().render(
      sceneOf({
        kind: "segment",
        a: p(100, -1e6),
        b: p(100, 1e6),
        stroke,
      })
    )
    expect(svg).toContain('y1="-8"')
    expect(svg).toContain('y2="108"')
  })

  it("escapes text content", () => {
    const svg = new SvgScenePresenter().elements([
      {
        kind: "label",
        at: p(0, 0),
        text: `<b> & "x"`,
        color: "#fff",
      },
    ])
    expect(svg).toContain('&lt;b&gt; &amp; "x"</text>')
  })

  it("sizes drawing text by its capitals and anchors it like the canvas", () => {
    const svg = new SvgScenePresenter({ capHeightRatio: 0.7 }).elements([
      {
        kind: "text",
        at: p(50, 40),
        text: "Ø100",
        height: 7,
        rotation: -Math.PI / 2,
        align: "center",
        baseline: "capMiddle",
        color: "#fff",
      },
    ])
    expect(attribute(svg, "font-size")).toBe("10")
    expect(attribute(svg, "text-anchor")).toBe("middle")
    expect(attribute(svg, "transform")).toBe("translate(50 40) rotate(-90)")
    // Half the capital height below the anchor puts the anchor mid-capitals.
    expect(attribute(svg, "y")).toBe("3.5")
  })

  it("keeps every text left-to-right, whatever the page around it", () => {
    const svg = new SvgScenePresenter().elements([
      { kind: "label", at: p(0, 0), text: "Endpoint", color: "#fff" },
      {
        kind: "text",
        at: p(0, 0),
        text: "A",
        height: 5,
        rotation: 0,
        align: "left",
        baseline: "alphabetic",
        color: "#fff",
      },
    ])
    expect(svg.match(/direction="ltr"/g)).toHaveLength(2)
    expect(svg.match(/text-anchor="start"/g)).toHaveLength(2)
  })
})

describe("dashes and plotting", () => {
  it("writes a linetype's dashes as a dash array", () => {
    const svg = new SvgScenePresenter().elements([
      {
        kind: "segment",
        a: p(0, 0),
        b: p(100, 0),
        stroke: { ...stroke, dash: [20, 4, 4, 4] },
      },
    ])
    expect(attribute(svg, "stroke-dasharray")).toBe("20 4 4 4")
  })

  it("normalises only solid strokes for plotting — a dashed one keeps its pattern", () => {
    const presenter = new SvgScenePresenter({ plot: true })
    const solid = presenter.elements([
      { kind: "segment", a: p(0, 0), b: p(100, 0), stroke },
    ])
    const dashed = presenter.elements([
      {
        kind: "segment",
        a: p(0, 0),
        b: p(100, 0),
        stroke: { ...stroke, dash: [5, 3] },
      },
    ])
    expect(attribute(solid, "pathLength")).toBe("1")
    expect(attribute(dashed, "pathLength")).toBeNull()
  })

  it("lets the caller decorate each element, e.g. with its timing", () => {
    const svg = new SvgScenePresenter().elements(
      [
        { kind: "segment", a: p(0, 0), b: p(10, 0), stroke },
        { kind: "segment", a: p(0, 5), b: p(10, 5), stroke },
      ],
      (_primitive, index) => ({ style: `--i:${index}` })
    )
    expect(svg.match(/style="--i:\d"/g)).toEqual([
      'style="--i:0"',
      'style="--i:1"',
    ])
  })

  it("measures how far each outline runs", () => {
    expect(
      primitiveLength({ kind: "segment", a: p(0, 0), b: p(3, 4), stroke })
    ).toBeCloseTo(5)
    expect(
      primitiveLength({ kind: "circle", center: p(0, 0), radius: 1, stroke })
    ).toBeCloseTo(2 * Math.PI)
    expect(
      primitiveLength({
        kind: "arc",
        center: p(0, 0),
        radius: 2,
        startAngle: 0,
        endAngle: Math.PI / 2,
        counterclockwise: false,
        stroke,
      })
    ).toBeCloseTo(Math.PI)
  })
})

describe("theme palette", () => {
  it("writes THEME's colours as custom properties and passes others through", () => {
    const palette = themePalette()
    expect(palette(THEME.entity)).toBe("var(--cad-entity)")
    expect(palette(THEME.selectionWindowFill)).toBe(
      "var(--cad-selection-window-fill)"
    )
    expect(palette("#123456")).toBe("#123456")
  })

  it("declares every property the palette can refer to", () => {
    const declarations = themeCustomProperties()
    for (const [name, value] of Object.entries(THEME)) {
      const property = name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
      expect(declarations).toContain(`--cad-${property}:${value};`)
    }
  })

  it("renders a real drawing with the palette's variables", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0)),
      circleOf(p(50, 0), 20),
    ])
    const scene = buildDrawingPreview(document, { width: 300, height: 200 })!
    const svg = new SvgScenePresenter({ palette: themePalette() }).render(scene)
    expect(svg).toContain('stroke="var(--cad-entity)"')
    expect(svg).not.toContain(THEME.entity)
  })
})
