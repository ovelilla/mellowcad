"use client"

import { Menu } from "@base-ui/react/menu"
import { CheckIcon, Globe } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLanguageLinks } from "@/components/language-links"

/**
 * The editor in every live language, at the end of the command bar. The
 * autosave has no language, so the drawing survives the switch.
 */
export function LanguageMenu() {
  const t = useTranslations("Editor.Language")
  const links = useLanguageLinks(useLocale())
  if (links.length === 0) return null
  return (
    <Menu.Root>
      <Tooltip>
        <TooltipTrigger
          render={
            <Menu.Trigger
              render={
                <Button size="icon-sm" variant="ghost" aria-label={t("label")}>
                  <Globe />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom">{t("label")}</TooltipContent>
      </Tooltip>
      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="end"
          sideOffset={6}
          className="z-50"
        >
          <Menu.Popup className="min-w-40 origin-(--transform-origin) overflow-hidden rounded-md border bg-card/90 p-1 text-popover-foreground shadow-md backdrop-blur transition-[transform,opacity] outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {links.map((link) => (
              <Menu.LinkItem
                key={link.locale}
                href={link.href}
                hrefLang={link.locale}
                lang={link.locale}
                aria-current={link.current ? "true" : undefined}
                className="relative flex cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                {link.name}
                {link.current && (
                  <span className="pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center text-primary">
                    <CheckIcon className="size-4" />
                  </span>
                )}
              </Menu.LinkItem>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
