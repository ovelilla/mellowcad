"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronDown,
  House,
  RotateCcw,
  RotateCw,
} from "lucide-react"

import {
  CadEngine,
  CompassLetter,
  ViewCubePart,
  ViewCubeSide,
  type ViewCubeFace,
} from "@mellowcad/engine"
import type { EditorState } from "@/hooks/useCadEngine"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEditorText } from "./editor-text"

/** Below this many pixels a press on the cube is a click, beyond it a drag. */
const DRAG_THRESHOLD_PX = 3

/** The cube's box (`size-36`): its SVG draws in a 0–1 box scaled to it. */
const CUBE_PX = 144

/**
 * The compass letters at the title role's 12 px, in the box's units, on a
 * disc wide enough for a W. The faces' names are not: they are drawn on the
 * cube, sized to fit its face as the drawing's text is to the drawing — a
 * name of eight letters (`SUPERIOR`) still reaches 12 px on a plan view's face.
 */
const COMPASS_LETTER = 12 / CUBE_PX
const COMPASS_DISC = 9 / CUBE_PX
const FACE_NAME = 1.35

/** The triangles round a face view, pointing at the cube, in the 0–1 box the engine draws it in. */
const TRIANGLES: readonly { side: ViewCubeSide; points: string }[] = [
  { side: "up", points: "0.5,0.235 0.46,0.18 0.54,0.18" },
  { side: "down", points: "0.5,0.765 0.46,0.82 0.54,0.82" },
  { side: "left", points: "0.235,0.5 0.18,0.46 0.18,0.54" },
  { side: "right", points: "0.765,0.5 0.82,0.46 0.82,0.54" },
]

const MENU_ITEM =
  "relative flex cursor-default items-center rounded-sm py-1.5 pe-8 ps-2 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"

const MENU_POPUP =
  "min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"

interface Press {
  readonly start: { x: number; y: number }
  readonly part: ViewCubePart | null
  readonly letter: CompassLetter | null
  readonly ring: boolean
  dragging: boolean
}

/**
 * AutoCAD's ViewCube, top right of the drawing: Home above, the compass round
 * its foot and the UCS menu below. The engine projects it
 * (`state.viewCube`); this only draws the zones it is given, highlights the
 * one under the cursor and hands back which was clicked or dragged.
 */
export function ViewCube({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useEditorText("ViewCube")
  const [hovered, setHovered] = React.useState<ViewCubePart | null>(null)
  const [menuAt, setMenuAt] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const press = React.useRef<Press | null>(null)
  const cube = state.viewCube

  const anchor = React.useMemo(
    () =>
      menuAt
        ? {
            getBoundingClientRect: () => new DOMRect(menuAt.x, menuAt.y, 0, 0),
          }
        : null,
    [menuAt]
  )

  if (!cube.visible) return null

  const begin = (
    event: React.PointerEvent<SVGElement>,
    target: Omit<Press, "start" | "dragging">
  ) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
    press.current = {
      start: { x: event.clientX, y: event.clientY },
      dragging: false,
      ...target,
    }
  }

  const move = (event: React.PointerEvent<SVGSVGElement>) => {
    const current = press.current
    if (!current) return
    const at = { x: event.clientX, y: event.clientY }
    if (!current.dragging) {
      const moved = Math.hypot(at.x - current.start.x, at.y - current.start.y)
      if (moved < DRAG_THRESHOLD_PX) return
      current.dragging = true
      engine.viewCubeDrag("start", current.start, current.ring)
    }
    engine.viewCubeDrag("move", at, current.ring)
  }

  const end = (event: React.PointerEvent<SVGSVGElement>) => {
    const current = press.current
    press.current = null
    if (!current) return
    if (current.dragging) {
      engine.viewCubeDrag(
        "end",
        { x: event.clientX, y: event.clientY },
        current.ring
      )
    } else if (current.part !== null) {
      setHovered(null)
      engine.viewCubePick(current.part)
    } else if (current.letter !== null) {
      engine.compassPick(current.letter)
    }
  }

  const faceName = (face: ViewCubeFace) => state.names.viewCubeFaces[face]
  const { compass } = cube

  // Only what is drawn takes the pointer — the buttons, the cube's zones, the
  // compass and the triangles — so a grip in the empty corners of the cube's
  // box can still be picked; ZOOM Extents may frame one there.
  return (
    <div
      className="flex w-36 flex-col items-center gap-1 opacity-50 transition-opacity hover:opacity-100 has-[[data-popup-open]]:opacity-100 [&_button]:pointer-events-auto"
      onContextMenu={(event) => {
        event.preventDefault()
        setMenuAt({ x: event.clientX, y: event.clientY })
      }}
    >
      <Button
        size="icon-cube"
        variant="ghost"
        aria-label={t("home")}
        title={t("home")}
        onClick={() => engine.viewCubeHome()}
      >
        <House />
      </Button>

      {/* The cube is geometry: its faces, labels, compass, triangles and roll
          arrows are laid out on the screen and never mirror. */}
      <div className="relative size-36" dir="ltr">
        <svg
          viewBox="0 0 1 1"
          className="size-full touch-none overflow-visible select-none"
          role="group"
          aria-label={t("label")}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={() => {
            press.current = null
          }}
          onPointerLeave={() => setHovered(null)}
        >
          <ellipse
            cx={compass.center.x}
            cy={compass.center.y}
            rx={compass.rx}
            ry={compass.ry}
            transform={`rotate(${compass.rotation} ${compass.center.x} ${compass.center.y})`}
            className="fill-none stroke-muted-foreground"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx={compass.center.x}
            cy={compass.center.y}
            rx={compass.rx}
            ry={Math.max(compass.ry, 0.01)}
            transform={`rotate(${compass.rotation} ${compass.center.x} ${compass.center.y})`}
            className="cursor-grab fill-none stroke-transparent"
            strokeWidth={0.06}
            pointerEvents="stroke"
            onPointerDown={(event) =>
              begin(event, { part: null, letter: null, ring: true })
            }
          />

          {/* Under the cube: the compass lies round its foot. */}
          {compass.letters.map(({ letter, at }) => (
            <g
              key={letter}
              className="pointer-events-auto cursor-pointer"
              onPointerDown={(event) =>
                begin(event, { part: null, letter, ring: true })
              }
            >
              <circle
                cx={at.x}
                cy={at.y}
                r={COMPASS_DISC}
                className="fill-card stroke-muted-foreground"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={at.x}
                y={at.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={COMPASS_LETTER}
                // The title role's weight: a class would size it too.
                fontWeight={600}
                className="pointer-events-none fill-foreground"
              >
                {state.names.compass[letter]}
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
                  points={corners.map((p) => `${p.x},${p.y}`).join(" ")}
                  className="fill-card stroke-muted-foreground"
                  strokeWidth={1}
                  strokeDasharray={cube.current === null ? "3 2" : undefined}
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
                  x={0.5}
                  y={0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(
                    0.17,
                    FACE_NAME / faceName(face.face).length
                  )}
                  fontWeight={600}
                  className="pointer-events-none fill-foreground"
                >
                  {faceName(face.face)}
                </text>
                {face.zones.map((zone, index) => (
                  <polygon
                    key={index}
                    data-part={zone.part}
                    points={zone.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    className={cn(
                      "pointer-events-auto cursor-pointer fill-transparent",
                      hovered === zone.part && "fill-sky-400/35"
                    )}
                    onPointerEnter={() => setHovered(zone.part)}
                    onPointerDown={(event) =>
                      begin(event, {
                        part: zone.part,
                        letter: null,
                        ring: false,
                      })
                    }
                  />
                ))}
              </g>
            )
          })}

          {cube.faceView &&
            TRIANGLES.map(({ side, points }) => (
              <polygon
                key={side}
                points={points}
                role="button"
                aria-label={t(`adjacent.${side}` as "adjacent.up")}
                className="pointer-events-auto cursor-pointer fill-muted-foreground hover:fill-foreground"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => engine.viewCubeAdjacent(side)}
              />
            ))}
        </svg>

        {cube.faceView && (
          <div className="absolute top-0 right-0 flex gap-0.5">
            <Button
              size="icon-cube"
              variant="ghost"
              aria-label={t("rollCounterclockwise")}
              title={t("rollCounterclockwise")}
              onClick={() => engine.viewCubeRoll("counterclockwise")}
            >
              <RotateCcw />
            </Button>
            <Button
              size="icon-cube"
              variant="ghost"
              aria-label={t("rollClockwise")}
              title={t("rollClockwise")}
              onClick={() => engine.viewCubeRoll("clockwise")}
            >
              <RotateCw />
            </Button>
          </div>
        )}
      </div>

      <UcsMenu engine={engine} state={state} />

      <Menu.Root
        open={menuAt !== null}
        onOpenChange={(open) => {
          if (!open) setMenuAt(null)
        }}
      >
        <Menu.Portal>
          <Menu.Positioner
            anchor={anchor}
            positionMethod="fixed"
            side="bottom"
            align="end"
            sideOffset={2}
            className="z-50"
          >
            <Menu.Popup className={MENU_POPUP}>
              <Menu.Item
                className={MENU_ITEM}
                onClick={() => engine.viewCubeHome()}
              >
                {t("home")}
              </Menu.Item>
              <Menu.Item className={MENU_ITEM}>
                {t("parallel")}
                <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center text-primary">
                  <CheckIcon className="size-4" />
                </span>
              </Menu.Item>
              <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
              <Menu.Item
                className={MENU_ITEM}
                onClick={() => engine.setHomeFromCurrentView()}
              >
                {t("setHome")}
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  )
}

/**
 * The UCS menu under the cube: the current UCS, then WCS · the saved ones and
 * an unnamed current one · New UCS (desktop ucs/d03-1, d03-5).
 */
function UcsMenu({ engine, state }: { engine: CadEngine; state: EditorState }) {
  const t = useEditorText("ViewCube")
  const { world, name, named } = state.ucsMenu
  const unnamed = !world && name === null
  const label = world ? t("wcs") : (name ?? t("unnamed"))
  const check = (
    <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center text-primary">
      <CheckIcon className="size-4" />
    </span>
  )

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button size="cube" variant="ghost">
            {label}
            <ChevronDown className="text-muted-foreground" />
          </Button>
        }
      />
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50"
        >
          <Menu.Popup className={MENU_POPUP}>
            <Menu.Item
              className={MENU_ITEM}
              onClick={() => engine.restoreUcs(null)}
            >
              {t("wcs")}
              {world && check}
            </Menu.Item>
            {(named.length > 0 || unnamed) && (
              <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            )}
            {named.map((entry) => (
              <Menu.Item
                key={entry}
                className={MENU_ITEM}
                onClick={() => engine.restoreUcs(entry)}
              >
                {entry}
                {!world && name === entry && check}
              </Menu.Item>
            ))}
            {/* The current UCS, unsaved or orthographic, listed after the
                saved ones, checked; choosing it changes nothing (desktop
                ucs/d03-5, d03-9). */}
            {unnamed && (
              <Menu.Item className={MENU_ITEM}>
                {t("unnamed")}
                {check}
              </Menu.Item>
            )}
            <Menu.Separator className="-mx-1 my-1 h-px bg-border" />
            <Menu.Item
              className={MENU_ITEM}
              onClick={() => engine.runCommand("_UCS")}
            >
              {t("newUcs")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
