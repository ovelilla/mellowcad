import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"

/**
 * A package's public surface, declaration by declaration, as its `api.md`
 * records it: every export of every entry point with its full signature, and
 * every declaration of the package they reach that no entry point exports (a
 * parameter's type, a field's), since a change there changes the API too.
 * Private members are left out; they are not API. The doc comments stay: they
 * ship in the `.d.ts` a host's editor shows, and the report is the reference
 * the docs serve. An entry point whose barrel heads its exports with
 * `// @group <title>` is reported group by group, in the barrel's order. What
 * another package declares (the engine's types in react's signatures) is that
 * package's report.
 *
 * WHY declarations from `transpileDeclaration`: `isolatedDeclarations` makes
 * each module's `.d.ts` a function of its own text, so this reads what the
 * build ships without building it, and a checker over those `.d.ts` follows
 * each name to where it is declared, across the packages too.
 */

const ROOT = path.resolve(import.meta.dirname, "..")

/** Where the workspace's sources live: the engine and every package. */
const SOURCE_ROOTS = [path.join(ROOT, "cad"), path.join(ROOT, "packages")]

export interface ApiPackage {
  /** The package's folder. */
  readonly dir: string
  /** The test that writes the report, named in its header. */
  readonly writer: string
  /** The source each entry point's subpath is built from. */
  readonly entries: Readonly<Record<string, string>>
  /** Declarations of the package left out of the report (a generated type). */
  readonly omit?: readonly string[]
  /** What each stylesheet in `exports` offers a host, by its subpath. */
  readonly stylesheets?: Readonly<Record<string, string>>
}

/**
 * The package's module `exports`, each with the source it is built from. A
 * stylesheet is not a module: the package describes it (`stylesheets`).
 */
export function exportedEntries(
  dir: string,
  source: (subpath: string) => string
): Record<string, string> {
  const exports = JSON.parse(
    readFileSync(path.join(dir, "package.json"), "utf8")
  ).exports as Record<string, unknown>
  return Object.fromEntries(
    Object.keys(exports)
      .filter(
        (subpath) => subpath !== "./package.json" && !subpath.endsWith(".css")
      )
      .map((subpath) => [subpath, path.join(dir, source(subpath))])
  )
}

/**
 * The repo's `paths` (tsconfig.json), each package name onto the declaration
 * its source would build, so one package's `.d.ts` reaches another's.
 */
function declarationPaths(): Record<string, string[]> {
  const config = ts.readConfigFile(path.join(ROOT, "tsconfig.json"), (file) =>
    ts.sys.readFile(file)
  ).config as { compilerOptions: { paths: Record<string, string[]> } }
  return Object.fromEntries(
    Object.entries(config.compilerOptions.paths)
      .filter(([name]) => name.startsWith("@mellowcad/"))
      .map(([name, targets]) => [
        name,
        targets.map((target) =>
          path.join(ROOT, target.replace(/\.tsx?$/, ".d.ts"))
        ),
      ])
  )
}

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ["lib.es2023.d.ts", "lib.dom.d.ts"],
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  allowArbitraryExtensions: true,
  types: [],
}

const inSources = (file: string) =>
  SOURCE_ROOTS.some((root) => file.startsWith(root + path.sep)) &&
  !file.includes(`${path.sep}dist${path.sep}`) &&
  !file.includes(`${path.sep}node_modules${path.sep}`)

/** The workspace's source behind a `.d.ts` it would build, or null. */
function sourceOf(file: string): string | null {
  if (!inSources(file) || !file.endsWith(".d.ts")) return null
  for (const extension of [".ts", ".tsx"]) {
    const source = file.replace(/\.d\.ts$/, extension)
    if (existsSync(source) && !source.endsWith(".d.ts")) return source
  }
  return null
}

function declarationProgram(entries: readonly string[]): ts.Program {
  const options = { ...OPTIONS, baseUrl: ROOT, paths: declarationPaths() }
  const host = ts.createCompilerHost(options)
  const declarations = new Map<string, string>()
  const declarationOf = (file: string): string => {
    let text = declarations.get(file)
    if (text === undefined) {
      const source = sourceOf(file)!
      text = ts.transpileDeclaration(readFileSync(source, "utf8"), {
        fileName: source,
        compilerOptions: {
          ...OPTIONS,
          isolatedDeclarations: true,
          stripInternal: true,
        },
      }).outputText
      declarations.set(file, text)
    }
    return text
  }
  // The sources are hidden, so every import inside the workspace resolves to
  // the declaration its source would build.
  const isHiddenSource = (file: string) =>
    inSources(file) && /\.tsx?$/.test(file) && !/\.d\.([\w-]+\.)?ts$/.test(file)
  host.fileExists = (file) =>
    sourceOf(file) !== null ||
    (!isHiddenSource(file) && ts.sys.fileExists(file))
  host.readFile = (file) =>
    sourceOf(file) !== null ? declarationOf(file) : ts.sys.readFile(file)
  const getSourceFile = host.getSourceFile
  host.getSourceFile = (file, language, ...rest) =>
    sourceOf(file) !== null
      ? ts.createSourceFile(file, declarationOf(file), language, true)
      : getSourceFile(file, language, ...rest)
  return ts.createProgram(entries, options, host)
}

type Declaration = ts.Statement

/** The top-level statement a declaration is, or null for a nested one. */
function statementOf(node: ts.Node): Declaration | null {
  const statement = ts.isVariableDeclaration(node) ? node.parent.parent : node
  return ts.isSourceFile(statement.parent) ? (statement as Declaration) : null
}

function isPrivate(member: ts.ClassElement): boolean {
  if (member.name && ts.isPrivateIdentifier(member.name)) return true
  return (
    ts.canHaveModifiers(member) &&
    (ts.getModifiers(member) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.PrivateKeyword
    )
  )
}

/**
 * A parameter as API: its type, never the names it is destructured into, which
 * the `.d.ts` keeps. It is named after its type (`{ engine, state }:
 * PieceProps` prints `pieceProps: PieceProps`), so renaming a local is no
 * change to the report.
 */
function namedParameter(
  parameter: ts.ParameterDeclaration
): ts.ParameterDeclaration {
  if (ts.isIdentifier(parameter.name)) return parameter
  const type =
    parameter.type &&
    ts.isTypeReferenceNode(parameter.type) &&
    ts.isIdentifier(parameter.type.typeName)
      ? parameter.type.typeName.text
      : "Props"
  return ts.factory.updateParameterDeclaration(
    parameter,
    parameter.modifiers,
    parameter.dotDotDotToken,
    type[0].toLowerCase() + type.slice(1),
    parameter.questionToken,
    parameter.type,
    parameter.initializer
  )
}

/** A declaration as API: no private members (the `.d.ts` keeps their names). */
function publicPart(statement: Declaration): Declaration {
  if (ts.isFunctionDeclaration(statement)) {
    return ts.factory.updateFunctionDeclaration(
      statement,
      statement.modifiers,
      statement.asteriskToken,
      statement.name,
      statement.typeParameters,
      statement.parameters.map(namedParameter),
      statement.type,
      statement.body
    )
  }
  if (!ts.isClassDeclaration(statement)) return statement
  return ts.factory.updateClassDeclaration(
    statement,
    statement.modifiers,
    statement.name,
    statement.typeParameters,
    statement.heritageClauses,
    statement.members.filter((member) => !isPrivate(member))
  )
}

const printer = ts.createPrinter({ removeComments: false })

const GROUP = /^\/\/ @group (.+)$/

/**
 * The group each name a barrel exports is under: the last `// @group` comment
 * above its export. Empty for a barrel without one; a name above the first is
 * a mistake, and throws.
 */
function exportGroups(source: string): Map<string, string> {
  const text = readFileSync(source, "utf8")
  const file = ts.createSourceFile(source, text, ts.ScriptTarget.Latest)
  const groups = new Map<string, string>()
  let group: string | null = null
  for (const statement of file.statements) {
    for (const range of ts.getLeadingCommentRanges(text, statement.pos) ?? []) {
      const title = GROUP.exec(text.slice(range.pos, range.end))?.[1]
      if (title !== undefined) group = title.trim()
    }
    if (!ts.isExportDeclaration(statement)) continue
    const clause = statement.exportClause
    if (!clause || !ts.isNamedExports(clause)) continue
    for (const element of clause.elements) {
      if (group === null) {
        if (groups.size > 0 || text.includes("// @group ")) {
          throw new Error(
            `${source}: ${element.name.text} is exported above its first // @group`
          )
        }
        continue
      }
      groups.set(element.name.text, group)
    }
  }
  return groups
}

/** Leading doc comments followed by another: a file's header above a declaration's own. */
const SUPERSEDED_DOCS = /^(?:\/\*\*[\s\S]*?\*\/\s*\n)+(?=\/\*\*)/

function print(statement: Declaration): string {
  // Only the doc comment nearest a declaration is its doc, as an editor's
  // hover shows it.
  return printer
    .printNode(
      ts.EmitHint.Unspecified,
      publicPart(statement),
      statement.getSourceFile()
    )
    .replace(SUPERSEDED_DOCS, "")
}

export function apiReport({
  dir,
  writer,
  entries,
  omit = [],
  stylesheets = {},
}: ApiPackage): string {
  const name = JSON.parse(readFileSync(path.join(dir, "package.json"), "utf8"))
    .name as string
  const declarationFile = (source: string) => source.replace(/\.tsx?$/, ".d.ts")
  const files = Object.entries(entries).map(([subpath, source]) => ({
    subpath,
    file: declarationFile(source),
    groups: exportGroups(source),
  }))
  const omitted = new Set(omit)
  const program = declarationProgram(files.map(({ file }) => file))
  const checker = program.getTypeChecker()
  const resolve = (symbol: ts.Symbol) =>
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol
  const ownSource = (file: string) => {
    const source = sourceOf(file)
    return source !== null && source.startsWith(dir + path.sep) ? source : null
  }

  const exported = new Set<Declaration>()
  const reached = new Set<Declaration>()
  const pending: Declaration[] = []
  const reach = (symbol: ts.Symbol | undefined) => {
    for (const declaration of symbol
      ? (resolve(symbol).declarations ?? [])
      : []) {
      const file = declaration.getSourceFile().fileName
      if (ownSource(file) === null || omitted.has(file)) continue
      const statement = statementOf(declaration)
      if (!statement || reached.has(statement)) continue
      reached.add(statement)
      pending.push(statement)
    }
  }

  const sections = files.map(({ subpath, file, groups }) => {
    const entry = checker.getSymbolAtLocation(program.getSourceFile(file)!)!
    const blocks = checker
      .getExportsOfModule(entry)
      .sort((a, b) => a.name.localeCompare(b.name, "en"))
      .map((symbol) => {
        const specifier = symbol.declarations?.find(ts.isExportSpecifier)
        const typeOnly =
          specifier &&
          (specifier.isTypeOnly || specifier.parent.parent.isTypeOnly)
        const statements = (resolve(symbol).declarations ?? [])
          .map(statementOf)
          .filter((statement) => statement !== null)
        for (const statement of statements) exported.add(statement)
        reach(symbol)
        const head = `export ${typeOnly ? "type " : ""}{ ${symbol.name} }`
        return {
          group: groups.get(symbol.name),
          text: [head, ...statements.map(print)].join("\n"),
        }
      })
    const code = (texts: string[]) => `\`\`\`ts\n${texts.join("\n\n")}\n\`\`\``
    if (groups.size === 0) {
      return `## ${subpath}\n\n${code(blocks.map(({ text }) => text))}`
    }
    const loose = blocks.find((block) => block.group === undefined)
    if (loose)
      throw new Error(
        `${subpath}: no // @group heads ${loose.text.split("\n")[0]}`
      )
    const titles = [...new Set(groups.values())]
    return [
      `## ${subpath}`,
      ...titles.map(
        (title) =>
          `### ${title}\n\n${code(blocks.filter((block) => block.group === title).map(({ text }) => text))}`
      ),
    ].join("\n\n")
  })

  // Every name a declaration's types mention, followed to its own.
  while (pending.length > 0) {
    const visit = (node: ts.Node): void => {
      if (ts.isTypeReferenceNode(node)) {
        reach(checker.getSymbolAtLocation(node.typeName))
      } else if (ts.isExpressionWithTypeArguments(node)) {
        reach(checker.getSymbolAtLocation(node.expression))
      } else if (ts.isTypeQueryNode(node)) {
        reach(checker.getSymbolAtLocation(node.exprName))
      }
      ts.forEachChild(node, visit)
    }
    visit(publicPart(pending.pop()!))
  }

  const internal = [...reached]
    .filter((statement) => !exported.has(statement))
    .map((statement) => ({
      file: path
        .relative(dir, ownSource(statement.getSourceFile().fileName)!)
        .split(path.sep)
        .join("/"),
      text: print(statement),
    }))
    .sort(
      (a, b) =>
        a.file.localeCompare(b.file, "en") || a.text.localeCompare(b.text, "en")
    )
    .map(({ file, text }) => `// ${file}\n${text}`)

  return [
    `# ${name} — API report`,
    "",
    `Every export with its signature and its documentation, grouped by topic, then the types they reach. Generated from the source by \`${writer}\`: a change to it is a change to the public API.`,
    "",
    ...sections.flatMap((section) => [section, ""]),
    ...Object.entries(stylesheets).flatMap(([subpath, text]) => [
      `## ${subpath}`,
      "",
      text,
      "",
    ]),
    "## Reached, not exported",
    "",
    "What the exports' types name. A host cannot import these names, but their shape is API.",
    "",
    "```ts",
    internal.join("\n\n"),
    "```",
    "",
  ].join("\n")
}
