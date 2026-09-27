"use client"

import { useState } from "react"
import {
  Check,
  Eye,
  EyeOff,
  Layers as LayersIcon,
  Lock,
  LockOpen,
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
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
import { CadEngine, EngineNames, EngineState, LayerInfo } from "@/cad"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"

/**
 * The Layer Properties Manager, modelled on AutoCAD's: a compact panel listing
 * every layer's colour, on/off, lock state and entity count, with the current
 * layer (where new geometry is drawn) highlighted. Rendered as a popover off a
 * trigger that doubles as the current-layer readout, like AutoCAD's ribbon.
 */
export function LayersControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const current =
    state.layers.find((layer) => layer.id === state.currentLayerId) ??
    state.layers[0]

  return (
    <TooltipProvider>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              size="lg"
              variant="ghost"
              aria-label="Layers"
              className="pointer-events-auto max-w-48 gap-4 rounded-lg bg-card/90 backdrop-blur aria-expanded:bg-card/90"
            >
              <LayersIcon className="shrink-0" />
              <ColorSwatch color={current.color} />
              <span className="truncate text-xs">{current.name}</span>
            </Button>
          }
        />
        <PopoverContent
          side="bottom"
          align="start"
          className="w-128 overflow-hidden border-none p-0"
        >
          <div className="flex items-center justify-between p-2 pl-3">
            <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              Layers
            </p>
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs font-normal"
              onClick={() => engine.createLayer()}
            >
              <Plus className="size-3.5" />
              New
            </Button>
          </div>

          {state.selectionCount > 0 && (
            <div className="px-3 pb-2 text-xs text-muted-foreground">
              {state.selectionCount} selected → click a layer name to move it
              there
            </div>
          )}

          <div className="max-h-[60svh] overflow-y-auto">
            {state.layers.map((layer) => (
              <LayerRow
                key={layer.id}
                engine={engine}
                layer={layer}
                names={state.names}
                isCurrent={layer.id === state.currentLayerId}
                hasSelection={state.selectionCount > 0}
                canDelete={
                  layer.id !== "0" &&
                  layer.id !== state.currentLayerId &&
                  layer.entityCount === 0
                }
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}

function LayerRow({
  engine,
  layer,
  names,
  isCurrent,
  hasSelection,
  canDelete,
}: {
  engine: CadEngine
  layer: LayerInfo
  names: EngineNames
  isCurrent: boolean
  hasSelection: boolean
  canDelete: boolean
}) {
  const isBaseLayer = layer.id === "0"

  return (
    <div
      className={cn(
        "group/row flex items-center gap-1 p-1",
        isCurrent && "bg-accent"
      )}
    >
      {/* The set-current toggle shows a check only on the current layer; other
          rows reveal a faint check on hover to hint they are clickable. */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={`Set ${layer.name} as current layer`}
              aria-pressed={isCurrent}
              onClick={() => engine.setCurrentLayer(layer.id)}
            >
              <Check
                strokeWidth={2}
                className={cn(
                  isCurrent
                    ? "text-primary"
                    : "text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-50"
                )}
              />
            </Button>
          }
        />
        <TooltipContent side="top">
          {isCurrent ? "Current layer" : "Set as current"}
        </TooltipContent>
      </Tooltip>

      <label
        className="relative inline-flex cursor-pointer"
        aria-label={`${layer.name} colour`}
        title="Layer colour"
      >
        <ColorSwatch color={layer.color} />
        <input
          type="color"
          value={normalizeHex(layer.color)}
          onChange={(event) =>
            engine.updateLayer(layer.id, { color: event.target.value })
          }
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>

      <NameField
        name={layer.name}
        editable={!isBaseLayer}
        highlightAsTarget={hasSelection}
        onRename={(name) => engine.updateLayer(layer.id, { name })}
        onAssignSelection={
          hasSelection ? () => engine.setSelectionLayer(layer.id) : undefined
        }
      />

      <LinetypeSelect
        value={layer.linetype}
        names={names}
        onValueChange={(linetype) => engine.updateLayer(layer.id, { linetype })}
        ariaLabel={`${layer.name} linetype`}
        className="h-8 w-28 shrink-0 border-0 bg-transparent px-1.5 text-xs text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
      />

      <LineweightSelect
        value={layer.lineweight}
        names={names}
        onValueChange={(lineweight) => {
          if (lineweight !== "ByLayer") {
            engine.updateLayer(layer.id, { lineweight })
          }
        }}
        ariaLabel={`${layer.name} lineweight`}
        className="h-8 w-24 shrink-0 border-0 bg-transparent px-1.5 text-xs text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
      />

      <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {layer.entityCount}
      </span>

      <IconToggle
        onLabel="On"
        offLabel="Off"
        on={layer.visible}
        OnIcon={Eye}
        OffIcon={EyeOff}
        onToggle={() =>
          engine.updateLayer(layer.id, { visible: !layer.visible })
        }
      />

      <IconToggle
        onLabel="Unlocked"
        offLabel="Locked"
        on={!layer.locked}
        OnIcon={LockOpen}
        OffIcon={Lock}
        onToggle={() => engine.updateLayer(layer.id, { locked: !layer.locked })}
      />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!canDelete}
              aria-label={`Delete layer ${layer.name}`}
              onClick={() => engine.removeLayer(layer.id)}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 strokeWidth={1.75} />
            </Button>
          }
        />
        <TooltipContent side="top">
          {canDelete
            ? "Delete layer"
            : isBaseLayer
              ? "Layer 0 cannot be deleted"
              : layer.entityCount > 0
                ? "Layer is in use"
                : "Cannot delete the current layer"}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

/** An on/off icon toggle used for visibility and lock. */
function IconToggle({
  on,
  OnIcon,
  OffIcon,
  onLabel,
  offLabel,
  onToggle,
}: {
  on: boolean
  OnIcon: typeof Eye
  OffIcon: typeof Eye
  onLabel: string
  offLabel: string
  onToggle: () => void
}) {
  const Icon = on ? OnIcon : OffIcon
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={on ? onLabel : offLabel}
            onClick={onToggle}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              !on && "text-muted-foreground/40"
            )}
          >
            <Icon strokeWidth={1.75} />
          </Button>
        }
      />
      <TooltipContent side="top">{on ? onLabel : offLabel}</TooltipContent>
    </Tooltip>
  )
}

/**
 * Inline-editable layer name. Commits on Enter or blur; Escape reverts. When a
 * selection exists the name doubles as a "move selection to this layer" badge.
 */
function NameField({
  name,
  editable,
  highlightAsTarget,
  onRename,
  onAssignSelection,
}: {
  name: string
  editable: boolean
  highlightAsTarget: boolean
  onRename: (name: string) => void
  onAssignSelection?: () => void
}) {
  const [draft, setDraft] = useState(name)
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          setEditing(false)
          const trimmed = draft.trim()
          if (trimmed && trimmed !== name) onRename(trimmed)
          else setDraft(name)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          else if (event.key === "Escape") {
            setDraft(name)
            setEditing(false)
          }
        }}
        className="min-w-0 flex-1 rounded border border-primary/50 bg-background px-1 py-0.5 text-xs outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (onAssignSelection) onAssignSelection()
      }}
      onDoubleClick={() => {
        if (editable) {
          setDraft(name)
          setEditing(true)
        }
      }}
      title={
        onAssignSelection
          ? "Move selected objects to this layer (double-click to rename)"
          : editable
            ? "Double-click to rename"
            : name
      }
      className={cn(
        "min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-xs",
        highlightAsTarget
          ? "cursor-pointer hover:bg-primary/15"
          : "cursor-default"
      )}
    >
      {name}
    </button>
  )
}

/** A small rounded colour chip with a subtle border for contrast on any bg. */
function ColorSwatch({ color }: { color: string }) {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded-sm border border-white/25 shadow-inner"
      style={{ backgroundColor: color }}
    />
  )
}

/** Coerces arbitrary colour strings to a `#rrggbb` value the picker accepts. */
function normalizeHex(color: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#e2e8f0"
}
