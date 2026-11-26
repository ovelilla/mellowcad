"use client"

import type { ReactElement } from "react"
import { Menu } from "@base-ui/react/menu"
import { Check } from "lucide-react"

import type { CadEngine } from "@mellowcad/engine"
import { cn } from "./utils"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"
import { drawingFocus } from "./drawing-focus"
import {
  MENU_AT_CURSOR,
  MENU_ITEM,
  SEPARATOR,
  Submenu,
} from "./snap-override-menu"
import { tabText, type RibbonTab } from "./ribbon-home"
import { RIBBON_TABS } from "./ribbon-tabs"
import type { RibbonLayout } from "./ribbon-layout"

/** An entry, its text after the check's column as AutoCAD's are (uia2-ribbon-rclick.txt). */
const ENTRY = cn(MENU_ITEM, "ps-8")

/**
 * The ribbon's right-click menu (docs/plans/autocad-ui.md, §2.3, R13): Show
 * Tabs ▸ and Show Panels ▸, a check per tab and per panel of the tab in front,
 * Show Panel Titles | Close, at the pointer. What it shows and hides is this
 * device's (`RibbonLayout`), as the minimize state is. Its words are each
 * culture's AdWindows BAML (`system:String_99` to `_101`) and AcWindows'
 * RibbonMenuClose. Show Related Tool Palette Group, Tool Palette Group and
 * Undock are not drawn: no tool palettes, no docking here.
 */
export function RibbonMenu({
  at,
  onClose,
  layout,
  setLayout,
  tab,
  engine,
}: {
  /** Where the right-click was, in the viewport; `null` while shut. */
  at: { readonly x: number; readonly y: number } | null
  onClose: () => void
  layout: RibbonLayout
  setLayout: (layout: RibbonLayout) => void
  /** The tab in front, every panel of it, shown or not; none with every tab hidden. */
  tab: RibbonTab | undefined
  engine: CadEngine
}): ReactElement {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const anchor = at && {
    getBoundingClientRect: () => new DOMRect(at.x, at.y, 0, 0),
  }
  const toggle = (list: readonly string[], id: string, shown: boolean) =>
    shown ? list.filter((other) => other !== id) : [...list, id]

  return (
    <Menu.Root
      open={at !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Menu.Portal container={portal}>
        <Menu.Backdrop />
        {/* Under the pointer, its top left at the click, as AutoCAD's
        (uia2-ribbon-rclick.txt): the menu at the cursor of a bar. */}
        <Menu.Positioner
          anchor={anchor}
          positionMethod="fixed"
          side="bottom"
          align="start"
          className="z-50"
        >
          <Menu.Popup
            finalFocus={drawingFocus(engine)}
            className={MENU_AT_CURSOR}
          >
            <Submenu label={t("menu.showTabs")} className={ENTRY}>
              {RIBBON_TABS.map((each) => (
                <CheckEntry
                  key={each.id}
                  label={t(`tabs.${tabText(each)}`)}
                  checked={!layout.hiddenTabs.includes(each.id)}
                  onChange={(shown) =>
                    setLayout({
                      ...layout,
                      hiddenTabs: toggle(layout.hiddenTabs, each.id, shown),
                    })
                  }
                />
              ))}
            </Submenu>
            {tab && (
              <Submenu label={t("menu.showPanels")} className={ENTRY}>
                {tab.panels.map((panel) => (
                  <CheckEntry
                    key={panel.id}
                    label={t(`panels.${panel.id}`)}
                    checked={!layout.hiddenPanels.includes(panel.id)}
                    onChange={(shown) =>
                      setLayout({
                        ...layout,
                        hiddenPanels: toggle(
                          layout.hiddenPanels,
                          panel.id,
                          shown
                        ),
                      })
                    }
                  />
                ))}
              </Submenu>
            )}
            <Menu.Separator className={SEPARATOR} />
            <CheckEntry
              label={t("menu.showPanelTitles")}
              checked={layout.panelTitles}
              onChange={(panelTitles) => setLayout({ ...layout, panelTitles })}
            />
            <Menu.Separator className={SEPARATOR} />
            <Menu.Item className={ENTRY} onClick={() => engine.closeRibbon()}>
              {t("menu.close")}
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}

/**
 * A checked entry: a pick turns it on or off and closes the menu, as a
 * Windows menu's click does (whether AutoCAD's stays open is unverified).
 */
function CheckEntry({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Menu.CheckboxItem
      checked={checked}
      onCheckedChange={onChange}
      closeOnClick
      className={ENTRY}
    >
      <Menu.CheckboxItemIndicator className="absolute inset-s-2 flex">
        <Check aria-hidden className="size-4 text-primary" />
      </Menu.CheckboxItemIndicator>
      {label}
    </Menu.CheckboxItem>
  )
}
