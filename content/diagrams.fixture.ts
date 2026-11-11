import type { AppLocale } from "@/i18n/routing"
import ar from "@/messages/ar.json"
import en from "@/messages/en.json"
import es from "@/messages/es.json"
import fr from "@/messages/fr.json"
import it from "@/messages/it.json"
import ptBR from "@/messages/pt-BR.json"

import { DIAGRAMS, type FigureSpec } from "./figures"

type Words = Readonly<Record<string, string>>
type Catalog = { readonly LocalFirst?: Words }

const CATALOGS: Readonly<Record<AppLocale, Catalog>> = {
  en,
  es,
  ar,
  "pt-BR": ptBR,
  fr,
  it,
}

/** The diagrams as a language's messages word them, keyed `name.locale`. */
export function diagramsIn(locale: AppLocale): Record<string, FigureSpec> {
  const catalog = CATALOGS[locale]
  const local: Words = { ...en.LocalFirst, ...catalog.LocalFirst }
  return {
    [`localFirst.${locale}`]: DIAGRAMS.localFirst({
      editor: local.diagramEditor,
      browser: local.diagramBrowser,
      file: local.diagramFile,
      device: local.diagramDevice,
      autosave: local.diagramAutosave,
    }),
  }
}

/** The English diagrams under their plain names, as the transcripts list them. */
export function englishDiagrams(): Record<string, FigureSpec> {
  const figures = diagramsIn("en")
  return {
    localFirst: figures["localFirst.en"],
  }
}
