import { type DemoScript, SnapType, demo } from "@mellowcad/engine"

/**
 * The precision figures: each ends mid-gesture, so the frame the engine draws
 * carries the aid itself — marker, tooltip, alignment paths, polar vector or
 * selection box — exactly as it appears under the cursor in the editor.
 */

const figure = { width: 320, height: 220 } as const

/** A tangent from a point to a circle, forced with the Shift+right-click menu. */
export const osnapTangent = demo({
  ...figure,
  snap: true,
  view: { min: { x: -80, y: -55 }, max: { x: 55, y: 50 } },
})
  .command("_CIRCLE")
  .type("10,0")
  .enter()
  .type("30")
  .enter()
  .command("_LINE")
  .type("-65,-40")
  .enter()
  .osnap(SnapType.Tangent)
  .moveTo(-5, 28)

/** Two endpoints acquired; the point where their paths cross is found. */
export const otrack = demo({
  ...figure,
  snap: true,
  view: { min: { x: -10, y: -15 }, max: { x: 110, y: 82 } },
})
  .command("_LINE")
  .type("0,0")
  .enter()
  .type("60,0")
  .enter()
  .escape()
  .command("_LINE")
  .type("90,20")
  .enter()
  .type("@0,40")
  .enter()
  .escape()
  .command("_CIRCLE")
  .hover(60, 0)
  .moveTo(75, 30)
  .hover(90, 60)
  .moveTo(62, 58)

/** Polar tracking at a 30° increment, locked on the 30° ray. */
export const polar = demo({
  ...figure,
  polarAngle: 30,
  view: { min: { x: -12, y: -12 }, max: { x: 150, y: 76 } },
})
  .press("F10")
  .command("_LINE")
  .type("0,0")
  .enter()
  .moveTo(56, 34)

const selectable = demo({
  ...figure,
  view: { min: { x: -10, y: -10 }, max: { x: 110, y: 70 } },
})
  .command("_RECTANG")
  .type("0,0")
  .enter()
  .type("@30,20")
  .enter()
  .command("_CIRCLE")
  .type("60,40")
  .enter()
  .type("14")
  .enter()
  .command("_LINE")
  .type("15,50")
  .enter()
  .type("@80,-45")
  .enter()
  .escape()

/** A path round the circle and across the line, the button still held. */
const lasso = (
  script: DemoScript,
  path: readonly (readonly [number, number])[]
): DemoScript =>
  path.slice(1).reduce((s, [x, y]) => s.moveTo(x, y), script.down(...path[0]))

/**
 * Dragged off left to right: a window lasso takes only what it encloses, the
 * circle (AutoCAD 2027's press and drag, erase/d04).
 */
export const windowSelection = lasso(selectable, [
  [36, 24],
  [60, 22],
  [80, 30],
  [80, 50],
  [66, 60],
  [46, 60],
  [38, 46],
])

/** Right to left: a crossing lasso takes whatever it touches, the line too. */
export const crossingSelection = lasso(selectable, [
  [80, 30],
  [60, 22],
  [36, 24],
  [38, 46],
  [46, 60],
  [66, 60],
  [80, 50],
])
