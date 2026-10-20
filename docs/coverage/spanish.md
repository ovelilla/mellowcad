# Spanish command language (`es`)

`/es/draw` speaks Spanish AutoCAD 2026's command language, as its language pack does: Spanish
command
names and aliases, prompts and keywords, with `_` plus the global name or keyword in every language
(`_LINE`, `_C`). Each command's entry carries its Spanish name after `· es`. Sources and the
state of each piece (`cad/locales/es.json`; each GUID resolves as `docs/i18n-glossary.md`,
"Sources",
explains):

- **Names:** every one from the title of Autodesk's 2026 Spanish help page with the English page's
  GUID — verified. `DIMANGULAR`'s page says ACOANGULAR while its metadata, the `acad.pgp` and every
  transcript say ACOANGULO, so both run it. Our own commands take the Spanish base name and the
  initials of their Spanish construction: `CIRCULOD`, `CIRCULO2P`, `CIRCULO3P`, `ARCOICF`
  (Inicio, Centro, Fin), `ARCOCIF`, `ELIPSEC`, `ELIPSEARCO`. Rows without their own line:
  `UNDO` `DESHACER`, `U` → `H` (a command of its own in Spanish, "equivale a
  deshacer 1"), `REDO` `REHACER`, `SNAP` `FORZCURSOR` / `FC`†, `FROM` `DESDE`,
  `BLOCKSPALETTE` `PALETABLOQUES`.
- **Workspace:** `UNIDADES`, `ESCALATL`, `LIMPIAPANTACT` and `LIMPIAPANTDES` from the Spanish pages
  with the English GUIDs (1DAE2080, 47B3793A, 1D51E778, 7C9CDCC6); the dialog's
  `Unidades de dibujo`, `Longitud`, `Tipo`, `Precisión`, `Decimales`, `Escala de inserción`,
  `Muestra de salida` and INSUNITS' `Milímetros`, `Centímetros`, `Metros` from 75419F91 and
  A58A87BB, the status bar's `Limpiar pantalla`, `Personalización`, `Espacio modelo` and
  `MODELO` from E3B34B0A and 5FD72B72.
  `UNS`† and `EC`† come from a transcription of the Spanish `acad.pgp` (datech.es), as no 2026
  source lists them; ESCALATL's prompt is **unverified**.
- **Palettes:** `CAPA` / `CA`, `CERRARCAPA`, `PROPIEDADES` / `PR` and `CERPROP` from the Spanish
  pages with the English GUIDs (9123091A, 9D0D75C7, DC3674C5, 6F265AEA) and the 2026 Spanish
  getting-started pages (`CAPA o CA`, `escriba PR`); the manager's `Estado`, `Nombre`, `Act`,
  `Bloquear`, `Color`, `Tipo de línea`, `Grosor de línea` and `Definir actual` from its reference
  page
  (B297EBD9), the drop-down's `Todo` from the predefined filter of the same name. `CH` and `MO`
  stay English: the Spanish file gives `CH` to CHAFLAN.
- **Attributes:** `ATRDEF`, `-ATRDEF`, `ATREDIT`, `EDITATR` and `ATRVIS` from the Spanish pages with
  the English GUIDs, as are the keywords Invisible, Constante, Verificable, Predefinido and Bloquear
  posición. From aCADemia's 2013 captures of the Spanish product ("Bloques", 11.ª and 13.ª
  partes): -ATRDEF's tag, prompt and default prompts, the modes line with `S`/`N` and its two
  spaces, the alias `AT` / `-AT`† (2013; no 2026 source lists them), and ATRVIS's
  `[Normal/ACT/DES] <Normal>`. `ATE` has no Spanish alias. **Unverified:** INSERT's
  `Indique los valores de atributo` and the Edit Attribute Definition labels.
- **SPLINE:** the name from the Spanish page with the English GUID (`SPLINE`; SPLINEDIT is
  `EDITSPLINE`); `SPL`, the keywords `Método`, `Nudos`, `Grado`, `Ajustar`, `VC`,
  `iniciar Tangencia`,
  `finalizar Tangencia`, `Cerrar`, `desHacer` and the prompts `Precise tangente inicial`,
  `Precise tangente final` and `Indique grado de spline` from aCADemia's 2011 captures of the
  Spanish
  product. **Unverified:** the capitals of `Cuerda`/`Raíz cuadrada`/`Uniforme` (the help's names),
  `Precise tangente` at the closure and the palette's `Parametrización de nudos`. In English, the
  Fit prompts are a 2019 capture's; `Enter spline degree` and `Specify tangent` are not.
- **UCS:** `SCP` and `SIMBSCP` from the Spanish pages with the English GUIDs, as is `PLANTA`;
  the keywords `gUArdado`, `oBjeto`, `PRev`, `Vista`, `Univ`, `X`, `Y`, `Z`, `ejEZ`, `Objeto`,
  `Rest`,
  `Guardar`, `Supr`, the
  prompts `Indique origen de SCP`, `Precise punto en eje X o <Aceptar>`, `Precise punto en plano XY
o <Aceptar>`, the Named ones and `Nombre de scp actual: *UNIVERSAL*` from aCADemia's 2014 captures
  of the Spanish product, as are ejEZ's `Precise nuevo punto de origen` and `Precise punto en parte
positiva del eje Z` and Y's `Precise ángulo de rotación sobre eje Y`; `ACT/DES/Sin
origen/Origen` from the 2026 help and the same captures;
  PLANTA's `[scp Actual/SCP/Universal]` and `Indique nombre de SCP o [?]` from aCADemia's 2014
  capture ("Entorno de trabajo en 3D", 1.ª parte), whose Universal differs from SCP's Univ.
  **Unverified:** `Precise ángulo de rotación sobre eje X` and `…eje Z` (the capture shows Y's),
  `*SIN NOMBRE*`
  in the prompt line (the help's word), the `?` listing and the UCS-not-found message, in both
  languages. Neither language's `acad.pgp` has an alias for UCS.
- **Views:** `PTOVISTA`, `-PTOVISTA`, `VISTA`, `-VISTA` and `3DORBITA` from the Spanish pages with
  the English GUIDs. From aCADemia's 2014 captures of the Spanish product ("Entorno de trabajo en
  3D", 1.ª parte; "Coordenadas", 9.ª parte), which beat the help where they differ: -PTOVISTA's
  `Dirección de vista actual:  VIEWDIR=…`, `Precise un punto de vista o [Rotación]` (the help says
  Girar), `Ángulo a partir del eje X en el plano XY`, `Ángulo a partir del plano XY` and the alias
  `-PV`† (`PV` ran PTOVISTA only before 2015); the orthographic list
  `[SUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]` (two letters for Superior). Neither
  language's file gives VISTA or 3DORBITA a Spanish alias. **Unverified:** the isometric keywords
  `isoSO` / `isoSE` / `isoNE` / `isoNO` (ours, from the help's Isométrica SO…),
  `Regenerando modelo.` and the edge-on message. `NAVVCUBE` keeps its English name, with
  `[ACT/DES] <ACT>` (the 2026 Spanish
  help: `Indique una opción [ACT/DES/Propiedades] <ACT>:`); no Spanish alias — the Spanish
  shortcut guide lists `CUBE`, but it is a translation of the English one. From the Spanish help's
  captures: the view menu (Superior, Inferior, Izquierda, Derecha, Frontal, Posterior, Isométrica
  SO / SE / NE / NO), the cube's SUPERIOR, FRONTAL and IZQUIERDA and its compass's `O`; the menus
  (Inicio, Paralelo, Definir vista actual como inicio, SCU, Nuevo SCP, Sin nombre) from its pages.
  The cube's faces and compass and the preset views are the engine's words (`interface.viewCube`,
  `interface.view`), the menus' the app's (`Editor.ViewCube`). **Unverified:** INFERIOR, POSTERIOR
  and DERECHA on the cube, the roll and triangle tooltips, and Vista personalizada (the only
  Spanish source, a 2026 "¿Ha probado…?" page, shows `[Personalizada]`).
- **Aliases:** verified in Autodesk's 2026 Spanish material: `L`, `C`, `A`, `REC`, `CP`, `DI`, `AA`,
  `Z`, `B`, `H`. **† = unverified for 2026:** the Spanish `acad.pgp` ships only with the language
  pack; these come from three transcriptions of it (2012–2021) that agree with each other and with
  a screenshot of the file's start in the 2026 help. The 2026 Spanish "Hitchhiker's Guide" uses some
  English letters instead (M, O, TR, EX, MI, S, F, X); not followed, since the file maps them to
  other commands (`EX` is EXPORTAR). In Spanish `U` is UNIR and `H` undoes. `TEXTOM` has no alias:
  the Spanish shortcut guide gives it `T` and `MT`, but that page is a translation of the English
  one
  (it also lists `DT` for TEXTO), and the transcriptions of the file keep `T` on TEXTO.
- **Prompts and keywords:** from Spanish product captures (2012–2020) and the 2011–2026 Spanish
  help;
  where the help and the product disagree on capitals, the product wins (`punto a Atravesar`,
  `RAdio`, `jUstificar`, `ángUlo`, `EScala`). **Unverified** (no source found; worded in
  Autodesk's style): CIRCULO's `Diámetro`, ELLIPSE's `ángulo Incluido` and its centre/arc prompts,
  POLYGON's `Tipo` switch
  (ours), TEXTEDIT's `Única`/`Múltiple` capitals, OFFSET's Yes/No, Current/Source
  (`Actual`/`Origen`),
  On/Off (`ACT`/`DES`, as SNAP prints them) and `Distancia`, HATCH's pattern name, scale and angle
  prompts, DIMLINEAR's Angle and Rotated sub-prompts, the reference sub-prompts of ROTATE and SCALE,
  the clipboard base-point prompt, TEXTOM's line-spacing words and capitals (`Mínimo`/`Exactamente`,
  `TextoM`; its corner prompts and `[Altura/Justificar/Interlineado/Rotación/Estilo/aNchura]` are
  aCADemia's 2011 and 2013 captures, its justification codes `SI`…`ID` the -TEXTOM help page's),
  SCP's
  `Sí`/`No` before replacing a saved UCS, the palette rows of TEXTOM and SPLINE (`Factor de
interlineado`, `Anchura definida`, `Método`, `Grado`…), the prompts of POL, CIRCULO and ARCO their
  rows mark,
  and every dynamic-input label (Spanish AutoCAD's box shows the
  prompt and unlabelled fields; the labels are the nouns of its prompts).
- **Messages:** verified `Comando:`, `Comando "X" desconocido.`, `*Cancelar*` (a 2026 help capture),
  the snap tooltips, the hatch
  density message (partial) and `Las líneas no son coplanares.` (Autodesk's Spanish support article
  on it); FILLET's, CHAMFER's, TRIM's, POLYGON's, ELLIPSE's and SPLINE's prompts and reports,
  `*No válido*`, from the string table of Autodesk's AutoCAD 2027 Spanish language pack
  (`es-ES/acadres.dll`, read without installing it), paired with AutoCAD 2023's English by id.
  **Unverified:** nothing selected, the erase, purge and explode counts,
  the file errors, the clipboard and FROM notes, `El círculo no existe.`, block, pattern and style
  not found, `Capa{n}`
  (partial), `Copia de {name}`, `Radio de empalme es demasiado grande`,
  `Distancia de chaflán es demasiado grande`, `Todos los efectos del comando han sido deshechos.`,
  POLYGON's `Requiere un número entero entre 3 y 1024.` and JOIN's
  `0 objetos unidos, n objetos descartados de la operación`
  (a user's quote of AutoCAD 2020).
- **Sources beyond the help pages:** the Spanish alias guides
  ([2022 Product
  Insights](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-Product-Insights/files/GUID-DB0E87C4-2223-49ED-84F9-FBB3B6BA65A9.htm),
  [Did You
  Know](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-DidYouKnow/files/GUID-D2B4BF16-B1F7-4EF2-89AF-88ACE85FAD73.htm)),
  `initget` for local and global keywords and capitals anywhere
  ([2025](https://help.autodesk.com/view/ACD/2025/ENU/?guid=GUID-9ED8841B-5C1D-4B3F-9F3B-84A4408A6BBF)),
  the `_` and `.` prefixes ([CADforum](https://www.cadforum.cz/en/qaID.asp?tip=2425),
  [Autodesk's blog](https://blog.autodesk.io/working-with-non-english-version-of-autocad/)) and
  the University of Granada's transcript of the Spanish product
  ([PDF](https://www.ugr.es/~ega3/Unidad%20didactica%2001%20Sintaxis%20vectorial%202D.pdf),
  «Precise punto siguiente o [Cerrar/desHacer]»). To settle every † and **unverified** below, a
  capture of AutoCAD 2026 with the Spanish language pack (the 30-day trial is enough).
- **Z readouts:** `Altura de objeto` (the palette's General row, help 99AFB412), ID's
  `Precise punto` and the ribbon's `Coordenadas punto` from the 2026 Spanish help. **Unverified:**
  DIST's and ID's reports and the palette's `Inicio Z`, `Fin Z`, `Delta Z` and `Elevación` (worded
  as the X and Y rows already published).
