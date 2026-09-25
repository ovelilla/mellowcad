import { describe, expect, it } from "vitest"
import { circleOf, lineOf, p, snapshotOf } from "../../test/builders"
import { serializeDrawing } from "./drawingFile"
import { summarizeDrawing } from "./drawingSummary"

describe("summarizeDrawing", () => {
  it("counts the objects in a saved drawing", () => {
    const text = serializeDrawing(
      snapshotOf([lineOf(p(0, 0), p(1, 0)), circleOf(p(0, 0), 1)])
    )
    expect(summarizeDrawing(text)).toEqual({ objects: 2 })
  })

  it("reads an empty drawing as one with nothing in it", () => {
    expect(summarizeDrawing(serializeDrawing(snapshotOf([])))).toEqual({
      objects: 0,
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
