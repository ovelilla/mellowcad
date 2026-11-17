import {
  HatchPatternLine,
  hatchPattern,
  hatchPatternLines,
  isSolidHatchPattern,
  reexpressedPatternLines,
  userHatchPatternLines,
} from "./hatchPatterns"
import { HatchEntity } from "./entityTypes"

/**
 * The lines a hatch's pattern draws, in pattern units: its own where it
 * carries them, else the registry's for its name (none for a name this build
 * does not ship).
 */
export function hatchLines(hatch: HatchEntity): readonly HatchPatternLine[] {
  if (hatch.patternLines) return hatch.patternLines
  // A User-defined one is no registry name: lines 1 apart, its scale spacing
  // them, where a file kept none.
  return hatch.patternType === "user"
    ? USER_LINES
    : hatchPatternLines(hatch.patternId)
}

const USER_LINES = userHatchPatternLines(false)

/**
 * A hatch given a new scale or angle, its pattern read again as AutoCAD's
 * -HATCHEDIT and palette read it (probe hatchpat/p04): a User-defined one is
 * made again from its spacing (the scale), angle and Double; a pattern
 * acadiso.pat has is generated from it again, so acad.pat's inch lines a DXF
 * brought give way to the metric ones (an ANSI31 at 3 spaced 3.175 × 3); one
 * AutoCAD cannot find keeps the lines it draws, only the settings changing
 * (p02, p05: MYPAT's scale 3 draws as its 2 did).
 */
export function hatchWithPatternSettings(
  hatch: HatchEntity,
  settings: { readonly scale?: number; readonly angle?: number }
): HatchEntity {
  const scale = settings.scale ?? hatch.patternScale
  const angle = settings.angle ?? hatch.patternAngle
  const changed = { ...hatch, patternScale: scale, patternAngle: angle }
  if (hatch.patternType === "user") {
    const double = (hatch.patternLines?.length ?? 1) > 1
    return { ...changed, patternLines: userHatchPatternLines(double) }
  }
  if (!hatch.patternLines) return changed
  if (hatchPattern(hatch.patternId)) {
    const { patternLines, ...registry } = changed
    void patternLines
    return registry
  }
  return hatchKeepingLines(hatch, scale, angle)
}

/** A hatch given a new scale and angle that still draws what it drew. */
function hatchKeepingLines(
  hatch: HatchEntity,
  scale: number,
  angle: number
): HatchEntity {
  const changed = { ...hatch, patternScale: scale, patternAngle: angle }
  const lines = hatchLines(hatch)
  if (lines.length === 0) return changed
  return {
    ...changed,
    patternLines: reexpressedPatternLines(
      lines,
      { scale: hatch.patternScale, angle: hatch.patternAngle },
      { scale, angle }
    ),
  }
}

/**
 * MATCHPROP's pattern from `source` onto `target`, as AutoCAD 2027's: a
 * pattern it can read again (acadiso.pat's, a User-defined one) is the
 * target's with the source's scale and angle (hatchpat/p08: a MYPAT hatch
 * becomes the `_U` source's); one it cannot leaves the target's pattern,
 * drawn as before, with the source's scale and angle (p07; Autodesk's
 * "Cannot use match properties on custom hatch pattern": the destination
 * "reverts previous pattern"). A gradient goes whole, either way
 * (gradient/g14: a SPHERICAL source makes an ANSI31 target its gradient, an
 * ANSI37 source makes a gradient target ANSI37).
 */
export function hatchMatchingPattern(
  source: HatchEntity,
  target: HatchEntity
): HatchEntity {
  if (source.gradient) {
    const { patternType, patternLines, ...rest } = target
    void patternType
    void patternLines
    return { ...rest, patternId: source.patternId, gradient: source.gradient }
  }
  const readable =
    source.patternType === "user" ||
    isSolidHatchPattern(source.patternId) ||
    hatchPattern(source.patternId) !== undefined
  if (!readable) {
    return hatchKeepingLines(target, source.patternScale, source.patternAngle)
  }
  const { patternType, patternLines, gradient, ...rest } = target
  void patternType
  void patternLines
  void gradient
  return {
    ...rest,
    patternId: source.patternId,
    patternScale: source.patternScale,
    patternAngle: source.patternAngle,
    ...(source.patternType ? { patternType: source.patternType } : {}),
    ...(source.patternType === "user" && source.patternLines
      ? { patternLines: source.patternLines }
      : {}),
  }
}
