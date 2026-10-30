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

## 4. Riesgos

- Una página escrita a mano que repite un README o un `api.md` se queda vieja sin que nada falle:
  generarla, o que un test la ate a su fuente.
- La documentación de uso en tres idiomas multiplica el texto que mantener: la referencia generada
  primero, las guías después y cortas.
