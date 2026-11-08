import { describe, expect, it } from "vitest"

import { handedFileId, openingHref, withoutOpenParam } from "./handed-file"

describe("a file a page hands to the editor", () => {
  it("is named by the editor's query", () => {
    expect(handedFileId("?open=4f2c")).toBe("4f2c")
    expect(handedFileId("?drawing=gasket&open=4f2c")).toBe("4f2c")
    expect(handedFileId("?open=")).toBeNull()
    expect(handedFileId("")).toBeNull()
  })

  it("opens the editor of the page's language", () => {
    expect(openingHref("/es/draw", "4f2c")).toBe("/es/draw?open=4f2c")
    expect(openingHref("/draw", "4f2c")).toBe("/draw?open=4f2c")
  })

  it("leaves the editor's URL once taken, the rest of the query kept", () => {
    expect(withoutOpenParam("/es/draw?open=4f2c")).toBe("/es/draw")
    expect(withoutOpenParam("/draw?open=4f2c&x=1#top")).toBe("/draw?x=1#top")
  })
})
