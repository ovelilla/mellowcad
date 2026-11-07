import { getTranslations } from "next-intl/server"

import { Drawing } from "@/components/marketing/drawing"
import type { DocsSessionId } from "@/content/figures"
import type { Messages } from "@/i18n/messages"
import { loadEngineLocale } from "@/i18n/engine"
import type { AppLocale } from "@/i18n/routing"
import { historyLine, renderSession } from "@/lib/docs/sessions"

/**
 * A page's `<Session name="…" />`: the engine draws the figure and writes its
 * history, both in the page's language, so a guide never types a prompt. Its
 * caption is the messages' (`Docs.sessions`), or the page's own (`caption`),
 * as a command's page takes it from its notes.
 */
export async function DocsSession({
  id,
  locale,
  caption,
}: {
  id: DocsSessionId
  locale: AppLocale
  caption?: string
}) {
  const t = await getTranslations({ locale, namespace: "Docs.sessions" })
  const { figure, lines, text } = await renderSession(id, await loadEngineLocale(locale))
  const title = caption ?? t(id as keyof Messages["Docs"]["sessions"])
  return (
    <figure className="my-6 flex flex-col gap-3 rounded-lg border border-border bg-bg-raised p-4">
      <Drawing
        markup={figure.markup}
        width={figure.width}
        height={figure.height}
        title={title}
        // A wide figure (a gallery of options) keeps its width; the rest are
        // a session's 320 px.
        className={figure.width > 320 ? "mx-auto max-w-160" : "mx-auto max-w-80"}
      />
      {lines.length > 0 && (
        // A command line's history: left to right in every page, and
        // scrolled sideways rather than wrapped, so it takes focus.
        <ol
          tabIndex={0}
          dir="ltr"
          lang={text.commandTag}
          className="overflow-x-auto rounded-md bg-bg-sunken p-3 data-mono text-[0.8125rem] whitespace-nowrap print:overflow-visible print:whitespace-pre-wrap"
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
      <figcaption className="text-sm text-fg-subtle">{title}</figcaption>
    </figure>
  )
}
