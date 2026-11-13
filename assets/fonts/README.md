Fonts the Open Graph images are rendered with at build time (`next/og` reads WOFF, not
WOFF2, so these are not the files `next/font` serves). Inter and Geist Mono are the latin
and Cyrillic subsets from Fontsource (Inter 5.2.8, Geist Mono 5.3.0). Readex Pro is Google Fonts' whole static 600 cut (TTF, latin and
Arabic): Satori's shaper fails on the Arabic subset alone as soon as a word meets a character
the subset lacks (`lib/og.tsx`). All three are under the SIL Open Font License 1.1 — see the
`OFL-*.txt` files.
