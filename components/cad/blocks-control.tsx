"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CadEngine,
  CanvasScenePresenter,
  EngineState,
  matchesWildcard,
} from "@/cad"

const THUMBNAIL_PX = 64

/**
 * AutoCAD's Blocks palette, Current Drawing tab, a tab of the palette panel:
 * the blocks defined in the drawing shown as previews, filtered by name, and
 * inserted by "clicking and placing them" — which starts INSERT with the block
 * already chosen, so the insertion point, scale and rotation are answered
 * exactly as when typed. The panel is modeless, so one block after another is
 * a click on each; Repeat Placement, which keeps prompting for points with
 * the same block, is one of the palette's option checkboxes, not built.
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
    <div className="flex min-h-0 flex-1 flex-col p-2">
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
        <div className="grid min-h-0 grid-cols-3 content-start gap-1 overflow-y-auto">
          {shown.map((block) => (
            <div key={block.id} className="group relative">
              <button
                type="button"
                onClick={() => {
                  engine.insertBlock(block.id)
                  engine.focusSurface()
                }}
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
                onClick={() => {
                  engine.purgeBlocks([block.id])
                  engine.focusSurface()
                }}
                aria-label={t("purge", { name: block.name })}
                title={
                  block.referenceCount > 0
                    ? t("inUse")
                    : t("purge", { name: block.name })
                }
                className="absolute inset-e-0 top-0 size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
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
