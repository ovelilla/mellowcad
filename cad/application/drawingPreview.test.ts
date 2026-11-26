import { describe, expect, it } from "vitest"
import { THEME } from "../scene/theme"
import { DEFAULT_DOCUMENT_SETTINGS } from "../domain/units"
import {
  circleOf,
  documentWith,
  hatchOf,
  lineOf,
  loopOf,
  p,
} from "../../test/builders"
import {
  buildDrawingPreview,
  buildHatchSwatch,
  previewCamera,
} from "./drawingPreview"

describe("buildDrawingPreview", () => {
  it("frames the whole drawing in the box, with only the objects drawn", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0)),
      lineOf(p(0, 0), p(0, 50)),
    ])

    const scene = buildDrawingPreview(document, {
      width: 220,
      height: 120,
      padding: 10,
    })!

    expect(scene.width).toBe(220)
    expect(scene.primitives).toHaveLength(2)
    expect(
      scene.primitives.every(
        (primitive) =>
          primitive.kind === "segment" &&
          primitive.stroke.color === THEME.entity
      )
    ).toBe(true)
    // 100 × 50 world units into 200 × 100 pixels once padded: scale 2, centred.
    const [horizontal] = scene.primitives
    if (horizontal.kind !== "segment") return
    expect(horizontal.a).toBeCloseToPoint(p(10, 110))
    expect(horizontal.b).toBeCloseToPoint(p(210, 110))
  })

  it("keeps one camera for every part of a drawing, so the parts overlay", () => {
    const line = lineOf(p(0, 0), p(100, 0))
    const circle = circleOf(p(80, 30), 10)
    const document = documentWith([line, circle])
    const options = { width: 300, height: 200, padding: 8 }

    const whole = buildDrawingPreview(document, options)!
    const lineOnly = buildDrawingPreview(document, {
      ...options,
      entities: [line],
    })!
    const circleOnly = buildDrawingPreview(document, {
      ...options,
      entities: [circle],
    })!

    expect([...lineOnly.primitives, ...circleOnly.primitives]).toEqual(
      whole.primitives
    )
  })

  it("frames an explicit rectangle when given one", () => {
    const document = documentWith([lineOf(p(0, 0), p(10, 0))])
    const scene = buildDrawingPreview(document, {
      width: 100,
      height: 100,
      frame: { min: p(-50, -50), max: p(50, 50) },
    })!
    const [segment] = scene.primitives
    if (segment.kind !== "segment") return
    expect(segment.a).toBeCloseToPoint(p(50, 50))
    expect(segment.b).toBeCloseToPoint(p(60, 50))
  })

  it("has nothing to frame in an empty drawing", () => {
    expect(
      buildDrawingPreview(documentWith([]), { width: 100, height: 100 })
    ).toBeNull()
  })

  it("draws lineweights only when asked, like LWDISPLAY", () => {
    const document = documentWith([lineOf(p(0, 0), p(100, 0))])
    document.updateLayer({ ...document.getLayer("0")!, lineweight: 2.11 })
    const widthOf = (lwDisplay: boolean) => {
      const [segment] = buildDrawingPreview(document, {
        width: 100,
        height: 100,
        lwDisplay,
      })!.primitives
      return segment.kind === "segment" ? segment.stroke.width : 0
    }
    expect(widthOf(true)).toBeGreaterThan(widthOf(false))
  })

  it("draws a hatch only with FILL on, as the editor does", () => {
    const hatch = hatchOf([loopOf(p(0, 0), p(10, 10))], { patternId: "SOLID" })
    const drawn = (fillMode: boolean) =>
      buildDrawingPreview(
        documentWith([hatch], {
          settings: { ...DEFAULT_DOCUMENT_SETTINGS, fillMode },
        }),
        { width: 100, height: 100 }
      )!.primitives.length
    expect(drawn(true)).toBeGreaterThan(0)
    expect(drawn(false)).toBe(0)
  })
})

describe("previewCamera", () => {
  it("is ZOOM Extents for a rectangle", () => {
    const camera = previewCamera({ min: p(0, 0), max: p(10, 10) }, 100, 100)
    expect(camera.scale).toBeCloseTo(10)
    expect(camera.worldToScreen(p(5, 5))).toBeCloseToPoint(p(50, 50))
  })
})

describe("buildHatchSwatch", () => {
  it("draws a framed square of the pattern, a few repeats across", () => {
    const document = documentWith([])
    const ansi31 = buildHatchSwatch(document, "ANSI31", 32)!
    const ansi32 = buildHatchSwatch(document, "ANSI32", 32)!
    expect(ansi31.width).toBe(32)
    // The frame's four sides and the pattern's lines, ANSI32's two families
    // drawing about twice ANSI31's one (desktop hatch/d01-2).
    const lines = (scene: typeof ansi31) =>
      scene.primitives.filter((primitive) => primitive.kind === "segment")
        .length
    expect(lines(ansi31)).toBeGreaterThan(4)
    expect(lines(ansi32)).toBeGreaterThan(lines(ansi31))
  })

  it("fills SOLID's, and draws nothing for a pattern this build has not", () => {
    const document = documentWith([])
    const solid = buildHatchSwatch(document, "SOLID", 32)!
    expect(
      solid.primitives.some((primitive) => primitive.kind === "path")
    ).toBe(true)
    expect(buildHatchSwatch(document, "HOUND", 32)).toBeNull()
  })
})
