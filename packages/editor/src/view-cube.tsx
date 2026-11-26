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
  ViewCubePart,
  ViewCubeSide,
  type ViewCubeFace,
} from "@mellowcad/engine"
import { type EditorState, useViewCubeDrag } from "@mellowcad/react"
import { Button } from "./ui/button"
import { usePortalContainer } from "./ui/portal-container"
import { cn } from "./utils"
import { useEditorText } from "./editor-text"
import { drawingFocus } from "./drawing-focus"
import type { PieceProps } from "./piece"

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

/**
 * What the cube shows only with the pointer on it (or the focus in it, or a
 * menu of it open): Home, the roll arrows, the triangles and the menu's
 * arrow. At rest AutoCAD draws the cube, its ring and the UCS menu alone
 * (docs/plans/autocad-ui.md, §2.5: desktop a-cube-crop, cube-hover).
 */
const ON_HOVER =
  "opacity-0 transition-opacity group-hover/cube:opacity-100 group-focus-within/cube:opacity-100 group-has-[[data-popup-open]]/cube:opacity-100 group-data-menu-open/cube:opacity-100"

/**
 * Hidden, those controls take no pointer, so a click on a grip under the
 * cube's corners (ZOOM Extents may frame one there) is the drawing's; they
 * take it as they show, the pointer already on the cube.
 */
const ON_HOVER_TARGET =
  "pointer-events-none! group-hover/cube:pointer-events-auto! group-focus-within/cube:pointer-events-auto! group-has-[[data-popup-open]]/cube:pointer-events-auto! group-data-menu-open/cube:pointer-events-auto!"

const MENU_POPUP =
  "min-w-44 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"

/**
 * AutoCAD's ViewCube, top right of the drawing: the compass round its foot
 * and the UCS menu below; Home at its top left, the roll arrows at its top
 * right and its menu's arrow at its bottom right, shown with the pointer on
 * it. The engine projects it
 * (`state.viewCube`); this only draws the zones it is given, highlights the
 * one under the cursor and hands back which was clicked or dragged.
 */
export function ViewCube({
  engine,
  state,
}: PieceProps): React.ReactElement | null {
  const portal = usePortalContainer()
  const t = useEditorText("ViewCube")
  // Destructured, as the hook asks (React Compiler's ref lint).
  const { surface, press, move, release, cancel } = useViewCubeDrag(engine)
  const [hovered, setHovered] = React.useState<ViewCubePart | null>(null)
  // Where the cube's menu opens: a right-click's point, or the arrow's box,
  // which it opens under in either direction.
  const [menuAt, setMenuAt] = React.useState<DOMRect | null>(null)
  const cube = state.viewCube

  const anchor = React.useMemo(
    () =>
      menuAt
        ? {
            getBoundingClientRect: () => menuAt,
          }
        : null,
    [menuAt]
  )

  if (!cube.visible) return null

  const faceName = (face: ViewCubeFace) => state.names.viewCubeFaces[face]
  const { compass } = cube

  // Only what is drawn takes the pointer — the buttons, the cube's zones, the
  // compass and the triangles — so a grip in the empty corners of the cube's
  // box can still be picked; ZOOM Extents may frame one there.
  return (
    <div
      // The cube's menu has no trigger in it to mark open: the root is.
      data-menu-open={menuAt !== null ? "" : undefined}
      className="group/cube flex w-36 flex-col items-center gap-1 opacity-50 transition-opacity focus-within:opacity-100 hover:opacity-100 has-[[data-popup-open]]:opacity-100 data-menu-open:opacity-100 [&_button]:pointer-events-auto"
      onContextMenu={(event) => {
        event.preventDefault()
        setMenuAt(new DOMRect(event.clientX, event.clientY, 0, 0))
      }}
    >
      {/* The cube is geometry: its faces, labels, compass, triangles and roll
          arrows are laid out on the screen and never mirror. Its box takes
          the pointer once the pointer is on the cube, so it can cross to
          Home or the menu's arrow in the corners; at rest it takes none. */}
      <div
        className="relative size-36 group-hover/cube:pointer-events-auto"
        dir="ltr"
      >
        <svg
          viewBox="0 0 1 1"
          className="size-full touch-none overflow-visible select-none"
          role="group"
          aria-label={t("label")}
          ref={surface}
          onPointerMove={move}
          onPointerUp={(event) => {
            setHovered(null)
            release(event)
          }}
          onPointerCancel={cancel}
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
            onPointerDown={press({ ring: true })}
          />

          {/* Under the cube: the compass lies round its foot. */}
          {compass.letters.map(({ letter, at }) => (
            <g
              key={letter}
              className="pointer-events-auto cursor-pointer"
              onPointerDown={press({ letter })}
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
                    onPointerDown={press({ part: zone.part })}
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
                className={cn(
                  "cursor-pointer fill-muted-foreground hover:fill-foreground",
                  ON_HOVER,
                  ON_HOVER_TARGET
                )}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  engine.viewCubeAdjacent(side)
                  engine.focusSurface()
                }}
              />
            ))}
        </svg>

        <Button
          size="icon-cube"
          variant="ghost"
          aria-label={t("home")}
          title={t("home")}
          className={cn("absolute top-0 left-0", ON_HOVER, ON_HOVER_TARGET)}
          onClick={() => {
            engine.viewCubeHome()
            engine.focusSurface()
          }}
        >
          <House />
        </Button>

        {cube.faceView && (
          <div className={cn("absolute top-0 right-0 flex gap-0.5", ON_HOVER)}>
            <Button
              size="icon-cube"
              variant="ghost"
              aria-label={t("rollCounterclockwise")}
              title={t("rollCounterclockwise")}
              className={ON_HOVER_TARGET}
              onClick={() => {
                engine.viewCubeRoll("counterclockwise")
                engine.focusSurface()
              }}
            >
              <RotateCcw />
            </Button>
            <Button
              size="icon-cube"
              variant="ghost"
              aria-label={t("rollClockwise")}
              title={t("rollClockwise")}
              className={ON_HOVER_TARGET}
              onClick={() => {
                engine.viewCubeRoll("clockwise")
                engine.focusSurface()
              }}
            >
              <RotateCw />
            </Button>
          </div>
        )}

        {/* The menu's arrow opens what a right-click on the cube opens. */}
        <Button
          size="icon-cube"
          variant="ghost"
          aria-label={t("label")}
          aria-haspopup="menu"
          className={cn("absolute right-0 bottom-0", ON_HOVER, ON_HOVER_TARGET)}
          onClick={(event) => {
            setMenuAt(event.currentTarget.getBoundingClientRect())
          }}
        >
          <ChevronDown />
        </Button>
      </div>

      <UcsMenu engine={engine} state={state} />

      <Menu.Root
        open={menuAt !== null}
        onOpenChange={(open) => {
          if (!open) setMenuAt(null)
        }}
      >
        <Menu.Portal container={portal}>
          <Menu.Positioner
            anchor={anchor}
            positionMethod="fixed"
            side="bottom"
            align="end"
            sideOffset={2}
            className="z-50"
          >
            <Menu.Popup
              className={MENU_POPUP}
              finalFocus={drawingFocus(engine)}
            >
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
  const portal = usePortalContainer()
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
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={4}
          className="z-50"
        >
          <Menu.Popup className={MENU_POPUP} finalFocus={drawingFocus(engine)}>
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
