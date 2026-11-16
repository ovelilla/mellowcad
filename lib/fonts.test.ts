import { describe, expect, it } from "vitest"

import { scriptFontStack, scriptFontVariables } from "./fonts"

const inter = { style: { fontFamily: "'Inter', 'Inter Fallback'" } }
const mono = { style: { fontFamily: "'Geist Mono', 'Geist Mono Fallback'" } }
const readex = { style: { fontFamily: "'Readex Pro', 'Readex Pro Fallback'" } }
const interPolish = { style: { fontFamily: "'Inter Polish'" } }
const monoPolish = { style: { fontFamily: "'Geist Mono Polish'" } }

describe("scriptFontStack", () => {
  it("puts the script's face behind the page's, before both fallbacks", () => {
    expect(scriptFontStack(inter, readex)).toBe(
      "'Inter', 'Readex Pro', 'Readex Pro Fallback', 'Inter Fallback'"
    )
  })
})

describe("scriptFontVariables", () => {
  const fonts = {
    sans: inter,
    mono,
    arabic: readex,
    "latin-ext": { sans: interPolish, mono: monoPolish },
  }

  it("puts the Polish letters' faces before Inter and Geist Mono on a Polish page", () => {
    expect(scriptFontVariables("pl", fonts)).toEqual({
      "--font-sans": "'Inter Polish', 'Inter', 'Inter Fallback'",
      "--font-mono": "'Geist Mono Polish', 'Geist Mono', 'Geist Mono Fallback'",
    })
  })

  it("names the Arabic face only on an Arabic page", () => {
    expect(scriptFontVariables("en", fonts)).toBeUndefined()
    expect(scriptFontVariables("es", fonts)).toBeUndefined()
    expect(scriptFontVariables("ar", fonts)).toEqual({
      "--font-sans":
        "'Inter', 'Readex Pro', 'Readex Pro Fallback', 'Inter Fallback'",
      "--font-mono":
        "'Geist Mono', 'Readex Pro', 'Readex Pro Fallback', 'Geist Mono Fallback'",
    })
  })
})
