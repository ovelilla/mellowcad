#!/bin/sh
# vercel.json's ignoreCommand: exit 0 skips the deployment, any other code builds it. It is a
# script because Vercel's schema caps ignoreCommand at 256 characters, and an invalid vercel.json
# fails every deployment before it builds (test/vercel.test.ts).
#
# Builds unless the last deployed commit is in Vercel's shallow clone and nothing but docs/,
# .claude/ and Markdown changed since. The packages' READMEs, API reports and guides are site
# pages, so a change to one builds.
base="$VERCEL_GIT_PREVIOUS_SHA"
[ -n "$base" ] && git cat-file -e "$base^{commit}" 2>/dev/null || exit 1
git diff --quiet "$base" HEAD -- . ':(exclude)docs' ':(exclude).claude' ':(exclude)*.md' &&
  git diff --quiet "$base" HEAD -- cad/README.md cad/api.md 'cad/docs/*.md' \
    'packages/*/README.md' 'packages/*/api.md' 'packages/*/docs/*.md'
