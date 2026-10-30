# mellowcad.com: producto y documentación — brief

> **Estado:** acordado el 2026-10-30, sin ejecutar. Sigue la convención de `docs/next-*.md`: se
> borra cuando la fase 3 haya ocurrido.

## 1. Objetivo

mellowcad.com deja de ser solo la app y su landing: quien dibuja aprende a usarla, y quien integra
los paquetes aprende a construir con ellos. npm, GitHub y la web se enlazan entre sí. Hoy el
`homepage` de `@mellowcad/engine` es el README de su carpeta en GitHub porque la web no dice nada
de la librería.

## 2. Decisiones

- **El mismo dominio, bajo `/docs`**, no un subdominio: la misma app de Next, un solo despliegue,
  el diseño y los tres idiomas que ya hay, y la autoridad de búsqueda en un dominio. Un subdominio
  solo compensa con otra herramienta de documentación, que no hace falta.
- **Dos secciones, dos públicos.** _Usar MellowCAD_, para quien dibuja, en inglés, español y
  árabe: primeros pasos, la referencia de comandos (alias, opciones, diferencias con AutoCAD) y los
  atajos. _Construir con MellowCAD_, para quien integra, en inglés: el motor, react y el editor, su
  API y los ejemplos.
- **Una fuente por hecho; lo que puede generarse, se genera.** _Construir_ sale de los READMEs, los
  `api.md` y `examples/`, que `test/packages.test.ts` ya mantiene fieles a los paquetes: una copia
  a mano diría otra cosa a la semana. La referencia de _Usar_ sale del catálogo del motor
  (`commandCatalog()`, en cada idioma); sus guías se escriben para el usuario, no se copian de
  `docs/coverage/`, que es conocimiento interno, aunque de ahí salen las diferencias con AutoCAD.
- **El `homepage` de cada paquete apunta a su sección** (`https://mellowcad.com/docs/engine`) en
  cuanto exista: un patch por paquete.
- **El repo es público y MIT** desde el 2026-10-30: la web puede decir «open source» y enlazar
  GitHub y npm. La regla de afirmaciones de `.claude/rules/i18n.md` lo prohíbe todavía; el resto
  de la regla (no prometer DWG, impresión, 3D…) se queda.

## 3. Fases

1. **Afirmaciones y enlaces** — ½–1 día. La regla de afirmaciones al día; la landing, en los tres
   idiomas, dice que es open source (MIT) y enlaza GitHub y `@mellowcad/engine` en npm (pie, FAQ,
   lo que el diseño pida), con `CONTENT_UPDATED`. El README de la raíz, que GitHub enseña a quien
   visita el repo, es hoy la guía en español para montar el proyecto: pasa a ser un README en
   inglés para el visitante (qué es, los paquetes, la licencia, cómo contribuir) y la guía de
   montaje se muda a su propio documento.
2. **Construir** — 2–3 días. `/docs` con su navegación; las páginas del motor, react y el editor
   generadas de sus READMEs y `api.md` en el build, los bloques de los ejemplos incluidos; el
   `homepage` de cada paquete publicado apunta a la suya.
3. **Usar** — 3–5 días. Primeros pasos y la referencia de comandos en los tres idiomas, desde el
   catálogo; atajos y diferencias con AutoCAD. Las capturas o figuras, con el `recordDemo` de la
   landing.

Bloqueos: 1 → 2 → 3. La 2 no espera a la fase 7 de `docs/next-library.md`: react y el editor salen
como «aún no publicados» hasta entonces.

## 4. Lo que se reutiliza de nubigest

nubigest hizo su centro de ayuda (DOC-01, octubre de 2026) con el mismo problema: tres idiomas con
árabe, Next y Base UI. Antes de la fase 2, leer su plan (en ese repo, docs/plans/documentation.md,
DOC-D1 a DOC-D39), su regla .claude/rules/help.md y su skill help-article; ninguno se copia sin
volver a verificar las versiones.

- **Se adopta**: `fumadocs-core` y `fumadocs-mdx` con la Macro API, sin `fumadocs-ui` (interfaz
  propia con Base UI); los cuatro tipos de página de Diátaxis (primeros pasos, cómo, referencia,
  conceptos); un `docs:check` en el gate (frontmatter, traducciones desfasadas por el hash de su
  fuente, enlaces rotos, qué cubre cada página); la versión `.md` de cada página y `llms.txt`, que
  para una librería sirven a quien integra con agentes; el buscador en el servidor desde el
  principio.
- **Sus trampas, ya pagadas**: con Turbopack, el `include` de la macro casa por nombre de fichero,
  no por ruta; `next dev` no recompila los `.mdx` al cambiar la colección; la fuente conserva el
  idioma en `page.path`; un idioma sin traducción hereda los slugs del original
  (`enforce: "pre"`); un índice de búsqueda estático de los tres idiomas pasó de 20 MB y Vercel
  rechazó el deploy (`FALLBACK_BODY_TOO_LARGE`).
- **Aquí, distinto**: la fuente es el inglés (como `messages/en.json` y el catálogo del motor), no
  el español; las rutas no se traducen (`/es/draw`, y los comandos tienen nombre global); las
  figuras salen del motor con `recordDemo` (vectoriales, deterministas, en cada idioma) en lugar de
  capturas WebP; y _Construir_ se genera de los READMEs y los `api.md`, algo que nubigest no tiene.
- **Para la fase 3**: su ayuda dentro de la app (un «?» que abre la referencia de la pantalla en un
  panel) tiene aquí su forma de AutoCAD: F1 durante un comando abre la ayuda de ese comando. Antes,
  comprobar en AutoCAD 2027 qué hace F1 y si Chrome deja que la página lo tome.

## 5. Riesgos

- Una página escrita a mano que repite un README o un `api.md` se queda vieja sin que nada falle:
  generarla, o que un test la ate a su fuente.
- La documentación de uso en tres idiomas multiplica el texto que mantener: la referencia generada
  primero, las guías después y cortas.
