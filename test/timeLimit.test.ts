import fc from "fast-check"
import { describe, expect, it } from "vitest"

import { withTimeLimit } from "./timeLimit"

const busy = (ms: number) => {
  const until = performance.now() + ms
  while (performance.now() < until);
}

// 10 runs of 30 ms each: 300 ms.
const slow = () =>
  fc.assert(
    fc.property(fc.integer(), () => busy(30)),
    { numRuns: 10 }
  )

describe("a property's time limit", () => {
  // Through the plugin setup.ts installs: this module and setup's are one.
  it("interrupts a property past its own, and fails it with its seed", () => {
    expect(() => withTimeLimit(100, slow)).toThrow(
      /Property interrupted after \d+ tests\n\{ seed: -?\d+ \}/
    )
  })

  it("lets a property run longer under a longer one, and puts the last back", () => {
    withTimeLimit(100, () => {
      withTimeLimit(5_000, slow)
      expect(slow).toThrow(/Property interrupted/)
    })
  })
})
