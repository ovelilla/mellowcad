"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  ArrowRight,
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

import { cn } from "./utils"
import { Button } from "./ui/button"
import { useDirection } from "./ui/direction"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"
import { usePortalContainer } from "./ui/portal-container"
import {
  CadEngine,
  DEFAULT_LAYER_ID,
  EngineNames,
  INVALID_LAYER_NAME_CHARACTERS,
  LayerInfo,
  LayerNameRefusal,
  STANDARD_COLORS,
} from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"
import { useEditorText } from "./editor-text"

/**
 * How long a second click on a selected name waits for a double-click, which
 * still makes the layer current. F2 renames too, while the list has focus.
 */
const RENAME_DELAY_MS = 400

/**
 * The Layer Properties Manager, a tab of the palette panel: the layer list
 * under its column headers in AutoCAD's order (Status, Name, On, Lock, Color,
 * Linetype, Lineweight; Freeze, Plot and the rest do not exist here), wider
 * than the panel and scrolled sideways as AutoCAD's docked manager is. A row
 * is selected with a click; Set Current — or a double-click on the row —
 * makes it the current layer, and New and Delete act beside it. A click on
 * the selected layer's name, or F2, renames it. The rows are sorted by name
 * (the engine's order), and what AutoCAD refuses or asks is one of its task
 * dialogs (`LayerDialog`).
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
  const t = useEditorText("Layers")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<LayerDialogKind | null>(null)
  const { scrollRef, frozenRef, before, after, gutters, track, page } =
    useSidewaysScroll()
  const selected =
    state.layers.find((layer) => layer.id === selectedId) ??
    state.layers.find((layer) => layer.id === state.currentLayerId) ??
    state.layers[0]
  const done = () => engine.focusSurface()
  const setCurrent = (id: string) => {
    engine.setCurrentLayer(id, "manager")
    done()
  }
  // Layer 0's name is refused before an edit opens, as AutoCAD's manager
  // answers the attempt (desktop d04-16).
  const startRename = (layer: LayerInfo) => {
    setSelectedId(layer.id)
    if (layer.id === DEFAULT_LAYER_ID) setDialog({ kind: "base" })
    else setRenamingId(layer.id)
  }
  const rename = (layer: LayerInfo, name: string | null) => {
    setRenamingId(null)
    if (name === null) return done()
    const refusal = engine.updateLayer(layer.id, { name })
    if (refusal === null) done()
    else if (refusal === "inUse") setDialog({ kind: refusal, name })
    else setDialog({ kind: refusal })
  }

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
            // Its name opens for editing, as AutoCAD's New Layer leaves it.
            const id = engine.newLayer(selected.id)
            setSelectedId(id)
            setRenamingId(id)
          }}
        >
          <Plus />
        </ToolbarButton>
        {/* Never disabled: AutoCAD answers a refused delete with its task
            dialog (desktop d04-6). */}
        <ToolbarButton
          label={t("delete")}
          onClick={() => {
            if (engine.removeLayer(selected.id)) {
              setSelectedId(null)
              done()
            } else setDialog({ kind: "notDeleted" })
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
          {/* Focusable, so a click on a row gives the list the keyboard and
              F2 renames there, as the help says; F2 elsewhere is the
              history. Stopped here, it never reaches the engine's listener
              on the document. */}
          <div
            ref={scrollRef}
            tabIndex={-1}
            onKeyDown={(event) => {
              if (event.key !== "F2") return
              event.preventDefault()
              event.stopPropagation()
              if (renamingId === null) startRename(selected)
            }}
            onScroll={track}
            data-scrolled={before || undefined}
            // Columns snap against the frozen Name, never cut in half by it.
            style={{ scrollPaddingInlineStart: gutters.frozen }}
            className="group/scroll min-h-0 snap-x snap-mandatory overflow-auto outline-none"
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
                  <Header className="w-24">{t("columns.color")}</Header>
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
                    renaming={layer.id === renamingId}
                    onSelect={() => setSelectedId(layer.id)}
                    onSetCurrent={() => setCurrent(layer.id)}
                    onStartRename={() => startRename(layer)}
                    onRename={(name) => rename(layer, name)}
                    onTurnOffCurrent={() =>
                      setDialog({ kind: "currentOff", id: layer.id })
                    }
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
      <LayerDialog
        dialog={dialog}
        onTurnOff={(id) => engine.updateLayer(id, { visible: false })}
        onClose={() => setDialog(null)}
        onClosed={done}
      />
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
  renaming,
  onSelect,
  onSetCurrent,
  onStartRename,
  onRename,
  onTurnOffCurrent,
}: {
  engine: CadEngine
  layer: LayerInfo
  names: EngineNames
  isCurrent: boolean
  isSelected: boolean
  renaming: boolean
  onSelect: () => void
  onSetCurrent: () => void
  onStartRename: () => void
  onRename: (name: string | null) => void
  /** Turning the current layer off asks first (desktop d04-7). */
  onTurnOffCurrent: () => void
}) {
  const t = useEditorText("Layers")
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
          editing={renaming}
          selected={isSelected}
          onSetCurrent={onSetCurrent}
          onStartRename={onStartRename}
          onRename={onRename}
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
            if (isCurrent && layer.visible) {
              onTurnOffCurrent()
              return
            }
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
        {/* The colour's name beside its swatch for an index colour, as
            AutoCAD's manager writes it (`white`, `red`; desktop d04-1, es
            e02-1); another colour shows its swatch alone. */}
        <label
          className="relative flex cursor-pointer items-center gap-1.5"
          aria-label={t("colorLabel", { name: layer.name })}
          title={t("color")}
        >
          <LayerSwatch color={layer.color} />
          <span className="truncate">{colorName(layer.color, names)}</span>
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
 * The layer's name. A click on the selected row's name asks to rename it,
 * after a pause so that a double-click still sets the layer current; while
 * `editing`, Enter or blur commits, Escape gives up (`onRename(null)`).
 */
function NameField({
  name,
  editing,
  selected,
  onSetCurrent,
  onStartRename,
  onRename,
}: {
  name: string
  editing: boolean
  selected: boolean
  onSetCurrent: () => void
  onStartRename: () => void
  onRename: (name: string | null) => void
}) {
  const t = useEditorText("Layers")
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Escape unmounts the field: its blur must not commit what was typed.
  const cancelled = useRef(false)

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
        defaultValue={name}
        onFocus={(event) => {
          cancelled.current = false
          event.currentTarget.select()
        }}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onBlur={(event) => {
          if (cancelled.current) return
          const typed = event.currentTarget.value.trim()
          onRename(typed && typed !== name ? typed : null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          else if (event.key === "Escape") {
            cancelled.current = true
            onRename(null)
          }
        }}
        className="w-full min-w-0 rounded border border-ring bg-background px-1 py-0.5 outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      title={t("rename")}
      onClick={(event) => {
        // Only a click on a row already selected renames it.
        if (!selected || event.detail !== 1) return
        cancelPending()
        pending.current = setTimeout(() => {
          pending.current = null
          onStartRename()
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

/** An index colour's name as AutoCAD's manager writes it, in lower case. */
function colorName(color: string, names: EngineNames): string | null {
  const standard = STANDARD_COLORS.find((entry) => entry.value === color)
  return standard ? names.colors[standard.id].toLowerCase() : null
}

/** What the manager refuses or asks, each one of AutoCAD's task dialogs. */
type LayerDialogKind =
  | { readonly kind: "notDeleted" }
  | { readonly kind: "currentOff"; readonly id: string }
  | { readonly kind: "inUse"; readonly name: string }
  | { readonly kind: Exclude<LayerNameRefusal, "inUse"> }

/**
 * AutoCAD's task dialogs for the manager, in its words: a delete refused
 * (`Layer - Not Deleted`, desktop d04-6), the current layer turned off
 * (`Layer - Current Layer Off`, d04-7), a name in use (d04-11, d04-14), one
 * with invalid characters (d04-13), layer 0 renamed (`Layer - Rename`,
 * d04-16). Local to the manager, as AutoCAD's are to its palette; focus goes
 * back to the drawing once one closes.
 */
function LayerDialog({
  dialog,
  onTurnOff,
  onClose,
  onClosed,
}: {
  dialog: LayerDialogKind | null
  onTurnOff: (id: string) => void
  onClose: () => void
  onClosed: () => void
}) {
  const portal = usePortalContainer()
  // Kept while the popup animates out, so its words do not blank first.
  const [shown, setShown] = useState(dialog)
  if (dialog !== null && dialog !== shown) setShown(dialog)

  return (
    <Dialog.Root
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      onOpenChangeComplete={(open) => {
        if (!open) onClosed()
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className="fixed inset-0 z-50 m-auto h-fit w-96 rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"
        >
          {shown && (
            <LayerDialogBody
              dialog={shown}
              onTurnOff={(id) => {
                onTurnOff(id)
                onClose()
              }}
              onClose={onClose}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function LayerDialogBody({
  dialog,
  onTurnOff,
  onClose,
}: {
  dialog: LayerDialogKind
  onTurnOff: (id: string) => void
  onClose: () => void
}) {
  const t = useEditorText("Layers.dialog")
  if (dialog.kind === "currentOff") {
    return (
      <>
        <Dialog.Title className="mb-2 text-title text-muted-foreground">
          {t("currentOff.title")}
        </Dialog.Title>
        <Dialog.Description className="mb-2">
          {t("currentOff.instruction")}
        </Dialog.Description>
        <div className="flex flex-col gap-1">
          <CommandLink
            label={t("currentOff.turnOff")}
            note={t("currentOff.turnOffNote")}
            onClick={() => onTurnOff(dialog.id)}
          />
          <CommandLink label={t("currentOff.keepOn")} onClick={onClose} />
        </div>
      </>
    )
  }
  const words =
    dialog.kind === "notDeleted"
      ? {
          title: t("notDeleted.title"),
          instruction: t("notDeleted.instruction"),
          content: t("notDeleted.content"),
          items: [
            t("notDeleted.base"),
            t("notDeleted.current"),
            t("notDeleted.inUse"),
            t("notDeleted.xref"),
          ],
        }
      : dialog.kind === "base"
        ? {
            title: t("cannotRename.title"),
            instruction: t("cannotRename.instruction"),
            content: t("cannotRename.content"),
            items: [t("cannotRename.base"), t("cannotRename.xref")],
          }
        : dialog.kind === "inUse"
          ? {
              title: t("nameInUse.title"),
              instruction: t("nameInUse.instruction", { name: dialog.name }),
              content: t("nameInUse.content"),
              items: [],
            }
          : {
              title: t("invalidName.title"),
              instruction: t("invalidName.instruction"),
              content: t("invalidName.content"),
              items: [],
            }
  return (
    <>
      <Dialog.Title className="mb-2 text-title text-muted-foreground">
        {words.title}
      </Dialog.Title>
      <Dialog.Description className="mb-2">
        {words.instruction}
      </Dialog.Description>
      <p>{words.content}</p>
      {words.items.length > 0 && (
        <ul className="list-disc ps-5">
          {words.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
      {dialog.kind === "invalid" && (
        <p dir="ltr" className="text-start font-mono">
          {INVALID_LAYER_NAME_CHARACTERS}
        </p>
      )}
      <div className="mt-4 flex justify-end">
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("close")}
            </Button>
          }
        />
      </div>
    </>
  )
}

/** A task dialog's command link: an arrow, its words and a note under them. */
function CommandLink({
  label,
  note,
  onClick,
}: {
  label: string
  note?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <ArrowRight className="mt-px size-4 shrink-0 text-muted-foreground rtl:-scale-x-100" />
      <span className="flex flex-col">
        <span>{label}</span>
        {note && <span className="text-muted-foreground">{note}</span>}
      </span>
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
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : "#ffffff"
}
