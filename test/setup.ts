import fc from "fast-check"
import "./matchers"

/**
 * Global test setup. Loaded once per worker before any test file.
 */

fc.configureGlobal({
  // Enough cases to explore the geometry kernel's edge cases without slowing
  // the inner development loop; CI gets a wider sweep.
  numRuns: process.env.CI ? 500 : 100,
  // Print the whole shrinking path so a failure arrives with the minimal
  // counter-example *and* the seed needed to reproduce it verbatim.
  verbose: fc.VerbosityLevel.VeryVerbose,
  // Property tests must stay pure and fast; a slow one is a design smell.
  interruptAfterTimeLimit: 10_000,
  markInterruptAsFailure: true,
})
