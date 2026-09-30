import { describe, expect, it } from "vitest"
import { Viewport } from "./Viewport"
import { p } from "../../test/builders"

const SE_ISO = { x: 1, y: -1, z: 1 }
const SE_RIGHT = { x: 1, y: 1, z: 0 }

function sized(): Viewport {
  const viewport = new Viewport()
  viewport.setSize(800, 600)
  viewport.reset()
  return viewport
}

describe("Viewport", () => {
  it("draws the plan of the WCS by default, whatever a point's Z", () => {
    const viewport = sized()
    expect(viewport.isPlan).toBe(true)
    expect(viewport.worldToScreen({ x: 10, y: 20, z: 500 })).toBeCloseToPoint(
      viewport.worldToScreen(p(10, 20)),
      12
    )
  })

  it("turns a plan view with the world direction drawn pointing right", () => {
    const viewport = sized()
    viewport.setView({ x: 0, y: 0, z: 1 }, { x: 0, y: 1, z: 0 })
    const origin = viewport.worldToScreen(p(0, 0))
    const onY = viewport.worldToScreen(p(0, 10))
    expect(viewport.isPlan).toBe(true)
    expect(onY.y).toBeCloseTo(origin.y, 9)
    expect(onY.x).toBeGreaterThan(origin.x)
  })

  it("projects along the line of sight in a view off the plan", () => {
    const viewport = sized()
    expect(viewport.setView(SE_ISO, SE_RIGHT)).toBe(true)
    expect(viewport.isPlan).toBe(false)
    expect(viewport.worldToScreen({ x: 3, y: -3, z: 3 })).toBeCloseToPoint(
      viewport.worldToScreen({ x: 0, y: 0, z: 0 }),
      9
    )
  })

  it("draws the world Z up and X down to the right from the south-east", () => {
    const viewport = sized()
    viewport.setView(SE_ISO, SE_RIGHT)
    const origin = viewport.worldToScreen({ x: 0, y: 0, z: 0 })
    const onX = viewport.worldToScreen({ x: 10, y: 0, z: 0 })
    const onZ = viewport.worldToScreen({ x: 0, y: 0, z: 10 })
    expect(onX.x).toBeGreaterThan(origin.x)
    expect(onX.y).toBeGreaterThan(origin.y)
    expect(onZ.x).toBeCloseTo(origin.x, 9)
    expect(onZ.y).toBeLessThan(origin.y)
  })

  it("takes the right axis square to the line of sight", () => {
    const viewport = sized()
    viewport.setView(SE_ISO, { x: 1, y: 1, z: 5 })
    const { direction, right, up } = viewport
    expect(
      right.x * direction.x + right.y * direction.y + right.z * direction.z
    ).toBeCloseTo(0, 12)
    expect(Math.hypot(right.x, right.y, right.z)).toBeCloseTo(1, 12)
    expect(Math.hypot(up.x, up.y, up.z)).toBeCloseTo(1, 12)
  })

  it("refuses a right axis along the line of sight", () => {
    const viewport = sized()
    expect(viewport.setView(SE_ISO, SE_ISO)).toBe(false)
    expect(viewport.isPlan).toBe(true)
  })

  it("maps the view frame back onto the plane facing the viewer", () => {
    const viewport = sized()
    viewport.setView(SE_ISO, SE_RIGHT)
    const screen = p(123, 456)
    expect(
      viewport.worldToScreen(viewport.screenToWorld(screen))
    ).toBeCloseToPoint(screen, 9)
  })

  it("steps back to the plan with ZOOM Previous", () => {
    const viewport = sized()
    viewport.pushHistory()
    viewport.setView(SE_ISO, SE_RIGHT)
    expect(viewport.restorePrevious()).toBe(true)
    expect(viewport.isPlan).toBe(true)
    expect(viewport.right).toEqual({ x: 1, y: 0, z: 0 })
  })
})
