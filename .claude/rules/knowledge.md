---
description: Where knowledge goes (AGENTS.md, rules, skills, docs, tests) and what test/knowledge.test.ts checks
paths:
  - ".claude/**"
  - "AGENTS.md"
  - "README.md"
  - "docs/**/*.md"
  - "test/knowledge.test.ts"
---

# Where knowledge goes

| What                                                 | Where                                                     |
| ---------------------------------------------------- | --------------------------------------------------------- |
| What every task needs                                | `AGENTS.md` (always loaded, capped at 10 KB)              |
| A rule of an area the code does not show             | `.claude/rules/<area>.md`, loaded by its `paths:`         |
| A procedure used now and then (a checklist, a probe) | a skill, `.claude/skills/<name>/SKILL.md`                 |
| What a command does and lacks against AutoCAD        | its entry in `docs/coverage/`                             |
| A command review's findings and their execution      | `docs/plans/<command>-review.md` (skill `command-review`) |
| The why of one place in the code                     | a comment there                                           |
| What was done, measured or tried                     | the commit message                                        |
| A rule a machine can check                           | a test or a lint rule, and one line in the rule naming it |
| A dependency deferred, an advisory or package kept   | `docs/deps-review.json` (skill `deps-review`)             |

- **Do not describe the code.** A list of modules, methods or the order of a bar is learned by
  opening the file and goes stale the day it changes: every such table the audit of 2026-10-20 found
  was incomplete. Write what the code cannot say: the constraint, the trap, the reason.
- **One owner per fact**: anywhere else, a pointer to it.
- **A rule that can be checked becomes the check.** The prose then shrinks to "checked by X".
- Writing a rule, a skill, a hook or `AGENTS.md`, and what the test holds them to:
  `rules-and-skills.md`.

## What `test/knowledge.test.ts` checks

It runs in `npm test`, so in the commit gate, over `AGENTS.md`, `README.md`, the packages'
READMEs, the rules, the skills and `docs/`:

- **Every path, `npm run` script and symbol in a code span exists** — symbols in the repo, in
  TypeScript's DOM and ES libraries, or in a package of the rule's header (not checked in
  `docs/`, which cite AutoCAD's names). A path with a placeholder (`<tag>`, `…`) is not checked.
  A citation that is absent on purpose goes in `ABSENT_CITATIONS` with its reason; an entry no
  longer cited fails.
- **Each brief, `docs/next-*.md`, opens with a status line** (`> **Estado:** …`): the session hook
  shows its first sentence.
