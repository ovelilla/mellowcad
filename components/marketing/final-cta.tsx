import { getTranslations } from "next-intl/server"

import { engineText } from "@/cad"
import { sitePaths } from "@/i18n/site-paths"
import { pageEngineLocale } from "@/lib/plot"
import { ForwardArrow } from "./forward-arrow"

export async function FinalCta() {
  const t = await getTranslations("FinalCta")
  const common = await getTranslations("Common")
  const paths = await sitePaths()
  const text = engineText(await pageEngineLocale())

  return (
    <section
      aria-labelledby="final-cta-title"
      className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-8 px-4 py-24 text-center sm:px-6 lg:py-40"
    >
      <h2 id="final-cta-title" className="max-w-2xl text-h2">
        {t("title")}
      </h2>
      <p
        aria-hidden="true"
        dir="ltr"
        lang={text.commandTag}
        className="font-mono text-sm text-fg-subtle"
      >
        {text.idlePrompt()} <span className="caret caret-blink" />
      </p>
      <a
        href={paths.editor}
        className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
      >
        {common("startDrawing")}
        <span aria-hidden="true">
          &nbsp;
          <ForwardArrow />
        </span>
      </a>
    </section>
  )
}
