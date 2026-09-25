import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { SvgScenePresenter, buildDrawingPreview, recordDemo } from "@/cad"
import { HERO_FIGURE } from "@/content/figures"
import {
  BRAND,
  MARK_MARKER,
  MARK_PATH,
  MARK_STROKE,
  MARK_VIEWBOX,
} from "@/lib/brand"

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

/**
 * The social card: the flange as the engine draws it, the eyebrow, and a
 * headline. Satori lays out only flexbox, so every box states `display: flex`.
 */
export async function ogImage({
  eyebrow,
  title,
}: {
  eyebrow: string
  title: string
}) {
  const [{ src, texts }, inter, mono] = await Promise.all([
    flange(),
    font("inter-latin-600-normal.woff"),
    font("geist-mono-latin-400-normal.woff"),
  ])
  const sentences = [
    ...new Intl.Segmenter("en", { granularity: "sentence" }).segment(title),
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
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 470,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              fontFamily: "Geist Mono",
              fontSize: 20,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            {eyebrow}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 74,
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
            }}
          >
            {sentences.map((sentence) => (
              <span key={sentence}>{sentence}</span>
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
          marginLeft: "auto",
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
      ],
    }
  )
}
