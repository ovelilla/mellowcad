import { describe, expect, it } from "vitest"

import { EDITOR_LAYOUT_STORAGE } from "./site"

describe("the editor's storage keys", () => {
  // A renamed key does not fail anywhere else: every user's saved layout is
  // silently orphaned.
  it("are frozen", () => {
    expect(EDITOR_LAYOUT_STORAGE).toEqual({
      palette: "easycad:palette:v1",
      statusBar: "easycad:status-bar:v1",
    })
  })
})
