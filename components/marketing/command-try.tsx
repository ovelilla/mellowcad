"use client"

import { useId, useRef, useState } from "react"

import { matchCommands, type CommandInfo } from "@mellowcad/engine"

const SUGGESTIONS = 6

type Suggested = Pick<CommandInfo, "name" | "aliases" | "description">

/**
 * The hero's command line, its last line: a `Command:` prompt with the
 * editor's own autocomplete over the real command list, its suggestions
 * opening upwards over the drawing as AutoCAD's do. Enter takes you to the
 * editor — the prompt here is a taste, not a second editor. The commands are
 * fetched when the line is first pointed at or focused (`COMMAND_LIST_PATH`):
 * most visitors never type here, and in the page they were 1.5 KiB of a
 * first load at its budget.
 */
export function CommandTry({
  commandsHref,
  editorHref,
  label,
  placeholder,
  hint,
  prompt,
  lang,
  unknown,
}: {
  /** Where the commands it suggests are, in the page's language. */
  commandsHref: string
  editorHref: string
  label: string
  placeholder: string
  hint: string
  prompt: string
  /** The command language's tag, for the names it offers. */
  lang: string
  /** `{command}` is replaced by what was typed. */
  unknown: string
}) {
  const [text, setText] = useState("")
  const [active, setActive] = useState(0)
  const [commands, setCommands] = useState<readonly Suggested[] | null>(null)
  const requested = useRef(false)
  const listId = useId()
  const hintId = useId()
  const matches = commands ? matchCommands(commands, text, SUGGESTIONS) : []
  const typed = text.trim().toUpperCase()

  const open = () => window.location.assign(editorHref)
  const load = () => {
    if (requested.current) return
    requested.current = true
    fetch(commandsHref)
      .then((response) =>
        response.ok
          ? (response.json() as Promise<Suggested[]>)
          : Promise.reject(new Error(response.statusText))
      )
      .then(setCommands)
      .catch(() => {
        // Offline: no suggestions, and the next focus asks again.
        requested.current = false
      })
  }

  return (
    // A command line: the command language, left to right in every page.
    <div
      dir="ltr"
      onPointerEnter={load}
      className="relative font-mono text-[0.8125rem]"
    >
      <div className="flex h-8 items-center gap-2 rounded-sm px-1 focus-within:bg-bg focus-within:outline-1 focus-within:outline-fg-subtle">
        <label
          htmlFor={`${listId}-input`}
          lang={lang}
          className="shrink-0 text-fg-subtle"
        >
          <span aria-hidden="true">{prompt}</span>
          <span className="sr-only">{label}</span>
        </label>
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={hintId}
          aria-activedescendant={
            matches.length > 0 ? `${listId}-${active}` : undefined
          }
          // A placeholder in the page's language reads in its own direction;
          // what is typed is a command, left to right.
          dir="auto"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
          onFocus={load}
          onChange={(event) => {
            setText(event.target.value)
            setActive(0)
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && matches.length > 0) {
              event.preventDefault()
              setActive((active + 1) % matches.length)
            } else if (event.key === "ArrowUp" && matches.length > 0) {
              event.preventDefault()
              setActive((active - 1 + matches.length) % matches.length)
            } else if (event.key === "Enter") {
              event.preventDefault()
              open()
            } else if (event.key === "Escape") {
              setText("")
            }
          }}
          className="h-8 min-w-0 flex-1 bg-transparent text-fg uppercase outline-none placeholder:text-fg-subtle placeholder:normal-case"
        />
        <span
          id={hintId}
          dir="auto"
          className="hidden shrink-0 font-sans text-xs text-fg-subtle lg:inline"
        >
          {commands && typed !== "" && matches.length === 0
            ? unknown.replace("{command}", typed)
            : hint}
        </span>
      </div>
      {matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 bottom-full z-10 mb-1 overflow-hidden rounded-md border border-border bg-bg-raised shadow-lg"
        >
          {matches.map((match, index) => (
            <li
              key={match.name}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={open}
              className="flex cursor-pointer gap-3 px-3 py-1.5 aria-selected:bg-bg"
            >
              <span lang={lang} className="font-medium text-fg">
                {match.name}
              </span>
              <span dir="auto" className="truncate font-sans text-fg-subtle">
                {match.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
