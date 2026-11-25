"use client"

import { useId, useState, type ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"

import type { CadEngine } from "@mellowcad/engine"
import { type EditorState, isImeKey } from "@mellowcad/react"
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
import { useEditorText } from "./editor-text"
import {
  DIALOG_POPUP,
  DialogBackdrop,
  FIELD,
  Group,
  type StyleFilter,
  inUse,
} from "./style-dialog-parts"

/** The one font every style draws in (`domain/textFontMetrics.ts`). */
const FONT = "Arial"

/**
 * AutoCAD's Text Style dialog (STYLE, desktop d07-1,
 * `research/ui/2026-11-25/phase3/text-style.png`), with what a style has
 * here: `Current text style:`, the Styles list and its All styles / Styles
 * in use filter; Font Name, which is Arial for every style; Height; Set
 * Current, New..., Delete; Apply and Cancel, which reads Close once a change
 * is made. A height typed waits for Apply, or for the next style picked, Set
 * Current or New (where AutoCAD asks first: **unverified**); Cancel drops
 * it. The run is STYLE's, one step U names, and closing the dialog ends it.
 * WHY no preview, Font Style, Use Big Font, Annotative or Effects, nor Help:
 * a style here has none of them, and no host page answers Help yet
 * (`docs/coverage/dimensions.md`, STYLE).
 */
export function TextStyleDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const open = state.styleDialog === "text"
  const close = () => engine.setStyleDialog(null)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close()
      }}
      onOpenChangeComplete={(next) => {
        if (!next) engine.focusSurface()
      }}
    >
      <Dialog.Portal container={portal}>
        <DialogBackdrop />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className={`${DIALOG_POPUP} w-fit min-w-154`}
        >
          {open && <TextStyleForm engine={engine} state={state} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function TextStyleForm({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const t = useEditorText("TextStyle")
  const [selectedId, setSelectedId] = useState(state.currentTextStyleId)
  const [filter, setFilter] = useState<StyleFilter>("all")
  const [height, setHeight] = useState<number | null>(null)
  const [changed, setChanged] = useState(false)
  const [naming, setNaming] = useState<string | null>(null)
  const heightId = useId()
  const filterId = useId()

  const current = state.currentTextStyleId
  const listed = state.textStyles.filter(
    (style) => filter === "all" || inUse(style, current)
  )
  // Only a style the list shows is selected: the filter may hide the one
  // picked, and the current style is always in use.
  const selected =
    listed.find((style) => style.id === selectedId) ??
    listed.find((style) => style.id === current) ??
    state.textStyles[0]
  const pending = height !== null && height !== selected.height
  // AutoCAD: "you cannot delete a style that is current or in use", nor
  // Standard.
  const deletable =
    selected.id !== "Standard" &&
    selected.id !== current &&
    selected.entityCount === 0

  const apply = () => {
    if (pending) {
      engine.updateTextStyle(selected.id, { height })
      setChanged(true)
    }
    setHeight(null)
  }

  return (
    <div>
      <Dialog.Title className="mb-2 text-title">{t("title")}</Dialog.Title>
      <p className="mb-1 text-muted-foreground">
        {t("current", {
          name: state.textStyles.find((s) => s.id === current)?.name ?? current,
        })}
      </p>
      <div className="grid grid-cols-[11rem_auto_auto] gap-x-4">
        <div className="flex min-h-0 flex-col gap-2">
          <span className="text-muted-foreground">{t("styles")}</span>
          <StyleList
            label={t("styles")}
            styles={listed}
            selectedId={selected.id}
            onSelect={(id) => {
              apply()
              setSelectedId(id)
            }}
            onRename={(id, name) => {
              engine.updateTextStyle(id, { name })
              setChanged(true)
            }}
            className="h-40"
          />
          <Select
            items={{ all: t("allStyles"), inUse: t("stylesInUse") }}
            value={filter}
            onValueChange={(value) => {
              if (value != null) setFilter(value as StyleFilter)
            }}
          >
            <SelectTrigger
              id={filterId}
              aria-label={t("styles")}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("allStyles")}</SelectItem>
              <SelectItem value="inUse">{t("stylesInUse")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 pt-6">
          <Group title={t("font")}>
            <span className="text-muted-foreground">{t("fontName")}</span>
            <Select items={{ [FONT]: FONT }} value={FONT} disabled>
              <SelectTrigger aria-label={t("fontName")} className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FONT}>{FONT}</SelectItem>
              </SelectContent>
            </Select>
          </Group>
          <Group title={t("size")}>
            <label htmlFor={heightId} className="text-muted-foreground">
              {t("height")}
            </label>
            <DecimalInput
              key={selected.id}
              id={heightId}
              value={height ?? selected.height}
              min={0}
              live
              valid={(value) => value >= 0}
              onCommit={setHeight}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isImeKey(event)) apply()
              }}
              className={`${FIELD} w-44`}
            />
          </Group>
        </div>

        <div className="flex flex-col gap-2 pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={selected.id === current && !pending}
            onClick={() => {
              apply()
              engine.setCurrentTextStyle(selected.id)
              setChanged(true)
            }}
          >
            {t("setCurrent")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              apply()
              setNaming(engine.proposedStyleName("text", selected.id))
            }}
          >
            {t("new")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!deletable}
            onClick={() => {
              // A height typed for the style deleted goes with it.
              setHeight(null)
              if (engine.removeTextStyle(selected.id)) {
                setSelectedId(current)
                setChanged(true)
              }
            }}
          >
            {t("delete")}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={!pending}
          onClick={apply}
        >
          {t("apply")}
        </Button>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t(changed ? "close" : "cancel")}
            </Button>
          }
        />
      </div>

      <NewTextStyle
        name={naming}
        onDone={(name) => {
          setNaming(null)
          if (name === null) return
          // New makes a copy of the style selected, current (d07-2, d07-3).
          setSelectedId(engine.createTextStyle(name || undefined, selected.id))
          setChanged(true)
        }}
      />
    </div>
  )
}

/**
 * New Text Style (desktop d07-2, `phase3/new-text-style.png`): Style Name,
 * filled with the name New proposes (`style1`), OK and Cancel.
 */
function NewTextStyle({
  name,
  onDone,
}: {
  name: string | null
  onDone: (name: string | null) => void
}): ReactElement {
  const t = useEditorText("TextStyle")
  const portal = usePortalContainer()
  const fieldId = useId()
  return (
    <Dialog.Root
      open={name !== null}
      onOpenChange={(next) => {
        if (!next) onDone(null)
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Popup
          aria-modal="true"
          className={`${DIALOG_POPUP} w-fit min-w-80`}
        >
          {name !== null && (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const field = event.currentTarget.elements.namedItem("name")
                onDone(
                  field instanceof HTMLInputElement ? field.value.trim() : ""
                )
              }}
            >
              <Dialog.Title className="mb-3 text-title">
                {t("newTitle")}
              </Dialog.Title>
              <div className="flex items-center gap-3">
                <label htmlFor={fieldId} className="text-muted-foreground">
                  {t("styleName")}
                </label>
                <input
                  id={fieldId}
                  name="name"
                  defaultValue={name}
                  spellCheck={false}
                  autoComplete="off"
                  onFocus={(event) => event.currentTarget.select()}
                  className={`${FIELD} min-w-0 flex-1`}
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
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
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
