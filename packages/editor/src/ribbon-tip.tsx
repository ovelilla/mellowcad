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
/** A tooltip that names its command. */
type CommandTip = keyof RibbonWords["tipCommands"]

/**
 * The controls whose tooltip is their name alone, a rule and `Press F1 for
 * more help`, with no description or command: Text Editor's Justification and
 * Close Text Editor, which no `TT_` describes (desktop 2026-11-27, tip-just,
 * tip-close).
 */
const NAME_ONLY = ["textJustification", "textClose"] as const
type NameOnlyTip = (typeof NAME_ONLY)[number]

/** Whether a ribbon item has a tooltip: a list's row (Manage Text Styles...) has none. */
export function isTip(key: string): key is TipKey | NameOnlyTip {
  return (
    key in en.messages.Ribbon.tips ||
    (NAME_ONLY as readonly string[]).includes(key)
  )
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
  tip: TipKey | NameOnlyTip
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
  // Where the pointer rested as it opened: the tooltip opens there, not
  // under the control.
  const [anchorAt, setAnchorAt] = useState<DOMRect | null>(null)
  const [open, setOpen] = useState(false)
  const [extended, setExtended] = useState(false)
  const words = en.messages.Ribbon
  // A control whose AcWindows `TT_…` names no command (Array Creation's
  // fields and toggles) shows none, F1 then asking what it asks with no
  // tooltip: the running command (the desktop's **unverified**).
  const command = tip in words.tipCommands ? (tip as CommandTip) : null
  const help =
    tip in HELP_INSTEAD
      ? (HELP_INSTEAD[tip as TipKey] ?? null)
      : command && String(words.tipCommands[command])
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
      // A tooltip under the pointer must not take the click meant for the
      // control it covers.
      disableHoverablePopup
      onOpenChange={(next, details) => {
        const at = trigger.current
        const popups = portal ?? at?.ownerDocument
        // Only a list on screen: a Select's stays mounted, hidden, once used.
        const listOpen = [...(popups?.querySelectorAll(OPEN_LIST) ?? [])].some(
          (list) =>
            list.getClientRects().length > 0 && (!at || !list.contains(at))
        )
        if (next && (listOpen || at?.querySelector('[aria-expanded="true"]')))
          return
        if (next) {
          // The event that opened it: the last move once the delay ran out,
          // the entering one in a group opening at once; a focus has no
          // point, and the tooltip goes under the control. The anchor stays
          // as it closes, or it would jump as it fades.
          const event = details.event
          const rtl = at !== null && getComputedStyle(at).direction === "rtl"
          setAnchorAt(
            event instanceof MouseEvent
              ? new DOMRect(event.clientX + (rtl ? -5 : 5), event.clientY, 0, 0)
              : null
          )
        }
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
        {/* The z-index on the positioner, its stacking context (ui.md).
            AutoCAD's opens at the pointer, its corner 5 after it and 26
            under it, and stays there (desktop 2026-11-26, tt-pline-2,
            tt-pline-low: the pointer at 70,85 and 85,118 on one button);
            opened from the keyboard, under the control. */}
        <Tooltip.Positioner
          className="z-50"
          side="bottom"
          align="start"
          anchor={
            anchorAt ? { getBoundingClientRect: () => anchorAt } : undefined
          }
          sideOffset={anchorAt ? 26 : 2}
        >
          <Tooltip.Popup
            data-ribbon-tip
            className={cn(
              "pointer-events-none flex max-w-82 flex-col rounded-md border border-border bg-popover p-2 text-ui text-popover-foreground shadow-md",
              "transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0"
            )}
          >
            <span className="text-title text-foreground">{name}</span>
            {tip in words.tips && (
              <span className="mt-1">{t(`tips.${tip as TipKey}`)}</span>
            )}
            {extended && paragraph !== null && (
              <span className="mt-2 whitespace-pre-line">{paragraph}</span>
            )}
            <span aria-hidden className="my-1.5 h-px bg-border" />
            {command && (
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
                  {t(`tipCommands.${command}`)}
                </span>
              </span>
            )}
            <span className="mt-1 text-title text-foreground">
              {t("pressF1")}
            </span>
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
