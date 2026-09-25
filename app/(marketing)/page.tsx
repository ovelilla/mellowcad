import { getTranslations } from "next-intl/server"

import { EDITOR_PATH } from "@/lib/site"

export default async function HomePage() {
  const t = await getTranslations("Placeholder")
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="flex flex-col gap-4">
        <span className="font-mono text-xs font-medium tracking-[0.14em] text-fg-subtle uppercase">
          {t("eyebrow")}
        </span>
        <span className="sr-only">: </span>
        <span className="text-5xl font-semibold tracking-tight text-balance">
          {t("title")}
        </span>
      </h1>
      <p className="max-w-[64ch] text-lg text-pretty text-fg-muted">
        {t("lead")}
      </p>
      <p>
        <a
          href={EDITOR_PATH}
          className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-medium text-accent-ink"
        >
          {t("cta")}
        </a>
      </p>
    </main>
  )
}
