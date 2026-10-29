import { writeFileSync } from "node:fs"

import { CadDriver, SvgScenePresenter } from "@mellowcad/engine"

// The engine with no browser: typed commands and clicks in world
// coordinates, as a user would draw them. SAVE hands the drawing file to the
// host's transport, which here writes it to disk.
const cad = new CadDriver({
  files: {
    save: (text, fileName) => writeFileSync(fileName, text),
    open: async () => null,
  },
})

cad.command("RECTANG").click({ x: 0, y: 0 }).click({ x: 200, y: 100 })
cad.command("CIRCLE").click({ x: 100, y: 50 }).type("30").enter()
cad.command("SAVE")

// What the canvas would show, as an SVG document.
writeFileSync("drawing.svg", new SvgScenePresenter().render(cad.scene()))

console.log(cad.commandLog().join("\n"))
cad.dispose()
