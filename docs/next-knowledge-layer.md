# Capa de conocimiento para agentes — plan

> **Estado:** KL-D1 a KL-D5 cerradas con la recomendación el 2026-10-20; bloques 1 a 5 hechos y
> `AGENTS.md` reescrito. Queda KL-D5 (el listado de `.playwright-mcp/`, pendiente del visto bueno del
> usuario). Se borra cuando esté hecho (convención de `docs/next-*.md`); el detalle queda en git.

Auditoría del 2026-10-20 de cómo llega el conocimiento del repo a los agentes (Claude Code y Copilot):
`AGENTS.md`, `.github/instructions/`, `docs/`, `cad/README.md`, el enforcement y el entorno. Modelo
de referencia: nubigest (`.claude/rules/` con `paths:`, skills, `knowledge:check`, settings y hooks),
adaptado a lo que mellowcad es: un motor que crece comando a comando contra una especificación externa
(AutoCAD), sin base de datos ni producción con datos de usuarios.

## Diagnóstico

### Lo roto

1. **Claude Code no carga `.github/instructions/`** (code.claude.com/docs/en/memory: solo
   `CLAUDE.md`, `AGENTS.md` y `.claude/rules/`). Toda sesión de Claude Code en mellowcad ha trabajado
   con los 10 KB de `AGENTS.md` y sin ninguna de las ~240 KB de reglas, y `AGENTS.md` afirma que
   «load automatically». Solo Copilot las recibía.
2. **Los globs con `[locale]` y `(app)` no casan con nada**: `[locale]` es una clase de caracteres y
   los paréntesis, un grupo. `app/[locale]/(app)/**` y los cuatro de marketing nunca cargan su
   regla, tampoco en Copilot. Mismo fallo en `.prettierrc`: la landing se ordena con la hoja de
   estilos del editor (`prettier.resolveConfig` lo confirma).
3. **El CI no corre desde el 2026-10-18** (facturación de GitHub Actions, la misma cuenta que
   nubigest): la única barrera es `.githooks/pre-commit`, y `AGENTS.md` dice que lo son los dos.
4. **Unas 30 afirmaciones falsas o caducadas**, con 4 contradicciones entre ficheros (lista en el
   bloque 2).

### Lo caro

- Editar una herramienta carga ~108 KB (AGENTS 10 + cad-engine 42 + cad-tools 52 + research 5) y se
  usa ~25 % de cad-engine. `CadRuntime.ts`: ~104 KB, ~12 % de cad-engine. Un componente del editor:
  65 KB (ui + i18n), ~30 % útil. Un catálogo de `messages/`: marketing + i18n, ~20 % útil.
- Por categoría, de las 240 KB: ~30 KB son procedimientos (checklists que se usan de vez en cuando:
  skill), ~25 KB descripción del propio código (que además caduca: tablas de módulos y de métodos ya
  incompletas), ~12 KB en el ámbito equivocado, ~10 KB historia y mediciones fechadas, ~8 KB
  duplicados.
- `docs/autocad-coverage.md`: 599 KB, de ellos **353 KB son espacios de relleno** de las tablas
  (Prettier al guardar). Filas de una línea de hasta 17,5 KB: un grep devuelve la fila entera, un
  `Edit` necesita un fragmento único dentro de ella y cada cambio de una fila reescribe la línea
  (diffs de 15-37 KB; uno re-rellenó toda la tabla, ~750 KB). `docs/i18n-glossary.md`: 61 % relleno.
- Testing carga 8,7 KB de Playwright y Lighthouse en cada test unitario, y nunca cuando se usa el
  navegador (no hay tests de Playwright en el repo).

### Lo que falta

- **Ciclo de vida**: nada comprueba que una ruta, un símbolo o un glob citado exista. La auditoría
  encontró símbolos renombrados (`meetingHeight`), checklists a los que les faltan pasos
  (`TRANSPARENT_COMMANDS`, snapshots, es/ar) y un brief borrado aún citado.
- **El error como canal**: ninguna invariante de `AGENTS.md` sobre capas se comprueba salvo la del
  barrel `@/cad` (`cad/entryPoints.test.ts`). Hay 1 violación de la tabla de capas no documentada,
  1 de la normalización de ángulos y reglas de ESLint con 0 violaciones listas para activar.
- **Entorno**: `.claude/` vacío: memoria automática activa (el README dice que lo suyo pasó al repo),
  `git push` sin confirmación (push a `main` despliega en Vercel), `.env.local` legible.
- **Procedimientos bajo demanda**: no hay skills; la consola de AutoCAD, la verificación en el
  navegador y los checklists se cargan siempre o nunca.

### Lo que está bien y no cambia

- «La fidelidad a AutoCAD es la especificación», la fila de cobertura antes de extender un comando y
  `research/strings/` con la consola: el corazón del método.
- El arnés de Vitest como verificador principal; las reglas de gotchas verificados; el inglés como
  idioma del conocimiento del repo (traducir arriesga matices); «Decide, don't ask».
- `cad/README.md` como contrato público del motor (correcto en todo lo comprobado).

## Decisiones

| ID    | Decisión                         | Opciones                                                                                                                                                       | Recomendación                                                                                   |
| ----- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| KL-D1 | Fuente de las reglas por ruta    | A: `.claude/rules/*.md` con `paths:` (Copilot también la lee, como en nubigest). B: mantener `.github/instructions/` y duplicar para Claude                      | A                                                                                               |
| KL-D2 | Formato de la cobertura          | A: un fichero por sección (`docs/coverage/draw.md`…) con un `###` por comando y listas «Does» / «Missing» a 100 columnas; el Roadmap aparte. B: misma tabla sin relleno y fuera de Prettier | A: lectura por sección de 1-3 KB, diffs de línea, `Edit` fiable. El contenido no cambia: conversión por script con comprobación de que el texto es el mismo |
| KL-D3 | Comprobación del conocimiento    | A: un test de Vitest (`knowledge.test.ts`) dentro del pre-commit: globs que casan, rutas, scripts y símbolos citados, frontmatter de skills y topes de KB de trinquete. B: script aparte como nubigest | A: con el CI caído, solo lo que corre en el pre-commit protege. Sin IDs ni ROADMAP: mellowcad no los tiene ni los necesita |
| KL-D4 | Estado entre sesiones            | A: hook `SessionStart` con rama, commits sin push, `git status` y los `docs/next-*.md` vivos. B: además un ROADMAP con «En curso» como nubigest                    | A: el roadmap ya vive en la cobertura y el brief en `next-*.md`                                  |
| KL-D5 | `.playwright-mcp/` (199 ficheros, 7,6 MB, fuera de git) | A: los volcados de la ayuda de Autodesk (`help/`, `research/`, `pages-*.md`, `forums.txt`) a `research/autodesk-help/`; logs, capturas y snapshots, borrados. B: dejarlo | A, tras revisar el listado contigo: el borrado no se puede deshacer |

## Bloque 1: entorno y comprobación (primero, para validar lo demás)

1. `.claude/settings.json`: `autoMemoryEnabled: false`; `ask` para `git push`; `deny` para
   `Read(./.env.local)` y `Read(./.playwright-mcp/**)`.
2. Hook `SessionStart` (`startup|resume|compact|clear`): rama, último commit, commits sin push,
   `git status` (con el árbol sucio, `git diff` y typecheck antes de responder; hay sesiones en
   paralelo) y los `docs/next-*.md` existentes.
3. `knowledge.test.ts` (KL-D3), con los topes que salgan al terminar el bloque 2 y bajando después.
   Medición de KB cargados por fichero con los `paths:` reales (mediana, p90, máximo), como nubigest.

## Bloque 2: reglas a `.claude/rules/`, partidas por ámbito y verdaderas

Cada fichero se migra con su contenido revisado; los globs, sin corchetes ni paréntesis
(`app/*/*app*/**`, `app/*/*marketing*/**`). Destino (KB aproximados):

| Regla              | Ámbito (`paths:`)                                                                        | Contenido                                                                                           | KB   |
| ------------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---- |
| `cad-engine.md`    | `cad/**`                                                                                 | Capas (con `shared/`, `i18n/`, `locales/`), ids no nombres, efectos al importar, puertos, convenciones, modelado, Z | ~13  |
| `cad-scene.md`     | `cad/scene/**`, `SceneBuilder.ts`, `cad/adapters/*Presenter*`                             | Primitivas, splines, relleno de polilíneas, recorte, fuentes y MTEXT del presentador, «Scene» del runtime | ~8   |
| `cad-runtime.md`   | `cad/application/*.ts`, `commands/`, `constraints/`, `input/`, `snapping/`, `tracking/`, `cad/adapters/**` | Pipeline de precisión, viewport, snapping, historial, EngineState, adaptadores; rutas de teclas y botones en 3 líneas (el orden ya está comentado en `CadRuntime.ts`) | ~25  |
| `cad-tools.md`     | `cad/application/tools/**`                                                               | Lo de herramientas más lo del runtime que les afecta (responder a un prompt, marco UCS, transparentes); los internos de TRIM, FILLET/CHAMFER y UNDO, a JSDoc en su código | ~30  |
| `cad-catalogs.md`  | `cad/locales/**`, `cad/i18n/**`, `cad/application/tools/**`                               | Prompts, keywords, `initget`, catálogos del motor (sin repetir `cad/README.md`)                       | ~6   |
| `testing.md`       | `**/*.test.ts`, `test/**`                                                                | Arnés, matchers, snapshots, cobertura                                                                | ~6   |
| `ui.md`            | `components/cad/**`, `components/ui/**`, `app/*/*app*/**`, `hooks/**`                     | Texto, RTL, color, tipo, tamaño, Base UI, iconos; «dónde va un control» de 17 a ~4 KB (el orden de cada barra, a un comentario en su componente) | ~20  |
| `marketing.md`     | `app/*/*marketing*/**`, `components/marketing/**`, `content/**`, sus `lib/`               | Sin `messages/**` ni `i18n/**`                                                                       | ~12  |
| `i18n.md`          | `messages/**`, `i18n/**`, `next.config.ts`, layouts y `lib/` de idioma                    | Sin `components/**` ni `cad/locales/**`; el estilo en español y árabe, solo en el glosario (fuente única) | ~10  |
| `knowledge.md`     | `.claude/**`, `AGENTS.md`, `docs/**`, `README.md`                                        | Qué comprueba `knowledge.test.ts`, cómo citar, dónde va cada cosa                                    | ~3   |

Objetivo: editar una herramienta, de ~108 a ~60 KB; `CadRuntime.ts`, de ~104 a ~40; un componente del
editor, de 65 a ~30.

**Correcciones** (verificadas contra el código el 2026-10-20):

- Motor: `meetingHeight` → `meetingPoint`; tabla de capas sin `shared/` (y `Document.ts` lo
  importa); `EngineText.ts` no es el único lector de `en.json` (`CadDriver.ts`); tablas de módulos y
  de métodos incompletas (`splines`, `mtext`, `attributes`, `objectArea`, `boundary`, `ucs`,
  `runtimeMeasure`, `runtimeViewCube`): se quitan, no se completan; orden de teclas mal
  (Shift+Espacio antes que los Ctrl); listeners del adaptador; opciones de `CadEngine`; TEXTEDIT y
  EATTEDIT del doble clic; `IMPLEMENTED_SNAPS` ya inútil; el checklist de tipo de entidad omite
  `ucsObjects`, `curveCrossings`, `objectArea` y `clipboard`.
- Herramientas: `specifyOtherCornerPoint` no existe; el paso «exportar de `cad/index.ts`» no se
  cumple ni hace falta; al checklist de comando le faltan `TRANSPARENT_COMMANDS`,
  `englishSurface.txt`/`transcripts.txt`, es/ar y los hooks de `Tool.ts`; «nunca un prompt con
  `ctx.report`» tiene la excepción que documenta el runtime.
- Tests: el brief `docs/next-i18n.md` ya no existe; lista del arnés incompleta; `fetch_webpage` es
  de Copilot.
- UI e i18n: `TRANSLATED` se calcula de `LOCALE_STATUS`; «añadir un idioma» omite
  `LANGUAGE_NAMES`, `npm run locales` y la tabla de `cad/README.md`; a las islas de la landing les
  falta `LanguageLinks`; el estilo en español y árabe ha divergido entre i18n y el glosario;
  `next-launch.md` dice que el README es el de la plantilla.
- `AGENTS.md`: «every **entity** mutation» (los setters de ajustes escriben directo, a propósito);
  «one gesture = one undo step» sin el «batch» que contradice al runtime; la excepción de los
  contadores de id en «pure»; las reglas, en `.claude/rules/`.

## Bloque 3: skills (procedimientos bajo demanda)

`.claude/skills/<nombre>/SKILL.md`, que Copilot también descubre:

| Skill               | Sale de                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `new-command`       | Checklist de cad-tools, completo (lo que tocaron los últimos commits de comandos) |
| `extend-model`      | Checklists de tipo de entidad, tipo de cota, propiedad, tabla de estilos y snap |
| `autocad-research`  | Consola, tablas de textos y el método de la ayuda de Autodesk (hoy repartido en dos ficheros) |
| `browser-verify`    | Playwright, Lighthouse y la comparación de rendimiento en un worktree |
| `add-language`      | El checklist de i18n, sin lo que ya impone `Record<AppLocale>`     |
| `finish-feature`    | «Finishing a feature» de `AGENTS.md`: verificación, fila de cobertura, reglas, commit sin push |

## Bloque 4: la cobertura y el glosario

- KL-D2 con un script de conversión de un solo uso (fuera del repo) que comprueba que el texto sin
  espacios es idéntico antes y después.
- Glosario: sin relleno y fuera de Prettier (es una tabla de verdad: término, es, ar).
- `.prettierignore` para `docs/**` y override de `.prettierrc` con `app/*/(marketing)/**` (comprobado
  con `resolveConfig`), reformateando la landing en el mismo commit.

## Bloque 5: el error como canal

Cada comprobación sustituye su prosa por una línea («lo comprueba X»):

- Test de arquitectura en `cad/entryPoints.test.ts`: tabla de capas y dependencias por capa; los
  `runtime*.ts` solo importan el runtime como tipo.
- ESLint: `no-restricted-globals` del DOM en `cad/**` salvo `adapters/`; normalización de ángulos
  (arregla `runtimeMeasure.ts`:44); `addEventListener('keydown')` fuera de React; `type="number"`;
  literales en atributos de accesibilidad; `jsx-no-literals` a `app/**` y `components/*.tsx`.
- `never` en los `default:` de los `switch` por tipo de entidad, para que el compilador señale los
  sitios del checklist.

## Bloque 6: cierre

`AGENTS.md` reescrito con lo anterior (más corto: sin «Finishing a feature», que pasa a skill; con
«responde en español»; CI caído hasta que se arregle la facturación), README, KL-D5 y medición final
contra los objetivos.
