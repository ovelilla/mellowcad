"use client"

import { useCallback, useLayoutEffect, useRef } from "react"

/**
 * The browser's colour picker behind a list's last row (AutoCAD's Select
 * Color, `More Colors...` on the ribbon): `field` is the ref of a hidden
 * `<input type="color">`, `open` shows its picker, and `onPick` hears the
 * colour once the picker is done with it.
 *
 * WHY the native `change` event: React's `onChange` on that input is the DOM's
 * `input`, which fires on every move of a drag across the picker, and each
 * call applied a colour — one undo step per event. `change` fires once, when
 * the picker commits, so one pick is one step, as AutoCAD's dialog applies on
 * OK.
 */
export function useColorPicker(onPick: (color: string) => void): {
  readonly field: (element: HTMLInputElement | null) => () => void
  readonly open: () => void
} {
  const input = useRef<HTMLInputElement | null>(null)
  const picked = useRef(onPick)
  useLayoutEffect(() => {
    picked.current = onPick
  })

  const field = useCallback((element: HTMLInputElement | null) => {
    input.current = element
    if (!element) return () => {}
    const change = () => picked.current(element.value)
    element.addEventListener("change", change)
    return () => {
      element.removeEventListener("change", change)
      input.current = null
    }
  }, [])

  const open = useCallback(() => {
    const element = input.current
    if (!element) return
    if (typeof element.showPicker === "function") element.showPicker()
    else element.click()
  }, [])

  return { field, open }
}
