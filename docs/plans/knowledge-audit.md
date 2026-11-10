# Auditoría del knowledge que el repo da a sus agentes

> **Estado:** informe del 10/11/2026, hecho con Fable 5.2 a petición del dueño, y triado el mismo
> día (§8): lo aceptado que no depende de medir está aplicado, y lo que depende de medir es el
> brief `docs/next-knowledge-eval.md`. El texto de §1 a §7 es el original, sin tocar.

Objeto: `AGENTS.md`, `.claude/` (14 reglas, 10 skills, 2 hooks, settings), `.githooks/` y
`test/knowledge.test.ts`. Escrito en español porque es un documento para el dueño, como los
briefs.

## 1. Veredicto

El sistema es bueno y está por encima de lo que se publica como buena práctica en varios puntos
(§3). Lo que dice es verdad en un 90 % y casi nunca cita algo que no exista. El gate funciona: las
33 últimas ejecuciones de CI están en verde.

Tiene cuatro problemas de fondo, por este orden:

1. **Nadie sabe qué reglas cambian el comportamiento de un agente.** El knowledge solo tiene un
   mecanismo para crecer y un tope en bytes que ya está saturado. Con un modelo nuevo esto es lo
   que más importa, y la guía oficial de Fable 5.2 pide justo esa revisión.
2. **Varias sesiones comparten un solo árbol de trabajo.** Es la decisión que más cuesta cada día
   y la que más prosa defensiva genera. Un tercio de las sesiones acaba montando un worktree a
   mano para poder hacer commit.
3. **Las reglas que no admiten excepción y solo viven en prosa son las que el código incumple.**
   Las que impone el compilador, un test o un hook se cumplen todas.
4. **Una cuarta parte de las reglas describe el código** en vez de decir lo que el código no puede
   decir, contra la propia metarregla. Ahí está casi todo lo falso.

No puedo afirmar que el volumen de reglas perjudique a Fable 5.2: no hay medida, ni aquí ni en la
literatura, que lo demuestre para este caso (§4.1). Lo que sí está probado es que no hay forma de
saberlo, y que la parte descriptiva se pudre.

## 2. Hallazgos, por lo que más importa

### 2.1 El knowledge solo sabe crecer y no se mide si funciona

**Prueba.**

- **Los topes están saturados.** `test/knowledge.test.ts` los llama "ratchets that only go down".
  Hoy `AGENTS.md` mide 9,94 KB de 10; `cad-tools.md`, `template.md` y `annex-probes.md` miden
  25,00 KB de 25; `cad-runtime.md`, 24,98; el p90 por archivo es 52,0 KB de 52. Las constantes no
  se han bajado desde el 20/10 (`git log -G'MAX_KB = ' -- test/knowledge.test.ts`).
- **El total no tiene tope y crece.** `.claude/` más `AGENTS.md` pasaron de 248 KB el 21/10 a
  360 KB el 10/11: un 45 % más en veinte días. Lo que no cabe en un archivo al tope se va a otro
  archivo o a un anexo.
- **El tope en bytes comprime en vez de podar.** Los archivos al límite están escritos en
  telegrama. Ejemplo de `cad-runtime.md`: "Ctrl+S, O, 0, 1, 9, Y, C, X, V, Shift+C, A, the top
  bar's Undo and file buttons, the Default menu's are `^C^C`". Esa frase además es falsa en parte
  (§2.4).
- **La métrica mide la unidad equivocada.** El test mide KB de reglas por archivo fuente (mediana
  23,9; p90 52,0). Un agente no trabaja un archivo, trabaja un cambio. Sobre los 60 últimos
  commits `fix`, los archivos tocados cargan una mediana de **87 KB de reglas (7 reglas)**, unos
  22.000 tokens; sobre los 60 últimos `feat`, 55 KB de mediana y 157 KB en el p90. Es un mínimo:
  no cuenta los archivos que se leen sin tocarse, ni las skills.
- **Solo hay bucle de alta.** El paso 3 de `finish-feature` manda añadir a la regla lo que el
  trabajo enseñó. La baja depende de que alguien note que una regla es falsa. 333 de los 862
  commits (39 %) tocan archivos de knowledge; 241 tocan reglas.
- **No hay ninguna evaluación** de que una regla, una skill o `AGENTS.md` cambien lo que hace un
  agente. Tampoco registro de qué reglas se cargan en cada sesión.
- **La guía oficial del modelo lo pide.** "When you migrate to Claude Fable 5.2, review your
  prompts. In Anthropic's testing, some instructions written for earlier models raised cost, caused
  side effects, or no longer had an effect." Y: "Skills developed for prior models are often too
  prescriptive for Claude Fable 5 and can degrade output quality. Review and consider removing
  older instructions if default performance is better." [A9, A8b]
- **La regla de corte oficial** coincide con la metarregla de `knowledge.md`: "Could it find this
  by reading the code? Would it actually go and look? If both are yes, leave it out." [A1]

**Lo que haría.**

1. **Un banco de evaluación sacado del propio historial**, que es la inversión principal de este
   informe. El repo tiene la materia prima ideal: cada hallazgo de una review de comando tiene su
   sonda con id, su test y su commit. Una tarea es: el repo en el commit padre (clon superficial,
   para que el agente no encuentre la solución en `git log`), el texto del hallazgo como encargo y
   los tests del commit real más el gate como juez. Se ejecuta sin interfaz en un worktree con
   variantes: knowledge completo, sin la regla X, con la regla X adelgazada. Se mide acierto,
   tokens y tiempo. Empezaría con 10 tareas y dos variantes (con y sin las tres reglas de 25 KB),
   y lo repetiría en cada salto de modelo. Anthropic recomienda "20-50 simple tasks drawn from real
   failures" [A13]; el estudio de ETH concluye lo mismo para los archivos de contexto [E1].
2. **Cambiar las métricas del test**: tope al total de reglas (hoy 172 KB, bajando) y a la unión
   por commit real, calculada desde `git log`, en lugar del tope por archivo, que es el que fuerza
   el telegrama.
3. **Registrar qué reglas se cargan** en cada sesión con un hook `InstructionsLoaded` (se dispara
   para las reglas, no para `AGENTS.md` [A2]). Una regla que carga en el 90 % de las sesiones y
   otra que no carga nunca piden decisiones distintas.
4. **Pasar `/doctor prompt-audit`** como segunda opinión: "flags instructions that were written
   for older models, point at files that no longer exist, or contradict each other" [A1]. No he
   podido ejecutarlo desde esta sesión.
5. Mientras no haya banco, podar lo que ya está probado que falla: §2.4.

### 2.2 Un solo árbol para varias sesiones

**Prueba.** Medido sobre las 151 transcripciones locales de sesiones desde el 20/10
(`~/.claude/projects`, 889 MB, 28.028 llamadas a Bash):

| Qué                                                              | Cuánto                         |
| ---------------------------------------------------------------- | ------------------------------ |
| Sesiones que crean un worktree a mano (sin contar `deps-review`) | 51 de 151 (34 %)               |
| `git worktree add` para pasar el gate en limpio                  | 66 llamadas                    |
| `git commit --no-verify`                                         | 31, en 18 sesiones             |
| `git stash` que guarda cambios en el árbol principal             | 39, en 19 sesiones             |
| Sesiones donde el agente habla de "otra sesión"                  | 84 de 151 (56 %)               |

- De los 31 `--no-verify`, 24 tienen a la vista un paso de worktree justo antes, que es la
  excepción que `AGENTS.md` permite. Los otros 7 no he podido confirmarlos (miro solo las seis
  llamadas anteriores).
- **El gate prueba un árbol que no es el que se confirma.** `.githooks/pre-commit` ejecuta los
  checks sobre el directorio de trabajo, no sobre el índice. Con "stage only your own files or
  hunks", lo probado incluye cambios ajenos sin confirmar y lo confirmado no. CI solo ve la punta
  de cada push, así que un commit intermedio roto pasaría sin que nadie lo vea. No he encontrado
  ninguno: es un agujero estructural, no un incidente observado.
- **La pila de `git stash` es una por repositorio**, compartida entre sesiones y worktrees. Casi
  todos los usos vistos guardan un archivo propio para comparar antes y después, pero un `pop`
  de una sesión puede sacar lo que guardó otra.
- **La prosa que existe solo por esto**: el párrafo "Several sessions may work in this tree at
  once" de `AGENTS.md`, el paso 6 de `finish-feature`, el texto del hook sobre checkpoints que
  revierten en silencio, "nothing waits uncommitted" en la plantilla de reviews, la trampa de
  `GIT_DIR` en `testing.md`, y el aviso de `deps-review` de que la instalación limpia borra
  `node_modules` bajo las demás.
- **El repo ya lo tenía previsto**: `.prettierignore` reserva `.claude/worktrees/`, que está
  vacío, y las sesiones ya crean copias hermanas por su cuenta (`../mellowcad-deps`, y otras
  vistas en las transcripciones).
- **Es la posición minoritaria.** "When you have separate pieces of work going at once, give each
  its own checkout so the edits can't collide." [A1] La documentación de worktrees lo describe
  como el modo de aislar sesiones paralelas [A6]; OpenAI hizo su app "bootable per git worktree"
  [O1]. La única voz en contra que encontró la búsqueda es de 2025 [P10].

**Lo que haría.** Un worktree por sesión, por defecto.

- Arranque con `claude --worktree <nombre>`; un `.worktreeinclude` para `.env.local`; un enlace a
  `research/`, que está fuera de git y es donde resuelven las sondas que citan las reglas;
  `node_modules` por enlace o por `npm ci`, y un puerto propio para el servidor de desarrollo.
- Aterrizaje: rebase sobre `main`, gate en el worktree (ahora sí prueba lo que confirma) y avance
  rápido de `main`. El árbol principal queda para el dueño, su servidor y el push.
- Con eso se borra la prosa de la lista anterior y la excepción de `--no-verify`, que pasa a
  poder denegarse sin más (§2.3).
- **El coste, sin adornos:** los conflictos en los archivos calientes (`cad/locales/en.json`, las
  entradas de `docs/coverage/`, las snapshots, las reglas al tope) aparecen al hacer rebase en
  vez de en vivo. Dos sesiones sobre el mismo comando chocan igual que hoy.

### 2.3 Lo que no admite excepción sigue en prosa

"If something has to happen every time, make it a hook, a deny rule, or a managed setting.
`CLAUDE.md` is for guidelines, and Claude is allowed to decide a guideline doesn't apply." [A1]

**Prueba.** El repo ya lo ha vivido: la regla de no poner `Co-Authored-By` era prosa, quince
commits la incumplieron, se reescribió el historial y hoy lo impide `.githooks/commit-msg`. Ese es el
arreglo correcto, y falta repetirlo donde el contraste con el código encontró lo mismo:

| Regla en prosa                                                          | Qué hace el código                                                                       | Verificado por |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| "Never `toEqual` on a `Vec2`" (`testing.md`)                            | 117 `toEqual(p(…))` o `toEqual({ x:` en tests                                            | mí             |
| "never `Number()`" para un número tecleado (`cad-tools.md`)             | 4 usos: `ZoomTool.ts:389`, `ColorTool.ts:207`, `SystemVariableTool.ts:293` y `:318`      | mí             |
| ESLint falla con un listener de teclado en `components/`, `app/` o `packages/` (`cad-runtime.md`) | El selector solo cubre `packages/editor/src/**/*.tsx` y `packages/react/src/**`; `components/docs/docs-search.tsx:61` escucha `keydown` y pasa | mí |
| "Every creating command has a row in `FROM_SCRATCH` or `DERIVED`"       | El test recorre las filas que hay; nada exige que estén todas (faltan SCALE Copy, las booleanas, FILLET y CHAMFER) | agente |
| Un preview reutiliza un id fijo, nunca uno por fotograma                | `SplineTool` acuña un id por cada `scene()`: 30 ids en 30 llamadas, por sonda            | agente         |
| `normalizeAngle`, "never `deg + 360` (ESLint)"                          | El selector solo ve el ternario con 360; hay unas diez normalizaciones a mano           | agente         |
| "`i18n/routing.ts` is the only list of languages"                       | `components/marketing/commands-section.tsx:54` fija `["en", "es", "pt-BR", "fr"]`        | mí             |
| "never `--no-verify`", con su excepción                                 | 31 usos (§2.2)                                                                           | mí             |

En cambio, lo que impone una máquina se cumple entero: ninguna herramienta muta el documento sin
un `Command` (el tipo `DocumentReader` de `ctx.document` lo impide), la tabla de capas
(`cad/entryPoints.test.ts`), la deriva de los catálogos, las versiones de las cabeceras.

**Lo que haría.**

- Para cada fila, decidir si la regla es real. Si lo es, un lint o un test cuyo mensaje enseñe el
  remedio (los de `eslint.config.mjs` ya citan su regla: es el patrón bueno [O1]). Si 117 usos de
  `toEqual` no han causado un fallo, puede que la regla sobre o que deba acotarse a valores
  calculados.
- Corregir la prosa donde el lint cubre menos de lo que dice.
- Denegar `git commit --no-verify` en `permissions.deny` una vez haya worktree por sesión.
- `permissions.ask` con `Bash(git push *)` no casa con `git -C . push`, según la documentación de
  permisos [A-perm, no releído por mí]. La barrera real del push es la costumbre; si debe ser
  dura, un hook `PreToolUse`.

### 2.4 Lo falso está en lo que describe el código

**Prueba.** Tres agentes contrastaron las once reglas grandes frase por frase; después verifiqué
en el código las que cito aquí.

| Reglas                                                   | Afirmaciones comprobadas | Se sostienen | Describe código |
| -------------------------------------------------------- | ------------------------ | ------------ | --------------- |
| `cad-engine`, `cad-runtime`, `cad-scene`                 | ~119                     | ~104         | 28 %, 40 %, 15 % |
| `cad-tools`, `cad-catalogs`, `engine-package`, `testing` | ~190                     | ~173         | 27 %, 12 %, 25 %, 15 % |
| `ui`, `marketing`, `docs`, `i18n`                        | ~180                     | ~164         | 15 %, 32 %, 47 %, 17 % |

Unas 440 de 490 (90 %). Ponderado por tamaño, **unos 45 KB de los 172 son descripción**. Los
recuentos son aproximados y de los agentes; el patrón lo he comprobado yo: toda enumeración
("los cuatro memos", "los listeners", "los Ctrl") estaba incompleta, y las reglas escritas como
restricción con su razón se sostienen casi siempre. Es lo que `knowledge.md` ya dice que encontró
la auditoría del 20/10.

Falso u obsoleto hoy, verificado por mí:

- `cad-runtime.md`: "The class is kept small by hollowing methods out". `CadRuntime.ts` tiene
  8.042 líneas; sus diez hermanos `runtime*.ts` suman 2.358.
- `cad-runtime.md` y `cad-tools.md`: el grupo de undo lo abre y cierra `switchTool`
  (`cad/application/CadRuntime.ts:1319`), no `setActiveTool`.
- `cad-engine.md` y `AGENTS.md`: los memos. `AGENTS.md` dice "no hidden state but the id
  counters"; la regla añade cuatro; `geometry/` y `domain/` tienen ocho archivos con `WeakMap`.
- `cad-scene.md`: "no kerning" en los presentadores. Solo `CanvasScenePresenter.ts:182` lo
  desactiva; el de SVG no, así que las figuras de la landing llevan el kerning del navegador.
- `cad-tools.md`: `ctx.undoHistory` "reached only by `UndoTool` and `MredoTool`". También lo usa
  `PolylineTool.ts`, y la propia regla lo describe más abajo.
- `i18n.md`: "Never claim DWG/DXF … until they exist". Abrir DXF existe y `messages/en.json` lo
  afirma (`today5`, `a5`, `fileBody`).
- `ui.md`: la cabecera dice que el layout cede ante AutoCAD (brief `docs/next-autocad-ui.md`),
  pero el cuerpo sigue prescribiendo las barras de 36 px y el panel con pestañas que el brief
  revoca, sin marcar qué está revocado.

Del contraste de los agentes, sin releer yo: `runCommand("_QSAVE")` que ningún botón llama
(`ui.md`), el `commands.mdx` que es `commands/index.mdx` (`docs.md`), `invokeOption` que también
devuelve `unhandled` (`cad-catalogs.md`), el harness cuyo almacén y archivos son `null` por
defecto (`testing.md`), y los absolutos con excepción legítima no escrita: "nothing else parses or
builds it" (MTEXT), "moves only by `transformEntity`" (sólidos), "never `document.getEntities()`"
(`insertionProvider`), "Every `Select objects:` is an `ObjectSelector`" (AREA).

Ese último grupo importa más con este modelo. La guía de Fable 5.2 dice que aplica las reglas
"as written" y pide "Write the exception into the rule" y "rewrite absolute rules so that they
state their scope and reason" [A9]. Las reglas contienen 227 "never", 147 "only" y 124 "every".

**Un dueño por hecho** tampoco se cumple: el catálogo como única fuente de palabras está en
`AGENTS.md`, `cad-engine.md` y `cad-catalogs.md`; un comando igual a un paso de undo, en
`AGENTS.md`, `cad-runtime.md` y `cad-tools.md`; `/draw?drawing`, contado en tres reglas.

**Los `paths:` tienen huecos que el test no ve.** `marketing.md` carga con `content/**`: 1.287
archivos, de los que 1.155 son territorio de `docs.md`; cada nota de comando arrastra 16 KB de
landing. Al revés, 23 archivos fuente no cargan ninguna regla, entre ellos
`components/draw-editor.tsx`, que `ui.md` describe, y `scripts/locales/`. `i18n.md` no carga en
`components/marketing/` (sus `paths:` solo nombran `components/language-links.tsx`), donde se
aplican sus "Claims and copy".

**Lo que haría.** Una pasada por regla, en este orden: corregir lo falso; borrar las
enumeraciones o reducirlas a "checked by X" donde ya hay test (la tabla de capas duplica `LAYERS`
del test); escribir la excepción y la razón en los absolutos que la tienen; dejar un dueño por
hecho; ajustar los globs. Estimo que salen 40–50 KB sin perder ninguna trampa. Y un test nuevo:
que cada archivo que una regla cita en su cuerpo la cargue por sus `paths:`.

### 2.5 El hook de sesión reparte trabajo, no solo estado

**Prueba.**

- `.claude/hooks/session-start.mjs` manda hacer la revisión de dependencias "before the task you
  are given" y enviar a Google la tanda de indexación "at the start, in the background",
  arrancando el Chrome del dueño. El encargo es del dueño (6/11) y está documentado en
  `marketing.md`; el mecanismo es el punto débil: cualquier sesión, sea cual sea su tarea, y sin
  reclamo como el de `deps-review`, así que dos sesiones que arrancan a la vez ven la misma tanda.
- `docs/next-seo.md` §7 se contradice: abre con "Ninguna sesión publica, envía ni cambia nada
  fuera del repo" y más abajo dice "La cola la llevan las sesiones, no el dueño".
- **Un fallo pequeño, visible en esta misma sesión:** el estado de cada brief se corta en el
  primer punto, también el de un nombre de archivo. El hook imprimió "va después de la visibilidad
  (docs/next-seo.", cortado ahí. La expresión `[^.]+\.` está en `.claude/hooks/session-start.mjs:118` y en
  `test/knowledge.test.ts:354`.
- El matcher del hook es `startup|resume|compact|clear`; hoy existe también `fork` [A-hooks]. El
  de `PostToolUse` nombra `MultiEdit`, que ya no es una herramienta.

**Lo que haría.** El hook informa del estado y nada más. Las tareas periódicas (dependencias,
cola de indexación) pasan a una rutina programada, que no secuestra la sesión de otra tarea ni
compite con las demás; la guía de Fable 5 apunta en esa dirección para el trabajo largo [A8b]. No
he leído la documentación de rutinas de Claude Code: es una opción a comprobar, no una receta.

### 2.6 Lo que se pierde al compactar

**Prueba.** 15 de 151 sesiones compactaron. Según la documentación [A3]:

- Una regla con `paths:` entra en el historial y la compactación la resume con todo lo demás;
  vuelve cuando se toca otra vez un archivo que casa.
- El cuerpo de una skill invocada se reinyecta, con tope de 5.000 tokens por skill y 25.000 en
  total. El test ya limita `SKILL.md` a 16 KB por esto.
- Los anexos de una skill son archivos leídos, no cuerpo de skill: no vuelven. `command-review`
  pide leer entera una plantilla de 25 KB y sus anexos (unos 72 KB), y tras compactar solo vuelve
  el `SKILL.md` de 32 líneas.

El diseño ya lo mitiga bien: una sesión nueva por grupo de bloques y el plan en un archivo.

**Lo que haría.** Poco: que el hook, cuando la fuente es `compact`, recuerde reabrir los anexos de
la skill en curso. Y saber que un `CLAUDE.md` o un `CLAUDE.local.md` en la raíz haría que
`AGENTS.md` dejara de leerse [A2]: merece un test de una línea.

### 2.7 Skills: correctas en lo que citan, con huecos en lo que listan

**Prueba** (contraste de un agente sobre los 17 archivos; verificadas por mí las cuatro primeras).
Todas las rutas, scripts y símbolos citados existen. Lo que falla es lo que el test no puede ver:

- **Contradicción en `command-review`**: `SKILL.md` dice que las mejoras de la plantilla se
  aplican "only after the owner confirms them"; `template.md` §9, que el dueño renunció a esa
  espera el 21/10.
- **`command-page` quedó atrás del francés**: solo nombra `en.json`, `es.json` y `pt-BR.json`;
  `fr` está `live` desde el 9/11.
- **El gate tiene tres versiones**: `finish-feature` coincide con el hook, `new-command` lista
  tres de siete checks y `add-language` dice `npm test`, que es justo lo que el comentario del
  hook señala como causa de nueve commits rechazados por CI.
- **`deps-review` lleva un `rm -rf node_modules .next` sin ruta**, que depende de un `cd` a
  `../mellowcad-deps` hecho noventa líneas antes.
- **Huecos de `new-command`** frente a cinco comandos recientes: no nombra `registerCommands`,
  las páginas generadas de `content/docs/`, el techo de `cad/size.test.ts`, `cad/api.md` ni el
  changeset; no dice qué pasos se salta una variable de sistema, ni cubre un comando sin
  herramienta (unos cuarenta viven así).
- **El disparador va enterrado**: las descripciones enumeran el contenido antes del "Use when"
  (en `command-review`, en el carácter 471 de 558).
- **Se usan**: `autocad-research` aparece en 73 sesiones, `finish-feature` en 61, `command-review`
  en 48, `new-command` en 25. Un estudio de Vercel midió skills que no se invocaban en el 56 % de
  los casos [E10]; aquí `finish-feature` se abre en 61 sesiones frente a 341 commits `feat` o
  `fix` en el mismo periodo, aunque una sesión hace muchos commits y no sé cuántas debieron
  abrirla.

**Lo que haría.** Corregir las contradicciones; completar `new-command` y `finish-feature` con lo
que los commits tocan de verdad; poner el disparador al principio de cada descripción; partir
`autocad-research` (uso diario frente a instalar paquetes de idioma); sacar de
`annex-probes.md` el diario de trampas por review, que es historia y según `knowledge.md` va al
commit. Faltan dos skills que el historial pide: publicar una sesión (hoy repartido entre el
hook, `marketing.md` y el brief de SEO) y sondar fuera de una review.

### 2.8 Subagentes y revisión

**Prueba.** 470 lanzamientos de subagente en 65 sesiones; 418 son del tipo genérico, con el
encargo reescrito cada vez. No hay ninguna definición propia en .claude/agents. La plantilla de
reviews manda que un subagente implemente cada bloque. `finish-feature` no tiene ningún paso de
revisión por alguien que no escribió el cambio; solo las reviews de comando la tienen.

Anthropic ha retirado dos consejos que explican ese diseño: "Use subagents to protect your context
window" ("Running out of context is rarely the problem anymore") y "Delegate to a subagent for a
better answer" ("A fresh reviewer does help, because it hasn't seen your reasoning, which is a
different thing from delegating") [A1]. La guía de Fable 5.2 lista "Standing instructions to
delegate" entre lo que revisar [A9].

**Lo que haría.** Medir con el banco de §2.1 si implementar cada bloque en un subagente sigue
compensando con una ventana de 1M. Y añadir a `finish-feature`, para `feat` y `fix` del motor,
una revisión en contexto nuevo (`/code-review`) antes del commit. No definiría agentes propios
hasta ver qué encargo se repite de verdad.

### 2.9 Menores

- **`description:` en las reglas.** Claude Code solo lee `paths` ("any other field is ignored
  without an error" [A2]) y la documentación de VS Code dice que Copilot también casa una regla
  de Claude por `paths` [A-vsc]. La frase de `knowledge.md` "what Copilot loads a rule by" no
  tiene apoyo. El campo sigue sirviendo para el índice con `grep`.
- **El bloque de Next.js abre `AGENTS.md`**, el sitio más visible, para algo ajeno a casi todo el
  trabajo. El generador reemplaza el bloque donde estén sus marcadores
  (`upsertAgentRulesBlock`), así que puede ir al final.
- **Idioma.** `AGENTS.md` dice que todo el knowledge del repo está en inglés; los briefs
  (`docs/next-*.md`, `docs/plans/seo/`) están en español y el test fija `> **Estado:**`. Es
  razonable; falta decirlo.
- **`docs/next-seo.md` pesa 62 KB** y su §7 es un diario fechado, contra "What was done …: the
  commit message".
- **`engine-package.md`** lleva una crónica de la publicación en npm y un procedimiento de
  primera publicación: historia y skill, respectivamente.
- **El test de citas tiene dos puntos ciegos** que hoy no fallan: no comprueba nombres de archivo
  sin carpeta ni rutas relativas a `cad/` (`domain/x.ts`), y un símbolo vale si la palabra
  aparece en cualquier texto del repo. Pasé una comprobación más estricta sobre los 4.126 spans
  de código de los 31 archivos: los 269 nombres y rutas que el test no mira existen todos (lo
  que no resuelve son módulos externos, clases de Tailwind, `research/` y ausencias deliberadas
  como "No `proxy.ts`").
- **Las sondas citadas no viajan.** Las reglas citan 56 ids (`pline/p26`); las entradas están en
  `scripts/research/probes/`, pero las salidas viven en `research/`, fuera de git. Una sesión en
  la nube o un clon nuevo no puede abrirlas.
- **Ramas viejas**: las cuatro ramas de fases de i18n (phase-0 a phase-3) están fusionadas, y
  `worktree-agent-a498997d3f29c107f` lleva un commit fuera de `main` desde el 29/10. Borrarlas es
  cosa del dueño.
- **`Read(./.env.local)` en `deny`** frena las herramientas de archivo y los `cat` que Claude
  Code reconoce, no un script que abra el archivo; para eso está el sandbox [A-perm].

## 3. Lo que funciona y no tocaría

- **La sección de fidelidad a AutoCAD de `AGENTS.md`.** Es criterio de producto que ningún código
  puede decir, con ejemplos que frenan el impulso de "mejorar". Lo mejor del archivo.
- **`AGENTS.md` como índice corto** que apunta a reglas, skills y cobertura. Es lo que describe
  OpenAI: "we treat it as the table of contents" [O1].
- **El test de citas.** OpenAI lo presenta como práctica avanzada: "Dedicated linters and CI jobs
  validate that the knowledge base is up to date" [O1]. Aquí existe y aguanta una comprobación más
  dura que la suya.
- **Las cabeceras "Verified against" con paquete y versión**, que se ponen en rojo al actualizar.
  No lo he visto en ninguna fuente y es mejor que lo que recomiendan.
- **`Enforced` en `new-command`**: distinguir el paso que un test impone del que depende de
  acordarse.
- **El gate es el mismo en el hook y en CI**, y funciona: 33 de 33. Tarda unos tres minutos
  (12 s de tipos, 15 s de lint, 10 s de formato, 1 s de docs, 110 s de tests con cobertura, más
  las builds de los paquetes, que no medí). No lo tocaría, tampoco para los commits de solo docs.
- **El proceso de `command-review`**: sondas con id, "assume there are differences", pasada
  adversarial, sesiones nuevas por bloque, el plan que encoge a un índice con el original en
  `git show`, y la plantilla que se corrige al cerrar cada review. 31 planes lo prueban.
- **`deps-review`**: estado en un JSON, reclamo por rama, lógica del hook con test.
- **"Decide, don't ask"** con lo destructivo excluido dentro de la propia regla. Es la forma que
  recomienda la guía del modelo [A9].
- **`autoMemoryEnabled: false`.** Un solo almacén, versionado y revisado. La guía de Fable 5.2
  avisa de que las cautelas se acumulan "wherever context carries over: memory, notes, instruction
  files" [A9]; aquí solo hay un sitio que vigilar.
- **`skillOverrides`** apagando las skills ajenas al proyecto, y los mensajes de ESLint que citan
  la regla que los explica.

## 4. Qué hace hoy quien mejor trabaja con agentes, y aquí no se aprovecha

Fuentes en §6. Verifiqué las citas literales de A1–A9, A13, E1, E3, E5, E10 y O1 abriendo cada
página; lo demás viene de la búsqueda de un agente y lo marco.

### 4.1 Lo que dice la evidencia, sin exagerarla

- **Los archivos de contexto no mejoran de forma medible la tasa de acierto.** ETH Zurich: no
  suben en general el éxito de las tareas y encarecen la inferencia más de un 20 %; sirven para
  "non-standard coding practices", y los resúmenes del repositorio "are not helpful" [E1]. Una
  réplica con Claude Code y Codex: "Context strategy does not measurably move correctness on
  either agent" [E3]. Límites: tareas de Python, archivos de unas 600 palabras, se mide resolver
  la tarea y no respetar convenciones. No dicen nada directo de 87 KB de reglas de fidelidad.
- **El tamaño por sí solo no está probado como dañino.** Anthropic afirma sin datos "target under
  200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence" [A2]. Un
  estudio factorial sobre Claude Code no detecta efecto del tamaño, la posición ni las
  contradicciones, y sí una caída del cumplimiento a medida que avanza la sesión [E5].
- **Conclusión para este repo:** la pregunta útil no es si las reglas son largas, sino si cada
  una cambia algo. Eso solo lo contesta una evaluación.

### 4.2 Prácticas con consenso que aquí faltan

1. **Evaluar las instrucciones**, con tareas sacadas de fallos reales y una línea base sin la
   instrucción, y repetir al cambiar de modelo [A13, E1; A10 y A15 según el agente]. Aquí: nada.
   Es §2.1.
2. **Auditar las instrucciones en cada salto de modelo** [A9, A8b; `/doctor prompt-audit` en A1].
   Aquí: esta auditoría es la primera desde el 20/10 y la hizo una persona pidiéndola.
3. **Aislar las sesiones paralelas** [A1, A6, O1]. Aquí: árbol compartido. Es §2.2.
4. **Hook, lint o deny para lo que no admite excepción** [A1, O1]. Aquí: a medias. Es §2.3.
5. **Revisión por un contexto que no vio el razonamiento** [A1]. Aquí: solo en las reviews de
   comando. Es §2.8. Aviso de la misma fuente: "A reviewer that's asked to find problems will
   always find _something_".
6. **Un agente periódico que contrasta la documentación con el código** ("doc-gardening" [O1]).
   Aquí el contraste mecánico existe; el semántico lo ha hecho esta auditoría a mano y encontró un
   10 % de afirmaciones falsas. Menos descripción (§2.4) deja menos que cuidar.
7. **Las transcripciones como fuente.** Las 151 sesiones locales no se usan. En esta auditoría
   dieron en minutos las cifras de §2.2 y de uso de skills; sirven igual para buscar correcciones
   repetidas del dueño y convertirlas en tareas del banco.
8. **Tareas periódicas fuera de la sesión interactiva**: §2.5.

### 4.3 Lo que no adoptaría aunque esté de moda

- **Un hook `Stop` que pase el gate** al acabar cada turno: el gate ya está en el commit, y quien
  lo probó con una suite larga lo cuenta entre lo que no funcionó [P5, según el agente].
- **Marcos de desarrollo dirigido por especificaciones**: los planes y briefs de aquí ya hacen ese
  papel con menos ceremonia [P4, según el agente].
- **Un revisor de otro modelo**: no hay evidencia de que mejore a uno del mismo modelo en contexto
  nuevo [E12, según el agente].
- **Activar la memoria automática**: §3.

## 5. Qué haría yo, en orden

1. **Worktree por sesión** (§2.2), y con él borrar la prosa del árbol compartido y denegar
   `--no-verify`. Es barato y quita una clase entera de fallos.
2. **Corregir lo falso y lo contradictorio** de §2.4 y §2.7, y los fallos pequeños de §2.5 y
   §2.9. Es trabajo de una o dos sesiones y no necesita medida.
3. **Convertir en check las reglas de §2.3** que se decida mantener, y borrar las que no.
4. **Montar el banco de evaluación** con diez tareas del historial y cambiar las métricas del
   test (§2.1).
5. **Podar con el banco**: enumeraciones, duplicados y, donde la medida lo permita, reglas
   enteras. Empezar por `cad-runtime.md`, `docs.md` y `marketing.md`, las más descriptivas.
6. **El hook informa; las tareas periódicas se programan** (§2.5).
7. **Revisión en contexto nuevo en `finish-feature`** y medir si delegar cada bloque sigue
   compensando (§2.8).
8. **Repetir el banco en cada modelo nuevo**, que es la pregunta que motivó este informe.

## 6. Fuentes

Abiertas el 10/11/2026. Las de documentación no llevan fecha.

| Id     | Fuente                                                                                         |
| ------ | ---------------------------------------------------------------------------------------------- |
| A1     | Anthropic, "Best practices for Claude Code": https://code.claude.com/docs/en/best-practices    |
| A2     | Anthropic, "How Claude remembers your project": https://code.claude.com/docs/en/memory         |
| A3     | Anthropic, ventana de contexto y compactación: https://code.claude.com/docs/en/context-window  |
| A6     | Anthropic, worktrees: https://code.claude.com/docs/en/worktrees                                |
| A8b    | Anthropic, "Prompting Claude Fable 5": https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5 |
| A9     | Anthropic, "Prompting Claude Fable 5.2": https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-2 |
| A13    | Anthropic, "Demystifying evals for AI agents", 9/1/2026: https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents |
| A-perm | Anthropic, permisos y sandbox (leído por un agente): https://code.claude.com/docs/en/permissions |
| A-hooks | Anthropic, hooks (leído por un agente): https://code.claude.com/docs/en/hooks                 |
| A-vsc  | VS Code, instrucciones de Copilot (leído por un agente): https://code.visualstudio.com/docs/copilot/customization/custom-instructions |
| E1     | Gloaguen et al. (ETH Zurich), "Evaluating AGENTS.md", v3 del 29/9/2026: https://arxiv.org/abs/2602.11988 |
| E3     | Khatri, "Do Context Files Help Coding Agents?", 28/7/2026: https://arxiv.org/abs/2607.27250    |
| E5     | McMillan, "Instruction Adherence in Coding Agent Configuration Files", 11/5/2026: https://arxiv.org/abs/2605.10039 |
| E10    | Gao (Vercel), "AGENTS.md outperforms skills in our agent evals", 27/1/2026: https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals |
| E12    | Song, "When Does a Second Model Help?", 1/10/2026 (no verificado por mí): https://arxiv.org/abs/2610.01471 |
| O1     | Lopopolo (OpenAI), "Harness engineering", 11/2/2026: https://openai.com/index/harness-engineering/ (devuelve 403; citas leídas en una copia de terceros) |
| P4     | Böckeler, "Understanding Spec-Driven-Development", 15/10/2025 (no verificado por mí): https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html |
| P5     | HumanLayer, "Skill Issue: Harness Engineering for Coding Agents", 12/3/2026 (no verificado por mí): https://humanlayer.dev/blog/skill-issue-harness-engineering-for-coding-agents |
| P10    | Steinberger, "Just Talk To It", 2025 (no verificado por mí): https://steipete.me/posts/just-talk-to-it |

## 7. Cómo se hizo y qué no cubre

- **Leído por mí**: `AGENTS.md`, settings, los dos hooks, `.githooks/`, `test/knowledge.test.ts`,
  el workflow de CI, `knowledge.md`, `testing.md`, `cad-engine.md`, `cad-runtime.md`,
  `cad-tools.md` y las skills `finish-feature`, `command-review` y `new-command`.
- **Medido por mí**: el historial de git, las 151 transcripciones, la carga de reglas por commit,
  la comprobación estricta de citas, el tiempo del gate, el estado de CI.
- **Contrastado por agentes** (cuatro, solo lectura): cada regla y cada skill contra el código.
  Sus porcentajes son aproximados. Releí en el código lo que este informe cita como verificado
  por mí; el resto va marcado.
- **Fuentes externas**: dos agentes las buscaron; comprobé las citas literales una a una en las
  páginas señaladas en §4.
- **No cubre**: no ejecuté AutoCAD ni un navegador, así que no juzgo si las sondas o los
  procedimientos de `autocad-research` y `browser-verify` funcionan; no medí ningún efecto de las
  reglas sobre el comportamiento de un agente, que es justo lo que falta (§2.1).

## 8. Triaje (10/11/2026)

Cada hallazgo contrastado con el código, el historial y la documentación de Claude Code (leída
para esto: hooks, worktrees, permisos, memoria, tareas programadas). **Aceptado** se aplica tal
cual, **adaptado** se aplica con otra forma, **rechazado** lleva la prueba de que lo actual sigue
justificado y **al brief** depende de medir (`docs/next-knowledge-eval.md`). Los commits van uno
por tema, a continuación del original.

### 8.1 El knowledge solo crece (§2.1)

| Hallazgo                              | Veredicto | Por qué                                                                                                                                                                                                                                                                      |
| ------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Topes saturados, total que crece      | Aceptado  | Medido de nuevo: este mismo triaje rozó los topes de `cad-runtime.md`, `cad-tools.md` y la p90 al corregir, y tuvo que quitar enumeraciones para caber. El diagnóstico es correcto.                                                                                          |
| Registro de reglas cargadas           | Aceptado  | `.claude/hooks/instructions-log.mjs` (`InstructionsLoaded`) escribe una línea por regla cargada en un registro del árbol principal, fuera de git; `npm run knowledge:loads` lo resume. Probado en vivo: registró `marketing.md` al leer `lib/site.ts`. No cubre `AGENTS.md`: Claude Code no dispara el evento para él. |
| Banco de evaluación, nuevas métricas  | Al brief  | Dependen de medir. El brief recomienda empezar por el registro y un piloto de 16 ejecuciones antes que el banco completo.                                                                                                                                                    |
| `/doctor prompt-audit`                | Al brief  | Es un comando de la interfaz que una sesión no puede lanzar; lo lanza el dueño.                                                                                                                                                                                              |

### 8.2 Un solo árbol (§2.2)

**Aceptado y adaptado.** Probado antes de implantarlo, en esta sesión y desde la extensión de VS Code:

- **La extensión no tiene `--worktree`**, pero la herramienta `EnterWorktree` funciona a mitad de
  sesión, y con ella los hooks `WorktreeCreate` y `WorktreeRemove`, que se recargan sin reiniciar.
  `claude -w <nombre>` sirve en la terminal.
- **`node_modules` no puede ser un enlace simbólico**: los enlaces de los workspaces de npm son
  relativos (`node_modules/@mellowcad/engine -> ../../cad`) y resolverían el motor del árbol
  principal. Una copia con enlaces duros (`cp -al`) tarda 2 s, no ocupa disco y resuelve cada
  paquete al código del worktree. Lo que se reescribe en el mismo inodo, y escribiría en el de
  `main`, se borra de la copia: las cachés y el `.package-lock.json` oculto de npm.
- **La base es `main` local, no `origin`**: Claude Code parte por defecto de `origin/main`, que va
  por detrás de los commits sin publicar que `main` casi siempre tiene. Por eso el hook
  `WorktreeCreate` propio (`.claude/hooks/worktree-create.mjs`), que además enlaza `research/`.
- **`.env.local` no se copia**: el sitio solo lee de él los tokens de verificación de Google y
  Bing, que el servidor de desarrollo no necesita.
- **El gate dentro del worktree pasa** (2 min 36 s) salvo dos citas que fallaban por el propio
  diseño, ya resueltas: `/research/` con barra no ignoraba el enlace y `.claude/worktrees/` no
  existía en un checkout nuevo (ahora lleva un `.gitkeep`).
- **El servidor de desarrollo y next-devtools**: `next dev -p 3005` en el worktree y otro en el
  árbol principal a la vez, cada uno con su recarga en caliente aislada; `nextjs_index` descubre el
  del worktree y `get_project_metadata` da su ruta. `/draw`, `/es/draw` y `/` responden 200.
- **El aterrizaje no puede hacerse desde el worktree**: Claude Code rechaza un `git -C` dirigido
  al árbol principal desde una sesión aislada. Se sale con ExitWorktree (`keep`) y se hace
  `git merge --ff-only` en el árbol principal; `git worktree remove` sin `--force` acepta el
  worktree con sus enlaces. Está en `finish-feature`, paso 7.
- **El hook de formato fallaba en un worktree**: usaba `$CLAUDE_PROJECT_DIR`, que sigue siendo el
  árbol principal, cuyo `.prettierignore` salta `.claude/worktrees/`. Ahora usa el checkout del
  archivo. Probado.
- **VS Code**: crear un worktree satura el vigilante de archivos (unos 14.000 eventos de
  `node_modules`); VS Code lo registra como aviso, deja de procesar esa ráfaga y sigue.
  `.vscode/settings.json` excluye `.claude/worktrees/` de la búsqueda y del vigilante; que la
  exclusión evite la ráfaga no está comprobado (haría falta recargar la ventana). VS Code se
  reinició durante las pruebas: fue una actualización automática de WSL (la carpeta de WSL en
  Windows cambió a las 11:54:34 y el kernel pasó de 6.18.54.1 a 6.18.58.1), no el worktree.
- **`git stash`**: `AGENTS.md` lo prohíbe ahora; Claude Code ya avisa de que la pila es común.
- **La prosa del árbol compartido**: reescrita en `AGENTS.md`, `finish-feature`, el hook de
  sesión y la plantilla de reviews. Se queda la trampa de `GIT_DIR` de `testing.md`, que no
  depende del árbol compartido, y el aviso de `deps-review`, cuya instalación limpia sigue
  borrando `node_modules` si se hace en el árbol principal.

### 8.3 Lo que no admite excepción (§2.3)

| Regla                               | Veredicto  | Por qué                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `toEqual` en un `Vec2`              | Adaptado   | La trampa es real (`toEqual` compara primitivos con `Object.is`, y `-0` no es `0`), pero los 117 usos comparan puntos que el código copia sin calcular, y ninguno ha fallado. La regla se acota a los puntos calculados; un lint no distingue los dos casos.                                                                                                       |
| `Number()` en lo tecleado           | Adaptado   | Los cuatro usos van detrás de una expresión regular que ya filtra: un entero en COLOR y SETVAR, un decimal en el factor de ZOOM y el punto 2D de SETVAR. El riesgo que la regla evita (`0x10`, que AutoCAD rechaza, `parseDecimalNumber`) no se da. Se escribe la excepción del entero; un lint marcaría también los `Number()` legítimos sobre texto interno. |
| Listeners de teclado y ESLint       | Adaptado   | El lint acierta y la prosa exageraba: el comentario de `eslint.config.mjs` explica que el sitio no tiene runtime por el que enrutar, así que el Ctrl+K de la documentación es suyo. Se corrige la prosa.                                                                                                                                                       |
| Filas de `FROM_SCRATCH` / `DERIVED` | Aceptado   | Ahora es un test: cada comando registrado es fila, variante, probado en otro sitio, sin fijar (FILLET, CHAMFER, SCALE, las tres booleanas, FILLETEDGE, CHAMFEREDGE: una lista que solo baja) o no crea nada.                                                                                                       |
| Id fijo en un preview               | Aceptado   | Confirmado solo a medias: un test nuevo recorre los 148 comandos con uno y dos puntos dados y el cursor moviéndose, y solo SPLINE con dos puntos acuñaba un id por movimiento (con uno, no). Arreglado con un id fijo; el test queda.                                                                                                                         |
| `normalizeAngle` y ESLint           | Rechazado  | Las «unas diez normalizaciones a mano» son el doble módulo (`((a % 360) + 360) % 360`), que no tiene la trampa: un ángulo negativo diminuto acaba en 360 y el segundo módulo lo devuelve a 0. `normalizeSigned` de ROTATE es otro rango. El lint caza justo el patrón peligroso; la prosa se precisa.                                                         |
| `i18n/routing.ts`, única lista      | Rechazado  | `commands-section.tsx:54` no lista los idiomas del sitio sino los idiomas de comandos de AutoCAD (el árabe es idioma del sitio y AutoCAD no tiene comandos en árabe), uno por cada marcador de la frase de `messages/*.json` que los nombra. La prosa se precisa: la lista de idiomas del sitio.                                                                |
| `--no-verify`                       | Aceptado   | Con worktree por sesión no queda excepción. Ninguna regla de permisos ve `-n` dentro de `git commit -anm` ni `git -c core.hooksPath=…`, así que es un hook `PreToolUse` (`.claude/hooks/bash-guard.mjs`, con su test), probado en vivo.                                                                                                                       |
| `git push` y `git -C . push`        | Aceptado   | La documentación de permisos lo confirma: `Bash(git push *)` no para `git -C . push`. El mismo hook pide confirmación ante cualquier forma de push.                                                                                                                                                                                                             |

### 8.4 Lo falso (§2.4)

Todo lo que el informe da por verificado se confirmó en el código y se corrigió: la clase que «se
mantiene pequeña» (8.042 líneas; la regla dice ahora cómo sale el código, no que sea pequeña),
`switchTool`, los memos (ahora «un `WeakMap` sobre una entrada inmutable», sin lista), el kerning
del SVG (aquí el error era del código: el presentador SVG no lo desactivaba; arreglado, sin cambio
en ninguna snapshot), `ctx.undoHistory` en PLINE, el DXF (abrir existe; guardar no), las filas de
`ui.md` que revoca el brief de la interfaz. De lo que el informe marca como no releído, también
confirmado y corregido: `_QSAVE` (ahora `_UCS`, que un botón sí llama), `commands.mdx`,
`unhandled`, el almacén y los archivos del harness. De los absolutos: el editor de MTEXT construye
el contenido con `\P`, `insertionProvider` lee `document.getEntities()` y el `Select objects:` de
AREA es una designación propia: tres excepciones escritas. «Se mueve solo por `transformEntity`»
(sólidos) no lo he podido refutar: queda igual.

**Un dueño por hecho**: aplicado donde sobraba al corregir (el grupo de undo vive en
`cad-runtime.md`; `cad-tools.md` apunta). El resto, al brief: es poda.

**Los `paths:`**: aceptado en parte. `marketing.md` ya no carga con `content/docs/**`,
`content/commands/**` ni `content/exercises/**`, territorio de `docs.md`; `ui.md` carga con
`components/draw-editor.tsx`, que describe. **Rechazado** cargar `i18n.md` en
`components/marketing/`: el texto vive en `messages/`, que sí la carga, y `marketing.md` abre
apuntando a `i18n.md` para la copia. El test de citas cargadas, al brief.

### 8.5 El hook de sesión (§2.5)

- **Pasar las tareas periódicas a una rutina programada: rechazado.** La tanda de indexación usa el
  Chrome del dueño con su perfil (cookies de Google): las rutinas en la nube corren en un clon nuevo
  sin acceso local, y las tareas locales de la app de escritorio no constan para WSL ni para un
  perfil de Chrome. La revisión de dependencias toca lo que solo existe en esta máquina (el Node de
  nvm compartido con nubigest, recargar VS Code por los MCP) y una rutina tendría que publicar una
  rama. Las dos siguen en las sesiones, por encargo del dueño.
- **Adaptado: un reclamo para la tanda**, el punto débil real. El comando que propone el hook toma un
  cerrojo (`flock` sobre `.batch.lock`, en la carpeta de la cola), y el hook, mientras otra sesión
  lo tiene, solo dice que la tanda está en marcha. La revisión de dependencias ya tenía el suyo (la rama).
- **La contradicción de `docs/next-seo.md` §7**: aceptado. La frase dice ahora que nada sale del
  repo sin encargo del dueño, y nombra el de la cola.
- **El estado cortado en un punto**: aceptado, en el hook y en el test (la frase acaba en un punto
  seguido de espacio o del final).
- **`fork` y `MultiEdit`**: aceptado; la documentación confirma los dos.

### 8.6 Compactar (§2.6)

Aceptado. Tras compactar, el hook recuerda releer los anexos y el plan abiertos. Un test falla si
aparece un `CLAUDE.md` (en la raíz o en `.claude/`) o un `CLAUDE.local.md` (la documentación confirma que
cualquiera de ellos deja `AGENTS.md` sin leer).

### 8.7 Skills (§2.7)

- **Contradicción de `command-review`, francés de `command-page`, las tres versiones del gate,
  el `rm -rf` sin ruta**: aceptado y corregido (el `rm -rf` solo corre en la rama `deps-review`).
- **Huecos de `new-command`**: aceptado tras contrastar los `feat` recientes, que tocan
  `cad/api.md`, `.changeset/`, `cad/size.test.ts` y las páginas de `content/docs/commands/`. El
  paso nuevo los nombra, y el primero dice qué se salta un comando sin herramienta (unos veinte,
  no cuarenta: `registerCommands` registra 35 entradas, 14 con herramienta).
- **El disparador enterrado: rechazado.** Claude Code muestra la descripción entera de cada skill
  antes de cargarla (la de `command-review`, 558 caracteres, aparece completa en la lista que
  recibe esta sesión), así que la posición del «Use when» no la esconde.
- **Partir `autocad-research`, el diario de `annex-probes.md`, las dos skills nuevas**: al brief,
  con la poda.

### 8.8 Subagentes y revisión (§2.8)

Aceptado: `finish-feature` tiene un paso 6, una segunda lectura de cada `feat` o `fix` de código
por un contexto que no vio el razonamiento (la skill `code-review` o un subagente con el diff), con
el aviso de que un revisor siempre encuentra algo. Se exceptúan los bloques de una review de
comando, cuyo diff ya lee alguien que no lo escribió. Medir si delegar cada bloque compensa, al
brief.

### 8.9 Menores (§2.9)

| Hallazgo                        | Veredicto | Por qué                                                                                                                                                           |
| ------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `description:` y Copilot        | Aceptado  | La documentación de Claude Code lo confirma: solo lee `paths:`. `knowledge.md` deja de afirmar lo de Copilot.                                                      |
| El bloque de Next.js al final   | Aceptado  | `upsertAgentRulesBlock` lo reemplaza donde estén sus marcadores.                                                                                                  |
| El idioma de los briefs         | Aceptado  | `AGENTS.md` lo dice ahora, en la misma línea del inglés.                                                                                                          |
| `docs/next-seo.md` pesa 62 KB   | Rechazado | Es el brief vivo del plan de visibilidad, que otras sesiones escriben a diario; reordenarlo desde aquí chocaría con ellas. Lo decide la sesión que lo cierre.         |
| `engine-package.md`, crónica    | Al brief  | Es poda.                                                                                                                                                          |
| Puntos ciegos del test de citas | Al brief  | Ninguno da un fallo hoy.                                                                                                                                          |
| Las sondas no viajan            | Rechazado | `research/` guarda el texto de Autodesk y por eso no entra en git (`.gitignore`); un worktree lo enlaza. Una sesión en la nube no puede sondar AutoCAD de todos modos. |
| Ramas viejas                    | Sin cambio | Borrarlas es del dueño: las cuatro de i18n, fusionadas, y `worktree-agent-a498997d3f29c107f`, con un commit fuera de `main`.                                        |
| `Read(./.env.local)` en `deny`  | Sin cambio | Correcto como freno de las herramientas de archivo; no se activa el sandbox por esto.                                                                             |

### 8.10 Segunda lectura

Antes de los commits, un subagente sin este razonamiento leyó el código nuevo (el paso 6 que este
triaje añade a `finish-feature`). Encontró, y se corrigió: el reclamo de la tanda buscaba con
`pgrep` en toda la máquina, de modo que una tanda real ponía en rojo los tests del hook (ahora es
el propio cerrojo, en la carpeta de la cola); el `style` del hero pisaba el `font-kerning` del SVG
(ahora se suman, con test); un apóstrofo dentro de un here-document dejaba pasar un `git push`
detrás, y había otras formas de saltar el guard (`--config-env`, `GIT_CONFIG_KEY_0`,
`git config core.hooksPath`, `sh -c`, `sudo`, `/usr/bin/git`, `` `…` ``) y falsos positivos
(`-mdone`, `-uno`, líneas de un mensaje de commit): todo con test; el hook de worktree no se
recuperaba de una copia cortada a medias y compartía el `.package-lock.json` de npm con `main`;
las listas del test de clasificación podían nombrar comandos que ya no existen. El guard sigue
siendo contra despistes, no contra quien quiera saltarlo: `eval` o un script lo esquivan.
