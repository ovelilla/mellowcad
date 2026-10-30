# El conocimiento para agentes, desde nubigest — brief

> **Estado:** acordado el 2026-10-30 para una sesión nueva, sin empezar. Sigue la convención de
> `docs/next-*.md`: se borra cuando lo que traiga esté en `main`.

## 1. Objetivo

nubigest (`~/projects/nubigest`, en el mismo WSL) hizo un esfuerzo grande para que los agentes de IA
trabajen bien con el repo: su `AGENTS.md`, sus reglas (`.claude/rules/`), sus skills, sus hooks, sus
checks de conocimiento y sus planes (`docs/plans/`). mellowcad copió parte de eso en su día y desde
entonces los dos han divergido. Revisarlo entero y traer lo que aplique y mejore mellowcad, y
proponer lo que no esté en ninguno de los dos y mejoraría este.

## 2. Por qué ahora

Las dependencias se quedan atrás aunque el protocolo existe. mellowcad tiene la skill
`deps-review` y el hook de inicio de sesión avisa a los 30 días sin un `chore(deps):` (el último,
`e353b9e`, el 2026-10-20), pero el aviso dice «cuando la tarea lo permita» y una tarea nunca lo
permite. El 2026-10-30, `npm outdated --min-release-age=0` daba, entre otras, next y
eslint-config-next 16.4.3, lucide-react 1.65.0, shadcn 4.23.0, tsdown 0.23.4, fumadocs-core
16.17.9, y mayores sin estudiar: TypeScript 7, ESLint 10, Vitest 5, Babel 8 y @types/node 26.
`npm audit --omit=dev`: 0 vulnerabilidades. nubigest tiene un protocolo para que esto no pase:
entender cómo lo consigue es la primera pregunta.

## 3. Cómo

1. Inventario de nubigest: `AGENTS.md`, `.claude/` entero (reglas, skills, hooks, settings,
   agentes), los checks del conocimiento (su `knowledge:check` y lo que valida), `docs/plans/`, la
   CI y los scripts de mantenimiento (dependencias, `session-close`, `ci-local`…). Leer, no copiar:
   nubigest escribe su conocimiento en español y por dominios; mellowcad, en inglés y por capas.
2. El mismo inventario de mellowcad, y una tabla: qué tiene nubigest que mellowcad no, qué tiene
   mellowcad mejor, qué falta en los dos.
3. Para cada pieza que aplique, adaptarla con los criterios de `.claude/rules/knowledge.md` (un
   dueño por hecho, lo comprobable como check, presupuestos de tamaño) y con lo que sea de verdad
   de este repo: varios agentes a la vez en el árbol, el gate en el hook, AutoCAD como
   especificación.
4. Primero el protocolo de dependencias (que se cumpla, no solo que exista); después una revisión
   de dependencias con él, que incluya el CLI de shadcn y la migración al paquete `cn` del editor.
5. Commits por bloques con el gate en verde; sin push hasta que el dueño lo diga.
