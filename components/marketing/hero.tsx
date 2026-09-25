import { getLocale, getTranslations } from "next-intl/server"

import { EDITOR_PATH, SITE_URL } from "@/lib/site"

import { ContinueDrawing } from "./continue-drawing"
import { HeroSheet } from "./hero-sheet"
import { SendToDesktop } from "./send-to-desktop"

export async function Hero() {
  const t = await getTranslations("Hero")
  const common = await getTranslations("Common")
  const share = await getTranslations("SendToDesktop")
  // One sentence per line — "Type L." / "Press Enter." / "Draw." — cut where
  // the language says a sentence ends, not at a hard-coded full stop. Each
  // keeps its trailing space, so the heading still reads as one phrase.
  const sentences = [
    ...new Intl.Segmenter(await getLocale(), {
      granularity: "sentence",
    }).segment(t("title")),
  ].map(({ segment }) => segment)

  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto grid w-full max-w-[1200px] items-center gap-12 px-4 pt-10 pb-20 sm:px-6 md:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20 lg:pb-32"
    >
      <div className="flex min-w-0 flex-col gap-7 lg:col-span-5">
        <h1 id="hero-title" className="flex flex-col gap-5">
          <span className="label-mono">{t("eyebrow")}</span>
          <span className="sr-only">: </span>
          <span className="text-display">
            {sentences.map((sentence) => (
              <span key={sentence} className="block">
                {sentence}
              </span>
            ))}
          </span>
        </h1>
        <p className="measure text-lead">{t("lead")}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <ContinueDrawing
            href={EDITOR_PATH}
            start={common("startDrawing")}
            continueOne={t.raw("continueOne") as string}
            continueOther={t.raw("continueOther") as string}
          />
          <a href="#commands" className="font-medium underline-link">
            {t("secondaryCta")}
          </a>
        </div>
        <p className="data-mono text-xs text-fg-subtle">{t("proof")}</p>
        <div className="flex flex-col items-start gap-3 md:hidden">
          <p className="text-sm text-fg-muted">{t("mobileNote")}</p>
          <SendToDesktop
            url={`${SITE_URL}${EDITOR_PATH}`}
            label={share("action")}
            copiedLabel={share("copied")}
            shareTitle={share("shareTitle")}
            shareText={share("shareText")}
          />
        </div>
      </div>
      <div className="min-w-0 lg:col-span-7">
        <HeroSheet />
      </div>
    </section>
  )
}
