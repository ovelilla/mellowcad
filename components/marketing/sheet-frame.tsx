const ROWS = ["A", "B", "C", "D", "E", "F"]
const COLUMNS = ["1", "2", "3", "4", "5", "6", "7", "8"]

/**
 * The drawing sheet's border with its zone references — letters down the
 * sides, numbers along the top and bottom — as on a standard sheet. Only on
 * screens wide enough to have a margin for it; purely decorative.
 */
export function SheetFrame() {
  const zone = "absolute grid font-mono text-[10px] leading-none text-fg-subtle"
  return (
    // The sheet's zones run 1–8 left to right, as on paper, in every language.
    <div aria-hidden="true" dir="ltr" className="sheet-frame">
      {(["top-0 -translate-y-full", "bottom-0 translate-y-full"] as const).map(
        (edge) => (
          <div
            key={edge}
            className={`${zone} inset-x-0 ${edge} grid-cols-8 py-1.5 text-center`}
          >
            {COLUMNS.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
        )
      )}
      {(
        ["inset-s-0 -translate-x-full", "inset-e-0 translate-x-full"] as const
      ).map((edge) => (
        <div
          key={edge}
          className={`${zone} inset-y-0 ${edge} grid-rows-6 place-items-center px-2`}
        >
          {ROWS.map((row) => (
            <span key={row}>{row}</span>
          ))}
        </div>
      ))}
    </div>
  )
}
