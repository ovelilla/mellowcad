"use client"

import { useRef, type ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { Button } from "./ui/button"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"

/**
 * AutoCAD's task dialog `Multiline Text - Text Style Change`
 * (AcTaskDialogs' TaskDialog_7): a style picked in Text Editor's gallery
 * while the editor holds text (desktop, 2026-11-26). Yes applies it, No —
 * and the dialog's own Escape — leaves the text as it was. Its `Always
 * change the text style` checkbox is left out.
 */
export function TextStyleChangeDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const t = useEditorText("MText.styleChange")
  // Yes is the task dialog's default button, as Unsaved Changes' is.
  const yes = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root
      open={state.textStyleChangeDialog}
      onOpenChange={(open) => {
        if (!open) engine.answerTextStyleChange("no")
      }}
      // Back to the drawing, from where the editor's box takes focus again.
      onOpenChangeComplete={(open) => {
        if (!open) engine.focusSurface()
      }}
    >
      <Dialog.Portal container={portal}>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/60" />
        {/* aria-modal: the engine leaves a modal dialog's keys to it. */}
        <Dialog.Popup
          aria-modal="true"
          initialFocus={yes}
          finalFocus={false}
          className="fixed inset-0 z-50 m-auto h-fit w-96 rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"
        >
          <Dialog.Title className="mb-2 text-title text-muted-foreground">
            {t("title")}
          </Dialog.Title>
          <Dialog.Description>{t("instruction")}</Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              ref={yes}
              type="button"
              variant="outline"
              onClick={() => engine.answerTextStyleChange("yes")}
            >
              {t("yes")}
            </Button>
            <Dialog.Close
              render={
                <Button type="button" variant="outline">
                  {t("no")}
                </Button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
