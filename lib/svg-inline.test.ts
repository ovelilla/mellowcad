import { describe, expect, it } from "vitest"

import { inlineSvg } from "./svg-inline"

describe("inlineSvg", () => {
  it("quotes every attribute in single quotes, leaving the text alone", () => {
    expect(
      inlineSvg(
        '<title>Une bride "plane"</title><line x1="1" y1="2" stroke="#94a3b8" style="--t:1;--d:2"/><text x="3" lang="en">LINE "A"</text>'
      )
    ).toBe(
      "<title>Une bride \"plane\"</title><line x1='1' y1='2' stroke='#94a3b8' style='--t:1;--d:2'/><text x='3' lang='en'>LINE \"A\"</text>"
    )
  })

  it("keeps double quotes around a value that holds a single one", () => {
    expect(inlineSvg(`<path aria-label="l'axe" d="M0 0"/>`)).toBe(
      `<path aria-label="l'axe" d='M0 0'/>`
    )
  })
})
