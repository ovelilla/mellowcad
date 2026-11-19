Fonts the Open Graph images are rendered with at build time (`next/og` reads WOFF, not
WOFF2, so these are not the files `next/font` serves). Inter and Geist Mono are the latin
and Cyrillic subsets from Fontsource (Inter 5.2.8, Geist Mono 5.3.0). Readex Pro is Google Fonts' whole static 600 cut (TTF, latin and
Arabic): Satori's shaper fails on the Arabic subset alone as soon as a word meets a character
the subset lacks (`lib/og.tsx`). All three are under the SIL Open Font License 1.1 — see the
`OFL-*.txt` files.

**Polish's, Czech's and Hungarian's letters** (Polish Ą ą Ć ć Ę ę Ł ł Ń ń Ś ś Ź ź Ż ż, Czech Č č
Ď ď Ě ě Ň ň Ř ř Š š Ť ť Ů ů Ž ž, Hungarian Ő ő Ű ű, all of Latin Extended-A) are the one exception to "not the files `next/font`
serves": `inter-letters-wght.woff2` and `geist-mono-letters-wght.woff2` are the faces both root
layouts declare by `next/font/local`, before Inter and Geist Mono on a Polish, Czech or Hungarian page
(`lib/fonts.ts`), and `inter-letters-600-normal.woff` and `geist-mono-letters-400-normal.woff` the
card's. Each is those 38 letters cut from Fontsource's Latin Extended file of the same version
(`@fontsource-variable/inter@5.2.8` `inter-latin-ext-wght-normal.woff2`,
`@fontsource-variable/geist-mono@5.3.0` `geist-mono-latin-ext-wght-normal.woff2`, and the static
`@fontsource/inter@5.2.8` 600 and `@fontsource/geist-mono@5.3.0` 400 WOFF) with HarfBuzz's subsetter
through the npm package `subset-font` 2.9.0, the weight axis kept: 8,180 and 5,480 bytes where the
whole Latin Extended files are 85,068 and 14,696 (the Polish 16 alone, 5,248 and 3,636; with
Czech's 18, 7,680 and 5,136, each cut reproduced byte for byte; docs/i18n/pl.md, docs/i18n/cs.md
and docs/i18n/hu.md, "Script and font"). The next language in Latin Extended-A adds
its letters here, and the `unicode-range` of both layouts. The OFL allows the subset, and neither
font reserves its name.
