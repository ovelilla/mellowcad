"use client"

import * as React from "react"
import { Menu } from "@base-ui/react/menu"
import { Check, ChevronRight } from "lucide-react"

import type {
  CadEngine,
  ShortcutMenuAction,
  ShortcutMenuEntry,
} from "@mellowcad/engine"
import type { EditorState } from "@mellowcad/react"
import { usePortalContainer } from "./ui/portal-container"

import {
  MENU_AT_CURSOR,
  SEPARATOR,
  SnapOverrideItems,
} from "./snap-override-menu"
import { useEditorText } from "./editor-text"

/**
 * AutoCAD's shortcut menus of the drawing area — Default, Edit and Command —
 * at the cursor a right-click opened them. The engine decides which one opens
 * and what it holds (`state.shortcutMenu`) and runs the choice; like the
 * object-snap override menu, this is a controlled Base UI menu anchored to a
 * virtual element, whose backdrop takes the click that dismisses it.
 */

const ITEM =
  "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 ps-2 pe-8 text-ui outline-hidden select-none data-disabled:text-faint-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground data-popup-open:bg-accent"

/** The entries that are a tool, named as the tool palette names it. */
const TOOL_OF: Partial<Record<ShortcutMenuAction, string>> = {
  cut: "cutclip",
  copy: "copyclip",
  pan: "pan",
  erase: "erase",
  move: "move",
  scale: "scale",
  rotate: "rotate",
}

const KEY_OF = {
  cut: "cut",
  copy: "copy",
  copyBase: "copyBase",
  paste: "paste",
} as const

function entryKey(entry: ShortcutMenuEntry): string {
  switch (entry.kind) {
    case "action":
      return entry.action
    case "option":
      return `option:${entry.option.id}`
    case "submenu":
      return entry.submenu
    case "snapOverrides":
      return "snapOverrides"
    case "dimensionStyle":
      return "dimensionStyle"
  }
}

export function ShortcutMenu({
  engine,
  state,
}: {
  engine: CadEngine
  state: EditorState
}) {
  const portal = usePortalContainer()
  const t = useEditorText("ShortcutMenu")
  const keys = useEditorText("Keys")
  // The last menu stays rendered while the popup fades out.
  const [shown, setShown] = React.useState(state.shortcutMenu)
  if (state.shortcutMenu && state.shortcutMenu !== shown) {
    setShown(state.shortcutMenu)
  }
  const menu = state.shortcutMenu ?? shown
  const at = state.shortcutMenu?.at ?? null

  // The state speaks the canvas's pixels; the popup is placed in the viewport's.
  const anchor = React.useMemo(
    () =>
      at
        ? {
            getBoundingClientRect: () => {
              const { x, y } = engine.clientFromScreen(at)
              return new DOMRect(x, y, 0, 0)
            },
          }
        : null,
    [engine, at]
  )

  const label = (action: ShortcutMenuAction): string => {
    const tool = TOOL_OF[action]
    if (tool !== undefined) {
      return state.tools.find((entry) => entry.id === tool)?.label ?? tool
    }
    switch (action) {
      case "repeat":
        return t("repeat", { command: menu?.repeat ?? "" })
      // acad.cuix's PopMenuRoot capitals (`Copy with &Base Point`), where
      // the tool's name is in sentence case.
      case "copyBase":
        return t("copyBase")
      case "paste":
        return t("paste")
      case "undo":
        return t("undo")
      case "redo":
        return t("redo")
      // AutoCAD's own name for COPY in this menu, which tells it from the
      // Clipboard's Copy.
      case "copySelection":
        return t("copySelection")
      case "deselectAll":
        return t("deselectAll")
      case "properties":
        return t("properties")
      case "enter":
        return t("enter")
      default:
        return t("cancel")
    }
  }

  const entry = (item: ShortcutMenuEntry): React.ReactNode => {
    switch (item.kind) {
      case "action": {
        const key =
          item.action in KEY_OF
            ? KEY_OF[item.action as keyof typeof KEY_OF]
            : null
        return (
          <Menu.Item
            key={entryKey(item)}
            disabled={
              (item.action === "undo" && !state.canUndo) ||
              (item.action === "redo" && !state.canRedo)
            }
            onClick={() => engine.chooseShortcutMenuAction(item.action)}
            className={ITEM}
          >
            {label(item.action)}
            {key && (
              <kbd
                dir="ltr"
                className="ms-auto ps-4 font-mono text-muted-foreground"
              >
                {keys(key)}
              </kbd>
            )}
          </Menu.Item>
        )
      }
      case "option":
        return (
          <Menu.Item
            key={entryKey(item)}
            lang={state.commandLine.lang}
            onClick={() => engine.chooseShortcutMenuOption(item.option.id)}
            className={ITEM}
          >
            {item.option.label}
          </Menu.Item>
        )
      case "submenu":
        return (
          <Submenu key={entryKey(item)} label={t("clipboard")}>
            {item.entries.map(entry)}
          </Submenu>
        )
      case "snapOverrides":
        return (
          <Submenu key={entryKey(item)} label={t("snapOverrides")}>
            <SnapOverrideItems engine={engine} state={state} />
          </Submenu>
        )
      case "dimensionStyle":
        return (
          <Submenu key={entryKey(item)} label={t("dimensionStyle")}>
            <Menu.RadioGroup
              value={item.current}
              onValueChange={(id: string) =>
                engine.chooseShortcutMenuDimStyle(id)
              }
            >
              {item.styles.map((style) => (
                <Menu.RadioItem
                  key={style.id}
                  value={style.id}
                  closeOnClick
                  className={ITEM}
                >
                  {style.name}
                  <Menu.RadioItemIndicator>
                    <Check className="absolute inset-e-2 size-4 text-primary" />
                  </Menu.RadioItemIndicator>
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Submenu>
        )
    }
  }

  return (
    <Menu.Root
      open={!!state.shortcutMenu}
      onOpenChange={(open) => {
        if (!open) engine.closeShortcutMenu()
      }}
    >
      <Menu.Portal container={portal}>
        <Menu.Backdrop />
        <Menu.Positioner
          anchor={anchor}
          positionMethod="fixed"
          side="inline-end"
          align="start"
          sideOffset={2}
          className="z-50"
        >
          {/* Focus goes back to the drawing, never to the empty trigger. The
              engine's own focusSurface on closing comes too early: a modal
              menu leaves the rest of the page inert until it has closed. */}
          <Menu.Popup
            aria-label={t("label")}
            finalFocus={() => {
              engine.focusSurface()
              return false
            }}
            className={MENU_AT_CURSOR}
          >
            {menu?.groups.map((group, index) => (
              <React.Fragment key={entryKey(group[0])}>
                {index > 0 && <Menu.Separator className={SEPARATOR} />}
                {group.map(entry)}
              </React.Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

function Submenu({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  const portal = usePortalContainer()
  return (
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger className={ITEM}>
        {label}
        <ChevronRight className="absolute inset-e-2 size-4 rtl:-scale-x-100" />
      </Menu.SubmenuTrigger>
      <Menu.Portal container={portal}>
        <Menu.Positioner
          side="inline-end"
          align="start"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className={MENU_AT_CURSOR}>{children}</Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.SubmenuRoot>
  )
}
