import { DxfGroups, DxfReadError } from "./dxfGroups"

/**
 * One object of the file — a table record, an entity, a block's start — as
 * the groups after its `0` group, which names its type. A POLYLINE keeps its
 * VERTEX records and an INSERT its ATTRIB records in `children`.
 */
export interface DxfRecord {
  readonly type: string
  readonly codes: readonly number[]
  readonly values: readonly string[]
  readonly line: number
  readonly children?: readonly DxfRecord[]
}

/** A block definition: its BLOCK record and the entities up to ENDBLK. */
export interface DxfBlock {
  readonly record: DxfRecord
  readonly entities: readonly DxfRecord[]
}

/** The parts of a DXF this reader uses; the others are skipped. */
export interface DxfFile {
  /** Each header variable (`$INSUNITS`) and the groups that give its value. */
  readonly header: ReadonlyMap<string, DxfRecord>
  /** Each table's records by the table's name (`LAYER`). */
  readonly tables: ReadonlyMap<string, readonly DxfRecord[]>
  readonly blocks: readonly DxfBlock[]
  readonly entities: readonly DxfRecord[]
}

/**
 * The sections of a DXF. Unknown sections, CLASSES, OBJECTS and the preview
 * are skipped; a file that ends before EOF but after a section's end is
 * whole (programs leave the EOF out), one that ends inside a section is not.
 */
export function dxfSections(groups: DxfGroups): DxfFile {
  const reader = new GroupReader(groups)
  const header = new Map<string, DxfRecord>()
  const tables = new Map<string, DxfRecord[]>()
  const blocks: DxfBlock[] = []
  const entities: DxfRecord[] = []
  let sections = 0
  while (!reader.done()) {
    const code = reader.code()
    const value = reader.value().trim()
    if (code === 999) {
      reader.skip()
      continue
    }
    if (code === 0 && value === "EOF") break
    if (code !== 0 || value !== "SECTION") {
      // What precedes the first section is no DXF at all; after one, a stray
      // group between sections is passed over.
      if (sections === 0) throw new DxfReadError("header", reader.line())
      reader.skip()
      continue
    }
    reader.skip()
    sections++
    const name = reader.code() === 2 ? reader.value().trim() : ""
    if (reader.code() === 2) reader.skip()
    switch (name) {
      case "HEADER":
        readHeader(reader, header)
        break
      case "TABLES":
        readTables(reader, tables)
        break
      case "BLOCKS":
        readBlocks(reader, blocks)
        break
      case "ENTITIES":
        entities.push(...readEntities(reader))
        break
      default:
        reader.skipSection()
    }
  }
  // An empty file, or one of comments alone, is no drawing either.
  if (sections === 0) throw new DxfReadError("header", 1)
  return { header, tables, blocks, entities }
}

class GroupReader {
  private index = 0

  constructor(private readonly groups: DxfGroups) {}

  done(): boolean {
    return this.index >= this.groups.count
  }

  code(): number {
    return this.groups.codes[this.index]
  }

  value(): string {
    return this.groups.values[this.index]
  }

  line(): number {
    return this.done()
      ? (this.groups.lines[this.groups.count - 1] ?? 0) + 2
      : this.groups.lines[this.index]
  }

  skip(): void {
    this.index++
  }

  /** Whether the next group is `0` with this value, the end of a section if ENDSEC. */
  at(value: string): boolean {
    return !this.done() && this.code() === 0 && this.value().trim() === value
  }

  /** Throws where the file ends inside a section: AutoCAD's `DXF read error`. */
  expectMore(): void {
    if (this.done()) throw new DxfReadError("read", this.line())
  }

  /** The record starting at the current `0` group, up to the next `0`. */
  record(): DxfRecord {
    const type = this.value().trim()
    const line = this.line()
    this.skip()
    const codes: number[] = []
    const values: string[] = []
    while (!this.done() && this.code() !== 0) {
      codes.push(this.code())
      values.push(this.value())
      this.skip()
    }
    this.expectMore()
    return { type, codes, values, line }
  }

  skipSection(): void {
    while (!this.at("ENDSEC")) {
      this.expectMore()
      this.skip()
    }
    this.skip()
  }
}

function readHeader(reader: GroupReader, header: Map<string, DxfRecord>): void {
  while (!reader.at("ENDSEC")) {
    reader.expectMore()
    if (reader.code() !== 9) {
      reader.skip()
      continue
    }
    const name = reader.value().trim()
    const line = reader.line()
    reader.skip()
    const codes: number[] = []
    const values: string[] = []
    while (!reader.done() && reader.code() !== 9 && reader.code() !== 0) {
      codes.push(reader.code())
      values.push(reader.value())
      reader.skip()
    }
    header.set(name, { type: name, codes, values, line })
  }
  reader.skip()
}

function readTables(
  reader: GroupReader,
  tables: Map<string, DxfRecord[]>
): void {
  while (!reader.at("ENDSEC")) {
    reader.expectMore()
    if (!reader.at("TABLE")) {
      reader.skip()
      continue
    }
    const table = reader.record()
    const name = text(table, 2) ?? ""
    const records: DxfRecord[] = []
    while (!reader.at("ENDTAB") && !reader.at("ENDSEC")) {
      reader.expectMore()
      if (reader.code() !== 0) {
        reader.skip()
        continue
      }
      records.push(reader.record())
    }
    if (reader.at("ENDTAB")) reader.skip()
    const known = tables.get(name)
    if (known) known.push(...records)
    else tables.set(name, records)
  }
  reader.skip()
}

function readBlocks(reader: GroupReader, blocks: DxfBlock[]): void {
  while (!reader.at("ENDSEC")) {
    reader.expectMore()
    if (!reader.at("BLOCK")) {
      reader.skip()
      continue
    }
    const record = reader.record()
    const entities = readEntities(reader, "ENDBLK")
    if (reader.at("ENDBLK")) reader.record()
    blocks.push({ record, entities })
  }
  reader.skip()
}

/**
 * The entities up to the section's end (or a block's), each POLYLINE with the
 * VERTEX records after it and each INSERT with its ATTRIB records, both up to
 * their SEQEND.
 */
function readEntities(reader: GroupReader, end?: string): DxfRecord[] {
  const entities: DxfRecord[] = []
  while (!reader.at("ENDSEC") && !(end && reader.at(end))) {
    reader.expectMore()
    if (reader.code() !== 0) {
      reader.skip()
      continue
    }
    const record = reader.record()
    const child =
      record.type === "POLYLINE"
        ? "VERTEX"
        : record.type === "INSERT"
          ? "ATTRIB"
          : null
    if (child && (reader.at(child) || reader.at("SEQEND"))) {
      const children: DxfRecord[] = []
      while (reader.at(child)) children.push(reader.record())
      if (reader.at("SEQEND")) reader.record()
      entities.push({ ...record, children })
    } else {
      entities.push(record)
    }
  }
  return entities
}

/** The first value of `code` in a record, as written. */
export function text(record: DxfRecord, code: number): string | undefined {
  const i = record.codes.indexOf(code)
  return i < 0 ? undefined : record.values[i]
}
