import { describe, expect, it } from "vitest"
import { POLAR_ANGLE_MENU } from "./polarAngles"

describe("POLAR_ANGLE_MENU", () => {
  it("lists the desktop's increments with their multiples rounded", () => {
    // desktop workspace/d01-m, e01-4
    expect(POLAR_ANGLE_MENU.map((entry) => entry.label)).toEqual([
      "90, 180, 270, 360...",
      "45, 90, 135, 180...",
      "30, 60, 90, 120...",
      "23, 45, 68, 90...",
      "18, 36, 54, 72...",
      "15, 30, 45, 60...",
      "10, 20, 30, 40...",
      "5, 10, 15, 20...",
    ])
    expect(POLAR_ANGLE_MENU[3].step).toBe(22.5)
  })
})
