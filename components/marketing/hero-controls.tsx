"use client"

import { Pause, Play, RotateCcw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

/**
 * Pause and replay for the hero's plotting (WCAG 2.2.2: anything that moves
 * for more than five seconds can be stopped). The animation is CSS; this only
 * drives the animations the browser already runs, through their own API.
 */
export function HeroControls({
  targetId,
  pauseLabel,
  playLabel,
  replayLabel,
}: {
  targetId: string
  pauseLabel: string
  playLabel: string
  replayLabel: string
}) {
  const [paused, setPaused] = useState(false)

  const animations = useCallback(
    () =>
      document.getElementById(targetId)?.getAnimations({ subtree: true }) ?? [],
    [targetId]
  )

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return
    // Once everything has played, the pause button has nothing to pause.
    const onEnd = () => {
      if (animations().every((a) => a.playState === "finished")) {
        setPaused(false)
      }
    }
    target.addEventListener("animationend", onEnd)
    return () => target.removeEventListener("animationend", onEnd)
  }, [animations, targetId])

  const toggle = () => {
    for (const animation of animations()) {
      if (paused) animation.play()
      else animation.pause()
    }
    setPaused(!paused)
  }

  const replay = () => {
    for (const animation of animations()) {
      animation.cancel()
      animation.play()
    }
    setPaused(false)
  }

  const button =
    "grid size-7 place-items-center rounded text-fg-subtle transition-colors duration-150 hover:text-fg"

  return (
    <div className="motion-only flex items-center gap-1">
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? playLabel : pauseLabel}
        className={button}
      >
        {paused ? (
          <Play className="size-3.5" aria-hidden="true" />
        ) : (
          <Pause className="size-3.5" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        onClick={replay}
        aria-label={replayLabel}
        className={button}
      >
        <RotateCcw className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
