import { describe, expect, it } from "vitest"

import { cn } from "./utils"

describe("cn", () => {
  it("lets an inline-axis class replace the logical sides it covers", () => {
    expect(cn("ps-2.5 pe-2", "px-1.5")).toBe("px-1.5")
    expect(cn("ms-2 me-3", "mx-auto")).toBe("mx-auto")
    expect(cn("inset-s-0 inset-e-2", "inset-x-4")).toBe("inset-x-4")
  })

  it("keeps a type-scale role beside a text colour", () => {
    expect(cn("text-ui", "text-muted-foreground")).toBe(
      "text-ui text-muted-foreground"
    )
  })
})
