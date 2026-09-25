---
applyTo: "app/(marketing)/**,app/global-not-found.tsx,components/marketing/**,content/**,messages/**,i18n/**,lib/site.ts"
description: "The landing at / (marketing root layout): static rendering, islands, copy in next-intl, tokens, claims policy and trademark rules."
---

# Landing (`/`)

The landing and the editor are two **root layouts** in one project. `app/(marketing)/layout.tsx`
owns `<html class="dark">`, `marketing.css` and the metadata base; `app/(app)/layout.tsx` owns the
editor, next-themes and `globals.css`. Crossing between them is a full page load — which is why a
link to the editor is a plain `<a href={EDITOR_PATH}>`, never `next/link`: it must not prefetch
the editor into the landing. Links _within_ the landing use `Link`.

## Rendering

- **Every page is static.** Nothing here reads `cookies()`, `headers()`, `searchParams` or
  next-intl's `requestLocale`; one such call silently turns the page dynamic. `i18n/request.ts`
  returns the fixed locale for the same reason.
- **Server Components by default.** A client island exists only where there is browser state
  (an autosave to continue, a pause button, a URL only the browser knows) and it is small. It
  receives its copy as props from the server — never wrap the tree in `NextIntlClientProvider`.
- The 404 is `app/global-not-found.tsx` (flag `experimental.globalNotFound`): with two root
  layouts there is no common layout to compose `not-found` from. It imports `marketing.css` and
  sets `class="dark"` itself, because it bypasses every layout.

## Copy

- **No literals in components.** Every visible string is in `messages/en.json`, grouped by
  section, and read with `getTranslations()`. Keys are typed from the JSON (`i18n/global.d.ts`).
  A string with a placeholder the server cannot fill (the 404's path) is read with `t.raw()`.
- Tone: calm and precise, with AutoCAD's dry humour. Short sentences. No hype words, no emojis,
  no shouting capitals in the sans.

## Claims (not negotiable)

- Never claim DWG/DXF, printing or PDF, 3D, collaboration, cloud sync, mobile use or an installable
  offline mode until they exist. "Free" yes; "open source" no, and no GitHub link.
- **Every number about the product is derived from `@/cad` at build time**, never typed.
- "AutoCAD" only nominatively ("works like AutoCAD", "AutoCAD commands"), with the trademark
  disclaimer in the footer. No Autodesk logos, colours or screenshots.

## Styling

- `marketing.css` is its own Tailwind entry with `source(none)` and explicit `@source` paths; the
  editor's `globals.css` excludes these folders in turn. A new marketing folder must be added to
  both.
- **Tokens only**: `bg-bg`, `bg-bg-raised`, `bg-bg-sunken`, `border-border`, `text-fg`,
  `text-fg-muted`, `text-fg-subtle`, `bg-accent` / `text-accent-ink`, `text-precision`. No loose
  hex in a component. `--text-subtle` is the dimmest text allowed (≈ 5:1).
- Tokens have the editor's `:root` / `.dark` shape but only dark values exist until the editor has
  a light canvas.
- One accent per view: amber is the call to action and the focus ring; cyan is reserved for
  precision (snap markers, measurements) and is never a link colour.

## Files

Same conventions as `components/cad/`: kebab-case, one primary component per file, file name
matching the export.
