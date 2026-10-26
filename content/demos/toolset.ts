import { demo } from "@/cad"

/** The toolset index: one small drawing per group, each made by its commands. */

const figure = { width: 240, height: 150 } as const

/** Draw: a slot — PLINE switching to arcs and closing on one — with a hole. */
export const drawGroup = demo({
  ...figure,
  view: { min: { x: -24, y: -10 }, max: { x: 84, y: 40 } },
})
  .command("_PLINE")
  .type("0,0")
  .enter()
  .type("@60,0")
  .enter()
  .option("Arc")
  .type("@0,30")
  .enter()
  .option("Line")
  .type("@-60,0")
  .enter()
  .option("Arc")
  .type("@0,-30")
  .enter()
  .enter()
  .command("_CIRCLE")
  .type("0,15")
  .enter()
  .type("6")
  .enter()
  .command("_CIRCLE")
  .type("60,15")
  .enter()
  .type("6")
  .enter()

/** Modify: concentric offsets of one outline, one OFFSET pick at a time. */
export const modifyGroup = demo({
  ...figure,
  view: { min: { x: -30, y: -21 }, max: { x: 90, y: 51 } },
})
  .command("_PLINE")
  .type("0,0")
  .enter()
  .type("@60,0")
  .enter()
  .option("Arc")
  .type("@0,30")
  .enter()
  .option("Line")
  .type("@-60,0")
  .enter()
  .option("Arc")
  .type("@0,-30")
  .enter()
  .enter()
  .command("_OFFSET")
  .type("5")
  .enter()
  .click(30, 0)
  .click(30, -20)
  .click(30, -5)
  .click(30, -20)
  .click(30, -10)
  .click(30, -20)
  .escape()

/** Annotate: a linear dimension continued along a stepped edge. */
export const annotateGroup = demo({
  ...figure,
  dimScale: 2,
  view: { min: { x: -6, y: -6 }, max: { x: 106, y: 66 } },
})
  .command("_PLINE")
  .type("0,0")
  .enter()
  .type("@100,0")
  .enter()
  .type("@0,20")
  .enter()
  .type("@-35,0")
  .enter()
  .type("@0,15")
  .enter()
  .type("@-40,0")
  .enter()
  .type("@0,10")
  .enter()
  .type("@-25,0")
  .enter()
  .option("Close")
  .command("_DIMLINEAR")
  .click(0, 45)
  .click(25, 45)
  .click(12, 55)
  .command("_DIMCONTINUE")
  .click(65, 35)
  .click(100, 20)
  .escape()

/** Organize: layers carrying their own linetypes — Center and Hidden. */
export const organizeGroup = demo({
  ...figure,
  layers: [
    { name: "CENTER", color: "#94a3b8", linetype: "Center" },
    { name: "HIDDEN", color: "#94a3b8", linetype: "Hidden" },
  ],
  view: { min: { x: -8, y: -12 }, max: { x: 98, y: 52 } },
})
  .command("_RECTANG")
  .type("0,0")
  .enter()
  .type("@90,40")
  .enter()
  .layer("HIDDEN")
  .command("_RECTANG")
  .type("35,0")
  .enter()
  .type("@20,40")
  .enter()
  .layer("CENTER")
  .command("_LINE")
  .type("45,-8")
  .enter()
  .type("@0,56")
  .enter()
  .escape()

/** Inquiry & view: DIST, measuring corner to corner. */
export const inquiryGroup = demo({
  ...figure,
  snap: true,
  view: { min: { x: -48, y: -8 }, max: { x: 118, y: 52 } },
})
  .command("_RECTANG")
  .type("0,0")
  .enter()
  .type("@70,40")
  .enter()
  .command("_DIST")
  .click(0, 0)
  .moveTo(70, 40)

/** Files & clipboard: a copy, taken with a base point, pasted beside its original. */
export const filesGroup = demo({
  ...figure,
  view: { min: { x: -22, y: -24 }, max: { x: 80, y: 24 } },
})
  .command("_CIRCLE")
  .type("0,0")
  .enter()
  .type("16")
  .enter()
  .command("_HATCH")
  .option("Properties")
  .type("ANSI31")
  .enter()
  .type("0.5")
  .enter()
  .enter()
  .click(0, 0)
  .enter()
  .command("_COPYBASE")
  .type("0,0")
  .enter()
  .click(16, 0)
  .click(-8, 0)
  .enter()
  .command("_PASTECLIP")
  .moveTo(52, 0)
