"use client"

import { useEffect, useRef, useState, type ReactElement } from "react"
import { Tooltip } from "@base-ui/react/tooltip"
import { SquareTerminal } from "lucide-react"

import type { CadEngine } from "@mellowcad/engine"
import { cn } from "./utils"
import { en } from "./locales/en"
import { usePortalContainer } from "./ui/portal-container"
import { useEditorText } from "./editor-text"
import type { EditorMessages } from "./locales/types"

type RibbonWords = EditorMessages["Ribbon"]
/** A ribbon control whose tooltip has words of its own: a button's item, or a control's. */
export type TipKey = keyof RibbonWords["tips"]

/** Whether a ribbon item has a tooltip: a list's row (Manage Text Styles...) has none. */
export function isTip(key: string): key is TipKey {
  return key in en.messages.Ribbon.tips
}

/**
 * AutoCAD's delays (the profile's `ToolTipInitialDelay` 1000 and `ExtendAfter`
 * 2.000, Options › Display's Number of Seconds Before Display and Number of
 * Seconds to Delay): the tooltip after a second at rest, the extended one two
 * more after it.
 */
const DELAY_MS = 1000
const EXTEND_MS = 2000

/** A popup that is a list: while one is open no tooltip covers it (`data-ribbon-list`). */
const OPEN_LIST = '[role="menu"], [role="listbox"], [data-ribbon-list]'

/**
 * F1's topic where the tooltip's command is none of the engine's: the command
 * the control runs here (Distance and Area run DIST and AREA, AutoCAD's
 * MEASUREGEOM options; the gallery VSCURRENT), or none (Command Line's
 * COMMANDLINE, Ctrl+9 here), F1 then asking what it asks with no tooltip.
 * `ribbon.test.ts` holds every other command to be the engine's.
 */
export const HELP_INSTEAD: Readonly<Partial<Record<TipKey, string | null>>> = {
  measure: "DIST",
  measurearea: "AREA",
  visualStyleList: "VSCURRENT",
  commandLine: null,
}

/**
 * Which tooltip set F1's topic, per engine: a tooltip opening as another
 * closes runs its effect before the other's cleanup, which must not undo it.
 */
const helpOwners = new WeakMap<CadEngine, object>()

/**
 * A ribbon control's tooltip in AutoCAD's four parts (docs/plans/autocad-ui.md,
 * §2.3): the name, the description, a rule, the command and `Press F1 for more
 * help`; after `EXTEND_MS` more the extended one, its paragraph under the
 * description. The description and the paragraph are the culture's acad.CUIX
 * `HelpString` and AcCommandToolTips.resources.dll entry for the button's macro,
 * a control's its AcWindows `TT_…` entry; the command its `CLICommand`, the
 * command's name in the command language (scripts/research/ribbon-tips.mjs).
 * While it shows, F1 asks Help for that command (`setTooltipHelp`).
 *
 * It wraps what it describes, so a list's arm is never a popup's trigger and a
 * tooltip too (ui.md); none opens while a list is open, its own or another's.
 */
export function RibbonTip({
  tip,
  title,
  engine,
  lang,
  children,
}: {
  tip: TipKey
  /** The button's name, where AutoCAD's tooltip has none of its own (`tipTitles`). */
  title: string
  engine: CadEngine
  /** The command language (`state.commandLine.lang`). */
  lang: string
  children: ReactElement
}): ReactElement {
  const t = useEditorText("Ribbon")
  const portal = usePortalContainer()
  const trigger = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [extended, setExtended] = useState(false)
  const words = en.messages.Ribbon
  const help =
    tip in HELP_INSTEAD
      ? (HELP_INSTEAD[tip] ?? null)
      : String(words.tipCommands[tip])
  // A language that leaves a key out shows English's, so English says which
  // controls have an extended paragraph or a title of their own.
  const paragraph =
    tip in words.extended
      ? t(`extended.${tip as keyof RibbonWords["extended"]}`)
      : null
  const name =
    tip in words.tipTitles
      ? t(`tipTitles.${tip as keyof RibbonWords["tipTitles"]}`)
      : title

  // The extended tooltip grows out of the open one; F1 means this command
  // while either shows.
  useEffect(() => {
    if (!open) return
    const owner = {}
    helpOwners.set(engine, owner)
    engine.setTooltipHelp(help)
    const grow = setTimeout(() => setExtended(true), EXTEND_MS)
    return () => {
      clearTimeout(grow)
      if (helpOwners.get(engine) !== owner) return
      helpOwners.delete(engine)
      engine.setTooltipHelp(null)
    }
  }, [open, engine, help])

  return (
    <Tooltip.Root
      open={open}
      onOpenChange={(next) => {
        const at = trigger.current
        const popups = portal ?? at?.ownerDocument
        // Only a list on screen: a Select's stays mounted, hidden, once used.
        const listOpen = [...(popups?.querySelectorAll(OPEN_LIST) ?? [])].some(
          (list) =>
            list.getClientRects().length > 0 && (!at || !list.contains(at))
        )
        if (next && (listOpen || at?.querySelector('[aria-expanded="true"]')))
          return
        setOpen(next)
        if (!next) setExtended(false)
      }}
    >
      <Tooltip.Trigger
        ref={(node: HTMLElement | null) => {
          trigger.current = node
        }}
        delay={DELAY_MS}
        render={children}
      />
      <Tooltip.Portal container={portal}>
        {/* The z-index on the positioner, its stacking context (ui.md). */}
        <Tooltip.Positioner
          className="z-50"
          side="bottom"
          align="start"
          sideOffset={2}
        >
          <Tooltip.Popup
            data-ribbon-tip
            className={cn(
              "flex max-w-82 flex-col rounded-md border border-border bg-popover p-2 text-ui text-popover-foreground shadow-md",
              "transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0"
            )}
          >
            <span className="text-title text-foreground">{name}</span>
            <span className="mt-1">{t(`tips.${tip}`)}</span>
            {extended && paragraph !== null && (
              <span className="mt-2 whitespace-pre-line">{paragraph}</span>
            )}
            <span aria-hidden className="my-1.5 h-px bg-border" />
            <span className="flex items-center gap-1.5">
              <SquareTerminal
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <span
                lang={lang}
                dir="ltr"
                className="text-title text-foreground"
              >
                {t(`tipCommands.${tip}`)}
              </span>
            </span>
            <span className="mt-1 text-title text-foreground">
              {t("pressF1")}
            </span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
