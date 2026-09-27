import { getLocale, getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import { formatLength, type DemoAction, type PromptSegment } from "@/cad"
import { HERO_FIGURE } from "@/content/figures"
import { sitePaths } from "@/i18n/navigation"
import { IDLE_PROMPT, plotDemo, type PlottedLine } from "@/lib/plot"
import { pluralMessage } from "@/lib/plural"

import { Drawing } from "./drawing"
import { HeroControls } from "./hero-controls"
import { LiveSheet } from "./live-sheet"
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

function Line({ line }: { line: PlottedLine }) {
  const typed =
    line.kind === "command" || line.kind === "input" ? line.text : ""
  return (
    <div className="cl-line" style={{ "--t": `${line.at}ms` } as Timed}>
      {line.kind === "command" ? (
        <span className="text-fg-subtle">{IDLE_PROMPT} </span>
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
 * script, at build time, with no JavaScript needed to watch it. On a computer
 * the sheet can then come alive (`LiveSheet`).
 */
export async function HeroSheet() {
  const t = await getTranslations("Hero")
  const live = await getTranslations("LiveSketch")
  const locale = await getLocale()
  const { editor } = await sitePaths()
  const plot = await plotDemo(HERO_FIGURE.script, HERO_FIGURE)
  const settings = plot.recording.document.getSettings()
  const cursor = lastCursor(HERO_FIGURE.script.actions)
  const coordinate = (value: number) => formatLength(value, settings)

  return (
    <figure className="flex flex-col gap-3">
      <LiveSheet
        id={SHEET_ID}
        editor={editor}
        view={{
          frame: HERO_FIGURE.frame,
          padding: HERO_FIGURE.padding,
          width: HERO_FIGURE.width,
        }}
        labels={{
          tryIt: live("tryIt"),
          loading: live("loading"),
          failed: live("failed"),
          retry: live("retry"),
          live: {
            canvasLabel: live("canvasLabel"),
            hint: live("hint"),
            wheelHint: live("wheelHint"),
            commandLog: live("commandLog"),
            commandPrompt: IDLE_PROMPT,
            openEditor: live("openEditor"),
            close: live("close"),
            closeLabel: live("closeLabel"),
            dialogTitle: live("dialogTitle"),
            saved: pluralMessage(locale, (count) => live("saved", { count })),
            dialogBody: live("dialogBody"),
            download: live("download"),
            replace: live("replace"),
            cancel: live("cancel"),
          },
        }}
        drawing={
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
            <UcsIcon />
            <p
              className="absolute right-3 bottom-3 data-mono text-xs text-fg-subtle"
              aria-label={t("cursor")}
            >
              X {coordinate(cursor.x)}
              <span className="ml-3">Y {coordinate(cursor.y)}</span>
            </p>
          </div>
        }
        transcript={
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
        }
        controls={
          <HeroControls
            targetId={SHEET_ID}
            pauseLabel={t("pause")}
            playLabel={t("play")}
            replayLabel={t("replay")}
          />
        }
      />
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
