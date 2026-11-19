import type { CSSProperties } from "react"

import {
  type AppLocale,
  INTER_SCRIPTS,
  SCRIPT,
  type ScriptNeedingFace,
} from "@/i18n/routing"

/** A `next/font` family list: the face, then its metric-matched fallback. */
type FontFamily = { readonly style: { readonly fontFamily: string } }

function families(font: FontFamily): string[] {
  return font.style.fontFamily.split(",").map((family) => family.trim())
}

/**
 * The page's font with a script's face slotted in right behind it: Inter (or
 * Geist Mono) draws the latin runs and the digits, the script's face whatever
 * Inter has no glyph for. Both faces come before either fallback — a
 * fallback is a local Arial, which has Arabic of its own and would take those
 * letters before Readex Pro ever could. The script's fallback, sized to its
 * face, goes first, so the text that waits for it does not jump on arrival.
 */
export function scriptFontStack(
  primary: FontFamily,
  script: FontFamily
): string {
  const [face, ...fallbacks] = families(primary)
  const [scriptFace, ...scriptFallbacks] = families(script)
  return [face, scriptFace, ...scriptFallbacks, ...fallbacks].join(", ")
}

/**
 * The page's font with a face of a few letters before it: that face's
 * `unicode-range` holds only them, so a Polish, Czech or Hungarian letter finds it first and
 * Inter's whole Latin Extended file (85 KB) is never fetched, while every
 * other character falls through to Inter. No fallback of its own: Inter's
 * follows.
 */
export function lettersFontStack(
  primary: FontFamily,
  letters: FontFamily
): string {
  const [lettersFace] = families(letters)
  return [lettersFace, ...families(primary)].join(", ")
}

/** The faces of the scripts Inter and Geist Mono lack, or draw too heavily. */
type ScriptFaces = {
  readonly arabic: FontFamily
  readonly "latin-ext": { readonly sans: FontFamily; readonly mono: FontFamily }
}

/**
 * The font variables a page in `locale` overrides on `<html>`, if its script
 * needs a face Inter lacks. Only that page names the face, so `/` and `/es`
 * never download it.
 */
export function scriptFontVariables(
  locale: AppLocale,
  fonts: { sans: FontFamily; mono: FontFamily } & Pick<
    ScriptFaces,
    ScriptNeedingFace
  >
): CSSProperties | undefined {
  const script = SCRIPT[locale]
  if (isInterScript(script)) return undefined
  if (script === "latin-ext") {
    const letters = fonts["latin-ext"]
    return {
      "--font-sans": lettersFontStack(fonts.sans, letters.sans),
      "--font-mono": lettersFontStack(fonts.mono, letters.mono),
    } as CSSProperties
  }
  return {
    "--font-sans": scriptFontStack(fonts.sans, fonts[script]),
    "--font-mono": scriptFontStack(fonts.mono, fonts[script]),
  } as CSSProperties
}

function isInterScript(
  script: (typeof SCRIPT)[AppLocale]
): script is (typeof INTER_SCRIPTS)[number] {
  return (INTER_SCRIPTS as readonly string[]).includes(script)
}
