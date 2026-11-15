# Para quien integra — brief

> **Estado:** en pausa: la visibilidad va antes por decisión del dueño del 5/11/2026; sin acordar,
> nada empezado, salvo el MCP del motor (§2), que una sesión intercalada el 15/11/2026 investigó,
> prototipó y midió: su brief es `docs/next-mcp.md`, también sin acordar y sin publicar. El plan
> de la visibilidad es `docs/next-seo.md`, y lo siguiente en él, lo que queda de la fase 4 del DXF
> (`docs/next-dxf.md`). Los tres paquetes están en npm desde el 2026-10-31 (motor 0.2.0, react y
> editor 0.1.0). Se borra cuando cada idea esté hecha o descartada.

Lo que queda del brief de la librería, cerrado el 2026-10-31 con los tres paquetes publicados (está
en el historial de git). Ordenado por lo que aporta. Ninguna idea se
empieza sin la palabra del dueño: cada una es un canal nuevo hacia fuera.

## 1. Registro shadcn (bajo demanda)

Piezas del editor copiables, con sus primitivos bajo una ruta propia (`files[].target`), sin pisar
los del usuario; solo Base UI. Se hace cuando alguien lo pida, no antes: el canal del editor es npm,
porque lleva lógica y tiene que poder recibir arreglos, y sus primitivos son forks (`button` con
`active`, `icon-flyout`, `cube`) que una copia congelaría. Lo que un segundo anfitrión tendría que
reimplementar para comportarse como AutoCAD vive en el motor o en los hooks de `@mellowcad/react`,
así que una copia solo llevaría presentación.

## 2. Para agentes

La web ya sirve el `.md` de cada página y `llms.txt`.

- **Una skill para quien integra**: un `SKILL.md` que enseña a montar el motor o el editor,
  generado de los mismos READMEs y guías (una fuente, como las páginas de _Construir_).
- **Un MCP de la documentación** (buscar y leer páginas): `fumadocs-core/mcp` lo trae, pero cada
  llamada es una función y aporta poco sobre `llms.txt` con tan pocas páginas.
- **Un MCP del motor** (un agente dibuja con comandos de AutoCAD sobre `CadDriver`, sin
  navegador): tiene su brief, `docs/next-mcp.md` (15/11/2026), con quién hay ya (no es el
  primero: CADCraft), un prototipo (`scripts/mcp/server.ts`) y un banco de 291 ejecuciones. Su
  propuesta es un MCP remoto y sin estado antes que el paquete de terminal.

## 3. Decisiones que siguen en pie

Del 2026-10-29, delegadas por el dueño: licencia MIT (el código, no el nombre ni el logo), sin tier
de pago (se reconsidera solo si hay adopción), y nada sale hacia fuera sin su sí.
