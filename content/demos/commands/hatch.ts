import { demo, type DemoScript } from "@mellowcad/engine"

import { COMMAND_FIGURE, type CommandSessions } from "./session"

/**
 * The gallery's patterns, acadiso.pat's most used, each with its scale: 1,
 * but the AR- ones, which that file draws about 25 times larger: at 1 a
 * square 30 across would catch none of their stones or grains.
 */
const GALLERY = [
  ["SOLID", ""],
  ["ANSI31", "1"],
  ["ANSI32", "1"],
  ["ANSI37", "1"],
  ["ANGLE", "1"],
  ["BRICK", "1"],
  ["AR-CONC", "0.08"],
  ["AR-SAND", "0.1"],
  ["EARTH", "1"],
  ["HONEY", "1"],
  ["NET", "1"],
  ["DOTS", "1"],
] as const

const COLUMNS = 6
const SIDE = 30
const STEP = 40
const ROW = 46

/** A square at a column and row, hatched with its pattern from a point inside. */
function swatch(
  script: DemoScript,
  name: string,
  scale: string,
  index: number
): DemoScript {
  const x = (index % COLUMNS) * STEP
  const y = -Math.floor(index / COLUMNS) * ROW
  const square = script
    .command("_RECTANG")
    .type(`${x},${y}`)
    .enter()
    .type(`${SIDE},${SIDE}`)
    .enter()
  const chosen = square
    .command("_HATCH")
    .option("Properties")
    .type(name)
    .enter()
  // SOLID asks neither scale nor angle.
  const placed = scale ? chosen.type(scale).enter().type("0").enter() : chosen
  return placed.click(x + 2, y + 2).enter()
}

/**
 * The pattern names under the squares, centred (TEXT justified MC, which the
 * next TEXT keeps): a name is the same in every language.
 */
function label(
  script: DemoScript,
  name: string,
  index: number,
  first: boolean
): DemoScript {
  const x = (index % COLUMNS) * STEP + SIDE / 2
  const y = -Math.floor(index / COLUMNS) * ROW - 6
  const text = script.command("_TEXT")
  const justified = first ? text.option("Justify").option("MC") : text
  return justified
    .type(`${x},${y}`)
    .enter()
    .type("3.5")
    .enter()
    .type("0")
    .enter()
    .type(name)
    .enter()
    .enter()
}

function gallery(): DemoScript {
  let script = demo({ width: 640, height: 260 })
  GALLERY.forEach(([name, scale], index) => {
    script = swatch(script, name, scale, index)
  })
  GALLERY.forEach(([name], index) => {
    script = label(script, name, index, index === 0)
  })
  return script
}

/**
 * HATCH: ANSI31 chosen under Properties, one internal point, the circle an
 * island; and a gallery of the patterns `?` lists, one square each.
 */
export const sessions = {
  hatch: {
    figure: {
      ...COMMAND_FIGURE,
      script: demo({ width: 320, height: 200 })
        .command("_RECTANG")
        .type("0,0")
        .enter()
        .type("80,50")
        .enter()
        .command("_CIRCLE")
        .type("40,25")
        .enter()
        .type("14")
        .enter()
        .command("_HATCH")
        .option("Properties")
        .type("ANSI31")
        .enter()
        .type("1")
        .enter()
        .enter()
        .click(8, 8)
        .enter(),
    },
    from: "HATCH",
  },
  hatchPatterns: {
    figure: { script: gallery(), width: 640, height: 260, padding: 20 },
  },
} satisfies CommandSessions
