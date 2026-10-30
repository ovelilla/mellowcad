import { describe, expect, it, onTestFinished, vi } from "vitest"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"

describe("the tracking dwell", () => {
  function hovered() {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0))],
      snap: true,
    })
    cad.command("LINE").moveTo(p(100, 0))
    return cad
  }

  it("acquires a point only once the cursor has rested out its time", () => {
    const { runtime } = hovered()
    vi.advanceTimersByTime(runtime.tracking.dwellMs - 1)
    expect(runtime.tracking.hasAcquired()).toBe(false)
    vi.advanceTimersByTime(1)
    expect(runtime.tracking.hasAcquired()).toBe(true)
  })

  it("elapses at once when asked, and leaves no timer behind", () => {
    const { runtime } = hovered()
    runtime.tracking.elapseDwell()
    expect(runtime.tracking.getAcquired()).toHaveLength(1)
    expect(vi.getTimerCount()).toBe(0)
    runtime.tracking.elapseDwell()
    expect(runtime.tracking.getAcquired()).toHaveLength(1)
  })
})
