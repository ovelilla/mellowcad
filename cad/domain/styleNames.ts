/** A style table's entry, as far as its names go. */
interface Named {
  readonly id: string
  readonly name: string
}

/** Whether two names are one, compared as AutoCAD compares table names (text/p324). */
export function sameStyleName(a: string, b: string): boolean {
  return a.toUpperCase() === b.toUpperCase()
}

/** The entry named `name`, any case (`PLANS` is plans, dimensions/p08). */
export function styleNamed<T extends Named>(
  styles: readonly T[],
  name: string
): T | undefined {
  return styles.find((style) => sameStyleName(style.name, name))
}

/**
 * `name`, or `name (2)`… when taken: creating a style twice never overwrites
 * the first. Case-blind, as AutoCAD's tables are (`STANDARD` is Standard,
 * text/p324).
 */
function freeName(name: string, taken: readonly string[]): string {
  const free = (candidate: string) =>
    !taken.some((other) => sameStyleName(other, candidate))
  if (free(name)) return name
  let n = 2
  while (!free(`${name} (${n})`)) n += 1
  return `${name} (${n})`
}

/**
 * A new style's name, free in the table, and its id: the name too, unless a
 * renamed style still holds that id.
 */
export function newStyleIdentity(
  name: string,
  styles: readonly Named[]
): { id: string; name: string } {
  const styleName = freeName(
    name,
    styles.map((style) => style.name)
  )
  return {
    id: freeName(
      styleName,
      styles.map((style) => style.id)
    ),
    name: styleName,
  }
}
