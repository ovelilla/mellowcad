import { Monitor, Moon, Sun } from "lucide-react"

/**
 * The theme control in its final form — System / Light / Dark — but inert
 * until the editor has a light canvas. It stays focusable and says why it does
 * nothing (`aria-disabled`, never a silent `disabled`). Turning it on is the
 * next-themes provider with the editor's own attribute and storage key.
 */
export function ThemeSelect({
  label,
  system,
  light,
  dark,
  soon,
}: {
  label: string
  system: string
  light: string
  dark: string
  soon: string
}) {
  const options = [
    { icon: Monitor, name: system, current: false },
    { icon: Sun, name: light, current: false },
    { icon: Moon, name: dark, current: true },
  ]
  return (
    <div className="tip">
      <div
        role="radiogroup"
        aria-label={label}
        aria-disabled="true"
        aria-describedby="theme-soon"
        tabIndex={0}
        className="inline-flex rounded-md border border-border p-0.5"
      >
        {options.map(({ icon: Icon, name, current }) => (
          <span
            key={name}
            role="radio"
            aria-checked={current}
            aria-label={name}
            className={`grid size-7 place-items-center rounded ${
              current ? "bg-bg text-fg" : "text-fg-subtle"
            }`}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </span>
        ))}
      </div>
      <span role="tooltip" id="theme-soon">
        {soon}
      </span>
    </div>
  )
}
