"use client"

import { useId, useState, type ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { Menu } from "@base-ui/react/menu"
import { ChevronDown } from "lucide-react"

import {
  SAVE_FILE_TYPES,
  saveFileName,
  type CadEngine,
  type DxfSaveSettings,
  type SaveAsDialog as SaveAsDialogState,
  type SaveFileType,
} from "@mellowcad/engine"
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
import { useEditorText } from "./editor-text"

const MENU_POPUP =
  "min-w-36 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
const MENU_ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
const POPUP =
  "fixed inset-0 z-50 m-auto h-fit rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"

/**
 * AutoCAD's Save Drawing As (SAVEAS, SAVE, DXFOUT), with what a browser
 * download has: File name, Files of type (this engine's drawing and the DXF
 * versions it writes), Tools ▸ Options… for the Saveas Options dialog, Save
 * and Cancel (desktop dxf/d01). WHY no folder pane, Save in or Places: a
 * download goes where the browser puts it. Save hands the choice to the
 * engine, which writes it and keeps DXF Options for the session.
 */
export function SaveAsDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const dialog = state.saveAsDialog
  const close = () => engine.setSaveAsDialog(false)
  return (
    <Dialog.Root
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) close()
      }}
      // Back to the drawing, where Select objects asks for the set.
      onOpenChangeComplete={(open) => {
        if (!open) engine.focusSurface()
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          finalFocus={false}
          className={`${POPUP} w-120`}
        >
          {dialog && <SaveAsForm engine={engine} dialog={dialog} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function SaveAsForm({
  engine,
  dialog,
}: {
  engine: CadEngine
  dialog: SaveAsDialogState
}): ReactElement {
  const t = useEditorText("SaveAs")
  const portal = usePortalContainer()
  const [fileName, setFileName] = useState(dialog.fileName)
  const [fileType, setFileType] = useState<SaveFileType>(dialog.fileType)
  const [dxf, setDxf] = useState<DxfSaveSettings>(dialog.dxf)
  const [options, setOptions] = useState(false)
  const nameId = useId()
  const typeId = useId()
  const types = Object.fromEntries(
    SAVE_FILE_TYPES.map((type) => [type, t(type)])
  )

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void engine.saveAs({ fileName, fileType, dxf })
      }}
    >
      <Dialog.Title className="mb-3 text-title">{t("title")}</Dialog.Title>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2">
        <label htmlFor={nameId} className="text-muted-foreground">
          {t("fileName")}
        </label>
        <input
          id={nameId}
          value={fileName}
          spellCheck={false}
          autoComplete="off"
          dir="ltr"
          onChange={(event) => setFileName(event.target.value)}
          className="h-7 min-w-0 rounded-md border border-input bg-background px-2 font-mono outline-none focus-visible:border-ring"
        />
        <Button type="submit" variant="outline">
          {t("save")}
        </Button>
        <span id={typeId} className="text-muted-foreground">
          {t("fileType")}
        </span>
        <Select
          items={types}
          value={fileType}
          onValueChange={(value) => {
            if (value == null) return
            const type = value as SaveFileType
            setFileType(type)
            // Save Drawing As puts the type's extension on the name (d01).
            setFileName((name) => saveFileName(name, type))
          }}
        >
          <SelectTrigger aria-labelledby={typeId} className="w-full min-w-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SAVE_FILE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {types[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog.Close
          render={
            <Button type="button" variant="outline">
              {t("cancel")}
            </Button>
          }
        />
      </div>
      <div className="mt-3 flex justify-end">
        {/* Tools ▸ Options…, where AutoCAD keeps Saveas Options (d01). */}
        <Menu.Root>
          <Menu.Trigger
            render={
              <Button type="button" variant="ghost">
                {t("tools")}
                <ChevronDown />
              </Button>
            }
          />
          <Menu.Portal container={portal}>
            <Menu.Positioner
              side="bottom"
              align="end"
              sideOffset={2}
              className="z-50"
            >
              <Menu.Popup className={MENU_POPUP}>
                <Menu.Item
                  className={MENU_ITEM}
                  onClick={() => setOptions(true)}
                >
                  {t("options")}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
      <SaveAsOptions
        open={options}
        settings={dxf}
        onDone={(settings) => {
          if (settings) setDxf(settings)
          setOptions(false)
        }}
      />
    </form>
  )
}

/**
 * Saveas Options, its DXF Options tab: Format, Select objects, the thumbnail
 * preview and the decimal places (desktop dxf/d01). WHY no DWG Options tab:
 * no DWG is written here. WHY the preview always off and greyed: no
 * thumbnail is written yet (`docs/next-dxf.md`, phase 5), as AutoCAD greys
 * the box where it writes none.
 */
function SaveAsOptions({
  open,
  settings,
  onDone,
}: {
  open: boolean
  settings: DxfSaveSettings
  onDone: (settings: DxfSaveSettings | null) => void
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
        <Dialog.Popup aria-modal="true" className={`${POPUP} w-96`}>
          {open && <OptionsForm settings={settings} onDone={onDone} />}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function OptionsForm({
  settings,
  onDone,
}: {
  settings: DxfSaveSettings
  onDone: (settings: DxfSaveSettings | null) => void
}): ReactElement {
  const t = useEditorText("SaveAs")
  const [binary, setBinary] = useState(settings.binary)
  const [selectObjects, setSelectObjects] = useState(settings.selectObjects)
  const [precision, setPrecision] = useState(settings.precision)
  const precisionId = useId()
  return (
    <div
      role="group"
      onKeyDown={(event) => {
        // Enter is OK's, but on a button that button's own (Cancel).
        if (event.key !== "Enter" || event.target instanceof HTMLButtonElement)
          return
        event.preventDefault()
        onDone({ binary, selectObjects, precision })
      }}
    >
      <Dialog.Title className="mb-3 text-title">
        {t("optionsTitle")}
      </Dialog.Title>
      <div role="tablist" className="mb-2 flex border-b">
        <span
          role="tab"
          aria-selected="true"
          className="-mb-px border-b-2 border-active px-3 py-1.5"
        >
          {t("dxfOptions")}
        </span>
      </div>
      <div role="tabpanel" className="flex flex-col gap-3">
        <div className="flex items-start gap-6">
          <fieldset className="rounded-md border px-3 pb-2">
            <legend className="px-1 text-muted-foreground">
              {t("format")}
            </legend>
            {[false, true].map((value) => (
              <label
                key={String(value)}
                className="flex h-7 items-center gap-2"
              >
                <input
                  type="radio"
                  name="dxf-format"
                  checked={binary === value}
                  onChange={() => setBinary(value)}
                />
                {t(value ? "binary" : "ascii")}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col pt-2">
            <label className="flex h-7 items-center gap-2">
              <input
                type="checkbox"
                checked={selectObjects}
                onChange={(event) => setSelectObjects(event.target.checked)}
              />
              {t("selectObjects")}
            </label>
            <label className="flex h-7 items-center gap-2 text-faint-foreground">
              <input type="checkbox" checked={false} disabled readOnly />
              {t("preview")}
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor={precisionId} className="text-muted-foreground">
            {t("precision")}
          </label>
          <DecimalInput
            id={precisionId}
            value={precision}
            min={0}
            live
            valid={(value) =>
              Number.isInteger(value) && value >= 0 && value <= 16
            }
            onCommit={setPrecision}
            className="h-7 w-12 rounded-md border border-input bg-background px-2 font-mono outline-none focus-visible:border-ring"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onDone({ binary, selectObjects, precision })}
        >
          {t("ok")}
        </Button>
        <Button type="button" variant="outline" onClick={() => onDone(null)}>
          {t("cancel")}
        </Button>
      </div>
    </div>
  )
}
