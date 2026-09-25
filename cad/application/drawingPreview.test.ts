import { describe, expect, it } from "vitest"
import { THEME } from "../scene/theme"
import { circleOf, documentWith, lineOf, p } from "../../test/builders"
import { buildDrawingPreview, previewCamera } from "./drawingPreview"

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
})

describe("previewCamera", () => {
  it("is ZOOM Extents for a rectangle", () => {
    const camera = previewCamera({ min: p(0, 0), max: p(10, 10) }, 100, 100)
    expect(camera.scale).toBeCloseTo(10)
    expect(camera.worldToScreen(p(5, 5))).toBeCloseToPoint(p(50, 50))
  })
})
