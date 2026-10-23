import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { Entity } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { drawnColor, THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { ToolContext } from "./Tool"

/**
 * A transform's drag as AutoCAD draws it: the set transformed, drawn as
 * itself, solid in each object's colour, and an amber dashed line from `from`
 * to `to` (desktop move/d01, transforms/d01–d10). MOVE, COPY, STRETCH, ROTATE,
 * SCALE and MIRROR share it, so they look alike.
 */
export function transformDrag(
  ctx: ToolContext,
  set: readonly Entity[],
  transform: (entity: Entity) => Entity,
  from: Vec2 | Vec3,
  to: Vec2 | Vec3
): ScenePrimitive[] {
  const { viewport } = ctx
  const out: ScenePrimitive[] = []
  for (const entity of set) {
    out.push(
      ...entityScenePrimitive(
        viewport,
        transform(entity),
        {
          color: drawnColor(ctx.document.resolveEntityColor(entity)),
          width: 1,
        },
        { blocks: ctx.blocks }
      )
    )
  }
  out.push({
    kind: "segment",
    a: viewport.worldToScreen(from),
    b: viewport.worldToScreen(to),
    stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
  })
  return out
}
