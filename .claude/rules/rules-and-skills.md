---
description: Writing a rule, a skill, a hook or AGENTS.md — paths globs and how Claude Code matches them, budgets, and what the knowledge test holds them to
paths:
  - ".claude/**"
  - "AGENTS.md"
  - "test/knowledge.test.ts"
---

# Rules, skills and hooks

Where each piece of knowledge goes, and the checks every source shares: `knowledge.md`.

- **The hooks** (`.claude/hooks/`, wired in `.claude/settings.json`) run in Claude Code only: what
  one enforces also lives in the prose an agent of any tool reads (the skill, `AGENTS.md`), and its
  logic is tested (`test/deps.test.ts` runs the session hook in a scratch repo).
- A rule is English and terse. A library's behaviour carries a header after the title,
  `> Verified against **<package> <version>**.`, with the installed version: an upgrade turns it
  red until the rule is re-verified.
- **Which rules load, and for which files, is logged** (`.claude/hooks/instructions-log.mjs`) and
  read by `npm run knowledge:loads`: weigh a rule by it before trimming or splitting one.

## What `test/knowledge.test.ts` checks of them

- **Every rule has a one-line `description:`** (up to 200 characters): the index
  `grep -H '^description:' .claude/rules/*.md` that `AGENTS.md` points to. Claude Code reads only
  `paths:` and ignores the rest of the frontmatter.
- **Every rule has `paths:` and each glob matches a file.** Claude Code reads them as gitignore
  patterns, so write `app/*/*app*/**`, never `app/[locale]/(app)/**`: `[locale]` is a character
  class, and that glob never loads the rule.
- **A glob loads its rule below every folder of that name**: Claude Code tries it from each folder
  of a file's path, so `docs/**` loaded `knowledge.md` for `content/docs/` and `i18n/**` loaded
  `i18n.md` for `docs/i18n/`. Narrow it by what its folder holds (`docs/**/*.md`, `i18n/*.ts`); a
  reach that is wanted, or that no glob avoids, is listed in `ANY_LEVEL_GLOBS` with its reason.
  The same reach is what loads the rules for a file under `.claude/worktrees/`.
- **A skill's `name` is its folder** (kebab-case) and it has a `description` of up to 1,024
  characters (Copilot's limit), which is what an agent sees before loading it: say when to use it.
  Its `SKILL.md` stays under 16 KB, about what Claude Code re-attaches after compacting.
- **No `CLAUDE.md` or `CLAUDE.local.md`** at the root or in `.claude/`: Claude Code would stop
  reading `AGENTS.md`.
- **Budgets**, ratchets that only go down: `AGENTS.md`, each rule and skill file, and the p90 of
  rule KB loaded per source file, matched at every level as Claude Code does (`npm run knowledge`
  prints median, p90 and max). The frontmatter does not count: Claude Code injects only what
  follows it.
