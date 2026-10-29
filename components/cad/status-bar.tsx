"use client"

import { useState, type ReactNode } from "react"
import { Menu } from "@base-ui/react/menu"
import {
  CheckIcon,
  ChevronUp,
  Compass,
  Crosshair,
  Grid3x3,
  Magnet,
  Maximize,
  MenuIcon,
  Target,
  type LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CadEngine, SnapModeType, SnapType } from "@mellowcad/engine"
import { useEngineSelector, type EditorState } from "@/hooks/useCadEngine"
import {
  readHiddenStatusItems,
  rememberHiddenStatusItems,
  STATUS_BAR_ITEMS,
  type StatusBarItem,
} from "@/lib/status-bar-layout"

import { IconAction } from "./toolbar-primitives"
import { DecimalInput } from "./decimal-input"
import { LineweightIcon, SelectionCyclingIcon, SnapModeIcon } from "./icons"

/** POLARANG's increments as the desktop's Polar ▾ offers them (workspace/d01-m). */
const POLAR_ANGLES: readonly number[] = [90, 45, 30, 22.5, 18, 15, 10, 5]

/**
 * An increment as the menu writes it, its first four multiples rounded:
 * `90, 180, 270, 360...`, 22.5 as `23, 45, 68, 90...` (desktop
 * workspace/d01-m, e01-4). WHY plain: AutoCAD bolds the first number, and the
 * type roles have no bold figure (`ui.md`).
 */
function polarAngleLabel(step: number): string {
  return `${[1, 2, 3, 4].map((n) => Math.round(n * step)).join(", ")}...`
}

/**
 * How snap rounds the cursor: along alignment paths, or onto the lattice, in
 * the order of the desktop's Snap ▾ (workspace/d01-m, e01-3).
 */
const SNAP_MODE_TYPES = [
  { type: "polar", label: "polarSnap" },
  { type: "grid", label: "gridSnap" },
] as const satisfies ReadonlyArray<{ type: SnapModeType; label: string }>

const MENU_POPUP =
  "min-w-48 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
const MENU_ITEM =
  "relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-disabled:text-faint-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
const CHECK = <CheckIcon className="absolute inset-e-2 size-4 text-primary" />

/**
 * AutoCAD's status bar, in the order of its 2026 reference: the coordinates,
 * MODEL, the drafting modes, Units, Clean Screen and, right-most,
 * Customization, which picks what shows. A mode with settings has a half
 * button of an arrow beside it, and a right-click on the mode opens the same
 * menu.
 */
export function StatusBar({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useTranslations("Editor.StatusBar")
  const keys = useTranslations("Editor.Keys")
  // Only rendered once the engine exists, in the browser: the choice is read
  // here, and the bar's height never depends on it.
  const [hidden, setHidden] = useState(readHiddenStatusItems)
  const shows = (item: StatusBarItem) => !hidden.has(item)
  const setShown = (item: StatusBarItem, shown: boolean) => {
    const next = new Set(hidden)
    if (shown) next.delete(item)
    else next.add(item)
    setHidden(next)
    rememberHiddenStatusItems(next)
  }

  const names: Record<StatusBarItem, string> = {
    coordinates: t("coordinates"),
    model: t("modelSpace"),
    grid: t("grid"),
    snap: t("snapMode"),
    ortho: t("ortho"),
    polar: t("polarTracking"),
    otrack: t("objectSnapTracking"),
    osnap: t("objectSnap"),
    lineweight: t("showLineweight"),
    cycling: t("selectionCycling"),
    units: t("units"),
    cleanScreen: t("cleanScreen"),
  }

  return (
    <TooltipProvider>
      {shows("coordinates") && (
        <Coordinates
          engine={engine}
          precision={state.documentPrecision}
          label={names.coordinates}
        />
      )}

      <div className="ms-auto flex shrink-0 items-center gap-0.5">
        {/* WHY a label: in model space the button shows the last layout,
            and there are no layouts here. */}
        {shows("model") && (
          <span title={names.model} className="px-2 text-muted-foreground">
            {t("model")}
          </span>
        )}
        {shows("grid") && (
          <IconAction
            icon={Grid3x3}
            label={names.grid}
            shortcut="F7"
            side="top"
            active={state.gridVisible}
            onClick={() => engine.toggleGrid()}
          />
        )}
        {shows("snap") && (
          <SnapMode engine={engine} state={state} label={names.snap} />
        )}
        {shows("ortho") && (
          <IconAction
            icon={Crosshair}
            label={names.ortho}
            shortcut="F8"
            side="top"
            active={state.orthoActive}
            onClick={() => engine.toggleOrtho()}
          />
        )}
        {shows("polar") && (
          <MenuMode
            icon={Compass}
            label={names.polar}
            shortcut="F10"
            settings={t("polarTrackingAngle")}
            active={state.polarActive}
            onToggle={() => engine.togglePolar()}
          >
            <Menu.RadioGroup
              value={state.polarAngleStep}
              // Choosing an increment turns polar on, silently, like AutoCAD.
              onValueChange={(deg: number) => engine.choosePolarAngle(deg)}
            >
              {POLAR_ANGLES.map((deg) => (
                <Menu.RadioItem
                  key={deg}
                  value={deg}
                  closeOnClick
                  className={`${MENU_ITEM} font-mono`}
                >
                  {polarAngleLabel(deg)}
                  <Menu.RadioItemIndicator>{CHECK}</Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </MenuMode>
        )}
        {shows("otrack") && (
          <IconAction
            icon={Target}
            label={names.otrack}
            shortcut="F11"
            side="top"
            active={state.objectSnapTrackingActive}
            onClick={() => engine.toggleObjectSnapTracking()}
          />
        )}
        {shows("osnap") && (
          <MenuMode
            icon={Magnet}
            label={names.osnap}
            shortcut="F3"
            settings={t("objectSnapSettings")}
            active={state.snapActive}
            onToggle={() => engine.toggleSnap()}
          >
            {(Object.values(SnapType) as SnapType[]).map((type) => {
              const name = state.names.snaps[type]
              return (
                <Menu.CheckboxItem
                  key={type}
                  checked={state.snapEnabled[type]}
                  closeOnClick={false}
                  onCheckedChange={(checked) =>
                    engine.setSnapEnabled(type, checked)
                  }
                  className={MENU_ITEM}
                >
                  {name}
                  <Menu.CheckboxItemIndicator>
                    {CHECK}
                  </Menu.CheckboxItemIndicator>
                </Menu.CheckboxItem>
              )
            })}
          </MenuMode>
        )}
        {shows("lineweight") && (
          <IconAction
            icon={LineweightIcon}
            label={names.lineweight}
            side="top"
            active={state.lwDisplay}
            onClick={() => engine.toggleLineweightDisplay()}
          />
        )}
        {shows("cycling") && (
          <MenuMode
            icon={SelectionCyclingIcon}
            label={names.cycling}
            shortcut="F4"
            settings={t("selectionCyclingSettings")}
            active={state.selectionCycling.active}
            onToggle={() => engine.toggleSelectionCycling()}
          >
            <Menu.CheckboxItem
              checked={state.selectionCycling.showList}
              closeOnClick={false}
              onCheckedChange={(checked) =>
                engine.setSelectionCyclingList(checked)
              }
              className={MENU_ITEM}
            >
              {t("selectionList")}
              <Menu.CheckboxItemIndicator>{CHECK}</Menu.CheckboxItemIndicator>
            </Menu.CheckboxItem>
          </MenuMode>
        )}
        {/* WHY the unit and the dialog: AutoCAD's Units shows the length
            format and a right-click changes it; Decimal is the only format
            here, so it shows what a unit is (INSUNITS) and opens UNITS. */}
        {shows("units") && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  // A whole width: the modes left of it stay on whole pixels.
                  className="w-9 font-mono"
                  aria-label={names.units}
                  onClick={() => engine.openDrawingUnits()}
                >
                  {state.documentUnit}
                </Button>
              }
            />
            <TooltipContent side="top">{names.units}</TooltipContent>
          </Tooltip>
        )}
        {shows("cleanScreen") && (
          <IconAction
            icon={Maximize}
            label={names.cleanScreen}
            shortcut={keys("cleanScreen")}
            side="top"
            active={state.cleanScreen.active}
            onClick={() => engine.toggleCleanScreen()}
          />
        )}

        <Menu.Root>
          <Tooltip>
            <TooltipTrigger
              render={
                <Menu.Trigger
                  render={
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={t("customization")}
                    >
                      <MenuIcon />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent side="top">{t("customization")}</TooltipContent>
          </Tooltip>
          <MenuPopup>
            {STATUS_BAR_ITEMS.map((item) => (
              <Menu.CheckboxItem
                key={item}
                checked={shows(item)}
                closeOnClick={false}
                onCheckedChange={(checked) => setShown(item, checked)}
                className={MENU_ITEM}
              >
                {names[item]}
                <Menu.CheckboxItemIndicator>{CHECK}</Menu.CheckboxItemIndicator>
              </Menu.CheckboxItem>
            ))}
          </MenuPopup>
        </Menu.Root>
      </div>
    </TooltipProvider>
  )
}

/**
 * The cursor's coordinates in the current UCS, as AutoCAD writes them
 * (`1.5000, 2.0039, 0.0000`), at the drawing's precision. A technical value:
 * it reads left to right in every page.
 */
function Coordinates({
  engine,
  precision,
  label,
}: {
  engine: CadEngine
  precision: number
  label: string
}) {
  const cursor = useEngineSelector(engine, (state) => state.cursorUcs)
  const value = (n: number) => n.toFixed(precision)
  return (
    <span
      dir="ltr"
      title={label}
      className="truncate px-2 font-mono text-foreground tabular-nums"
    >
      {cursor
        ? `${value(cursor.x)}, ${value(cursor.y)}, ${value(cursor.z)}`
        : "—"}
    </span>
  )
}

/** A status-bar menu, above the bar. */
function MenuPopup({ children }: { children: ReactNode }) {
  return (
    <Menu.Portal>
      <Menu.Positioner side="top" align="end" sideOffset={6} className="z-50">
        <Menu.Popup className={MENU_POPUP}>{children}</Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  )
}

/** A mode with its settings arrow, the toggle and a half button attached. */
function MenuMode({
  icon,
  label,
  shortcut,
  settings,
  active,
  onToggle,
  children,
}: {
  icon: LucideIcon
  label: string
  shortcut: string
  settings: string
  active: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center">
      <IconAction
        icon={icon}
        label={label}
        shortcut={shortcut}
        side="top"
        className="rounded-e-none"
        active={active}
        onClick={onToggle}
        onContextMenu={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      />
      <Menu.Root open={open} onOpenChange={setOpen}>
        <Menu.Trigger
          render={
            <Button
              size="icon-flyout"
              variant="ghost"
              className="rounded-s-none"
              aria-label={settings}
            >
              <ChevronUp />
            </Button>
          }
        />
        <MenuPopup>{children}</MenuPopup>
      </Menu.Root>
    </div>
  )
}

/**
 * Snap mode, whose settings are its spacing: a popover rather than a menu,
 * since they are typed (AutoCAD keeps them in the Drafting Settings dialog,
 * which does not exist here).
 */
function SnapMode({
  engine,
  state,
  label,
}: {
  engine: CadEngine
  state: EditorState
  label: string
}) {
  const t = useTranslations("Editor.StatusBar")
  const [open, setOpen] = useState(false)
  return (
    <div className="flex items-center">
      <IconAction
        icon={SnapModeIcon}
        label={label}
        shortcut="F9"
        side="top"
        className="rounded-e-none"
        active={state.snapModeActive}
        onClick={() => engine.toggleSnapMode()}
        onContextMenu={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              size="icon-flyout"
              variant="ghost"
              className="rounded-s-none"
              aria-label={t("snapSettings")}
            >
              <ChevronUp />
            </Button>
          }
        />
        <PopoverContent side="top" align="end" sideOffset={6} className="w-56">
          <p className="mb-2 text-title text-muted-foreground">{t("snap")}</p>
          <div className="grid grid-cols-2 gap-1">
            {SNAP_MODE_TYPES.map(({ type, label }) => (
              <Button
                key={type}
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
              takesZero
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}

/**
 * A labelled numeric setting; commits only finite, positive values, or 0
 * where it means something (POLARDIST: Snap X's spacing).
 */
function SpacingField({
  label,
  value,
  ariaLabel,
  onCommit,
  takesZero = false,
}: {
  label: string
  value: number
  ariaLabel: string
  onCommit: (value: number) => void
  takesZero?: boolean
}) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <DecimalInput
        live
        min={takesZero ? 0 : 0.001}
        step={1}
        value={value}
        aria-label={ariaLabel}
        valid={(next) => next > 0 || (takesZero && next === 0)}
        onCommit={onCommit}
        className="h-7 w-20 rounded-md border border-input bg-background px-2 font-mono outline-none focus-visible:border-ring"
      />
    </div>
  )
}
