"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { LibraryBig, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  CadEngine,
  CanvasScenePresenter,
  EngineState,
  matchesWildcard,
} from "@/cad"

const THUMBNAIL_PX = 64

/**
 * AutoCAD's Blocks palette, Current Drawing tab: the blocks defined in the
 * drawing shown as previews, filtered by name, and inserted by "clicking and
 * placing them" — which starts INSERT with the block already chosen, so the
 * insertion point, scale and rotation are answered exactly as when typed.
 *
 * Not here: the Recent, Favorites and Libraries tabs, which list blocks from
 * *other* drawings and so need file access and a stored history.
 */
export function BlocksControl({
  engine,
  state,
}: {
  engine: CadEngine
  state: EngineState
}) {
  const t = useTranslations("Editor.Blocks")
  const [filter, setFilter] = useState("")

  const shown = useMemo(
    () => state.blocks.filter((block) => matchesWildcard(block.name, filter)),
    [state.blocks, filter]
  )

  return (
    // Placing the block clicks the canvas, which dismisses the popover, so a
    // run of symbols means reopening it — AutoCAD's palette is dockable and
    // stays up. Its own answer to that is the Repeat Placement option, which
    // belongs with the rest of the palette's option checkboxes.
    <Popover
      open={state.blocksPanel}
      onOpenChange={(open) => engine.setBlocksPanel(open)}
    >
      <PopoverTrigger
        render={
          <Button
            size="lg"
            variant="ghost"
            aria-label={t("title")}
            className="pointer-events-auto gap-2 rounded-lg bg-card/90 backdrop-blur aria-expanded:bg-card/90"
          >
            <LibraryBig className="shrink-0" />
            <span className="truncate text-xs">{t("title")}</span>
          </Button>
        }
      />
      <PopoverContent side="bottom" align="start" className="w-80 p-2">
        <input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder={t("filter")}
          aria-label={t("filterLabel")}
          className="mb-2 w-full rounded-sm border bg-transparent px-2 py-1 text-xs outline-none focus:border-ring"
        />

        {state.blocks.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {t("empty")}
          </p>
        ) : shown.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {t("noMatch")}
          </p>
        ) : (
          <div className="grid max-h-80 grid-cols-3 gap-1 overflow-y-auto">
            {shown.map((block) => (
              <div key={block.id} className="group relative">
                <button
                  type="button"
                  onClick={() => engine.insertBlock(block.id)}
                  title={t("references", {
                    name: block.name,
                    count: block.referenceCount,
                  })}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-sm p-1",
                    "hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
                  )}
                >
                  <BlockThumbnail engine={engine} id={block.id} />
                  <span className="w-full truncate text-center text-[11px]">
                    {block.name}
                  </span>
                </button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={block.referenceCount > 0}
                  onClick={() => engine.purgeBlocks([block.id])}
                  aria-label={t("purge", { name: block.name })}
                  title={
                    block.referenceCount > 0
                      ? t("inUse")
                      : t("purge", { name: block.name })
                  }
                  className="absolute top-0 right-0 size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/**
 * Draws the block through the same scene pipeline the drawing uses, so a
 * thumbnail can never disagree with what inserting it produces.
 */
function BlockThumbnail({ engine, id }: { engine: CadEngine; id: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const scene = engine.buildBlockPreview(id, THUMBNAIL_PX, THUMBNAIL_PX)
    if (!scene) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = THUMBNAIL_PX * dpr
    canvas.height = THUMBNAIL_PX * dpr
    new CanvasScenePresenter().draw(ctx, scene, dpr)
  }, [engine, id])

  return (
    <canvas
      ref={ref}
      style={{ width: THUMBNAIL_PX, height: THUMBNAIL_PX }}
      className="rounded-sm"
    />
  )
}
