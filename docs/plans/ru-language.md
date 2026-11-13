# Russian (`ru`) — plan

The fourth language after the pilot, through skill `add-language`, as German did
(`docs/plans/de-language.md`, `docs/i18n/de.md`): `ru` from nothing to `live` at `/ru`, with the
whole site — the editor, the "Use" pages written by hand, the command pages' notes, the exercises,
the generated pages — and the command language of AutoCAD 2027 in Russian. The Russian session of
the visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system, never in
the language.

## Progress

The owner asked for three commits, each landed on `main` when it closes (skill `finish-feature`):
the research and this plan; the draft, reachable but unannounced (phases 1 to 5); `live` (phase
6). A session that resumes starts from `main` and from the table below; its work in progress is on
the branch `worktree-ru-language`.

| Block | State |
| --- | --- |
| Research and plan | Done 13/11/2026: this plan; `runacc.sh` reads the Russian console and runs a probe in Cyrillic; `console-pair.mjs` reads a trace whose message quotes with « » |
| Draft (phases 1–5) | Done 13/11/2026: registered as a `draft`; the engine's catalog whole (console, desktop, tables); the site, the editor, the "Use" pages, the command notes and the exercises; the Cyrillic metrics and share card; FROM read apart; `pluralMessage`'s `other`; `docs/i18n/ru.md` |
| Live (phase 6) | Next |

## 0. Research (13/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Russian (culture `ru-RU`, the only Russian one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Russian_Language_Pack.exe`, 246,064,056 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/1CB1C990-C8EF-3677-9EE8-CB0A3E0ADB65/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`). Signed by
  Autodesk, Inc. (Authenticode valid, DigiCert's timestamp), as the `AutoCAD_2027.1_Update.exe`
  kept from Italian's install.
- **Installed on the owner's AutoCAD on 13/11/2026**, with the owner's leave: the pack with `-q`,
  elevated, then the 2027.1 update again (both exit 0). `ru-RU/acadres.dll` is 26.0.116, as
  `de-DE/`; `acad.exe` stays 26.0.118. `extract-strings.mjs --lang ru` wrote the tables from the
  install (`all_ru.tsv`; `acad_ru.pgp`, 555 lines).
- **The console** runs in Russian (`runacc.sh … ru-RU`) once `runacc.sh` knows the banner's last
  line, which the console writes in Windows-1251 and the pipe reads as 1252 («Óòèëèòû ìåíþ
  AutoCAD çàãðóæåíû.», «Утилиты меню AutoCAD загружены.»). `Команда:`; LINE asks `Первая точка:`
  and `Следующая точка или [оТменить]:`.
- **Typing Cyrillic into the console.** It reads its input as Windows-1252 whatever its culture,
  so a Cyrillic answer arrives as mojibake (`Неизвестная команда "ÎÒ"`). A script given with `/s`
  and a UTF-8 BOM is read as Unicode: `ОТРЕЗОК` runs and `Т` answers its Undo. But a script loads
  no `acad.pgp` (`TH`, an alias of its own file, is unknown there; `RE-INIT` 16 does not help) and
  stops at the first unknown command. `runacc.sh` now writes a probe that 1252 cannot hold as such
  a script, so our own probes can type Russian words; the aliases come from `acad.pgp` itself,
  and whether one wins over a command's name from the desktop (below).
- **Help:** `https://help.autodesk.com/cloudhelp/2027/RUS/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (`GUID-0546E8D5-…` is «СОПРЯЖЕНИЕКРОМКИ (команда)»; FROM's page,
  `GUID-0EB8FEA1-…`, is «СМЕЩЕНИЕ (Ключевое слово)»).

### 2. `acad.pgp`

`research/strings/acad_ru.pgp`. Every alias is Cyrillic: no English letter is kept, so none means
another command than in English, but none of the English hand works either (an English user on a
Russian layout typing `L` sends `Д`, ДУГА). Names by `getcname`: LINE ОТРЕЗОК (`ОТ`), CIRCLE КРУГ
(`К`), ARC ДУГА (`Д`), MOVE ПЕРЕНЕСТИ (`П`), COPY КОПИРОВАТЬ (`КП`), OFFSET ПОДОБИЕ (`ПОД`), TRIM
ОБРЕЗАТЬ (`ОБР`), EXTEND УДЛИНИТЬ (`У`), FILLET СОПРЯЖЕНИЕ (`СОП`), CHAMFER ФАСКА (`ФАС`), ERASE
СТЕРЕТЬ (`С`), MIRROR ЗЕРКАЛО (`З`), ROTATE ПОВЕРНУТЬ (`ПОВ`), SCALE МАСШТАБ (`МШ`), ARRAY МАССИВ
(`МС`), STRETCH РАСТЯНУТЬ (`РАС`), EXPLODE РАСЧЛЕНИТЬ (`РАСЧ`), JOIN СОЕДИНИТЬ (`СО`), BREAK
РАЗОРВАТЬ (`РА`), PLINE ПЛИНИЯ (`ПЛ`), POLYGON МН-УГОЛ (`МН`), ELLIPSE ЭЛЛИПС (`Э`), SPLINE
СПЛАЙН (`СПЛ`), HATCH ШТРИХ, BLOCK БЛОК (`Б`), INSERT ВСТАВИТЬ (`В`), LAYER СЛОЙ (`СЛ`), TEXT
ТЕКСТ (`ДТ`), MTEXT МТЕКСТ (`МТ`), DIST ДИСТ (`ДИ`), AREA ПЛОЩАДЬ (`ПЩ`), LIST СПИСОК (`СП`), ID
КООРД, ZOOM ПОКАЗАТЬ (`ПО`), PAN ПАН, UCS ПСК, DIVIDE ПОДЕЛИТЬ (`ПД`), MEASURE РАЗМЕТИТЬ (`РМ`),
EXTRUDE ВЫДАВИТЬ (`ВЫД`), REVOLVE ВРАЩАТЬ (`ВЩ`), UNION ОБЪЕДИНЕНИЕ, SUBTRACT ВЫЧИТАНИЕ (`ВЫЧ`),
INTERSECT ПЕРЕСЕЧЕНИЕ (`ПЕР`), SLICE РАЗРЕЗ (`РАЗ`), UNDO ОТМЕНИТЬ, REDO ПОВТОРИТЬ, -OSNAP
-ПРИВЯЗКА.

- **U is `О`**, a one-letter name, and `acad.pgp` gives the alias `О` to ОБЪЕДИНЕНИЕ (UNION):
  which one AutoCAD runs is settled on the desktop in phase 4.
- `Л` is ЛИСТ (LAYOUT) and `М` МОДЕЛЬ: no command of ours.
- `getcname` answers nothing for what the console loads on demand (RECTANG, MTEXT, the arrays,
  MATCHPROP, PURGE, PROPERTIES, VIEW, UNITS, FROM, BLOCKSPALETTE): the `acad.pgp`'s targets
  (ПРЯМОУГ, МТЕКСТ, КОПИРОВАТЬСВ, ОЧИСТИТЬ, ЕДИНИЦЫ) and the RUS help's titles settle them.

### 3. The keywords' format

- **«или»** before the list, after a noun phrase: `Следующая точка или [оТменить]:` (20619),
  `Первый угол или [Круг/Многоугольник]:` (435). No verb after the list (two strings in the whole
  table have a word after `]`, neither a prompt we ask): nothing like German's `promptTails`.
- **`initget`** like the others': a capital inside a word marks the letter, so a label can start
  in lower case and the letter differ per command: LINE's Undo is `оТменить` (`Т`), PLINE's
  `Отменить` (`О`, 9964); PLINE's Length `длИна` (21298). Phase 4's `promptKeywords` slots carry
  what one command letters otherwise than another at a prompt English shares.
- **No space before a prompt's colon**, as English: `Команда:` (22843).
- **No «ё»**: the tables write «е» throughout (0 «ё» in 11,000 strings); the site follows them.
- **Several wordings for one English prompt**, as the others: OFFSET's distance is `Величина
  смещения или [Точка] <Точка>:` at 21215, `Расстояние смещения или […]` at 5406, `Укажите
  расстояние для смещения или [Несколько]:` at 67, and the console asks none of them: `Укажите
  расстояние смещения или [Через/Удалить/Слой] <Через>:` (the offset probes).
- `propose-commands.mjs --lang ru` (13/11/2026): 1,466 proposed, 217 `several`, 150 `partial`, 41
  `plural`, 8 `select`, 519 `no-source` (German's: 1,435, 221, 144, 40, 8, 512).
- **-OSNAP's words** (names/p07, typed through a script): `КОН` Endpoint, `СЕР` Midpoint, `ЦЕН`
  Center, `ГЦЕ` Geometric center (listed `Гцен`), `УЗЕ` Node, `КВА` Quadrant, `ПЕР`
  Intersection, `ПРО` Extension, `ТВС` Insertion, `НОР` Perpendicular, `КАС` Tangent, `БЛИ`
  Nearest, `КАЖ` Apparent intersection (listed `Каж Пер`), `ПАР` Parallel, `НИЧ` None; listed
  `Кон,Цен,Пер,Про`. `ОТКЛ` turns them off (names/p33; `НЕТ` is refused, `Неверные режимы объектной
  привязки.`).
- **FROM is `ОТ`** at a point prompt (names/p03: `Базовая точка:`, `<Смещение>:`, 26345, 26347),
  where the help's title says СМЕЩЕНИЕ, which the console refuses as it does `СМЕ` and `СМЕЩ`
  (`Неверная точка.`). At `Команда:` `ОТ` is ОТРЕЗОК's alias. **That breaks the engine's lookup**,
  which held one command per typed name: phase 4 reads FROM apart, by its own names, only where a
  point is asked (`EngineText`'s `POINT_MODIFIERS`; at `Command:` FROM was already an unknown
  command), and the catalog's test let FROM share a name with a command.
- **A typed snap's echo** (names/p09, p31, p34): `of` is a bare space (26066 `" "`) after КОН and
  СЕР, `to` is `к` (26067) after НОР and КАС. Not found: `Режим Конточка не определен для заданной
  точки.`, `Режим Нормаль …`, and КАС's without its name, `Режим не определен для заданной
  точки.`, as German's; then `Неверная точка.` at a first point, `Требуется точка или ключевое
  слово.` at a next one. A single letter at a point prompt is refused (`С`, names/p09).
- **A script stops at the first refused answer**, where the console's input goes on: each of our
  Russian probes ends at its first refusal.

### 4. Fonts

**`cyrillic`, and nothing to add.** Inter and Geist Mono have Cyrillic subsets on Google Fonts,
and `next/font` already declares every subset with its `unicode-range`, preloading only latin: a
page downloads Inter's and Geist Mono's Cyrillic files only when it shows a Cyrillic letter. So
`/ru` pays for them in its first load and no other page does. `SCRIPT` gains `cyrillic`, and
`INTER_SCRIPTS` says which scripts need no face of their own. The share card is Satori's, which
reads WOFF: Fontsource's Cyrillic subsets of the same versions (Inter 5.2.8, 9,936 bytes; Geist
Mono 5.3.0, 7,100 bytes) join `assets/fonts` behind the latin ones.

**The engine measures text** with Arial's widths (`textFontMetrics.ts`, from Arimo), which held
latin and Greek: a Cyrillic letter was measured as an average glyph. Phase 5 has
`scripts/fonts/metrics.ts` read U+0400–04FF too (Arimo has them), for every language's drawings.

### 5. Plurals

CLDR `ru`: `one` (1, 21, 101…), `few` (2–4, 22–24…), `many` (0, 5–20, 25…) and `other`, which only
a fraction reaches (1.5). Every count that agrees with a noun is a four-form plural. **`pluralMessage`
failed for Russian**: it took each category's form from a whole number, found none for `other`,
and threw on `/ru` (a 500 on the landing in `next dev`). Phase 1 takes `other` from 1.5 where no
whole number reaches it (`lib/plural.ts`, for every language). `Intl.NumberFormat("ru")` writes
`12 345,5` (U+00A0); the engine's counts are latin digits, ungrouped (`cad-catalogs.md`).

### 6. Length

On the same table ids, measured as German's (13/11/2026): labels of up to 20 characters +21% in
total (median +15%, 90th percentile +73%), prompts +6% (median +4%); German +23%, +17%, +68%,
+16%; Italian +27%, +20%, +71%, +27%. **Russian is the shortest in characters** — its prompts are
noun phrases (`Первая точка:`) — but its letters are wider and its words long: 4.3% of labels hold
a word of 14 letters or more (German 11.9%, Italian 3.0%): `Редактирование`, `Панорамирование`, `Штрихпунктирная`.
Phase 6's screenshots look for a word cut or overflowing.

### 7. Input

**ЙЦУКЕН** (Russia, Ukraine's Russian speakers, Kazakhstan, Belarus). Every letter is Cyrillic,
with no composition and no dead keys. Shortcuts: `shortcutKey` already takes a Ctrl combination's
physical key (`e.code`), so Ctrl+Z undoes from the key labelled Я. Typed text is taken as typed:
`ОТ` reaches the command line, and `LINE` typed on the latin layout is an unknown command, as in
Russian AutoCAD; `_LINE` runs in both. The layout has no `@`, `<` or `>` (Shift+2 is `"`, the
keys of `,` and `.` type `б` and `ю`), so a Russian user switches to the latin layout to type
`@10<45`, as in AutoCAD: nothing to change. The decimal point is the key right of `ю` (`.`), and
Shift with it is `,`. Checked in the command line and the dynamic input in phase 6
(`browser-verify`).

### Search texts

Google's suggestions (`hl=ru`; `gl=ru`, `ua`, `kz`; 101 seeds), Yandex's (its suggest endpoint,
no account: Russia and Kazakhstan), Google Trends (12 months: Russia, Ukraine, Kazakhstan, two
comparisons for Belarus) and Bing's top ten (`cc=ru`), 13/11/2026; the data is in
`~/seo-data/raw-2026-11-13/ru-keywords/`, outside the repository. Yandex has some 72% of
Russia's searches, so Trends is a weak signal there: below «автокад» everything sits at 0–16, and
Yandex's long suggestions are the better guide. Wordstat asks for a sign-in, and Yandex's results
page for a captcha: neither was read.

- **The generic term is «чертить / черчение онлайн» and «программа для черчения»**, not «CAD»:
  Trends (Russia) gives «автокад» 75, «autocad» 42, and every generic query 0–4 («cad онлайн» 0–2,
  «чертежи онлайн» 4); Belarus «чертить онлайн» 5. Yandex suggests «чертить онлайн бесплатно на
  компьютере без скачивания», «чертить онлайн с размерами (бесплатно, 2d)», «черчение онлайн
  программа бесплатно на русском», «программа для черчения на компьютере бесплатно на русском»,
  «онлайн чертилка с размерами бесплатно». Russian's own modifiers are **«с размерами»** and **«на
  русском»**; «бесплатно» and «онлайн» are everywhere; «без регистрации» is rare and «в браузере»
  and «без установки» are never searched (competitors' titles carry them).
- **«автокад», not «AutoCAD»**, about four to one (Google, Russia: 197 suggestions to 44; Yandex
  169 to 31). The titles keep the brand in latin, as the other languages do: the engines take one
  for the other («autocad» is «автокад»'s first related query, 100), and «AutoCAD» does not
  inflect, so it goes after a preposition («в AutoCAD», «по AutoCAD»).
- **The home:** after «автокад» the brand's queries are the largest: «автокад бесплатно» 15,
  «автокад онлайн» 12–16, «автокад 3д» 12; Yandex «автокад онлайн бесплатно чертить», «… на
  русском чертить бесплатно». «AutoCAD бесплатно» is never written as a claim (it mostly means
  downloading AutoCAD). The title opens with «Чертить онлайн бесплатно» and carries «команды
  AutoCAD»; the description «программа для черчения онлайн», «с размерами» and «на русском и
  английском».
- **The command list:** «команды автокад» 0–3 in Trends, suggested as «… на русском и английском»,
  «… на английском», «… список», «все команды autocad на английском»: the bilingual list is the
  search.
- **A command:** both names are searched («сопряжение автокад на английском», «команда offset в
  русском автокаде», «fillet autocad на русском»), ОБРЕЗАТЬ, ПОДОБИЕ, СОПРЯЖЕНИЕ, УДЛИНИТЬ,
  ЗЕРКАЛО, ФАСКА, МАССИВ, РАСЧЛЕНИТЬ and ОТРЕЗОК among them; where the noun is not the name, the
  noun («штриховка», Trends 4, the most searched command word, for ШТРИХ; «полилиния» for
  ПЛИНИЯ). Yandex frames them as «как … в автокаде». «обрезать автокад» is mostly clipping images:
  TRIM's lead says «обрезать линию».
- **Practice:** «упражнения автокад» is 0; the word is **«задания»**: «задания по автокаду для
  начинающих / для студентов», «практические задания по автокаду», «чертежи для автокада для
  начинающих с размерами».
- **DXF:** «открыть dxf» 5, «dxf онлайн» 3, «dxf viewer» 0 in Trends; suggested «открыть dxf онлайн
  (бесплатно, с размерами)», «просмотр dxf онлайн с размерами», «чем открыть dxf», «dxf онлайн
  редактор», «редактировать dxf онлайн».
- **The guides:** «план квартиры онлайн» belongs to room planners (its SERP: flat-planner,
  remplanner, planner5d); the drawing's search is «начертить план дома / квартиры с размерами»
  and «как начертить план дома в автокаде». «полярные координаты в автокаде», «ввод координат в
  автокаде». 3D: «автокад 3д» 12, written «3д».
- **The SERP** for «чертить онлайн бесплатно» (Bing, `cc=ru`): vatmancad.ru, cadcraft.io/ru,
  chertilka.online, cad.model-r.ru, kontrcad.ru, opencadstudio.com/ru-RU, their titles with «как
  AutoCAD», «без установки», «по ГОСТ», «с размерами»; for «команды автокад», Autodesk's RUS help
  first.
- **By country:** Ukraine writes «autocad» nearly as often as «автокад» (65 to 73) and mixes
  Ukrainian in; Kazakhstan «автокад» 62, «autocad» 41, three comparisons below Trends' threshold;
  Belarus «автокад» 71. Russian-language demand outside Russia is thin.

The texts written from them, in phase 2: the landing «Чертить онлайн бесплатно, с командами
AutoCAD — MellowCAD»; the hero «Черчение онлайн бесплатно, с командами AutoCAD»; the commands
«Команды AutoCAD на русском и английском»; a command «Команда ОБРЕЗАТЬ (TRIM) в AutoCAD», the noun
first where it is searched («Штриховка в AutoCAD: команда ШТРИХ (HATCH)»); the exercises «Задания
по AutoCAD для начинающих»; «Открыть DXF онлайн», «Редактировать DXF онлайн»; the floor plan
«Как начертить план дома в AutoCAD».

### Decisions

- **Tag `ru`, URL `/ru`**, `og:locale` `ru_RU`, «Русский» in the selector: one Russian for
  Russia, Ukraine, Kazakhstan and Belarus, as AutoCAD has one (`ru-RU`). No prefix map entry.
- **Register:** Autodesk's: formal «вы» (its tables' 15), lower case in running text, as the RUS
  help writes it; imperatives as its help's («Введите ОТ. Нажмите ENTER.»). Key names as Russian
  AutoCAD prints them: `ENTER` in a prompt, Enter, Ctrl, Shift in prose.
- **Typography:** «…» and „…“ inside, unspaced; no space before `: ; ! ?`; a dash with spaces
  (` — `); «е» for «ё», as Autodesk. What is copied from AutoCAD keeps its marks.
- **Order of the phases as German's**: 0, 1, 3–4, 2, 5, 6 (the command notes name each command in
  Russian).

## Phases

| Phase | Block | What it touches |
| --- | --- | --- |
| 0 | research | `runacc.sh`'s Russian banner and a Cyrillic probe as a UTF-8 script; `console-pair.mjs`'s records read to the end of their JSON; our Russian probes (`names/*.ru.txt`, p36); this plan |
| 1 | draft | `routing.ts` (`ru`: `draft`, `localized`, `cyrillic`, «Русский», `ru_RU`; `INTER_SCRIPTS`), `catalogs`, the docs' quotes («»), empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), `pluralMessage`'s `other`, its page in `docs/i18n` |
| 3–4 | draft | the engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs --like de`), the command language from the console (`console-pair.mjs --select`, `probe.sh --lang ru --lang-only`), `getcname` and the RUS help, the messages rebuilt as ICU with four-form plurals; its entry point; `· ru` in every coverage heading; `russianPrompts.test.ts`; the toggles, readouts and `О` from the Russian desktop |
| 2 | draft | the site's catalog from the search texts, the editor's catalog by id, the "Use" pages, the command notes and the exercises (agents, one brief, each file read before the commit), the generated pages |
| 5 | draft | the text metrics' Cyrillic; the share card's Cyrillic faces; the fonts as above |
| 6 | live | the gate, a production build (`●`), every language's landing first load before and after (Brotli q11; `/fr` is 472 bytes under 250 KiB: trim before `live` if one passes; `/ru` is held to 275 KiB, as it pays for a script's files), screenshots for long words, ЙЦУКЕН, `live`; a model's reread; what names or counts the languages by hand; after the push, `gsc-prioritize.mjs`'s weight for `/ru`, IndexNow, the directories' listings |

## Unverified

`docs/i18n/ru.md`, "Unverified" and "Per command": what no probe showed, and what Russian words
per command where English shares one prompt id.
