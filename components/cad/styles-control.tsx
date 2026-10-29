"use client"

import { useState } from "react"
import { Check, Plus, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CadEngine, DimStyleInfo, TextStyleInfo } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DecimalInput } from "./decimal-input"
import { useEditorText } from "./editor-text"

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
 * A tab of the palette panel, opened by the DIMSTYLE and STYLE commands on
 * their table as well as by its trigger, which is why the table it shows is
 * the engine's state.
 */
export function StylesControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const t = useEditorText("Styles")
  const tab = state.stylesTable

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex items-center gap-1 p-2">
        <TabButton
          label={t("dimension")}
          active={tab === "dimension"}
          onClick={() => engine.setStylesTable("dimension")}
        />
        <TabButton
          label={t("text")}
          active={tab === "text"}
          onClick={() => engine.setStylesTable("text")}
        />
      </div>

      {tab === "text" ? (
        <TextStyles engine={engine} state={state} />
      ) : (
        <DimStyles engine={engine} state={state} />
      )}
    </div>
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
      variant="ghost"
      onClick={onClick}
      className={cn(active && "bg-accent")}
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
  state: EditorState
}) {
  const t = useEditorText("Styles")
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
        onSetCurrent={(id) => {
          engine.setCurrentDimStyle(id)
          engine.focusSurface()
        }}
        onRename={(id, name) => engine.updateDimStyle(id, { name })}
        onDelete={(id) => {
          engine.removeDimStyle(id)
          engine.focusSurface()
        }}
        onNew={() =>
          setSelectedId(engine.createDimStyle(undefined, selected.id))
        }
      />

      <div className="space-y-3 border-t border-border/60 p-3">
        <Group title={t("lines")}>
          <NumberField
            label={t("baselineSpacing")}
            value={selected.baselineSpacing}
            onCommit={(baselineSpacing) => set({ baselineSpacing })}
          />
          <NumberField
            label={t("extendBeyond")}
            value={selected.extensionBeyond}
            onCommit={(extensionBeyond) => set({ extensionBeyond })}
          />
          <NumberField
            label={t("offsetFromOrigin")}
            value={selected.extensionOffset}
            onCommit={(extensionOffset) => set({ extensionOffset })}
          />
        </Group>

        <Group title={t("symbolsAndArrows")}>
          <NumberField
            label={t("arrowSize")}
            value={selected.arrowSize}
            onCommit={(arrowSize) => set({ arrowSize })}
          />
          {/* DIMCEN 0 is AutoCAD's "None"; a positive value is a centre mark. */}
          <NumberField
            label={t("centerMark")}
            value={selected.centerMark}
            onCommit={(centerMark) => set({ centerMark })}
          />
        </Group>

        <Group title={t("textGroup")}>
          <NumberField
            label={t("textHeight")}
            value={selected.textHeight}
            onCommit={(textHeight) => set({ textHeight })}
          />
          <NumberField
            label={t("offsetFromDimLine")}
            value={selected.textGap}
            onCommit={(textGap) => set({ textGap })}
          />
        </Group>

        <Group title={t("fit")}>
          <NumberField
            label={t("overallScale")}
            value={selected.scale}
            step={1}
            onCommit={(scale) => set({ scale })}
          />
          {/* DIMTOFL: a radial dimension placed outside keeps its line. */}
          <ChoiceField
            label={t("drawDimLineBetween")}
            value={selected.forceLineInside ? "yes" : "no"}
            choices={{ yes: t("yes"), no: t("no") }}
            onChoose={(choice) => {
              set({ forceLineInside: choice === "yes" })
              engine.focusSurface()
            }}
          />
        </Group>

        <Group title={t("primaryUnits")}>
          <NumberField
            label={t("precision")}
            value={selected.decimals}
            step={1}
            onCommit={(decimals) => set({ decimals })}
          />
          <ChoiceField
            label={t("decimalSeparator")}
            value={selected.decimalSeparator}
            choices={{
              ",": t("comma"),
              ".": t("period"),
              " ": t("space"),
            }}
            onChoose={(decimalSeparator) => {
              set({ decimalSeparator })
              engine.focusSurface()
            }}
          />
          <ChoiceField
            label={t("suppressTrailingZeros")}
            value={selected.suppressTrailingZeros ? "yes" : "no"}
            choices={{ yes: t("yes"), no: t("no") }}
            onChoose={(choice) => {
              set({ suppressTrailingZeros: choice === "yes" })
              engine.focusSurface()
            }}
          />
          {/* DIMADEC: −1 means "use the linear precision above". */}
          <NumberField
            label={t("angularPrecision")}
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
  state: EditorState
}) {
  const t = useEditorText("Styles")
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
        onSetCurrent={(id) => {
          engine.setCurrentTextStyle(id)
          engine.focusSurface()
        }}
        onRename={(id, name) => engine.updateTextStyle(id, { name })}
        onDelete={(id) => {
          engine.removeTextStyle(id)
          engine.focusSurface()
        }}
        onNew={() =>
          setSelectedId(engine.createTextStyle(undefined, selected.id))
        }
      />

      <div className="space-y-3 border-t border-border/60 p-3">
        <Group title={t("size")}>
          <NumberField
            label={t("height")}
            value={selected.height}
            onCommit={(height) =>
              engine.updateTextStyle(selected.id, { height })
            }
          />
        </Group>
        <p className="text-muted-foreground">{t("heightHint")}</p>
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
  const t = useEditorText("Styles")
  return (
    <>
      <div className="flex items-center justify-between px-3 pb-2">
        <p className="text-muted-foreground">
          {t.rich("current", {
            name: currentId,
            value: (chunks) => (
              <span className="text-foreground">{chunks}</span>
            ),
          })}
        </p>
        <Button variant="outline" className="gap-1" onClick={onNew}>
          <Plus className="size-3.5" />
          {t("new")}
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
  const t = useEditorText("Styles")
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group flex h-7 items-center gap-2 px-3",
        isSelected && "bg-accent"
      )}
    >
      <button
        type="button"
        aria-label={t("setCurrent", { name: style.name })}
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
          aria-label={t("rename", { name: style.name })}
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

      <span className="w-6 shrink-0 text-end font-mono text-muted-foreground tabular-nums">
        {style.entityCount}
      </span>

      <button
        type="button"
        aria-label={t("delete", { name: style.name })}
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
      <div className="mb-1 text-title text-muted-foreground">{title}</div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  )
}

/** A labelled drop-down of a few fixed values, as the manager's lists are. */
function ChoiceField({
  label,
  value,
  choices,
  onChoose,
}: {
  label: string
  value: string
  choices: Record<string, string>
  onChoose: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <Select
        items={choices}
        value={value}
        onValueChange={(chosen) => {
          if (chosen != null) onChoose(chosen as string)
        }}
      >
        <SelectTrigger
          aria-label={label}
          className="w-28 bg-background dark:bg-background"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(choices).map(([choice, text]) => (
            <SelectItem key={choice} value={choice}>
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  return (
    <label className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <DecimalInput
        step={step}
        aria-label={label}
        value={value}
        onCommit={onCommit}
        onFocus={(event) => event.currentTarget.select()}
        className="w-20 rounded-sm border border-border bg-background px-1 py-0.5 font-mono tabular-nums focus:border-ring focus:outline-none"
      />
    </label>
  )
}
