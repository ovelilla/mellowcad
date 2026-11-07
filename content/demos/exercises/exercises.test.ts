import { describe, expect, it } from "vitest"

import { createMemoryDrawingStore, recordDemo } from "@mellowcad/engine"

import { EXERCISES } from "."
import {
  LAYER_ROLES,
  startingDrawing,
  startingView,
  type LayerNames,
} from "./exercise"

/** Another language's names, as the drawing a Spanish page opens has them. */
const NAMES: LayerNames = {
  outline: "Contorno",
  centre: "Ejes",
  hidden: "Ocultas",
  dimensions: "Cotas",
}

/**
 * Every X of the objects' points in a drawing file, wherever they sit. An
 * array's own parameters are its block's, and an axis is a direction: neither
 * moves with the object.
 */
function xs(value: unknown): number[] {
  if (Array.isArray(value)) return value.flatMap(xs)
  if (value === null || typeof value !== "object") return []
  return Object.entries(value).flatMap(([key, inner]) =>
    key === "x" && typeof inner === "number"
      ? [inner]
      : key === "array" || key === "axis" || key === "normal"
        ? []
        : xs(inner)
  )
}

describe.each(Object.entries(EXERCISES))(
  "the exercise %s",
  (_slug, { exercise }) => {
    it("names each step once", () => {
      const ids = exercise.steps.map((step) => step.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it("opens with its drawing left of the origin, on its layers, the outline current", async () => {
      const store = createMemoryDrawingStore()
      await recordDemo(startingDrawing(exercise, NAMES), { store })
      const file = JSON.parse(store.read() ?? "null") as {
        layers: { id: string; name: string }[]
        currentLayerId: string
        entities: unknown[]
      }

      expect(file.entities.length).toBeGreaterThan(0)
      expect(Math.max(...xs(file.entities))).toBeLessThan(0)
      expect(file.layers.map((layer) => layer.name)).toEqual([
        "0",
        ...LAYER_ROLES.filter((role) => exercise.layers.includes(role)).map(
          (role) => NAMES[role]
        ),
      ])
      expect(
        file.layers.find((layer) => layer.id === file.currentLayerId)?.name
      ).toBe(NAMES.outline)
    })

    it("frames the drawing and the room right of it", () => {
      const view = startingView(exercise)
      expect(view.min.x).toBeLessThan(0)
      expect(view.max.x).toBeGreaterThan(0)
    })
  }
)
