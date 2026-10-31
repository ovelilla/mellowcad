# Brazilian Portuguese (`pt-BR`) — plan

The pilot of the language system (`docs/next-languages.md`, phase 5): `pt-BR` from nothing to
`live` through skill `add-language`, phase by phase. What does not fit is fixed in the system
(scripts, skills, rules, tests), never worked around in the language.

## 0. Research (31/10/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Brazilian Portuguese (culture `pt-BR`, one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Brazilian_Portuguese_Language_Pack.exe`, 246 MB,
  build 26.0.60.0, at
  `https://up1.autodesk.com/prd/2027/ACD/BBB8442F-0522-3CED-B0A2-D1852FF65B2B/` (linked from the
  forum thread "2027 Product download links"; the same server hosts every pack and the update).
- **The tables come from the update, not the pack.** The pack is the release build. 2027.1
  (`AutoCAD_2027.1_Update.exe`, 1.4 GB, build 26.0.116.0, at
  `https://up1.autodesk.com/prd/2027/ACD/DB48EE8C-BA9A-332A-9F6F-3F6296E95477/`) carries every
  culture's resource DLLs whole, and rewords 101 of pt-BR's strings (86 in `acadres`, 15 in
  `AcDimRes`: `extremidade` → `ponto final`, the Endpoint wording). Its Spanish DLLs give the
  installed AutoCAD's tables byte for byte, so the update is the installed product.
  `scripts/research/open-pack.sh --lang pt-BR <update.exe> <pack.exe>` extracts both; the
  tables in `research/strings/` (`all_pt-BR.tsv`, `acad_pt-BR.pgp`…) are 2027.1's.
- **Not installed** on the owner's AutoCAD: no console or desktop in pt-BR yet. Installing the
  pack is asked of the owner before phase 4; until then what only the console settles is
  **unverified** (§ "Unverified").
- **Help:** `https://help.autodesk.com/cloudhelp/2027/PTB/AutoCAD-Core/files/GUID-….htm`
  answers with the English GUIDs (`GUID-50383F73-…` is «Guia Snap ao objeto (caixa de diálogo
  Configurações do desenho)»). The help MCP with `pt_BR` answers in English: search in English,
  read in `PTB`.

### 2. `acad.pgp`

`research/strings/acad_pt-BR.pgp` (641 lines, UTF-8 with BOM, CRLF, tabs between fields:
`propose-commands.mjs` reads it as is). Letters that run another command than in English, among
the ones an English hand types without thinking:

| Alias | English    | pt-BR                                                   |
| ----- | ---------- | ------------------------------------------------------- |
| `C`   | CIRCLE     | COR (COLOR); CIRCULO is `CI`                            |
| `E`   | ERASE      | ESTICAR (STRETCH); APAGAR is `APG`, and `DELETE` stays  |
| `O`   | OFFSET     | OCULTAR (HIDE); DESLOCAMENTO has no alias               |
| `H`   | HATCH      | HACHLIM; HACHURA is `HC`, `-HACHURA` is `-H`            |
| `U`   | U          | UNIAO (UNION); U's own name is not settled (§ Unverified) |
| `MA`  | MATCHPROP  | MATRIZ (ARRAY)                                          |
| `AP`  | APPLOAD    | APARAR (TRIM)                                           |
| `EX`  | EXTEND     | EXTRUSAO; ESTENDER is `EST`                             |
| `REC` | RECTANG    | RECUPERARDESENHO; RETANGULO is `RET`                    |
| `PR`  | PROPERTIES | OPCOES; PROPRIEDADES is `ALT` and `PROPS`               |
| `RE`  | REGEN      | REFERENCIASEXTERNAS; REGEN is `RG`                      |

And none at all for `F`, `TR`, `S`, `SC`, `MI`, `J`, `B`, `LA`, `BR`, `PE`, `CH`, `MO`, `D`, `DT`,
`MT`, `LT`, `LW`, `PU`: in pt-BR AutoCAD they are unknown commands, as they will be here. `LAYER`
is an alias of CAMADA, and `COTAD` of the English `DIMSTYLE` (the file's own oddity, copied).

### 3. The keywords' format

- **«ou»**, deduced by `orWords` from the tables (` (ou)$`), with no list per language.
- **`initget`** like Spanish's: the capital inside a word marks the letter
  (`Arco Fechar Meialargura Comprimento LInha Desfazer LArgura _Arc Close Halfwidth Length LIne
  Undo Width`, 21298); the label in the prompt is the same word (`[Arco/Fechar/…]`).
- **Two imperatives.** Prompts mix `Especificar` (561 strings) and `Especifique` (120),
  `Selecionar` (150) and `Selecione` (114) — the same English prompt worded both ways by
  different ids. The catalog takes the one the command's own id uses; where several ids disagree
  (`several` in the proposal) the console decides.
- `Comando:` (22843), so `probe.sh --lang pt-BR` ends its probes where it should.
- `propose-commands.mjs --lang pt-BR`: 991 proposed, 158 `several`, 95 `partial`, 22 `plural`,
  6 `select`, 254 `no-source` (Spanish: 966, 185, 95, 22, 6, 252). `names` 99 of 122, `keywords`
  65 of 71, `promptKeywords` 5 of 17, `keywordLabels` 21 of 31. One to doubt already: `-OSNAP`'s
  `OFF` proposed as `Desativado`, where Spanish's is `DES` from the console.

### 4. Fonts

`latin`. Inter (`inter-latin-600-normal.woff`, the share card's) and Geist Mono have every
Portuguese letter (ã õ â ê ô à ç and capitals, ª º « » – —): nothing to add, no budget spent.

### 5. Plurals

CLDR `pt-BR`: `one`, `many`, `other` — and **`one` takes 0 and 1.5** (`i = 0..1`), unlike
English, Spanish and `pt-PT`: `{count, plural, one {# objeto} other {# objetos}}` prints
«0 objeto». `many` is for compact millions (`1 milhão de objetos`), which no message prints. A
count that can be 0 gets its `=0` where the English has one, and AutoCAD's own counts are its
`encontrado(s)` style, copied from the table as Spanish copies its own.

### 6. Length

On the same table ids, pt-BR runs like Spanish: labels of up to 20 characters +24% in total
(median +15%, 90th percentile +71%; Spanish +25%, +15%, +75%), prompts +25% (Spanish +22%). What
fits Spanish should fit; the screenshots of phase 6 check it.

### 7. Input

ABNT2 is latin with dead keys (´ ` ~ ^ ¨) and its own `ç`. Command names and keywords are ASCII
(`CIRCULO`, `RETANGULO`; the keyword's letter of `âNgulo` is `N`). The command line and the
dynamic input are real `<input>`s, so a dead key composes in them natively; whether a dead key
pressed with the canvas focused reaches them composed is checked in the browser in phase 6, and
no IME handling is added unless that fails.

### Search texts

Google's suggestions in Brazil (`hl=pt-BR`, `gl=br`), 31/10/2026: «autocad online gratuito»,
«cad 2d online grátis», «desenho técnico online (gratuito)», «programa (de) desenho técnico
gratuito», «programa cad gratuito», «desenhar planta baixa online grátis», «alternativa ao
autocad gratuito», and — the one MellowCAD answers best — «comandos autocad português e inglês»,
«atalhos autocad em português»: **atalhos** is the word for aliases, and the two command
languages side by side are what people look for. «grátis» and «gratuito» are both searched.
«sem cadastro» is not suggested. Title to write from these in phase 2, e.g. «CAD 2D online
grátis com os comandos do AutoCAD — MellowCAD».

### Decisions

- **URL `/pt-br`**, tag `pt-BR` everywhere else (catalogs, `lang`, `hreflang`; `og:locale`
  `pt_BR`). next-intl allows it with root params: `localePrefix.prefixes: { "pt-BR": "/pt-br" }`
  in `routing` makes `getPathname` give `/pt-br/…`; the `[locale]` segment then carries the
  prefix (`pt-br`), and `i18n/request.ts` maps it back to the tag (a map from `routing`, not a
  `toLowerCase`). Every place that writes `/${locale}` reads the prefix instead: `localePath`,
  `unlocalizedPath`, the rewrites, redirects and fallbacks (`i18n/rewrites.ts`), both layouts'
  `generateStaticParams`, the `og`, `docs-md` and manifest routes, `lib/docs/*`. `/pt-BR/…`
  is not served: nothing links to it, and Next's route matching is case-insensitive
  (`path-match.js`, `sensitive: false`), so a redirect from it to `/pt-br` would loop.
- `LANGUAGE_NAMES`: «Português (Brasil)» — the language is Brazil's, and a reader from Portugal
  should see that before choosing it.
- Register (phase 2, from Autodesk's PTB help): the editor labels as AutoCAD pt-BR does; the
  landing speaks to «você» in the imperative («Digite L. Pressione Enter. Desenhe.»).

## Phases

`<tag>` is `pt-BR` below.

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `fix(research)` + `docs` | `open-pack.sh`; `forms()` takes the language's «ou»; `probe.sh`'s language suffixes; skills `autocad-research`, `add-language`, `language-review`; this plan |
| 1 | `feat(i18n)` | `routing.ts` (tag, prefix, every map: `draft`, `localized`, `latin`), the prefix plumbing of "Decisions", `i18n/messages.ts`'s `catalogs`, `docs/i18n/<tag>.md` with the status lines and this research; tests: `navigation.test.ts`, `rewrites.test.ts` and `next-config.test.ts` with a prefix that is not the tag |
| 2 | `feat(i18n)` | `messages/<tag>.json`, `packages/editor/src/locales/<tag>.json` (`npm run locales`), the four "Use" pages `content/docs/<page>.<tag>.mdx`; each term with its PTB GUID or table id in `docs/i18n/<tag>.md` |
| 3 | `feat(i18n)` | `cad/locales/<tag>.json` `interface`, the package entry (`exports`, tsdown, build tsconfig), `cad/README.md`, `cad/docs/languages.md`, `ENGINE_LOCALES`, `EDITOR_LOCALES` |
| 4 | `feat(engine)` | `commands` whole from `research/proposals/pt-BR.json`, the rest by hand from the report, `catalog-sweep.mjs --lang pt-BR`, console probes if the pack is installed; `· pt-BR` in each coverage entry; `npm run docs:check` |
| 5 | — | nothing: latin, left to right; plurals as §5 (in phases 2–4) |
| 6 | `feat(i18n)` | gate, production build (`●`), budgets (`language-review`), screenshots at 360 px and the palettes, the dead keys; `live`, selector, `hreflang`, sitemap, «Next up» off in every language, `docs/i18n/README.md`'s row; this plan shrinks to a summary |

Phase 4 is three or four sessions on its own: Spanish's `several` and `no-source` took the
console, command by command.

## Unverified

Until the pack is installed (or for good, if the owner declines): which of several table strings
a prompt uses (158 `several`), the capitals of an `initget` the table does not hold (`-OSNAP`),
U's name (`C`, 21134 and 45049, or `D`, 52855), and the names the tables lack (CIRCLED, CIRCLE2P,
CIRCLE3P, ARCSCE, ARCCSE, ELLIPSEC, ELLIPSEARC, PEDIT — `EDITARP`, 52749 —, EATTEDIT, MATCHPROP,
FROM, DIMSTYLE, BLOCKSPALETTE, PURGE, -PURGE, LAYERCLOSE, PROPERTIES, PROPERTIESCLOSE, 3DORBIT,
NAVVCUBE, UNITS, AUPREC), from the PTB help where it names them.

## Next session

> Ejecuta la fase 1 de docs/plans/pt-BR-language.md (registro de pt-BR como draft, con la URL
> /pt-br), y la 2 y la 3 si caben. Lee antes el plan entero, el brief docs/next-languages.md, el
> skill add-language y las reglas i18n.md y cad-catalogs.md. Puede haber otras sesiones en el
> árbol: commit con git commit --only -- <tus archivos>; si el gate está rojo por otros, pásalo en
> un worktree limpio. No hagas push. Pon al día el plan y el estado del brief.
