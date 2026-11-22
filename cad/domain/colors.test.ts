import { describe, expect, it } from "vitest"
import {
  colorIndex,
  colorRgb,
  indexColor,
  legacyColor,
  nearestIndexColor,
  normalizeColor,
} from "./colors"

describe("a colour, index or true", () => {
  it("keeps an index colour by its number and a true colour by its RGB", () => {
    expect(normalizeColor("30")).toBe("30")
    expect(normalizeColor(" 007 ")).toBe("7")
    expect(normalizeColor("#FF7F00")).toBe("#ff7f00")
    expect(normalizeColor("#f00")).toBe("#ff0000")
    for (const refused of ["0", "256", "-1", "1.5", "red", "#ff00"]) {
      expect(normalizeColor(refused), refused).toBeNull()
    }
    expect(indexColor(255)).toBe("255")
    expect(indexColor(0)).toBeNull()
    expect(colorIndex("30")).toBe(30)
    expect(colorIndex("#ff0000")).toBeNull()
    expect(colorIndex("030")).toBeNull()
  })

  // dxf/d001-aci.sh: AutoCAD's RGB of each index.
  it("draws an index colour in AutoCAD's RGB, a true colour in its own", () => {
    expect(colorRgb("1")).toBe("#ff0000")
    expect(colorRgb("30")).toBe("#ff7f00")
    expect(colorRgb("255")).toBe("#ffffff")
    expect(colorRgb("#0a141e")).toBe("#0a141e")
  })

  it("finds the lowest index of an RGB, else the nearest (colors/c02)", () => {
    expect(nearestIndexColor(0xff0000)).toEqual({ index: 1, exact: true })
    expect(nearestIndexColor(0xffffff)).toEqual({ index: 7, exact: true })
    expect(nearestIndexColor(0x808080)).toEqual({ index: 8, exact: true })
    expect(nearestIndexColor(0x0a141e)).toEqual({ index: 168, exact: false })
  })

  it("reads an older drawing's RGB of an index colour as that index", () => {
    expect(legacyColor("#ff0000")).toBe("1")
    expect(legacyColor("#ff7f00")).toBe("30")
    expect(legacyColor("#d29b5f")).toBe("#d29b5f")
    expect(legacyColor("30")).toBeNull()
  })
})
