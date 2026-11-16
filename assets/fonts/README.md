Fonts the Open Graph images are rendered with at build time (`next/og` reads WOFF, not
WOFF2, so these are not the files `next/font` serves). Inter and Geist Mono are the latin
and Cyrillic subsets from Fontsource (Inter 5.2.8, Geist Mono 5.3.0). Readex Pro is Google Fonts' whole static 600 cut (TTF, latin and
Arabic): Satori's shaper fails on the Arabic subset alone as soon as a word meets a character
the subset lacks (`lib/og.tsx`). All three are under the SIL Open Font License 1.1 — see the
`OFL-*.txt` files.

**Polish's letters** (Ą ą Ć ć Ę ę Ł ł Ń ń Ś ś Ź ź Ż ż, U+0104–017C) are the one exception to "not
the files `next/font` serves": `inter-polish-wght.woff2` and `geist-mono-polish-wght.woff2` are
the faces both root layouts declare by `next/font/local`, before Inter and Geist Mono on a Polish
page (`lib/fonts.ts`), and `inter-polish-600-normal.woff` and `geist-mono-polish-400-normal.woff`
the card's. Each is those 16 letters cut from Fontsource's Latin Extended file of the same version
(`@fontsource-variable/inter@5.2.8` `inter-latin-ext-wght-normal.woff2`,
`@fontsource-variable/geist-mono@5.3.0` `geist-mono-latin-ext-wght-normal.woff2`, and the static
`@fontsource/inter@5.2.8` 600 and `@fontsource/geist-mono@5.3.0` 400 WOFF) with HarfBuzz's subsetter
through the npm package `subset-font` 2.9.0, the weight axis kept: 5,248 and 3,636 bytes where the
whole Latin Extended files are 85,068 and 14,696 (docs/i18n/pl.md, "Script and font"). The OFL
allows the subset, and neither font reserves its name.
