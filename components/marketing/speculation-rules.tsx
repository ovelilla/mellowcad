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
  return (
    <script
      type="speculationrules"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(RULES) }}
    />
  )
}
