import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type { Entity, PolygonMeshEntity } from "../../domain/entities"
import {
  createPolygonMesh,
  isPolygonMeshRefusal,
  polygonMeshGrid,
  polygonMeshSmoothed,
} from "../../domain/entities"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// AutoCAD 2027's polygon mesh, 3DMESH and PEDIT's mesh prompts (probes
// scripts/research/probes/mesh/).

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const meshes = (cad: CadHarness): PolygonMeshEntity[] =>
  cad.entities().filter((e): e is PolygonMeshEntity => e.type === "polygonMesh")

/** Within `digits` decimals of `want`, Z too. */
const near =
  (want: { x: number; y: number; z: number }, digits = 4) =>
  (got: { x: number; y: number; z: number }) =>
    (["x", "y", "z"] as const).every(
      (k) => Math.abs(got[k] - want[k]) < 10 ** -digits / 2
    )

const xyz = (points: readonly { x: number; y: number; z: number }[]) =>
  points.map((v) => [v.x, v.y, v.z])

/** p13's 4 × 4 control mesh, its middle raised. */
const HUMP = [
  [0, 0, 0],
  [10, 0, 5],
  [20, 0, 5],
  [30, 0, 0],
  [0, 10, 5],
  [10, 10, 20],
  [20, 10, 20],
  [30, 10, 5],
  [0, 20, 5],
  [10, 20, 20],
  [20, 20, 15],
  [30, 20, 5],
  [0, 30, 0],
  [10, 30, 5],
  [20, 30, 5],
  [30, 30, 0],
].map(([x, y, z]) => ({ x, y, z }))

const hump = (id = "m1") => createPolygonMesh(4, 4, HUMP, "0", id)

/** p03's 3 × 4 mesh rising one unit a vertex. */
const ramp = () =>
  createPolygonMesh(
    3,
    4,
    Array.from({ length: 12 }, (_, k) => ({
      x: (k % 4) * 10,
      y: Math.floor(k / 4) * 10,
      z: k,
    })),
    "0",
    "m1"
  )

const smoothedHump = (kind: 5 | 6 | 8, u: number, v: number) => {
  const smoothed = polygonMeshSmoothed(hump(), kind, u, v)
  if (isPolygonMeshRefusal(smoothed)) throw new Error("refused")
  return smoothed
}

describe("3DMESH", () => {
  // p01, p02: the prompts, and what the sizes refuse.
  it("asks AutoCAD's prompts and makes the mesh row by row", () => {
    const cad = createHarness()
    const log = typed(
      cad,
      "3DMESH",
      "1",
      "257",
      "FOO",
      "2.5",
      "-3",
      "2",
      "2",
      "0,0",
      "FOO",
      "10,0",
      "",
      "10,10",
      "0,10,5"
    )
    expect(log).toEqual([
      "3DMESH",
      "Enter size of mesh in M direction: 1",
      "Requires an integer between 2 and 256.",
      "Enter size of mesh in M direction: 257",
      "Requires an integer between 2 and 256.",
      "Enter size of mesh in M direction: FOO",
      "Requires an integer between 2 and 256.",
      "Enter size of mesh in M direction: 2.5",
      "Requires an integer between 2 and 256.",
      "Enter size of mesh in M direction: -3",
      "Requires an integer between 2 and 256.",
      "Enter size of mesh in M direction: 2",
      "Enter size of mesh in N direction: 2",
      "Specify location for vertex (0, 0): 0,0",
      "Specify location for vertex (0, 1): FOO",
      "Invalid point.",
      "Specify location for vertex (0, 1): 10,0",
      "Specify location for vertex (1, 0):",
      "Invalid point.",
      "Specify location for vertex (1, 0): 10,10",
      "Specify location for vertex (1, 1): 0,10,5",
    ])
    const [mesh] = meshes(cad)
    expect(mesh).toMatchObject({ m: 2, n: 2, closedM: false, closedN: false })
    expect(xyz(mesh.vertices)).toEqual([
      [0, 0, 0],
      [10, 0, 0],
      [10, 10, 0],
      [0, 10, 5],
    ])
  })

  it("speaks Spanish", () => {
    const cad = createHarness({ locale: es })
    const log = typed(cad, "3DMALLA", "2", "2", "FOO")
    expect(log).toEqual([
      "3DMALLA",
      "Indique tamaño de malla en dirección M: 2",
      "Indique tamaño de malla en dirección N: 2",
      "Precise ubicación de vértice (0, 0): FOO",
      "Punto no válido.",
    ])
  })
})

describe("the polygon mesh", () => {
  // p01, p03, p13, p23: LIST, in English.
  it("lists itself as AutoCAD does", () => {
    const cad = createHarness({ entities: [ramp()] })
    typed(cad, "LUPREC", "4")
    cad.select("m1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines).toContain('                  POLYLINE  Layer: "0"')
    expect(lines).toContain("                   3x4 mesh")
    expect(lines).toContain('                  VERTEX    Layer: "0"')
    expect(lines).toContain("              Mesh")
    expect(lines).toContain(
      "                at point, X=  30.0000  Y=  20.0000  Z=  11.0000"
    )
    expect(lines).toContain('                  END SEQUENCE  Layer: "0"')
    const smoothed = createHarness({
      entities: [{ ...smoothedHump(6, 4, 3), closedN: false }],
    })
    typed(smoothed, "LUPREC", "4")
    smoothed.select("m1")
    const fitted = typed(smoothed, "_LIST").flatMap((l) => l.split("\n"))
    expect(fitted).toContain(
      "                   spline 4x4 mesh (5x4 fit mesh)"
    )
    const marks = fitted.filter((l) => l.trim().startsWith("("))
    expect(marks[0]).toBe("                   (Spline control point)")
    expect(marks.slice(1, 21).every((l) => l.includes("spline fitting"))).toBe(
      true
    )
    expect(marks).toHaveLength(1 + 20 + 15)
  })

  // p13, s6: the cubic surface's points, as AutoCAD smooths it at SURFU 4,
  // SURFV 3; s5 the quadratic's, s9 a closed cubic's at 2 × 2.
  it("smooths as PEDIT's Smooth surface does", () => {
    const cubic = polygonMeshGrid(smoothedHump(6, 4, 3))
    expect(cubic).toMatchObject({ rows: 5, cols: 4 })
    expect(cubic.points[5]).toSatisfy(near({ x: 10, y: 7.5, z: 9.73958 }, 4))
    expect(cubic.points[10]).toSatisfy(near({ x: 20, y: 15, z: 11.25 }, 4))
    expect(cubic.points[14]).toSatisfy(near({ x: 20, y: 22.5, z: 8.95833 }, 4))
    const quadratic = polygonMeshGrid(smoothedHump(5, 4, 3))
    expect(quadratic.points[5]).toSatisfy(
      near({ x: 11.1111, y: 8.75, z: 14.7222 })
    )
    expect(quadratic.points[11]).toSatisfy(near({ x: 30, y: 15, z: 5 }, 4))
    const bezier = polygonMeshGrid(smoothedHump(8, 4, 3))
    expect(bezier.points[6]).toSatisfy(near(cubic.points[6], 9))
    const closed = polygonMeshSmoothed(
      { ...hump(), closedM: true, closedN: true },
      6,
      2,
      2
    )
    if (isPolygonMeshRefusal(closed)) throw new Error("refused")
    expect(closed.smooth).toEqual({ kind: 6, mDensity: 2, nDensity: 2 })
    expect(polygonMeshGrid(closed).points[0]).toSatisfy(
      near({ x: 10, y: 10, z: 15.1389 })
    )
    expect(polygonMeshGrid(closed).points[3]).toSatisfy(
      near({ x: 23.3333, y: 23.3333, z: 1.80556 })
    )
  })

  // p03, p12, p14: PEDIT's mesh prompts.
  it("PEDIT closes, undoes and walks its vertices as AutoCAD does", () => {
    const cad = createHarness({ entities: [ramp()] })
    const log = typed(
      cad,
      "PEDIT",
      "L",
      "M",
      "N",
      "U",
      "E",
      "N",
      "N",
      "R",
      "U",
      "D",
      "L",
      "P",
      "M",
      "15,5,50",
      "X",
      "X"
    )
    expect(log).toEqual([
      "PEDIT",
      "Select polyline or [Multiple]: L",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mclose/Nclose/Undo]: M",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mopen/Nclose/Undo]: N",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mopen/Nopen/Undo]: U",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mopen/Nclose/Undo]: E",
      "Current vertex (0,0).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <N>: N",
      "Current vertex (0,1).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <N>: N",
      "Current vertex (0,2).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <N>: R",
      "Current vertex (0,3).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <R>: U",
      "Current vertex (1,3).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <U>: D",
      "Current vertex (0,3).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <D>: L",
      "Current vertex (0,2).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <L>: P",
      "Current vertex (0,1).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <P>: M",
      "Specify new location for marked vertex: 15,5,50",
      "Current vertex (0,1).",
      "Enter an option [Next/Previous/Left/Right/Up/Down/Move/REgen/eXit] <P>: X",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mopen/Nclose/Undo]: X",
    ])
    const [mesh] = meshes(cad)
    expect(mesh.closedM).toBe(true)
    expect(mesh.closedN).toBe(false)
    expect(mesh.vertices[1]).toEqual({ x: 15, y: 5, z: 50 })
  })

  // p14: the walk stays put at an edge, a closed mesh's too.
  it("stays put at an edge of a closed mesh", () => {
    const cad = createHarness({
      entities: [{ ...hump(), closedM: true, closedN: true }],
    })
    const log = typed(cad, "PEDIT", "L", "E", "P", "L", "U", "U", "U", "U")
    expect(log.filter((l) => l.startsWith("Current"))).toEqual([
      "Current vertex (0,0).",
      "Current vertex (0,0).",
      "Current vertex (0,0).",
      "Current vertex (1,0).",
      "Current vertex (2,0).",
      "Current vertex (3,0).",
      "Current vertex (3,0).",
    ])
  })

  // p18, p19, p21: Smooth surface's refusals and SURFU under 2.
  it("PEDIT's Smooth surface says why it cannot, and takes SURFU under 2 as 2", () => {
    const narrow = createPolygonMesh(
      3,
      12,
      Array.from({ length: 36 }, (_, k) => ({
        x: k % 12,
        y: Math.floor(k / 12) * 5,
        z: 0,
      })),
      "0",
      "m1"
    )
    const cad = createHarness({ entities: [narrow] })
    const log = typed(
      cad,
      "PEDIT",
      "L",
      "S",
      "X",
      "SURFTYPE",
      "8",
      "PEDIT",
      "L",
      "S",
      "X"
    )
    expect(log).toContain(
      "Too few control vertices in M direction.  Must be more than three."
    )
    expect(log).toContain("Too many control vertices.  Must be less than 12.")
    const square = createHarness({
      entities: [createPolygonMesh(2, 2, HUMP.slice(0, 4), "0", "m1")],
    })
    expect(typed(square, "SURFTYPE", "5", "PEDIT", "L", "S", "X")).toContain(
      "Too few control vertices in either direction.  Must be more than two."
    )
    const low = createHarness({ entities: [hump()] })
    const said = typed(low, "SURFU", "0", "SURFV", "1", "PEDIT", "L", "S", "X")
    expect(said).toContain("SURFU is out of range. Using a value of 2.")
    expect(said).toContain("SURFV is out of range. Using a value of 2.")
    expect(meshes(low)[0].smooth).toEqual({
      kind: 6,
      mDensity: 3,
      nDensity: 3,
    })
  })

  // p15, p21: closing a smoothed mesh smooths it again at the variables as
  // they now stand; Desmooth leaves its control mesh.
  it("smooths again as it closes, at SURFTYPE, SURFU and SURFV as they stand", () => {
    const cad = createHarness({ entities: [hump()] })
    typed(
      cad,
      "SURFU",
      "2",
      "SURFV",
      "2",
      "SURFTYPE",
      "5",
      "PEDIT",
      "L",
      "S",
      "X",
      "SURFU",
      "6",
      "SURFV",
      "6",
      "SURFTYPE",
      "6",
      "PEDIT",
      "L",
      "M",
      "X"
    )
    expect(meshes(cad)[0].smooth).toEqual({
      kind: 6,
      mDensity: 6,
      nDensity: 7,
    })
    typed(cad, "PEDIT", "L", "D", "X")
    expect(meshes(cad)[0].smooth).toBeUndefined()
    expect(xyz(meshes(cad)[0].vertices)).toEqual(xyz(HUMP))
  })

  // p03, p13, p14: EXPLODE makes a 3D face per cell of what it shows.
  it("EXPLODE makes a 3D face of each cell it shows", () => {
    const explode = (mesh: Entity) => {
      const cad = createHarness({ entities: [mesh] })
      typed(cad, "_EXPLODE", "_L", "")
      return cad.entities()
    }
    const plain = explode(ramp())
    expect(plain.every((e) => e.type === "face3d")).toBe(true)
    expect(plain).toHaveLength(6)
    expect(plain[0].type === "face3d" && xyz(plain[0].corners)).toEqual([
      [0, 0, 0],
      [10, 0, 1],
      [10, 10, 5],
      [0, 10, 4],
    ])
    expect(explode({ ...hump(), closedM: true, closedN: true })).toHaveLength(
      16
    )
    expect(explode(smoothedHump(6, 4, 3))).toHaveLength(12)
  })

  // p05: MIRROR reverses each row; p22: STRETCH lifts the vertices it
  // catches; p20: a smoothed one's stay.
  it("MIRROR reverses its rows; STRETCH moves the vertices it catches", () => {
    const flat = createPolygonMesh(
      2,
      3,
      [
        { x: 0, y: 0, z: 0 },
        { x: 50, y: 0, z: 10 },
        { x: 100, y: 0, z: 0 },
        { x: 0, y: 50, z: 0 },
        { x: 50, y: 50, z: 10 },
        { x: 100, y: 50, z: 0 },
      ],
      "0",
      "m1"
    )
    const cad = createHarness({ entities: [flat] })
    cad.select("m1")
    typed(cad, "_MIRROR", "0,100", "10,100", "Y")
    expect(xyz(meshes(cad)[0].vertices)).toEqual([
      [100, 200, 0],
      [50, 200, 10],
      [0, 200, 0],
      [100, 150, 0],
      [50, 150, 10],
      [0, 150, 0],
    ])
    const stretched = createHarness({ entities: [hump()] })
    stretched.zoomToFit()
    typed(stretched, "_STRETCH", "C", "-1,-1", "11,11", "", "0,0", "5,0")
    expect(xyz(meshes(stretched)[0].vertices).slice(0, 6)).toEqual([
      [5, 0, 0],
      [15, 0, 5],
      [20, 0, 5],
      [30, 0, 0],
      [5, 10, 5],
      [15, 10, 20],
    ])
    const smooth = createHarness({ entities: [smoothedHump(5, 2, 2)] })
    smooth.zoomToFit()
    typed(smooth, "_STRETCH", "C", "-1,-1", "1,1", "", "0,0", "0,0,7")
    expect(xyz(meshes(smooth)[0].vertices)).toEqual(xyz(HUMP))
  })

  // p04, p07, p08, p09, p11: what the edit commands say of it.
  it("is refused by the commands that cut or measure an edge, as AutoCAD's are", () => {
    const flat = createPolygonMesh(
      2,
      3,
      [0, 50, 100, 0, 50, 100].map((x, k) => ({
        x,
        y: k < 3 ? 0 : 50,
        z: 0,
      })),
      "0",
      "m1"
    )
    const refused = (command: string, ...rest: string[]) => {
      const cad = createHarness({ entities: [flat] })
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(100, 25))
      return cad.commandLog().join("\n")
    }
    expect(refused("_OFFSET", "5")).toContain("Cannot offset that object.")
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_FILLET")).toContain(
      "  3D Polyline objects may not be filleted."
    )
    expect(refused("_CHAMFER")).toContain(
      "  3D Polyline objects may not be chamfered."
    )
    expect(refused("_TRIM")).toContain("Polygon Mesh\nCannot TRIM this object.")
    expect(refused("_EXTEND")).toContain(
      "Polygon Mesh\nCannot EXTEND this object."
    )
    expect(refused("_DIVIDE")).toContain("Cannot divide that object.")
    const ucs = createHarness({ entities: [flat] })
    ucs.zoomToFit()
    typed(ucs, "_UCS", "_OB")
    ucs.click(p(50, 0))
    expect(ucs.commandLog().join("\n")).toContain(
      "3D Polygon Mesh object does not define a coordinate system"
    )
  })

  // p11, p13: END, MID, NEA and PER on the edges it shows; no CEN.
  it("snaps to the edges it shows", () => {
    const cad = createHarness({ entities: [smoothedHump(6, 4, 3)], snap: true })
    cad.zoomToFit()
    typed(cad, "LINE", "MID")
    cad.click(p(5, 0.2))
    typed(cad, "END")
    cad.click(p(10.2, 7.6))
    typed(cad, "")
    const line = cad.entities().find((e) => e.type === "line")
    // On the fitted mesh's points and edges, each at its Z (p13: MID at
    // 5,0,1.66667, END at 10,7.5,9.73958).
    if (line?.type !== "line") throw new Error("no line")
    expect(line.start).toBeCloseToPoint({ x: 5, y: 0 })
    expect(line.end).toBeCloseToPoint({ x: 10, y: 7.5 })
    expect(line.elevation ?? 0).toBeCloseTo(1.66667, 4)
  })

  // Desktop d01, d03: a grip per vertex moves it with its Z; a smoothed
  // one's sit on its fitted mesh and move nothing.
  it("shows a grip at each vertex, a smoothed one's on its fitted mesh", () => {
    const grips = (mesh: Entity) => {
      const cad = createHarness({ entities: [mesh] })
      cad.zoomToFit()
      cad.select(mesh.id)
      return cad
        .scene()
        .primitives.filter((q) => q.kind === "rect" && q.fill === THEME.grip)
    }
    expect(grips(hump())).toHaveLength(16)
    expect(grips(smoothedHump(6, 4, 3))).toHaveLength(20)
    const cad = createHarness({ entities: [hump()] })
    // Off the plan, as a 3D face's grip is tested: the one at 10,10,20 moves
    // its vertex alone.
    typed(cad, "-VIEW", "_SEISO")
    cad.select("m1")
    cad.click({ x: 10, y: 10, z: 20 }).click({ x: 40, y: 40, z: 0 })
    const moved = meshes(cad)[0].vertices
    expect(moved[5]).not.toEqual({ x: 10, y: 10, z: 20 })
    expect(moved.filter((_, k) => k !== 5)).toEqual(
      HUMP.filter((_, k) => k !== 5)
    )
  })

  // Desktop d02, d04: the palette's rows.
  it("shows AutoCAD's rows in the Properties palette", () => {
    const cad = createHarness({ entities: [smoothedHump(6, 4, 3)] })
    cad.select("m1")
    const info = cad.state().properties.info
    const rows = info?.groups.flatMap((g) => g.rows.map((r) => r.label)) ?? []
    expect(info?.title).toBe("Polygon Mesh")
    expect(rows).toEqual(
      expect.arrayContaining([
        "Current Vertex",
        "Vertex X",
        "M closed",
        "N closed",
        "M density",
        "N density",
        "M vertex count",
        "N vertex count",
        "Fit/Smooth",
      ])
    )
    const values = info?.groups.flatMap((g) => g.rows.map((r) => r.value))
    expect(values).toEqual(expect.arrayContaining(["5", "4", "Cubic"]))
  })

  // A file's smoothing the mesh cannot take is dropped, not drawn past its
  // vertices; nor is a density no SURFU gives.
  it("drops a file's smoothing the mesh cannot take", () => {
    const square = createPolygonMesh(2, 2, HUMP.slice(0, 4), "0", "m1")
    const file = serializeDrawing(
      documentSnapshot(createHarness({ entities: [square] }).runtime.document)
    )
    for (const smooth of [
      { kind: 6, mDensity: 5, nDensity: 5 },
      { kind: 5, mDensity: 3, nDensity: 3 },
    ]) {
      const parsed = parseDrawingFile(
        file.replace(
          '"closedN":false',
          `"closedN":false,"smooth":${JSON.stringify(smooth)}`
        )
      )
      expect(parsed.entities[0]).toEqual(square)
    }
    const big = parseDrawingFile(
      serializeDrawing(
        documentSnapshot(createHarness({ entities: [hump()] }).runtime.document)
      ).replace(
        '"closedN":false',
        '"closedN":false,"smooth":{"kind":6,"mDensity":32767,"nDensity":5}'
      )
    )
    expect(big.entities[0]).toEqual(hump())
  })

  // A point or a snap typed at the mesh's prompts is no pick: the prompt
  // refuses it, and PEDIT goes on with the same mesh.
  it("refuses a point typed at PEDIT's mesh prompt", () => {
    const cad = createHarness({ entities: [ramp()] })
    const log = typed(cad, "PEDIT", "L", "5,0", "END", "X")
    expect(log).toEqual([
      "PEDIT",
      "Select polyline or [Multiple]: L",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mclose/Nclose/Undo]: 5,0",
      "Invalid option keyword.",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mclose/Nclose/Undo]: END",
      "Invalid option keyword.",
      "Enter an option [Edit vertex/Smooth surface/Desmooth/Mclose/Nclose/Undo]: X",
    ])
  })

  // DoubleClickRoot.cui's POLYLINE, a polygon mesh's DXF name too.
  it("runs PEDIT on a mesh double-clicked", () => {
    const cad = createHarness({ entities: [ramp()] })
    cad.zoomToFit()
    cad.doubleClick(p(5, 0))
    expect(JSON.stringify(cad.state().commandLine.question)).toContain(
      "Smooth surface"
    )
  })

  // f01: a DASHED one plots continuous, as a 3D face does.
  it("draws its edges continuous whatever its linetype", () => {
    const dashed = { ...ramp(), linetype: "DASHED" }
    const cad = createHarness({ entities: [dashed] })
    typed(cad, "-LINETYPE", "L", "DASHED", "")
    cad.zoomToFit()
    const segments = cad.scene().primitives.filter((q) => q.kind === "segment")
    expect(segments.length).toBeGreaterThan(0)
    expect(segments.every((q) => q.kind === "segment" && !q.stroke.dash)).toBe(
      true
    )
  })

  it("the drawing file keeps it, smoothed and closed", () => {
    const mesh = { ...smoothedHump(5, 3, 2), closedN: true }
    const cad = createHarness({ entities: [mesh, ramp()] })
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(back.entities).toEqual(cad.entities())
  })
})
