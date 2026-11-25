"use client"

import {
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react"
import { ContextMenu } from "@base-ui/react/context-menu"
import { Dialog } from "@base-ui/react/dialog"
import { Tabs } from "@base-ui/react/tabs"

import type { CadEngine, DimStyle, DimStyleInfo } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { usePortalContainer } from "./ui/portal-container"
import { DecimalInput } from "./decimal-input"
import { StyleList } from "./style-list"
import { MENU_AT_CURSOR, MENU_ITEM } from "./snap-override-menu"
import { useEditorText } from "./editor-text"
import { cn } from "./utils"
import {
  DIALOG_POPUP,
  DialogBackdrop,
  FIELD,
  Group,
  type StyleFilter,
  inUse,
} from "./style-dialog-parts"

type DimStylePatch = Partial<Omit<DimStyle, "id" | "name">>

/** The style AutoCAD keeps the manager from deleting, the drawing's base. */
const BASE_STYLE = "ISO-25"

/** Precision's entries, 0 to 8 places, as the list writes them (d05-3). */
const PLACES = Array.from({ length: 9 }, (_, places) =>
  places === 0 ? "0" : `0.${"0".repeat(places)}`
)

/** The pages built, in AutoCAD's order; Alternate Units and Tolerances hold nothing here. */
const PAGES = [
  "lines",
  "symbolsAndArrows",
  "text",
  "fit",
  "primaryUnits",
] as const
type Page = (typeof PAGES)[number]

/**
 * AutoCAD's Dimension Style Manager (DIMSTYLE, desktop d05-1,
 * `research/ui/2026-11-25/phase3/dimstyle-manager.png`): `Current dimension
 * style:`, the Styles list with its right-click menu (Set current, Rename,
 * Delete: AcDimRes' menu), List's All styles / Styles in use, Set Current,
 * New..., Modify... and Close. New... asks Create New Dimension Style, whose
 * Continue opens New Dimension Style on the pages; Modify... opens the same
 * pages on the style selected. The run is DIMSTYLE's, one step U names, and
 * a style made is current once the manager closes (d05-4). WHY no preview,
 * Description, Override..., Compare..., Don't list styles in Xrefs or Help:
 * nothing here draws a style's preview yet, overrides and xrefs do not
 * exist, and no host page answers Help (`docs/coverage/dimensions.md`).
 */
export function DimStyleDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const open = state.styleDialog === "dimension"
  // The last style New made, current as the manager closes (d05-4).
  const made = useRef<string | null>(null)
  const close = () => {
    if (made.current !== null) engine.setCurrentDimStyle(made.current)
    made.current = null
    engine.setStyleDialog(null)
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      onOpenChangeComplete={(next) => {
        // A session the engine ended (a new drawing) leaves no style to
        // make current in the next one.
        if (next) made.current = null
        else engine.focusSurface()
      }}
    >
      <Dialog.Portal container={portal}>
        <DialogBackdrop />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className={`${DIALOG_POPUP} w-fit min-w-130`}
        >
          {open && (
            <Manager
              engine={engine}
              state={state}
              onMade={(id) => {
                made.current = id
              }}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Manager({
  engine,
  state,
  onMade,
}: {
  engine: CadEngine
  state: EditorState
  /** A style New made, or null once Set Current picked one. */
  onMade: (id: string | null) => void
}): ReactElement {
  const t = useEditorText("DimStyle")
  const portal = usePortalContainer()
  const current = state.currentDimStyleId
  const [selectedId, setSelectedId] = useState(current)
  const [filter, setFilter] = useState<StyleFilter>("all")
  const [renaming, setRenaming] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  // The pages open: on a new style (its name and the style it copies) or on
  // one to modify.
  const [editing, setEditing] = useState<
    | { readonly kind: "new"; readonly name: string; readonly basedOn: string }
    | { readonly kind: "modify"; readonly id: string }
    | null
  >(null)
  const filterId = useId()

  const listed = state.dimStyles.filter(
    (style) => filter === "all" || inUse(style, current)
  )
  // Only a style the list shows is selected: the filter may hide the one
  // picked, and the current style is always in use.
  const selected =
    listed.find((style) => style.id === selectedId) ??
    listed.find((style) => style.id === current) ??
    state.dimStyles[0]
  const nameOf = (id: string) =>
    state.dimStyles.find((style) => style.id === id)?.name ?? id
  // AutoCAD: "you cannot delete a style that is current or in use".
  const deletable =
    selected.id !== BASE_STYLE &&
    selected.id !== current &&
    selected.entityCount === 0

  return (
    <div>
      <Dialog.Title className="mb-2 text-title">{t("title")}</Dialog.Title>
      <p className="mb-1 text-muted-foreground">
        {t("current", { name: nameOf(current) })}
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4">
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-muted-foreground">{t("styles")}</span>
          <ContextMenu.Root>
            <ContextMenu.Trigger
              render={
                <StyleList
                  label={t("styles")}
                  styles={listed}
                  selectedId={selected.id}
                  onSelect={setSelectedId}
                  onRename={(id, name) => engine.updateDimStyle(id, { name })}
                  editing={renaming}
                  onEditingChange={setRenaming}
                  className="h-48"
                />
              }
            />
            <ContextMenu.Portal container={portal}>
              <ContextMenu.Positioner className="z-50">
                <ContextMenu.Popup className={MENU_AT_CURSOR}>
                  <ContextMenu.Item
                    className={MENU_ITEM}
                    onClick={() => {
                      engine.setCurrentDimStyle(selected.id)
                      onMade(null)
                    }}
                  >
                    {t("menuSetCurrent")}
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className={MENU_ITEM}
                    onClick={() => setRenaming(selected.id)}
                  >
                    {t("rename")}
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className={MENU_ITEM}
                    disabled={!deletable}
                    onClick={() => {
                      if (engine.removeDimStyle(selected.id))
                        setSelectedId(current)
                    }}
                  >
                    {t("delete")}
                  </ContextMenu.Item>
                </ContextMenu.Popup>
              </ContextMenu.Positioner>
            </ContextMenu.Portal>
          </ContextMenu.Root>
          <div className="flex items-center gap-2">
            <span id={filterId} className="text-muted-foreground">
              {t("list")}
            </span>
            <Select
              items={{ all: t("allStyles"), inUse: t("stylesInUse") }}
              value={filter}
              onValueChange={(value) => {
                if (value != null) setFilter(value as StyleFilter)
              }}
            >
              <SelectTrigger
                aria-labelledby={filterId}
                className="min-w-0 flex-1"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allStyles")}</SelectItem>
                <SelectItem value="inUse">{t("stylesInUse")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              engine.setCurrentDimStyle(selected.id)
              onMade(null)
            }}
          >
            {t("setCurrent")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreating(true)}
          >
            {t("new")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing({ kind: "modify", id: selected.id })}
          >
            {t("modify")}
          </Button>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("close")}
            </Button>
          }
        />
      </div>

      <CreateNewDimStyle
        open={creating}
        engine={engine}
        styles={state.dimStyles}
        startWith={selected.id}
        onDone={(answer) => {
          setCreating(false)
          if (answer) setEditing({ kind: "new", ...answer })
        }}
      />
      <DimStylePages
        title={
          editing === null
            ? ""
            : editing.kind === "new"
              ? t("newTitle", { name: editing.name })
              : t("modifyTitle", { name: nameOf(editing.id) })
        }
        style={
          editing === null
            ? null
            : (state.dimStyles.find(
                (style) =>
                  style.id ===
                  (editing.kind === "new" ? editing.basedOn : editing.id)
              ) ?? null)
        }
        onDone={(patch) => {
          const pages = editing
          setEditing(null)
          if (patch === null || pages === null) return
          if (pages.kind === "modify") {
            engine.updateDimStyle(pages.id, patch)
            return
          }
          const id = engine.createDimStyle(pages.name, pages.basedOn, false)
          engine.updateDimStyle(id, patch)
          setSelectedId(id)
          onMade(id)
        }}
      />
    </div>
  )
}

/**
 * Create New Dimension Style (d05-2): New Style Name, `Copy of` the style
 * Start With names until it is typed over, Start With, Continue and Cancel.
 * WHY no Annotative or Use for: annotative scaling and a style's
 * sub-styles do not exist here.
 */
function CreateNewDimStyle({
  open,
  engine,
  styles,
  startWith: initial,
  onDone,
}: {
  open: boolean
  engine: CadEngine
  styles: readonly DimStyleInfo[]
  startWith: string
  onDone: (answer: { name: string; basedOn: string } | null) => void
}): ReactElement {
  const portal = usePortalContainer()
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onDone(null)
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Popup
          aria-modal="true"
          className={`${DIALOG_POPUP} w-fit min-w-96`}
        >
          {open && (
            <CreateForm
              engine={engine}
              styles={styles}
              initial={initial}
              onDone={onDone}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CreateForm({
  engine,
  styles,
  initial,
  onDone,
}: {
  engine: CadEngine
  styles: readonly DimStyleInfo[]
  initial: string
  onDone: (answer: { name: string; basedOn: string } | null) => void
}): ReactElement {
  const t = useEditorText("DimStyle")
  const [basedOn, setBasedOn] = useState(initial)
  const [typed, setTyped] = useState<string | null>(null)
  const name = typed ?? engine.proposedStyleName("dimension", basedOn)
  const nameId = useId()
  const startId = useId()
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onDone({
          name: name.trim() || engine.proposedStyleName("dimension", basedOn),
          basedOn,
        })
      }}
    >
      <Dialog.Title className="mb-3 text-title">
        {t("createTitle")}
      </Dialog.Title>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2">
        <label htmlFor={nameId} className="text-muted-foreground">
          {t("newStyleName")}
        </label>
        <input
          id={nameId}
          value={name}
          spellCheck={false}
          autoComplete="off"
          onChange={(event) => setTyped(event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          className={FIELD}
        />
        <span id={startId} className="text-muted-foreground">
          {t("startWith")}
        </span>
        <Select
          items={Object.fromEntries(
            styles.map((style) => [style.id, style.name])
          )}
          value={basedOn}
          onValueChange={(value) => {
            if (value != null) setBasedOn(value as string)
          }}
        >
          <SelectTrigger aria-labelledby={startId} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {styles.map((style) => (
              <SelectItem key={style.id} value={style.id}>
                {style.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button type="submit" variant="outline">
          {t("continue")}
        </Button>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          }
        />
      </div>
    </form>
  )
}

/**
 * New Dimension Style and Modify Dimension Style (d05-3,
 * `phase3/dimmod-0.png` to `-6.png`): the pages, each with what a style has
 * here, the groups in AutoCAD's order; OK hands the changes over in one
 * patch, Cancel drops them. WHY no Alternate Units or Tolerances page, and
 * no preview: nothing of theirs exists here, and no preview is drawn yet.
 */
function DimStylePages({
  title,
  style,
  onDone,
}: {
  title: string
  style: DimStyleInfo | null
  onDone: (patch: DimStylePatch | null) => void
}): ReactElement {
  const portal = usePortalContainer()
  return (
    <Dialog.Root
      open={style !== null}
      onOpenChange={(next) => {
        if (!next) onDone(null)
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Popup
          aria-modal="true"
          className={`${DIALOG_POPUP} w-fit min-w-141`}
        >
          {style !== null && (
            <PagesForm title={title} style={style} onDone={onDone} />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function PagesForm({
  title,
  style,
  onDone,
}: {
  title: string
  style: DimStyleInfo
  onDone: (patch: DimStylePatch | null) => void
}): ReactElement {
  const t = useEditorText("DimStyle")
  const [page, setPage] = useState<Page>("lines")
  const [patch, setPatch] = useState<DimStylePatch>({})
  const value = <K extends keyof DimStylePatch>(key: K) =>
    (patch[key] ?? style[key]) as NonNullable<DimStylePatch[K]>
  const set = (change: DimStylePatch) =>
    setPatch((last) => ({ ...last, ...change }))
  // DIMCEN 0 is None; a mark keeps the size it had, or ISO-25's 2.5.
  const [markSize, setMarkSize] = useState(
    style.centerMark > 0 ? style.centerMark : 2.5
  )
  const angular = value("angleDecimals")

  const number = (
    label: string,
    key:
      | "baselineSpacing"
      | "extensionBeyond"
      | "extensionOffset"
      | "arrowSize"
      | "textHeight"
      | "textGap"
      | "scale"
  ) => (
    <NumberRow
      label={label}
      value={value(key)}
      onCommit={(next) => set({ [key]: next })}
    />
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onDone(patch)
      }}
    >
      <Dialog.Title className="mb-3 text-title">{title}</Dialog.Title>
      <Tabs.Root value={page} onValueChange={(next) => setPage(next as Page)}>
        <Tabs.List className="flex border-b">
          {PAGES.map((id) => (
            <Tabs.Tab
              key={id}
              value={id}
              className="-mb-px h-7 border-b-2 border-transparent px-2 whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-active data-active:text-foreground"
            >
              {t(id)}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <div className="h-72 overflow-y-auto pt-3">
          <Tabs.Panel
            value="lines"
            className="flex flex-col gap-3 outline-none"
          >
            <Group title={t("dimensionLines")}>
              {number(t("baselineSpacing"), "baselineSpacing")}
            </Group>
            <Group title={t("extensionLines")}>
              {number(t("extendBeyondDimLines"), "extensionBeyond")}
              {number(t("offsetFromOrigin"), "extensionOffset")}
            </Group>
          </Tabs.Panel>
          <Tabs.Panel
            value="symbolsAndArrows"
            className="flex flex-col gap-3 outline-none"
          >
            <Group title={t("arrowheads")}>
              {number(t("arrowSize"), "arrowSize")}
            </Group>
            <Group title={t("centerMarks")}>
              <div
                role="radiogroup"
                aria-label={t("centerMarks")}
                className="flex flex-col"
              >
                {(["none", "mark"] as const).map((kind) => (
                  <label key={kind} className="flex h-7 items-center gap-2">
                    <input
                      type="radio"
                      name="center-marks"
                      checked={value("centerMark") > 0 === (kind === "mark")}
                      onChange={() =>
                        set({ centerMark: kind === "mark" ? markSize : 0 })
                      }
                    />
                    {t(kind)}
                  </label>
                ))}
              </div>
              <DecimalInput
                aria-label={t("centerMarks")}
                value={markSize}
                min={0}
                step={0.25}
                disabled={value("centerMark") <= 0}
                valid={(next) => next > 0}
                onCommit={(next) => {
                  setMarkSize(next)
                  set({ centerMark: next })
                }}
                className={`${FIELD} w-24 self-end`}
              />
            </Group>
          </Tabs.Panel>
          <Tabs.Panel value="text" className="flex flex-col gap-3 outline-none">
            <Group title={t("textAppearance")}>
              {number(t("textHeight"), "textHeight")}
            </Group>
            <Group title={t("textPlacement")}>
              {number(t("offsetFromDimLine"), "textGap")}
            </Group>
          </Tabs.Panel>
          <Tabs.Panel value="fit" className="flex flex-col gap-3 outline-none">
            <Group title={t("scaleForFeatures")}>
              {number(t("useOverallScale"), "scale")}
            </Group>
            <Group title={t("fineTuning")}>
              {/* DIMTOFL: a radial dimension placed outside keeps its line. */}
              <Check
                label={t("drawDimLine")}
                checked={value("forceLineInside")}
                onChange={(forceLineInside) => set({ forceLineInside })}
              />
            </Group>
          </Tabs.Panel>
          <Tabs.Panel
            value="primaryUnits"
            className="flex flex-col gap-3 outline-none"
          >
            <Group title={t("linearDimensions")}>
              <Choice
                label={t("precision")}
                value={String(value("decimals"))}
                choices={Object.fromEntries(
                  PLACES.map((text, places) => [String(places), text])
                )}
                mono
                onChoose={(next) => set({ decimals: Number(next) })}
              />
              <Choice
                label={t("decimalSeparator")}
                value={value("decimalSeparator")}
                choices={{ ",": t("comma"), ".": t("period"), " ": t("space") }}
                onChoose={(decimalSeparator) => set({ decimalSeparator })}
              />
              <span className="text-muted-foreground">
                {t("zeroSuppression")}
              </span>
              <Check
                label={t("trailing")}
                checked={value("suppressTrailingZeros")}
                onChange={(suppressTrailingZeros) =>
                  set({ suppressTrailingZeros })
                }
              />
            </Group>
            <Group title={t("angularDimensions")}>
              {/* DIMADEC −1 takes the linear precision, which the list shows. */}
              <Choice
                label={t("angularPrecision")}
                value={String(angular < 0 ? value("decimals") : angular)}
                choices={Object.fromEntries(
                  PLACES.map((text, places) => [String(places), text])
                )}
                mono
                onChoose={(next) => set({ angleDecimals: Number(next) })}
              />
            </Group>
          </Tabs.Panel>
        </div>
      </Tabs.Root>
      <div className="mt-3 flex justify-end gap-2">
        <Button type="submit" variant="outline">
          {t("ok")}
        </Button>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          }
        />
      </div>
    </form>
  )
}

function NumberRow({
  label,
  value,
  onCommit,
}: {
  label: string
  value: number
  onCommit: (value: number) => void
}): ReactElement {
  const id = useId()
  return (
    <>
      <label htmlFor={id} className="text-muted-foreground">
        {label}
      </label>
      <DecimalInput
        id={id}
        value={value}
        min={0}
        step={0.25}
        live
        valid={(next) => next >= 0}
        onCommit={onCommit}
        className={`${FIELD} w-24`}
      />
    </>
  )
}

function Choice({
  label,
  value,
  choices,
  mono,
  onChoose,
}: {
  label: string
  value: string
  choices: Record<string, string>
  mono?: boolean
  onChoose: (value: string) => void
}): ReactElement {
  const id = useId()
  return (
    <>
      <span id={id} className="text-muted-foreground">
        {label}
      </span>
      <Select
        items={choices}
        value={value}
        onValueChange={(next) => {
          if (next != null) onChoose(next as string)
        }}
      >
        <SelectTrigger
          aria-labelledby={id}
          className={cn("w-40", mono && "font-mono")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(choices).map(([choice, text]) => (
            <SelectItem
              key={choice}
              value={choice}
              className={cn(mono && "font-mono")}
            >
              {text}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: ReactNode
  checked: boolean
  onChange: (checked: boolean) => void
}): ReactElement {
  return (
    <label className="col-span-2 flex h-7 items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}
