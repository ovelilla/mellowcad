"use client"

import { useRef, type ReactElement } from "react"
import { Dialog } from "@base-ui/react/dialog"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { Button } from "./ui/button"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"

/**
 * AutoCAD's task dialog `Multiline Text - Unsaved Changes`: Escape in
 * MTEXT's editor, or TEXTEDIT's on a multiline text, found changes (desktop
 * text/d05-5). Yes keeps the text, No discards it, Cancel — and the dialog's
 * own Escape, as a task dialog's — goes back to the editor. Its `Always
 * perform my current choice` checkbox is left out.
 */
export function UnsavedTextDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}): ReactElement {
  const portal = usePortalContainer()
  const t = useEditorText("MText.unsavedChanges")
  // Yes is the task dialog's default button (desktop text/d05-5).
  const yes = useRef<HTMLButtonElement>(null)

  return (
    <Dialog.Root
      open={state.unsavedTextDialog}
      onOpenChange={(open) => {
        if (!open) engine.answerUnsavedText("cancel")
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
              onClick={() => engine.answerUnsavedText("yes")}
            >
              {t("yes")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => engine.answerUnsavedText("no")}
            >
              {t("no")}
            </Button>
            <Dialog.Close
              render={
                <Button type="button" variant="outline">
                  {t("cancel")}
                </Button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
