# Brazilian Portuguese (`pt-BR`)

> **Command language:** `localized`, Brazilian Portuguese AutoCAD's. **Status:** `draft` since
> 31/10/2026, at `/pt-br`; nothing translated yet, so it shows in English. **Review:** none; the
> language pack is not installed, so what only its console settles is **unverified** below.

The words will be Autodesk's own Brazilian Portuguese localization of AutoCAD, never a translation
of ours, as Spanish's are (`es.md`). The language is Brazil's, and `LANGUAGE_NAMES` says so
(«Português (Brasil)»), so a reader from Portugal sees it before choosing it.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Brazilian Portuguese (culture `pt-BR`, one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Brazilian_Portuguese_Language_Pack.exe`, 246 MB,
  build 26.0.60.0, at
  `https://up1.autodesk.com/prd/2027/ACD/BBB8442F-0522-3CED-B0A2-D1852FF65B2B/` (linked from the
  forum thread "2027 Product download links").
- **The tables come from the update, not the pack.** The pack is the release build; 2027.1
  (`AutoCAD_2027.1_Update.exe`, build 26.0.116.0, at
  `https://up1.autodesk.com/prd/2027/ACD/DB48EE8C-BA9A-332A-9F6F-3F6296E95477/`) carries every
  culture's resource DLLs whole and rewords 101 of pt-BR's strings (86 in `acadres`, 15 in
  `AcDimRes`: `extremidade` → `ponto final`, the Endpoint wording). Its Spanish DLLs are the
  installed AutoCAD's byte for byte, so the update is the installed product.
  `scripts/research/open-pack.sh --lang pt-BR <update.exe> <pack.exe>` extracts both; the tables
  in `research/strings/` (`all_pt-BR.tsv`, `acad_pt-BR.pgp`…) are 2027.1's.
- **Help.** `https://help.autodesk.com/cloudhelp/2027/PTB/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-50383F73-…` is «Guia Snap ao objeto (caixa de diálogo
  Configurações do desenho)»). The help MCP with `pt_BR` answers in English: search in English,
  read in `PTB`.
- **Console and desktop:** not yet. The pack is not installed on the owner's AutoCAD; installing it
  is asked of the owner before the command language is written.

## Deviations

- **The URL is `/pt-br`**, the tag `pt-BR` everywhere else (catalogs, `lang`, `hreflang`;
  `og:locale` `pt_BR`): `localePrefix.prefixes` in `i18n/routing.ts`, the `[locale]` segment
  carrying the prefix and `segmentLocale` mapping it back to the tag. `/pt-BR/…` is not served:
  nothing links to it, and Next matches routes without case, so a redirect from it would loop.
- **The editor's catalog exports `ptBR`** (`@mellowcad/editor/locales/pt-BR`), since a tag with a
  hyphen is no identifier (`catalogExport`, `scripts/locales/compile.ts`).

## Register

The editor labels as AutoCAD pt-BR does (its help, `PTB`). The landing speaks to «você» in the
imperative («Digite L. Pressione Enter. Desenhe.»).

## Search texts

Google's suggestions in Brazil (`hl=pt-BR`, `gl=br`), 31/10/2026: «autocad online gratuito», «cad
2d online grátis», «desenho técnico online (gratuito)», «programa (de) desenho técnico gratuito»,
«programa cad gratuito», «desenhar planta baixa online grátis», «alternativa ao autocad gratuito»,
and — the one MellowCAD answers best — «comandos autocad português e inglês», «atalhos autocad em
português»: **atalhos** is the word for aliases, and the two command languages side by side are
what people look for. «grátis» and «gratuito» are both searched; «sem cadastro» is not suggested.
A title to write from these: «CAD 2D online grátis com os comandos do AutoCAD — MellowCAD».

## Command language

### `acad.pgp`

`research/strings/acad_pt-BR.pgp` (641 lines, UTF-8 with BOM, CRLF, tabs between fields:
`propose-commands.mjs` reads it as is). Letters that run another command than in English, among
the ones an English hand types without thinking:

| Alias | English    | pt-BR                                                     |
| ----- | ---------- | --------------------------------------------------------- |
| `C`   | CIRCLE     | COR (COLOR); CIRCULO is `CI`                              |
| `E`   | ERASE      | ESTICAR (STRETCH); APAGAR is `APG`, and `DELETE` stays    |
| `O`   | OFFSET     | OCULTAR (HIDE); DESLOCAMENTO has no alias                 |
| `H`   | HATCH      | HACHLIM; HACHURA is `HC`, `-HACHURA` is `-H`              |
| `U`   | U          | UNIAO (UNION); U's own name is not settled (unverified)   |
| `MA`  | MATCHPROP  | MATRIZ (ARRAY)                                            |
| `AP`  | APPLOAD    | APARAR (TRIM)                                             |
| `EX`  | EXTEND     | EXTRUSAO; ESTENDER is `EST`                               |
| `REC` | RECTANG    | RECUPERARDESENHO; RETANGULO is `RET`                      |
| `PR`  | PROPERTIES | OPCOES; PROPRIEDADES is `ALT` and `PROPS`                 |
| `RE`  | REGEN      | REFERENCIASEXTERNAS; REGEN is `RG`                        |

And none at all for `F`, `TR`, `S`, `SC`, `MI`, `J`, `B`, `LA`, `BR`, `PE`, `CH`, `MO`, `D`, `DT`,
`MT`, `LT`, `LW`, `PU`: in pt-BR AutoCAD they are unknown commands, as they will be here. `LAYER`
is an alias of CAMADA, and `COTAD` of the English `DIMSTYLE` (the file's own oddity, copied).

### The keywords' format

- **«ou»** before the list, deduced by `orWords` from the tables (` (ou)$`), with no list per
  language.
- **`initget`** like Spanish's: the capital inside a word marks the letter (`Arco Fechar
  Meialargura Comprimento LInha Desfazer LArgura _Arc Close Halfwidth Length LIne Undo Width`,
  21298); the label in the prompt is the same word (`[Arco/Fechar/…]`).
- **Two imperatives.** Prompts mix `Especificar` (561 strings) and `Especifique` (120),
  `Selecionar` (150) and `Selecione` (114) — the same English prompt worded both ways by different
  ids. The catalog takes the one the command's own id uses; where several ids disagree (`several`
  in the proposal) the console decides.
- `Comando:` (22843), so `probe.sh --lang pt-BR` ends its probes where it should.
- `propose-commands.mjs --lang pt-BR`: 991 proposed, 158 `several`, 95 `partial`, 22 `plural`, 6
  `select`, 254 `no-source` (Spanish: 966, 185, 95, 22, 6, 252). `names` 99 of 122, `keywords` 65
  of 71, `promptKeywords` 5 of 17, `keywordLabels` 21 of 31. One to doubt already: `-OSNAP`'s `OFF`
  proposed as `Desativado`, where Spanish's is `DES` from the console.

### Unverified

Until the pack is installed (or for good, if the owner declines): which of several table strings a
prompt uses (158 `several`), the capitals of an `initget` the table does not hold (`-OSNAP`), U's
name (`C`, 21134 and 45049, or `D`, 52855), and the names the tables lack (CIRCLED, CIRCLE2P,
CIRCLE3P, ARCSCE, ARCCSE, ELLIPSEC, ELLIPSEARC, PEDIT — `EDITARP`, 52749 —, EATTEDIT, MATCHPROP,
FROM, DIMSTYLE, BLOCKSPALETTE, PURGE, -PURGE, LAYERCLOSE, PROPERTIES, PROPERTIESCLOSE, 3DORBIT,
NAVVCUBE, UNITS, AUPREC), from the PTB help where it names them.

## Script and font

`latin`. Inter (`inter-latin-600-normal.woff`, the share card's) and Geist Mono have every
Portuguese letter (ã õ â ê ô à ç and capitals, ª º « » – —): nothing to add, no budget spent.

## Plurals

CLDR `pt-BR`: `one`, `many`, `other` — and **`one` takes 0 and 1.5** (`i = 0..1`), unlike English,
Spanish and `pt-PT`: `{count, plural, one {# objeto} other {# objetos}}` prints «0 objeto». `many`
is for compact millions (`1 milhão de objetos`), which no message prints. A count that can be 0
gets its `=0` where the English has one, and AutoCAD's own counts are its `encontrado(s)` style,
copied from the table as Spanish copies its own.

## Length

On the same table ids, pt-BR runs like Spanish: labels of up to 20 characters +24% in total
(median +15%, 90th percentile +71%; Spanish +25%, +15%, +75%), prompts +25% (Spanish +22%). What
fits Spanish should fit; the screenshots before going live check it.

## Input

ABNT2 is latin with dead keys (´ ` ~ ^ ¨) and its own `ç`. Command names and keywords are ASCII
(`CIRCULO`, `RETANGULO`; the keyword's letter of `âNgulo` is `N`). The command line and the dynamic
input are real `<input>`s, so a dead key composes in them natively; whether a dead key pressed with
the canvas focused reaches them composed is checked in the browser before going live, and no IME
handling is added unless that fails.

## Review

Nothing to review yet: no word is translated.
