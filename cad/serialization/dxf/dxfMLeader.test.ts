import { describe, expect, it } from "vitest"
import type { MLeaderEntity } from "../../domain/entities"
import {
  createBlockDefinition,
  createCircle,
  createMLeader,
} from "../../domain/entities"
import "../../../test/matchers"
import {
  DRAWING_FILE_VERSION,
  parseDrawingFile,
  serializeDrawing,
} from "../drawingFile"
import { DRAWING_FILE_TYPE } from "../drawingSummary"
import { mleaderColor } from "./dxfMLeader"
import { parseDxf } from "./readDxf"
import { writeDxf } from "./writeDxf"

// MULTILEADER as files other than AutoCAD 2027's own write it, and as they
// break: the groups of mleader/m02 and m03, written by hand.

type Group = readonly [number, string | number]

function file(
  entities: Group[][],
  objects: Group[][] = [],
  tables: Group[] = []
): string {
  const groups: Group[] = [
    ...(tables.length > 0
      ? ([[0, "SECTION"], [2, "TABLES"], ...tables, [0, "ENDSEC"]] as Group[])
      : []),
    [0, "SECTION"],
    [2, "ENTITIES"],
    ...entities.flat(),
    [0, "ENDSEC"],
    [0, "SECTION"],
    [2, "OBJECTS"],
    ...objects.flat(),
    [0, "ENDSEC"],
    [0, "EOF"],
  ]
  return groups.map(([c, v]) => `${c}\n${v}`).join("\n")
}

const point = (code: number, x: number, y: number, z = 0): Group[] => [
  [code, x],
  [code + 10, y],
  [code + 20, z],
]

/** A multileader of one branch, its context's groups before the branch given. */
function mleader(
  context: Group[] = [],
  own: Group[] = [],
  branch: Group[] = []
): Group[] {
  return [
    [0, "MULTILEADER"],
    [5, "100"],
    [8, "0"],
    [100, "AcDbMLeader"],
    [300, "CONTEXT_DATA{"],
    [40, 1],
    ...point(10, 38, 29),
    [41, 2.5],
    [140, 4],
    [145, 2],
    ...context,
    [302, "LEADER{"],
    ...(branch.length > 0
      ? branch
      : [...point(10, 30, 29), ...point(11, 1, 0), [40, 8] as Group]),
    [304, "LEADER_LINE{"],
    ...point(10, 10, 10),
    [91, 0],
    [305, "}"],
    [303, "}"],
    [301, "}"],
    ...own,
  ]
}

const text: Group[] = [
  [290, 1],
  [304, "A}B{"],
  [340, "11"],
  ...point(12, 40, 30),
  ...point(13, 0, 1),
  [43, 30],
  [171, 3],
  [170, 2],
  [45, 1.5],
]

const mleadersOf = (dxf: string): MLeaderEntity[] =>
  parseDxf(dxf).drawing.entities.filter(
    (e): e is MLeaderEntity => e.type === "mleader"
  )

describe("parseDxf: a multileader as others write it", () => {
  it("opens one with a text, its braces and words read apart", () => {
    const [m] = mleadersOf(
      file([
        mleader(text, [
          [170, 2],
          [291, 0],
        ]),
      ])
    )
    expect(m.path).toBe("spline")
    expect(m.dogleg).toBe(false)
    expect(m.content).toMatchObject({
      kind: "mtext",
      contents: "A}B{",
      width: 30,
      attachment: "tr",
      lineSpacingStyle: "exactly",
      lineSpacingFactor: 1.5,
    })
    expect(m.content?.kind === "mtext" && m.content.rotation).toBeCloseTo(
      Math.PI / 2
    )
    expect(m.branches[0]).toEqual({
      landing: { x: 30, y: 29 },
      direction: { x: 1, y: 0 },
      doglegLength: 8,
      lines: [[{ x: 10, y: 10 }]],
    })
    expect(m.style.name).toBe("Standard")
  })

  // v13: a text in dynamic columns is read 1 wide, as AutoCAD reads it.
  it("reads a text in dynamic columns as AutoCAD does, one wide", () => {
    const [m] = mleadersOf(file([mleader([...text, [173, 2]])]))
    expect(m.content).toMatchObject({ width: 1 })
  })

  it("leaves out one with no context, and a text with no height", () => {
    const bare: Group[] = [
      [0, "MULTILEADER"],
      [5, "100"],
      [100, "AcDbMLeader"],
      [340, "12"],
    ]
    const { drawing, report } = parseDxf(file([bare]))
    expect(drawing.entities).toHaveLength(0)
    expect(report.unreadable).toBe(1)
    const noHeight = mleader(text).map(([c, v]): Group =>
      c === 41 ? [41, 0] : [c, v]
    )
    expect(mleadersOf(file([noHeight]))[0].content).toBeUndefined()
  })

  it("drops a branch with no landing, and takes a direction of none as X", () => {
    const [m] = mleadersOf(
      file([mleader([], [], [[40, -1], ...point(11, 0, 0)])])
    )
    expect(m.branches).toHaveLength(0)
    const [n] = mleadersOf(
      file([mleader([], [], [...point(10, 1, 2), ...point(11, 0, 0)])])
    )
    expect(n.branches[0]).toMatchObject({
      direction: { x: 1, y: 0 },
      doglegLength: 0,
    })
  })

  it("leaves out a block it cannot find, and its own unknown path straight", () => {
    const block: Group[] = [[290, 0], [296, 1], [341, "FF"], ...point(15, 1, 1)]
    const [m] = mleadersOf(file([mleader(block, [[170, 7]])]))
    expect(m.content).toBeUndefined()
    expect(m.path).toBe("straight")
  })

  it("puts one in a tilted plane in its OCS", () => {
    const plane: Group[] = [...point(111, 1, 0, 0), ...point(112, 0, 0, 1)]
    const [m] = mleadersOf(
      file([
        mleader(plane, [], [...point(10, 30, 0, 5), ...point(11, 1, 0, 0)]),
      ])
    )
    expect(m.normal).toEqual({ x: 0, y: -1, z: 0 })
    expect(m.elevation ?? 0).toBeCloseTo(0)
    expect(m.branches[0].landing).toEqual({ x: 30, y: 5 })
  })

  it("names its style by ACAD_MLEADERSTYLE, else by its description", () => {
    const style = (handle: string, groups: Group[]): Group[] => [
      [0, "MLEADERSTYLE"],
      [5, handle],
      [100, "AcDbMLeaderStyle"],
      ...groups,
    ]
    const dictionary: Group[] = [
      [0, "DICTIONARY"],
      [5, "D0"],
      [100, "AcDbDictionary"],
      [3, "ACAD_MLEADERSTYLE"],
      [350, "D1"],
    ]
    const names: Group[] = [
      [0, "DICTIONARY"],
      [5, "D1"],
      [100, "AcDbDictionary"],
      [3, "Notes"],
      [350, "S1"],
    ]
    const dxf = file(
      [mleader([], [[340, "S1"]]), mleader([], [[340, "S2"]])],
      [
        dictionary,
        names,
        style("S1", [
          [170, 1],
          [173, 2],
          [290, 0],
          [42, 3],
          [291, 0],
          [43, 5],
          [44, 6],
          [45, 7],
          [142, 2],
          [296, 1],
        ]),
        style("S2", [
          [3, "Described"],
          [170, 0],
          [45, -1],
          [142, 0],
        ]),
      ]
    )
    const [a, b] = mleadersOf(dxf)
    expect(a.style).toMatchObject({
      name: "Notes",
      content: "block",
      path: "spline",
      landing: false,
      landingGap: 3,
      dogleg: false,
      doglegLength: 5,
      arrowSize: 6,
      textHeight: 7,
      scale: 2,
      annotative: true,
    })
    expect(b.style).toMatchObject({
      name: "Described",
      content: "none",
      textHeight: 4,
      scale: 1,
    })
  })

  it("reads a text that says a brace as a text", () => {
    for (const said of ["LEADER{", "LEADER_LINE{", "CONTEXT_DATA{", "}"]) {
      const groups = mleader(
        text.map(([c, v]): Group => (c === 304 ? [304, said] : [c, v])),
        [[291, 0]]
      )
      const [m] = mleadersOf(file([groups]))
      expect(m.content).toMatchObject({ kind: "mtext", contents: said })
      expect(m.branches).toHaveLength(1)
      expect(m.dogleg).toBe(false)
    }
  })

  // v18, v21: the method in the high byte.
  it("reads its parts' colours by their method", () => {
    expect(mleaderColor(undefined)).toBeUndefined()
    expect(mleaderColor(-1073741824)).toBeUndefined()
    expect(mleaderColor(-1056964608)).toBe("ByBlock")
    expect(mleaderColor(-1040122112)).toBe("#00ff00")
    expect(mleaderColor(-1023410175)).toBe("1")
    expect(mleaderColor(0)).toBeUndefined()
  })
})

describe("writeDxf: a multileader", () => {
  const base = createMLeader(
    [
      {
        landing: { x: 30, y: 29 },
        direction: { x: 1, y: 0 },
        doglegLength: 8,
        lines: [[{ x: 10, y: 10 }]],
      },
    ],
    { id: "m1", layerId: "0" }
  )

  it("reads back as it was written, in each version", () => {
    const red: MLeaderEntity = {
      ...base,
      lineColor: "#ff0000",
      content: {
        kind: "mtext",
        position: { x: 40, y: 30 },
        contents: "A\\PB",
        height: 2.5,
        width: 20,
        rotation: 0,
        attachment: "tr",
        lineSpacingStyle: "exactly",
        lineSpacingFactor: 1,
        styleId: "Standard",
      },
    }
    const drawing = parseDxf(file([])).drawing
    for (const version of ["2000", "2010", "2018"] as const) {
      const { bytes } = writeDxf(
        {
          ...drawing,
          entities: [red, { ...base, id: "m2", lineColor: "#123456" }],
        },
        { version, binary: false, precision: 16 }
      )
      const [a, b] = mleadersOf(new TextDecoder("latin1").decode(bytes))
      expect(a.content).toEqual(red.content)
      expect(a.lineColor).toBe("#ff0000")
      expect(b.lineColor).toBe("#123456")
      expect(a.branches).toEqual(red.branches)
      expect(a.style.name).toBe("Standard")
    }
  })

  it("writes two styles of one name as two", () => {
    const other = { ...base, id: "m2", style: { ...base.style, arrowSize: 9 } }
    const drawing = parseDxf(file([])).drawing
    const { bytes } = writeDxf(
      { ...drawing, entities: [base, other] },
      { version: "2018", binary: false, precision: 16 }
    )
    const [a, b] = mleadersOf(new TextDecoder("latin1").decode(bytes))
    expect(a.style.name).toBe("Standard")
    expect(b.style).toMatchObject({ name: "Standard2", arrowSize: 9 })
  })
})

describe("a multileader's odd corners", () => {
  it("reads what is missing as AutoCAD's defaults", () => {
    const odd: Group[] = [
      [0, "MULTILEADER"],
      [5, "100"],
      [100, "AcDbMLeader"],
      [300, "CONTEXT_DATA{"],
      [40, -1],
      [41, 2],
      [290, 1],
      [304, "T"],
      [12, 1],
      [22, 2],
      [42, 0.5],
      [43, -3],
      [171, 12],
      // A branch's line whose point lacks its Y.
      [302, "LEADER{"],
      [10, 30],
      [20, 29],
      [30, 7],
      [304, "LEADER_LINE{"],
      [10, 5],
      [305, "}"],
      [303, "}"],
      [301, "}"],
    ]
    const [m] = mleadersOf(file([odd]))
    expect(m.elevation).toBe(7)
    expect(m.kept).toMatchObject({ scale: 1, base: { x: 30, y: 29 } })
    expect(m.branches).toHaveLength(1)
    expect(m.branches[0].lines).toEqual([])
    expect(m.content).toMatchObject({
      rotation: 0.5,
      width: 0,
      attachment: "tl",
      lineSpacingFactor: 1,
    })
  })

  it("names a style it cannot name Standard, and drops one with no handle", () => {
    const dxf = file(
      [mleader([], [[340, "S1"]])],
      [
        [
          [0, "MLEADERSTYLE"],
          [5, "S1"],
          [100, "AcDbMLeaderStyle"],
          [173, 9],
        ],
        [
          [0, "MLEADERSTYLE"],
          [100, "AcDbMLeaderStyle"],
        ],
      ]
    )
    expect(mleadersOf(dxf)[0].style).toMatchObject({
      name: "Standard",
      path: "straight",
    })
  })

  it("writes and reads back a block, a tilted plane and its landing off", () => {
    const block = createBlockDefinition("B1", { x: 0, y: 0 }, [
      createCircle({ x: 0, y: 0 }, 3),
    ])
    const made = createMLeader(
      [
        {
          landing: { x: 30, y: 29 },
          direction: { x: 1, y: 0 },
          doglegLength: 8,
          lines: [[{ x: 10, y: 10 }]],
        },
      ],
      {
        id: "m1",
        layerId: "0",
        content: {
          kind: "block",
          blockId: "B1",
          position: { x: 41, y: 29 },
          scaleX: -2,
          scaleY: 2,
          rotation: 1,
        },
      }
    )
    const m: MLeaderEntity = {
      ...made,
      normal: { x: 0, y: -1, z: 0 },
      elevation: 4,
      kept: { ...made.kept, landing: false },
    }
    const drawing = parseDxf(file([])).drawing
    const { bytes } = writeDxf(
      { ...drawing, blocks: [block], entities: [m] },
      { version: "2018", binary: false, precision: 16 }
    )
    const [back] = mleadersOf(new TextDecoder("latin1").decode(bytes))
    expect(back.content).toMatchObject({ kind: "block", blockId: "B1" })
    expect(back.content?.position).toBeCloseToPoint({ x: 41, y: 29 }, 9)
    expect(back.normal).toEqual({ x: 0, y: -1, z: 0 })
    expect(back.elevation).toBeCloseTo(4)
    expect(back.branches[0].landing).toBeCloseToPoint({ x: 30, y: 29 }, 9)
    expect(back.kept.landing).toBe(false)
  })
})

describe("the drawing file: a multileader", () => {
  const read = (raw: unknown) =>
    parseDrawingFile(
      JSON.stringify({
        type: DRAWING_FILE_TYPE,
        version: DRAWING_FILE_VERSION,
        layers: [],
        entities: [raw],
      })
    ).entities[0] as MLeaderEntity | undefined

  it("reads what it can of one, the style's for the rest", () => {
    const m = read({
      id: "m1",
      type: "mleader",
      layerId: "0",
      branches: [
        {
          landing: { x: 1, y: 2 },
          direction: { x: 2, y: 0 },
          lines: [[{ x: 0, y: 0 }, "x"], "y"],
        },
        "bad",
        { landing: { x: 1, y: 2 }, direction: { x: 0, y: 0 } },
      ],
      path: "spline",
      dogleg: false,
      arrowSize: -1,
      content: {
        kind: "block",
        blockId: "B",
        position: { x: 0, y: 0 },
        scaleX: 0,
      },
      lineColor: "red",
      style: { name: "S", content: "block", textHeight: 0 },
      kept: { overrideFlags: 1.5, scale: -1 },
    })
    expect(m?.branches).toEqual([
      {
        landing: { x: 1, y: 2 },
        direction: { x: 1, y: 0 },
        doglegLength: 0,
        lines: [[{ x: 0, y: 0 }]],
      },
    ])
    expect(m?.arrowSize).toBe(4)
    expect(m?.content).toMatchObject({ kind: "block", scaleX: 1, scaleY: 1 })
    expect(m?.lineColor).toBeUndefined()
    expect(m?.style).toMatchObject({
      name: "S",
      content: "block",
      textHeight: 4,
    })
    expect(m?.kept).toMatchObject({ overrideFlags: 0, scale: 1, landing: true })
  })

  it("leaves out one with no branches, path or style, and a content it cannot read", () => {
    const whole = {
      id: "m1",
      type: "mleader",
      layerId: "0",
      branches: [],
      path: "straight",
      style: { name: "S" },
    }
    expect(read({ ...whole, branches: undefined })).toBeUndefined()
    expect(read({ ...whole, path: "curly" })).toBeUndefined()
    expect(read({ ...whole, style: {} })).toBeUndefined()
    const content = (c: unknown) => read({ ...whole, content: c })?.content
    expect(
      content({
        kind: "mtext",
        position: { x: 0, y: 0 },
        contents: "A",
        height: 0,
      })
    ).toBeUndefined()
    expect(content({ kind: "mtext", position: { x: 0, y: 0 } })).toBeUndefined()
    expect(content({ kind: "block", position: { x: 0, y: 0 } })).toBeUndefined()
    expect(content({ kind: "block" })).toBeUndefined()
    expect(content("x")).toBeUndefined()
    expect(
      content({
        kind: "mtext",
        position: { x: 0, y: 0 },
        contents: "A",
        height: 2,
      })
    ).toMatchObject({ attachment: "tl", width: 0, styleId: "Standard" })
  })

  it("round-trips through the file", () => {
    const m = createMLeader([], { id: "m1", layerId: "0" })
    const back = parseDrawingFile(
      serializeDrawing({
        ...parseDrawingFile(
          JSON.stringify({
            type: DRAWING_FILE_TYPE,
            version: DRAWING_FILE_VERSION,
            layers: [],
            entities: [],
          })
        ),
        entities: [m],
      })
    ).entities[0]
    expect(back).toEqual(m)
  })
})
