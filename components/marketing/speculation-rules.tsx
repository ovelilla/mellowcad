import { EDITOR_PATH } from "@/lib/site"

/**
 * The editor's page is fetched as soon as a link to it is hovered or pressed,
 * so the click finds it already here and the view transition into it has
 * something to show at once. Prefetch only: prerendering would run the editor
 * — and count a visit — for every hover.
 */
const RULES = {
  prefetch: [{ where: { href_matches: EDITOR_PATH }, eagerness: "moderate" }],
}

export function SpeculationRules() {
  // Production only, as Next does with its own prefetching. Back out of the
  // bfcache, Chrome serves the next visit to the editor from the prefetch made
  // before the first one: harmless for a prerendered page, but a development
  // server's HTML belongs to the request it answered, and the editor served
  // twice never hydrated — a blank sheet.
  if (process.env.NODE_ENV !== "production") return null
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(RULES) }}
    />
  )
}
