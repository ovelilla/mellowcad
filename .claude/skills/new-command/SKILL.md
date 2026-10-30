---
name: new-command
description: Checklist for adding an AutoCAD command, dash command or system variable to the engine — the tool, every registration point, the catalogs in three languages, transparency, tests, snapshots, the rail, the landing's filing and the coverage entry. Use when a change adds a command a user can type.
---

# Adding a command

Before writing it, read its entry in `docs/coverage/` and establish the behaviour and the
wording (skill `autocad-research`). How a tool is written: `.claude/rules/cad-tools.md` and
`.claude/rules/cad-catalogs.md`. **Enforced** marks a step a test fails without.

1. **The tool.** `cad/application/tools/<Name>Tool.ts` implementing `Tool` or extending a base
   (`cad-tools.md`, "Reuse before writing"). A system variable is no tool: an entry of
   `SYSTEM_VARIABLES` (`cad-tools.md`, "System variables"). A dash command that only takes its
   input differently (`-MTEXT`) is no tool: `runtimeCommands.ts` starts the plain one and switches
   it; one that asks otherwise (-PAN) is a tool of its own.
2. **A runtime hook, if it needs one.** Something new it asks the runtime, or the runtime asks it,
   is an optional member of `Tool` or a method of `ToolContext` / `UndoHistory` in `Tool.ts`, wired
   in `CadRuntime.ts`: COPYCLIP's `keepsSelection` (ef9c204), MREDO's `redo` (85565ad).
3. **`defaultTools`** in `cad/application/runtimeTools.ts`: `new XTool()` in rail order. A tool the
   runtime drives directly (a `CadRuntime` field) is passed in instead. (Every command commit.)
4. **`TOOL_COMMANDS`** in `cad/application/CommandLine.ts`: tool id → the command's global name.
   Dispatch comes from here; `Tool.shortcut` is display-only. (Every command commit.)
5. **Transparent?** Type it with an apostrophe at LINE's prompt in AutoCAD's console (`>>` prompts,
   or `** That command may not be invoked transparently **`); if it runs, add it to
   `TRANSPARENT_COMMANDS` in `cad/application/runtimeCommands.ts` (FILL, 86628d4; -PAN, 6d870a7).
   A system variable is transparent by being one.
6. **The catalogs** (`cad-catalogs.md`):
   - `cad/locales/en.json`: `commands.names.<NAME>` (canonical name first, then aliases),
     `commands.keywords.<NAME>`, `commands.prompts` (one id per `question()`),
     `commands.messages`, `commands.keywordLabels` / `promptKeywords` where AutoCAD's `initget`
     needs them, and `interface.tool.<id>`.
   - `cad/locales/es.json`: the same keys, Spanish AutoCAD's words from the 2027 tables; a name
     no source shows is noted **unverified** in the coverage entry.
   - `cad/locales/ar.json`: `interface.tool.<id>` only (Arabic has no command language).
   - `npm run locales`, and commit the compiled `cad/locales/*.ts`.

   **Enforced** by `cad/locales/locales.test.ts`: every `TOOL_COMMANDS` name and label in English,
   Spanish's command language complete, every language's `interface` complete, compiled files
   current, no shared name or alias, one abbreviation per keyword per prompt. (6d870a7, 85565ad.)
7. **Tests** with the harness (`.claude/rules/testing.md`): `cad/application/tools/*.test.ts`, or a
   file of its own beside the runtime when it is about history or routing (`cad/application/dashPan.test.ts`,
   `cad/application/mredoCommand.test.ts`). Cite the console probe or table id in each test that reproduces one.
8. **The English surface.** Add a walk of the command's prompts to `englishSurface.test.ts`
   (6d870a7's `.do("-PAN", …)`), then update the snapshots and read the diff:
   `npx vitest run cad/application/englishSurface.test.ts -u` (its command list changes with any
   new command, so this is **enforced**) and, when the landing's transcripts change,
   `npx vitest run content/transcripts.test.ts -u` (88090fd, 86628d4). Never `-u` a diff that
   rewords text the change did not mean to.
9. **The rail.** `packages/editor/src/tool-rail.tsx`: `TOOL_ICONS` and `PALETTE`, in the ribbon panel
   AutoCAD puts it in, or `RAIL_EXCLUDED` for a tool that lives elsewhere (ZOOM, -PAN, MREDO). Not
   enforced: an unlisted tool falls into a trailing group. (Every command commit.)
10. **What it creates.** A command that creates objects gives each the properties AutoCAD gives
    (`cad-tools.md`, "What a new object wears") and gets a row in `FROM_SCRATCH` or `DERIVED` of
    `cad/application/tools/currentProperties.test.ts`. A new drawing setting it saves follows skill
    `extend-model` (AUPREC's `drawingFile.ts` and its tolerance test, 88090fd).
11. **The landing.** `COMMAND_FILING` in `content/commands.ts`. **Enforced** by
    `content/commands.test.ts`: it fails until every registered command is filed.
12. **The coverage entry** in `docs/coverage/`: what the command does and what it still
    lacks; edit the entry, never append a narrative (6d870a7, 85565ad, 88090fd).
13. **Close** with skill `finish-feature`: `npm run typecheck`, `npm run lint`,
    `npm run test:coverage`, and any rule the work proved missing or wrong.

A tool class needs no export from `cad/index.ts`: nothing outside `cad/` imports one, and UNDO,
MREDO and the attribute commands are not exported.
