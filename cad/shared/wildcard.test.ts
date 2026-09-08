import { describe, expect, it } from "vitest"
import { matchesWildcard } from "./wildcard"

describe("matchesWildcard", () => {
  it("matches everything when no pattern is given", () => {
    expect(matchesWildcard("DOOR", "")).toBe(true)
    expect(matchesWildcard("DOOR", "   ")).toBe(true)
  })

  it("takes ? for one character and * for many", () => {
    // The Blocks palette's own example: "4??A* displays blocks named 40xA123
    // and 4x8AC".
    expect(matchesWildcard("40xA123", "4??A*")).toBe(true)
    expect(matchesWildcard("4x8AC", "4??A*")).toBe(true)
    expect(matchesWildcard("4A", "4??A*")).toBe(false)
  })

  it("anchors the whole name and ignores case", () => {
    expect(matchesWildcard("DOOR", "door")).toBe(true)
    expect(matchesWildcard("DOORWAY", "DOOR")).toBe(false)
    expect(matchesWildcard("DOORWAY", "DOOR*")).toBe(true)
  })

  it("treats regex punctuation as literal text", () => {
    expect(matchesWildcard("A+B", "A+B")).toBe(true)
    expect(matchesWildcard("AAB", "A+B")).toBe(false)
  })
})
