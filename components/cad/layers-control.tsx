"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Plus,
  Trash2,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useDirection } from "@/components/ui/direction"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CadEngine, EngineNames, LayerInfo } from "@/cad"
import type { EditorState } from "@/hooks/useCadEngine"
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
 *
 * At the panel's 280 px half the columns are out of sight, and a scroll bar
 * alone goes unnoticed (macOS hides it, a wheel only scrolls down), so the
 * sideways scroll shows itself: Name stays frozen, as AutoCAD's Freeze Column
 * keeps it, the columns snap against it, a chevron in the header row marks
 * each side that has more columns (the end's cut column fades out), and
 * the list is only as tall as its rows, so the scroll bar sits under the last
 * one rather than at the foot of the panel.
 */
export function LayersControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useTranslations("Editor.Layers")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { scrollRef, frozenRef, before, after, gutters, track, page } =
    useSidewaysScroll()
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

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative flex min-h-0 flex-col">
          <div
            ref={scrollRef}
            onScroll={track}
            data-scrolled={before || undefined}
            // Columns snap against the frozen Name, never cut in half by it.
            style={{ scrollPaddingInlineStart: gutters.frozen }}
            className="group/scroll min-h-0 snap-x snap-mandatory overflow-auto"
          >
            <table
              aria-label={t("list")}
              className="w-max min-w-full border-separate border-spacing-0"
            >
              <thead className="text-muted-foreground">
                <tr>
                  <Header className="w-8">{t("columns.status")}</Header>
                  <Header
                    ref={frozenRef}
                    className={cn("w-32", FROZEN_HEADER, FROZEN_EDGE)}
                  >
                    {t("columns.name")}
                  </Header>
                  <Header className="w-9">{t("columns.on")}</Header>
                  <Header className="w-9">{t("columns.lock")}</Header>
                  <Header className="w-12">{t("columns.color")}</Header>
                  <Header className="w-28">{t("columns.linetype")}</Header>
                  <Header className="w-24">{t("columns.lineweight")}</Header>
                  <Header className="w-14 text-end">
                    {t("columns.objects")}
                  </Header>
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
          {before && (
            // On the frozen Name's header, whose end is empty: past it the
            // chevron would cover the first visible column's name.
            <ScrollCue
              side="start"
              label={t("previousColumns")}
              style={{
                insetInlineStart: Math.max(0, gutters.frozen - CUE_SIZE),
              }}
              onClick={() => {
                page(-1)
                done()
              }}
            />
          )}
          {after && (
            <>
              <div
                aria-hidden
                style={{ insetInlineEnd: gutters.end, bottom: gutters.bottom }}
                className="pointer-events-none absolute top-0 z-30 w-8 bg-linear-to-l from-card rtl:bg-linear-to-r"
              />
              <ScrollCue
                side="end"
                label={t("nextColumns")}
                style={{ insetInlineEnd: gutters.end }}
                onClick={() => {
                  page(1)
                  done()
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** The frozen Name column, opaque so the others scroll beneath it. */
const FROZEN_HEADER = "start-0 z-20 snap-align-none"
const FROZEN_CELL = "sticky start-0 z-1"

/** The frozen column's edge, shadowed once a column has gone beneath it. */
const FROZEN_EDGE =
  "group-data-scrolled/scroll:shadow-[6px_0_6px_-6px_rgb(0_0_0/0.45)] rtl:group-data-scrolled/scroll:shadow-[-6px_0_6px_-6px_rgb(0_0_0/0.45)]"

/**
 * Tracks the list's sideways scroll: whether columns lie before the visible
 * ones (gone under the frozen Name) or after them, and the widths the cues
 * are placed by — the frozen column's and the scroll bars'.
 */
function useSidewaysScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const frozenRef = useRef<HTMLTableCellElement>(null)
  const forward = useDirection() === "rtl" ? -1 : 1
  const [before, setBefore] = useState(false)
  const [after, setAfter] = useState(false)
  const [gutters, setGutters] = useState({ frozen: 0, end: 0, bottom: 0 })

  const track = () => {
    const el = scrollRef.current
    if (!el) return
    // Negative in a right-to-left page.
    const offset = Math.abs(el.scrollLeft)
    setBefore(offset > 0)
    setAfter(offset + el.clientWidth < el.scrollWidth - 1)
  }

  /** Scrolls a page of columns towards the end (1) or the start (-1). */
  const page = (towards: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const visible = el.clientWidth - (frozenRef.current?.offsetWidth ?? 0)
    el.scrollBy({ left: towards * forward * visible, behavior: "smooth" })
  }

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const measure = () => {
      track()
      const frozen = frozenRef.current?.offsetWidth ?? 0
      const end = el.offsetWidth - el.clientWidth
      const bottom = el.offsetHeight - el.clientHeight
      setGutters((g) =>
        g.frozen === frozen && g.end === end && g.bottom === bottom
          ? g
          : { frozen, end, bottom }
      )
    }
    measure()
    // The table resizes with its rows and the language, the list with the
    // panel; either can bring a scroll bar or take it away.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [])

  return { scrollRef, frozenRef, before, after, gutters, track, page }
}

/** The chevrons' side, in px: an icon button, as tall as the header row. */
const CUE_SIZE = 28

/** A chevron in the header row that scrolls a page of columns its way. */
function ScrollCue({
  side,
  label,
  style,
  onClick,
}: {
  side: "start" | "end"
  label: string
  style: React.CSSProperties
  onClick: () => void
}) {
  const Chevron = side === "end" ? ChevronRight : ChevronLeft
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            size="icon"
            variant="ghost"
            aria-label={label}
            onClick={onClick}
            style={style}
            className="absolute top-0 z-30 bg-card text-muted-foreground hover:text-foreground"
          >
            <Chevron className="rtl:-scale-x-100" />
          </Button>
        }
      />
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}

function Header({
  ref,
  className,
  children,
}: {
  ref?: React.Ref<HTMLTableCellElement>
  className?: string
  children: React.ReactNode
}) {
  return (
    <th
      ref={ref}
      scope="col"
      className={cn(
        "sticky top-0 z-10 h-7 snap-start border-b border-border/60 bg-card px-1.5 text-start text-ui whitespace-nowrap",
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
            size="icon"
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
  // The row's tint, painted on the frozen cell's opaque ground: the row's own
  // would show through the columns scrolled beneath it.
  const frozen = cn(
    FROZEN_CELL,
    isSelected
      ? "bg-accent"
      : "bg-card group-hover/row:bg-linear-to-r group-hover/row:from-accent/40 group-hover/row:to-accent/40"
  )

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
      className={cn(
        "group/row h-7",
        isSelected ? "bg-accent" : "hover:bg-accent/40"
      )}
    >
      <td className="px-1.5">
        {/* AutoCAD's check mark on the current layer, in the one accent. */}
        <Check
          aria-label={isCurrent ? t("current") : undefined}
          aria-hidden={!isCurrent}
          className={cn("size-4 text-active", !isCurrent && "invisible")}
        />
      </td>

      <td className={cn("max-w-32 px-0.5", frozen, FROZEN_EDGE)}>
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
          className="w-28 border-0 bg-transparent px-1.5 text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
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
          className="w-24 border-0 bg-transparent px-1.5 text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent"
        />
      </td>

      <td className="px-1.5 text-end font-mono text-muted-foreground tabular-nums">
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
            size="icon"
            variant="ghost"
            aria-label={on ? onLabel : offLabel}
            onClick={onToggle}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              !on && "text-faint-foreground"
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
        className="w-full min-w-0 rounded border border-ring bg-background px-1 py-0.5 outline-none"
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
      className="block w-full cursor-default truncate rounded px-1 py-0.5 text-start"
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
