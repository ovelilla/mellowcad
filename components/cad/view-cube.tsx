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
import { useTranslations } from "next-intl"

import {
  CadEngine,
  CompassLetter,
  EngineState,
  ViewCubePart,
  ViewCubeSide,
} from "@/cad"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Below this many pixels a press on the cube is a click, beyond it a drag. */
const DRAG_THRESHOLD_PX = 3

/** The triangles round a face view, pointing at the cube, in the 0–1 box the engine draws it in. */
const TRIANGLES: readonly { side: ViewCubeSide; points: string }[] = [
  { side: "up", points: "0.5,0.235 0.46,0.18 0.54,0.18" },
  { side: "down", points: "0.5,0.765 0.46,0.82 0.54,0.82" },
  { side: "left", points: "0.235,0.5 0.18,0.46 0.18,0.54" },
  { side: "right", points: "0.765,0.5 0.82,0.46 0.82,0.54" },
]

const MENU_ITEM =
  "relative flex cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"

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
  state: EngineState
}) {
  const t = useTranslations("Editor.ViewCube")
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

  const faceName = (face: string) => t(`faces.${face}` as "faces.top")
  const { compass } = cube

  return (
    <div
      className="pointer-events-auto flex w-36 flex-col items-center gap-1 opacity-50 transition-opacity hover:opacity-100 has-[[data-popup-open]]:opacity-100"
      onContextMenu={(event) => {
        event.preventDefault()
        setMenuAt({ x: event.clientX, y: event.clientY })
      }}
    >
      <Button
        size="icon-xs"
        variant="ghost"
        aria-label={t("home")}
        title={t("home")}
        onClick={() => engine.viewCubeHome()}
      >
        <House />
      </Button>

      <div className="relative size-36">
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
              className="cursor-pointer"
              onPointerDown={(event) =>
                begin(event, { part: null, letter, ring: true })
              }
            >
              <circle
                cx={at.x}
                cy={at.y}
                r={0.05}
                className="fill-card stroke-muted-foreground"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={at.x}
                y={at.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={0.065}
                className="pointer-events-none fill-foreground font-semibold"
              >
                {t(`compass.${letter}` as "compass.N")}
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
                  fontSize={Math.min(0.17, 1.25 / faceName(face.face).length)}
                  className="pointer-events-none fill-foreground font-semibold"
                >
                  {faceName(face.face)}
                </text>
                {face.zones.map((zone, index) => (
                  <polygon
                    key={index}
                    data-part={zone.part}
                    points={zone.points.map((p) => `${p.x},${p.y}`).join(" ")}
                    className={cn(
                      "cursor-pointer fill-transparent",
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
                className="cursor-pointer fill-muted-foreground hover:fill-foreground"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => engine.viewCubeAdjacent(side)}
              />
            ))}
        </svg>

        {cube.faceView && (
          <div className="absolute top-0 right-0 flex gap-0.5">
            <Button
              size="icon-xs"
              variant="ghost"
              aria-label={t("rollCounterclockwise")}
              title={t("rollCounterclockwise")}
              onClick={() => engine.viewCubeRoll("counterclockwise")}
            >
              <RotateCcw />
            </Button>
            <Button
              size="icon-xs"
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
                <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-primary">
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

/** The UCS menu under the cube: the current UCS, the WCS, the saved ones and New UCS. */
function UcsMenu({ engine, state }: { engine: CadEngine; state: EngineState }) {
  const t = useTranslations("Editor.ViewCube")
  const { world, name, named } = state.ucsMenu
  const label = world ? t("wcs") : (name ?? t("unnamed"))
  const check = (
    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center text-primary">
      <CheckIcon className="size-4" />
    </span>
  )

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          <Button size="xs" variant="ghost">
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
