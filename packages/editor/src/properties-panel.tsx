"use client"

import {
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { ChevronDown } from "lucide-react"

import {
  type CadEngine,
  type ObjectType,
  type PropertyEdit,
  type PropertyGroup,
  type PropertyRow,
} from "@mellowcad/engine"
import { type EditorState, isImeKey } from "@mellowcad/react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectFinalFocus,
} from "./ui/select"
import { useDirection } from "./ui/direction"
import { cn } from "./utils"
import { ColorSelect } from "./color-select"
import { drawingFocus } from "./drawing-focus"
import { LinetypeSelect } from "./linetype-select"
import { LineweightSelect } from "./lineweight-select"
import { useEditorText } from "./editor-text"
import { useLayoutStorage } from "./layout-storage-context"
import {
  MIXED_SELECTION,
  NO_SELECTION,
  isFolded,
  readPropertiesFold,
  rememberPropertiesFold,
  withFold,
} from "./properties-fold"

/** The type drop-down's value for All, which is no object type. */
const ALL = "*"

/**
 * A value's control fills its cell, drawn as AutoCAD's grid draws a value:
 * no box until the pointer is over it.
 */
const CELL =
  "h-7 w-full min-w-0 rounded-none border-transparent bg-transparent shadow-none hover:border-border dark:bg-transparent dark:hover:bg-input/30"

/** What the arrows step through: the type drop-down, each header, each control. */
const STOP = "[data-stop]"
const CONTROL = 'button:not([tabindex="-1"]), input:not([tabindex="-1"])'

/**
 * The Properties palette, laid out as AutoCAD 2027's (plan §2.8). At its top
 * the object type drop-down: `All (6)`, `Line (5)`… with a selection, which
 * narrows what the palette edits to one type, and `No selection` without
 * one. AutoCAD's three buttons beside it (Toggle PICKADD, Select Objects,
 * Quick Select) are not drawn: none of the three exists here, and a button
 * that does nothing is a dead one (docs/coverage/properties.md).
 *
 * Then the categories in AutoCAD's order, General first, each folding by its
 * header; the folds are kept per object type, as AutoCAD keeps them per
 * class (`properties-fold.ts`). Each row is a label and its value in two
 * columns, the label's 48.5 % of the width (the profile's COLUMNWIDTH
 * 0.4854), on the editor's 28 px pitch where AutoCAD's is 19: a value here
 * is a control one presses (ui.md, Size). With nothing selected General
 * shows the current settings ("When no objects are selected, only the
 * current settings of general properties are displayed"): the current layer,
 * colour, linetype and lineweight, each set there. The palette never appears
 * or disappears with the selection; only its content changes.
 */
export function PropertiesPanel({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const t = useEditorText("Properties")
  const { properties: foldKey } = useLayoutStorage()
  const [fold, setFold] = useState(() => readPropertiesFold(foldKey))
  const forward = useDirection() === "rtl" ? -1 : 1
  const root = useRef<HTMLDivElement>(null)
  const { properties } = state
  const info = properties.info
  const selected = info !== null
  const object = selected
    ? (properties.filter ?? MIXED_SELECTION)
    : NO_SELECTION
  const done = () => engine.focusSurface()
  const toDrawing = drawingFocus(engine)
  const filterItems: Record<string, string> = selected
    ? Object.fromEntries(
        properties.filters.map((entry) => [entry.type ?? ALL, entry.label])
      )
    : { [ALL]: t("noSelection") }

  const open = (category: string) => !isFolded(fold, object, category)
  const toggle = (category: string, folded = open(category)) => {
    const next = withFold(fold, object, category, folded)
    setFold(next)
    rememberPropertiesFold(foldKey, next)
  }

  /** Puts the keys on the stop `step` away from `from`'s, or on the first or last. */
  const moveFrom = (from: Element | null, step: number | "first" | "last") => {
    // Each stop's first control the keys reach: a colour's hidden picker is
    // none, nor the type list, disabled with nothing selected.
    const controlOf = (stop: HTMLElement) =>
      stop.matches(CONTROL) ? stop : stop.querySelector<HTMLElement>(CONTROL)
    const stops = [
      ...(root.current?.querySelectorAll<HTMLElement>(STOP) ?? []),
    ].filter((stop) => stop === from || !controlOf(stop)?.matches(":disabled"))
    const at = from ? stops.indexOf(from as HTMLElement) : -1
    const index =
      step === "first"
        ? 0
        : step === "last"
          ? stops.length - 1
          : Math.max(0, Math.min(at + step, stops.length - 1))
    const stop = stops[index]
    if (stop) controlOf(stop)?.focus()
  }

  // The text and dimension styles sit where AutoCAD files them: Style in
  // Text (after the Value of an attribute definition, the Contents of a
  // text), Dim style first in Misc (desktop dimensions/d04-1, blocks/d03-4).
  // A selection with no such category (several types under All) keeps them
  // in General.
  const textStyle = properties.textStyleId !== null && (
    <StyleRow
      key="style"
      label={t("style")}
      ariaLabel={t("textStyleLabel")}
      value={properties.textStyleId}
      styles={state.textStyles}
      onValueChange={(id) => {
        engine.setSelectionTextStyle(id)
        done()
      }}
      finalFocus={toDrawing}
    />
  )
  const dimStyle = properties.dimStyleId !== null && (
    <StyleRow
      key="dimStyle"
      label={t("dimStyle")}
      ariaLabel={t("dimStyleLabel")}
      value={properties.dimStyleId}
      styles={state.dimStyles}
      onValueChange={(id) => {
        engine.setSelectionDimStyle(id)
        done()
      }}
      finalFocus={toDrawing}
    />
  )
  const groups = info?.groups ?? []
  const textInGroup = groups.some((group) => group.id === "text")
  const dimInGroup = groups.some((group) => group.id === "misc")
  const groupRows = (group: PropertyGroup): ReactNode[] => {
    const rows: ReactNode[] = group.rows.map((row) => (
      <PropertyRowView key={row.id} engine={engine} row={row} />
    ))
    if (group.id === "text" && textStyle) {
      const after = ["value", "contents"]
        .map((id) => group.rows.findIndex((row) => row.id === id))
        .find((index) => index >= 0)
      rows.splice((after ?? -1) + 1, 0, textStyle)
    }
    if (group.id === "misc" && dimStyle) rows.unshift(dimStyle)
    return rows
  }

  return (
    <div
      // The keys the palette keeps, as the other palettes' (their WHY
      // there): stopped in the capture, or the engine's listener on the
      // document runs them too. A portalled list's reach here through React
      // and are left to it.
      onKeyDownCapture={(event) => {
        const target = event.target as HTMLElement
        if (!event.currentTarget.contains(target)) return
        const plain = !event.altKey && !event.ctrlKey && !event.metaKey
        const stop = target.closest(STOP)
        if (target.closest("input")) {
          // A field keeps its keys but the arrows that leave it for the next
          // row, as AutoCAD's grid; its blur commits what was typed.
          if (
            plain &&
            !event.shiftKey &&
            !isImeKey(event) &&
            (event.key === "ArrowUp" || event.key === "ArrowDown")
          ) {
            event.preventDefault()
            event.stopPropagation()
            moveFrom(stop, event.key === "ArrowUp" ? -1 : 1)
          }
          return
        }
        if (event.key === "Escape") {
          // The keys to the drawing; Escape goes on to the engine, which
          // cancels as it would there.
          engine.focusSurface()
          return
        }
        if (event.key === "Delete" || event.key === "Backspace") {
          // Never ERASE's: the selection in the drawing is not here.
          event.preventDefault()
          event.stopPropagation()
          return
        }
        if (!plain) return
        const section = target.closest<HTMLElement>("[data-category]")
        const header = section?.querySelector<HTMLElement>("[data-header]")
        // As a tree's: on a header, fold or open it, the keys staying there
        // as on a tab; on a row, the folding key goes up to its header. A
        // row's key never folds its own category: the row would go with
        // the keys in it, to the page and on to the engine.
        const fold = (folding: boolean) => {
          const category = section?.getAttribute("data-category")
          if (!category || !header) return
          if (target === header) toggle(category, folding)
          else if (folding) header.focus()
        }
        const step: Record<string, () => void> = {
          ArrowUp: () => moveFrom(stop, -1),
          ArrowDown: () => moveFrom(stop, 1),
          Home: () => moveFrom(stop, "first"),
          End: () => moveFrom(stop, "last"),
          ArrowLeft: () => fold(forward === 1),
          ArrowRight: () => fold(forward !== 1),
        }
        const run = step[event.key]
        if (run) {
          event.preventDefault()
          event.stopPropagation()
          run()
        } else if (event.key === "Enter" || event.key === " ") {
          // A header or a drop-down takes them as a click (its default
          // action, kept), never the engine's Enter, which repeats the last
          // command.
          event.stopPropagation()
          if (!target.closest("button")) event.preventDefault()
        } else if (event.key.length === 1) {
          // A letter types a command, as on the drawing.
          engine.focusSurface()
        }
      }}
      ref={root}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div data-stop className="px-3 py-2">
        <Select
          items={filterItems}
          disabled={!selected}
          value={selected ? (properties.filter ?? ALL) : ALL}
          onValueChange={(value) => {
            if (value == null) return
            engine.setPropertiesFilter(
              value === ALL ? null : (value as ObjectType)
            )
            done()
          }}
        >
          <SelectTrigger
            aria-label={t("objectType")}
            className="w-full bg-background dark:bg-background"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent finalFocus={toDrawing}>
            {Object.entries(filterItems).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Under a narrow column the grid keeps its width and scrolls
          sideways, as the Layer Properties Manager's: a value is never cut. */}
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="min-w-72">
          <Category
            id="general"
            title={t("general")}
            open={open("general")}
            onToggle={() => {
              toggle("general")
              done()
            }}
          >
            <Row label={t("color")} control>
              <ColorSelect
                value={selected ? properties.color : state.currentColor}
                names={state.names}
                onValueChange={(value) => {
                  if (selected) engine.setSelectionColor(value, "properties")
                  else engine.setCurrentColor(value)
                  done()
                }}
                ariaLabel={selected ? t("colorLabel") : t("currentColorLabel")}
                className="w-full"
                triggerClassName={CELL}
                finalFocus={toDrawing}
              />
            </Row>
            <Row label={t("layer")} control>
              <Select
                items={Object.fromEntries(
                  state.layers.map((layer) => [layer.id, layer.name])
                )}
                value={selected ? properties.layerId : state.currentLayerId}
                onValueChange={(value) => {
                  if (value == null) return
                  if (selected) engine.setSelectionLayer(value, "properties")
                  else engine.setCurrentLayer(value)
                  done()
                }}
              >
                <SelectTrigger
                  aria-label={
                    selected ? t("layerLabel") : t("currentLayerLabel")
                  }
                  className={CELL}
                >
                  <SelectValue placeholder={t("varies")} />
                </SelectTrigger>
                <SelectContent finalFocus={toDrawing}>
                  {state.layers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      {layer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label={t("linetype")} control>
              <LinetypeSelect
                value={selected ? properties.linetype : state.currentLinetype}
                names={state.names}
                linetypes={state.linetypes}
                onValueChange={(value) => {
                  if (selected) engine.setSelectionLinetype(value, "properties")
                  else engine.setCurrentLinetype(value)
                  done()
                }}
                includeByLayer
                ariaLabel={
                  selected ? t("linetypeLabel") : t("currentLinetypeLabel")
                }
                className={CELL}
                finalFocus={toDrawing}
              />
            </Row>
            {/* Linetype scale follows Linetype, as AutoCAD's General lists it. */}
            {info?.general
              .filter((row) => row.id === "linetypeScale")
              .map((row) => (
                <PropertyRowView key={row.id} engine={engine} row={row} />
              ))}
            <Row label={t("lineweight")} control>
              <LineweightSelect
                value={
                  selected ? properties.lineweight : state.currentLineweight
                }
                names={state.names}
                onValueChange={(value) => {
                  if (selected) {
                    engine.setSelectionLineweight(value, "properties")
                  } else {
                    engine.setCurrentLineweight(value)
                  }
                  done()
                }}
                includeByLayer
                ariaLabel={
                  selected ? t("lineweightLabel") : t("currentLineweightLabel")
                }
                className={CELL}
                finalFocus={toDrawing}
              />
            </Row>
            {info?.general
              .filter((row) => row.id !== "linetypeScale")
              .map((row) => (
                <PropertyRowView key={row.id} engine={engine} row={row} />
              ))}
            {!textInGroup && textStyle}
            {!dimInGroup && dimStyle}
          </Category>

          {groups.map((group) => (
            <Category
              key={group.id}
              id={group.id}
              title={group.title}
              open={open(group.id)}
              onToggle={() => {
                toggle(group.id)
                done()
              }}
            >
              {groupRows(group)}
            </Category>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * A category: its header, AutoCAD's band with the title and the arrow at its
 * end, and its rows while open. A click folds or opens it and hands the keys
 * to the drawing; the arrows fold it from the keyboard (the palette's keys).
 */
function Category({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const headerId = useId()
  return (
    <div role="group" aria-labelledby={headerId} data-category={id}>
      <button
        id={headerId}
        type="button"
        data-stop
        data-header
        aria-expanded={open}
        onClick={(event) => {
          // A double-click is two clicks: the second would fold it back.
          if (event.detail > 1) return
          onToggle()
        }}
        className="flex h-7 w-full items-center gap-1 border-b bg-muted ps-3 pe-2 text-start text-title text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <span className="min-w-0 flex-1">{title}</span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 transition-transform",
            !open && "-rotate-90 rtl:rotate-90"
          )}
        />
      </button>
      {open && (
        <dl className="grid grid-cols-[minmax(0,97fr)_minmax(0,103fr)]">
          {children}
        </dl>
      )}
    </div>
  )
}

/**
 * One row: the label, which wraps and grows its row where it is longer than
 * its column (an AutoCAD word stays whole), and its value. `control` marks a
 * value the arrows stop on.
 */
function Row({
  label,
  control = false,
  children,
}: {
  label: string
  control?: boolean
  children: ReactNode
}) {
  return (
    <>
      <dt className="flex min-h-7 items-center border-e border-b ps-6 pe-2 text-muted-foreground">
        {label}
      </dt>
      <dd
        data-stop={control ? "" : undefined}
        className="flex min-h-7 min-w-0 items-center border-b"
      >
        {children}
      </dd>
    </>
  )
}

function PropertyRowView({
  engine,
  row,
}: {
  engine: CadEngine
  row: PropertyRow
}) {
  return (
    <Row label={row.label} control={row.edit !== undefined}>
      {row.edit?.choices ? (
        <PropertyChoice engine={engine} label={row.label} edit={row.edit} />
      ) : row.edit ? (
        // A technical value with its unit: one LTR island, so -12.5 never
        // reads 12.5- and the unit stays after the number; at its cell's
        // start, as AutoCAD's values, beside the label right to left too.
        <span dir="ltr" className="flex w-full min-w-0 items-center font-mono">
          <PropertyInput engine={engine} label={row.label} edit={row.edit} />
          {row.edit.unit && (
            <span className="shrink-0 pe-2 text-muted-foreground">
              {row.edit.unit}
            </span>
          )}
        </span>
      ) : (
        // Read-only, greyed as AutoCAD greys what it derives.
        <span
          dir="ltr"
          className="min-w-0 px-2 font-mono break-words text-faint-foreground tabular-nums rtl:text-end"
        >
          {row.value}
        </span>
      )}
    </Row>
  )
}

/**
 * One typeable geometry value. It shows the document-formatted number until you
 * edit it, then commits on Enter or blur and hands focus back to the drawing
 * surface so the next keystroke reaches the command line. Escape reverts.
 */
function PropertyInput({
  engine,
  label,
  edit,
}: {
  engine: CadEngine
  label: string
  edit: PropertyEdit
}) {
  const [draft, setDraft] = useState<string | null>(null)
  // WHY a ref beside the state: handing the keys to the drawing blurs the
  // field at once, and that blur's commit read the render's draft, so
  // Escape set what it was to put back, and Enter set it twice.
  const typed = useRef<string | null>(null)
  const type = (text: string | null) => {
    typed.current = text
    setDraft(text)
  }

  const commit = () => {
    const text = typed.current
    type(null)
    if (text !== null && text !== edit.text) {
      engine.setSelectionProperty(edit.property, text)
    }
  }

  return (
    <input
      aria-label={label}
      value={draft ?? edit.text}
      onChange={(event) => type(event.target.value)}
      onFocus={(event) => event.currentTarget.select()}
      onBlur={commit}
      onKeyDown={(event) => {
        if (isImeKey(event)) return
        if (event.key === "Enter") {
          event.preventDefault()
          commit()
          engine.focusSurface()
        } else if (event.key === "Escape") {
          event.preventDefault()
          type(null)
          engine.focusSurface()
        }
      }}
      className="h-7 min-w-0 flex-1 border border-transparent bg-transparent px-2 text-start text-foreground tabular-nums outline-none hover:border-border focus:border-ring focus:bg-background rtl:text-end"
    />
  )
}

/** A value picked from a list, as AutoCAD's palette offers a polyline's Closed. */
function PropertyChoice({
  engine,
  label,
  edit,
}: {
  engine: CadEngine
  label: string
  edit: PropertyEdit
}) {
  const choices = edit.choices ?? []
  return (
    <Select
      items={Object.fromEntries(
        choices.map((choice) => [choice.value, choice.label])
      )}
      value={edit.text}
      onValueChange={(value) => {
        if (value == null) return
        engine.setSelectionProperty(edit.property, value as string)
        engine.focusSurface()
      }}
    >
      <SelectTrigger aria-label={label} className={CELL}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent finalFocus={drawingFocus(engine)}>
        {choices.map((choice) => (
          <SelectItem key={choice.value} value={choice.value}>
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A named-style picker: Text's Style, Misc's Dim style. */
function StyleRow({
  label,
  ariaLabel,
  value,
  styles,
  onValueChange,
  finalFocus,
}: {
  label: string
  ariaLabel: string
  value: string
  styles: ReadonlyArray<{ id: string; name: string }>
  onValueChange: (id: string) => void
  finalFocus: SelectFinalFocus
}) {
  const t = useEditorText("Properties")
  return (
    <Row label={label} control>
      <Select
        items={Object.fromEntries(
          styles.map((style) => [style.id, style.name])
        )}
        value={value}
        onValueChange={(next) => {
          if (next != null) onValueChange(next as string)
        }}
      >
        <SelectTrigger aria-label={ariaLabel} className={CELL}>
          <SelectValue placeholder={t("varies")} />
        </SelectTrigger>
        <SelectContent finalFocus={finalFocus}>
          {styles.map((style) => (
            <SelectItem key={style.id} value={style.id}>
              {style.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  )
}
