import { demo, type DemoScript } from "@/cad"

/**
 * The two explanatory figures, drawn as plans: boxes, single-line TEXT, and
 * dimension lines with their text overridden as the connectors.
 */

const LABEL_HEIGHT = "4"

function label(
  script: DemoScript,
  at: string,
  text: string,
  height = LABEL_HEIGHT
) {
  return script
    .command("TEXT")
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

function box(script: DemoScript, corner: string, size: string) {
  return script.command("RECTANG").type(corner).enter().type(size).enter()
}

/**
 * Where drawings live: the editor, the browser's own storage and your files,
 * all inside the device. The links are dimensions — arrowheads at both ends,
 * since both go both ways.
 */
const localFirstStart = demo({
  width: 560,
  height: 260,
  dimScale: 1.6,
  layers: [{ name: "BOUNDARY", color: "#94a3b8", linetype: "Dashed" }],
  view: { min: { x: -6, y: -6 }, max: { x: 176, y: 76 } },
})
  .layer("BOUNDARY")
  .command("RECTANG")
  .type("0,0")
  .enter()
  .type("@170,70")
  .enter()
  .layer("0")

export const localFirst = [
  (s: DemoScript) => box(s, "12,8", "@40,50"),
  (s: DemoScript) => box(s, "118,36", "@40,22"),
  (s: DemoScript) => box(s, "118,8", "@40,22"),
  (s: DemoScript) => label(s, "21,31", "EDITOR"),
  (s: DemoScript) => label(s, "122,45", "BROWSER"),
  (s: DemoScript) => label(s, "131,17", "FILE"),
  (s: DemoScript) => label(s, "4,64", "YOUR DEVICE", "3"),
]
  .reduce((script, step) => step(script), localFirstStart)
  .command("DIMLINEAR")
  .click(52, 47)
  .click(118, 47)
  .option("Text")
  .type("autosave")
  .enter()
  .click(85, 47)
  .command("DIMLINEAR")
  .click(52, 19)
  .click(118, 19)
  .option("Text")
  .type("Ctrl+S / Ctrl+O")
  .enter()
  .click(85, 19)

const LAYERS = ["adapters", "application", "scene", "domain", "geometry"]

/**
 * The engine's layers as a stack, with a dimension along it for the one rule
 * that holds it together.
 */
export const engineLayers = LAYERS.reduce(
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
  .command("DIMLINEAR")
  .click(0, 75)
  .click(0, 0)
  .option("Text")
  .type("imports point down")
  .enter()
  .click(-12, 37)
