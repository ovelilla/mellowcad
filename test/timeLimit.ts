import fc from "fast-check"

/** How long a property may run before it fails: a slow one is a design smell. */
export const PROPERTY_TIME_LIMIT = 10_000

/**
 * A property building solids in every run (booleans, cuts, hidden lines),
 * past the 9 s its slowest seeds took under the gate, under the 60 s the
 * least of their tests allows.
 */
export const SOLIDS_TIME_LIMIT = 45_000

let limit = PROPERTY_TIME_LIMIT

/**
 * fast-check's time limit, failing what it interrupts, read afresh at each
 * `fc.assert` so {@link withTimeLimit} can set one property's. Installed
 * for every worker by `setup.ts`.
 */
export const propertyTimeLimit: fc.Plugin<unknown> = (index, store) =>
  fc.interruptAfterTimeLimit(limit, { failOnInterrupt: true })(index, store)

/**
 * Runs `assert` under a time limit of its own. WHY: the clock is the
 * machine's, and the commit gate runs the suite with coverage, every worker
 * at once, where a property building solids costs several times what it does
 * alone, in its own CPU as much as its wall time: a run of solid booleans
 * taking 2 s alone was interrupted past 10 s there (seed -1661248351), and
 * its slowest seeds took 9. A property whose runs are that heavy states what
 * it may take, below its test's own timeout so the seed is still reported;
 * its runs stay as many.
 */
export function withTimeLimit<T>(ms: number, assert: () => T): T {
  const before = limit
  limit = ms
  try {
    return assert()
  } finally {
    limit = before
  }
}
