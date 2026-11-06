import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { engineText, type EngineText } from "@mellowcad/engine"
import { SOLID_COMMANDS } from "@/content/commands"
import { COMMAND_SESSIONS, FIGURES } from "@/content/figures"
import { localePath } from "@/i18n/navigation"
import {
  commandPageIds,
  commandPagePath,
  readNotes,
} from "@/lib/docs/command-pages"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"
import { SnapCorners } from "./snap-corners"

/** The command language's name of a command, its page's link where it has one. */
function CommandCap({
  id,
  text,
  page,
}: {
  id: string
  text: EngineText
  page?: string
}) {
  const cap = (
    <span
      dir="ltr"
      lang={text.commandTag}
      className="inline-flex h-6 items-center rounded border border-border bg-bg px-1.5 font-mono text-xs text-fg"
    >
      {text.commandNames(id)[0]}
    </span>
  )
  return page ? (
    <Link
      href={page}
      prefetch={false}
      className="rounded decoration-fg-subtle underline-offset-4 [&>span]:underline"
    >
      {cap}
    </Link>
  ) : (
    cap
  )
}

/** The sessions of the commands' own pages this section shows, with the commands each stands for. */
const CARDS = [
  {
    session: "revolve",
    title: "extrudeTitle",
    commands: ["EXTRUDE", "REVOLVE", "PRESSPULL"],
  },
  {
    session: "subtract",
    title: "booleansTitle",
    commands: ["UNION", "SUBTRACT", "INTERSECT"],
  },
] as const

const STYLES = [
  { figure: "wireframe", keyword: "2dwireframe" },
  { figure: "hidden", keyword: "Hidden" },
  { figure: "conceptual", keyword: "Conceptual" },
] as const

/**
 * The 3D, said as it is: what the solids do today, each a session the engine
 * draws — the same as the commands' own pages — and what they do not do yet,
 * beside it.
 */
export async function SolidsSection() {
  const t = await getTranslations("Solids")
  const locale = await getLocale()
  const engine = await pageEngineLocale()
  const text = engineText(engine)
  const root = /*turbopackIgnore: true*/ process.cwd()
  const pages = new Set(commandPageIds(root))
  const page = (id: string) =>
    pages.has(id) ? localePath(locale, commandPagePath(id)) : undefined
  const [sessions, styles] = await Promise.all([
    Promise.all(
      CARDS.map((card) =>
        renderFigure({
          ...COMMAND_SESSIONS[card.session].figure,
          locale: engine,
        })
      )
    ),
    Promise.all(
      STYLES.map((style) =>
        renderFigure({ ...FIGURES[style.figure], locale: engine })
      )
    ),
  ])
  // What each session shows, as its command's page says it in this language.
  const alt = (id: string) =>
    readNotes(root, id, locale)?.data.figure ??
    readNotes(root, id, "en")?.data.figure ??
    ""

  return (
    <section
      aria-labelledby="solids-title"
      id="solids"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading
        id="solids-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card, index) => {
          const drawn = sessions[index]
          return (
            <div
              key={card.session}
              className="snap-card reveal relative flex flex-col gap-4 rounded-lg border border-border bg-bg-raised p-4"
            >
              <SnapCorners />
              <div className="overflow-hidden rounded-md border border-border bg-bg">
                <Drawing
                  markup={drawn.markup}
                  width={drawn.width}
                  height={drawn.height}
                  title={alt(card.session.toUpperCase())}
                />
              </div>
              <h3 className="text-lg font-semibold">{t(card.title)}</h3>
              <p className="flex flex-wrap gap-1.5">
                {card.commands.map((id) => (
                  <CommandCap key={id} id={id} text={text} page={page(id)} />
                ))}
              </p>
            </div>
          )
        })}
        <figure className="snap-card reveal relative flex flex-col gap-4 rounded-lg border border-border bg-bg-raised p-4 md:col-span-2">
          <SnapCorners />
          <div className="grid grid-cols-3 gap-2">
            {STYLES.map((style, index) => {
              const drawn = styles[index]
              return (
                <div key={style.figure} className="flex flex-col gap-1.5">
                  <div className="overflow-hidden rounded-md border border-border bg-bg">
                    <Drawing
                      markup={drawn.markup}
                      width={drawn.width}
                      height={drawn.height}
                      title={t(`${style.figure}Alt`)}
                    />
                  </div>
                  <span
                    dir="ltr"
                    lang={text.commandTag}
                    className="self-start font-mono text-xs text-fg-subtle"
                  >
                    {text.keyword("VSCURRENT", style.keyword)}
                  </span>
                </div>
              )
            })}
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-lg font-semibold">{t("stylesTitle")}</span>
            <span className="flex flex-wrap gap-1.5">
              {["VSCURRENT", "3DORBIT"].map((id) => (
                <CommandCap key={id} id={id} text={text} page={page(id)} />
              ))}
            </span>
          </figcaption>
        </figure>
      </div>
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4 bg-bg p-5">
          <h3 className="label-mono">{t("todayTitle")}</h3>
          <p className="flex flex-wrap gap-1.5">
            {SOLID_COMMANDS.map((id) => (
              <CommandCap key={id} id={id} text={text} page={page(id)} />
            ))}
          </p>
        </div>
        <div className="flex flex-col gap-4 bg-bg p-5">
          <h3 className="label-mono">{t("notYetTitle")}</h3>
          <p className="text-fg-muted">{t("notYet")}</p>
        </div>
      </div>
    </section>
  )
}
