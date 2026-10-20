---
name: finish-feature
description: Close a feature, command or fix in mellowcad — the gate, the coverage entry, the rules it taught or invalidated, the brief, and the commit (never the push). Use when a change is done and verified, before reporting it.
---

# Finishing a feature

1. **The gate**: `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run test:coverage` (the pre-commit
   hook runs the same; the knowledge check is part of the tests). A snapshot that changed on
   purpose is updated with `npx vitest run <file> -u` and its diff read before committing.
2. **The coverage entry** in `docs/coverage/` (`grep -n '^### .*<COMMAND>' docs/coverage/*.md`):
   what the command now does under **Implemented:**, what it still lacks under **Missing:**, what
   no source settled marked **unverified**. Edit the entry; history belongs in the commit. A new
   command gets its entry in the file of its area.
3. **The rules.** If the work taught something the next change must respect, it goes in the rule
   of its area (`.claude/rules/`), not in `AGENTS.md`:
   - a new base class, shared helper or extension point other code should use;
   - another step in a checklist (`new-command`, `extend-model`, `add-language`);
   - an ordering or routing rule found by debugging;
   - a convention or invariant; if a test or lint rule can hold it, write that instead.

   A rule the work made false is edited or deleted in the same change, never patched with an
   exception on top. `cad/README.md` too, when the engine's public contract changed.
4. **The brief**: a `docs/next-*.md` whose work has shipped is deleted.
5. **Commit** with only your files (`git add <paths>`, `git status --short` first: other sessions
   may be working in the tree), message `feat(engine): …` / `fix(engine): …` / `docs: …` in
   English, multi-line through `git commit -F - <<'EOF'`. If someone else's change turns the hook
   red, verify yours in a clean worktree (`git worktree add`, apply your diff, run the gate) and
   commit once it is green.
6. **Do not push.** A push to `main` deploys to production on Vercel: it waits for the owner.
