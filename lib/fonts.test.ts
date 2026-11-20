import { describe, expect, it } from "vitest"

import { scriptFontStack, scriptFontVariables } from "./fonts"

const inter = { style: { fontFamily: "'Inter', 'Inter Fallback'" } }
const mono = { style: { fontFamily: "'Geist Mono', 'Geist Mono Fallback'" } }
const readex = { style: { fontFamily: "'Readex Pro', 'Readex Pro Fallback'" } }
const interLetters = { style: { fontFamily: "'Inter Letters'" } }
const monoLetters = { style: { fontFamily: "'Geist Mono Letters'" } }

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
    "latin-ext": { sans: interLetters, mono: monoLetters },
  }

  it("puts the letters' faces before Inter and Geist Mono on a Polish, Czech or Hungarian page", () => {
    expect(scriptFontVariables("cs", fonts)).toEqual(
      scriptFontVariables("pl", fonts)
    )
    expect(scriptFontVariables("hu", fonts)).toEqual(
      scriptFontVariables("pl", fonts)
    )
    expect(scriptFontVariables("pl", fonts)).toEqual({
      "--font-sans": "'Inter Letters', 'Inter', 'Inter Fallback'",
      "--font-mono":
        "'Geist Mono Letters', 'Geist Mono', 'Geist Mono Fallback'",
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

  it("puts the system's Japanese faces behind Inter and Geist Mono, downloading none", () => {
    const japanese =
      '"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", Meiryo, "Noto Sans CJK JP", "Noto Sans JP"'
    expect(scriptFontVariables("ja", fonts)).toEqual({
      "--font-sans": `'Inter', ${japanese}, 'Inter Fallback'`,
      "--font-mono": `'Geist Mono', ${japanese}, 'Geist Mono Fallback'`,
    })
  })
})
