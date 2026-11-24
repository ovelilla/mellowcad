# Medir el knowledge — brief

> **Estado:** acordado el 10/11/2026 por el dueño, en el orden de §3: el registro de cargas, leído
> el 24/11 con lo barato decidido y aplicado (§3, «La lectura del registro»), sigue corriendo; el
> piloto de 16 ejecuciones está preparado (§3, «El piloto, preparado») y espera la palabra del
> dueño, y el banco completo, solo si el piloto da una señal clara. Recoge los puntos 4, 5 y 8 de §5 de la auditoría
> (`docs/plans/knowledge-audit.md`, triaje en §8), que dependen de medir.

## 1. Qué se quiere saber

Si cada regla, skill y párrafo de `AGENTS.md` cambia lo que hace un agente, y cuánto cuesta en
tokens y tiempo. Hoy el knowledge solo sabe crecer (§2.1 de la auditoría): 360 KB entre `.claude/`
y `AGENTS.md`, con los topes por archivo saturados. La pregunta se repite en cada modelo nuevo.

## 2. Qué hay ya, sin coste

- **El registro de reglas cargadas** (`.claude/hooks/instructions-log.mjs`, desde el 10/11):
  `npm run knowledge:loads` da en cuántas sesiones se carga cada regla y por qué archivo. Con dos
  o tres semanas de datos ya separa las reglas que cargan en casi todas las sesiones de las que no
  cargan nunca, que piden decisiones distintas sin ningún banco.
- **Las transcripciones locales** (`~/.claude/projects`, 151 sesiones en la auditoría): las
  correcciones repetidas del dueño son candidatas a tarea.
- **Los hallazgos de las 31 reviews de comando**: cada uno tiene sonda con id, test y commit. Son
  la materia prima de las tareas.

## 3. El banco, si compensa

Una tarea: el repo en el commit padre de un `fix` real (clon superficial, para que `git log` no
dé la solución), el texto del hallazgo como encargo, y como juez los tests del commit real más el
gate. Se ejecuta sin interfaz (`claude -p`) en un worktree por ejecución, con variantes del
knowledge: completo, sin la regla X, con la regla X adelgazada. Se mide acierto, tokens y tiempo.

### Coste, a ojo

Una tarea de las reviews ocupa a una sesión entre 15 y 60 minutos. Diez tareas, dos variantes y
tres repeticiones (el modelo no es determinista: con una sola, una diferencia de una tarea es
ruido) son 60 ejecuciones: del orden de 30 horas de agente y, con el consumo de una sesión de
review, decenas de millones de tokens. Montarlo es una o dos sesiones (extraer tareas, el
ejecutor, el juez).

### Lo acordado

**No montar el banco completo todavía** (el dueño, 10/11/2026). Primero:

1. Dejar correr el registro de cargas dos semanas y decidir con él lo barato: una regla que no
   carga nunca se revisa a mano; una que carga en todas se adelgaza primero.
2. **Un piloto pequeño**: 4 tareas de `cad-tools.md` (la regla más cargada en el código de
   herramientas), 2 variantes (con y sin la regla), 2 repeticiones: 16 ejecuciones, unas ocho
   horas de agente. Si la variante sin la regla acierta igual y gasta menos, la poda de §4 tiene
   apoyo; si falla en las tareas que la regla cubre, la regla se queda y el banco crece.
3. Solo si el piloto da una señal clara, el banco de 10 a 20 tareas, repetido en cada salto de
   modelo (punto 8).

Lo que el piloto no contesta: si una regla evita un error que las tareas elegidas no tocan. Por
eso las tareas salen de fallos reales, y una regla sin ninguna tarea que la toque no se poda por
el banco, sino por el registro y la lectura.

### La lectura del registro (24/11/2026)

Del 10/11 (11:12, cuando entró el hook) al 24/11: 793 cargas en 53 sesiones.

**El registro está sano.** Contrastado con las transcripciones, que guardan cada regla inyectada
como un adjunto `nested_memory`:

- **Ningún día falta**: el 14/11 no tiene cargas ni transcripción alguna; no hubo sesión.
- **Cuenta todas las sesiones**: de las 64 transcripciones desde el 10/11, las 53 del registro
  coinciden regla a regla, sin una discrepancia. Fuera quedan 2 anteriores al hook, 5 `claude -p`
  del banco del MCP (en el scratchpad, sin repo) y 4 que no tocaron un archivo con regla. Las 10
  que trabajaron en un worktree están, y la carga de un subagente va con el id de su sesión.
- **Cada carga lleva su archivo** (793 de 793), pero solo la primera de cada regla en cada
  contexto (la sesión, cada subagente, tras compactar): dice por qué entró la regla, no todo lo
  que la sesión hizo con ella. Por eso la tabla cruza también lo que cada sesión editó.
- Dos defectos del lector, arreglados: una sesión con el cwd en un worktree registra la regla como
  `../../rules/<regla>` (partía `knowledge.md` en dos filas), y una con el cwd en `main`, el
  archivo con `.claude/worktrees/<nombre>/` delante.

**Hallazgo: Claude Code prueba cada glob de `paths:` desde cada carpeta de la ruta**, no solo
desde la raíz (patrones de gitignore, la librería `ignore`, leída en su código). `docs/**` cargó
`knowledge.md` con `content/docs/`, `cad/docs/`, `lib/docs/` y `node_modules/next/dist/docs/`, e
`i18n/**` cargó `i18n.md` (17,9 KB) con `docs/i18n/` en 15 sesiones. La hipótesis explica 791 de
las 793 cargas; las otras dos son rutas que el export estático sacó de sus reglas el 21/11.
Probado en vivo: leer `cad/i18n/keywords.ts` cargó `i18n.md`. Es también lo que carga las reglas
de `main` para un archivo de un worktree.

La tabla cuenta las sesiones hasta esta, sin ella; «editan su área», las que editaron un
archivo de sus `paths:`, ellas o sus subagentes.

| Regla                 | KB   | Sesiones | Quién la carga (sesiones)                                  | Editan su área |
| --------------------- | ---- | -------- | ---------------------------------------------------------- | -------------- |
| `knowledge.md`        | 4,0  | 52 (100 %) | `docs/` 35 (los briefs), `.claude/skills/` 15, `.claude/rules/` 15 | 42; `.claude/` 25 |
| `testing.md`          | 6,8  | 46 (87 %) | `test/` 17, `cad/application/` 17, `cad/serialization/` 9 | 44; un test de `cad/application/` 30 |
| `cad-engine.md`       | 18,2 | 37 (70 %) | `cad/application/` 25, `cad/domain/` 14                    | 33             |
| `autocad-research.md` | 0,9  | 36 (68 %) | `docs/coverage/` 22, `docs/i18n/` 11                       | 19             |
| `cad-runtime.md`      | 25,0 | 34 (64 %) | `cad/application/*.ts` 33                                  | 27             |
| `cad-catalogs.md`     | 8,9  | 26 (49 %) | `cad/application/tools/` 23                                | 21             |
| `cad-tools.md`        | 24,8 | 24 (45 %) | `cad/application/tools/` 24                                | 19             |
| `docs.md`             | 13,8 | 24 (45 %) | `content/commands/` 16, `content/docs/` 15                 | 16             |
| `marketing.md`        | 16,9 | 24 (45 %) | `lib/site.ts` 5, `content/commands.ts` 5                   | 13             |
| `engine-package.md`   | 10,9 | 22 (42 %) | `packages/editor/` 4, `.changeset/`, `cad/index.ts`        | 18             |
| `i18n.md`             | 17,9 | 20 (38 %) | `docs/i18n/` 15 (el glob a cualquier nivel)                | 11             |
| `ui.md`               | 24,0 | 18 (34 %) | `packages/editor/` 15                                      | 11             |
| `cad-scene.md`        | 6,3  | 13 (25 %) | `cad/application/SceneBuilder.ts` 12                       | 3              |
| `mcp.md`              | 5,6  | 3 (6 %)  | `lib/mcp/`, `scripts/mcp/`                                 | 3              |
| `cloudflare.md`       | 2,8  | 3 (6 %)  | `scripts/cloudflare/zone.ts`                               | 1              |

**Lo decidido, y aplicado:**

1. **Ninguna regla deja de cargar.** `mcp.md` y `cloudflare.md`, las que menos, cargan en las 3
   sesiones de su área: se quedan.
2. **`knowledge.md` (todas las sesiones) se parte.** Carga por los briefs, que el hook manda leer,
   y eso está bien: lo que sirve a `docs/` (dónde va cada cosa, las citas, la línea de estado) se
   queda. Lo que solo sirve a quien escribe en `.claude/` o `AGENTS.md` (los hooks, la cabecera
   «Verified against», `description:`, `paths:`, las skills, `CLAUDE.md`, los topes) pasa entero a
   `rules-and-skills.md`, con `paths:` de `.claude/**`, `AGENTS.md` y `test/knowledge.test.ts`.
   Las 23 sesiones de 52 que no leyeron ni editaron nada de `.claude/`, `AGENTS.md` ni el test
   habrían cargado 2,5 KB en vez de 4,0; las otras 29, 4,9, las dos con lo que este cambio añade
   (el glob a cualquier nivel, el registro). Sin partirla, serían 4,75 KB en las 52.
3. **`testing.md` (87 %) se queda como está.** Sus cargas son su público: 44 de 46 sesiones
   editan un test. El harness, casi la mitad, sirve a 30 (un test de `cad/application/`, donde
   están 151 de los 156 que usan `createHarness`). Lo de público estrecho (el adaptador del
   navegador, los tests que corren git: 1,3 KB) no tiene una regla de `paths:` más estrechos
   donde ir sin crear reglas de un párrafo.
4. **El glob a cualquier nivel**: `i18n.md` pasa a `i18n/*.ts` y `knowledge.md` a
   `docs/**/*.md`. `test/knowledge.test.ts` lo comprueba ahora: un glob que también carga su regla
   fuera de su carpeta va en `ANY_LEVEL_GLOBS` con su razón (quedan tres: `README.md`, las guías
   de los paquetes y `cad/i18n/`), y la p90 se mide con la semántica real (no cambia: 52,0 KB).
5. **El hook guarda también qué glob casó** (`globs`), y `npm run knowledge:loads` normaliza los
   worktrees y da por qué carpetas carga cada regla (`-- <regla>`: cada archivo).

**Lo dudoso, con su dato** (para la poda de §4, después del piloto):

- **`cad-runtime.md`** es la carga más cara: 25,0 KB en 34 sesiones. 33 vienen de
  `cad/application/*.ts`, que coge cualquier archivo de primer nivel de `application/`
  (`dxfSave.test.ts`, `englishSurface.test.ts`, `runtimeFiles.ts`), aunque 27 de las 34 sesiones
  editan su área. Estrecharlo pide una lista de nombres, que envejece: se decide con la poda.
- **`cad-scene.md`**: 12 de sus 13 cargas son por leer `SceneBuilder.ts`, y solo 3 sesiones
  editan su área. Se queda: quien lee el constructor de la escena es su lector.
- **`marketing.md`**: 13 de 24 sesiones editan su área; `lib/site.ts` y `content/commands.ts` la
  cargan de paso. Sin decisión hasta ver otra quincena.

### El piloto, preparado (24/11/2026): espera la palabra del dueño

Unas ocho horas de agente. No se lanza sin la palabra del dueño.

**Las variantes.** _Con_: el repo del commit padre tal cual. _Sin_: el mismo, con el cuerpo de
`.claude/rules/cad-tools.md` vaciado y su frontmatter intacto, para que las citas a la regla sigan
valiendo y el test de knowledge no falle por ellas. Nada más cambia entre las dos.

**Las tareas**: cuatro fallos reales de herramientas, uno por sección de la regla, cada uno
con su pasaje ya en el `cad-tools.md` del padre. Los tests que juzgan fallan en el padre y pasan
en el arreglo (comprobado el 24/11 en un worktree desechable). El encargo es el informe del fallo,
nunca el arreglo ni el archivo.

| # | Arreglo (padre)          | Juez: lo que falla en el padre                                                                                   | Pasaje de `cad-tools.md`                                                                                  |
| - | ------------------------ | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 1 | `a48f0372` (`b0d6379e`)  | `cad/application/tools/previewIds.test.ts`, nuevo: «SPLINE after 2 points» (1 de 296)                            | Reuse before writing: un preview reutiliza un id fijo, «never one minted per frame»                     |
| 2 | `8609726e` (`dc26a886`)  | `cad/application/tools/polyline3d.test.ts -t "UNDO Control None"`: p125 (1)                                       | Ordering and undo: un comando en bucle restaura su estado «whatever the undo returns»                    |
| 3 | `a5603063` (`d7911c5a`)  | `cad/application/solidedit.test.ts -t "Rotate in a UCS"`: 5 de 6 (p331, p367, p366 ×2, p404)                      | Points, snapping: un prompt que nombra los ejes o el origen del SCP «reads `ctx.ucs`, never the frame's» |
| 4 | `8e79a536` (`bdbfe83b`)  | `cad/application/solidPrimitives.test.ts -t "the primitives' defaults"`: 4 de 8 (p155, p158, NEW y OPEN)          | System variables: dónde vive un valor es la prueba de OPEN de la consola; `onActivate` no resetea lo que AutoCAD guarda |

Los encargos, tal cual se dan:

1. «While SPLINE is asking for points, just moving the mouse uses up entity ids. Start SPLINE,
   click two fit points, then move the cursor around without clicking. Each redraw of the curve's
   preview takes a new entity id, though nothing is added to the drawing. LINE, CIRCLE, PLINE and
   the other commands preview without using any. Hovering should use no ids; only the committed
   spline gets one.»
2. «3DPOLY's Undo option does nothing when UNDO Control is None. Run UNDO, Control, None. Then
   3DPOLY and type 0,0, 10,0 and 10,10. At `Specify endpoint of line or [Close/Undo]:` type U,
   then press Enter to end. In AutoCAD 2027 the last vertex is taken back, so the polyline is 0,0
   to 10,0, just as LINE's Undo still steps back under Control None. Here the 10,10 vertex
   stays.»
3. «SOLIDEDIT Face Rotate ignores the current UCS for its axis options. Draw a BOX from 0,0,0 to
   10,10 with height 10, then UCS Z 30. Run SOLIDEDIT, Face, Rotate, pick `*5,5,10`, press Enter,
   choose Xaxis, type `*0,0,10` and angle 10. AutoCAD turns the face about the UCS's X, giving a
   volume of 1032.2701; here it uses another axis and gives 1088.1635. Yaxis is wrong the same
   way, and so is Xaxis after UCS Y 90. Enter's `<0,0,0>` at the origin prompt should be the UCS
   origin (after UCS Origin 10,0,0), not the WCS's.»
4. «The solid primitives forget their defaults after NEW or OPEN. Draw a BOX by Length (10, 6,
   4), a CYLINDER (radius 5, height 8), a TORUS with tube radius 1 and a PYRAMID set to 6 sides
   Inscribed. Then start a new drawing, or open one, and run BOX by Length again. AutoCAD 2027
   still offers <10.0000>, <6.0000> and height <8.0000>, TORUS still offers its tube <1.0000>,
   and PYRAMID still says 6 sides: these are session values, and only CONE's top radius goes back
   to 0. Here they are all reset, and TORUS's tube diameter prompt offers no default at all.»

Lo que hay que saber de cada una:

- **La 2**: en el padre fallan además p112 y p117, del mismo commit, que la regla del padre
  contradecía («a transparent command run since a step goes back with it»): se juzga solo p125.
- **La 3** viene de un commit de review grande (29 archivos, +714/−134); el encargo y el juez solo
  tocan SOE-12 y SOE-20. En el padre fallan 24 tests del archivo entero: siempre con el filtro.
- **Suplentes**, sin comprobar: `85fadd42` (las primitivas no movían LASTPOINT; «LASTPOINT is
  the runtime's») y `a7c84dba` (SLICE, Surface sin resaltado al pasar; Pick feedback, commit
  grande). Descartada `791ada7e`: su pasaje lo añadió el mismo arreglo.

**El ejecutor**: un script en `scripts/knowledge/`, por escribir cuando el dueño dé la palabra (una
sesión corta). Por cada tarea, variante y repetición, en serie y alternando el orden de las
variantes (con, sin, sin, con), para que la carga de la máquina o la hora no caigan en una sola:

1. **El clon**: `git init` en un directorio de `mktemp -d -p ~/.cache` (en el disco de `/home`:
   `cp -al` no cruza a `/tmp`, que es otro sistema de archivos) y
   `git fetch --depth 1 file://<repo> <padre>`, con el hash entero (uno corto no se encuentra),
   luego `git checkout FETCH_HEAD`. Sin historia: ni `git log` ni `git show` llegan al arreglo.
   `node_modules` como lo copia el hook de worktree (`cp -al` del árbol principal, sin `.cache` ni
   el `.package-lock.json` oculto); los enlaces de los workspaces son relativos y resuelven al
   código del clon. Sin `research/`: las tareas no sondan AutoCAD. Probado el 24/11 con la tarea 1:
   un commit en el clon, el arreglo inalcanzable, `cp -al` en 2 s y su juez fallando 1 de 296.
2. **Los hooks**: el `.claude/settings.json` del clon pierde `SessionStart` (el hook de sesión
   reparte trabajo real, la tanda de Google con el Chrome del dueño o la revisión de dependencias,
   y `reap.mjs` cierra procesos de la máquina) y `WorktreeCreate`/`WorktreeRemove`. Se quedan el
   registro de cargas, que escribe en el clon y dice si `cad-tools.md` cargó, el guard de git y el
   formato. `--bare` no sirve: salta también `AGENTS.md` y las reglas, y `--setting-sources user`
   tampoco: sin la fuente `project`, Claude Code no carga las reglas del proyecto.
3. **La ejecución**: `claude -p "<encargo>" --output-format json --model claude-opus-5-5
   --permission-mode bypassPermissions --no-session-persistence`, en el clon, con un tope de 60
   minutos. Al encargo se le añade una línea igual para todas: «Work directly in this checkout: no
   worktree, no commit, no push.»
4. **El juez**, después, en el clon: los archivos de test del commit real copiados encima
   (`git show <arreglo>:<test>` desde el repo), y deben pasar los tests que fallaban en el padre;
   además `npm run typecheck`, `npm run build -w cad` (el test de knowledge cita archivos que
   generan esos dos), `npm run lint` y `npm test` en verde. Acierto es todo eso.
5. **Lo que se guarda** por ejecución, en un JSONL fuera del repo: tarea, variante, repetición,
   acierto y qué falló, la duración, los turnos, los tokens de entrada, salida y caché y el coste
   del JSON de `claude -p`, si `cad-tools.md` cargó (el registro del clon) y el tamaño del diff.

**Cómo se lee**: 8 ejecuciones por variante. Si _sin_ acierta igual y gasta menos, la poda de §4
tiene apoyo; si falla en las tareas cuyo pasaje cubre la regla, la regla se queda y el banco
crece. Una diferencia de una ejecución es ruido.

## 4. La poda que espera a la medida

Lo que la auditoría propone quitar y el triaje dejó aquí, porque quitar sin medir es apostar:

- **Enumeraciones y descripción de código** (§2.4: unos 45 KB de 172), empezando por
  `cad-runtime.md`, `docs.md` y `marketing.md`, las más descriptivas. Este triaje ya quitó las que
  estaban mal o duplicaban un test.
- **Un dueño por hecho**: el catálogo como única fuente de palabras (en `AGENTS.md`,
  `cad-engine.md` y `cad-catalogs.md`), `/draw?drawing` en tres reglas.
- **La tabla de capas** de `cad-engine.md`, que duplica la de `cad/entryPoints.test.ts`.
- `annex-probes.md`: el diario de trampas por review, que según `knowledge.md` va al commit;
  `engine-package.md`: la crónica de la publicación en npm y el procedimiento de primera
  publicación, que es una skill.
- Partir `autocad-research` (uso diario frente a instalar paquetes de idioma), y las dos skills
  que el historial pide (publicar una sesión; sondar fuera de una review).

## 5. Las métricas del test

La auditoría propone cambiar los topes de `test/knowledge.test.ts`: un tope al total de reglas y
otro a la unión de reglas que carga un commit real (calculada desde `git log`), en lugar del tope
por archivo, que empuja a escribir en telegrama. Va con el banco porque fijar el número nuevo
necesita saber qué cuesta de verdad; mientras tanto los topes actuales siguen.

## 6. Otras medidas pendientes

- **Delegar cada bloque de una review en un subagente** (plantilla §8): si sigue compensando con
  la ventana de 1M. Se mide con dos reviews pequeñas, una de cada forma.
- **`/doctor prompt-audit`**: segunda opinión barata sobre instrucciones obsoletas o
  contradictorias. Es un comando de la interfaz: lo lanza el dueño cuando quiera.
- **Un test que exija que cada archivo citado en el cuerpo de una regla la cargue por sus
  `paths:`**, y cerrar los dos puntos ciegos del test de citas (§2.9): ninguno ha dado un fallo.
