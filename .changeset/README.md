# Changesets

A change to a package that a host would notice gets a changeset: `npx changeset`, pick the
packages, the bump and one line for the changelog. While the packages are 0.x, a breaking change
is a **minor** and everything else a **patch** (`.claude/rules/engine-package.md`; read `api.md`'s
diff as the version). `npm run version-packages` turns the pending changesets into versions and changelogs and
moves `examples/`' ranges with them; `npx changeset publish` publishes what is not private.
