import { describe, expect, it } from "vitest"
import { createDefaultLayer } from "../domain/layers"
import { circleOf, layerOf, lineOf, p, snapshotOf } from "../../test/builders"
import { serializeDrawing } from "./drawingFile"
import { isBlankDrawing, summarizeDrawing } from "./drawingSummary"

describe("summarizeDrawing", () => {
  it("counts the objects and layers in a saved drawing", () => {
    const text = serializeDrawing(
      snapshotOf([lineOf(p(0, 0), p(1, 0)), circleOf(p(0, 0), 1)])
    )
    expect(summarizeDrawing(text)).toEqual({ objects: 2, layers: 1 })
  })

  it("reads an empty drawing as one with nothing in it", () => {
    expect(summarizeDrawing(serializeDrawing(snapshotOf([])))).toEqual({
      objects: 0,
      layers: 1,
    })
  })

  it("is null for anything that is not a drawing", () => {
    expect(summarizeDrawing("")).toBeNull()
    expect(summarizeDrawing("not json")).toBeNull()
    expect(summarizeDrawing("null")).toBeNull()
    expect(summarizeDrawing('{"type":"other","entities":[]}')).toBeNull()
    expect(summarizeDrawing('{"type":"easycad-drawing"}')).toBeNull()
  })
})

describe("isBlankDrawing", () => {
  const summary = (text: string) => summarizeDrawing(text)!

  it("is blank with no objects and only the base layer", () => {
    expect(isBlankDrawing(summary(serializeDrawing(snapshotOf([]))))).toBe(true)
  })

  it("is not blank once it holds an object", () => {
    const text = serializeDrawing(snapshotOf([lineOf(p(0, 0), p(1, 0))]))
    expect(isBlankDrawing(summary(text))).toBe(false)
  })

  // Layers set up before anything is drawn are work too: the editor restores
  // such a drawing, so nothing may write over it unasked.
  it("is not blank with a layer of its own and nothing drawn", () => {
    const text = serializeDrawing(
      snapshotOf([], { layers: [createDefaultLayer(), layerOf("walls")] })
    )
    expect(isBlankDrawing(summary(text))).toBe(false)
  })
})
