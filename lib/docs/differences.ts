/**
 * The sections of the docs' "Differences from AutoCAD" page, in its order,
 * each tied to where the repository already says why: a `WHY` at the code or
 * the command's coverage entry. `docs:check` finds every quote in its file
 * (whitespace aside) and the same sections in every language, so a deviation
 * lifted, or its reason rewritten, fails the page until it is told.
 */

export interface DifferenceSource {
  readonly file: string
  /** Words of that file, as written there. */
  readonly quote: string
}

export const DIFFERENCES: readonly {
  readonly id: string
  readonly sources: readonly DifferenceSource[]
}[] = [
  {
    id: "one-drawing",
    sources: [
      {
        file: "docs/coverage/clipboard-and-files.md",
        quote:
          "AutoCAD opens the new drawing in a tab of its own and keeps the old one open; there is one drawing here",
      },
    ],
  },
  {
    id: "saving",
    sources: [
      {
        file: "docs/coverage/clipboard-and-files.md",
        quote:
          "SAVEAS and SAVE write the same download as QSAVE, since a browser download always names the file",
      },
      {
        file: "docs/coverage/clipboard-and-files.md",
        quote: "transparent autosave behind the `DrawingStore` port (this device's localStorage)",
      },
    ],
  },
  {
    id: "browser-keys",
    sources: [
      {
        file: "cad/application/CadRuntime.ts",
        quote: "AutoCAD toggles it with Ctrl+W, which browsers reserve",
      },
      {
        file: "docs/coverage/clipboard-and-files.md",
        quote: "Ctrl+N (the browser keeps it for a new window)",
      },
    ],
  },
  {
    id: "dynamic-input",
    sources: [
      {
        file: "cad/application/CadRuntime.ts",
        quote: "F12 is not taken: dynamic input cannot be turned off here",
      },
    ],
  },
  {
    id: "model-space",
    sources: [
      {
        file: "docs/coverage/properties.md",
        quote:
          "LWDISPLAY starts on, where AutoCAD's starts at 0 (p204) — WHY: with no layouts or plotting here, the screen is the only place a lineweight shows",
      },
      {
        file: "docs/coverage/workspace.md",
        quote:
          'WHY MODEL is a label: in model space the button "display[s] the most recently accessed layout", and there are no layouts',
      },
    ],
  },
  {
    id: "dialogs",
    sources: [
      {
        file: "docs/coverage/properties.md",
        quote: "-COLOR, which COLOR runs too (WHY: the Select Color dialog does not exist)",
      },
      {
        file: "docs/coverage/properties.md",
        quote:
          "-LWEIGHT, which LWEIGHT runs too (WHY: the Lineweight Settings dialog does not exist)",
      },
      {
        file: "docs/coverage/properties.md",
        quote: "-LINETYPE, which LINETYPE runs too (WHY: the Linetype Manager does not exist)",
      },
      {
        file: "docs/coverage/dimensions.md",
        quote: "DIMSTYLE opens the Styles palette's dimension table instead",
      },
      {
        file: "docs/coverage/dimensions.md",
        quote: "STYLE opens the Styles palette's text table instead",
      },
    ],
  },
  {
    id: "linetypes",
    sources: [
      {
        file: "docs/coverage/properties.md",
        quote:
          "all six loaded in every drawing, where AutoCAD's new drawing holds Continuous alone (p221) — WHY (at `LINETYPES`): there is no Load option or Linetype Manager to load one",
      },
    ],
  },
  {
    id: "coordinates",
    sources: [
      {
        file: "docs/coverage/drafting-aids.md",
        quote: "WHY shown by default: AutoCAD has hidden them since 2015",
      },
    ],
  },
  {
    id: "arabic",
    sources: [
      { file: "docs/coverage/arabic.md", quote: "there is no Arabic AutoCAD" },
      {
        file: "docs/coverage/arabic.md",
        quote:
          "a Ctrl shortcut is read by its physical key (`e.code`) when the layout sends a letter that is not latin",
      },
    ],
  },
]

/** The page whose sections these are. */
export const DIFFERENCES_PAGE = "differences"
