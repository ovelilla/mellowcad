import { getTranslations } from "next-intl/server"
import type { CSSProperties } from "react"

import {
  engineText,
  formatLength,
  recordDemo,
  type DemoAction,
  type EngineState,
  type PromptSegment,
} from "@mellowcad/engine"
import { HERO_FIGURE } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { pageEngineLocale, plotDemo, type PlottedLine } from "@/lib/plot"

import { CommandTry } from "./command-try"
import { Drawing } from "./drawing"
import { HeroControls } from "./hero-controls"
import { HeroViewCube } from "./hero-view-cube"
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

/** The view control's label, `[Top]`: the view the engine says the camera shows. */
function viewName(state: EngineState) {
  return state.names.views[state.view.preset ?? "custom"]
}

/**
 * The hero's drawing sheet, shaped as the editor's canvas: the flange plotted
 * stroke by stroke in plan while the command line types what drew it, then —
 * as -VIEW turns the view — the editor's last frame, the drawing and its solid
 * in SW Isometric, with the view's label and the ViewCube turning with it.
 * All of it timed from one replay of the script, at build time, with no
 * JavaScript needed to watch it. The command line's last line is a real one.
 */
export async function HeroSheet() {
  const t = await getTranslations("Hero")
  const { editor, commandList } = await sitePaths()
  const engine = await pageEngineLocale()
  const text = engineText(engine)
  const idle = text.idlePrompt()
  const [plot, drafted] = await Promise.all([
    plotDemo(HERO_FIGURE.script, { ...HERO_FIGURE, locale: engine }),
    recordDemo(HERO_FIGURE.drawing, { locale: engine }),
  ])
  const turned = plot.turned
  if (!turned) throw new Error("The hero never turns its view.")
  const settings = plot.recording.document.getSettings()
  const cursor = lastCursor(
    HERO_FIGURE.script.actions.slice(0, HERO_FIGURE.drafted)
  )
  const coordinate = (value: number) => formatLength(value, settings)
  const turn = { "--t": `${turned.at}ms` } as Timed
  const plan = drafted.state
  const last = plot.recording.state

  return (
    <figure className="flex flex-col gap-3">
      <TransitionSheet id={SHEET_ID} editor={editor}>
        <div className="typing plot">
          {/* The sheet is the drawing: its figures, the cube, the UCS icon
              and the coordinates never mirror. */}
          <div className="relative" dir="ltr">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 sheet-grid [mask-image:none]"
            />
            <div className="turn-out relative" style={turn}>
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
            <svg
              viewBox={`0 0 ${plot.width} ${plot.height}`}
              aria-hidden="true"
              direction="ltr"
              className="turn-in absolute inset-0 block h-auto w-full"
              style={turn}
              dangerouslySetInnerHTML={{ __html: turned.markup }}
            />
            {/* The view control, top left, as the editor draws it: AutoCAD's
                brackets are notation, not words. */}
            <p
              aria-hidden="true"
              className="absolute inset-s-3 top-2 grid text-xs text-fg-subtle"
            >
              {[plan, last].map((state, index) => (
                <span
                  key={index}
                  className={`col-start-1 row-start-1 before:content-['['] after:content-[']'] ${index === 0 ? "turn-out" : "turn-in"}`}
                  style={turn}
                >
                  <span dir="auto">{viewName(state)}</span>
                </span>
              ))}
            </p>
            <div className="absolute inset-e-2 top-2 size-14 opacity-60 sm:size-24">
              {[plan, last].map((state, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 ${index === 0 ? "turn-out" : "turn-in"}`}
                  style={turn}
                >
                  <HeroViewCube
                    cube={state.viewCube}
                    names={state.names}
                    className="size-full overflow-visible"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border bg-bg-sunken px-3 py-2">
            <div className="flex items-end gap-3">
              <div
                aria-hidden="true"
                dir="ltr"
                lang={text.commandTag}
                className="flex h-[4.5em] min-w-0 flex-1 flex-col justify-end overflow-hidden font-mono text-[0.8125rem]"
              >
                {plot.lines.map((line, index) => (
                  <Line key={index} line={line} idle={idle} />
                ))}
              </div>
              <HeroControls
                targetId={SHEET_ID}
                pauseLabel={t("pause")}
                playLabel={t("play")}
                replayLabel={t("replay")}
              />
            </div>
            <div className="hidden border-t border-border pt-1 md:block">
              <CommandTry
                commandsHref={commandList}
                editorHref={editor}
                label={t("tryLabel")}
                placeholder={t("tryPlaceholder")}
                hint={t("tryHint")}
                prompt={idle}
                lang={text.commandTag}
                unknown={text.message("unknownCommand", {
                  name: "{command}",
                })}
              />
            </div>
          </div>
        </div>
      </TransitionSheet>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-sm text-fg-subtle">
        <span>
          <span className="font-medium text-fg">{t("tagline")}</span>{" "}
          {t("caption")}
        </span>
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
