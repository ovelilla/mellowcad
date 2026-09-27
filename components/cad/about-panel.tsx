"use client"

import { Info, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site"

import { Panel } from "./toolbar-primitives"

/**
 * The "about" affordance: what this is, that it is unfinished, that nothing
 * leaves the browser, and how to reach me. Sits in the status-bar corner, the
 * one region AutoCAD keeps for tray-style chrome rather than drafting state.
 */
export function AboutPanel() {
  const t = useTranslations("Editor.About")
  return (
    <Panel>
      <Popover>
        {/* The trigger must render the Button, not the Panel: Panel does not
            forward props, so a trigger rendered as Panel silently loses its
            click handler. No tooltip either — it blocks the popover. */}
        <PopoverTrigger
          render={
            <Button size="icon-sm" variant="ghost" aria-label={t("label")}>
              <Info />
            </Button>
          }
        />
        <PopoverContent side="top" align="end" className="w-80 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">{SITE_NAME}</p>
            <span className="rounded border border-border/60 px-1.5 py-px text-[10px] tracking-wide text-muted-foreground uppercase">
              {t("status")}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("intro")}
          </p>

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("storage")}
          </p>

          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{t("gettingStarted")}</p>
            <p className="leading-relaxed">
              {t.rich("howTo", { key: (chunks) => <Key>{chunks}</Key> })}
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAIL}?subject=MellowCAD`}
            className="flex items-center gap-2 text-xs text-foreground underline-offset-4 hover:underline"
          >
            <Mail className="size-3.5 shrink-0" />
            {CONTACT_EMAIL}
          </a>
        </PopoverContent>
      </Popover>
    </Panel>
  )
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-border/60 bg-muted px-1 font-mono text-[10px] text-foreground">
      {children}
    </kbd>
  )
}
