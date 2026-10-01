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
import { useTranslations } from "next-intl"

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
import { DecimalInput } from "./decimal-input"
import { LineweightIcon, SelectionCyclingIcon, SnapModeIcon } from "./icons"

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
const SNAP_MODE_TYPES = [
  { type: "grid", label: "gridSnap" },
  { type: "polar", label: "polarSnap" },
] as const satisfies ReadonlyArray<{ type: SnapModeType; label: string }>

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
      <DecimalInput
        live
        min={0.001}
        step={1}
        value={value}
        aria-label={ariaLabel}
        valid={(next) => next > 0}
        onCommit={onCommit}
        className="h-7 w-20 rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:border-ring"
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
  const t = useTranslations("Editor.DrawingAids")
  return (
    <TooltipProvider>
      <Panel>
        <div className="flex items-center">
          <IconAction
            icon={Magnet}
            label={t("objectSnap")}
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
                  aria-label={t("objectSnapSettings")}
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t("objectSnap")}
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
                        "rounded-md border px-2 py-1 text-start text-[11px] transition-colors",
                        implemented
                          ? enabled
                            ? "border-active/40 bg-active/15 text-active"
                            : "border-border text-muted-foreground hover:bg-muted"
                          : "cursor-not-allowed border-dashed border-border/60 text-muted-foreground/40"
                      )}
                      title={
                        implemented
                          ? state.names.snaps[type]
                          : t("comingSoon", { name: state.names.snaps[type] })
                      }
                    >
                      {state.names.snaps[type]}
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
            label={t("snapMode")}
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
                  aria-label={t("snapSettings")}
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t("snap")}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {SNAP_MODE_TYPES.map(({ type, label }) => (
                  <Button
                    key={type}
                    size="xs"
                    variant={state.snapModeType === type ? "active" : "outline"}
                    onClick={() => engine.setSnapModeType(type)}
                  >
                    {t(label)}
                  </Button>
                ))}
              </div>
              {state.snapModeType === "grid" ? (
                <>
                  <SpacingField
                    label={t("snapX")}
                    value={state.snapSpacing.x}
                    ariaLabel={t("snapXSpacing")}
                    onCommit={(value) =>
                      engine.setSnapSpacing(value, state.snapSpacing.y)
                    }
                  />
                  <SpacingField
                    label={t("snapY")}
                    value={state.snapSpacing.y}
                    ariaLabel={t("snapYSpacing")}
                    onCommit={(value) =>
                      engine.setSnapSpacing(state.snapSpacing.x, value)
                    }
                  />
                </>
              ) : (
                <SpacingField
                  label={t("polarDistance")}
                  value={state.snapPolarDistance}
                  ariaLabel={t("polarSnapDistance")}
                  onCommit={(value) => engine.setSnapPolarDistance(value)}
                />
              )}
            </PopoverContent>
          </Popover>
        </div>

        <IconAction
          icon={Grid3x3}
          label={t("grid")}
          shortcut="F7"
          side="top"
          active={state.gridVisible}
          onClick={() => engine.toggleGrid()}
        />
        <IconAction
          icon={Crosshair}
          label={t("ortho")}
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
            label={t("polarTracking")}
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
                  aria-label={t("polarTrackingAngle")}
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-48">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t("polarAngle")}
              </p>
              <div className="grid grid-cols-4 gap-1">
                {POLAR_ANGLES.map((deg) => (
                  <Button
                    key={deg}
                    size="xs"
                    variant={
                      state.polarAngleStep === deg ? "active" : "outline"
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
          label={t("objectSnapTracking")}
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
            label={t("selectionCycling")}
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
                  aria-label={t("selectionCyclingSettings")}
                >
                  <ChevronUp />
                </Button>
              }
            />
            <PopoverContent side="top" className="w-56">
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                {t("selectionCycling")}
              </p>
              <Button
                size="xs"
                variant={state.selectionCycling.showList ? "active" : "outline"}
                className="w-full"
                onClick={() =>
                  engine.setSelectionCyclingList(
                    !state.selectionCycling.showList
                  )
                }
              >
                {t("selectionList")}
              </Button>
            </PopoverContent>
          </Popover>
        </div>

        <IconAction
          icon={LineweightIcon}
          label={t("showLineweight")}
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
                aria-label={t("unitsSettings")}
              >
                <Ruler />
                {state.documentUnit}
              </Button>
            }
          />
          <PopoverContent side="top" className="w-56">
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {t("units")}
            </p>
            <div className="grid grid-cols-3 gap-1">
              {LENGTH_UNITS.map((unit: LengthUnit) => (
                <Button
                  key={unit}
                  size="xs"
                  variant={state.documentUnit === unit ? "active" : "outline"}
                  onClick={() => engine.setDocumentUnit(unit)}
                >
                  {unit}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("precision")}
              </span>
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
                {t("linetypeScale")}
              </span>
              <DecimalInput
                live
                min={0.01}
                step={0.1}
                value={state.ltScale}
                aria-label={t("linetypeScaleLabel")}
                valid={(next) => next > 0}
                onCommit={(value) => engine.setLtScale(value)}
                className="h-7 w-20 rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:border-ring"
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {t("dimensionScale")}
              </span>
              <DecimalInput
                live
                min={0.01}
                step={1}
                value={state.dimScale}
                aria-label={t("dimensionScaleLabel")}
                valid={(next) => next > 0}
                onCommit={(value) => engine.setDimScale(value)}
                className="h-7 w-20 rounded-md border border-input bg-background px-2 font-mono text-xs outline-none focus-visible:border-ring"
              />
            </div>
          </PopoverContent>
        </Popover>
      </Panel>
    </TooltipProvider>
  )
}
