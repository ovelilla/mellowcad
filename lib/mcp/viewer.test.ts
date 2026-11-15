import { describe, expect, it } from "vitest"

import { VIEWER_HTML, VIEWER_SCRIPT } from "./viewer"

// What runs it is a real browser against a host of its own (skill
// `browser-verify`); here, what a test without a DOM can hold.
describe("the chat's view of a drawing", () => {
  it("is a script a browser parses", () => {
    expect(() => new Function(VIEWER_SCRIPT)).not.toThrow()
  })

  it("fetches nothing, as the host's default CSP allows nothing else", () => {
    expect(VIEWER_HTML).not.toMatch(/\b(?:src|href)=|@import|url\(|fetch\(/)
  })

  it("stays small, as every call's view loads it", () => {
    expect(VIEWER_HTML.length).toBeLessThan(16_000)
  })
})
