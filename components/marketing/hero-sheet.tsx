import { getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import {
  engineText,
  formatLength,
  type DemoAction,
  type PromptSegment,
} from "@/cad"
import { HERO_FIGURE } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { pageEngineLocale, plotDemo, type PlottedLine } from "@/lib/plot"

import { Drawing } from "./drawing"
import { HeroControls } from "./hero-controls"
import { TransitionSheet } from "./transition-sheet"
import { UcsIcon } from "./ucs-icon"

const SHEET_ID = "hero-sheet"

type Timed = CSSProperties & Record<`--${string}`, string | number>

/** A prompt: the question in subtle ink, its bracketed keywords a step up. */
function Prompt({ segments }: { segments: readonly PromptSegment[] }) {
  return (
    <span className="text-fg-subtle">
      {segments.map((segment, index) =>
        segment.keywords ? (
          <span key={index} className="text-fg-muted">
            {segment.text}
          </span>
        ) : (
          segment.text
        )
      )}{" "}
    </span>
  )
}

function Line({ line, idle }: { line: PlottedLine; idle: string }) {
  const typed =
    line.kind === "command" || line.kind === "input" ? line.text : ""
  return (
    <div className="cl-line" style={{ "--t": `${line.at}ms` } as Timed}>
      {line.kind === "command" ? (
        <span className="text-fg-subtle">{idle} </span>
      ) : line.kind === "input" ? (
        <Prompt segments={line.segments} />
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
  const { editor } = await sitePaths()
  const engine = await pageEngineLocale()
  const text = engineText(engine)
  const idle = text.idlePrompt()
  const plot = await plotDemo(HERO_FIGURE.script, {
    ...HERO_FIGURE,
    locale: engine,
  })
  const settings = plot.recording.document.getSettings()
  const cursor = lastCursor(HERO_FIGURE.script.actions)
  const coordinate = (value: number) => formatLength(value, settings)

  return (
    <figure className="flex flex-col gap-3">
      <TransitionSheet id={SHEET_ID} editor={editor}>
        <div className="typing plot">
          {/* The sheet is the drawing: its figure, UCS icon and coordinates
              never mirror. */}
          <div className="relative" dir="ltr">
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
            <UcsIcon />
            <p
              className="absolute inset-e-3 bottom-3 data-mono text-xs text-fg-subtle"
              aria-label={t("cursor")}
            >
              X {coordinate(cursor.x)}
              <span className="ms-3">Y {coordinate(cursor.y)}</span>
            </p>
          </div>
          <div className="flex items-end gap-3 border-t border-border bg-bg-sunken px-3 py-2">
            <div
              aria-hidden="true"
              dir="ltr"
              lang={text.commandTag}
              className="flex h-[6em] min-w-0 flex-1 flex-col justify-end overflow-hidden font-mono text-[0.8125rem]"
            >
              {plot.lines.map((line, index) => (
                <Line key={index} line={line} idle={idle} />
              ))}
              <div
                className="cl-line"
                style={{ "--t": `${plot.duration}ms` } as Timed}
              >
                <span className="text-fg-subtle">{idle} </span>
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
      </TransitionSheet>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm text-fg-subtle">
        <span>{t("caption")}</span>
        <details>
          <summary className="text-sm underline-link">
            {t("transcriptSummary")}
          </summary>
          <ol
            tabIndex={0}
            dir="ltr"
            aria-label={t("transcriptLabel")}
            className="mt-3 max-h-64 overflow-y-auto rounded-md border border-border bg-bg-sunken p-3 data-mono text-xs"
          >
            {plot.lines.map((line, index) => (
              <li key={index} lang={text.commandTag}>
                {line.kind === "command"
                  ? `${idle} ${line.text}`
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
