---
name: command-review
description: Review one implemented command against AutoCAD 2027, tool by tool — its interaction matrix (input forms, drafting aids, transparency, undo, Enter/Esc/right-click, what it produces, grips and properties, save and load, languages, history, render), the tools reviewed with it, probes in the traced console, the desktop, the string tables and the help, its tests, an adversarial pass, and the plan docs/plans/<command>-review.md; then its execution, one commit per block. Use when asked to review or audit a command, or to take the next one in the review order.
---

# Reviewing a command

The template is [template.md](template.md); the interaction matrix that sets a command's scope is
[matrix.md](matrix.md); how to probe each of its cells is [annex-probes.md](annex-probes.md); the
sweep of the catalogs against the 2027 tables is
[annex-catalogs.md](annex-catalogs.md). The order of the reviews, and which review owns each
cross-cutting area, is "Command reviews" in `docs/coverage/roadmap.md`.

1. **Read template.md whole** before starting, and the annexes the review uses. The stops are not
   skipped:
   - Phases 0–3 (preparation, inventory, probes, review): nothing in the repo changes but the
     probe inputs (`scripts/research/probes/<command>/`).
   - Phase 4: write `docs/plans/<command>-review.md` (template §6) and commit it alone. The
     execution follows at once, without waiting for approval, unless a fresh session would do it
     better (template §0); the owner corrects the plan with a new commit.
   - Phase 5 (execution): one commit per block; the push waits for the owner's word.
2. **One session per group of blocks** (template §1.4), started with the prompt of template §0.
3. **Every claim about AutoCAD comes from a probe with an id** (annex-probes.md); every claim about
   mellowcad from a harness test, existing or written for the review. Neither is ever from memory.
4. Subagents, at most three at once and never nested, review with probes and scratch tests of their
   own (template §4.8); the reviewer verifies their high and critical findings in person. In the
   execution, one subagent implements each block and the reviewer commits it (template §8).
5. Findings use the format of template §5.1 with a block prefix no other review has used; once
   executed, the plan shrinks to a summary and an index of IDs and commits.
6. Every review ends with proposed improvements to the template (template §9), applied only after
   the owner confirms them.
7. Every session ends with the prompt for the next one (template §8).
