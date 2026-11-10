# Medir el knowledge — brief

> **Estado:** acordado el 10/11/2026 por el dueño, en el orden de §3: el registro de cargas corre
> desde ese día y se lee a partir del 24/11; después, el piloto de 16 ejecuciones, y el banco
> completo solo si el piloto da una señal clara. Recoge los puntos 4, 5 y 8 de §5 de la auditoría
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
