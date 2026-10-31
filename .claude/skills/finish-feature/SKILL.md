---
name: finish-feature
description: Close a feature, command or fix in mellowcad — the gate, the coverage entry, the rules it taught or invalidated, the landing and docs text it made stale, the brief, and the commit (never the push). Use when a change is done and verified, before reporting it.
---

# Finishing a feature

1. **The gate**: `npm run typecheck`, `npm run build -w cad` and `npm run check -w cad` (and the
   same in each package of `packages/` that has a build), `npm run lint`, `npm run format:check`,
   `npm run docs:check`, `npm run test:coverage` (the pre-commit hook runs the same; the knowledge
   check is part of the tests). A snapshot that changed on purpose is updated with
   `npx vitest run <file> -u` and its diff read before committing.
2. **The coverage entry** in `docs/coverage/` (`grep -n '^### .*<COMMAND>' docs/coverage/*.md`):
   what the command now does under **Implemented:**, what it still lacks under **Missing:**, what
   no source settled marked **unverified** — in English and in each `localized` language of
   `COMMAND_LANGUAGE` (`i18n/routing.ts`), whose wording beyond one command goes in its
   `docs/i18n/<tag>.md`. Edit the entry; history belongs in the commit. A new
   command gets its entry in the file of its area.
3. **The rules.** If the work taught something the next change must respect, it goes in the rule
   of its area (`.claude/rules/`), not in `AGENTS.md`:
   - a new base class, shared helper or extension point other code should use;
   - another step in a checklist (`new-command`, `extend-model`, `add-language`, `language-review`);
   - an ordering or routing rule found by debugging;
   - a convention or invariant; if a test or lint rule can hold it, write that instead.

   A rule the work made false is edited or deleted in the same change, never patched with an
   exception on top. `cad/README.md` and the guides in `cad/docs/` too, when the engine's public
   contract changed.

4. **What the site says.** The tests hold what is derived (the counts in `lib/facts.ts`, the
   generated `/docs` pages, the filing, the differences); a user-visible change also gets the
   hand-written text checked in English and corrected where it is now false or missing
   something a user would want named, then carried to every `live` language of
   `LOCALE_STATUS` (a draft may lag):
   - the landing's copy in `messages/<tag>.json`: `Status` (`today*`, `notYet*`, `next1`),
     `Faq`, and the section the feature belongs to (`Precision`, `Toolset`, `LocalFirst`);
   - the written "Use" pages (`getting-started`, `content/docs/*.mdx`), each with its
     translations' `sourceHash` (`docs.md`);
   - a figure or `DOCS_SESSIONS` script, only where a section shows the feature
     (`content/figures.ts`);
   - with any of these changed, `CONTENT_UPDATED` in `lib/site.ts` (`marketing.md`).

   A fix or an internal change usually touches none of them: decide, say so in the report.

5. **The brief**: a `docs/next-*.md` whose work has shipped is deleted.
6. **Commit** with only your files (`git add <paths>`, `git status --short` before and after: other
   sessions may be working in the tree, and one path that matches nothing aborts the whole add), message `feat(engine): …` / `fix(engine): …` / `docs: …` in
   English, multi-line through `git commit -F - <<'EOF'`. If someone else's change turns the hook
   red, verify yours in a clean worktree (`git worktree add`, apply your diff, run the gate) and
   commit once it is green.
7. **Do not push.** A push to `main` deploys to production on Vercel: it waits for the owner.
