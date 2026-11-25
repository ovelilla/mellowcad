"use client"

import { useId, useRef, useState, type ReactElement } from "react"
import { isImeKey } from "@mellowcad/react"

import { cn } from "./utils"

/** Windows' double-click time: a second press inside it is no slow one. */
const DOUBLE_CLICK_MS = 500

export interface ListedStyle {
  readonly id: string
  readonly name: string
}

/**
 * A style dialog's Styles list (Text Style's list view, the Dimension Style
 * Manager's tree), sorted by name as both list them (d05-1, d07-1): one row
 * per style, the selected one highlighted. The arrows move the selection; F2,
 * or a slow second press on the name already pressed, edits it in place, as a
 * Windows list does (the desktop's in-place edit is **unverified**). Enter or
 * leaving the field renames, Escape puts the name back. What a wrapper hands
 * it (a context menu's trigger: its ref and handlers) goes to the list.
 */
export function StyleList({
  label,
  styles,
  selectedId,
  onSelect,
  onRename,
  editing: editingProp,
  onEditingChange,
  className,
  ref,
  onKeyDown,
  ...props
}: Omit<React.ComponentProps<"div">, "onSelect"> & {
  label: string
  styles: readonly ListedStyle[]
  selectedId: string
  onSelect: (id: string) => void
  onRename: (id: string, name: string) => void
  /** The style whose name is being edited, for a caller that starts it (a menu's Rename). */
  editing?: string | null
  onEditingChange?: (id: string | null) => void
  className?: string
}): ReactElement {
  const [ownEditing, setOwnEditing] = useState<string | null>(null)
  const editing = editingProp === undefined ? ownEditing : editingProp
  const setEditing = (id: string | null) => {
    setOwnEditing(id)
    onEditingChange?.(id)
  }
  const list = useRef<HTMLDivElement | null>(null)
  // The last press on a row: a second one on it, slower than a double-click,
  // edits its name.
  const pressed = useRef<{ id: string; at: number } | null>(null)
  const rowId = useId()
  const sorted = [...styles].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  )
  const index = sorted.findIndex((style) => style.id === selectedId)

  const move = (to: number) => {
    const style = sorted[Math.max(0, Math.min(sorted.length - 1, to))]
    if (style) onSelect(style.id)
  }

  return (
    <div
      {...props}
      ref={(node) => {
        list.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      role="listbox"
      tabIndex={0}
      aria-label={label}
      aria-activedescendant={index >= 0 ? `${rowId}-${index}` : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (editing !== null) return
        const step: Record<string, number> = {
          ArrowDown: index + 1,
          ArrowUp: index - 1,
          Home: 0,
          End: sorted.length - 1,
        }
        if (event.key in step) {
          event.preventDefault()
          move(step[event.key])
        } else if (event.key === "F2" && index >= 0) {
          event.preventDefault()
          setEditing(selectedId)
        }
      }}
      className={cn(
        "min-h-0 overflow-y-auto rounded-md border border-input bg-background py-0.5 outline-none focus-visible:border-ring",
        className
      )}
    >
      {sorted.map((style, at) => {
        const selected = style.id === selectedId
        return (
          <div
            key={style.id}
            id={`${rowId}-${at}`}
            role="option"
            aria-selected={selected}
            onPointerDown={(event) => {
              if (event.button !== 0 && event.button !== 2) return
              const last = pressed.current
              pressed.current = { id: style.id, at: event.timeStamp }
              if (
                event.button === 0 &&
                selected &&
                editing === null &&
                last?.id === style.id &&
                event.timeStamp - last.at > DOUBLE_CLICK_MS
              ) {
                setEditing(style.id)
              } else {
                onSelect(style.id)
              }
            }}
            className={cn(
              "flex h-7 items-center px-2 whitespace-nowrap",
              selected && "bg-accent text-accent-foreground"
            )}
          >
            {editing === style.id ? (
              <input
                autoFocus
                aria-label={label}
                defaultValue={style.name}
                spellCheck={false}
                onFocus={(event) => event.currentTarget.select()}
                onPointerDown={(event) => event.stopPropagation()}
                onBlur={(event) => {
                  const name = event.currentTarget.value.trim()
                  setEditing(null)
                  if (name && name !== style.name) onRename(style.id, name)
                }}
                onKeyDown={(event) => {
                  if (isImeKey(event)) return
                  event.stopPropagation()
                  if (event.key === "Enter") {
                    event.preventDefault()
                    event.currentTarget.blur()
                    list.current?.focus()
                  } else if (event.key === "Escape") {
                    // The list's edit only, not the dialog.
                    event.preventDefault()
                    event.currentTarget.value = style.name
                    event.currentTarget.blur()
                    list.current?.focus()
                  }
                }}
                className="h-7 w-full min-w-0 rounded-sm border border-ring bg-background px-1 outline-none"
              />
            ) : (
              <span className="truncate">{style.name}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
