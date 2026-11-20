# Korean (`ko`) — plan

The ninth language after the pilot and the second CJK one: `ko` from nothing to `live` at `/ko`,
through skill `add-language`, as the Korean session of the visibility plan (`docs/next-seo.md`,
L8). The owner's brief (20/11/2026): `global` as Japanese, checked first against Autodesk's files.
Japanese is the case it follows (`docs/plans/ja-language.md`, `docs/i18n/ja.md`). Once
docs/i18n/ko.md exists it holds the language's words, sources and review, and this plan shrinks
to a summary.

## The type: `global`, and what Korean AutoCAD does otherwise

Checked on 20/11/2026 against Autodesk's own files, without installing anything:

- **Autodesk ships AutoCAD 2027 in Korean** (culture `ko-KR`, one of `CULTURES`):
  `Autodesk_AutoCAD_2027_Korean_Language_Pack.exe`, 245,459,096 bytes, SHA-256
  `2d79dcf86060a2ef91cf8cabac73679f6a93613158b38e4b638c853ab8a79e05`, at
  `https://up1.autodesk.com/prd/2027/ACD/13D044FF-9A71-3BFB-8914-AA18ADD34FEA/` (ceethreedee.com's
  list, as Japanese's). Opened with 7-Zip's own Linux build, never run; the tables come from the
  2027.1 update's `ko-KR/acadlp.adix` and `acadsharedlp.adix` (the copy the owner's AutoCAD
  extracted to its Temp folder), `acad.pgp` and `acad.CUIX` from the pack. Not installed on the
  owner's AutoCAD: nothing here needs its console.
- **The command names are English.** The KOR help titles every command `OFFSET(명령)`, with no
  Korean name beside it (Japanese's has `OFFSET[オフセット]`), and types `OPTIONS를 입력합니다`.
- **The aliases are English's, letter for letter**: `acad_ko.pgp` against `acad_en.pgp` differs
  only in the prompts of six shell commands (DEL, DIR, SH, SHELL, START, TYPE, and NOTEPAD's),
  not in one alias. Its `acadSynonymsGlobalDB.pgp` is English's: no Hangul synonym.
- **The keyword letters are English's**, in parentheses after a Korean label, as Japanese:
  `다음 점 지정 또는 [명령 취소(U)]:` (20619), `간격띄우기 거리 지정 또는 [통과점(T)/지우기(E)/도면층(L)]
  <통과점>:` (22470), `원에 대한 중심점 지정 또는 [3점(3P)/2점(2P)/Ttr - 접선 접선 반지름(T)]:` (20410).
- **The prompts and messages are Korean.**

So a Korean AutoCAD user types exactly what `/draw` takes, and reads the prompts in Korean where
`/ko/draw` prints them in English: Japanese's deviation, recorded in docs/i18n/ko.md and on the
differences page. Its Korean prompts are a later piece of their own, with Japanese's (the
`label(K)` form, the console, the pack installed).

## The research, item by item

1. **AutoCAD and its pack**: above. Help:
   `https://help.autodesk.com/cloudhelp/2027/KOR/AutoCAD-Core/files/GUID-<id>.htm`; the help MCP
   answers in `ko_KR`. Its register: 합니다, «Enter 키를 누릅니다», no brackets around keys. The
   interface words are the pack's, paired by id with `propose-interface.mjs --pack <folder>`:
   engine 222 settled by one source, 196 by several, 99 by none; editor 103, 94, 89
   (`research/proposals/ko-*.md`). The help gives commands no Korean name: the ribbon's
   (`acad.CUIX`, `간격띄우기` for OFFSET, `모깎기` for FILLET) names them.
2. **`acad.pgp`**: English's aliases, none meaning another command.
3. **The keywords' format**: `label(K)`, as Japanese; `/ko/draw` lists English's `[Undo]`, and
   the letters typed are the same.
4. **Fonts**: Inter and Geist Mono have no Hangul. No web font: Korean's system faces (Apple SD
   Gothic Neo, Malgun Gothic on Windows, Noto Sans CJK KR on Android and Linux) behind Inter and
   Geist Mono, as Japanese's; Google's Noto Sans KR is split into some 120 `unicode-range` files
   too. The share card takes Noto Sans KR 600 cut to its characters. No faked italic, no tracking.
5. **Plurals**: `Intl.PluralRules("ko")` has only `other`.
6. **Length**: Hangul runs shorter than English in characters but each is full-width. Korean
   separates words with spaces, and a browser breaks Hangul between any two syllables unless told
   otherwise: `word-break: keep-all` keeps a word whole, as Korean sites do. Checked in the
   browser: the landing at 360 px, the editor at 1280×720.
7. **Input (IME)**: Hangul is composed (`isImeKey`, Japanese's fix, covers it). A Korean keyboard
   in Hangul mode types jamo, in AutoCAD too (`ㅣ` for L): a command is typed in English mode
   (한/영), and on the drawing, with no editable target, no IME composes. Checked in Chrome.
8. **Search**: zbsearch's `multilingual` segments Korean by word (spaces); checked once live.

## Search texts

Google's (`hl=ko`, `gl=kr`) and Naver's suggestions, 80 seeds (20/11/2026), and the visibility
audit (`~/seo-data/audit-2026-11-05/languages.md` B.2: Korea 61 on its index, «오토캐드» 445 on its
one scale, «캐드 무료» 37, «오토캐드 명령어» 3; Naver takes about half of Korea's searches, and
Brave blocked its results pages, so no SERP was read).

- **The generic terms** are «캐드» more than «오토캐드»: «무료 캐드» (프로그램, 추천, 사이트, 뷰어),
  «캐드 무료» (프로그램, 버전), «캐드 웹» and «웹 캐드» (무료, 사이트, 뷰어), «온라인 캐드» (무료,
  사이트, 그리기, 편집), «오토캐드 웹» (Autodesk's web app: never a claim). «설치 없이» is how a
  no-install tool is said. Home title: «무료 웹 캐드 — AutoCAD 명령어로 2D·3D 도면 작성».
- **A command** is searched by its ribbon name and by its English one in Hangul, both: «캐드
  오프셋» and «오토캐드 간격띄우기», «캐드 필렛» and «캐드 모깎기», «캐드 트림» and «캐드 자르기»,
  «캐드 스트레치» and «캐드 신축», «캐드 어레이» and «캐드 배열»; «오토캐드 offset» too. Titles name
  the global name and the ribbon's word, the description the transliteration: «AutoCAD OFFSET
  (간격띄우기) 명령».
- **The command list**: «오토캐드 명령어» (모음, 정리, pdf), «캐드 단축키» (모음): the shortcuts and
  the commands' index.
- **Practice**: «캐드 연습도면» (모음, pdf, 초보, 2d, 3d, 건축, 토목), «오토캐드 연습 문제»: «캐드
  연습도면».
- **DXF**: «dxf 뷰어» (온라인, 무료, 사이트, 웹), «dxf 파일 열기», «dxf 편집» (편집기, 무료).
- **The guides**: «캐드 평면도» (그리기, 그리는 법): the floor plan; «오토캐드 좌표» (입력, 입력방법):
  coordinates; «오토캐드 3d» (그리기, 모델링, 명령어): 2D to 3D; «오토캐드 단축키»: shortcuts;
  «오토캐드 사용법»; «오토캐드 호환» (캐디안, ZWCAD, 지스타캐드, 프리캐드): the differences page.
- **Competition**: the AutoCAD-compatible programs sold in Korea (ZWCAD, 캐디안 CADian, 지스타캐드
  GstarCAD, BricsCAD), free viewers (DWG TrueView, Autodesk's web viewer), and a dense blog and
  forum culture (Naver blogs, 디시). No browser CAD with AutoCAD's commands in Korean.

## Register

합니다체, as Autodesk's Korean help, plain and dry; the editor's labels as Korean AutoCAD words
them (`도면층`, `객체 스냅`, `특성`). Korean spacing (띄어쓰기) and Western punctuation: «.», «,»,
«:», «?», quotes “…”. Latin words and digits sit in the sentence with Korean particles attached
(«AutoCAD에서», «DXF 파일을»), the particle chosen by the word's last sound as read. Keys as the
help writes them: «Enter 키». Commands by their global name, the ribbon's Korean word in
parentheses at a first mention («OFFSET(간격띄우기) 명령»).

## Phases and commits

1. **Plan** (`docs: Korean plan`): this file.
2. **Draft** (`feat(i18n): Korean as a draft at /ko`): phases 1–5 — registration (`global`,
   `ko_KR`, «한국어», script `korean`); the engine's `interface` from the pack; the site's and the
   editor's catalogs, the "Use" pages, the command notes and the exercises (agents on one brief);
   the system faces as a second CJK script, `:lang(ko)` rules, the card's face; the differences
   page's entry, in every language.
3. **Live** (`feat(i18n): Korean goes live`): measured (each live language adds some 100 bytes to
   every landing, and `/fr` had 427 to spare), the browser pass with the IME, a model's second
   reading of a sample by an agent without this plan's conclusions, `live`, the brief and
   `docs/i18n/README.md`.

## Unverified

Every interface term the pack does not give (marked in docs/i18n/ko.md), the desktop's words no
table holds, and the whole site copy until a native reader reviews it.
