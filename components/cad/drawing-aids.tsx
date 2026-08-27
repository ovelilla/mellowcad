"use client"

import {
  ChevronUp,
  Compass,
  Crosshair,
  Grid3x3,
  Magnet,
  Minus,
  Plus,
  Ruler,
  Target,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CadEngine,
  EngineState,
  LengthUnit,
  LENGTH_UNITS,
  SnapModeType,
  SnapType,
} from "@/cad"

import { IconAction, Panel } from "./toolbar-primitives"
import { LineweightIcon, SelectionCyclingIcon, SnapModeIcon } from "./icons"

const SNAP_LABELS: Record<SnapType, string> = {
  [SnapType.Endpoint]: "Endpoint",
  [SnapType.Midpoint]: "Midpoint",
  [SnapType.Center]: "Center",
  [SnapType.Intersection]: "Intersection",
  [SnapType.ApparentIntersection]: "Apparent Intersection",
  [SnapType.Perpendicular]: "Perpendicular",
  [SnapType.Tangent]: "Tangent",
  [SnapType.Insertion]: "Insertion",
  [SnapType.Extension]: "Extension",
  [SnapType.Parallel]: "Parallel",
  [SnapType.Quadrant]: "Quadrant",
  [SnapType.Nearest]: "Nearest",
}

/** Snap types wired to a working provider today. The rest are shown disabled. */
const IMPLEMENTED_SNAPS = new Set<SnapType>([
  SnapType.Endpoint,
  SnapType.Midpoint,
  SnapType.Center,
  SnapType.Intersection,
  SnapType.ApparentIntersection,
  SnapType.Perpendicular,
  SnapType.Tangent,
  SnapType.Insertion,
  SnapType.Extension,
  SnapType.Parallel,
  SnapType.Quadrant,
  SnapType.Nearest,
])

/** Polar tracking angle presets, mirroring AutoCAD's increment list. */
const POLAR_ANGLES: readonly number[] = [90, 45, 30, 22.5, 18, 15, 10, 5]

/** How snap rounds the cursor: onto the lattice, or along alignment paths. */
const SNAP_MODE_TYPES: ReadonlyArray<{ type: SnapModeType; label: string }> = [
  { type: "grid", label: "Grid snap" },
  { type: "polar", label: "Polar snap" },
]

/** A labelled numeric setting; commits only finite, positive values. */
function SpacingField({
  label,
  value,
  ariaLabel,
  onCommit,
}: {
  label: string
  value: number
  ariaLabel: string
  onCommit: (value: number) => void
}) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0.001}
        step={1}
        value={value}
        aria-label={ariaLabel}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isFinite(next) && next > 0) onCommit(next)
        }}
        className="h-7 w-20 rounded-md border border-input bg-background px-2 text-right font-mono text-xs outline-none focus-visible:border-ring"
      />
    </div>
  )
}

/**
 * The drawing-aid toggles, placed on the status bar exactly like AutoCAD:
 * snap, grid, ortho, object-snap tracking and unit settings. Each is an icon
 * toggle; snap and units expose their options through a popover.
 */
export function DrawingAids({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  return (
    <TooltipProvider>
      <Panel>
        <div className="flex items-center">
          <IconAction
            icon={Magnet}
            label="Object snap"
            shortcut="F3"
            side="top"
            active={state.snapActive}
            onClick={() => engine.toggleSnap()}
          />
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Object snap settings"
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Object snap
              </p>
              <div className="grid grid-cols-2 gap-1">
                {(Object.values(SnapType) as SnapType[]).map((type) => {
                  const implemented = IMPLEMENTED_SNAPS.has(type)
                  const enabled = state.snapEnabled[type]
                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={!implemented}
                      onClick={() => engine.setSnapEnabled(type, !enabled)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-left text-[11px] transition-colors",
                        implemented
                          ? enabled
                            ? "border-primary/50 bg-primary/15 text-foreground"
                            : "border-border text-muted-foreground hover:bg-muted"
                          : "cursor-not-allowed border-dashed border-border/60 text-muted-foreground/40"
                      )}
                      title={
                        implemented
                          ? SNAP_LABELS[type]
                          : `${SNAP_LABELS[type]} (coming soon)`
                      }
                    >
                      {SNAP_LABELS[type]}
                    </button>
                  )
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Snap mode: toggle + spacing popover. Forces every picked point onto
            the snap increments, exactly like AutoCAD's SNAP. */}
        <div className="flex items-center">
          <IconAction
            icon={SnapModeIcon}
            label="Snap mode"
            shortcut="F9"
            side="top"
            active={state.snapModeActive}
            onClick={() => engine.toggleSnapMode()}
          />
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Snap settings"
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Snap
              </p>
              <div className="grid grid-cols-2 gap-1">
                {SNAP_MODE_TYPES.map(({ type, label }) => (
                  <Button
                    key={type}
                    size="xs"
                    variant={
                      state.snapModeType === type ? "default" : "outline"
                    }
                    onClick={() => engine.setSnapModeType(type)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
              {state.snapModeType === "grid" ? (
                <>
                  <SpacingField
                    label="Snap X"
                    value={state.snapSpacing.x}
                    ariaLabel="Snap X spacing"
                    onCommit={(value) =>
                      engine.setSnapSpacing(value, state.snapSpacing.y)
                    }
                  />
                  <SpacingField
                    label="Snap Y"
                    value={state.snapSpacing.y}
                    ariaLabel="Snap Y spacing"
                    onCommit={(value) =>
                      engine.setSnapSpacing(state.snapSpacing.x, value)
                    }
                  />
                </>
              ) : (
                <SpacingField
                  label="Polar distance"
                  value={state.snapPolarDistance}
                  ariaLabel="Polar snap distance"
                  onCommit={(value) => engine.setSnapPolarDistance(value)}
                />
              )}
            </PopoverContent>
          </Popover>
        </div>

        <IconAction
          icon={Grid3x3}
          label="Grid"
          shortcut="F7"
          side="top"
          active={state.gridVisible}
          onClick={() => engine.toggleGrid()}
        />
        <IconAction
          icon={Crosshair}
          label="Ortho"
          shortcut="F8"
          side="top"
          active={state.orthoActive}
          onClick={() => engine.toggleOrtho()}
        />

        {/* Polar tracking: toggle + angle-increment popover. Ortho and Polar
            are mutually exclusive, exactly like AutoCAD. */}
        <div className="flex items-center">
          <IconAction
            icon={Compass}
            label="Polar tracking"
            shortcut="F10"
            side="top"
            active={state.polarActive}
            onClick={() => engine.togglePolar()}
          />
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Polar tracking angle"
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-48">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Polar angle
              </p>
              <div className="grid grid-cols-4 gap-1">
                {POLAR_ANGLES.map((deg) => (
                  <Button
                    key={deg}
                    size="xs"
                    variant={
                      state.polarAngleStep === deg ? "default" : "outline"
                    }
                    onClick={() => {
                      engine.setPolarAngleStep(deg)
                      // Choosing an increment turns polar on, like AutoCAD.
                      if (!state.polarActive) engine.togglePolar()
                    }}
                  >
                    {deg}°
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <IconAction
          icon={Target}
          label="Object snap tracking"
          shortcut="F11"
          side="top"
          active={state.objectSnapTrackingActive}
          onClick={() => engine.toggleObjectSnapTracking()}
        />

        {/* Selection cycling: toggle + the display setting AutoCAD puts behind
            a right-click on this same status-bar button. */}
        <div className="flex items-center">
          <IconAction
            icon={SelectionCyclingIcon}
            label="Selection cycling"
            shortcut="F4"
            side="top"
            active={state.selectionCycling.active}
            onClick={() => engine.toggleSelectionCycling()}
          />
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label="Selection cycling settings"
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Selection cycling
              </p>
              <Button
                size="xs"
                variant={
                  state.selectionCycling.showList ? "default" : "outline"
                }
                className="w-full"
                onClick={() =>
                  engine.setSelectionCyclingList(
                    !state.selectionCycling.showList
                  )
                }
              >
                Display selection list box
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <IconAction
          icon={LineweightIcon}
          label="Show lineweight"
          side="top"
          active={state.lwDisplay}
          onClick={() => engine.toggleLineweightDisplay()}
        />

        <Popover>
          <PopoverTrigger
            render={
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 font-mono"
                aria-label="Document units and precision"
              >
                <Ruler />
                {state.documentUnit}
              </Button>
            }
          />
          <PopoverContent side="top" className="w-56">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Units
            </p>
            <div className="grid grid-cols-3 gap-1">
              {LENGTH_UNITS.map((unit: LengthUnit) => (
                <Button
                  key={unit}
                  size="xs"
                  variant={state.documentUnit === unit ? "default" : "outline"}
                  onClick={() => engine.setDocumentUnit(unit)}
                >
                  {unit}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Precision</span>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-xs"
                  variant="outline"
                  disabled={state.documentPrecision <= 0}
                  onClick={() =>
                    engine.setDocumentPrecision(state.documentPrecision - 1)
                  }
                >
                  <Minus />
                </Button>
                <span className="w-5 text-center font-mono text-xs text-foreground">
                  {state.documentPrecision}
                </span>
                <Button
                  size="icon-xs"
                  variant="outline"
                  disabled={state.documentPrecision >= 8}
                  onClick={() =>
                    engine.setDocumentPrecision(state.documentPrecision + 1)
                  }
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Linetype scale
              </span>
              <input
                type="number"
                min={0.01}
                step={0.1}
                value={state.ltScale}
                aria-label="Global linetype scale (LTSCALE)"
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (Number.isFinite(value) && value > 0) {
                    engine.setLtScale(value)
                  }
                }}
                className="h-7 w-20 rounded-md border border-input bg-background px-2 text-right font-mono text-xs outline-none focus-visible:border-ring"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Dimension scale
              </span>
              <input
                type="number"
                min={0.01}
                step={1}
                value={state.dimScale}
                aria-label="Overall dimension scale (DIMSCALE)"
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (Number.isFinite(value) && value > 0) {
                    engine.setDimScale(value)
                  }
                }}
                className="h-7 w-20 rounded-md border border-input bg-background px-2 text-right font-mono text-xs outline-none focus-visible:border-ring"
              />
            </div>
          </PopoverContent>
        </Popover>
      </Panel>
    </TooltipProvider>
  )
}
