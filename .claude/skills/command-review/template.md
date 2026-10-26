# Template: reviewing a command

> The goal is not to confirm the command works: it is to find where it behaves otherwise than
> AutoCAD 2027, what no test protects, and what the coverage entry claims without evidence.
> Assume there are differences until a probe and a test show there are none.
>
> Every review produces `docs/plans/<command>-review.md` with the structure of §6. What it
> teaches goes to the rule of its area; what the command still lacks, to its coverage entry; the
> order of what follows, to "Command reviews" in `docs/coverage/roadmap.md`.

## 0. Phases and stops

| Phase          | What comes out                                                    | Writes in the repo                                  | Stops         |
| -------------- | ----------------------------------------------------------------- | --------------------------------------------------- | ------------- |
| 0. Preparation | a green baseline, the environment, free prefixes                  | nothing                                             | no            |
| 1. Inventory   | the command's files, related tools, areas owned and cited (§1)    | nothing                                             | no            |
| 2. Probes      | AutoCAD's answer to every cell of the matrix, each with an id     | probe inputs (`scripts/research/probes/<command>/`) | no            |
| 3. Review      | mellowcad's answer to every cell, a report per block, adversarial | nothing (scratch tests are gitignored, §4.3)        | no            |
| 4. Plan        | `docs/plans/<command>-review.md` (§6), committed alone            | the plan and the probe inputs                       | no            |
| 5. Execution   | fixes with their tests, docs, one commit per block (§8)           | code, tests, catalogs, coverage, rules              | push: **yes** |

The plan is committed as soon as it is written (`docs: <COMMAND> review plan`): other sessions
share the tree and the hook checks it whole, so nothing waits uncommitted. The execution does not
wait for the owner's approval (the owner's word, 2026-10-21): it follows in the same session unless
a fresh one would do it better — the context is nearly spent, or the blocks need the owner's mouse
at another time. The owner corrects the plan, or what was executed, with a new commit.

A review runs in **fresh sessions**, one per group of blocks (§1.4), in the order the plan sets.
Phases 0–4 of a group fit in one session, and its execution follows there — each block's subagent
starts clean anyway, and the reviewer keeps what the plan does not say; a new session takes it from
the plan alone when the reviewer judges that better. Opening prompt:

```text
Review of <COMMAND>, blocks <ids>, with the command-review skill.
Phases 0–5 in this session, unless a new session would do the execution better.
```

Each session adds its blocks' section to the plan; the last writes the common part too (§6:
summary, order of execution and estimate for every block).

### 0.1 Preparation, always

- `git status --short` and `git log -5`: another session editing the area is noted, and what it is
  changing is not reviewed until it lands.
- `npm run typecheck` and the command's test files (`npx vitest run <files>`): the baseline is green,
  or its failures are noted before anything is blamed on the review.
- The AutoCAD build and the tables: `(getvar "ACADVER")` and `(getvar "_VERNUM")` in the console,
  and the date of `research/strings/all_es.tsv`. After an AutoCAD update the tables are
  regenerated first (skill `autocad-research`): **an update rewords prompts**.
- MellowProbe built (`scripts/research/mellowprobe/build.sh`) and the console answering a one-line
  probe. The desktop is opened only when a desktop probe is due, with
  `scripts/research/acad.sh launch`, and its rules (`gui.md` of `autocad-research`) hold throughout.
  A session with desktop probes that move the mouse or type keys asks the owner first and tells
  them when they may use the mouse again (annex-probes.md §4).
- Finding prefixes of the session: `git grep -nE "\b<PREFIX>-[0-9]+" -- docs .claude` is empty
  for each one.
- "Command reviews" in the roadmap: which cross-cutting areas are already owned, and by which plan
  (§1.3).

## 1. Scope

What is not in the inventory is not reviewed; a file found outside it while reviewing is added to
it, and the plan says so.

### 1.1 The command's own surface

Walk the whole list and write "n/a" where it does not apply; never trim it from memory. These are
`new-command`'s registration points plus what the command's object touches.

- **The tool and its helpers**: `cad/application/tools/<Name>Tool.ts` and what it imports.
- **Registration**: `defaultTools`, `TOOL_COMMANDS`, `TRANSPARENT_COMMANDS`, `registerCommands`.
- **Catalogs**: its names, keywords, prompts, messages, `keywordLabels` and `promptKeywords`, in
  `en`, `es` and `ar`.
- **The object it makes**: its entity in `cad/domain/`, its scene in `SceneBuilder`, its grips in
  `selectToolGrips.ts`, its palette rows, its part of the file in `cad/serialization/`.
- **The UI**: the rail (`components/cad/tool-rail.tsx`), the shortcut menus, the landing's filing
  (`content/commands.ts`).
- **Tests**: its own, every one that runs it (`git grep -l '"<COMMAND>"'`), the English surface
  walk, its row in `currentProperties.test.ts`.
- **Knowledge**: its coverage entry, the rules whose `paths:` match its files, the skills citing it.

### 1.2 Related tools, reviewed with it

A command is reviewed with what a user meets while using it, **only in the part that concerns this
command**:

- **Its variants**: the same class registered under another mode, its dash form, its aliases.
- **The settings it reads**: system variables and toggles (CLAYER, CECOLOR, CELTYPE, CELWEIGHT,
  ELEVATION, THICKNESS, LASTPOINT, OSMODE, ORTHOMODE, POLARANG, DYNMODE…) and the commands that
  set them as far as this command's result changes with them.
- **What acts on its result in the matrix**: grips, the Properties palette, U / UNDO / REDO,
  save and open, copy and paste — for this command's object.
- **The commands its keywords open**, and those that continue from what it drew (LINE's Continue
  reads an arc's end: ARC is related).

### 1.3 Cross-cutting areas: owned once, cited after

An area many commands share (point input, object snaps, tracking, dynamic input, the command
line, undo, current properties, grips, the palette, files, render, `Select objects:`, placement…)
is **owned by the first review whose command uses it**, in the roadmap's order:

- The owner reviews the area **in full**, as a block of its own with its own prefix, against
  every form the area takes (not only those the command reaches), and the roadmap records it.
- Later reviews **do not review it again**. They check only this command's **contract** with it:
  does the command go through the shared mechanism, or does it handle the case itself? One matrix
  row per area, with the owner's plan cited (`see LINE review, OSN`), and a probe and a test only
  where the command has its own handling (its own `takes()`, its own Enter, its own snap filter).
- A difference found later in an owned area is a finding of the current review, under its own
  prefix, naming the area and the owner's plan. It reopens the area only with new evidence.
- An area of every command's (the options kept for the session) settles storage with the
  console's OPEN test, since the console has no NEW (rectang/p300).
- The **catalog sweep** (annex-catalogs.md) is an area too: owned by the first review for all
  commands at once; each later review reruns it for its command's ids only.

### 1.4 Blocks and sessions

- A block is the command itself, or one cross-cutting area it owns. Each has a three-letter prefix
  no other review used.
- A session takes as many blocks as fit. With subagents probing in parallel (§4.8), LINE's
  session took twelve blocks and about 110 console probes. Desktop probes are slower and need the
  owner's mouse: they go in a session of their own, planned in the plan's order.
- Order: the blocks whose result other blocks rely on first (the catalogs before any wording
  finding; the command line before transparency in a later block).

## 2. Sources of truth

From most to least reliable. Nothing about AutoCAD is claimed from memory.

1. **The 2027 console, traced** (`runacc.sh -t`): what a command asks, accepts, refuses and
   produces, its keywords in both languages, defaults, AllowNone and the rubber band's base.
2. **The 2027 string tables** (`pair.mjs`): the exact wording by id. The console beats the table
   where they differ (a prompt built from two strings).
3. **The desktop AutoCAD** (`acad.sh`): what the console has no way to show — the jig, dynamic
   input, grips, snap markers, the shortcut menus, the raw `initget` flags.
4. **Autodesk's help** (MCP `autodesk-help`, then the page from cloudhelp): intent and documented
   defaults, never over a program's answer.
5. **mellowcad's code, run through the harness**: what it does, not what a comment says it does.
6. **The coverage entry**: its **Missing** gaps are deliberate and researched — not new findings,
   unless a probe now contradicts them. Each **unverified** mark is a probe to run.
7. **The rules** of the area (those whose `paths:` match): each states an invariant to try to
   break (§4.6).
8. **Existing tests**, as evidence of what was meant, never as proof that it holds (§4.5).

Citations of AutoCAD 2023's console (`acc/…` in tests and comments) are from an older release
whose probes are not in the repo: any one a matrix cell relies on is probed again on 2027, and a
difference is a finding.

## 3. The interaction matrix

The scope of a command is a matrix — rows are interactions, columns the command's prompts — and
every cell gets a state with its two citations: [matrix.md](matrix.md). An empty cell is a hole in
the review, not an "n/a".

## 4. Method

### 4.1 Before probing

- Start from the analogues the previous review left (its plan's index and the roadmap): each is
  a probe to run first (LINE's list gave PLINE's first three highs in an hour).
- Read the coverage entry, the rules of the area and the command's tests **whole**. Turn each
  claim of the entry (Implemented and Missing) into a matrix cell to check (§4.4).
- Draw the matrix's columns from the tool's `question()` states and the console's prompts: a
  prompt AutoCAD has and the tool lacks is already a finding.
- An edit made outside a command (a palette, a drop-down, a grip) is a row of its own for U's
  echo: AutoCAD names it (`CHPROP`, `Modify Property`, `Grip Edit`; properties/d05-2).
- Read what each command leaves selected (`(ssget "_I")` after it ends or is cancelled): a set
  left behind is the next command's preselection (ERASE's SEL-43).
- An editor's Escape is a cell of its own, with and without changes: it keeps, drops or asks
  (TEXT's drops the line being typed, TEXTEDIT's the edit, MTEXT's asks; text/d01, d05, d06).

### 4.2 Probes

annex-probes.md: one question per probe, both languages, traced, each with an id, the input
committed and the transcript under `research/probes/<command>/` (gitignored: it is Autodesk's text).

### 4.3 mellowcad's side

Every cell's mellowcad answer comes from the harness (`createHarness`), never from reading alone.

- An existing test that already pins the cell is cited (`file:line`), after reading it.
- Otherwise the reviewer writes a **scratch test** in `research/review/<command>/` (gitignored, so
  no other session's hook runs it), with the config of annex-probes.md §5. It reproduces the
  probe's input and asserts AutoCAD's answer: a failure is a `differs`, a pass an `untested`. In the
  execution it becomes the regression test, in its proper file.
- What only a browser shows (canvas pixels, focus, the shortcut menu's DOM): skill `browser-verify`,
  only after the harness cannot answer.

### 4.4 Coverage entry ↔ code ↔ AutoCAD

| Claim of the entry | Probe | Test or scratch test | State |
| ------------------ | ----- | -------------------- | ----- |

States: **holds**, **false** (finding), **holds but untested**, **no longer true in 2027**
(finding: the entry or the code changes). Every **unverified** mark gets a probe; what the probe
settles stops being unverified.

### 4.5 Tests of the inventory

For each test file:

- **What it protects** (not what its title says).
- **Always passes**: no `expect`, an `expect` inside an `if` or a callback never run, a count that
  any result meets, `toEqual` on a `Vec2` (`-0`), a snapshot updated without reading its diff.
- **AutoCAD values without their source**: every expected prompt, keyword, default, message or
  coordinate that reproduces AutoCAD cites the probe id (or table id); an old `acc/…` citation is
  marked for a 2027 probe (§2).
- **Holes**: the matrix cells it should hold and does not.
- **Wrong layer**: a tool behaviour tested through `CadEngine.test.ts`, a wiring tested through the
  harness; a test that needs jsdom (a layering bug, `testing.md`).

### 4.6 Rules ↔ code

| Rule (file, section) | Claim | Code (`file:line`) | State |
| -------------------- | ----- | ------------------ | ----- |

States: **holds**, **broken** (finding), **stale** (the rule is wrong: fix or delete it in the
execution), **not checkable** (why). The reverse too: a non-obvious behaviour of the code (a
workaround, a `WHY`, an odd order) without a rule or a comment is proposed for one.

### 4.7 Platform deviations

Every deviation the code declares (`WHY` comments, coverage notes) is checked against its reason:
is the platform still forcing it (AGENTS.md: Chrome lets a page take Ctrl+9, Ctrl+0, Ctrl+1)? A
deviation without a `WHY` and a coverage note is a finding.

### 4.8 Subagents

- At most three at once, never nested. They change nothing in the repo but their own console
  probes, in an id range each (`p100`–`p149`…; 70 for a command with options, 100 for two
  commands' results, or the last go unasked), and write scratch tests only in a folder each
  (`research/review/<command>/<letter>/`) and scratch files only in a scratchpad folder each (two
  overwrote a shared helper). They never drive the desktop.
- Each gets its list of files, the rules to open, the matrix rows and prompts it answers (disjoint:
  two subagents with the same prompts found ELLIPSE's differences twice; a case every prompt meets,
  such as a zero vector, goes to one of them, or MOVE's turned up under three ids), the finding format
  (§5.1), its prefix and a range of decision ids of its own (the Undo keyword's listing and steps
  at every prompt, the preselection and the review of the
  existing tests go to one subagent by name: OFFSET's turned up three times), the order to claim nothing about
  AutoCAD without a probe id the reviewer gave it, and the patterns found earlier in the review
  (with their IDs) to look for analogues.
- They return the cells they answered, what they could not check, and the tests they read, as
  text: a subagent cannot write a report file, so the reviewer keeps it in the scratchpad.
- Their high and critical findings are verified by the reviewer, in person, before the plan.
- A desktop surprise goes at once to the subagent owning that prompt (SendMessage): the console
  then settles it case by case (SCALE's factor, transforms/d06 → p219, within the hour).

## 5. Evidence

### 5.1 A finding

```markdown
#### <ID> — <one sentence>

- **Severity:** critical | high | medium | low · **Row:** <letter and name> · **Status:** verified | unverified
- **Where:** `cad/application/tools/<Name>Tool.ts:123`
- **AutoCAD:** probe `<command>/<id>` (es-ES and en-US), the transcript lines that matter
- **mellowcad:** test or scratch test, and what it printed
- **Scenario:** state → input → what mellowcad does → what AutoCAD does → what the user feels
- **Fix:** … · **Alternative:** …
- **Regression test:** `<file>`: what it asserts, citing the probe
- **Coverage, rules or catalogs affected:** …
```

IDs carry the block's prefix (`LIN-01`, `OSN-03`), defined once in `docs/` and never reused by
another review; decisions take the review's prefix and a `D` (`LINE-D1`). Once executed, the plan
shrinks to a summary and an index ID → one line + commit; what stays open goes to the coverage
entry's Missing (a gap) or to the roadmap (an ordering).

### 5.2 Severity

The spec is muscle memory (AGENTS.md): severity is how hard a daily AutoCAD user is hit.

- **Critical**: loses or corrupts the drawing — a mutation outside a `Command`, undo that drops
  objects, a file that does not round-trip, a hang.
- **High**: a common gesture gives another result — geometry, a default, a keyword letter, the
  prompt order, Enter or Escape, the properties of what it creates.
- **Medium**: a less common path differs (a rarer option, a refusal, the history's echo, a
  transparent command); a gap missing from the coverage entry; a ⚠ path no test holds; a
  deviation without its `WHY`.
- **Low**: wording that changes no letter typed, a stale citation, docs drift, test quality,
  cosmetics.

### 5.3 Adversarial pass

Before delivering, each finding tries to refute itself:

- Is it a **platform-forced deviation**, with its `WHY` and coverage note?
- Is it **already in Missing**? Then it is `known`, not new (unless the reason changed).
- Does the probe show **AutoCAD's default profile**? The isolated console starts every registry
  variable at its default; the desktop has the owner's settings (DYNMODE 0, the command line
  hidden). A difference between the two is a setting, not a behaviour.
- Is it the **console's artefact**? The console has no jig, no dynamic input, a fixed cursor
  (annex-probes.md §2): a jig-only behaviour is settled on the desktop.
- Is it **2023 against 2027**? Probe 2027 before concluding.
- Is it **presentation** (allowed to differ) or **behaviour** (not)?
- Is it **reachable** in the editor (a key the browser keeps, a path no UI leads to)?

Outcome: **confirmed**, **downgraded** (with the new severity) or **refuted**. Refuted ones go to a
section of the plan with the reason, so they are not proposed again. A finding without a
reproducible scenario stays **unverified** and is never presented as fact.

## 6. Output

`docs/plans/<command>-review.md`, in English:

1. **Status** line and **summary**: counts by severity and block, the worst in three lines.
2. **Inventory**: the files of §1.1, the related tools (§1.2), the areas owned and those cited
   (§1.3), the commit, the AutoCAD build and the tables' date.
3. **Probes**: id → what it asks, languages, desktop or console; the input is in
   `scripts/research/probes/<command>/`.
4. **Matrix**, per block, with every cell's state and its two citations (probe, test).
5. **Findings** by severity (critical → low), §5.1.
6. **Decisions taken**: the owner does not answer technical, design or product questions
   (AGENTS.md), so each is decided — the most standard option, one line on why — and listed with
   its id. Only destructive or outward-facing ones wait for the owner.
7. **Tests proposed**: regression tests first (in each finding), then the untested cells, by file;
   the old citations to re-probe.
8. **What is not tested and why**: what TypeScript guarantees, presentation, what the browser
   alone shows.
9. **What could not be reviewed and why**.
10. **Refuted in the adversarial pass**, with the reason.
11. **Coverage ↔ code ↔ AutoCAD** (§4.4) and **rules ↔ code** (§4.6), only the rows that do not
    hold, plus the list of what was checked.
12. **Order of execution and estimate**, by block, with what blocks what.
13. **Changes to coverage, rules, catalogs and roadmap** the execution will make, including the
    areas this review takes ownership of.
14. **Template improvements** proposed (§9).

## 7. Constraints

- Phases 0–4 write only the probe inputs and the plan (§0).
- At most three subagents at once, never nested (§4.8).
- AutoCAD is the owner's: the desktop rules of `gui.md` (own drawings, settings put back, never
  Alt), the console isolated by default and `-r` only to read the owner's profile.
- No browser unless the harness cannot answer (§4.3).
- Replies in Spanish; everything in the repo in English.

## 8. Execution

Once the plan is committed, block by block, in the plan's order. Each block is implemented
by **one subagent**, given the block's findings, decisions, scratch tests and probes, and told not
to commit; the reviewer reads its diff, runs the gate and commits. Blocks go one after another: they
share the catalogs and the snapshots.

1. **Fixes**, each with its regression test in the lowest layer that reproduces it, written first
   and seen failing, citing its probe.
2. **The plan's tests** for the block's untested cells; old `acc/…` citations replaced by the 2027
   probe that confirmed them.
3. **Catalogs**: `en`, `es` and `ar` edited, `npm run locales`, the compiled files committed; the
   English surface snapshot updated with `-u` only where the English was meant to change, its diff
   read. A key no code reads any more **stays**, unused: removing one is a major version
   (`cad/README.md`, "Versioning").
4. **Docs**: the coverage entry (what it now does, what it still lacks, nothing left unverified that
   a probe settled), the rules the block taught or proved wrong, the roadmap's review list.
5. **Close the block** with skill `finish-feature`: the gate, then **one commit per block** citing
   the finding IDs (`fix(engine): LINE review — LIN-01 to LIN-04`). The push waits for the owner.
6. When the last block lands, the plan shrinks to the summary and the index (§5.1), and the
   roadmap marks the review done with the areas it owns.

**Every session ends with the prompt for the next one**, ready to paste: the review or the blocks
it takes, its phases, whether it needs the owner's mouse on the desktop (so they grant it when they
start it), and what the last session left for it.

## 9. Template improvements

At the close of each review, a short list of changes to this template: a row that found nothing,
a finding that needed a question the template does not ask, a step that cost more than it gave, a
probe pattern worth reusing. They are proposed in the plan (§6.14) and applied here at the
review's close (the owner waived the wait for approval on 2026-10-21), each with its date.

Applied (each change's detail is in `git log -- .claude/skills/command-review`):

- 2026-10-21: LINE (subagents' ranges, untraced undo, COM input; one subagent per block, unused
  keys stay, the next session's prompt); the matrix's P, Q and snaps three ways (owner); PLINE
  (analogues first, row H, the review's own execution); CIRCLE, ARC, RECTANG and POLYGON, ELLIPSE,
  SPLINE, ERASE (desktop traps, storage by the OPEN test, disjoint prompts, the preselection).
- 2026-10-22: MOVE and COPY, Transforms, OFFSET, TRIM, Corners and Pieces (shared cases and the
  Undo keyword to one subagent, ranges by weight, desktop traps, matrix.md Q, annex §3–§5).
- 2026-10-22, after the Arrays review: picks off the command line's band, registry keywords put
  back, a reading by handle with two U, snaps off while a drag is measured, keys into the
  palette's window, the object's desktop pass before its plan (annex-probes.md §4).
- 2026-10-23, after the Properties review: the whole monitor captured before a click, a pass
  without the mouse, task dialogs' links and Cancel (annex-probes.md §4), U's echo for an edit
  made outside a command (§4.1), the resource DLLs the tables lack (annex-catalogs.md §3).
- 2026-10-23, after the Text review: an editor's Escape (§4.1); answers typed where a prompt
  takes spaces, the English profile's txt.shx, dialog buttons by their rectangle, text picked on a
  stroke (annex-probes.md §4).
- 2026-10-26, after the HATCH review: a ribbon twin's Escape and preview under each name
  (matrix.md G); AutoCAD's log for the history, objects by handle, a pattern by EXPLODE
  (annex-probes.md §4).
