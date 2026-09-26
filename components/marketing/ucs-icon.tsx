/**
 * The UCS icon in the engine's axis colours, in the sheet's lower-left corner
 * wherever the origin is — AutoCAD's UCSICON set to Noorigin.
 */
export function UcsIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 left-3 size-10"
    >
      <path d="M8 32H33" stroke="var(--cad-axis-x)" strokeWidth="1.5" />
      <path d="M34 32l-6-2.5v5z" fill="var(--cad-axis-x)" />
      <path d="M8 32V7" stroke="var(--cad-axis-y)" strokeWidth="1.5" />
      <path d="M8 6l-2.5 6h5z" fill="var(--cad-axis-y)" />
      <text
        x="29"
        y="27"
        fill="var(--cad-axis-x)"
        fontSize="8"
        fontFamily="var(--font-mono)"
      >
        X
      </text>
      <text
        x="12"
        y="10"
        fill="var(--cad-axis-y)"
        fontSize="8"
        fontFamily="var(--font-mono)"
      >
        Y
      </text>
    </svg>
  )
}
