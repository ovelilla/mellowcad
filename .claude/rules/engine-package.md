---
paths:
  - "cad/package.json"
  - "cad/tsdown.config.ts"
  - "cad/tsconfig.build.json"
  - "cad/locales/en.d.json.ts"
---

# The engine package

> Verified against **tsdown 0.23.2**, **publint 0.3.25**, **@arethetypeswrong/cli 0.18.5**.

`cad/` is the npm workspace `@mellowcad/engine`, in place and private until it is published
(`docs/next-library.md`).

- **The repo consumes the source, never `cad/dist/`.** `tsconfig.json`'s `paths` and
  `vitest.config.ts`'s aliases map the package's name to `cad/`; the workspace link in
  `node_modules` would reach the build. Nothing builds before the dev server, the tests or Vercel.
  `cad/dist/` is ignored by git, ESLint, Prettier, `tsc` and the coverage.
- **An entry point is three edits**: a key in `exports` (`types` first, `default` last), an `entry`
  in `cad/tsdown.config.ts` and an `include` in `cad/tsconfig.build.json`. `cad/entryPoints.test.ts`
  reads the public entry points from `exports`.
- **Unbundled on purpose** (`unbundle: true`): one module per source file is what lets the host's
  bundler honour `sideEffects: false`. A single-file `dist` took 13.9 KB to a page importing only
  `matchCommands`, against 0.36 KB.
- **Exported declarations carry their types** (`isolatedDeclarations`: Oxc writes each `.d.ts`
  alone). An exported `const`, a class field or a defaulted parameter whose value is not a literal
  is annotated; `as const satisfies` is refused (TS9010). `npm run typecheck` does not see it, the
  build does.
- **`cad/locales/en.d.json.ts` is `en.json`'s type**, written by `npm run locales` because Oxc
  cannot read a JSON module; `cad/locales/locales.test.ts` fails on drift. Never edit it.
- **The commit gate builds and checks the package**: `npm run build -w cad`, then
  `npm run check -w cad` (publint `--strict`, attw's `esm-only` profile), about 4 s. Installing
  the tarball in foreign hosts needs the network, so it belongs to a check before publishing.
- A runtime dependency of the engine goes in `cad/package.json`'s `dependencies` (today only
  `icu-minify`), never only in the root's.
