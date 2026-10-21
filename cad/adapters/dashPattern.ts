/** Where a dash pattern stands `distance` along its stroke, within one period. */
export function dashPhase(distance: number, dash: readonly number[]): number {
  // An odd-length pattern repeats itself once to alternate dash and gap.
  const sum = dash.reduce((total, d) => total + d, 0)
  const period = dash.length % 2 === 0 ? sum : sum * 2
  return period > 0 ? distance % period : 0
}

/**
 * The dash array a presenter hands its renderer: a run of 0 (a linetype's dot)
 * becomes a run as long as the stroke is wide, taken from the gap after it, so
 * the period and every other dash stay where the scene put them.
 *
 * WHY not a zero-length dash with round caps: that also rounds and lengthens
 * every other dash of the pattern, and a butt-capped zero-length dash draws
 * nothing in a canvas or an SVG.
 */
export function drawnDash(dash: readonly number[], width: number): number[] {
  const drawn = [...dash]
  for (let i = 0; i < drawn.length; i += 2) {
    if (drawn[i] !== 0 || i + 1 >= drawn.length) continue
    const dot = Math.min(width, drawn[i + 1])
    drawn[i] = dot
    drawn[i + 1] -= dot
  }
  return drawn
}
