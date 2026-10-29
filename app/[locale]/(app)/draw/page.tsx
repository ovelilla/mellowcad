import { getLocale } from "next-intl/server"

import { CadEditor } from "@mellowcad/editor"
import { LogoMark } from "@/components/marketing/logo"
import { loadEditorLocale } from "@/i18n/editor"
import { loadEngineLocale } from "@/i18n/engine"
import { languageLinks } from "@/i18n/navigation"
import { DIRECTION } from "@/i18n/routing"
import { EDITOR_LAYOUT_STORAGE, EDITOR_PATH } from "@/lib/site"
import { EDITOR_SHEET_ID, SHEET_TRANSITION } from "@/lib/view-transition"

// The engine's catalog and the editor's travel in the page, so both start in
// the page's language without waiting for another request. The site's own parts
// of the editor — its direction, its mark, its languages, its storage keys and
// the sheet the landing grows into, which the layout's head reads too — are
// filled in here.
export default async function Page() {
  const locale = await getLocale()
  return (
    <CadEditor
      engineLocale={await loadEngineLocale(locale)}
      editorLocale={await loadEditorLocale(locale)}
      dir={DIRECTION[locale]}
      mark={<LogoMark mono className="size-5" />}
      languages={languageLinks(locale, EDITOR_PATH)}
      layoutStorage={EDITOR_LAYOUT_STORAGE}
      sheet={{ id: EDITOR_SHEET_ID, name: SHEET_TRANSITION }}
    />
  )
}
