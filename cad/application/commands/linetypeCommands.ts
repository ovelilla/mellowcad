import { CadDocument } from "../../domain/Document"
import { Linetype } from "../../domain/linetypes"
import { styleNamed } from "../../domain/styleNames"
import { TextStyle } from "../../domain/textStyles"
import { Command } from "./Command"

/**
 * A change to the linetype table as one step: -LINETYPE's Load and Set's and
 * CHPROP's loading, PURGE's deleting. It holds the table as it
 * found it, so undo puts back a reloaded definition, and a deleted one at its
 * place in the table.
 */
export class LinetypeTableCommand implements Command {
  readonly label = "linetype-table"
  private previous: readonly Linetype[] = []

  constructor(private readonly next: readonly Linetype[]) {}

  mapEntities(): Command {
    return this
  }

  execute(doc: CadDocument): void {
    this.previous = doc.getLinetypes()
    doc.setLinetypes(this.next)
  }

  undo(doc: CadDocument): void {
    doc.setLinetypes(this.previous)
  }
}

/**
 * `linetypes` loaded into `table`: one it holds reloaded in its place, under
 * its name; the others after. A text's style is named as the drawing names
 * it (acadiso.lin's `STANDARD` is `Standard`), as AutoCAD links it to the
 * style's record (ltype/p06).
 */
export function withLoaded(
  table: readonly Linetype[],
  loaded: readonly Linetype[],
  textStyles: readonly TextStyle[]
): Linetype[] {
  const styleName = (name: string) => styleNamed(textStyles, name)?.name ?? name
  const linetypes = loaded.map((linetype) =>
    linetype.elements
      ? {
          ...linetype,
          elements: linetype.elements.map((element) =>
            element.kind === "text"
              ? { ...element, style: styleName(element.style) }
              : element
          ),
        }
      : linetype
  )
  const next = [...table]
  for (const linetype of linetypes) {
    const at = next.findIndex(
      (held) => held.name.toUpperCase() === linetype.name.toUpperCase()
    )
    if (at >= 0) next[at] = { ...linetype, name: next[at].name }
    else next.push(linetype)
  }
  return next
}
