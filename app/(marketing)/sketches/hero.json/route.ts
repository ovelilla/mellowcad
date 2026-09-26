import {
  DEFAULT_LAYER_ID,
  documentSnapshot,
  recordDemo,
  toDrawingFile,
} from "@/cad"
import { HERO_FIGURE } from "@/content/figures"

// Replayed once, when the site is built, like every figure on the landing.
export const dynamic = "force-static"

/**
 * The hero's flange as a drawing file, for the live sketch to open: the very
 * replay the figure is plotted from, so the drawing that comes alive is the
 * one that was just drawn. It is handed over with layer 0 current, the way a
 * drawing starts, rather than on the dimension layer the script ended on.
 */
export async function GET() {
  const { document } = await recordDemo(HERO_FIGURE.script)
  const file = toDrawingFile({
    ...documentSnapshot(document),
    currentLayerId: DEFAULT_LAYER_ID,
  })
  return Response.json(file, {
    // Data for the sketch, not a page to be found.
    headers: { "X-Robots-Tag": "noindex" },
  })
}
