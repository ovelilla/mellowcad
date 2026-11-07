# Launch kit

> What the owner posts, submits and sends himself; no session publishes anything (`docs/next-seo.md`,
> L5, which holds the calendar). Prepared on 2026-11-05 from the audit's authority study and
> brought up to date on 2026-11-06 by session 05, with the landing published that day and each
> site's rules read again that day. Outside this public repository: the audit
> (`~/seo-data/audit-2026-11-05/authority.md`, the 73 articles and their authors' contacts in
> `authority-listicles.csv`, the creators in `authority-creators.csv`) and the materials
> (`~/seo-data/launch/`: the gallery, the video, the logo, the 50 outreach emails and the scripts
> that made them; its `README.md` lists each file and where it goes).

Every text follows `.claude/rules/i18n.md` («Claims and copy»): the 3D is "3D solids, still
partial" and, where described, names what it lacks (sweeps, lofts, meshes, rendering); a DXF
opens (since 7/11, session 07), but no DWG, saving as DXF, printing, PDF, collaboration or mobile
claims; "the code is MIT", never "MellowCAD is MIT"; "same order, same option letters", never
"same prompts"; AutoCAD only nominatively; no hype, no emojis.
**Figures are the landing's on the day** (`lib/facts.ts`); on 2026-11-06: 140 AutoCAD commands,
131 aliases, 12 object snaps, 4 languages, 6,000+ automated tests, 38 commands with a page of
their own. Read them off https://mellowcad.com before posting.

**Write by hand where the site says so.** Hacker News now forbids generated or AI-edited text in
posts and comments (its guidelines, not only a moderator's tip); r/webdev bans LLM-written posts;
dev.to bars an AI-assisted article from promoting the author's product; Product Hunt asks for no
LLM comments. The texts below are notes for those sites, and drafts elsewhere: say it in your own
words, and answer every reply yourself.

## 0. Before any post

1. **The push** of sessions 01–04: done (the landing went live on 2026-11-06).
2. **GitHub**: description and topics set on 2026-11-06 with this command (the description opens
   with the home's main query; topics are free discovery):

   ```sh
   gh repo edit ovelilla/mellowcad \
     --description "Free online CAD that works like AutoCAD: its commands, aliases and prompt order, for 2D drafting and 3D solids (still partial). A DOM-free TypeScript engine and its React editor. Not affiliated with Autodesk." \
     --add-topic cad,online-cad,autocad,drafting,cad-software,2d-drafting,3d,solid-modeling,b-rep,geometry,browser,typescript,canvas,react,open-source
   ```

   Still by hand (GitHub has no API for it): Settings → Social preview, `gallery/og-card-en.png`.
3. **Accounts**, personal ones, all with a verified email: Hacker News (a personal username, not
   the project's), Reddit, Product Hunt (**at least a week before launching**, or subscribe to its
   newsletter for immediate access), AlternativeTo, SaaSHub, dev.to, YouTube (for the video).
   On Reddit, take part in r/AutoCAD and r/cad before posting there: an account with only its own
   link reads as spam, and AutoModerator's karma and age limits are not public.
4. **A soft launch**: r/SideProject, asking for feedback, the week before Show HN (the owner has no
   AutoCAD users at hand to try it first). Do they understand what it is, and how long until their
   first line? What they hit gets fixed before Show HN.
5. **The materials**, in `~/seo-data/launch/`: eight gallery images at 1270×760 (2×), the
   46-second video, the logo at 240–1024 px. All drawn by MellowCAD; never a screenshot of
   Autodesk software, an Autodesk logo or its colours.

## 1. Where the links and the traffic come from

- **Followed links come from editorial lists**, not from launch platforms: 36 of the 73 lists link
  the tools they cover without `nofollow`. SaaSHub's and OpenAlternative's listing links are
  `nofollow`, and AlternativeTo's too "unless our editors decide otherwise"; a Hacker News story's
  link is `nofollow` until it gains points (14 points: nofollow; 146 and 160: followed); dev.to's
  links are followed (`noopener noreferrer` only, measured 2026-11-06).
- **The pitch is the empty slot**: none of the 73 lists names MellowCAD; 53 name some browser tool,
  almost all 3D modellers (Onshape, Tinkercad, SketchUp Free); only 9 name a 2D drafting tool in the
  browser. Each email says exactly what its list has (`~/seo-data/launch/outreach/`).
- **First targets** (rank #1–5, followed links): medevel's open-source CAD list (the only one naming
  KulmanLab), Rigorous Themes, ADSLZone, RecursosCAD, SoftZone, Tecnoloblog/Ikkaro, Arabitec,
  Aprendacad, TheCADHub (a form). Story pitches: MakeUseOf and the Hackaday tip line, which covered a
  single browser CAD each; Educación 3.0 for Spanish teachers.
- **Creators**: AutoCAD and architecture YouTubers reviewed free browser CADs in October (30k–150k
  views); MellowCAD's angle for them is AutoCAD's own Spanish and Portuguese command names.
- **KulmanLab is a low bar**: about 12–15 referring domains, almost all its own, Product Hunt with 7
  and 1 votes, nothing on Hacker News.

## 2. Show HN

Rules (read 2026-11-06, `news.ycombinator.com/showhn.html`, `newsguidelines.html`, `newsfaq.html`):
something people can try with no sign-up, not a landing page; **non-trivial** ("don't post
quickly-generated one-offs"); the title starts with "Show HN", no capitals for emphasis, no
exclamation marks; the text holds no links; never ask anyone to upvote or comment (it is
penalised); **no generated or AI-edited text, in the post or the comments**. So this is the order
and the facts, not text to paste.

- **Title** (about 80 characters; the form needs a login to confirm the limit): "Show HN: MellowCAD –
  browser CAD where matching AutoCAD's commands is the spec", or "Show HN: MellowCAD –
  AutoCAD-style drafting in the browser on a DOM-free engine".
- **URL**: https://mellowcad.com/draw (the editor: HN wants the thing itself); the home and the
  repository go in the first comment, since the text takes no links.
- **The text, in this order**:
  1. What it is in one line: CAD in the browser that works like AutoCAD (type L, press Enter; the
     prompts in AutoCAD's order with its option letters and defaults); no sign-up; autosave, and
     Ctrl+S saves a file.
  2. Why you started it, in your words.
  3. The rule: current AutoCAD (2027) is the spec, checked against AutoCAD itself; a partial command
     is allowed, a reinvented one is not (OFFSET really takes one object at a time). Spanish and
     Brazilian Portuguese take AutoCAD's localized command names (LINEA, DESFASE; LINHA, APARAR);
     the interface is also in Arabic.
  4. Technical notes: a TypeScript engine with no framework and no DOM, in layers whose imports only
     point down, on npm as @mellowcad/engine; every figure on the landing drawn by the engine at
     build time; tools tested by driving a headless engine with moves, clicks and keys (6,000+
     tests); one gesture, one undo step; 3D solids, still partial, on a B-rep kernel written for the
     project; a versioned file format that always opens older files.
  5. Not there yet: DWG files and saving as DXF, printing and PDF, paper space, sweeps, lofts,
     meshes and rendering, moving and rotating solids in 3D, phones and tablets; each command's
     missing options are in the repository.
  6. The code is MIT (in the first comment: https://github.com/ovelilla/mellowcad).
  7. The question: if you use AutoCAD every day, where does it break your muscle memory?
- **On the day**: Tuesday to Thursday, 8–10 a.m. US Eastern (14:00–16:00 in Spain); stay all day,
  answer limits plainly. Not in US Thanksgiving week's Thursday or Friday.

## 3. Reddit

Rules read from each subreddit's public sidebar on 2026-11-06 (submission pages need a login: read
them logged in too). Say "I made this", and write in your own words.

| Subreddit | Activity (weekly visitors / posts) | What applies |
| --- | --- | --- |
| r/AutoCAD | 25K / 104 | Reddiquette; no piracy. No self-promotion rule: the audience fit is the best. |
| r/cad | 14K / 73 | Reddiquette. |
| r/SideProject | 351K / 21K | No published rule visible logged out; flair unverified. |
| r/webdev | 343K / 4.2K | Projects **only on Showoff Saturday**, with its flair, "project, not product"; **no LLM-generated posts**. |
| r/programacion | 18K / 551 | Self-promotion at most 10 % of your activity; in Spanish; descriptive titles. |
| r/Arquitectura | 3K / 140 | Self-promotion once a week, with the "Software" flair. |
| r/brdev, r/arquitetura, r/Engenharia, r/Ingenieria | — | **Not venues**: they forbid launching or promoting a product, free and open source included. |

No Spanish- or Portuguese-language AutoCAD subreddit exists (r/AutoCAD_es and the like are empty):
Portuguese goes through forums, teachers and the outreach, not Reddit.

**r/AutoCAD.** Title: _I built a free browser CAD that follows AutoCAD's commands and prompt order.
Where does it break your muscle memory?_

> Disclosure: I made this. It's free, there's no sign-up, and the code is open source (MIT).
>
> MellowCAD runs in a desktop browser and follows AutoCAD 2027 at the command line: the same command
> names and aliases (L, O, TR, CO, F…), prompts in the same order with the same option letters, the
> same defaults. Object snaps use AutoCAD's markers; OTRACK, polar, Ortho and dynamic input
> (@100<30, #120,80) work. Layers, linetypes, lineweights, dimensions, text, hatches, blocks with
> attributes and the Properties palette are there too, and 3D solids, still partial.
>
> So nobody wastes time: it opens DXF but doesn't save it, has no DWG, doesn't print or make PDFs,
> has no paper space, the 3D has no sweeps, lofts, meshes or rendering, and it's desktop only.
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
> solids exist but are partial (no sweeps, lofts, meshes or rendering). It opens DXF but doesn't
> save it yet; no DWG, no printing.
>
> The engine underneath is a separate TypeScript package with no DOM (@mellowcad/engine on npm),
> with its own B-rep kernel for the solids. The code is MIT.
>
> https://mellowcad.com
>
> Two questions: for people who live in other CAD packages, does a command-line-first browser tool
> make sense to you? And what file exchange would you need first?

**r/SideProject** (and r/webdev on a Showoff Saturday, written by hand). Title: _I'm building a
browser CAD app where AutoCAD's behaviour is the spec, not a suggestion_

> What it is: MellowCAD, free CAD in the browser for people whose hands know AutoCAD: type L, press
> Enter, draw. No install, no account; drawings stay on the device. https://mellowcad.com
>
> What I learned: research keeps overturning the "obvious" design. OFFSET really takes one object
> at a time; the Center-Diameter circle's guide really runs past the rim, because its length is the
> diameter. Copying the awkward parts is what makes it feel right.
>
> Stack: a framework-free TypeScript engine with no DOM (on npm), a React editor on top, a Next.js
> static site. Every figure on the landing is drawn by the engine at build time, not screenshots.
> 6,000+ tests drive a headless engine with clicks and keystrokes. The code is MIT.
>
> Honest limits: it opens DXF but doesn't save it, no DWG or printing yet, 3D solids still partial,
> desktop only.
>
> Feedback I'd value: does the landing tell you what this is in five seconds? Where did you get
> stuck in the editor? A bug can also go straight to GitHub: Send Feedback, last in the editor's
> menu, opens an issue with the version and browser filled in.

**In Spanish** (r/programacion within its 10 %, r/Arquitectura with the "Software" flair, forums
and groups of architecture and engineering students; neutral Spanish). Título: _He hecho un CAD
gratuito en el navegador que entiende los comandos de AutoCAD en español (LINEA, DESFASE,
RECORTA…). ¿Me ayudan a probarlo?_

> Aviso: lo he hecho yo. Es gratis, no pide registro y el código es abierto (licencia MIT).
>
> MellowCAD funciona en el navegador de un ordenador y se maneja como AutoCAD desde la línea de
> comandos. En español acepta los nombres de comando de AutoCAD en español y sus alias (LINEA o L,
> DESFASE o DF, RECORTA o RR, EMPALME o MP), y también los globales con guion bajo (_LINE). Las
> solicitudes llegan en el mismo orden y con las mismas letras de opción. Tiene referencia a objetos
> con los marcadores de siempre, rastreo polar y de referencia a objetos, Orto, entrada dinámica,
> capas, tipos y grosores de línea, cotas, textos, sombreados y bloques con atributos, y sólidos 3D,
> todavía parciales (sin barridos, solevados, mallas ni renderizado). Cada comando tiene su página
> con sus solicitudes en https://mellowcad.com/es/docs/commands.
>
> Lo que todavía no hace, para no hacer perder el tiempo a nadie: abre DXF pero no lo guarda, no
> abre DWG, no imprime ni exporta a PDF y no tiene espacio papel. Solo en ordenador.
>
> https://mellowcad.com/es/draw
>
> Me sería muy útil saber qué comando o alias se echa en falta, qué solicitud no se comporta como
> se espera y si serviría para practicar o para un croquis rápido sin tener AutoCAD instalado.

**For technical-drawing teachers** (a teachers' community or an email; in Portuguese, the same
with LINHA, CIRCULO, DESLOCAMENTO, APARAR and https://mellowcad.com/pt-br/draw):

> Hola. Soy el autor de MellowCAD, un programa de CAD gratuito que funciona en el navegador del
> ordenador, sin instalar nada y sin cuentas: el alumno abre https://mellowcad.com/es/draw y dibuja.
> Usa los nombres de comando de AutoCAD en español (LINEA, CIRCULO, DESFASE, RECORTA…) con sus
> alias, y las solicitudes en el mismo orden y con las mismas letras de opción, así que lo que se
> practica en clase sirve después en AutoCAD. Los dibujos se quedan en el equipo: se guardan solos
> en el navegador, y con Ctrl+S en un archivo; no se envían a ningún sitio. Límites: abre DXF pero
> no lo guarda, no abre DWG, no imprime y el 3D es parcial. Si les sirve para clase, me gustaría
> saber qué echan en falta.

## 4. Product Hunt

Rules (its Help Center's Launch Guide, read 2026-11-06): a personal account (company accounts
cannot post), with a verified email and a week's wait after sign-up, or the newsletter for
immediate access; name ≤ 40 characters; tagline ≤ 60; description ≤ 500; maker's comment ≤ 5,000;
thumbnail 240×240, under 2 MB; at least one gallery image at 1270×760 (the older guide says two:
upload all eight); video from YouTube only; 1–3 tags; pricing and an open-source flag with the
repository link; no shortened or UTM links; schedulable from tomorrow up to 30 days ahead; the day
runs from 12:01 a.m. Pacific. **Never ask for upvotes**, nor trade or pay for them (removal and a
ban); votes from new accounts count far less; featuring is an editorial choice.

- **Name**: MellowCAD. **Tagline** (≤ 60): "Free online CAD with AutoCAD commands" (37), or "CAD in
  your browser, typed the AutoCAD way" (42).
- **Description** (≤ 500; 300): "Free CAD in your browser that works like AutoCAD: the same commands
  and aliases, prompts in the same order with the same option letters, object snaps, polar and
  OTRACK. 2D drafting, and 3D solids that are still partial. No install, no account; drawings stay
  on your device. The code is MIT on GitHub."
- **Pricing**: Free. **Open source**: yes, https://github.com/ovelilla/mellowcad.
- **Tags**: the closest of Product Hunt's own to design tools, open source and engineering (3 at
  most).
- **Thumbnail**: `logo/mellowcad-240.png`. **Gallery**: `gallery/01` to `08`, in order, with the
  captions in `~/seo-data/launch/README.md`. **Video**: `video/mellowcad-demo-en.webm`, on YouTube unlisted since 2026-11-06: https://youtu.be/VhN7JUqjT10, on the owner's channel renamed `ovelilla` (`@ovelilla`).
- **Maker's first comment** (in your own words; the facts):

> Hi, I'm [name] and I build MellowCAD. It's for people whose hands already know AutoCAD: L and
> Enter for a line, O to offset, TR to trim, with the prompts in the same order and the same option
> letters. It runs in a desktop browser with nothing to install and no account, and drawings stay
> on your device: autosave, plus Ctrl+S for a file.
>
> Today: 2D drafting with object snaps, OTRACK, polar and dynamic input; layers, linetypes,
> lineweights and colours; dimensions, text, hatches and blocks with attributes; 3D solids, still
> partial. In Spanish and Brazilian Portuguese it takes AutoCAD's localized command names, and the
> interface is also in Arabic. Each command has a page with its prompts.
> Not yet: DWG, saving as DXF (a DXF opens), printing and PDF, paper space, sweeps, lofts, meshes
> and rendering in 3D, phones and tablets.
>
> The code is MIT on GitHub, and the engine is on npm for anyone who wants to build on it. What
> I'd value most is feedback: what did you reach for that wasn't there?

- **On the day**: a weekend (Product Hunt's data gave small makers 15 % more visits then), 12:01
  a.m. Pacific; ask for feedback, never for votes; answer every comment yourself, without an LLM.

## 5. Outreach email

One email per article, written for it from `authority-listicles.csv`: the article's title and
update date, the query it ranks for, and exactly what it lists in the browser (all of them, for a
team that owns translated copies). They are ready in `~/seo-data/launch/outreach/` (50 emails in
the article's language, each with its contact, subject and one follow-up; its `README.md` orders
them in three waves). Not emailed: the competitors' own pages (partwork.ai, cadcraft.org,
branchcad.com) and the directories, which get a listing (§6). Send from a personal address, one at
a time, never in bulk or BCC; one follow-up after 7–10 days at most. The base text, in English:

> Hi [first name],
>
> Your "[article title]" ([updated month year]) is one of the first results for "[query]". Its
> browser options are [Onshape, Tinkercad and SketchUp Free]; none of them is a 2D drafting tool used
> from a command line the way AutoCAD is, which is what many people looking for a free AutoCAD
> alternative want.
>
> I build MellowCAD (https://mellowcad.com): CAD in a desktop browser that works like AutoCAD, with
> its command names and aliases (L, O, TR, F…), the prompts in the same order with the same option
> letters, and its object snaps, OTRACK and polar tracking. It does 2D drafting and, still
> partially, 3D solids. It's free, with nothing to install and no account, and drawings stay on the
> user's device. The code is MIT on GitHub.
>
> The limits, so you can judge the fit: it opens DXF but doesn't save it yet, no DWG, no printing
> or PDF, the 3D lacks sweeps, lofts, meshes and rendering, and it needs a desktop browser.
>
> If it fits your next update, one line under the browser-based tools would be plenty. I'm glad to
> answer anything or send images.
>
> [Name] — what differs from AutoCAD, command by command: https://mellowcad.com/docs/differences

The Spanish, Portuguese, French, German and Arabic versions say the same; the French and German
ones add that the commands take their English names there (as `_LINE` does in a localized AutoCAD)
and that the interface is not yet in their language.

## 6. Directories and listings

Rules read on 2026-11-06.

**Done on 2026-11-06** (from a browser session the owner logged into, as `ovelilla`; the account
email of SaaSHub and G2 is `hello@mellowcad.com`, Cloudflare Email Routing to the owner's inbox):
SaaSHub submitted and verified (free queue, 1–12 weeks), with the logo, five screenshots, MIT and
nine competitors; AlternativeTo submitted with six alternatives (AutoCAD, LibreCAD, QCAD,
DraftSight, FreeCAD, BricsCAD), the icon, six screenshots and the video, in the free queue (the
owner declined the 15 $ priority review on 2026-11-06), approved the same day from the free queue
(`alternativeto.net/software/mellowcad/`, the six alternatives connected). Refused: G2's automatic check calls the URL a B2C product
and stops the form (its support is the only way on); OpenAlternative needs 250 stars on a
repository under six months old; TheCADHub is now free only with its badge linking back from our
site (a link exchange, declined) or 49 $.

- **AlternativeTo** (#1–2 on Bing for "free autocad alternative"; its AutoCAD page filtered to
  free + online lists 21 tools): "Suggest new application" from the user menu, with a verified
  email. Licence Free and the **Open Source** flag with the repository; platform Online (Web);
  alternative to AutoCAD, LibreCAD, QCAD and DraftSight. The app must be in English; **no URLs or
  emails in the description**, no UTM on the official site; icon square, 280 px or more
  (`logo/mellowcad-512.png`). The free queue holds "several thousand apps" that may wait "a very
  long time"; a paid priority review (one payment, 1–2 working days, price shown before paying,
  approval not guaranteed) is the owner's call. Its links are `nofollow` unless the editors decide
  otherwise; once listed, claim developer access to edit without review.

  > MellowCAD is free CAD that runs in a desktop web browser and works like AutoCAD: the same command
  > names and aliases (L, O, TR, CO…), prompts in the same order with the same option letters, the
  > same defaults, object snaps with the familiar markers, OTRACK, polar tracking, Ortho and dynamic
  > input. It covers 2D drafting — layers, linetypes, lineweights, dimensions, text, hatches, blocks
  > with attributes, arrays and the Properties palette — and 3D solids, still partial (no sweeps,
  > lofts, meshes or rendering). Nothing to install and no account; drawings autosave in the browser
  > and save to a file. In English, Spanish and Brazilian Portuguese (with AutoCAD's localized
  > command names) and Arabic. It opens DXF files but does not save them yet, and has no DWG or
  > printing. The code is open source under the MIT licence. Not affiliated with Autodesk.

- **SaaSHub** (free listing, moderated; `nofollow`): name the competitors when submitting (AutoCAD,
  LibreCAD, QCAD, DraftSight, Onshape), or the listing goes to the end of the queue; verifying with
  an address at the domain gives priority. English only; no free subdomains (mellowcad.com is
  fine). The paid featured slot (99 $/month) is not needed.

  > Free CAD in the browser that works like AutoCAD: the same commands and aliases, prompts in the
  > same order with the same option letters, object snaps and dynamic input. 2D drafting, and 3D
  > solids that are still partial. No install, no account; drawings stay on your device. The code
  > is MIT on GitHub. It opens DXF; no DWG, saving as DXF or printing yet.

- **G2** (its "best free CAD" article ranks #1–2): a product listing in G2's directory is the way
  into its articles. **Appvizer** (pt-BR and fr articles) and **Quelle-Alternative** (fr): request
  a listing. **TheCADHub**: its submission form (login required; listings free through 2026).
- **OpenAlternative**: the free submission waits in a "regular queue" with no date (paid tiers
  97–197 $); approved tools also enter its awesome list; its links are `nofollow`.
- **Not yet**: opensourcealternative.to requires the project to be self-hosted (29 $ for a 48-hour
  review, or a 6-month queue) — first a self-hosting page in the docs; mlightcad/awesome-cad has a
  "Web-Based 2D CAD" section but its owner is a competitor who has merged none of 18 outside pull
  requests; ad-si/awesome-3d-printing asks for 4 months of age (not before 2026-12-27) and does not
  fit drafting.
- **dev.to**: one technical article on the engine (the DOM-free layering, the headless tests, the
  B-rep kernel), written by hand: an AI-assisted article may not promote the author's product, and
  publishing mainly for backlinks can get an account suspended. Up to 4 tags; `canonical_url` if
  the text also lives elsewhere; its links are followed.

## 7. Calendar

The dated calendar, what to watch after each step and the dates done live in `docs/next-seo.md`,
L5.
