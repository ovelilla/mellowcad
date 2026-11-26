"use client"

import { useEffect, useId, useRef, useState, type ReactElement } from "react"
import {
  ChevronDown,
  Crosshair,
  Grid2x2,
  Grid3x3,
  LayoutList,
  List,
  RotateCcw,
  Scaling,
  Square,
  type LucideIcon,
} from "lucide-react"
import { isImeKey, type EditorState } from "@mellowcad/react"
import {
  BLOCKS_VIEWS,
  CadEngine,
  CanvasScenePresenter,
  matchesWildcard,
  type BlockInfo,
  type BlockInsertCheck,
  type BlockInsertField,
  type BlocksView,
} from "@mellowcad/engine"

import { cn } from "./utils"
import { useDirection } from "./ui/direction"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { drawingFocus } from "./drawing-focus"
import { useEditorText } from "./editor-text"

/**
 * Each view's item: its width, its thumbnail and its height, px, as
 * AcWindows' PaletteTabSharedDictionary sizes them (a list's row 28, the
 * editor's, where AutoCAD's is 20). Large Icon is what the desktop showed
 * (desktop blocks/d06-3: tiles on an 80 px pitch).
 */
const VIEW_SIZE: Readonly<
  Record<BlocksView, { width: number; icon: number; height: number }>
> = {
  extraLarge: { width: 140, icon: 128, height: 160 },
  large: { width: 80, icon: 64, height: 92 },
  medium: { width: 50, icon: 32, height: 60 },
  small: { width: 100, icon: 16, height: 28 },
  list: { width: 0, icon: 16, height: 28 },
}

const VIEW_ICON: Readonly<Record<BlocksView, LucideIcon>> = {
  extraLarge: Square,
  large: Grid2x2,
  medium: Grid3x3,
  small: LayoutList,
  list: List,
}

/**
 * AutoCAD's Blocks palette, laid out as 2027's (plan §2.8): its tabs written
 * upwards at its edge, the filter and the view over the blocks, and Options at
 * its foot. Only the Current Drawing tab is drawn: Recent, Favorites and
 * Libraries list blocks of other drawings, which need files and a history
 * kept between sessions, and a tab that opens nothing is a dead button (the
 * brief's §3); so are Insert DWG as Block, the filter's history, Details, and
 * Auto-Placement, Repeat Placement and Explode, all in docs/coverage.
 *
 * A click on a block inserts it, -INSERT asking what Options leave to ask;
 * with Insertion Point cleared it is a double-click, as AutoCAD's help says,
 * and the block lands at the fields' point. Enter does either from the
 * keyboard. The palette stays open, so one block after another is a click
 * on each. No delete: AutoCAD's palette has none (desktop blocks/d06-4).
 */
export function BlocksControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const t = useEditorText("Blocks")
  const id = useId()
  const [filter, setFilter] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const forward = useDirection() === "rtl" ? -1 : 1
  const view = state.blocksView
  const shown = state.blocks.filter((block) =>
    matchesWildcard(block.name, filter)
  )
  const selected =
    shown.find((block) => block.id === selectedId) ?? shown[0] ?? null
  const done = () => engine.focusSurface()
  const insert = (block: BlockInfo) => {
    setSelectedId(block.id)
    engine.insertBlock(block.id)
    done()
  }

  /** Selects the block at `index` and puts the keyboard on it. */
  const moveTo = (index: number) => {
    const block = shown[Math.max(0, Math.min(index, shown.length - 1))]
    if (!block) return
    setSelectedId(block.id)
    viewRef.current
      ?.querySelector<HTMLElement>(`[data-block="${CSS.escape(block.id)}"]`)
      ?.focus()
  }

  /** How many blocks a row of the view holds, as it wraps them. */
  const perRow = () => {
    const items = viewRef.current?.querySelectorAll<HTMLElement>("[data-block]")
    if (!items?.length) return 1
    const top = items[0].offsetTop
    let count = 0
    while (count < items.length && items[count].offsetTop === top) count++
    return Math.max(1, count)
  }

  return (
    <div
      // The keys the palette keeps, as the Layer Properties Manager's (its
      // WHY there): stopped in the capture, or the engine's listener on the
      // document runs them too. A field's are the field's; a portalled
      // list's reach here through React and are left to it.
      onKeyDownCapture={(event) => {
        const target = event.target as Element
        if (!event.currentTarget.contains(target)) return
        if (target.closest("input")) return
        const plain = !event.altKey && !event.ctrlKey && !event.metaKey
        if (event.key === "Escape") {
          engine.focusSurface()
        } else if (event.key === "Delete" || event.key === "Backspace") {
          // Never ERASE's, on a block too: the selection in the drawing is
          // not here.
          event.preventDefault()
          event.stopPropagation()
        } else if (plain && target.closest("[data-block]")) {
          const index = shown.findIndex((block) => block.id === selected?.id)
          const step: Record<string, () => void> = {
            ArrowLeft: () => moveTo(index - forward),
            ArrowRight: () => moveTo(index + forward),
            ArrowUp: () => moveTo(index - (view === "list" ? 1 : perRow())),
            ArrowDown: () => moveTo(index + (view === "list" ? 1 : perRow())),
            Home: () => moveTo(0),
            End: () => moveTo(shown.length - 1),
            Enter: () => selected && insert(selected),
            " ": () => selected && insert(selected),
          }
          const run = step[event.key]
          if (run) {
            event.preventDefault()
            event.stopPropagation()
            run()
          } else if (event.key.length === 1) engine.focusSurface()
        } else if (plain && (event.key === "Enter" || event.key === " ")) {
          // A button takes them as a click (its default action, kept), never
          // the engine's Enter, which repeats the last command.
          event.stopPropagation()
          if (!target.closest("button")) event.preventDefault()
        } else if (plain && event.key.length === 1) {
          // A letter types a command, as on the drawing.
          engine.focusSurface()
        }
      }}
      className="flex min-h-0 flex-1"
    >
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={t("title")}
        className="flex w-6 shrink-0 flex-col border-e bg-muted/40"
      >
        <button
          id={`${id}-tab`}
          type="button"
          role="tab"
          aria-selected
          aria-controls={`${id}-panel`}
          onClick={(event) => {
            // A click hands the keys back; arrows keep them on the tabs.
            if (event.detail > 0) done()
          }}
          onKeyDown={(event) => {
            if (event.key.startsWith("Arrow")) event.preventDefault()
          }}
          className="-me-px flex min-h-30 items-center justify-center border-y border-e border-e-transparent bg-card py-3 whitespace-nowrap outline-none [writing-mode:sideways-lr] first:border-t-0 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          {t("currentDrawing")}
        </button>
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab`}
        className="flex min-w-0 flex-1 flex-col"
      >
        <div className="flex shrink-0 items-center gap-1 px-2 pt-2 pb-1">
          <FilterField
            value={filter}
            placeholder={t("filterHint")}
            onChange={setFilter}
            onDone={done}
          />
          <ViewSelect engine={engine} view={view} />
        </div>
        <div className="shrink-0 px-3 py-1 text-title text-muted-foreground">
          {t("currentDrawingBlocks")}
        </div>
        <div
          ref={viewRef}
          role="group"
          aria-label={t("currentDrawingBlocks")}
          className={cn(
            "min-h-0 flex-1 content-start overflow-y-auto px-2 pb-2",
            view === "list" ? "flex flex-col" : "grid"
          )}
          style={
            view === "list"
              ? undefined
              : {
                  gridTemplateColumns: `repeat(auto-fill, ${VIEW_SIZE[view].width}px)`,
                }
          }
        >
          {shown.map((block) => (
            <BlockItem
              key={block.id}
              engine={engine}
              block={block}
              view={view}
              selected={block.id === selected?.id}
              onSelect={() => setSelectedId(block.id)}
              onInsert={() => insert(block)}
              clickInserts={state.blockInsert.pickPoint}
            />
          ))}
        </div>
        <InsertOptions engine={engine} state={state} />
      </div>
    </div>
  )
}

/**
 * The filter, AutoCAD's wildcards (`?`, `*`) over the names as typed. Enter
 * hands the keys to the drawing; Escape puts back what it held when it took
 * them, then does the same.
 */
function FilterField({
  value,
  placeholder,
  onChange,
  onDone,
}: {
  value: string
  placeholder: string
  onChange: (value: string) => void
  onDone: () => void
}) {
  const held = useRef(value)
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onFocus={() => {
        held.current = value
      }}
      onKeyDown={(event) => {
        if (isImeKey(event)) return
        if (event.key === "Enter") {
          event.preventDefault()
          onDone()
        } else if (event.key === "Escape") {
          event.preventDefault()
          onChange(held.current)
          onDone()
        }
      }}
      placeholder={placeholder}
      aria-label={placeholder}
      spellCheck={false}
      autoComplete="off"
      className="h-7 min-w-0 flex-1 rounded-sm border bg-transparent px-2 outline-none placeholder:text-faint-foreground placeholder:italic focus:border-ring"
    />
  )
}

/** The view drop-down, AutoCAD's icon and arrow at the filter's end. */
function ViewSelect({ engine, view }: { engine: CadEngine; view: BlocksView }) {
  const t = useEditorText("Blocks")
  const items = Object.fromEntries(
    BLOCKS_VIEWS.map((mode) => [mode, t(`views.${mode}`)])
  )
  const Icon = VIEW_ICON[view]
  return (
    <Select
      items={items}
      value={view}
      onValueChange={(next) => {
        if (next != null) engine.setBlocksView(next as BlocksView)
      }}
    >
      <SelectTrigger
        aria-label={items[view]}
        className="w-auto shrink-0 border-transparent bg-transparent px-1.5 shadow-none dark:bg-transparent"
      >
        <SelectValue>
          {() => <Icon aria-hidden className="text-muted-foreground" />}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        finalFocus={drawingFocus(engine)}
        className="w-auto"
      >
        {BLOCKS_VIEWS.map((mode) => {
          const ItemIcon = VIEW_ICON[mode]
          return (
            <SelectItem key={mode} value={mode}>
              <ItemIcon aria-hidden />
              {items[mode]}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

function BlockItem({
  engine,
  block,
  view,
  selected,
  clickInserts,
  onSelect,
  onInsert,
}: {
  engine: CadEngine
  block: BlockInfo
  view: BlocksView
  selected: boolean
  /** Insertion Point checked: a click inserts; cleared, a double-click. */
  clickInserts: boolean
  onSelect: () => void
  onInsert: () => void
}) {
  const size = VIEW_SIZE[view]
  const beside = view === "small" || view === "list"
  return (
    <button
      type="button"
      data-block={block.id}
      tabIndex={selected ? 0 : -1}
      title={block.name}
      onClick={(event) => {
        // A double-click's second click would start -INSERT over again.
        if (event.detail > 1) return
        if (clickInserts) onInsert()
        else onSelect()
      }}
      onDoubleClick={() => {
        if (!clickInserts) onInsert()
      }}
      style={beside ? undefined : { height: size.height }}
      className={cn(
        "flex min-w-0 cursor-default items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
        beside ? "h-7 gap-1.5 px-1.5" : "flex-col justify-center gap-1 px-0.5",
        selected ? "bg-accent" : "hover:bg-accent/40"
      )}
    >
      <BlockThumbnail engine={engine} id={block.id} size={size.icon} />
      <span
        dir="auto"
        className={cn("min-w-0 truncate", !beside && "w-full text-center")}
      >
        {block.name}
      </span>
    </button>
  )
}

/**
 * Draws the block through the same scene pipeline the drawing uses, so a
 * thumbnail can never disagree with what inserting it produces.
 */
export function BlockThumbnail({
  engine,
  id,
  size = 64,
}: {
  engine: CadEngine
  id: string
  /** Its side, px. */
  size?: number
}): ReactElement {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const scene = engine.buildBlockPreview(id, size, size)
    if (!scene) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    new CanvasScenePresenter().draw(ctx, scene, dpr)
  }, [engine, id, size])

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ width: size, height: size }}
      className="shrink-0 rounded-sm"
    />
  )
}

/**
 * Options at the palette's foot, folding as AutoCAD's: Insertion Point,
 * Scale (with Uniform Scale) and Rotation, each checked to be asked as the
 * block is inserted, else taken from its fields — the insertion point's
 * shown only while it is cleared, as AutoCAD hides them. The engine keeps
 * and reads them (`state.blockInsert`).
 */
function InsertOptions({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useEditorText("Blocks")
  const id = useId()
  const [open, setOpen] = useState(true)
  const options = state.blockInsert
  const check = (name: BlockInsertCheck) => (on: boolean) => {
    engine.setBlockInsertCheck(name, on)
    engine.focusSurface()
  }
  const field = (name: BlockInsertField, value: string, label: string[]) => (
    <OptionField
      engine={engine}
      field={name}
      value={value}
      labelledBy={label.join(" ")}
      disabled={
        (name.startsWith("scale") && options.pickScale) ||
        (name === "angle" && options.pickRotation)
      }
    />
  )
  // An axis and its value, one island left to right whatever the page's
  // direction, as a typed coordinate reads (`X: -12.5`, never `-12.5 :X`).
  const pair = (
    name: "x" | "y" | "z" | null,
    of: string,
    value: React.ReactNode
  ) => (
    <span dir="ltr" className="flex items-center gap-1">
      <span
        id={name ? `${id}-${of}-${name}` : undefined}
        className="w-3 text-muted-foreground"
      >
        {name && t(name)}
      </span>
      {value}
    </span>
  )

  return (
    <section aria-labelledby={`${id}-title`} className="shrink-0 border-t">
      <button
        id={`${id}-title`}
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open)
          engine.focusSurface()
        }}
        className="flex h-7 w-full items-center gap-1 px-2 text-start text-title text-muted-foreground outline-none hover:bg-accent/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
      >
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 shrink-0 transition-transform",
            !open && "-rotate-90 rtl:rotate-90"
          )}
        />
        {t("options")}
      </button>
      {open && (
        // AutoCAD's grid: what each row asks, then X:, Y: and Z: with their
        // fields, the angle's under X's. Under a narrower palette it scrolls
        // sideways, as the Layer Properties Manager's grid does, never cut.
        <div className="overflow-x-auto px-3 pb-2">
          <div className="grid w-max min-w-full auto-rows-[minmax(1.75rem,auto)] grid-cols-[1fr_repeat(3,auto)] items-center gap-x-1.5">
            <CheckBox
              id={`${id}-point`}
              checked={options.pickPoint}
              Icon={Crosshair}
              label={t("insertionPoint")}
              onChange={check("pickPoint")}
            />
            {options.pickPoint ? (
              <span className="col-span-3" />
            ) : (
              <>
                {pair(
                  "x",
                  "point",
                  field("x", options.x, [`${id}-point`, `${id}-point-x`])
                )}
                {pair(
                  "y",
                  "point",
                  field("y", options.y, [`${id}-point`, `${id}-point-y`])
                )}
                {pair(
                  "z",
                  "point",
                  field("z", options.z, [`${id}-point`, `${id}-point-z`])
                )}
              </>
            )}

            <span className="flex items-center gap-1.5">
              <CheckBox
                id={`${id}-scale`}
                checked={options.pickScale}
                Icon={Scaling}
                ariaLabel={t("scale")}
                onChange={check("pickScale")}
              />
              <ScaleSelect
                engine={engine}
                uniform={options.uniformScale}
                disabled={options.pickScale}
                id={`${id}-scale-kind`}
              />
            </span>
            {options.uniformScale ? (
              <>
                {pair(
                  null,
                  "scale",
                  field("scaleX", options.scaleX, [`${id}-scale-kind`])
                )}
                <span className="col-span-2" />
              </>
            ) : (
              <>
                {pair(
                  "x",
                  "scale",
                  field("scaleX", options.scaleX, [
                    `${id}-scale-kind`,
                    `${id}-scale-x`,
                  ])
                )}
                {pair(
                  "y",
                  "scale",
                  field("scaleY", options.scaleY, [
                    `${id}-scale-kind`,
                    `${id}-scale-y`,
                  ])
                )}
                <span />
              </>
            )}

            <CheckBox
              id={`${id}-rotation`}
              checked={options.pickRotation}
              Icon={RotateCcw}
              label={t("rotation")}
              onChange={check("pickRotation")}
            />
            {pair(
              null,
              "angle",
              field("angle", options.angle, [`${id}-rotation`, `${id}-angle`])
            )}
            <span
              id={`${id}-angle`}
              className="col-span-2 whitespace-nowrap text-muted-foreground"
            >
              {t("angle")}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * A check box of Options, its icon and its words, a button for the keys'
 * sake: a native one is a field, whose keys the engine leaves to it, so a
 * letter typed there would never reach the command line.
 */
function CheckBox({
  id,
  checked,
  Icon,
  label,
  ariaLabel,
  onChange,
}: {
  id: string
  checked: boolean
  Icon: LucideIcon
  label?: string
  ariaLabel?: string
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      id={id}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="flex h-7 min-w-0 items-center gap-1.5 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
          checked ? "border-active bg-active text-background" : "border-input"
        )}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-2.5">
            <path
              d="M2.5 6.5 5 9l4.5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        )}
      </span>
      <Icon aria-hidden className="size-4 shrink-0 text-muted-foreground" />
      {label && <span className="whitespace-nowrap">{label}</span>}
    </button>
  )
}

/** Scale's drop-down: Scale, X and Y apart, or Uniform Scale, one for both. */
function ScaleSelect({
  engine,
  uniform,
  disabled,
  id,
}: {
  engine: CadEngine
  uniform: boolean
  disabled: boolean
  id: string
}) {
  const t = useEditorText("Blocks")
  const items = { scale: t("scale"), uniform: t("uniformScale") }
  return (
    <Select
      items={items}
      value={uniform ? "uniform" : "scale"}
      disabled={disabled}
      onValueChange={(next) => {
        if (next == null) return
        engine.setBlockInsertCheck("uniformScale", next === "uniform")
      }}
    >
      <SelectTrigger id={id} className="min-w-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        finalFocus={drawingFocus(engine)}
        className="w-auto"
      >
        <SelectItem value="scale">{items.scale}</SelectItem>
        <SelectItem value="uniform">{items.uniform}</SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * A value of Options, written and read by the engine as the command line
 * reads one; Enter or leaving it sets it, a value it refuses goes back, and
 * Escape puts it back. Enter and Escape hand the keys to the drawing.
 */
function OptionField({
  engine,
  field,
  value,
  labelledBy,
  disabled,
}: {
  engine: CadEngine
  field: BlockInsertField
  value: string
  labelledBy: string
  disabled: boolean
}) {
  const [draft, setDraft] = useState<string | null>(null)
  // WHY a ref beside the state: handing the keys to the drawing blurs the
  // field at once, and that blur's commit read the draft of the render
  // before Escape dropped it, so Escape set what it should have put back.
  const typed = useRef<string | null>(null)
  const type = (text: string | null) => {
    typed.current = text
    setDraft(text)
  }
  const commit = () => {
    const text = typed.current
    type(null)
    if (text !== null && text !== value) engine.setBlockInsertValue(field, text)
  }
  return (
    <input
      type="text"
      inputMode="decimal"
      dir="ltr"
      autoComplete="off"
      spellCheck={false}
      aria-labelledby={labelledBy}
      disabled={disabled}
      value={draft ?? value}
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
      className="h-7 w-12 rounded-sm border bg-transparent px-1 text-end tabular-nums outline-none focus:border-ring disabled:text-faint-foreground"
    />
  )
}
