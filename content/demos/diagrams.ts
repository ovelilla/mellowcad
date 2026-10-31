import { demo, type DemoScript } from "@mellowcad/engine"
import { drawingTextWidth } from "@/lib/plot"

/**
 * The two explanatory figures, drawn as plans: boxes, single-line TEXT, and
 * dimension lines with their text overridden as the connectors. Their words
 * are the page's, so each language draws its own.
 */

const LABEL_HEIGHT = "4"

function label(
  script: DemoScript,
  at: string,
  text: string,
  height = LABEL_HEIGHT
) {
  return script
    .command("_TEXT")
    .type(at)
    .enter()
    .type(height)
    .enter()
    .type("0")
    .enter()
    .type(text)
    .enter()
    .enter()
}

/** A label centred on a point (TEXT justified MC), however long it runs. */
function centredLabel(script: DemoScript, at: string, text: string) {
  return script
    .command("_TEXT")
    .option("Justify")
    .option("MC")
    .type(at)
    .enter()
    .type(LABEL_HEIGHT)
    .enter()
    .type("0")
    .enter()
    .type(text)
    .enter()
    .enter()
}

function box(script: DemoScript, corner: string, size: string) {
  return script.command("_RECTANG").type(corner).enter().type(size).enter()
}

export interface LocalFirstLabels {
  readonly editor: string
  readonly browser: string
  readonly file: string
  readonly device: string
  readonly autosave: string
}

/** The links' text: ISO-25's DIMTXT at the figures' DIMSCALE. */
const LINK_TEXT_HEIGHT = 2.5 * 1.6

/**
 * Where drawings live: the editor, the browser's own storage and your files,
 * all inside the device. The links are dimensions — arrowheads at both ends,
 * since both go both ways.
 */
const localFirstStart = (width: number) =>
  demo({
    width: 560,
    height: 260,
    dimScale: 1.6,
    layers: [{ name: "BOUNDARY", color: "#94a3b8", linetype: "Dashed" }],
    view: { min: { x: -6, y: -6 }, max: { x: width + 6, y: 76 } },
  })
    .layer("BOUNDARY")
    .command("_RECTANG")
    .type("0,0")
    .enter()
    .type(`@${width},70`)
    .enter()
    .layer("0")

export function localFirst(labels: LocalFirstLabels): DemoScript {
  // WHY: the links' words are the page's. Where one runs longer than the
  // space between the boxes (pt-BR's «salvamento automático»), the boxes on
  // the right move away, rather than the words running over them.
  const span = Math.max(
    66,
    Math.ceil(drawingTextWidth(labels.autosave, LINK_TEXT_HEIGHT)) + 8
  )
  const right = 52 + span
  return [
    (s: DemoScript) => box(s, "12,8", "@40,50"),
    (s: DemoScript) => box(s, `${right},36`, "@40,22"),
    (s: DemoScript) => box(s, `${right},8`, "@40,22"),
    // Before the centred ones: TEXT keeps the last justification, as
    // AutoCAD's TEXTJUSTIFY does.
    (s: DemoScript) => label(s, "4,64", labels.device, "3"),
    (s: DemoScript) => centredLabel(s, "32,33", labels.editor),
    (s: DemoScript) => centredLabel(s, `${right + 20},47`, labels.browser),
    (s: DemoScript) => centredLabel(s, `${right + 20},19`, labels.file),
  ]
    .reduce((script, step) => step(script), localFirstStart(right + 52))
    .command("_DIMLINEAR")
    .click(52, 47)
    .click(right, 47)
    .option("Text")
    .type(labels.autosave)
    .enter()
    .click(52 + span / 2, 47)
    .command("_DIMLINEAR")
    .click(52, 19)
    .click(right, 19)
    .option("Text")
    .type("Ctrl+S / Ctrl+O")
    .enter()
    .click(52 + span / 2, 19)
}

const LAYERS = ["adapters", "application", "scene", "domain", "geometry"]

/**
 * The engine's layers as a stack — named as their folders are — with a
 * dimension along it for the one rule that holds it together.
 */
export function engineLayers(imports: string): DemoScript {
  return LAYERS.reduce(
    (script, name, index) => {
      const y = (LAYERS.length - 1 - index) * 16
      return label(box(script, `0,${y}`, "@90,11"), `6,${y + 3.5}`, name)
    },
    demo({
      width: 420,
      height: 300,
      dimScale: 1.6,
      view: { min: { x: -26, y: -6 }, max: { x: 96, y: 81 } },
    })
  )
    .command("_DIMLINEAR")
    .click(0, 75)
    .click(0, 0)
    .option("Text")
    .type(imports)
    .enter()
    .click(-12, 37)
}
