import type { DemoScript } from "@mellowcad/engine"

import { sessions as extrude } from "./commands/extrude"

/**
 * One solid in each visual style the engine has, as VSCURRENT shows it:
 * EXTRUDE's L-shaped solid, then the style set last, so the editor's last
 * frame is the solid in that style. WHY this solid: a hole's wall is a few
 * hundred cells in Conceptual, each written twice in the page (its HTML and
 * its payload); planar faces cost a handful.
 */
function styled(style: "2dwireframe" | "Hidden" | "Conceptual"): DemoScript {
  return extrude.extrude.figure.script
    .command("_VSCURRENT")
    .option(style)
    .moveTo(-500, -500)
}

export const wireframeSolid = styled("2dwireframe")
export const hiddenSolid = styled("Hidden")
export const conceptualSolid = styled("Conceptual")
