import { describe, expect, it, onTestFinished, vi } from "vitest"
import { ParallelReferenceEngine } from "./ParallelReference"

describe("ParallelReferenceEngine", () => {
  function hovering() {
    vi.useFakeTimers()
    onTestFinished(() => {
      vi.useRealTimers()
    })
    const refs = new ParallelReferenceEngine()
    refs.observeHover("line")
    return refs
  }

  it("acquires a line only once the cursor has rested out its time", () => {
    const refs = hovering()
    vi.advanceTimersByTime(refs.dwellMs - 1)
    expect(refs.hasAcquired()).toBe(false)
    vi.advanceTimersByTime(1)
    expect([...refs.getAcquired()]).toEqual(["line"])
  })

  it("elapses at once when asked, and leaves no timer behind", () => {
    const refs = hovering()
    refs.elapseDwell()
    expect([...refs.getAcquired()]).toEqual(["line"])
    expect(vi.getTimerCount()).toBe(0)
  })
})
