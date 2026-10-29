/**
 * POLARANG's increments as the status bar's Polar ▾ offers them (desktop
 * workspace/d01-m), each written with its first four multiples rounded:
 * `90, 180, 270, 360...`, 22.5 as `23, 45, 68, 90...` (e01-4). Choosing one
 * is `choosePolarAngle(step)`.
 */
export const POLAR_ANGLE_MENU: readonly {
  readonly step: number
  readonly label: string
}[] = [90, 45, 30, 22.5, 18, 15, 10, 5].map((step) => ({
  step,
  label: `${[1, 2, 3, 4].map((n) => Math.round(n * step)).join(", ")}...`,
}))
