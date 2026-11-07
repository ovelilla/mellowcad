# MellowCAD

CAD in your browser that works like AutoCAD: the same commands and aliases, the prompts in the
same order with the same option letters, the same defaults and object snaps, for 2D drafting and,
still in part, 3D solids. Free, nothing to install, no account; drawings stay on your device. In
English, Spanish and Brazilian Portuguese (with their AutoCAD's command names) and Arabic.

**[Start drawing at mellowcad.com/draw](https://mellowcad.com/draw)** ·
[mellowcad.com](https://mellowcad.com)

The bar is that someone who uses AutoCAD every day can sit down and work from muscle memory. Some
commands are still partial, and each one's missing options are listed in
[docs/coverage/](docs/coverage/README.md). Not there yet: DWG files and saving as DXF (a DXF
opens), printing and PDF, layouts and paper space, sweeps, lofts, meshes and rendering in 3D, and
phones and tablets.

## Packages

Under the app is an engine that knows nothing about the browser, published for anyone to build
on. The site at mellowcad.com is a Next.js shell around the third package.

| Package                                          | What                                                                             | Status                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`@mellowcad/engine`](cad/README.md)             | The drafting engine: model, commands, snapping, rendering. No framework, no DOM. | [on npm](https://www.npmjs.com/package/@mellowcad/engine), 0.x |
| [`@mellowcad/react`](packages/react/README.md)   | React bindings: the canvas, the engine's state as React state, the input wiring. | [on npm](https://www.npmjs.com/package/@mellowcad/react), 0.x  |
| [`@mellowcad/editor`](packages/editor/README.md) | The whole editor as one component, its chrome and its words in four languages.   | [on npm](https://www.npmjs.com/package/@mellowcad/editor), 0.x |

Each README has the package's entry points and examples; its `api.md` lists every export.
Runnable hosts are in [examples/](examples/README.md).

## Contributing

Bugs and requests go to [GitHub issues](https://github.com/ovelilla/mellowcad/issues/new/choose),
through one of two forms: something that does not work, or a command or an option that is missing
or not as AutoCAD does it. The editor's Send Feedback and the site's Report a problem open them
with the version and the language filled in, and the editor's with the browser too. When something
behaves differently from AutoCAD, say which command, what you typed, and what AutoCAD 2027 does:
matching current AutoCAD is the spec, and a behaviour that looks awkward is usually AutoCAD's own.
A security vulnerability is reported privately, never in an issue: [SECURITY.md](SECURITY.md).

To work on the code you need Node 24 and Git:

```sh
git clone https://github.com/ovelilla/mellowcad.git
cd mellowcad
npm ci          # also turns on the pre-commit hook
npm run dev     # the editor is at /draw
```

`npm ci` points Git at `.githooks/`, whose pre-commit hook runs the whole gate — types, the
packages' builds, lint, formatting and the tests with coverage — and a commit waits for it to
pass. A change that a package's users would notice adds a changeset (`npx changeset`).

Read [AGENTS.md](AGENTS.md) first: the architecture, the invariants every change keeps and where
each area's rules live. The maintainer's full setup, on WSL with AutoCAD alongside for research,
is [docs/setup.md](docs/setup.md) (in Spanish).

## License

MIT ([LICENSE](LICENSE)), for the code of the repository and the three packages. It does not
cover the MellowCAD name or logo.

AutoCAD is a registered trademark of Autodesk, Inc. MellowCAD is an independent project, not
affiliated with or endorsed by Autodesk; AutoCAD is named only to describe what it is compatible
with.
