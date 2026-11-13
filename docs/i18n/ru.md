# Russian (`ru`)

> **Command language:** `localized`, Russian AutoCAD's. **Status:** `live` since 13/11/2026, at
> `/ru`. **Review:** none by a native speaker (the owner knows none); a model's reread of what
> Autodesk did not write ("Review"). The plan and its commits: `docs/plans/ru-language.md`.

The words are Autodesk's own Russian localization of AutoCAD, never a translation of ours, as the
other localized languages' are. One Russian for every Russian reader — Russia, Ukraine,
Kazakhstan, Belarus — as AutoCAD has one (`ru-RU`). Autodesk writes «е» for «ё» (no «ё» in its
tables), and so does every page here.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Russian (culture `ru-RU`, the only Russian one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Russian_Language_Pack.exe`, 246,064,056 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/1CB1C990-C8EF-3677-9EE8-CB0A3E0ADB65/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 13/11/2026**, with the owner's leave: the pack with `-q`,
  elevated, then `AutoCAD_2027.1_Update.exe` again, so `ru-RU/acadres.dll` is 26.0.116 (2027.1),
  as every other pack's, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang ru`: `all_ru.tsv`; `acad_ru.pgp`, 555 lines).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/RUS/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-0546E8D5-…` is «СОПРЯЖЕНИЕКРОМКИ (команда)»). Search in
  English (the help MCP), read in `RUS`. The help can be wrong: FROM's page is «СМЕЩЕНИЕ», which
  the console refuses.
- **Console:** `runacc.sh … ru-RU` and `probe.sh --lang ru`. It reads its input as Windows-1252,
  so a probe with Cyrillic goes as a UTF-8 script (`/s`), which loads no `acad.pgp` and stops at
  its first refused answer (`autocad-research`, console.md). **Desktop:** `acad.exe /language
  ru-RU`.

## Register

- **Formal «вы»**, lower case, as Autodesk's Russian help addresses the user; imperatives as its
  help's («Введите ОТ. Нажмите Enter.»). Keys as Russian AutoCAD prints them: `ENTER` in a prompt,
  Enter, Esc, Shift, Ctrl, «Пробел» in prose.
- **Editor:** Autodesk's register, its labels as Russian AutoCAD words them.
- **Typography:** «…» and „…“ inside them, unspaced; no space before `: ; ! ?`; a spaced dash
  (` — `); «е» for «ё». A command name is the subject's neuter in prose only after «команда»
  («команда ОБРЕЗАТЬ обрезает»). What is copied from AutoCAD keeps its own marks (its tables quote
  with «» and `"`).

## Search texts

Google's suggestions (`hl=ru`; `gl=ru`, `ua`, `kz`; 101 seeds), Yandex's (its suggest endpoint,
no account: Russia and Kazakhstan), Google Trends (12 months: Russia, Ukraine, Kazakhstan, two
comparisons for Belarus) and Bing's top ten (`cc=ru`), 13/11/2026. The data is in
`~/seo-data/raw-2026-11-13/ru-keywords/`, outside the repository. Yandex has some 72% of Russia's
searches: Trends is weak there (below «автокад» everything sits at 0–16), and Yandex's long
suggestions are the better guide. Wordstat asks for a sign-in, and Yandex's results page for a
captcha: neither was read.

- **The generic term is «чертить / черчение онлайн» and «программа для черчения»**, not «CAD»
  («cad онлайн» 0–2 in Trends): «чертить онлайн бесплатно на компьютере без скачивания»,
  «чертить онлайн с размерами», «черчение онлайн программа бесплатно на русском». Russian's own
  modifiers are **«с размерами»** and **«на русском»**; «бесплатно» and «онлайн» everywhere; «в
  браузере» and «без установки» are never searched.
- **«автокад», not «AutoCAD»**, about four to one (Google 197 to 44; Yandex 169 to 31). The
  pages keep the brand in latin: the engines take one for the other («autocad» is «автокад»'s
  first related query), and «AutoCAD» does not inflect, so it goes after a preposition («в
  AutoCAD», «по AutoCAD»).
- **The home:** «Чертить онлайн бесплатно, с командами AutoCAD — MellowCAD», the description with
  «программа для черчения онлайн», «команды на русском и английском», «с размерами»; the hero
  «Черчение онлайн бесплатно, с командами AutoCAD». «AutoCAD бесплатно» (15, mostly downloading
  it) is never a claim.
- **The command list:** «команды автокад на русском и английском», «… список»: «Команды AutoCAD на
  русском и английском».
- **A command:** both names are searched («сопряжение автокад на английском», «команда offset в
  русском автокаде»): «Команда ОБРЕЗАТЬ (TRIM) в AutoCAD»; the noun first where it is what is
  searched («Штриховка в AutoCAD: команда ШТРИХ (HATCH)», «Полилиния…», «Слои…», «Размеры…»),
  descriptions from Yandex's «как … в автокаде». TRIM's says «обрезать линию»: «обрезать автокад»
  is mostly clipping images.
- **Practice:** «упражнения» is 0; the word is **«задания»** («задания по автокаду для
  начинающих»): «Задание по AutoCAD для начинающих: прокладка».
- **DXF:** «открыть dxf онлайн (с размерами)», «просмотр dxf онлайн», «редактировать dxf онлайн»:
  «Открыть DXF онлайн», «Редактировать DXF онлайн».
- **The guides:** «план квартиры онлайн» belongs to room planners; the drawing's search is
  «начертить план … с размерами», «как начертить план дома в автокаде»; «полярные координаты в
  автокаде»; «автокад 3д» (12), written «3д».
- **The SERP** for «чертить онлайн бесплатно» (Bing): vatmancad.ru, cadcraft.io/ru,
  chertilka.online, kontrcad.ru, opencadstudio.com/ru-RU; for «команды автокад», Autodesk's RUS
  help first.

## Command language

### `acad.pgp`

`research/strings/acad_ru.pgp`. Every alias is Cyrillic: none of the English hand works, and
none means another command than in English (an English user on ЙЦУКЕН typing `L` sends `Д`,
ДУГА). Ours: `ОТ` ОТРЕЗОК, `К` КРУГ, `Д` ДУГА, `П` ПЕРЕНЕСТИ, `КП` КОПИРОВАТЬ, `ПОД` ПОДОБИЕ, `ОБР`
ОБРЕЗАТЬ, `У` УДЛИНИТЬ, `СОП` СОПРЯЖЕНИЕ, `ФАС` ФАСКА, `С` СТЕРЕТЬ, `З` ЗЕРКАЛО, `ПОВ` ПОВЕРНУТЬ,
`МШ` МАСШТАБ, `МС` МАССИВ, `РАС` РАСТЯНУТЬ, `РАСЧ` РАСЧЛЕНИТЬ, `СО` СОЕДИНИТЬ, `РА` РАЗОРВАТЬ, `ПЛ`
ПЛИНИЯ, `ПРЯ` ПРЯМОУГ, `МН` МН-УГОЛ, `Э` ЭЛЛИПС, `СПЛ` СПЛАЙН, `Б` БЛОК, `В` ВСТАВИТЬ, `СЛ` СЛОЙ,
`ДТ` ТЕКСТ, `МТ` МТЕКСТ, `СП` СПИСОК, `ДИ` ДИСТ, `ПЩ` ПЛОЩАДЬ, `ПО` ПОКАЗАТЬ (ZOOM), `ПД` ПОДЕЛИТЬ,
`РМ` РАЗМЕТИТЬ, `ВЫД` ВЫДАВИТЬ, `ВЩ` ВРАЩАТЬ, `ВЫЧ` ВЫЧИТАНИЕ, `ПЕР` ПЕРЕСЕЧЕНИЕ, `РАЗ` РАЗРЕЗ,
`ОЧ` ОЧИСТИТЬ, `ИЗ` ОКНОСВ (PROPERTIES), `КПС` КОПИРОВАТЬСВ, `ЕД` ЕДИНИЦЫ. `Л` is ЛИСТ and `М`
МОДЕЛЬ, which do not exist here. No name or alias holds «ё».

- **U is `О`**, and `acad.pgp` gives the alias `О` to ОБЪЕДИНЕНИЕ (UNION): the command's name wins.
  On the desktop `О` after a LINE undid it (`(Lisp-выражение) ГРУППА`, names/d01), so UNION is
  ОБЪЕДИНЕНИЕ alone here.
- **FROM is `ОТ`** at a point prompt, ОТРЕЗОК's alias at `Команда:` (names/p03; the help's
  СМЕЩЕНИЕ, `СМЕ` and `СМЕЩ` are refused, `Неверная точка.`). The engine reads FROM apart, only
  where a point is asked (`EngineText`'s `POINT_MODIFIERS`), and `locales.test.ts` lets FROM share a
  name with a command.
- **RECTANG is ПРЯМОУГОЛЬНИК** (`getcname` once loaded, names/p36; the RUS help's title), whose
  older name ПРЯМОУГ still runs and is what `ПРЯ` names and echoes (`ПРЯ` / `ПРЯМОУГ`, desktop).
- An alias that is another command's name is dropped, as in German: `ИМПОРТА` and `ЭКСПОРТА`
  (DXFIN's and DXFOUT's names, aliases of ОТКРЫТЬ and СОХРАНИТЬКАК), `РЗМГОРИЗ`, `РЗМВЕРТИК`,
  `РЗМПОВЕРН` (aliases of РЗМЛИНЕЙНЫЙ).

### The keywords' format

- **«или»** before the list, after a noun phrase: `Следующая точка или [оТменить]:` (20619),
  `Первый угол или [Круг/Многоугольник]:` (435). No verb after the list.
- **`initget`** as the others': a capital inside a word marks the letter, and Russian letters one
  keyword otherwise per command and per prompt: LINE's Undo is `оТменить` (`Т`) alone and
  `Отменить` beside Close (`[Замкнуть/Отменить]`, line/p164: `promptKeywords.specifyNextPointOrClose`,
  a slot filled in every language); PLINE's `Отменить`; TRIM's cutting edges `реЖущие кромки`.
- **No space before a prompt's colon**, as English: `Команда:` (22843).
- **The console beats the tables**: OFFSET asks `Укажите расстояние смещения или
  [Через/Удалить/Слой] <Через>:` (the offset probes), where 21215 says `Величина смещения или
  [Точка] <Точка>:`.
- **-OSNAP's words** (names/p07): `КОН`, `СЕР`, `ЦЕН`, `ГЦЕ`, `УЗЕ`, `КВА`, `ПЕР`, `ПРО`, `ТВС`,
  `НОР`, `КАС`, `БЛИ`, `КАЖ`, `ПАР`, `НИЧ`, and `ОТКЛ` (names/p33; `НЕТ` is refused), listed
  `Кон,Цен,Пер,Про`, `Гцен`, `Каж Пер`.
- **A typed snap's echo** (names/p09, p31, p34): `of` is a bare space (26066 `" "`), `to` is `к`
  (26067). Not found: `Режим Конточка не определен для заданной точки.`, and Tangent's without
  its name, `Режим не определен для заданной точки.`, as German's.
- `propose-commands.mjs --lang ru` (13/11/2026): 1,466 proposed, 217 `several`, 150 `partial`, 41
  `plural`, 8 `select`, 519 `no-source`.

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang ru --like de`,
13/11/2026), as German's: `P <dll> <id>` a string table, `D` a dialog's label, `N` a .NET
resource, `X` an element of `acad.CUIX`. The engine's `interface`: 265 by one resource, 192 by the
row's place (a palette row takes `ax26res`'s word, a tool the ribbon's, its menu macro's name
where the ribbon has none: «Круг, Центр, диаметр», «2D-фигура»), 20 ours. The editor: 115 by one
resource, 98 by the row's place, 88 ours (10 of them `Keys`, the same as English's).

| Area | English | Russian | Source | Verified |
| --- | --- | --- | --- | --- |
| Tools | Change properties, Pan by points, Multiple redo, System variables | Изменить свойства †, Панорамирование по точкам †, Многократное повторение †, Системные переменные † | ours, from the menus' and help strings' words | — |
|  | Array | Массив | the ribbon, seen on the desktop | yes |
| Descriptions | SNAP, DXFIN, DXFOUT, INSERT, PURGE, PROPERTIES, UNITS… | «Ограничение перемещения перекрестья заданным шагом привязки»… † | ours, in the nominal style of the cuix help strings | — |
| Palette | First X/Y, Definition points | Первая точка X †, Точки определения † | ours, built like `ax26res` 65 «Вторая точка X» | — |
| Objects | Plural entity names; "# objects" | Отрезок/Отрезки…; # объект/объекта/объектов † | the tables' singulars, plurals ours | — |
| ViewCube | The cube's faces, the compass, the UCS menu | Сверху, Снизу, Спереди, Сзади, Слева, Справа; С, В, Ю, З; `МСК`, `Новая ПСК`, `Без имени` | the desktop (names/d05); Снизу by the others' pattern, Новая ПСК from AcVMToolsRes | yes |
| Editor | Snap X, Polar snap distance, Polar angle, Selection cycling settings, the layer dialogs, Command history | Шаг по X †, Шаг полярной привязки †, Полярный угол †, Параметры циклического выбора †, «Слой — не удален» †, Журнал команд † | ours, from the Drafting Settings words and AcLayer's title style | — |

The ViewCube's faces are written in sentence case on the Russian cube (`Сверху`), where German's
and English's are capitals: copied as drawn.

## The command language, how it was set

- **The console**, the 426 probes `console-pair.mjs --lang ru --select` picked that run in ru-RU,
  on 13/11/2026: 530 keys match the tables, 304 differ and take the console's wording, 186 are
  worded more than one way, 77 unpaired, 290 unseen. Three agents (one brief, each output checked
  against the parser, English's arguments and Russian's four plural forms) settled the rest from
  the transcripts, the tables and the RUS help.
- **Plurals**: Russian AutoCAD rarely agrees with a count. It writes `Найдено граней: 3.`,
  `объекта (ов)`, `области(ей)`, or tells 1 from the rest only: such a message is a plural whose
  four forms are the same, or `=1` and the rest, as the console prints it.
- **Names** by `getcname` (`U` is `О`, ZOOM ПОКАЗАТЬ, ID КООРД, MATCHPROP КОПИРОВАТЬСВ once
  `acmatch.crx` is loaded, PURGE ОЧИСТИТЬ, BOX ЯЩИК), the `acad.pgp`'s targets and the RUS help's
  titles for what the console does not name (МТЕКСТ, МАССИВПРЯМОУГ, МАССИВКРУГ, МАССИВТРАЕКТ,
  ЕДИНИЦЫ, ОКНОСВ, ОКНОСВЗАКР, СЛОЙЗАКРЫТЬ, АТРЕДАКТ, ПАЛБЛОКИ, ТИПТОЧКИ). Our own commands take the
  base name and the ribbon's initials, as German's: `КРУГД`, `КРУГ2Т`, `КРУГ3Т`, `ДУГАНЦК`,
  `ДУГАЦНК`, `ЭЛЛИПСЦ`, `ЭЛЛИПСДУГА`.
- **Probes of our own** (`scripts/research/probes/names/`, `.ru.txt`), typed through a script.

### Per command

Where English shares one prompt id and Russian words it per command or per prompt, one wording
stands until each gets an id of its own:

- `enterAnOption`: POLYGON `Задайте параметр размещения` (25451), the others `Задайте параметр`.
- `specifyFirstPointOr`: SPLINE's Fit `Первая точка или`, its CV `Задайте первую точку или`.
- `specifyEndpointOfLineOr`: 3DPOLY with Close `Конечная точка сегмента или` (20287), `…отрезка
  или` without.
- `copySecondPointOr`: COPY's first `Вторая точка или [Массив]`, the next ones `Укажите вторую
  точку или [Массив/Выход/Отменить]` (move/p160, p190).
- `includedAngle`: PLINE `Центральный угол`, ELLIPSE `Внутренний угол дуги`.
- **Keywords one prompt letters otherwise**, without a slot yet: DIST's Length (`длИна`), CHAMFER's
  Distance (`Длина` / `Расстояние`), FILLETEDGE's Radius at its accept prompt, -VIEW's
  orthographic Bottom, Front and Back, UCS New's Object and Face, a closed spline's SPLINEDIT
  words (spline-knots/k103, k123, k144).
- **Yes or no**: Russian prints `<Н>` and `<Д>` (blocks/p113), where the tools pass English's `N`
  as the default: the prompt shows `<N>`.
- **A style's name**: -TEXT and -ATTDEF write `Имя стиля или (?)` with the parentheses and no
  list (text/p110): the prompt is `Имя стиля или` and the runtime lists `[?]`.
- **LIST**: ARC's centre line `центр точка` and CIRCLE's `центральная точка` share one key
  (CIRCLE's stands); a line's deltas run in 12-character fields where English's are 9.
- **Copied as Russian prints them**: `станлартного` (21074), `паралелльный`, the snaps' `Твставки`.

### The desktop

The drafting toggles are composed by AutoCAD and in no table, so the Russian desktop settled them
(names/d01, 13/11/2026, `/language ru-RU`): `<Шаг вкл>` (F9), `<Привязка вкл>` (F3), `<Орто вкл>`,
`<Полярная вкл>`, `<Объектное отслеживание вкл>` (F11) and `<Сетка вкл>`, each with `откл`;
Selection Cycling ends with a full stop, `<Циклический выбор вкл.>` and `откл.`. Held by
`russianPrompts.test.ts`. Polar along Z writes `Полярная: 4.8340 < +Z` and `… < -Z` (LINE from
0,0,0 in SW isometric, names/d02). The ViewCube's faces, compass and UCS menu: names/d05.

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **Ours in every language**: the file, DXF and clipboard messages, FROM's own messages, the
  history's steps for what the chrome does, our own commands' names.
- **Not probed**: `format.polar`, `feedback.measure*`, the `?` listings' hatch patterns and
  dimension variables, LIST's cone lines, PURGE's plural forms past one, `purgeLinetype`,
  `reloadLinetype`, `undoEverything`, CHPROP's `varies` case (`разные` / `Разные`), and some
  short field labels (`firstPoint`, `startAngle`, `scaleFactor`…), worded from the console's
  neighbouring prompt.

The list by key is the session's, outside git, and `russianPrompts.test.ts` holds what the console
and the desktop printed.

## The site's words

`messages/ru.json`, the editor's catalog, the seven written "Use" pages (shortcuts is generated),
the 101 command notes and the 12 exercises (13/11/2026, agents on one brief, each file read by
`docs:check` against its English's options, questions and elements). Command pages and exercises:
see "Search texts". A command's prompt is the help's «запрос», an option «параметр»; the alias
question is «Как называется команда … на английском?», its answer the alias of `acad_ru.pgp` and
`_NAME` for any language.

- **Ours in the pages (†)**: dialog names no resource was read for («Диспетчер типов линий»,
  «Диспетчер размерных стилей», «Параметры весов линий», «Режимы рисования»), the exercises'
  mechanical words (прокладка, Г-образный кронштейн, рычаг, бобышка, корпус подшипника, шкив,
  ступица, обод, ступенчатый вал, уступ, лестничный марш, проступь, подступенок) and layer names
  (Контур, Осевые линии, Невидимые линии, Размеры), «резиновая нить» (rubber band), «линии
  отслеживания» (alignment paths).

## Script and font

`cyrillic`. Inter and Geist Mono have Cyrillic subsets, which `next/font` declares with their
`unicode-range` and does not preload: only a page with a Cyrillic letter downloads them, so `/ru`
pays for them and no other page does (`INTER_SCRIPTS`). The share card reads WOFF: Fontsource's
Cyrillic subsets of the same versions (`inter-cyrillic-600-normal.woff`, 5.2.8;
`geist-mono-cyrillic-400-normal.woff`, 5.3.0), named as families of their own behind Inter and
Geist Mono, as Satori takes a missing glyph from the families a text names (`lib/og.tsx`). The
engine measures Cyrillic text with Arial's widths (`textFontMetrics.ts` reads U+0400–04FF from
Arimo).

## Plurals

CLDR `ru`: `one` (1, 21…), `few` (2–4, 22–24…), `many` (0, 5–20…) and `other`, which only a
fraction reaches (1.5). Every count the site writes with a noun is a four-form plural.
`pluralMessage` took each form from a whole number and found none for `other`: it now takes 1.5
there (`lib/plural.ts`). `Intl.NumberFormat("ru")` writes `12 345,5` (U+00A0).

## Length

On the same table ids, measured as German's (13/11/2026): labels of up to 20 characters +21% in
total (median +15%, 90th percentile +73%), prompts +6% (median +4%); German +23%, +17%, +68%,
+16%. **The shortest in characters** — its prompts are noun phrases (`Первая точка:`) — but its
letters are wide and 4.3% of labels hold a word of 14 letters or more (German 11.9%):
`Редактирование`, `Панорамирование`, `Штрихпунктирная`.

## Input

ЙЦУКЕН: every letter Cyrillic, no dead keys, no composition. Ctrl shortcuts are read by their
physical key (`shortcutKey`): Ctrl+Z undoes from the key labelled Я. Typed text is taken as typed:
`ОТ` runs ОТРЕЗОК, `LINE` typed on the latin layout is an unknown command, as in Russian AutoCAD,
and `_LINE` runs in both (`russianPrompts.test.ts`). The layout has no `@`, `<` or `>`: a Russian
user switches to the latin layout to type `@10<45`, as in AutoCAD.

Checked in Chrome before going live (13/11/2026, keys sent through CDP as ЙЦУКЕН sends them, the
letter in `key` and `text`, the physical key in `code`): `от` typed on the drawing runs ОТРЕЗОК,
`0,0` with the comma from Shift+`/`, and Ctrl+Z from the key labelled Я undoes it (`Команда: О`,
`ОТРЕЗОК`, as AutoCAD echoes U). ZOOM's prompt asks `(nX или nXП)` with a Cyrillic П, which the
console takes (`2xп`; a Cyrillic `х` is refused, names/p37): the factor reads the letter its
language's prompt writes (`ZoomTool`'s `factorPattern`).

## Going live

On 13/11/2026, from production builds in a clean worktree (every page `○` or `●` but
`/api/search`):

- **The landing's first load**, Brotli q11, in bytes, before Russian (`adf9dba1`) and Russian a
  draft (`92e2bfe7`): `/` 253,278 → 253,333, `/es` 254,660 → 254,664, `/pt-br` 254,807 → 254,912,
  `/ar` 278,236 → 278,173, `/fr` 255,550 → 255,457 (543 under 250 KiB), `/it` 254,671 → 254,705,
  `/de` 254,981 → 254,957; `/ru` 288,456. Live: the commit's message.
- **`/ru` passed 275 KiB by 6,856 bytes**, and no trimming of copy could close it: Cyrillic takes
  two faces, Inter's (18,744) and Geist Mono's (12,876, the landing's command line), where Arabic's
  one is 22,765, and its HTML is 1.9 KB heavier than German's by UTF-8's two bytes a letter. The
  budget for a script with two faces is 285 KiB (`.claude/rules/i18n.md`, "Budgets").
- **Naming Russian** in every landing's commands sentence (`<ru>{russian}</ru>`: ПОДОБИЕ beside
  DESFASE and VERSETZ), its lead and the FAQ's class answer.
- **What did not fit** (the landing at 360 px, the editor at 1280×720): the header's «Начать
  чертить» wrapped (`Header.cta` «Чертить», as German's «Zeichnen»), and so did the hero's pill
  («Бесплатно · Без регистрации · Онлайн»: «онлайн» is the most searched modifier).

## Review

No native reader: the owner knows none. What Autodesk did not write was read again by a model on
13/11/2026, four agents against the English, Autodesk's tables and the Russian catalogs:

- **The site**, 49 strings: «впервые» (a claim the English does not make) → «Новое», «без
  лицензии» (read as unlicensed) → «без запроса лицензии», «как ждут ваши руки» → «как привыкли
  ваши руки», «в 3D-орбите» (32879), «Однострочный и многострочный текст». The editor: none.
- **The "Use" pages and exercises**, some 115 edits: Esc «прерывает» (as `*Прервано*`), not
  «отменяет»; «тонирует», as the «Тонированный» style; «Не удаляйте оригинал» where «сохраните»
  read as «save»; steps without a verb completed.
- **The command pages**, some 900 edits: a name never bare but after «команда» («Команда ДУГА
  (ARC) рисует»), «параметр» for «опция», the alias answers to `acad_ru.pgp` (`ПРЯМОУГ` its former
  name, `ДИАЛТТОЧ` PTYPE's DD form), the words the screen shows («центральный угол»,
  «квадрант», «линия отслеживания»), meaning restored (PURGE's nested block, SUBTRACT's «или»).
- **Left, for a native reader if one is found**: «пунктирная» or «штриховая» for the dashed
  guide, «вхождение блока» beside «ссылка на блок», «зумирование», «сдвиг» and «построение по
  сечениям» (SWEEP, LOFT), «Проектировщики» and «Мастера» (Drafters, Makers), the exercises'
  mechanical words, the ours-marked editor labels.
