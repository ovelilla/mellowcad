import { Linetype, linetypeNamed } from "../../domain/linetypes"
import { ACADISO_LIN, acadLin } from "../../domain/linetypeLibrary"

/** A LIN file -LINETYPE reads, by the name it is asked as. */
export interface LinetypeFile {
  readonly name: string
  readonly linetypes: readonly Linetype[]
}

/** The metric drawing's file, Load's and `?`'s first default (ltype/p01, line/p205). */
export const ACADISO_FILE = "acadiso.lin"

/** The imperial file, from which CHPROP's LType loads (ltype/p03; AutoCAD's -LAYER too). */
export const ACAD_FILE = "acad.lin"

/**
 * The file a typed name opens: `.lin` is added when it has no extension
 * (`foo` is `"foo.lin"`, ltype/p08), and the two files this build ships,
 * acadiso.lin and acad.lin, are found in any case; any other is `null`, which
 * AutoCAD says it cannot find. WHY only these: there is no file to read here
 * but the two AutoCAD's support folder holds.
 */
export function linetypeFile(typed: string): {
  readonly name: string
  readonly file: LinetypeFile | null
} {
  const base = typed.trim()
  const name = /\.[^\\/.]*$/.test(base) ? base : `${base}.lin`
  const key = name.toLowerCase()
  if (key === ACADISO_FILE) return { name, file: acadisoFile() }
  if (key === ACAD_FILE) return { name, file: acadFile() }
  return { name, file: null }
}

export function acadisoFile(): LinetypeFile {
  return { name: ACADISO_FILE, linetypes: ACADISO_LIN }
}

export function acadFile(): LinetypeFile {
  return { name: ACAD_FILE, linetypes: acadLin() }
}

/** The linetype `name` (any case) as `file` defines it, if it does. */
export function fileLinetype(
  file: LinetypeFile,
  name: string
): Linetype | undefined {
  return linetypeNamed(file.linetypes, name)
}
