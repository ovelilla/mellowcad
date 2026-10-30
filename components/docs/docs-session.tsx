import { getTranslations } from "next-intl/server"

import { Drawing } from "@/components/marketing/drawing"
import type { DocsSessionId } from "@/content/figures"
import { loadEngineLocale } from "@/i18n/engine"
import type { AppLocale } from "@/i18n/routing"
import { historyLine, renderSession } from "@/lib/docs/sessions"

/**
 * A written page's `<Session name="…" />`: the engine draws the figure and
 * writes its history, both in the page's language, so a guide never types a
 * prompt.
 */
export async function DocsSession({ id, locale }: { id: DocsSessionId; locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "Docs.sessions" })
  const { figure, lines, text } = await renderSession(id, await loadEngineLocale(locale))
  return (
    <figure className="my-6 flex flex-col gap-3 rounded-lg border border-border bg-bg-raised p-4">
      <Drawing
        markup={figure.markup}
        width={figure.width}
        height={figure.height}
        title={t(id)}
        className="mx-auto max-w-80"
      />
      {lines.length > 0 && (
        // A command line's history: left to right in every page, and
        // scrolled sideways rather than wrapped, so it takes focus.
        <ol
          tabIndex={0}
          dir="ltr"
          lang={text.commandTag}
          className="overflow-x-auto rounded-md bg-bg-sunken p-3 data-mono text-[0.8125rem] whitespace-nowrap"
        >
          {lines.map((line, index) => (
            <li
              key={index}
              className={line.kind === "info" || line.kind === "error" ? "text-fg-muted" : "text-fg"}
            >
              {historyLine(line, text)}
            </li>
          ))}
        </ol>
      )}
      <figcaption className="text-sm text-fg-subtle">{t(id)}</figcaption>
    </figure>
  )
}
