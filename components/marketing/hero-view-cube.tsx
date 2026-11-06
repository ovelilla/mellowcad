import type { EngineNames, ViewCubeFace, ViewCubeUi } from "@mellowcad/engine"

/** A thousandth of the cube's box: finer than a pixel of it, and short in the page. */
const n = (value: number) => Math.round(value * 1000) / 1000

/** A face's name fills its face, as the editor's cube sizes it (`view-cube.tsx`). */
const FACE_NAME = 1.35
const LETTER = 0.085
const LETTER_DISC = 0.065

/**
 * The ViewCube in the hero's frame, as the editor draws it at the end of the
 * session: the faces the engine projected (`EngineState.viewCube`), their
 * names and the compass letters in the engine's words. Drawn on the server,
 * never the editor's component, which is a client island; a picture of the
 * cube, so nothing in it can be pressed.
 */
export function HeroViewCube({
  cube,
  names,
  className,
}: {
  cube: ViewCubeUi
  names: EngineNames
  className?: string
}) {
  const faceName = (face: ViewCubeFace) => names.viewCubeFaces[face]
  const { compass } = cube
  const ring = `rotate(${n(compass.rotation)} ${n(compass.center.x)} ${n(compass.center.y)})`
  return (
    // The cube is geometry: it never mirrors.
    <svg
      viewBox="0 0 1 1"
      aria-hidden="true"
      direction="ltr"
      className={className}
    >
      <ellipse
        cx={n(compass.center.x)}
        cy={n(compass.center.y)}
        rx={n(compass.rx)}
        ry={n(compass.ry)}
        transform={ring}
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {compass.letters.map(({ letter, at }) => (
        <g key={letter}>
          <circle
            cx={n(at.x)}
            cy={n(at.y)}
            r={LETTER_DISC}
            fill="var(--bg-raised)"
            stroke="var(--text-muted)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={n(at.x)}
            y={n(at.y)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={LETTER}
            fontWeight={600}
            fill="var(--text)"
          >
            {names.compass[letter]}
          </text>
        </g>
      ))}
      {cube.faces.map((face) => {
        const corners = [
          face.zones[0].points[0],
          face.zones[6].points[1],
          face.zones[8].points[2],
          face.zones[2].points[3],
        ]
        const [a, b, c, d, e, f] = face.label
        return (
          <g key={face.face}>
            <polygon
              points={corners.map((p) => `${n(p.x)},${n(p.y)}`).join(" ")}
              fill="var(--bg-raised)"
              stroke="var(--text-muted)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
            <text
              transform={`matrix(${[a, b, c, d, e, f].map(n).join(" ")})`}
              x={0.5}
              y={0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={n(
                Math.min(0.17, FACE_NAME / faceName(face.face).length)
              )}
              fontWeight={600}
              fill="var(--text)"
            >
              {faceName(face.face)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
