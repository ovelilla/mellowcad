import type { Metadata } from "next"
import { getLocale, getTranslations } from "next-intl/server"

import { NotFoundMessage } from "@/components/marketing/not-found-message"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound")
  return { title: t("metaTitle") }
}

/**
 * A language's 404, inside its layout, with the site's header and footer.
 *
 * Next 16.3 prerenders a page's `notFound()` as an empty document with the
 * 404 status and the metadata, and renders this in the browser; the global
 * 404 is the one that arrives already drawn.
 */
export default async function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-24 lg:py-40">
      <NotFoundMessage locale={await getLocale()} />
    </div>
  )
}
