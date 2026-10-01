import ar from "@/messages/ar.json"
import en from "@/messages/en.json"
import es from "@/messages/es.json"

import { DIAGRAMS, type FigureSpec } from "./figures"

type Words = Readonly<Record<string, string>>
type Catalog = { readonly LocalFirst?: Words; readonly Engine?: Words }

const CATALOGS: Readonly<Record<string, Catalog>> = { en, es, ar }

/** The diagrams as a language's messages word them, keyed `name.locale`. */
export function diagramsIn(locale: string): Record<string, FigureSpec> {
  const catalog = CATALOGS[locale]
  const local: Words = { ...en.LocalFirst, ...catalog.LocalFirst }
  const engine: Words = { ...en.Engine, ...catalog.Engine }
  return {
    [`localFirst.${locale}`]: DIAGRAMS.localFirst({
      editor: local.diagramEditor,
      browser: local.diagramBrowser,
      file: local.diagramFile,
      device: local.diagramDevice,
      autosave: local.diagramAutosave,
    }),
    [`engineLayers.${locale}`]: DIAGRAMS.engineLayers(engine.diagramImports),
  }
}

/** The English diagrams under their plain names, as the transcripts list them. */
export function englishDiagrams(): Record<string, FigureSpec> {
  const figures = diagramsIn("en")
  return {
    localFirst: figures["localFirst.en"],
    engineLayers: figures["engineLayers.en"],
  }
}
