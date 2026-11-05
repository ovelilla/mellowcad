# Launch kit

> What the owner posts, submits and sends himself; no session publishes anything (`docs/next-seo.md`,
> L5). Prepared on 2026-11-05 from the audit's authority study (outside the repo:
> `~/seo-data/audit-2026-11-05/authority.md`, with the 73 articles and their authors' contacts in
> `authority-listicles.csv`, the creators in `authority-creators.csv` and each platform's rules in
> `authority-platforms.csv`; contacts stay out of this public repository). Session 05 checks every
> site's current rules and brings the texts up to date with what is published then.

Every text follows `.claude/rules/i18n.md` («Claims and copy»): the 3D is partial and says what it
lacks; no DWG/DXF, printing, PDF, collaboration or mobile claims; "the code is MIT", never
"MellowCAD is MIT"; "same order, same option letters", never "same prompts"; AutoCAD only
nominatively; no hype, no emojis. Figures are those of 2026-11-05 (140 AutoCAD commands, 131
aliases, 12 object snaps, about 5,800 tests): take them from the landing on the day.

## 0. Before any post

1. **Push** of sessions 01 and 02. Until then production lists 3D solids under "Not yet" and says
   "Online 2D CAD": a post that mentions 3D must not land on a page that denies it. The launch posts
   (§2–§5) wait for session 04 to be published too; the directories (§6) need only this push.
2. **GitHub**: 0 stars, no topics, and a description that says "2D engine". Topics are free
   discovery; the description opens with the English home's main query (`docs/next-seo.md`, L2):

   ```sh
   gh repo edit ovelilla/mellowcad \
     --description "Free online CAD that works like AutoCAD: its commands, aliases and prompt order, for 2D drafting and partial 3D solids. A DOM-free TypeScript engine and its React editor. Not affiliated with Autodesk." \
     --add-topic cad,online-cad,autocad,drafting,cad-software,2d-drafting,3d,solid-modeling,b-rep,geometry,browser,typescript,canvas,react,open-source
   ```

3. **Accounts**, personal ones: Hacker News, Reddit, Product Hunt, AlternativeTo, SaaSHub, dev.to.
   Read each subreddit's sidebar logged in: Reddit blocked every automated route to its rules.
4. **A soft launch** with five AutoCAD users, from the old launch brief: do they understand what it
   is, and how long until their first line?
5. **The materials** of §4 (gallery and video), drawn by the engine, never a screenshot of Autodesk
   software, no Autodesk logos or colours.

## 1. Where the links and the traffic come from

- **Followed links come from editorial lists**, not from launch platforms: 36 of the 73 lists link
  the tools they cover without `nofollow`; SaaSHub's links are `nofollow`; a Hacker News story's
  link is `nofollow` until it gains points (14 points: nofollow; 146 and 160: followed).
- **The pitch is the empty slot**: none of the 73 lists names MellowCAD; 53 name some browser tool,
  almost all 3D modellers (Onshape, Tinkercad, SketchUp Free); only 9 name a 2D drafting tool in the
  browser, mostly the paid AutoCAD Web. One sentence in every email: the list has no free 2D drafting
  tool in the browser that works like AutoCAD.
- **First targets** (rank #1–5, followed links): medevel's open-source CAD list (the only list naming
  KulmanLab; MellowCAD qualifies), Rigorous Themes, ADSLZone, RecursosCAD, SoftZone,
  Tecnoloblog/Ikkaro, Arabitec, Aprendacad, TheCADHub (a submit form). Story pitches: MakeUseOf and
  the Hackaday tip line, which covered a single browser CAD each; Educación 3.0 for Spanish teachers.
- **Creators**: AutoCAD and architecture YouTubers are reviewing free browser CADs right now
  (CADCraft, Open CAD Studio and others drew 30k–150k views in October); MellowCAD's angle for them is
  AutoCAD's own Spanish and Portuguese command names.
- **KulmanLab is a low bar**: about 12–15 referring domains, almost all its own, Product Hunt with 7
  and 1 votes, nothing on Hacker News.

## 2. Show HN

**Hacker News asks that text posted there be written by hand, without an LLM** (moderator's tip of
2026-03-28). What follows is the order and the facts; write the post yourself.

- **Title** (≤ 80): "Show HN: MellowCAD – browser CAD where matching AutoCAD's commands is the spec",
  or "Show HN: MellowCAD – AutoCAD-style drafting in the browser on a DOM-free engine".
- **URL**: https://mellowcad.com/ (the page a followed link strengthens); the editor's link
  (https://mellowcad.com/draw) in the first line of the text.
- **The text, in this order**:
  1. What it is in one line: CAD in the browser that works like AutoCAD (type L, press Enter; the
     prompts in AutoCAD's order with its option letters and defaults); no sign-up; autosave, and
     Ctrl+S saves a file.
  2. Why you started it, in your words.
  3. The rule: current AutoCAD (2027) is the spec, checked against AutoCAD itself; a partial command
     is allowed, a reinvented one is not (OFFSET really takes one object at a time). Spanish and
     Brazilian Portuguese take AutoCAD's localized command names (LINEA, DESFASE; LINHA, APARAR).
  4. Technical notes: a TypeScript engine with no framework and no DOM, in layers whose imports only
     point down, on npm as @mellowcad/engine; the landing's figures drawn by the engine at build
     time; tools tested by driving a headless engine with moves, clicks and keys (about 5,800
     tests); one gesture, one undo step; 3D solids, still partial, on a B-rep kernel written for the
     project; a versioned file format that always opens older files.
  5. Not there yet: DWG/DXF, printing and PDF, paper space, sweeps, lofts, meshes and rendering,
     phones and tablets; each command's missing options are in the repository.
  6. The code is MIT: https://github.com/ovelilla/mellowcad
  7. The question: if you use AutoCAD every day, where does it break your muscle memory?
- **On the day**: a personal account; Tuesday to Thursday, US Eastern morning; stay all day, answer
  limits plainly, never ask anyone to vote.

## 3. Reddit

Say "I made this"; read each sidebar first.

**r/AutoCAD.** Title: _I built a free browser CAD that follows AutoCAD's commands and prompt order.
Where does it break your muscle memory?_

> Disclosure: I made this. It's free, there's no sign-up, and the code is open source (MIT).
>
> MellowCAD runs in a desktop browser and follows AutoCAD 2027 at the command line: the same command
> names and aliases (L, O, TR, CO, F…), prompts in the same order with the same option letters, the
> same defaults. Object snaps use AutoCAD's markers; OTRACK, polar, Ortho and dynamic input
> (@100<30, #120,80) work. Layers, linetypes, lineweights, dimensions, text, hatches, blocks with
> attributes and the Properties palette are there too.
>
> So nobody wastes time: it doesn't open or save DWG/DXF, doesn't print or make PDFs, has no paper
> space, 3D solids are partial, and it's desktop only.
>
> https://mellowcad.com/draw
>
> What I'd like to know: which command or alias did you reach for that wasn't there? Which prompt
> or option did something your hands didn't expect? Is DWG the deal-breaker, or would it serve for
> a quick sketch away from your workstation, or for students without a licence?

**r/cad.** Title: _Open-source CAD in the browser with an AutoCAD-style command line: looking for
feedback_

> I made this, and I'm after criticism more than compliments. MellowCAD is drafting in a desktop
> browser, driven from the command line the way AutoCAD is: same names and aliases, prompts in the
> same order with the same option letters, object snaps, OTRACK and polar. 2D is the core; 3D
> solids exist but are partial (no sweeps, lofts, meshes or rendering). No DWG/DXF yet, no printing.
>
> The engine underneath is a separate TypeScript package with no DOM (@mellowcad/engine on npm),
> with its own B-rep kernel for the solids. The code is MIT.
>
> https://mellowcad.com
>
> Two questions: for people who live in other CAD packages, does a command-line-first browser tool
> make sense to you? And what file exchange would you need first?

**r/SideProject.** Title: _I'm building a browser CAD app where AutoCAD's behaviour is the spec,
not a suggestion_

> What it is: MellowCAD, free CAD in the browser for people whose hands know AutoCAD: type L, press
> Enter, draw. No install, no account; drawings stay on the device. https://mellowcad.com
>
> What I learned: research keeps overturning the "obvious" design. OFFSET really takes one object
> at a time; the Center-Diameter circle's guide really runs past the rim, because its length is the
> diameter. Copying the awkward parts is what makes it feel right.
>
> Stack: a framework-free TypeScript engine with no DOM (on npm), a React editor on top, a Next.js
> static site. The figures on the landing are drawn by the engine at build time, not screenshots.
> About 5,800 tests drive a headless engine with clicks and keystrokes. The code is MIT.
>
> Honest limits: no DWG/DXF or printing yet, 3D partial, desktop only.
>
> Feedback I'd value: does the landing tell you what this is in five seconds? Where did you get
> stuck in the editor?

**In Spanish** (a subreddit, a forum or a group of architecture and engineering students; neutral
Spanish for Spain and Latin America). Título: _He hecho un CAD gratuito en el navegador que entiende
los comandos de AutoCAD en español (LINEA, DESFASE, RECORTA…). ¿Me ayudan a probarlo?_

> Aviso: lo he hecho yo. Es gratis, no pide registro y el código es abierto (licencia MIT).
>
> MellowCAD funciona en el navegador de un ordenador y se maneja como AutoCAD desde la línea de
> comandos. En español acepta los nombres de comando de AutoCAD en español y sus alias (LINEA o L,
> DESFASE o DF, RECORTA o RR, EMPALME o MP), y también los globales con guion bajo (_LINE). Las
> solicitudes llegan en el mismo orden y con las mismas letras de opción. Tiene referencia a objetos
> con los marcadores de siempre, rastreo polar y de referencia a objetos, Orto, entrada dinámica,
> capas, tipos y grosores de línea, cotas, textos, sombreados y bloques con atributos, y sólidos 3D,
> todavía parciales.
>
> Lo que todavía no hace, para no hacer perder el tiempo a nadie: no abre ni guarda DWG/DXF, no
> imprime ni exporta a PDF y no tiene espacio papel. Solo en ordenador.
>
> https://mellowcad.com/es/draw
>
> Me sería muy útil saber qué comando o alias se echa en falta, qué solicitud no se comporta como
> se espera y si serviría para practicar o para un croquis rápido sin tener AutoCAD instalado.

**For technical-drawing teachers** (a teachers' community or an email):

> Hola. Soy el autor de MellowCAD, un programa de CAD gratuito que funciona en el navegador del
> ordenador, sin instalar nada y sin cuentas: el alumno abre https://mellowcad.com/es/draw y dibuja.
> Usa los nombres de comando de AutoCAD en español (LINEA, CIRCULO, DESFASE, RECORTA…) con sus
> alias, y las solicitudes en el mismo orden y con las mismas letras de opción, así que lo que se
> practica en clase sirve después en AutoCAD. Los dibujos se quedan en el equipo: se guardan solos
> en el navegador, y con Ctrl+S en un archivo; no se envían a ningún sitio. Límites: no abre ni
> guarda DWG/DXF, no imprime y el 3D es parcial. Si les sirve para clase, me gustaría saber qué
> echan en falta.

## 4. Product Hunt

- **Tagline** (≤ 60): "Free browser CAD that takes AutoCAD's commands" (46), or "CAD in your
  browser, typed the AutoCAD way" (42).
- **Description** (≤ 500; 245): "Free CAD in your browser that works like AutoCAD: the same commands
  and aliases, prompts in the same order with the same option letters, object snaps, polar and
  OTRACK. No install, no account; drawings stay on your device. 3D solids are partial."
- **Tags**: the closest of Product Hunt's own to design tools, open source, engineering.
- **Maker's first comment**:

> Hi, I'm [name] and I build MellowCAD. It's for people whose hands already know AutoCAD: L and
> Enter for a line, O to offset, TR to trim, with the prompts in the same order and the same option
> letters. It runs in a desktop browser with nothing to install and no account, and drawings stay
> on your device: autosave, plus Ctrl+S for a file.
>
> Today: 2D drafting with object snaps, OTRACK, polar and dynamic input; layers, linetypes,
> lineweights and colours; dimensions, text, hatches and blocks with attributes; partial 3D solids.
> In Spanish and Brazilian Portuguese it takes AutoCAD's localized command names.
> Not yet: DWG/DXF, printing and PDF, paper space, sweeps, lofts and rendering in 3D, phones and
> tablets.
>
> The code is MIT on GitHub, and the engine is on npm for anyone who wants to build on it. What
> I'd value most is feedback: what did you reach for that wasn't there?

- **Gallery**: at least two images at 1270×760 (eight planned), every one drawn by the engine from
  the landing's figure scripts (`content/demos/`): the hero drawing with its command transcript; the
  command line mid-sequence (L, O, TR, F with the engine's prompts); the Tangent marker and OTRACK's
  paths; a dimensioned, hatched profile; layers with a hidden-line slot and a centre line; the same
  drawing with the Spanish transcript (LINEA, DESFASE); a 3D solid in Conceptual, captioned
  "partial"; the engine's layers. Thumbnail: the logo mark, 240×240.
- **Video**, 35–45 s, on YouTube (the only host it takes), captions only, recorded from the real
  editor at 1920×1080:

| Time | On screen | Caption |
| --- | --- | --- |
| 0:00–0:04 | the empty editor; the command line takes `L` ↵ | Type L. Press Enter. |
| 0:04–0:12 | a closed outline with polar tracking and typed distances, `C` to close | Prompts in AutoCAD's order. Same option letters. |
| 0:12–0:20 | `O` ↵ `10` ↵ pick, side; `TR` ↵ two corners; `F` ↵ `R` `5` | The aliases you already type. |
| 0:20–0:27 | OTRACK on two endpoints, a circle where the paths cross; a linear dimension | Object snaps, OTRACK, dimensions. |
| 0:27–0:33 | the page in Spanish: `LINEA`, `DESFASE` at the command line | AutoCAD's own Spanish and Portuguese command names. |
| 0:33–0:40 | `EXTRUDE` a closed profile, `3DORBIT` | 3D solids, still partial. |
| 0:40–0:45 | end card | MellowCAD · Free · No sign-up · Code MIT on GitHub · mellowcad.com |

- **On the day**: a weekend (Product Hunt's own data gave small makers 15 % more visits then),
  12:01 a.m. Pacific; ask for feedback, never for votes.

## 5. Outreach email

One email per author, personalised from `authority-listicles.csv` (name, article, the query it
ranks for, the browser tools it lists); one follow-up after 7–10 days at most.

**English.** Subject: _A free browser option for "[article title]"_

> Hi [first name],
>
> Your "[article title]" ([updated month year]) is one of the first results for "[query]". Its
> browser options are [Onshape, Tinkercad, SketchUp Free], all 3D modellers; it has no 2D drafting
> tool that works like AutoCAD, which is what many people looking for a free AutoCAD alternative
> want.
>
> I build MellowCAD (https://mellowcad.com): drafting in a desktop browser with AutoCAD's command
> names and aliases, prompts in the same order with the same option letters, and its object snaps.
> It's free, with nothing to install and no account, and drawings stay on the user's device. The
> code is MIT on GitHub.
>
> The limits, so you can judge the fit: no DWG/DXF yet, no printing, 3D solids only in part, and it
> needs a desktop browser.
>
> If it fits your next update, one line under browser-based tools would be plenty. I'm glad to
> answer anything or send images.
>
> [Name] — what differs from AutoCAD: https://mellowcad.com/docs/differences

**Spanish.** Asunto: _Una opción gratuita en el navegador para «[título]»_

> Hola, [nombre]:
>
> Tu artículo «[título]» ([fecha de actualización]) sale entre los primeros resultados de
> «[búsqueda]». Las opciones en el navegador que recoge son [Onshape, Tinkercad, SketchUp Free],
> todas modeladores 3D; no aparece ninguna herramienta de dibujo 2D que funcione como AutoCAD, que
> es lo que busca mucha gente que quiere una alternativa gratuita.
>
> Desarrollo MellowCAD (https://mellowcad.com/es): dibujo en el navegador del ordenador con los
> nombres de comando de AutoCAD en español y sus alias (LINEA o L, DESFASE, RECORTA, EMPALME), las
> solicitudes en el mismo orden y con las mismas letras de opción, y su referencia a objetos. Es
> gratis, sin instalar nada y sin cuenta, y los dibujos se quedan en el equipo del usuario. El código
> es MIT y está en GitHub.
>
> Los límites, para que valores si encaja: todavía no abre ni guarda DWG/DXF, no imprime, el 3D es
> parcial y necesita un navegador de ordenador.
>
> Si encaja en tu próxima actualización, con una línea entre las herramientas online bastaría.
> Respondo a cualquier duda y puedo enviarte imágenes.
>
> [Nombre] — diferencias con AutoCAD: https://mellowcad.com/es/docs/differences

## 6. Directories

**AlternativeTo** (Online; Free; Open Source; an alternative to AutoCAD, LibreCAD, QCAD and
DraftSight; it is #1–2 on Bing for "free autocad alternative", and its "free + web" AutoCAD page
lists 21 tools):

> MellowCAD is free CAD that runs in a desktop web browser and works like AutoCAD: the same command
> names and aliases (L, O, TR, CO…), prompts in the same order with the same option letters, the same
> defaults, object snaps with the familiar markers, OTRACK, polar tracking, Ortho and dynamic input.
> It covers 2D drafting — layers, linetypes, lineweights, dimensions, text, hatches, blocks with
> attributes, arrays and the Properties palette — and, still in part, 3D solids. Nothing to install
> and no account; drawings autosave in the browser and save to a file. In English, Spanish and
> Brazilian Portuguese (with AutoCAD's localized command names) and Arabic. It does not read or
> write DWG/DXF and has no printing yet. The code is open source under the MIT licence. Not
> affiliated with Autodesk.

**SaaSHub** (its links are `nofollow`: for traffic and listings, not authority):

> Free CAD in the browser that works like AutoCAD: the same commands and aliases, prompts in the
> same order with the same option letters, object snaps and dynamic input. 2D drafting, plus 3D
> solids in part. No install, no account; drawings stay on your device. The code is MIT on GitHub.
> No DWG/DXF or printing yet.

Then: TheCADHub's submit form, OpenAlternative and opensourcealternative.to, awesome-lists whose
rules allow a pull request.

## 7. Calendar

Dates are targets; each step waits for its condition. December is the outreach window: many lists
carry "2026" in their title and will be rewritten for 2027 around the new year.

| When | What | Condition |
| --- | --- | --- |
| Now (week of 9 Nov) | §0: push, GitHub topics and description, accounts, soft launch; §6: AlternativeTo, SaaSHub, TheCADHub | the push of `4c6094db` |
| As sessions 02 and 04 publish (target: by 27 Nov) | the gallery and the video (§4), drawn from the new landing | 02 and 04 pushed |
| A Tuesday to Thursday after that (target: 1–3 Dec) | Show HN; two days later r/SideProject; a technical article on dev.to linking the home | the new landing live |
| The week after | r/AutoCAD; the Spanish post; then r/cad | Show HN's bugs fixed |
| Early December | outreach wave 1 in English (medevel first, the TheCADHub form, Rigorous Themes and the rest of the English targets), the MakeUseOf and Hackaday pitches; Product Hunt on the first free weekend | — |
| Mid-December | wave 2: Spanish, Portuguese, Arabic, French and German lists; Educación 3.0; the creators, with the HN and PH threads as context | — |
| Late December | one follow-up per unanswered email; open-source directories; then measure (`docs/next-seo.md` §6) and re-pitch in January the lists that publish a 2027 edition | — |

After each step, note its date in `docs/next-seo.md` §8 and watch Search Console's Links report,
Bing's backlinks and Vercel Analytics' referrers.
