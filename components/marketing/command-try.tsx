"use client"

import { useId, useState } from "react"

import { matchCommands, type CommandInfo } from "@/cad"

const SUGGESTIONS = 6

/**
 * A `Command:` prompt with the editor's own autocomplete over the real command
 * list. Enter takes you to the editor — the prompt here is a taste, not a
 * second editor.
 */
export function CommandTry({
  commands,
  editorHref,
  label,
  placeholder,
  hint,
  prompt,
  lang,
  unknown,
}: {
  commands: readonly Pick<CommandInfo, "name" | "aliases" | "description">[]
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
  const listId = useId()
  const hintId = useId()
  const matches = matchCommands(commands, text, SUGGESTIONS)
  const typed = text.trim().toUpperCase()

  const open = () => window.location.assign(editorHref)

  return (
    <div className="relative">
      <label
        htmlFor={`${listId}-input`}
        className="mb-2 block label-mono text-fg-subtle"
      >
        {label}
      </label>
      {/* A command line: the command language, left to right in every page. */}
      <div
        dir="ltr"
        className="flex items-center gap-2 rounded-md border border-border bg-bg-sunken px-3 font-mono text-sm focus-within:border-fg-subtle"
      >
        <span aria-hidden="true" className="text-fg-subtle">
          {prompt}
        </span>
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
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={text}
          placeholder={placeholder}
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
          className="h-11 min-w-0 flex-1 bg-transparent text-fg uppercase outline-none placeholder:text-fg-subtle placeholder:normal-case"
        />
      </div>
      <p id={hintId} className="mt-2 text-xs text-fg-subtle">
        {typed !== "" && matches.length === 0
          ? unknown.replace("{command}", typed)
          : hint}
      </p>
      {matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          dir="ltr"
          className="absolute inset-x-0 top-[5.25rem] z-10 overflow-hidden rounded-md border border-border bg-bg-raised font-mono text-sm shadow-lg"
        >
          {matches.map((match, index) => (
            <li
              key={match.name}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              onMouseDown={(event) => event.preventDefault()}
              onClick={open}
              className="flex cursor-pointer gap-3 px-3 py-2 aria-selected:bg-bg"
            >
              <span lang={lang} className="font-medium text-fg">
                {match.name}
              </span>
              <span className="truncate text-fg-subtle">
                {match.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
