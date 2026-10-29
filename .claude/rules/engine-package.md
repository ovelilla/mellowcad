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
  - "cad/locales/keywordIds.ts"
  - "packages/*/package.json"
  - "packages/*/tsdown.config.ts"
  - "packages/*/tsconfig.build.json"
  - "scripts/packages/**"
---

# The packages

> Verified against **tsdown 0.23.2**, **publint 0.3.25**, **@arethetypeswrong/cli 0.18.5**.

`cad/` is the npm workspace `@mellowcad/engine` and `packages/react` is `@mellowcad/react`, in
place and private until they are published (`docs/next-library.md`). The engine is a peer of the
others, never a dependency: a host has one instance.

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
  alone). An exported `const`, a class field or a defaulted parameter whose value is not a literal
  is annotated; `as const satisfies` is refused (TS9010). `npm run typecheck` does not see it, the
  build does.
- **`cad/locales/en.d.json.ts` is `en.json`'s type**, written by `npm run locales` because Oxc
  cannot read a JSON module; `cad/locales/locales.test.ts` fails on drift. Never edit it. Nor
  `cad/locales/keywordIds.ts`, the keyword ids `CadDriver` checks: importing `en.json` itself
  shipped the raw catalog, 68 KB, to every page using the driver.
- **A package's `api.md` is its public surface** (`cad/api.md`, `packages/react/api.md`), every
  export with its signature and every type of its own they reach, written by its `api.test.ts`
  through `test/apiReport.ts`; any change fails it until `-u`. Read its diff as a version:
  a new name is a minor, a changed or removed one a major. A name joins `cad/index.ts` only when a
  host uses it; a public member only the engine's tests need is `/** @internal */`, which the
  build strips (`stripInternal`), as `CadDriver.runtime` is.
- **A module that uses React starts with `"use client"`**, kept in its own `dist` module
  (`scripts/packages/client-directive.ts`, in `check`); rolldown's `MODULE_LEVEL_DIRECTIVE`
  warning, which says it may be lost when modules merge, is dropped by code. Never on a language
  module: the page loads a catalog on the server and passes it as a prop.
- **The commit gate builds and checks each package**: `npm run build -w cad`, then
  `npm run check -w cad` (publint `--strict`, attw's `esm-only` profile), about 4 s; the same
  in `-w packages/react`. Installing the tarball in foreign hosts (Node ESM, `tsc`, Vite) needs
  the network, so it is `npm run check:hosts -w cad` (`scripts/engine/hosts.ts`), which
  `prepublishOnly` runs; the other packages get theirs with the examples (phase 5).
- `@mellowcad/react` is built without the React Compiler: its hooks hold their identities by
  hand, which `useSyncExternalStore` needs, so a host's build gets the same hooks as the site.
- A runtime dependency of the engine goes in `cad/package.json`'s `dependencies` (today only
  `icu-minify`), never only in the root's.
