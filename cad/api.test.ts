import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import ts from "typescript"
import { describe, expect, it } from "vitest"

/**
 * The package's public surface, declaration by declaration, as `cad/api.md`
 * records it: every export of every entry point with its full signature, and
 * every declaration they reach that no entry point exports (a parameter's
 * type, a field's), since a change there changes the API too. Comments and
 * private members are left out; they are not API.
 *
 * WHY declarations from `transpileDeclaration`: `isolatedDeclarations` makes
 * each module's `.d.ts` a function of its own text, so this reads what the
 * build ships without building it, and a checker over those `.d.ts` follows
 * each name to where it is declared.
 *
 * The catalogs' shape stops at `en.json`: `cad/locales/en.d.json.ts` is its
 * type, held by `cad/locales/locales.test.ts`, and a key a command adds would
 * otherwise rewrite this report.
 */

const ROOT = path.resolve(import.meta.dirname, "..")
const CAD = path.join(ROOT, "cad")

const PACKAGE = JSON.parse(readFileSync(path.join(CAD, "package.json"), "utf8"))
  .exports as Record<string, unknown>

/** Each public entry point with the declaration file it is read from. */
const ENTRIES = Object.keys(PACKAGE)
  .filter((subpath) => subpath !== "./package.json")
  .map((subpath) => ({
    subpath,
    file: path.join(CAD, subpath === "." ? "index.d.ts" : `${subpath}.d.ts`),
  }))

const CATALOG_TYPE = path.join(CAD, "locales/en.d.json.ts")

const OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ["lib.es2023.d.ts", "lib.dom.d.ts"],
  strict: true,
  skipLibCheck: true,
  noEmit: true,
  allowArbitraryExtensions: true,
  types: [],
}

/** The engine's source behind a `.d.ts` it would build, or null. */
function sourceOf(file: string): string | null {
  if (!file.startsWith(CAD + path.sep) || !file.endsWith(".d.ts")) return null
  if (file.includes(`${path.sep}dist${path.sep}`)) return null
  const source = file.replace(/\.d\.ts$/, ".ts")
  return existsSync(source) && !source.endsWith(".d.ts") ? source : null
}

function declarationProgram(): ts.Program {
  const host = ts.createCompilerHost(OPTIONS)
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
  // The engine's sources are hidden, so every import inside it resolves to
  // the declaration its source would build.
  const isHiddenSource = (file: string) =>
    file.startsWith(CAD + path.sep) &&
    /\.tsx?$/.test(file) &&
    !/\.d\.([\w-]+\.)?ts$/.test(file)
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
  return ts.createProgram(
    ENTRIES.map((entry) => entry.file),
    OPTIONS,
    host
  )
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

/** A declaration as API: no private members (the `.d.ts` keeps their names). */
function publicPart(statement: Declaration): Declaration {
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

const printer = ts.createPrinter({ removeComments: true })

function print(statement: Declaration): string {
  return printer.printNode(
    ts.EmitHint.Unspecified,
    publicPart(statement),
    statement.getSourceFile()
  )
}

function apiReport(): string {
  const program = declarationProgram()
  const checker = program.getTypeChecker()
  const resolve = (symbol: ts.Symbol) =>
    symbol.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(symbol)
      : symbol

  const exported = new Set<Declaration>()
  const reached = new Set<Declaration>()
  const pending: Declaration[] = []
  const reach = (symbol: ts.Symbol | undefined) => {
    for (const declaration of symbol
      ? (resolve(symbol).declarations ?? [])
      : []) {
      const file = declaration.getSourceFile().fileName
      if (sourceOf(file) === null || file === CATALOG_TYPE) continue
      const statement = statementOf(declaration)
      if (!statement || reached.has(statement)) continue
      reached.add(statement)
      pending.push(statement)
    }
  }

  const sections = ENTRIES.map(({ subpath, file }) => {
    const entry = checker.getSymbolAtLocation(program.getSourceFile(file)!)!
    const lines = checker
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
        return [head, ...statements.map(print)].join("\n")
      })
    return `## ${subpath}\n\n\`\`\`ts\n${lines.join("\n\n")}\n\`\`\``
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
        .relative(CAD, sourceOf(statement.getSourceFile().fileName)!)
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
    "# @mellowcad/engine — API report",
    "",
    "Written by `cad/api.test.ts`; a change to it is a change to the public API.",
    "",
    ...sections.flatMap((section) => [section, ""]),
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

describe("the engine's public API", () => {
  it("is the one cad/api.md records", async () => {
    await expect(apiReport()).toMatchFileSnapshot("./api.md")
  })
})
