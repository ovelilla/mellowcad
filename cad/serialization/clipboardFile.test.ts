import { describe, expect, it } from "vitest"

import {
  CLIPBOARD_FILE_TYPE,
  CLIPBOARD_FILE_VERSION,
  parseClipboard,
  serializeClipboard,
} from "./clipboardFile"
import { toDrawingFile } from "./drawingFile"
import { lineOf, p, snapshotOf } from "../../test/builders"

const drawing = () => toDrawingFile(snapshotOf([lineOf(p(0, 0), p(10, 0))]))
const fragment = (extra: Record<string, unknown>) =>
  JSON.stringify({
    type: CLIPBOARD_FILE_TYPE,
    version: CLIPBOARD_FILE_VERSION,
    drawing: drawing(),
    ...extra,
  })

describe("parseClipboard", () => {
  it("reads back a fragment with its base point's Z", () => {
    const text = serializeClipboard(
      { x: 1, y: 2, z: 3 },
      snapshotOf([lineOf(p(0, 0), p(10, 0))])
    )
    const parsed = parseClipboard(text)
    expect(parsed?.basePoint).toEqual({ x: 1, y: 2, z: 3 })
    expect(parsed?.drawing.entities).toHaveLength(1)
  })

  it("puts a base point without a Z on the XY plane, and a missing one at the origin", () => {
    expect(
      parseClipboard(fragment({ basePoint: { x: 4, y: 5 } }))?.basePoint
    ).toEqual({ x: 4, y: 5, z: 0 })
    expect(parseClipboard(fragment({}))?.basePoint).toEqual({
      x: 0,
      y: 0,
      z: 0,
    })
  })

  // Text from any other application is the usual content of the clipboard,
  // so none of these is an error: each is simply not a fragment.
  it("answers null for anything that is not a usable fragment", () => {
    expect(parseClipboard("plain text")).toBeNull()
    expect(parseClipboard(JSON.stringify({ type: "other" }))).toBeNull()
    expect(
      parseClipboard(fragment({ version: CLIPBOARD_FILE_VERSION + 1 }))
    ).toBeNull()
    expect(parseClipboard(fragment({ drawing: { type: "other" } }))).toBeNull()
    expect(
      parseClipboard(fragment({ drawing: { ...drawing(), entities: [] } }))
    ).toBeNull()
  })
})
