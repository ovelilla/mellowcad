import { getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import { formatLength, type DemoAction } from "@/cad"
import { HERO_FIGURE } from "@/content/figures"
import { IDLE_PROMPT, plotDemo, type PlottedLine } from "@/lib/plot"

import { Drawing } from "./drawing"
import { HeroControls } from "./hero-controls"

const SHEET_ID = "hero-sheet"

type Timed = CSSProperties & Record<`--${string}`, string | number>

/** A prompt: the question in subtle ink, its bracketed keywords a step up. */
function Prompt({ text }: { text: string }) {
  const open = text.indexOf(" [")
  if (open === -1) return <span className="text-fg-subtle">{text} </span>
  const close = text.lastIndexOf("]")
  return (
    <span className="text-fg-subtle">
      {text.slice(0, open)}{" "}
      <span className="text-fg-muted">{text.slice(open + 1, close + 1)}</span>
      {text.slice(close + 1)}{" "}
    </span>
  )
}

function Line({ line }: { line: PlottedLine }) {
  const typed =
    line.kind === "command" || line.kind === "input" ? line.text : ""
  return (
    <div className="cl-line" style={{ "--t": `${line.at}ms` } as Timed}>
      {line.kind === "command" ? (
        <span className="text-fg-subtle">{IDLE_PROMPT} </span>
      ) : line.kind === "input" ? (
        <Prompt text={line.prompt} />
      ) : (
        <span
          className={line.kind === "error" ? "text-accent" : "text-fg-muted"}
        >
          {line.text}
        </span>
      )}
      {typed && (
        <span
          className="cl-typed text-fg"
          style={
            {
              "--t": `${line.at}ms`,
              "--d": `${Math.max(line.typing, 1)}ms`,
              "--n": typed.length,
            } as Timed
          }
        >
          {typed}
        </span>
      )}
    </div>
  )
}

/** Where the script leaves the cursor, as the status bar would read it. */
function lastCursor(actions: readonly DemoAction[]) {
  for (let i = actions.length - 1; i >= 0; i--) {
    const action = actions[i]
    if ("at" in action) return action.at
  }
  return { x: 0, y: 0 }
}

/**
 * The hero's drawing sheet: the flange plotted stroke by stroke while the
 * command line below types what drew it — both timed from one replay of the
 * script, at build time, with no JavaScript needed to watch it.
 */
export async function HeroSheet() {
  const t = await getTranslations("Hero")
  const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
  const settings = plot.recording.document.getSettings()
  const cursor = lastCursor(HERO_FIGURE.script.actions)
  const coordinate = (value: number) => formatLength(value, settings)

  return (
    <figure className="flex flex-col gap-3">
      <div
        id={SHEET_ID}
        className="typing plot overflow-hidden rounded-lg border border-border bg-bg shadow-[0_24px_64px_-32px_rgb(0_0_0/0.8)]"
      >
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 sheet-grid [mask-image:none]"
          />
          <Drawing
            markup={plot.markup}
            width={plot.width}
            height={plot.height}
            title={t("drawingTitle")}
            description={t("drawingDescription")}
            className="relative"
          />
          <svg
            viewBox="0 0 40 40"
            aria-hidden="true"
            className="absolute bottom-3 left-3 size-10"
          >
            <path d="M8 32H33" stroke="var(--cad-axis-x)" strokeWidth="1.5" />
            <path d="M34 32l-6-2.5v5z" fill="var(--cad-axis-x)" />
            <path d="M8 32V7" stroke="var(--cad-axis-y)" strokeWidth="1.5" />
            <path d="M8 6l-2.5 6h5z" fill="var(--cad-axis-y)" />
            <text
              x="29"
              y="27"
              fill="var(--cad-axis-x)"
              fontSize="8"
              fontFamily="var(--font-mono)"
            >
              X
            </text>
            <text
              x="12"
              y="10"
              fill="var(--cad-axis-y)"
              fontSize="8"
              fontFamily="var(--font-mono)"
            >
              Y
            </text>
          </svg>
          <p
            className="absolute right-3 bottom-3 data-mono text-xs text-fg-subtle"
            aria-label={t("cursor")}
          >
            X {coordinate(cursor.x)}
            <span className="ml-3">Y {coordinate(cursor.y)}</span>
          </p>
        </div>
        <div className="flex items-end gap-3 border-t border-border bg-bg-sunken px-3 py-2">
          <div
            aria-hidden="true"
            className="flex h-[6em] min-w-0 flex-1 flex-col justify-end overflow-hidden font-mono text-[0.8125rem]"
          >
            {plot.lines.map((line, index) => (
              <Line key={index} line={line} />
            ))}
            <div
              className="cl-line"
              style={{ "--t": `${plot.duration}ms` } as Timed}
            >
              <span className="text-fg-subtle">{IDLE_PROMPT} </span>
              <span
                className="caret"
                style={{ "--t": `${plot.duration}ms` } as Timed}
              />
            </div>
          </div>
          <HeroControls
            targetId={SHEET_ID}
            pauseLabel={t("pause")}
            playLabel={t("play")}
            replayLabel={t("replay")}
          />
        </div>
      </div>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm text-fg-subtle">
        <span>{t("caption")}</span>
        <details>
          <summary className="text-sm underline-link">
            {t("transcriptSummary")}
          </summary>
          <ol
            tabIndex={0}
            aria-label={t("transcriptLabel")}
            className="mt-3 max-h-64 overflow-y-auto rounded-md border border-border bg-bg-sunken p-3 data-mono text-xs"
          >
            {plot.lines.map((line, index) => (
              <li key={index}>
                {line.kind === "command"
                  ? `${IDLE_PROMPT} ${line.text}`
                  : line.kind === "input"
                    ? `${line.prompt} ${line.text}`
                    : line.text}
              </li>
            ))}
          </ol>
        </details>
      </figcaption>
    </figure>
  )
}
