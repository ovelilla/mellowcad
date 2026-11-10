import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { nextEntityId } from "../../domain/entityIds"
import { commandCatalog } from "../commandCatalog"

// cad-tools.md: a preview that needs an entity reuses a fixed id, never one
// minted per frame, which burns entity ids. Every command, given one point
// and then two, is only hovered: the frames it draws mint nothing.
const counter = () => parseInt(nextEntityId().slice(1).split("-")[0], 36)
const PICKS = [p(0, 0), p(40, 30)]

describe("a preview mints no entity id", () => {
  const names = commandCatalog().map((command) => command.name)
  it.each(names.flatMap((name) => [1, 2].map((picks) => [name, picks])))(
    "%s after %i points",
    (name, picks) => {
      const cad = createHarness({ entities: [lineOf(p(-50, -50), p(50, 50))] })
      cad.command(String(name))
      for (const at of PICKS.slice(0, Number(picks))) cad.click(at)
      cad.scene()
      const before = counter()
      for (const at of [p(10, 5), p(20, 15), p(-30, 25)]) {
        cad.moveTo(at)
        cad.scene()
      }
      expect(counter() - before).toBe(1)
    }
  )
})
