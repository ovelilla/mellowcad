"use client"

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
} from "react"
import { Dialog } from "@base-ui/react/dialog"
import {
  ArrowRight,
  Check,
  Layers,
  Lightbulb,
  LightbulbOff,
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
  Linetype,
  INVALID_LAYER_NAME_CHARACTERS,
  LayerInfo,
  LayerNameRefusal,
  colorLabel,
  colorRgb,
} from "@mellowcad/engine"
import { type EditorState, isImeKey } from "@mellowcad/react"
import { drawingFocus } from "./drawing-focus"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"
import { useEditorText } from "./editor-text"

/**
 * How long a second click on a selected name waits for a double-click, which
 * still makes the layer current. F2 renames too, while the list has focus.
 */
const RENAME_DELAY_MS = 400

/**
 * The grid's columns, in AutoCAD's order (Status, Name, On, Freeze, Lock,
 * Plot, Color, Linetype, Lineweight, Transparency, New VP Freeze,
 * Description: AcLayer's LayerDefaultColumnIndex_*), those the model has.
 */
const COLUMNS = [
  "status",
  "name",
  "on",
  "lock",
  "color",
  "linetype",
  "lineweight",
] as const
const NAME_COLUMN = COLUMNS.indexOf("name")

/** The manager's toolbar buttons and their Alt keys (AcLayer's tbbtn*_). */
type ToolbarAction = "new" | "delete" | "setCurrent"

/**
 * The Layer Properties Manager, a palette of its own, laid out as AutoCAD's
 * with what exists here: the current layer's name over the toolbar (New
 * Layer, Delete Layer, Set Current, each with its Alt key while the manager
 * has the keyboard), the grid, and the status line under it. The filter
 * tree, its Invert, the search field and the buttons for filters, layer
 * states, viewports, Refresh and Settings are not drawn (docs/coverage,
 * Layers). The grid keeps its columns' widths and scrolls sideways under a
 * narrower palette, as AutoCAD's docked manager does.
 *
 * A row is selected with a click or the arrow keys; Set Current — or a
 * double-click on the row — makes it the current layer, and New and Delete
 * act beside it. A click on the selected layer's name, or F2, renames it.
 * The rows are sorted by name (the engine's order), and what AutoCAD refuses
 * or asks is one of its task dialogs (`LayerDialog`).
 */
export function LayersControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const t = useEditorText("Layers")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [column, setColumn] = useState(NAME_COLUMN)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<LayerDialogKind | null>(null)
  const gridRef = useRef<HTMLTableElement>(null)
  const forward = useDirection() === "rtl" ? -1 : 1
  const selected =
    state.layers.find((layer) => layer.id === selectedId) ??
    state.layers.find((layer) => layer.id === state.currentLayerId) ??
    state.layers[0]
  const current = state.layers.find(
    (layer) => layer.id === state.currentLayerId
  )
  const selectedIsCurrent = selected.id === state.currentLayerId
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
  const act: Record<ToolbarAction, () => void> = {
    new: () => {
      // Its name opens for editing, as AutoCAD's New Layer leaves it.
      const id = engine.newLayer(selected.id)
      setSelectedId(id)
      setColumn(NAME_COLUMN)
      setRenamingId(id)
    },
    // Never disabled: AutoCAD answers a refused delete with its task dialog
    // (desktop d04-6).
    delete: () => {
      if (engine.removeLayer(selected.id)) {
        setSelectedId(null)
        done()
      } else setDialog({ kind: "notDeleted" })
    },
    setCurrent: () => setCurrent(selected.id),
  }
  const keys: Record<ToolbarAction, string> = {
    new: t("keys.new"),
    delete: t("keys.delete"),
    setCurrent: t("keys.setCurrent"),
  }

  /** Selects a row and puts the keyboard on one of its cells. */
  const moveTo = (index: number, to: number) => {
    const layer =
      state.layers[Math.max(0, Math.min(index, state.layers.length - 1))]
    const col = Math.max(0, Math.min(to, COLUMNS.length - 1))
    setSelectedId(layer.id)
    setColumn(col)
    const cell = gridRef.current?.querySelector<HTMLElement>(
      `tr[data-layer="${CSS.escape(layer.id)}"] > [data-cell="${col}"]`
    )
    const target = cell?.hasAttribute("tabindex")
      ? cell
      : cell?.querySelector<HTMLElement>("button, input")
    target?.focus()
  }

  return (
    <div
      // The keys the manager keeps, on its buttons and cells — not in a
      // field, whose keys the engine leaves it, nor in a portalled list,
      // whose keys reach it through React. WHY in the capture: React
      // listens on its root (the document under Next), where the engine
      // does too, so a stop while bubbling would leave the engine's
      // listener on that same node to run.
      onKeyDownCapture={(event) => {
        const target = event.target as Element
        if (!event.currentTarget.contains(target)) return
        if (target.closest("input, textarea")) return
        const plain = !event.altKey && !event.ctrlKey && !event.metaKey
        if (event.key === "Escape") {
          // The keys to the drawing; Escape goes on to the engine, which
          // cancels as it would there.
          engine.focusSurface()
        } else if (plain && (event.key === "Enter" || event.key === " ")) {
          // The control takes them as a click (its default action, kept),
          // never the engine's Enter, which repeats the last command; a
          // cell that is no control does nothing, nor scrolls.
          event.stopPropagation()
          if (!target.closest("button")) event.preventDefault()
        } else if (event.key === "Delete" || event.key === "Backspace") {
          // Never ERASE's: the selection in the drawing is not here.
          event.preventDefault()
          event.stopPropagation()
        } else if (plain && event.key.length === 1) {
          // A letter types a command, as on the drawing, where its Enter
          // will then run it.
          engine.focusSurface()
        } else if (event.altKey && !event.ctrlKey && !event.metaKey) {
          // AutoCAD's Alt keys (`&New Layer (Alt+N)`), each language its
          // own letter.
          const action = (Object.keys(keys) as ToolbarAction[]).find((key) =>
            isAltKey(event, keys[key])
          )
          if (!action || (action === "setCurrent" && selectedIsCurrent)) return
          event.preventDefault()
          event.stopPropagation()
          act[action]()
        }
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="shrink-0 px-3 pt-1.5 break-words">
        {t("currentLayer", { name: current?.name ?? "" })}
      </div>
      <div
        role="group"
        aria-label={t("title")}
        className="flex shrink-0 items-center gap-1 px-2 py-1"
      >
        <ToolbarButton
          label={t("newLayer")}
          shortcut={t("withKey", { label: t("newLayer"), key: keys.new })}
          altKey={keys.new}
          onClick={act.new}
        >
          <Plus />
        </ToolbarButton>
        <ToolbarButton
          label={t("deleteLayer")}
          shortcut={t("withKey", {
            label: t("deleteLayer"),
            key: keys.delete,
          })}
          altKey={keys.delete}
          onClick={act.delete}
        >
          <Trash2 />
        </ToolbarButton>
        <ToolbarButton
          label={t("setCurrentLayer")}
          shortcut={t("withKey", {
            label: t("setCurrentLayer"),
            key: keys.setCurrent,
          })}
          altKey={keys.setCurrent}
          disabled={selectedIsCurrent}
          onClick={act.setCurrent}
        >
          <Check />
        </ToolbarButton>
      </div>

      {/* The grid scrolls both ways inside the palette; its columns keep
          their widths, never squeezed or cut. */}
      <div className="min-h-0 flex-1 scroll-pt-7 overflow-auto border-y border-border/60">
        <table
          ref={gridRef}
          role="grid"
          aria-label={t("list")}
          // In the capture, as the manager's keys (above).
          onKeyDownCapture={(event) => {
            const target = event.target as HTMLElement
            // A portalled list's keys reach the grid through React: its own.
            if (!event.currentTarget.contains(target)) return
            if (target.closest("[data-rename]")) return
            const row = state.layers.indexOf(selected)
            const step: Record<string, () => void> = {
              ArrowUp: () => moveTo(row - 1, column),
              ArrowDown: () => moveTo(row + 1, column),
              ArrowLeft: () => moveTo(row, column - forward),
              ArrowRight: () => moveTo(row, column + forward),
              Home: () => (event.ctrlKey ? moveTo(0, column) : moveTo(row, 0)),
              End: () =>
                event.ctrlKey
                  ? moveTo(state.layers.length - 1, column)
                  : moveTo(row, COLUMNS.length - 1),
              // F2 renames there, as the help says; elsewhere it is the
              // history.
              F2: () => {
                if (renamingId === null) startRename(selected)
              },
            }
            const run = step[event.key]
            if (!run || event.altKey) return
            event.preventDefault()
            event.stopPropagation()
            run()
          }}
          className="w-max min-w-full border-separate border-spacing-0"
        >
          <thead className="text-muted-foreground">
            <tr>
              <Header>{t("columns.status")}</Header>
              <Header className="min-w-32" sort="ascending">
                {t("columns.name")}
              </Header>
              <Header>{t("columns.on")}</Header>
              <Header>{t("columns.lock")}</Header>
              <Header className="min-w-24">{t("columns.color")}</Header>
              <Header className="min-w-28">{t("columns.linetype")}</Header>
              <Header className="min-w-24">{t("columns.lineweight")}</Header>
            </tr>
          </thead>
          <tbody>
            {state.layers.map((layer) => (
              <LayerRow
                key={layer.id}
                engine={engine}
                layer={layer}
                names={state.names}
                linetypes={state.linetypes}
                isCurrent={layer.id === state.currentLayerId}
                isSelected={layer.id === selected.id}
                column={layer.id === selected.id ? column : null}
                renaming={layer.id === renamingId}
                onSelect={(col) => {
                  setSelectedId(layer.id)
                  if (col !== null) setColumn(col)
                }}
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
      <StatusLine
        full={t("status", {
          filter: t("all"),
          shown: state.layers.length,
          total: state.layers.length,
        })}
        short={t("statusShort", {
          filter: t("all"),
          shown: state.layers.length,
          total: state.layers.length,
        })}
      />
      <LayerDialog
        dialog={dialog}
        onTurnOff={(id) => engine.updateLayer(id, { visible: false })}
        onClose={() => setDialog(null)}
        onClosed={done}
      />
    </div>
  )
}

/**
 * Whether a key is Alt with the given letter: the character the layout
 * types (Russian's `Д`), or a Latin letter's physical key, as Option types
 * another character on a Mac.
 */
function isAltKey(event: React.KeyboardEvent, letter: string): boolean {
  if (event.key.toLowerCase() === letter.toLowerCase()) return true
  return (
    /^[A-Za-z]$/.test(letter) && event.code === `Key${letter.toUpperCase()}`
  )
}

/**
 * The status line under the grid, AutoCAD's `All: 2 layers displayed of 2
 * total layers`; where the palette is too narrow for it, AcLayer's shorter
 * wording (`OverallStatusText_Shortening`, `All: 2 of 2 total`).
 */
function StatusLine({
  full,
  short,
}: {
  full: string
  short: string
}): ReactElement {
  const boxRef = useRef<HTMLDivElement>(null)
  const fullRef = useRef<HTMLSpanElement>(null)
  const [fits, setFits] = useState(true)
  useLayoutEffect(() => {
    const box = boxRef.current
    const text = fullRef.current
    if (!box || !text) return
    const measure = () => setFits(text.offsetWidth <= box.clientWidth)
    measure()
    // The text too: it widens when the web font replaces the fallback.
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    observer.observe(text)
    return () => observer.disconnect()
  }, [full])
  return (
    <div className="shrink-0 px-3 py-1.5">
      <div
        ref={boxRef}
        role="status"
        className="relative overflow-hidden whitespace-nowrap"
      >
        <span ref={fullRef} aria-hidden className="invisible absolute">
          {full}
        </span>
        {fits ? full : short}
      </div>
    </div>
  )
}

function Header({
  className,
  sort,
  children,
}: {
  className?: string
  sort?: "ascending"
  children: React.ReactNode
}) {
  return (
    <th
      scope="col"
      aria-sort={sort}
      className={cn(
        "sticky top-0 z-10 h-7 border-b border-border/60 bg-card px-1.5 text-start text-ui whitespace-nowrap",
        className
      )}
    >
      {children}
    </th>
  )
}

function ToolbarButton({
  label,
  shortcut,
  altKey,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  /** The tooltip, AutoCAD's: the label and its Alt key. */
  shortcut: string
  altKey: string
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
            aria-keyshortcuts={`Alt+${altKey}`}
            disabled={disabled}
            onClick={onClick}
          >
            {children}
          </Button>
        }
      />
      <TooltipContent side="bottom">{shortcut}</TooltipContent>
    </Tooltip>
  )
}

function LayerRow({
  engine,
  layer,
  names,
  linetypes,
  isCurrent,
  isSelected,
  column,
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
  linetypes: readonly Linetype[]
  isCurrent: boolean
  isSelected: boolean
  /** The cell that is the grid's tab stop, on the selected row alone. */
  column: number | null
  renaming: boolean
  /** Selects the row, and makes `column` the grid's cell when not null. */
  onSelect: (column: number | null) => void
  onSetCurrent: () => void
  onStartRename: () => void
  onRename: (name: string | null) => void
  /** Turning the current layer off asks first (desktop d04-7). */
  onTurnOffCurrent: () => void
}) {
  const t = useEditorText("Layers")
  const toDrawing = drawingFocus(engine)
  // After each edit the keyboard is the drawing's, a key's as a click's
  // (ui.md); the arrows only move in the grid.
  const done = () => engine.focusSurface()
  const stop = (col: number) => (column === col ? 0 : -1)
  const cell = (name: (typeof COLUMNS)[number]) => ({
    role: "gridcell",
    "data-cell": COLUMNS.indexOf(name),
  })

  return (
    <tr
      data-layer={layer.id}
      onClick={() => onSelect(null)}
      onFocus={(event) => {
        if (!event.currentTarget.contains(event.target)) return
        const at = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-cell]"
        )
        onSelect(at ? Number(at.dataset.cell) : null)
      }}
      onDoubleClick={(event) => {
        // A double-click on a control of the row is that control's.
        if ((event.target as HTMLElement).closest("button, input, label"))
          return
        onSetCurrent()
      }}
      aria-selected={isSelected}
      className={cn("h-7", isSelected ? "bg-accent" : "hover:bg-accent/40")}
    >
      <td
        {...cell("status")}
        tabIndex={stop(COLUMNS.indexOf("status"))}
        className="px-1.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        {/* AutoCAD's check mark on the current layer, in the one accent;
            every other layer shows as in use, as AutoCAD's does while
            Indicate Layers in Use is off, its default. */}
        {isCurrent ? (
          <Check aria-label={t("current")} className="size-4 text-active" />
        ) : (
          <Layers aria-hidden className="size-4 text-muted-foreground" />
        )}
      </td>

      <td {...cell("name")} className="px-0.5">
        <NameField
          name={layer.name}
          editing={renaming}
          selected={isSelected}
          tabIndex={stop(COLUMNS.indexOf("name"))}
          onSetCurrent={onSetCurrent}
          onStartRename={onStartRename}
          onRename={onRename}
        />
      </td>

      <td {...cell("on")} className="px-0.5">
        <IconToggle
          onLabel={t("on")}
          offLabel={t("off")}
          on={layer.visible}
          OnIcon={Lightbulb}
          OffIcon={LightbulbOff}
          tabIndex={stop(COLUMNS.indexOf("on"))}
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

      <td {...cell("lock")} className="px-0.5">
        <IconToggle
          onLabel={t("unlocked")}
          offLabel={t("locked")}
          on={!layer.locked}
          OnIcon={LockOpen}
          OffIcon={Lock}
          tabIndex={stop(COLUMNS.indexOf("lock"))}
          onToggle={() => {
            engine.updateLayer(layer.id, { locked: !layer.locked })
            done()
          }}
        />
      </td>

      <td {...cell("color")} className="px-1.5">
        {/* The colour's name beside its swatch, as AutoCAD's manager writes
            it (`white`, `red`; desktop d04-1, es e02-1); a numbered or a true
            colour by its number or its RGB (`colorLabel`). */}
        <label
          className="relative flex cursor-pointer items-center gap-1.5 rounded-sm whitespace-nowrap has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50"
          title={t("color")}
        >
          <LayerSwatch color={layer.color} />
          <span>{colorLabel(layer.color, names, "layer")}</span>
          <input
            type="color"
            // The native `change` comes once the picker closes; React's
            // onChange is each `input` on the way (one step all the same:
            // UNDO's Layer folds consecutive layer edits).
            ref={(input) => {
              if (!input) return
              input.addEventListener("change", done)
              return () => input.removeEventListener("change", done)
            }}
            aria-label={t("colorLabel", { name: layer.name })}
            tabIndex={stop(COLUMNS.indexOf("color"))}
            value={colorRgb(layer.color)}
            onChange={(event) =>
              engine.updateLayer(layer.id, { color: event.target.value })
            }
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
      </td>

      <td {...cell("linetype")} className="px-0.5">
        <LinetypeSelect
          value={layer.linetype}
          names={names}
          linetypes={linetypes}
          tabIndex={stop(COLUMNS.indexOf("linetype"))}
          onValueChange={(linetype) => {
            engine.updateLayer(layer.id, { linetype })
            done()
          }}
          ariaLabel={t("linetypeLabel", { name: layer.name })}
          finalFocus={toDrawing}
          className={CELL_SELECT}
        />
      </td>

      <td {...cell("lineweight")} className="px-0.5">
        <LineweightSelect
          value={layer.lineweight}
          names={names}
          tabIndex={stop(COLUMNS.indexOf("lineweight"))}
          onValueChange={(lineweight) => {
            if (lineweight !== "ByLayer") {
              engine.updateLayer(layer.id, { lineweight })
              done()
            }
          }}
          ariaLabel={t("lineweightLabel", { name: layer.name })}
          finalFocus={toDrawing}
          className={CELL_SELECT}
        />
      </td>
    </tr>
  )
}

/** A drop-down in a cell: the cell's width, its value never cut. */
const CELL_SELECT =
  "w-full border-0 bg-transparent px-1.5 text-foreground shadow-none hover:bg-accent/40 dark:bg-transparent *:data-[slot=select-value]:line-clamp-none"

/** An on/off icon toggle used for On and Lock. */
function IconToggle({
  on,
  OnIcon,
  OffIcon,
  onLabel,
  offLabel,
  tabIndex,
  onToggle,
}: {
  on: boolean
  OnIcon: typeof Lightbulb
  OffIcon: typeof Lightbulb
  onLabel: string
  offLabel: string
  tabIndex: number
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
            tabIndex={tabIndex}
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
  tabIndex,
  onSetCurrent,
  onStartRename,
  onRename,
}: {
  name: string
  editing: boolean
  selected: boolean
  tabIndex: number
  onSetCurrent: () => void
  onStartRename: () => void
  onRename: (name: string | null) => void
}) {
  const t = useEditorText("Layers")
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Escape unmounts the field: its blur must not commit what was typed.
  const cancelled = useRef(false)
  const wasSelected = useRef(false)

  const cancelPending = () => {
    if (pending.current !== null) clearTimeout(pending.current)
    pending.current = null
  }
  useEffect(() => cancelPending, [])

  if (editing) {
    return (
      <input
        autoFocus
        data-rename
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
          if (isImeKey(event)) return
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
      tabIndex={tabIndex}
      // Whether the row was selected before this press: the focus the press
      // brings selects it before the click comes.
      onPointerDown={() => {
        wasSelected.current = selected
      }}
      onBlur={cancelPending}
      onClick={(event) => {
        // Only a click on a row already selected renames it.
        if (!wasSelected.current || event.detail !== 1) return
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
      className="block w-full cursor-default rounded px-1 py-0.5 text-start whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {name}
    </button>
  )
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
export function LayerSwatch({ color }: { color: string }): ReactElement {
  return (
    <span
      className="inline-block size-4 shrink-0 rounded-sm border border-white/25 shadow-inner"
      style={{ backgroundColor: color ? colorRgb(color) : undefined }}
    />
  )
}

/** Coerces arbitrary colour strings to a `#rrggbb` value the picker accepts. */
