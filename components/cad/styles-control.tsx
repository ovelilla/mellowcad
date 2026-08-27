"use client"

import { useState } from "react"
import { Check, PencilRuler, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CadEngine, DimStyleInfo, EngineState, TextStyleInfo } from "@/cad"

/**
 * The style managers, modelled on AutoCAD's Dimension Style Manager and Text
 * Style dialog: each lists the styles in the drawing with the current one
 * highlighted, creates a style based on another, renames, deletes the ones it
 * is allowed to, and edits the settings of whichever style is selected.
 *
 * The two live behind one trigger with a tab apiece rather than in two separate
 * dialogs — chrome may differ, behaviour may not. What is kept is where each
 * setting lives: the dimension settings are grouped under the same headings as
 * the manager's tabs (Lines, Symbols and arrows, Text, Fit, Primary units), so
 * a user looks for Baseline spacing where AutoCAD taught them to.
 *
 * Opened by the DIMSTYLE and STYLE commands as well as by its trigger, which is
 * why the popover is controlled from engine state.
 */
export function StylesControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const tab = state.stylesPanel

  return (
    <Popover
      open={tab !== null}
      onOpenChange={(open) => engine.setStylesPanel(open ? "dimension" : null)}
    >
      <PopoverTrigger
        render={
          <Button
            size="lg"
            variant="ghost"
            aria-label="Styles"
            className="pointer-events-auto gap-2 rounded-lg bg-card/90 backdrop-blur aria-expanded:bg-card/90"
          >
            <PencilRuler className="shrink-0" />
            <span className="truncate text-xs">Styles</span>
          </Button>
        }
      />
      <PopoverContent
        side="bottom"
        align="start"
        className="w-112 overflow-hidden border-none p-0"
      >
        <div className="flex items-center gap-1 p-2">
          <TabButton
            label="Dimension"
            active={tab === "dimension"}
            onClick={() => engine.setStylesPanel("dimension")}
          />
          <TabButton
            label="Text"
            active={tab === "text"}
            onClick={() => engine.setStylesPanel("text")}
          />
        </div>

        {tab === "text" ? (
          <TextStyles engine={engine} state={state} />
        ) : (
          <DimStyles engine={engine} state={state} />
        )}
      </PopoverContent>
    </Popover>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={onClick}
      className={cn("text-xs font-normal", active && "bg-accent")}
    >
      {label}
    </Button>
  )
}

function DimStyles({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    state.dimStyles.find((style) => style.id === selectedId) ??
    state.dimStyles.find((style) => style.id === state.currentDimStyleId) ??
    state.dimStyles[0]

  const set = (patch: Parameters<CadEngine["updateDimStyle"]>[1]) =>
    engine.updateDimStyle(selected.id, patch)

  return (
    <>
      <StyleList
        styles={state.dimStyles}
        currentId={state.currentDimStyleId}
        selectedId={selected.id}
        baseId="ISO-25"
        onSelect={setSelectedId}
        onSetCurrent={(id) => engine.setCurrentDimStyle(id)}
        onRename={(id, name) => engine.updateDimStyle(id, { name })}
        onDelete={(id) => engine.removeDimStyle(id)}
        onNew={() =>
          setSelectedId(engine.createDimStyle(undefined, selected.id))
        }
      />

      <div className="max-h-[52svh] space-y-3 overflow-y-auto border-t border-border/60 p-3">
        <Group title="Lines">
          <NumberField
            label="Baseline spacing"
            value={selected.baselineSpacing}
            onCommit={(baselineSpacing) => set({ baselineSpacing })}
          />
          <NumberField
            label="Extend beyond dim lines"
            value={selected.extensionBeyond}
            onCommit={(extensionBeyond) => set({ extensionBeyond })}
          />
          <NumberField
            label="Offset from origin"
            value={selected.extensionOffset}
            onCommit={(extensionOffset) => set({ extensionOffset })}
          />
        </Group>

        <Group title="Symbols and arrows">
          <NumberField
            label="Arrow size"
            value={selected.arrowSize}
            onCommit={(arrowSize) => set({ arrowSize })}
          />
          {/* DIMCEN 0 is AutoCAD's "None"; a positive value is a centre mark. */}
          <NumberField
            label="Center mark size"
            value={selected.centerMark}
            onCommit={(centerMark) => set({ centerMark })}
          />
        </Group>

        <Group title="Text">
          <NumberField
            label="Text height"
            value={selected.textHeight}
            onCommit={(textHeight) => set({ textHeight })}
          />
          <NumberField
            label="Offset from dim line"
            value={selected.textGap}
            onCommit={(textGap) => set({ textGap })}
          />
        </Group>

        <Group title="Fit">
          <NumberField
            label="Use overall scale of"
            value={selected.scale}
            step={1}
            onCommit={(scale) => set({ scale })}
          />
        </Group>

        <Group title="Primary units">
          <NumberField
            label="Precision"
            value={selected.decimals}
            step={1}
            onCommit={(decimals) => set({ decimals })}
          />
          {/* DIMADEC: −1 means "use the linear precision above". */}
          <NumberField
            label="Angular precision"
            value={selected.angleDecimals}
            step={1}
            onCommit={(angleDecimals) => set({ angleDecimals })}
          />
        </Group>
      </div>
    </>
  )
}

function TextStyles({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected =
    state.textStyles.find((style) => style.id === selectedId) ??
    state.textStyles.find((style) => style.id === state.currentTextStyleId) ??
    state.textStyles[0]

  return (
    <>
      <StyleList
        styles={state.textStyles}
        currentId={state.currentTextStyleId}
        selectedId={selected.id}
        baseId="Standard"
        onSelect={setSelectedId}
        onSetCurrent={(id) => engine.setCurrentTextStyle(id)}
        onRename={(id, name) => engine.updateTextStyle(id, { name })}
        onDelete={(id) => engine.removeTextStyle(id)}
        onNew={() =>
          setSelectedId(engine.createTextStyle(undefined, selected.id))
        }
      />

      <div className="space-y-3 border-t border-border/60 p-3">
        <Group title="Size">
          <NumberField
            label="Height"
            value={selected.height}
            onCommit={(height) =>
              engine.updateTextStyle(selected.id, { height })
            }
          />
        </Group>
        <p className="text-[11px] text-muted-foreground">
          A height of 0 leaves it free, so TEXT asks for one each time.
        </p>
      </div>
    </>
  )
}

function StyleList({
  styles,
  currentId,
  selectedId,
  baseId,
  onSelect,
  onSetCurrent,
  onRename,
  onDelete,
  onNew,
}: {
  styles: ReadonlyArray<DimStyleInfo | TextStyleInfo>
  currentId: string
  selectedId: string
  baseId: string
  onSelect: (id: string) => void
  onSetCurrent: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-[11px] text-muted-foreground">
          Current: <span className="text-foreground">{currentId}</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-xs font-normal"
          onClick={onNew}
        >
          <Plus className="size-3.5" />
          New
        </Button>
      </div>

      <div className="max-h-40 overflow-y-auto">
        {styles.map((style) => (
          <StyleRow
            key={style.id}
            style={style}
            isCurrent={style.id === currentId}
            isSelected={style.id === selectedId}
            // AutoCAD: "you cannot delete a style that is current or in use".
            canDelete={
              style.id !== baseId &&
              style.id !== currentId &&
              style.entityCount === 0
            }
            onSelect={() => onSelect(style.id)}
            onSetCurrent={() => onSetCurrent(style.id)}
            onRename={(name) => onRename(style.id, name)}
            onDelete={() => onDelete(style.id)}
          />
        ))}
      </div>
    </>
  )
}

function StyleRow({
  style,
  isCurrent,
  isSelected,
  canDelete,
  onSelect,
  onSetCurrent,
  onRename,
  onDelete,
}: {
  style: DimStyleInfo | TextStyleInfo
  isCurrent: boolean
  isSelected: boolean
  canDelete: boolean
  onSelect: () => void
  onSetCurrent: () => void
  onRename: (name: string) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 px-3 py-1 text-xs",
        isSelected && "bg-accent"
      )}
    >
      <button
        type="button"
        aria-label={`Set ${style.name} current`}
        onClick={onSetCurrent}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Check
          className={cn(
            "size-3.5",
            isCurrent ? "text-primary" : "opacity-0 group-hover:opacity-40"
          )}
        />
      </button>

      {draft === null ? (
        <span
          className="flex-1 truncate"
          onDoubleClick={() => setDraft(style.name)}
        >
          {style.name}
        </span>
      ) : (
        <input
          autoFocus
          aria-label={`Rename ${style.name}`}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (draft.trim()) onRename(draft.trim())
            setDraft(null)
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
            else if (event.key === "Escape") setDraft(null)
          }}
          className="flex-1 rounded-sm border border-ring bg-background px-1 outline-none"
        />
      )}

      <span className="w-6 shrink-0 text-right text-muted-foreground tabular-nums">
        {style.entityCount}
      </span>

      <button
        type="button"
        aria-label={`Delete ${style.name}`}
        disabled={!canDelete}
        onClick={onDelete}
        className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:hover:text-muted-foreground"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold tracking-wide text-muted-foreground/70 uppercase">
        {title}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

/** A labelled number input that commits on Enter or blur and reverts on Escape. */
function NumberField({
  label,
  value,
  step = 0.1,
  onCommit,
}: {
  label: string
  value: number
  step?: number
  onCommit: (value: number) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft !== null) {
      const parsed = Number(draft.replace(",", "."))
      if (Number.isFinite(parsed)) onCommit(parsed)
    }
    setDraft(null)
  }

  return (
    <label className="flex items-center justify-between gap-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        step={step}
        aria-label={label}
        value={draft ?? String(value)}
        onChange={(event) => setDraft(event.target.value)}
        onFocus={(event) => event.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault()
            event.currentTarget.blur()
          } else if (event.key === "Escape") {
            event.preventDefault()
            setDraft(null)
          }
        }}
        className="w-20 rounded-sm border border-border bg-background px-1 py-0.5 text-right tabular-nums focus:border-ring focus:outline-none"
      />
    </label>
  )
}
