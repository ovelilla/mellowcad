import {
  Entity,
  EntityId,
  Similarity3,
  transformEntity,
} from "../../domain/entities"
import { MassReport, massReport } from "../../domain/massProperties"
import { formatLength } from "../../domain/units"
import {
  Ucs,
  isWorldUcs,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import type { Box3 } from "../../geometry/solids"
import type { Vec2 } from "../../geometry/Vec2"
import type { Vec3 } from "../../geometry/Vec3"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { newestFirst } from "./listReport"
import { AddedBy } from "./objectSelection"
import { SelectionActionTool } from "./SelectionActionTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * AutoCAD's MASSPROP (solid/m01–m10, region/p01, b02): `Select objects:`,
 * then the regions' report and the solids', each set summed as one body with
 * a density of 1, in the current UCS — its origin the moments', its axes the
 * box's and the directions' —, every number at LUPREC (m08); then `Write
 * analysis to a file? [Yes/No] <N>:`. Objects on a locked layer are measured
 * (m09); a set with neither says `No solids or regions selected.`, an empty
 * one `Nothing selected.` (m05). The regions are those in the plane of the
 * set's first, the rest counted as ignored (m09); off the XY plane, even
 * level at another Z, they report their area, perimeter, box and centroid
 * alone (m07).
 *
 * WHY Yes writes the analysis at once, as a download named as the drawing
 * (`drawing-2026-11-01.mpr`): AutoCAD asks for the file in a dialog (the
 * console's `Enter file name <Drawing1.mpr>:`, m06), and in a browser the
 * download is the save dialog, as SAVE's is here. The file is AutoCAD's: the
 * report's lines with their unit fields' spaces, CRLF (m10).
 */
export class MassPropTool extends SelectionActionTool {
  readonly id = "massprop"

  /** The set's objects in the order they joined it: the first region's plane is the regions'. */
  private order: EntityId[] = []
  /** The analysis as the file holds it, while `Write analysis to a file?` asks. */
  private analysis: string | null = null

  onActivate(ctx: ToolContext): void {
    this.order = []
    this.analysis = null
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.order = []
    this.analysis = null
    super.onDeactivate(ctx)
  }

  protected takesLocked(): boolean {
    return true
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  protected noneFound(): "massPropNothingSelected" {
    return "massPropNothingSelected"
  }

  protected selectionAdded(ids: readonly EntityId[], added: AddedBy): void {
    this.order.push(...(added.by === "pick" ? ids : [...ids].reverse()))
  }

  question(): PromptId | ToolQuestion {
    if (this.analysis !== null) {
      return { id: "massPropWriteFile", enter: { name: "N" } }
    }
    return super.question()
  }

  takes(): QuestionInput | null {
    return this.analysis !== null ? null : super.takes()
  }

  commandOptions(): readonly CommandOption[] {
    if (this.analysis !== null) return [{ id: "Yes" }, { id: "No" }]
    return super.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const analysis = this.analysis
    if (analysis === null) return super.invokeOption(id, ctx)
    if (id !== "Yes" && id !== "No") return "unhandled"
    if (id === "Yes") {
      const file = ctx.writeFile(analysis, "mpr")
      if (!file.written) {
        ctx.report(
          ctx.text.message("massPropUnableToOpen", { name: file.name }),
          "error"
        )
      }
    }
    this.analysis = null
    ctx.dynamicInput.close()
    ctx.endCommand()
    return "end"
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.analysis === null) return super.onEnter(ctx)
    this.invokeOption("No", ctx)
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.analysis === null && super.answerTyped(text, ctx)
  }

  wantsSnap(): boolean {
    return this.analysis === null && super.wantsSnap()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.analysis === null) super.onPointerDown(input, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.analysis === null) super.onPointerMove(input, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.analysis === null) super.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.analysis === null ? super.buildOverlay(ctx) : []
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): boolean {
    const ids = new Set(entities.map((entity) => entity.id))
    const joined = [...new Set(this.order)].filter((id) => ids.has(id))
    const preselected = newestFirst(
      [...ids].filter((id) => !joined.includes(id)),
      ctx
    )
    const ordered = [...preselected, ...joined].flatMap(
      (id) => entities.find((entity) => entity.id === id) ?? []
    )
    ctx.selection.clear()
    const ucs = ctx.ucs
    const report = massReport(
      isWorldUcs(ucs)
        ? ordered
        : ordered.map((entity) => transformEntity(entity, intoUcs(ucs)))
    )
    if (!report) {
      ctx.report(ctx.text.message("massPropNoneSelected"))
      return false
    }
    if (report.ignoredRegions > 0) {
      ctx.report(
        ctx.text.message("massPropRegionsIgnored", {
          count: report.ignoredRegions,
        })
      )
    }
    const analysis = analysisText(report, ctx)
    // The console's lines end at their last word: the unit fields' spaces
    // are the file's alone (solid/m10).
    ctx.report(analysis.replace(/ +$/gm, "").replace(/\n$/, ""))
    this.analysis = analysis.replace(/\n/g, "\r\n")
    // A keyword-only prompt: the chips, and Enter takes No.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    return true
  }
}

/**
 * The map taking the tool's frame into the UCS itself: the frame turns only
 * the UCS's Z level (`UcsFrame`), and MASSPROP reads every number in the
 * UCS, its origin the moments' and its X the box's (solid/m04, m07).
 */
function intoUcs(ucs: Ucs): Similarity3 {
  const along = (x: number, y: number, z: number) =>
    worldDirectionToUcs(ucs, { x, y, z })
  return {
    rotation: { x: along(1, 0, 0), y: along(0, 1, 0), z: along(0, 0, 1) },
    scale: 1,
    translation: worldPointToUcs(ucs, { x: 0, y: 0, z: 0 }),
  }
}

/** The report as AutoCAD's string tables lay it out, the regions first. */
function analysisText(report: MassReport, ctx: ToolContext): string {
  const n = (value: number) => formatLength(value, ctx.document.getSettings())
  const box = (b: Box3) => ({
    minX: n(b.min.x),
    maxX: n(b.max.x),
    minY: n(b.min.y),
    maxY: n(b.max.y),
    minZ: n(b.min.z),
    maxZ: n(b.max.z),
  })
  const point = (p: Vec2 | Vec3) => ({
    x: n(p.x),
    y: n(p.y),
    ...("z" in p ? { z: n(p.z) } : {}),
  })
  let text = ""
  const regions = report.regions
  if (regions) {
    const sizes = { area: n(regions.area), perimeter: n(regions.perimeter) }
    const inertia = regions.inertia
    if (inertia) {
      const [i, j] = inertia.principal
      text += ctx.text.message("massPropRegions", {
        ...sizes,
        ...box(regions.box),
        ...point(inertia.centroid),
        momentX: n(inertia.moments.x),
        momentY: n(inertia.moments.y),
        productXY: n(inertia.product),
        radiusX: n(inertia.radii.x),
        radiusY: n(inertia.radii.y),
        i: n(i.moment),
        iX: n(i.direction.x),
        iY: n(i.direction.y),
        j: n(j.moment),
        jX: n(j.direction.x),
        jY: n(j.direction.y),
      })
    } else {
      text += ctx.text.message("massPropRegionsInSpace", {
        ...sizes,
        ...box(regions.box),
        ...point(regions.centroid),
      })
    }
  }
  const solids = report.solids
  if (solids) {
    const { centroid, moments, products, radii, principal } = solids.inertia
    const [i, j, k] = principal
    text += ctx.text.message("massPropSolids", {
      mass: n(solids.volume),
      volume: n(solids.volume),
      ...box(solids.box),
      ...point(centroid),
      momentX: n(moments.x),
      momentY: n(moments.y),
      momentZ: n(moments.z),
      productXY: n(products.xy),
      productYZ: n(products.yz),
      productZX: n(products.zx),
      radiusX: n(radii.x),
      radiusY: n(radii.y),
      radiusZ: n(radii.z),
      i: n(i.moment),
      iX: n(i.direction.x),
      iY: n(i.direction.y),
      iZ: n(i.direction.z),
      j: n(j.moment),
      jX: n(j.direction.x),
      jY: n(j.direction.y),
      jZ: n(j.direction.z),
      k: n(k.moment),
      kX: n(k.direction.x),
      kY: n(k.direction.y),
      kZ: n(k.direction.z),
    })
  }
  return text
}
