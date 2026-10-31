---
name: browser-verify
description: Check in a real browser with Playwright what the Vitest harness cannot see — canvas rendering, DOM, theming, CSS, RTL, menus opened from the canvas, focus, view transitions, performance — or Autodesk's help viewer when a page will not come from cloudhelp. Use only when the harness cannot answer the question.
---

# Verifying in the browser

Tool behaviour is the harness's (`.claude/rules/testing.md`). Playwright is only for what it cannot
see: canvas rendering, DOM, theming, CSS, and the rules that live only outside it — the keys a
focused field must keep (Ctrl+C in a dynamic-input box), the browser dialogs a shortcut must
suppress, an async host call that never settles. Drive those with real keys on a real page: the
clipboard once shipped a hang no harness test could see.

## Tooling

- Install `playwright-core` (and `lighthouse`, `axe-core`) in a scratch directory from
  `mktemp -d`, never in the project, and launch the installed Chrome (`/usr/bin/google-chrome`,
  inside WSL) with `chromium.launch({ channel: "chrome" })`: no browser download is needed.
  Lighthouse finds the same Chrome on its own.
- Check the dev-server port first (it hops to 3001), and remember `localStorage` is per-origin.
  Port 3000 may be another project's server: read the listening process's command line before
  trusting it. Start your own with `npx next dev -p 3005`, a production build with `npm run build`
  then `npx next start -p 3006`.
- Next keeps dev output in `.next/dev`, which `next build` leaves alone, so a running dev server
  survives a build; a running `next start` on the same `.next` must be stopped first. Stopping a
  background `next start` task does not kill its node process, which keeps the port and serves a
  rebuilt `.next` whose chunks all 404: free the port by its owner, `fuser -k 3006/tcp`.
- To build uncommitted work without touching `.next`: `git worktree add --detach ../x HEAD`, then
  `rsync -a --delete --exclude node_modules --exclude .next --exclude coverage --exclude .git --exclude tsconfig.tsbuildinfo ./ ../x/`.
  `--exclude .git` matters: without it the source's `.git` directory is copied over the
  worktree's `.git` link file and the copy becomes a separate repository.
- Reproduce a user's bug on the server they use: `next dev`'s HTML belongs to the request it
  answered, so a bug can exist there and never on the production build.

- Playwright's keys never reach Chrome's own accelerators (an unprevented Ctrl+L kept the page
  focused): whether a page may take a shortcut is chromium's kReservedCommandIds list
  (`chrome/browser/ui/accelerator_table.cc`), read at its current commit (Workspace, MAC-09).

## Setting up the page

- **Verify against an empty drawing with default settings**, seeding only the entities the check
  needs: a real drawing brings its own units, scales and layers, so a result cannot be attributed
  and DIMSCALE, LTSCALE or layer colours are not the defaults.
- **Back up `localStorage` before seeding.** Copy `easycad:autosave:v1` (the user's drawing) to a
  `__…_backup` key and restore it afterwards. To start `/draw` with a drawing, write
  `{type:"easycad-drawing",version:3,layers,currentLayerId,entities}` there and reload: the reader
  is tolerant, so an old version is enough. A new page from the browser (not the context) has its own storage.

## Driving the editor

- The command line takes command names only. Coordinates go into the dynamic input, which needs
  the cursor moved onto the canvas first (`#x,y` for absolute: a point typed at a second-point
  prompt is relative). A typed length takes its direction from the cursor: move the mouse off the
  last point first, or LINE draws nothing.
- **Dead keys reach a page two ways**, and a layout that has them is driven both ways through
  CDP: Windows sends a `keydown` of `Dead`, then the composed letter (CDP's Input.dispatchKeyEvent
  with `key: "Dead"`, then one with `text: "é"`); Linux and macOS compose (Input.imeSetComposition,
  then Input.insertText). Type on the drawing, in the command line's
  field and in the dynamic input, and read what the drawing kept (pt-BR's ABNT2, 31/10/2026).
- Scope dynamic-input typing to `[data-dynamic-input] input`; a bare `querySelector("input")`
  matches the hidden file input.
- Dispatch events in one `page.evaluate` and read the DOM in another: React commits async.
- A **React panel input** does not commit on a synthetic `blur` (React delegates `onBlur` from
  `focusout`): use `fill()` + `press("Enter")`, and give each field an `aria-label` to select it by.
- **Anything that opens a menu or popover from a canvas gesture is verified with trusted clicks**
  (`page.locator(…).click()`), never `dispatchEvent`: synthetic events reproduce neither how a popup
  reacts to the release after the press nor the `pointerleave` a portalled modal backdrop causes —
  both have shipped bugs past a green synthetic check. Check where focus is after an entry acts, and
  that the next key types a command. Base UI's arrows skip a disabled entry, so walk a menu by
  reading `[data-highlighted]`, never by counting presses; a submenu needs a hover and a pause.

## RTL

`/ar` and `/ar/draw` are Arabic.

- Compare the canvas by `toDataURL()`, not a screenshot (the chrome lies over it): `/draw` and
  `/ar/draw` with the same drawing give the same bitmap, labels included.
- An element against its LTR twin is pinned at 0,0 over an opaque backdrop with the canvas hidden:
  the same SVG at another subpixel offset antialiases differently, and the ViewCube is translucent
  until hovered. The autosave spinner in the command bar varies run to run.
- Also check: `lang`/`dir`, the Tab order (it starts on the right), popups on their logical side,
  a negative value typed in the palette reading `-12.50`, no sideways scroll at 320/360/390 px, axe,
  that `/` and `/es` fetch two fonts and `/ar` three, and English and Spanish captured before and
  after, pixel for pixel, with the editor in use (a selection in the palette), not only at rest.
- **Arabic text needs eyes, not only assertions**: signs, a `-MTEXT` reading `MTEXT-`, spacing and
  word order have all been wrong with every test green. Look at the captures section by section,
  beside the English ones.

## Measuring the workspace

Per window size and in `/draw`, `/es/draw` and `/ar/draw`: the zones by their grid area and their
`clientWidth`/`clientHeight` (a zone's own numbers, its border outside); the topmost
`.pointer-events-auto` elements of `main`, which must not overlap one another nor cut the canvas but
for what AutoCAD puts there; the tool palette's buttons past its zone's bottom; the canvas's box at
the first paint (bundles blocked) against its box after mount; and after `ZOOM` `E` every drawn
extreme inside the canvas. Every icon button starts on a whole pixel. The type is audited as
`.claude/rules/ui.md` ("Type") says.

## Navigation and view transitions

- **Playwright launches Chromium without the back/forward cache.** Anything on `pageshow` or
  `pagereveal` after Back needs `ignoreDefaultArgs: ["--disable-back-forward-cache"]`, then
  going back and waiting for the URL with `waitUntil: "commit"`: a restored page fires no `load`.
- A cross-document view transition is observed from the new page: an init script runs before its
  first render, so its `pagereveal` listener sees `viewTransition` and, once `ready`, the
  `::view-transition-*` animations by name. Check that **both** `old` and `new` of a shared name
  exist (without its twin an element only fades out in place, and "a transition ran" still reads
  true), and repeat it a few dozen times, headed as well as headless: a flaky opt-in and a missing
  twin each showed only that way.
- To _see_ one, record it: CDP's Page.startScreencast keeps sending frames across the navigation.
- `content-visibility: auto` sections render blank in a full-page screenshot: take viewport shots
  while scrolling.

## Performance

**Never judge a regression against a number from an earlier session**: Lighthouse scores vary run
to run. Build the old commit in a worktree (`git worktree add ../mellowcad-a <sha>`, `npm ci`,
`next start -p 3007`), run both a few times, then `git worktree remove --force`. Best Practices
reads lower locally only because Vercel Analytics' scripts 404 off Vercel.
