import { describe, expect, it } from "vitest"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  formatLength,
  parseAngleDegrees,
  parseDecimalNumber,
  parseNumber,
} from "./units"

describe("DEFAULT_DOCUMENT_SETTINGS", () => {
  it("shows lineweights from the start, a deviation from AutoCAD", () => {
    // probe line/p204: a new drawing's LWDISPLAY is 0. On here because there
    // are no layouts or plotting to see them in (docs/coverage/properties.md).
    expect(DEFAULT_DOCUMENT_SETTINGS.lwDisplay).toBe(true)
  })
})

describe("formatLength", () => {
  it("writes a value that rounds to zero unsigned", () => {
    const at = (precision: number) => ({
      ...DEFAULT_DOCUMENT_SETTINGS,
      precision,
    })
    // probe inquiry/p315: -0.00004 at LUPREC 4 is 0.0000
    expect(formatLength(-0.00004, at(4))).toBe("0.0000")
    expect(formatLength(-0, at(4))).toBe("0.0000")
    // probe inquiry/p355: LUPREC 0 writes -0.4 as 0, -2.5 as -3
    expect(formatLength(-0.4, at(0))).toBe("0")
    expect(formatLength(-2.5, at(0))).toBe("-3")
    expect(formatLength(-2.25, at(4))).toBe("-2.2500")
  })
})

describe("parseDecimalNumber", () => {
  it("reads decimals, exponents and fractions as AutoCAD does", () => {
    // probes line/p150, p165
    expect(parseDecimalNumber(".5")).toBe(0.5)
    expect(parseDecimalNumber("5.")).toBe(5)
    expect(parseDecimalNumber("+5")).toBe(5)
    expect(parseDecimalNumber("1e1")).toBe(10)
    expect(parseDecimalNumber("1.5E-1")).toBe(0.15)
    expect(parseDecimalNumber("1/2")).toBe(0.5)
    expect(parseDecimalNumber("1-1/2")).toBe(1.5)
    expect(parseDecimalNumber("-1-1/2")).toBe(-1.5)
    expect(parseDecimalNumber("+3/4")).toBe(0.75)
  })

  it("refuses what AutoCAD refuses in decimal units", () => {
    // probes line/p150, p165
    for (const text of ["", "0x10", "0b1", "0o7", `1'6"`, "1/0", "1e999"]) {
      expect(parseDecimalNumber(text)).toBeNull()
    }
    expect(parseDecimalNumber("1/-2")).toBeNull()
    expect(parseDecimalNumber("1.5/2")).toBeNull()
    expect(parseDecimalNumber("Infinity")).toBeNull()
  })

  it("is what parseNumber reads, a comma taken for the decimal point", () => {
    expect(parseNumber(" 2,5 ")).toBe(2.5)
    expect(parseNumber("1/2")).toBe(0.5)
    expect(parseNumber("0x10")).toBeNull()
  })
})

describe("parseAngleDegrees", () => {
  it("reads the forms AutoCAD 2027 reads with AUNITS 0", () => {
    // probe line/p151
    expect(parseAngleDegrees("30")).toBe(30)
    expect(parseAngleDegrees("1e1")).toBe(10)
    expect(parseAngleDegrees("30d")).toBe(30)
    expect(parseAngleDegrees("30d30'")).toBe(30.5)
    expect(parseAngleDegrees("-30d30'")).toBe(-30.5)
    expect(parseAngleDegrees("0.5r")).toBeCloseTo(28.6479, 4)
    expect(parseAngleDegrees("50g")).toBe(45)
    expect(parseAngleDegrees("N45dE")).toBe(45)
  })

  it("counts a bearing from +X in each quadrant", () => {
    expect(parseAngleDegrees("n30w")).toBe(120)
    expect(parseAngleDegrees("S30dE")).toBe(300)
    expect(parseAngleDegrees("S30d30'W")).toBe(239.5)
  })

  it("refuses what is no angle", () => {
    for (const text of [
      "",
      "abc",
      "r",
      "1/2r",
      "30d-5'",
      "30dx'",
      "N-5E",
      "NxE",
      "0x10",
    ]) {
      expect(parseAngleDegrees(text)).toBeNull()
    }
  })
})
