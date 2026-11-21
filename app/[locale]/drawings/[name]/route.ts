import { createMemoryDrawingStore, recordDemo } from "@mellowcad/engine"
import { getTranslations } from "next-intl/server"

import { EXERCISES, isExerciseSlug } from "@/content/demos/exercises"
import { startingDrawing } from "@/content/demos/exercises/exercise"
import { loadEngineLocale } from "@/i18n/engine"
import { localeParams, segmentLocale } from "@/i18n/routing"

// Made once per language and exercise when the site is built.
export const dynamic = "force-static"
export const dynamicParams = false

// WHY `.json` in the param: exported, the route is a file, and a static host
// takes its type from the extension (`.claude/rules/marketing.md`).
export function generateStaticParams() {
  return localeParams().flatMap(({ locale }) =>
    Object.keys(EXERCISES).map((name) => ({ locale, name: `${name}.json` }))
  )
}

/**
 * The drawing an exercise opens with in the editor (`/draw?drawing=gasket`):
 * the file a user would open, made by the engine from the exercise's own
 * steps, its layers named in the page's language. Not a page: the editor
 * fetches it, and no search engine should list it (`fileHeaders`, as a
 * static file keeps no header of its own).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; name: string }> }
) {
  const { name: file, ...segment } = await params
  const name = file.replace(/\.json$/, "")
  const locale = segmentLocale(segment.locale)
  if (!locale || !isExerciseSlug(name))
    return new Response(null, { status: 404 })
  const layers = await getTranslations({
    locale,
    namespace: "Docs.exercise.layers",
  })
  const store = createMemoryDrawingStore()
  await recordDemo(
    startingDrawing(EXERCISES[name].exercise, {
      outline: layers("outline"),
      centre: layers("centre"),
      hidden: layers("hidden"),
      dimensions: layers("dimensions"),
    }),
    { locale: await loadEngineLocale(locale), store }
  )
  return new Response(store.read(), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
