"use client"

import { useState } from "react"
import { Dialog } from "@base-ui/react/dialog"

import type { CadEngine } from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { Button } from "./ui/button"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"

/**
 * AutoCAD's task dialog `Properties - Locked objects`: an edit from the
 * Properties palette or a drop-down left the selected objects on a locked
 * layer unchanged and took them out of the selection (desktop
 * properties/d03-6). Its Show details expander is left out.
 */
export function LockedObjectsDialog({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const portal = usePortalContainer()
  const t = useEditorText("Properties.lockedObjects")
  const dialog = state.lockedObjectsDialog
  // Kept while the popup animates out, so its count does not blank first.
  const [shown, setShown] = useState(dialog)
  if (dialog !== null && dialog !== shown) setShown(dialog)

  return (
    <Dialog.Root
      open={dialog !== null}
      onOpenChange={(open) => {
        if (!open) engine.closeLockedObjectsDialog()
      }}
      // Back to the drawing, not to the control that opened it, so the next
      // key types a command.
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
          className="fixed inset-0 z-50 m-auto h-fit w-96 rounded-lg border bg-card p-3 text-popover-foreground shadow-lg outline-none"
        >
          <Dialog.Title className="mb-2 text-title text-muted-foreground">
            {t("title")}
          </Dialog.Title>
          <Dialog.Description className="mb-2">
            {t("instruction")}
          </Dialog.Description>
          <p>{t("content", { count: shown?.removed ?? 0 })}</p>
          <div className="mt-4 flex justify-end">
            <Dialog.Close
              render={
                <Button type="button" variant="outline">
                  {t("close")}
                </Button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
