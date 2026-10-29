---
paths:
  - "cad/index.ts"
  - "cad/api.md"
  - "packages/*/api.md"
  - "test/apiReport.ts"
  - "cad/package.json"
  - "cad/tsdown.config.ts"
  - "cad/tsconfig.build.json"
  - "cad/locales/en.d.json.ts"
  - "packages/editor/src/locales/en.d.json.ts"
  - "cad/locales/keywordIds.ts"
  - "packages/*/package.json"
  - "packages/*/tsdown.config.ts"
  - "packages/*/tsconfig.build.json"
  - "scripts/packages/**"
  - "scripts/editor/**"
  - "packages/editor/src/styles.css"
  - "packages/*/README.md"
  - "examples/**"
---

# The packages

> Verified against **tsdown 0.23.2**, **publint 0.3.25**, **@arethetypeswrong/cli 0.18.5**,
> **@rolldown/plugin-babel 0.2.4**, **babel-plugin-react-compiler 1.0.0**, **tailwindcss 4.3.3**.

`cad/` is the npm workspace `@mellowcad/engine`, `packages/react` is `@mellowcad/react` and
`packages/editor` is `@mellowcad/editor`, in place and private until they are published
(`docs/next-library.md`). The engine is a peer of the others, never a dependency: a host has one
instance; so is `@mellowcad/react` of the editor.

- **The repo consumes the source, never a `dist/`.** `tsconfig.json`'s `paths` and
  `vitest.config.ts`'s aliases map each package's name to its source; the workspace link in
  `node_modules` would reach the build. Nothing builds before the dev server, the tests or Vercel.
  `dist/` is ignored by git, ESLint, Prettier, `tsc` and the coverage.
- **An entry point is three edits**: a key in `exports` (`types` first, `default` last), an `entry`
  in the package's `tsdown.config.ts` and an `include` in its `tsconfig.build.json`.
  `cad/entryPoints.test.ts` and `test/packages.test.ts` read the public entry points from
  `exports`; a host reaches a package by its name only.
- **Unbundled on purpose** (`unbundle: true`): one module per source file is what lets the host's
  bundler honour `sideEffects: false`. A single-file `dist` took 13.9 KB to a page importing only
  `matchCommands`, against 0.36 KB. `cad/size.test.ts` holds the islands under 1 KB and the
  engine under a gzip ceiling, bundled by tsdown's own rolldown: raise the ceiling on purpose.
- **Exported declarations carry their types** (`isolatedDeclarations`: Oxc writes each `.d.ts`
  alone). An exported function has its return type (a component's is `ReactElement`, `| null` if
  it can render nothing); an exported `const` (a glyph is `LucideIcon`, a `cva` its call's type),
  a class field or a defaulted parameter whose value is not a literal is annotated;
  `as const satisfies` is refused (TS9010). `npm run typecheck` does not see it, the
  build does.
- **`cad/locales/en.d.json.ts` is `en.json`'s type**, written by `npm run locales` because Oxc
  cannot read a JSON module; `cad/locales/locales.test.ts` fails on drift. Never edit it, nor the
  editor's (`packages/editor/src/locales/`, the same way). Nor
  `cad/locales/keywordIds.ts`, the keyword ids `CadDriver` checks: importing `en.json` itself
  shipped the raw catalog, 68 KB, to every page using the driver.
- **A package's `api.md` is its public surface** (`cad/api.md`, `packages/react/api.md`,
  `packages/editor/api.md`), every export with its signature and every type of its own they
  reach, written by its `api.test.ts` through `test/apiReport.ts`; any change fails it until
  `-u`. Read its diff as a version: a new name is a minor, a changed or removed one a major. A
  name joins a barrel only when a host uses it, or needs it to compose or replace a piece; a
  public member only the tests need is `/** @internal */`, which the build strips
  (`stripInternal`), as `CadDriver.runtime` and the editor's `EditorZones` are.
- **A module that uses React starts with `"use client"`**, kept in its own `dist` module
  (`scripts/packages/client-directive.ts`, in `check`): one with a hook or JSX, which under the
  compiler includes any component (its cache is a hook). `icons.tsx` has none: it only calls
  lucide's `createLucideIcon`, which a server component may import. Rolldown's
  `MODULE_LEVEL_DIRECTIVE` warning, which says it may be lost when modules merge, is dropped by
  code. Never on a language module: the page loads a catalog on the server and passes it as a
  prop.
- **The commit gate builds and checks each package**: `npm run build -w cad`, then
  `npm run check -w cad` (publint `--strict`, attw's `esm-only` profile); the same in each of
  packages/, about 8 s in all, and a package without both scripts fails it
  (`test/packages.test.ts`). Installing the tarballs in foreign hosts needs the network, so it is
  each package's `check:hosts` (`npm run check:hosts -w packages/editor`,
  `scripts/packages/hosts.ts`), which its `prepublishOnly` runs: the engine's in Node, `tsc` and
  Vite (~15 s), react's (~40 s) and the editor's (~1 min) in Vite and Next, with a render in Node
  or Next's prerender. A host is an example wherever one fits; `@mellowcad/react`'s Vite page
  is its README's first `tsx` block.
- **`examples/` are the hosts a stranger copies**, and what `check:hosts` installs: not
  workspaces, so Vite, its React plugin and Next stay out of the lockfile; `test/packages.test.ts`
  holds their ranges of our packages at `^version` and of a tool the repo also has at the root's
  (the others, `vite` and `@vitejs/plugin-react`, move in deps-review). The root `tsc` checks
  them against the source, save their `vite.config.ts`; the site's Tailwind skips them
  (`globals.css`), or their classes would ship in `/draw`.
- **A package's README is what an integrator reads** (`cad/README.md`, `packages/*/README.md`):
  `test/packages.test.ts` fails on an import or a PascalCase name in it that no `api.md` has,
  and on a block whose info string names an example's file
  (`tsx examples/editor-vite/src/main.tsx`) that is not that file word for word.
- **`@mellowcad/editor` is built with the React Compiler**, as the site compiles it (Next's
  defaults): `@rolldown/plugin-babel` runs `babel-plugin-react-compiler` before Oxc, and its
  `check` passes `--compiled`, which fails a `dist` module with JSX that does not import
  `react/compiler-runtime` (the compiler was left out, or skipped all its components). The Babel
  pass is most of its build, ~2 s. `@mellowcad/react` is built without it: its hooks hold their
  identities by hand, which `useSyncExternalStore` needs, so a host's build gets the same hooks
  as the site.
- **`@mellowcad/editor/styles.css` is the site's Tailwind output for the editor alone**
  (`scripts/editor/styles.ts`, after tsdown): `packages/editor/src/styles.css` compiled from the
  package's sources only (automatic detection would ship the docs' and tests' classes), every rule
  Tailwind writes for the page — its theme on `:root, :host`, its preflight, the `@property`
  fallback on `*` — moved under `:where([data-mellowcad-editor])`, so specificity and the cascade
  inside the editor stay the site's, then Tailwind's own Lightning CSS pass. Its `--check`, in
  `check`, fails on a selector naming `html`, `body`, `:root` or `:host`, or neither the root nor a
  class. Utilities stay classes, and `@keyframes` and `@property` are global by nature. The site
  imports the source by path (`globals.css`), never the build, and keeps the page's own rules.
- **What the stylesheet asks of a host is API** (`api.md`'s `./styles.css`, written from the
  compiled CSS): its root attribute, its layers, and every variable it reads and never declares
  that `api.test.ts` does not list as written inline — today `--font-sans` and `--font-mono`. A
  host's variable is never declared by Tailwind (`@theme inline reference`): on the root it would
  hide the host's. `sideEffects` is `["**/*.css"]`, never `false`: webpack 5 drops a bare
  `import "@mellowcad/editor/styles.css"` under `false` (Vite, and Next with either bundler, keep
  it). attw skips the stylesheet (`--exclude-entrypoints`), which is not a module.
- A runtime dependency of the engine goes in `cad/package.json`'s `dependencies` (today only
  `icu-minify`), never only in the root's.
