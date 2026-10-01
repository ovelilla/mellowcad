import { readFile } from "node:fs/promises"
import { join } from "node:path"
import bidiFactory from "bidi-js"
import { ImageResponse } from "next/og"
import { type Font, parse } from "opentype.js"

import { SvgScenePresenter, buildDrawingPreview, recordDemo } from "@/cad"
import { HERO_FIGURE } from "@/content/figures"
import {
  BRAND,
  MARK_MARKER,
  MARK_PATH,
  MARK_STROKE,
  MARK_VIEWBOX,
} from "@/lib/brand"
import { type AppLocale, DIRECTION } from "@/i18n/routing"

export const OG_SIZE = { width: 1200, height: 630 }

const DRAWING = { width: 640, height: 426 }

/** Geist Mono: capitals 0.71 em, every glyph 0.6 em wide, baseline 0.8 em down. */
const MONO_CAP_RATIO = 0.71
const MONO_ADVANCE = 0.6
const EM_ASCENT = 0.8

/**
 * The hero's flange as a standalone SVG. The rasteriser behind `next/og`
 * cannot read CSS custom properties, so this one keeps THEME's literal
 * colours, and it has no fonts of its own: the dimension text is left out of
 * the SVG and laid over it by the card instead.
 */
async function flange() {
  const recording = await recordDemo(HERO_FIGURE.script)
  const scene = buildDrawingPreview(recording.document, {
    ...DRAWING,
    padding: HERO_FIGURE.padding,
    frame: HERO_FIGURE.frame,
  })
  if (!scene) throw new Error("The hero drawing is empty.")
  const lines = scene.primitives.filter((p) => p.kind !== "text")
  const texts = scene.primitives.flatMap((p) => (p.kind === "text" ? [p] : []))
  const svg = new SvgScenePresenter({ frame: DRAWING }).render({
    ...scene,
    primitives: lines,
  })
  return {
    src: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
    texts,
  }
}

async function font(file: string) {
  return readFile(join(process.cwd(), "assets/fonts", file))
}

function arrayBufferOf(data: Buffer): ArrayBuffer {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  ) as ArrayBuffer
}

const bidi = bidiFactory()

/** A letter of a right-to-left script (Hebrew, Arabic and their blocks). */
const RTL_LETTER = /[\p{Script=Arabic}\p{Script=Hebrew}]/u

/**
 * A line of right-to-left text cut into the pieces Satori must be handed, left
 * to right as they appear.
 *
 * WHY: Satori, the renderer behind `next/og`, shapes Arabic and lays out each
 * word containing it right to left, but sets the words of a line in their
 * logical order, left to right — every line of more than one word comes out
 * backwards (vercel/satori#745, vercel/next.js#92111, both still open). So the
 * Unicode Bidirectional Algorithm (bidi-js) orders the line here: each word
 * with a right-to-left letter goes in its logical order, which Satori reverses
 * itself, and anything else — latin words, digits, a stray full stop — as it
 * reads on screen, mirrored where the algorithm mirrors it. The line breaks
 * are the message's (one sentence per line), never Satori's, which would wrap
 * the unordered text. Retire this once Satori reorders on its own.
 */
export function visualPieces(line: string): string[] {
  const levels = bidi.getEmbeddingLevels(line, "rtl")
  const order = bidi.getReorderedIndices(line, levels)
  const pieces: number[][] = []
  for (const index of order) {
    const last = pieces.at(-1)
    const previous = last?.at(-1)
    const step = levels.levels[index] % 2 === 1 ? -1 : 1
    const joins =
      previous !== undefined &&
      index === previous + step &&
      levels.levels[index] % 2 === levels.levels[previous] % 2 &&
      !/\s/.test(line[index]) &&
      !/\s/.test(line[previous])
    if (joins) last!.push(index)
    else pieces.push([index])
  }
  return pieces
    .map((piece) => {
      const rtl = levels.levels[piece[0]] % 2 === 1
      const logical = [...piece].sort((a, b) => a - b)
      const text = logical.map((index) => line[index]).join("")
      if (!rtl || RTL_LETTER.test(text)) return text
      return piece
        .map((index) => bidi.getMirroredCharacter(line[index]) ?? line[index])
        .join("")
    })
    .map((text) => text.replace(/\p{Bidi_Control}/gu, ""))
    .filter((text) => text !== "")
}

/** The card's Arabic text: its latin runs in Inter, as on the page. */
const ARABIC_FAMILY = "Inter, Readex Pro"

/**
 * How wide a word of a right-to-left script is set, shaped: its letters
 * joined, as Satori draws them.
 *
 * WHY: Satori sizes a word's box as the sum of its letters measured one by
 * one, each in its isolated form, which in Arabic is far wider than the
 * joined word it then draws — a fifth wider and more — so every word trailed
 * a gap of its own. Each word's box is given its shaped width instead.
 */
type ShapedWidth = (word: string) => number | undefined

function shapedWidth(face: Font, fontSize: number): ShapedWidth {
  return (word) =>
    RTL_LETTER.test(word) ? face.getAdvanceWidth(word, fontSize) : undefined
}

/** A line of the card in the page's direction, ordered for Satori if RTL. */
function CardLine({ text, width }: { text: string; width?: ShapedWidth }) {
  if (!width) return <span>{text}</span>
  return (
    <span style={{ display: "flex" }}>
      {visualPieces(text).map((piece, index) => {
        const shaped = width(piece)
        return (
          <span
            key={index}
            style={{
              whiteSpace: "pre",
              flexShrink: 0,
              ...(shaped !== undefined && { width: shaped }),
            }}
          >
            {piece}
          </span>
        )
      })}
    </span>
  )
}

/**
 * The social card: the flange as the engine draws it, the eyebrow, and a
 * headline. Satori lays out only flexbox, so every box states `display: flex`.
 */
export async function ogImage({
  locale,
  eyebrow,
  title,
}: {
  locale: string
  eyebrow: string
  title: string
}) {
  const rtl = DIRECTION[locale as AppLocale] === "rtl"
  const [{ src, texts }, inter, mono, arabic] = await Promise.all([
    flange(),
    font("inter-latin-600-normal.woff"),
    font("geist-mono-latin-400-normal.woff"),
    // A whole face, latin included: Satori's shaper fails on Readex Pro's
    // Arabic subset as soon as a word meets a character the subset lacks.
    rtl ? font("readex-pro-600.ttf") : undefined,
  ])
  const face = arabic && parse(arrayBufferOf(arabic))
  const sentences = [
    ...new Intl.Segmenter(locale, { granularity: "sentence" }).segment(title),
  ].map(({ segment }) => segment.trim())

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: BRAND.sheet,
        backgroundImage:
          "linear-gradient(rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.06) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: BRAND.ink,
        padding: 56,
        fontFamily: "Inter",
        // The composition mirrors; the drawing does not.
        ...(rtl && { flexDirection: "row-reverse" }),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 470,
          ...(rtl && { alignItems: "flex-end" }),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            ...(rtl && { flexDirection: "row-reverse" }),
          }}
        >
          <svg width="44" height="44" viewBox={MARK_VIEWBOX} fill="none">
            <path
              d={MARK_PATH}
              stroke={BRAND.ink}
              strokeWidth={MARK_STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x={MARK_MARKER.x}
              y={MARK_MARKER.y}
              width={MARK_MARKER.size}
              height={MARK_MARKER.size}
              stroke={BRAND.precision}
              strokeWidth={MARK_MARKER.stroke}
            />
          </svg>
          <span style={{ fontSize: 34, letterSpacing: "-0.02em" }}>
            MellowCAD
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            ...(rtl && { alignItems: "flex-end" }),
          }}
        >
          <span
            style={
              rtl
                ? // No tracking and no capitals in a cursive script (§8.2).
                  {
                    display: "flex",
                    fontFamily: ARABIC_FAMILY,
                    fontSize: 24,
                    color: "#94a3b8",
                  }
                : {
                    fontFamily: "Geist Mono",
                    fontSize: 20,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                  }
            }
          >
            <CardLine
              text={eyebrow}
              width={face ? shapedWidth(face, 24) : undefined}
            />
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              ...(rtl && {
                alignItems: "flex-end",
                fontFamily: ARABIC_FAMILY,
                lineHeight: 1.3,
                letterSpacing: 0,
              }),
            }}
          >
            {sentences.map((sentence) => (
              <CardLine
                key={sentence}
                text={sentence}
                width={face ? shapedWidth(face, 74) : undefined}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          position: "relative",
          width: DRAWING.width,
          height: DRAWING.height,
          [rtl ? "marginRight" : "marginLeft"]: "auto",
          marginTop: "auto",
          marginBottom: "auto",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders <img>, not next/image */}
        <img src={src} width={DRAWING.width} height={DRAWING.height} alt="" />
        {texts.map((text, index) => {
          // Geist Mono is monospaced (0.6 em advance), so the text's width
          // — and so where its justification point sits — is known exactly.
          const size = text.height / MONO_CAP_RATIO
          const width = text.text.length * MONO_ADVANCE * size
          const anchorX =
            text.align === "center"
              ? width / 2
              : text.align === "right"
                ? width
                : 0
          const baseline = EM_ASCENT * size
          const drop = text.baseline === "capMiddle" ? text.height / 2 : 0
          return (
            <span
              key={index}
              style={{
                position: "absolute",
                left: text.at.x - anchorX,
                top: text.at.y + drop - baseline,
                width,
                height: size,
                fontFamily: "Geist Mono",
                fontSize: size,
                lineHeight: 1,
                color: text.color,
                transform: `rotate(${(text.rotation * 180) / Math.PI}deg)`,
                transformOrigin: `${anchorX}px ${baseline}px`,
              }}
            >
              {text.text}
            </span>
          )
        })}
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Inter", data: inter, weight: 600, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
        // WHY last: Satori shapes Arabic into contextual forms that have no
        // code point, takes each for a missing glyph and asks its fallback
        // resolver for a face for `undefined`, which answers with the last
        // face loaded. Any face but the one the word is set in reads a glyph
        // of nothing and throws.
        ...(arabic
          ? [
              {
                name: "Readex Pro",
                data: arabic,
                weight: 600 as const,
                style: "normal" as const,
              },
            ]
          : []),
      ],
    }
  )
}
