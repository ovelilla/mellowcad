"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Eye, EyeOff, Lock, LockOpen, Plus, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CadEngine, EngineNames, EngineState, LayerInfo } from "@/cad"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"

/** How long a second click on a selected name waits for a double-click. */
const RENAME_DELAY_MS = 400

/**
 * The Layer Properties Manager, a tab of the palette panel: the layer list
 * under its column headers in AutoCAD's order (Status, Name, On, Lock, Color,
 * Linetype, Lineweight; Freeze, Plot and the rest do not exist here), wider
 * than the panel and scrolled sideways as AutoCAD's docked manager is. A row
 * is selected with a click; Set Current — or a double-click on the row —
 * makes it the current layer, and New and Delete act beside it. A click on
 * the selected layer's name renames it.
 */
export function LayersControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.Layers")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    state.layers.find((layer) => layer.id === selectedId) ??
    state.layers.find((layer) => layer.id === state.currentLayerId) ??
    state.layers[0]
  const done = () => engine.focusSurface()
  const setCurrent = (id: string) => {
    engine.setCurrentLayer(id)
    done()
  }

  const isBase = selected.id === "0"
  const canDelete =
    !isBase &&
    selected.id !== state.currentLayerId &&
    selected.entityCount === 0
  const deleteReason = canDelete
    ? t("delete")
    : isBase
      ? t("deleteBase")
      : selected.entityCount > 0
        ? t("deleteInUse")
        : t("deleteCurrent")

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        role="toolbar"
        aria-label={t("title")}
        className="flex shrink-0 items-center gap-1 border-b border-border/60 p-1"
      >
        <ToolbarButton
          label={t("new")}
          onClick={() => {
            setSelectedId(engine.createLayer())
            done()
          }}
        >
          <Plus />
        </ToolbarButton>
        <ToolbarButton
          label={deleteReason}
          disabled={!canDelete}
          onClick={() => {
            engine.removeLayer(selected.id)
            setSelectedId(null)
            done()
          }}
        >
          <Trash2 />
        </ToolbarButton>
        <ToolbarButton
          label={t("setCurrent")}
          disabled={selected.id === state.currentLayerId}
          onClick={() => setCurrent(selected.id)}
        >
          <Check />
        </ToolbarButton>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <table
          aria-label={t("list")}
          className="w-max min-w-full border-separate border-spacing-0 text-xs"
        >
          <thead className="sticky top-0 z-10 bg-card text-muted-foreground">
            <tr>
              <Header className="w-8">{t("columns.status")}</Header>
              <Header className="w-32">{t("columns.name")}</Header>
              <Header className="w-9">{t("columns.on")}</Header>
              <Header className="w-9">{t("columns.lock")}</Header>
              <Header className="w-12">{t("columns.color")}</Header>
              <Header className="w-28">{t("columns.linetype")}</Header>
              <Header className="w-24">{t("columns.lineweight")}</Header>
              <Header className="w-14 text-end">{t("columns.objects")}</Header>
            </tr>
          </thead>
          <tbody>
            {state.layers.map((layer) => (
              <LayerRow
                key={layer.id}
                engine={engine}
                layer={layer}
                names={state.names}
                isCurrent={layer.id === state.currentLayerId}
                isSelected={layer.id === selected.id}
                onSelect={() => setSelectedId(layer.id)}
                onSetCurrent={() => setCurrent(layer.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Header({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border/60 px-1.5 py-1 text-start font-normal whitespace-nowrap",
        className
      )}
    >
      {children}
    </th>
  )
}

function ToolbarButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

function LayerRow({
  engine,
  layer,
  names,
  isCurrent,
  isSelected,
  onSelect,
  onSetCurrent,
}: {
  engine: CadEngine
  layer: LayerInfo
  names: EngineNames
  isCurrent: boolean
  isSelected: boolean
  onSelect: () => void
  onSetCurrent: () => void
}) {
  const t = useTranslations("Editor.Layers")
  const done = () => engine.focusSurface()

  return (
    <tr
      onClick={onSelect}
      onDoubleClick={(event) => {
        // A double-click on a control of the row is that control's.
        if ((event.target as HTMLElement).closest("button, input, label"))
          return
        onSetCurrent()
      }}
      aria-selected={isSelected}
      className={cn("h-8", isSelected ? "bg-accent" : "hover:bg-accent/40")}
    >
      <td className="px-1.5">
        {/* AutoCAD's check mark on the current layer, in the one accent. */}
        <Check
          aria-label={isCurrent ? t("current") : undefined}
          aria-hidden={!isCurrent}
          className={cn("size-4 text-active", !isCurrent && "invisible")}
        />
      </td>

      <td className="max-w-32 px-0.5">
        <NameField
          name={layer.name}
          editable={layer.id !== "0"}
          selected={isSelected}
          onSetCurrent={onSetCurrent}
          onRename={(name) => engine.updateLayer(layer.id, { name })}
        />
      </td>

      <td className="px-0.5">
        <IconToggle
          onLabel={t("on")}
          offLabel={t("off")}
          on={layer.visible}
          OnIcon={Eye}
          OffIcon={EyeOff}
          onToggle={() => {
            engine.updateLayer(layer.id, { visible: !layer.visible })
            done()
          }}
        />
      </td>

      <td className="px-0.5">
        <IconToggle
          onLabel={t("unlocked")}
          offLabel={t("locked")}
          on={!layer.locked}
          OnIcon={LockOpen}
          OffIcon={Lock}
          onToggle={() => {
            engine.updateLayer(layer.id, { locked: !layer.locked })
            done()
          }}
        />
      </td>

      <td className="px-1.5">
        <label
          className="relative inline-flex cursor-pointer align-middle"
          aria-label={t("colorLabel", { name: layer.name })}
          title={t("color")}
        >
          <LayerSwatch color={layer.color} />
          <input
            type="color"
            value={normalizeHex(layer.color)}
            onChange={(event) =>
              engine.updateLayer(layer.id, { color: event.target.value })
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </td>

      <td className="px-0.5">
        <LinetypeSelect
          value={layer.linetype}
          names={names}
          onValueChange={(linetype) => {
            engine.updateLayer(layer.id, { linetype })
            done()
          }}
          ariaLabel={t("linetypeLabel", { name: layer.name })}
          className="h-7 w-28 border-0 bg-transparent px-1.5 text-xs text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
        />
      </td>

      <td className="px-0.5">
        <LineweightSelect
          value={layer.lineweight}
          names={names}
          onValueChange={(lineweight) => {
            if (lineweight !== "ByLayer") {
              engine.updateLayer(layer.id, { lineweight })
              done()
            }
          }}
          ariaLabel={t("lineweightLabel", { name: layer.name })}
          className="h-7 w-24 border-0 bg-transparent px-1.5 text-xs text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
        />
      </td>

      <td className="px-1.5 text-end text-[11px] text-muted-foreground tabular-nums">
        {layer.entityCount}
      </td>
    </tr>
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
 * The layer's name. A click on the selected row's name renames it, after a
 * pause so that a double-click still sets the layer current; Enter or blur
 * commits, Escape reverts.
 */
function NameField({
  name,
  editable,
  selected,
  onSetCurrent,
  onRename,
}: {
  name: string
  editable: boolean
  selected: boolean
  onSetCurrent: () => void
  onRename: (name: string) => void
}) {
  const t = useTranslations("Editor.Layers")
  const [draft, setDraft] = useState(name)
  const [editing, setEditing] = useState(false)
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelPending = () => {
    if (pending.current !== null) clearTimeout(pending.current)
    pending.current = null
  }
  useEffect(() => cancelPending, [])

  if (editing) {
    return (
      <input
        autoFocus
        aria-label={t("renameLabel", { name })}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
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
        className="w-full min-w-0 rounded border border-ring bg-background px-1 py-0.5 text-xs outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      title={editable ? t("rename") : name}
      onClick={(event) => {
        // Only a click on a row already selected renames it.
        if (!editable || !selected || event.detail !== 1) return
        cancelPending()
        pending.current = setTimeout(() => {
          pending.current = null
          setDraft(name)
          setEditing(true)
        }, RENAME_DELAY_MS)
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        cancelPending()
        onSetCurrent()
      }}
      className="block w-full cursor-default truncate rounded px-1 py-0.5 text-start text-xs"
    >
      {name}
    </button>
  )
}

/** A small rounded colour chip with a subtle border for contrast on any bg. */
export function LayerSwatch({ color }: { color: string }) {
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
