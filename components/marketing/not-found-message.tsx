import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { engineText } from "@/cad"
import { loadEngineLocale } from "@/i18n/engine"
import { localePath } from "@/i18n/navigation"
import type { AppLocale } from "@/i18n/routing"
import { EDITOR_PATH } from "@/lib/site"

import { UnknownCommand } from "./unknown-command"

/**
 * The 404 answers the way AutoCAD answers a mistyped command — the requested
 * path is the command. Shared by the localized 404 and the global one, which
 * renders outside `[locale]` and so names its language.
 */
export async function NotFoundMessage({ locale }: { locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "NotFound" })
  // The engine's own words, as the command line would print them, then
  // AutoCAD's pointer to its help.
  const text = engineText(await loadEngineLocale(locale))
  const unknown = text.message("unknownCommand", { name: "{command}" })
  return (
    <>
      <h1 className="sr-only">{t("metaTitle")}</h1>
      {/* The command line's answer, in the command language: left to right. */}
      <p
        dir="ltr"
        className="rounded-md border border-border bg-bg-sunken p-5 font-mono text-sm leading-relaxed"
      >
        <span className="text-fg-subtle">{text.idlePrompt()} </span>
        <UnknownCommand
          fallback={t("fallbackCommand")}
          template={`${unknown}  ${t("help")}`}
        />
      </p>
      <p className="flex flex-wrap gap-3">
        <Link
          href={localePath(locale, "/")}
          className="inline-flex h-11 items-center rounded-md border border-border px-5 font-medium"
        >
          {t("home")}
        </Link>
        <a
          href={localePath(locale, EDITOR_PATH)}
          className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-medium text-accent-ink"
        >
          {t("cta")}
        </a>
      </p>
    </>
  )
}
