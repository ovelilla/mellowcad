import { describe, expect, it, vi } from "vitest"
import { CommandHistory, type Command } from "./Command"
import {
  AddEntitiesCommand,
  AddEntityCommand,
  ClearDocumentCommand,
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
  UpdateEntitiesCommand,
  UpdateEntityCommand,
} from "./entityCommands"
import { CadDocument } from "../../domain/Document"
import type { LineEntity } from "../../domain/entities"
import { createLayer } from "../../domain/layers"
import { circleOf, documentWith, lineOf, p } from "../../../test/builders"

/**
 * Every mutation of the drawing goes through a command, so undo/redo is a
 * property of the write path rather than something each tool re-implements.
 * The contract each command owes: `undo` restores the document to exactly the
 * state `execute` found — including the entities it displaced.
 */

const L1 = lineOf(p(0, 0), p(100, 0), { id: "L1" })
const L2 = lineOf(p(0, 50), p(100, 50), { id: "L2" })

function historyOn(document: CadDocument) {
  return new CommandHistory(document)
}

describe("AddEntityCommand", () => {
  it("adds and removes again", () => {
    const document = new CadDocument()
    const history = historyOn(document)

    history.execute(new AddEntityCommand(L1))
    expect(document.size).toBe(1)

    history.undo()
    expect(document.size).toBe(0)

    history.redo()
    expect(document.get("L1")).toBeDefined()
  })
})

describe("AddEntitiesCommand", () => {
  it("adds a batch as one step", () => {
    const document = new CadDocument()
    const history = historyOn(document)

    history.execute(new AddEntitiesCommand([L1, L2]))
    expect(document.size).toBe(2)

    history.undo()
    expect(document.size).toBe(0)
  })
})

describe("UpdateEntityCommand", () => {
  it("restores the previous version of the entity", () => {
    const document = documentWith([L1])
    const history = historyOn(document)

    history.execute(
      new UpdateEntityCommand(lineOf(p(0, 0), p(300, 0), { id: "L1" }))
    )
    expect((document.get("L1") as LineEntity).end.x).toBe(300)

    history.undo()
    expect((document.get("L1") as LineEntity).end.x).toBe(100)
  })

  it("keeps the entity count stable — an update is not a replacement", () => {
    const document = documentWith([L1])
    const history = historyOn(document)

    history.execute(
      new UpdateEntityCommand(lineOf(p(9, 9), p(9, 99), { id: "L1" }))
    )

    expect(document.size).toBe(1)
  })
})

describe("UpdateEntitiesCommand", () => {
  it("restores every entity it touched", () => {
    const document = documentWith([L1, L2])
    const history = historyOn(document)

    history.execute(
      new UpdateEntitiesCommand([
        lineOf(p(0, 0), p(1, 0), { id: "L1" }),
        lineOf(p(0, 0), p(2, 0), { id: "L2" }),
      ])
    )
    history.undo()

    expect((document.get("L1") as LineEntity).end.x).toBe(100)
    expect((document.get("L2") as LineEntity).end.x).toBe(100)
  })
})

describe("ReplaceEntitiesCommand", () => {
  it("swaps a set of entities for another and puts the originals back", () => {
    // The shape of every split/trim/fillet edit: remove some, add some, one step.
    const document = documentWith([L1])
    const history = historyOn(document)

    history.execute(
      new ReplaceEntitiesCommand(
        ["L1"],
        [
          lineOf(p(0, 0), p(40, 0), { id: "A" }),
          lineOf(p(60, 0), p(100, 0), { id: "B" }),
        ]
      )
    )
    expect(document.size).toBe(2)
    expect(document.has("L1")).toBe(false)

    history.undo()
    expect(document.size).toBe(1)
    expect(document.has("L1")).toBe(true)
  })

  // probe pieces/p262: U after EXPLODE puts the polyline back before the line
  // drawn after it, and `ERASE _L` then erases the line.
  it("puts what it removed back in its place in the drawing's order", () => {
    const document = documentWith([L1, L2, circleOf(p(0, 0), 5, { id: "C1" })])
    const history = historyOn(document)

    history.execute(
      new ReplaceEntitiesCommand(
        ["L1", "C1"],
        [
          lineOf(p(0, 0), p(40, 0), { id: "A" }),
          lineOf(p(60, 0), p(100, 0), { id: "B" }),
        ]
      )
    )
    history.undo()

    expect(document.getEntities().map((e) => e.id)).toEqual(["L1", "L2", "C1"])
  })

  it("keeps a piece under the object's id where the object was", () => {
    const document = documentWith([L1, L2])
    const history = historyOn(document)

    history.execute(
      new ReplaceEntitiesCommand(
        ["L1"],
        [
          lineOf(p(0, 0), p(40, 0), { id: "L1" }),
          lineOf(p(60, 0), p(100, 0), { id: "B" }),
        ]
      )
    )
    expect(document.getEntities().map((e) => e.id)).toEqual(["L1", "L2", "B"])

    history.undo()
    expect(document.getEntities().map((e) => e.id)).toEqual(["L1", "L2"])
    expect((document.get("L1") as LineEntity).end.x).toBe(100)
  })
})

describe("RemoveEntitiesCommand", () => {
  it("restores exactly what it deleted", () => {
    const document = documentWith([L1, L2, circleOf(p(0, 0), 5, { id: "C1" })])
    const history = historyOn(document)

    history.execute(new RemoveEntitiesCommand(["L1", "C1"]))
    expect(document.getEntities().map((e) => e.id)).toEqual(["L2"])

    history.undo()
    // probe pieces/p264: U after ERASE puts the object back in its place.
    expect(document.getEntities().map((e) => e.id)).toEqual(["L1", "L2", "C1"])
  })

  it("ignores ids that are not in the document", () => {
    const document = documentWith([L1])
    const history = historyOn(document)

    history.execute(new RemoveEntitiesCommand(["L1", "ghost"]))
    history.undo()

    expect(document.size).toBe(1)
  })
})

describe("ClearDocumentCommand", () => {
  it("restores the whole drawing, layers included", () => {
    const document = documentWith([L1, L2])
    document.addLayer(
      createLayer("Walls", undefined, undefined, undefined, "walls")
    )
    document.setCurrentLayer("walls")
    const history = historyOn(document)

    history.execute(new ClearDocumentCommand())
    expect(document.size).toBe(0)

    history.undo()
    expect(document.size).toBe(2)
    expect(document.getCurrentLayerId()).toBe("walls")
  })
})

describe("CommandHistory", () => {
  function countingCommand(): Command & { executions: number } {
    return {
      label: "test",
      executions: 0,
      execute() {
        this.executions += 1
      },
      undo() {},
      mapEntities() {
        return this
      },
    }
  }

  it("reports what is available", () => {
    const document = new CadDocument()
    const history = historyOn(document)

    expect(history.canUndo()).toBe(false)
    expect(history.canRedo()).toBe(false)

    history.execute(new AddEntityCommand(L1))
    expect(history.canUndo()).toBe(true)
    expect(history.canRedo()).toBe(false)

    history.undo()
    expect(history.canUndo()).toBe(false)
    expect(history.canRedo()).toBe(true)
  })

  it("returns null rather than throwing on an empty stack", () => {
    const history = historyOn(new CadDocument())

    expect(history.undo()).toBeNull()
    expect(history.redo()).toBeNull()
  })

  it("discards the redo stack when a new command is executed", () => {
    const document = new CadDocument()
    const history = historyOn(document)

    history.execute(new AddEntityCommand(L1))
    history.undo()
    history.execute(new AddEntityCommand(L2))

    expect(history.canRedo()).toBe(false)
    expect(document.getEntities().map((e) => e.id)).toEqual(["L2"])
  })

  it("re-executes the same command instance on redo", () => {
    const history = historyOn(new CadDocument())
    const command = countingCommand()

    history.execute(command)
    history.undo()
    history.redo()

    expect(command.executions).toBe(2)
  })

  it("bounds the stack so a long session cannot grow without limit", () => {
    const document = new CadDocument()
    const history = new CommandHistory(document, 3)

    for (let i = 0; i < 5; i++) {
      history.execute(
        new AddEntityCommand(lineOf(p(i, 0), p(i, 1), { id: `L${i}` }))
      )
    }

    let undone = 0
    while (history.undo()) undone += 1
    expect(undone).toBe(3)
    // The two oldest additions fell off the stack, so they survive.
    expect(document.size).toBe(2)
  })

  it("notifies subscribers on every stack change", () => {
    const history = historyOn(new CadDocument())
    const listener = vi.fn()
    history.subscribe(listener)

    history.execute(new AddEntityCommand(L1))
    history.undo()
    history.redo()

    expect(listener).toHaveBeenCalledTimes(3)
  })

  it("clears both stacks for a fresh baseline", () => {
    const history = historyOn(new CadDocument())

    history.execute(new AddEntityCommand(L1))
    history.clear()

    expect(history.canUndo()).toBe(false)
    expect(history.canRedo()).toBe(false)
  })
})
