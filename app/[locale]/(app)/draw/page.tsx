import { getLocale } from "next-intl/server"

import { CadWorkspace } from "@/components/cad/cad-workspace"
import { LogoMark } from "@/components/marketing/logo"
import { loadEngineLocale } from "@/i18n/engine"
import { languageLinks } from "@/i18n/navigation"
import { EDITOR_LAYOUT_STORAGE, EDITOR_PATH } from "@/lib/site"

// The engine's catalog travels in the page, so the engine starts in the
// page's language without waiting for another request. The site's own parts
// of the editor — its mark, its languages, its storage keys, which the
// layout's head script reads too — are filled in here.
export default async function Page() {
  const locale = await getLocale()
  return (
    <CadWorkspace
      engineLocale={await loadEngineLocale(locale)}
      mark={<LogoMark mono className="size-5" />}
      languages={languageLinks(locale, EDITOR_PATH)}
      layoutStorage={EDITOR_LAYOUT_STORAGE}
    />
  )
}
