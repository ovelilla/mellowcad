import type { CSSProperties } from "react"

import type { AppLocale } from "@/i18n/routing"

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
 * The font variables a page in `locale` overrides on `<html>`, if its script
 * needs a face Inter lacks. Only that page names the face, so `/` and `/es`
 * never download it.
 */
export function scriptFontVariables(
  locale: AppLocale,
  fonts: { sans: FontFamily; mono: FontFamily; arabic: FontFamily }
): CSSProperties | undefined {
  if (locale !== "ar") return undefined
  return {
    "--font-sans": scriptFontStack(fonts.sans, fonts.arabic),
    "--font-mono": scriptFontStack(fonts.mono, fonts.arabic),
  } as CSSProperties
}
