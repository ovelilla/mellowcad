import { describe, expect, it } from "vitest"
import { EngineText } from "./EngineText"
import { colorLabel } from "./colorLabels"
import { es } from "../locales/es"
import { hu } from "../locales/hu"

describe("colorLabel", () => {
  const names = new EngineText().names()

  // Desktop colors/d01–d04: the palette and the ribbon's list.
  it("names a colour as each place of AutoCAD's words it", () => {
    expect(colorLabel("ByLayer", names, "palette")).toBe("ByLayer")
    expect(colorLabel("1", names, "palette")).toBe("Red")
    expect(colorLabel("1", names, "bar")).toBe("Red")
    expect(colorLabel("1", names, "layer")).toBe("red")
    expect(colorLabel("30", names, "palette")).toBe("Color 30")
    expect(colorLabel("30", names, "bar")).toBe("30")
    expect(colorLabel("#ff7f00", names, "palette")).toBe("255,127,0")
    expect(colorLabel("#ff0000", names, "bar")).toBe("255,0,0")
  })

  // acadres 45903 in each table.
  it("numbers an index colour in the interface language", () => {
    expect(colorLabel("30", new EngineText(es).names(), "palette")).toBe(
      "Color 30"
    )
    expect(colorLabel("30", new EngineText(hu).names(), "palette")).toBe(
      "Szín: 30"
    )
  })
})
