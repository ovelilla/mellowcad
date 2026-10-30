# mellowcad.com: producto y documentación — brief

> **Estado:** acordado el 2026-10-30; fases 1 y 2 hechas el mismo día, la 3 en curso (entregas 1 y 2 de 5). Sigue la
> convención de `docs/next-*.md`: se borra cuando la fase 3 haya ocurrido.

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
  GitHub y npm, y su regla de afirmaciones (`.claude/rules/i18n.md`) ya lo permite; el resto (no
  prometer DWG, impresión, 3D…) se queda.

## 3. Fases

1. **Afirmaciones y enlaces** — **hecha** (ba241a9, 420ab7f, 5f1e583). La regla de afirmaciones
   lo permite; la landing, en los tres idiomas, dice que es open source (MIT) y enlaza GitHub y
   `@mellowcad/engine` en npm en «Motor», el pie, la FAQ y la entradilla de «Estado». El README de
   la raíz es uno en inglés para quien visita el repo, y la guía de montaje, en español, está en
   `docs/setup.md`.
2. **Construir** — **hecha**. `/docs` con fumadocs (Macro API) y una interfaz propia con Base UI;
   cada página del motor, react y el editor es un `<include>` de su README o su `api.md`, con los
   bloques de los ejemplos leídos de su fichero; `.md`, `llms.txt`, el buscador en el servidor y
   `docs:check` en el gate. En inglés y servida bajo cada prefijo con el marco de su idioma
   (`.claude/rules/docs.md`). El `homepage` del motor apunta a su página, con un changeset de
   parche aún sin publicar; react y el editor, «not published yet», tendrán el suyo al publicarse.
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

## 6. Pendiente tras la fase 2 (2026-10-30)

Visto al cerrar la fase 2; ordenado por lo que aporta.

- **El Code Block de shadcn en los bloques de código** (changelog de octubre de 2026, variante de
  Base UI): números de línea, líneas resaltadas y de diff, ajuste de línea y el aviso accesible al
  copiar (el `CopyCode` de hoy no anuncia nada). Se trae a `components/docs`, no al editor (al que
  apunta `components.json`), con los tokens de la landing; Shiki sigue en el build. **Hecho**
  (2026-10-30).
- **Una skill para quien integra con agentes**: un `SKILL.md` que enseña a montar el motor o el
  editor, generado de los mismos READMEs (una fuente, como las páginas). Lo más útil hoy junto al
  `.md` de cada página y `llms.txt`, que ya están.
- **Un MCP de la documentación** (buscar y leer páginas): `fumadocs-core/mcp` lo trae, pero cada
  llamada es una función y aporta poco sobre `llms.txt` con tan pocas páginas. Después de la fase 3.
- **Un MCP del motor** (un agente dibuja con comandos de AutoCAD sobre `CadDriver`, sin navegador,
  y devuelve SVG o el fichero del dibujo): lo más interesante como producto, y una decisión de
  producto con su propio brief y la regla de afirmaciones (`i18n.md`) delante.

## 7. Plan de la fase 3 (2026-10-30)

Cuatro páginas bajo _Usar MellowCAD_, con slugs sin traducir y un fichero por idioma
(`name.mdx`, `name.es.mdx`, `name.ar.mdx`): `/docs/getting-started` (primeros pasos),
`/docs/commands` y `/docs/shortcuts` (referencia), `/docs/differences` (conceptos). Decisiones:

- **Lo generado se genera en Vitest**, no en el build: Node resuelve `@mellowcad/engine` a su
  `dist/` (fuera de git) y el macro de fumadocs evalúa con esbuild y los paquetes externos, así que
  ni `docs:check` ni un plugin de remark pueden leer el catálogo. `lib/docs/generate.test.ts` escribe
  `commands.*.mdx` y `shortcuts.*.mdx` con `toMatchFileSnapshot` (como los transcripts de la
  landing): Markdown llano, de modo que el buscador, el `.md`, `llms.txt` y el hreflang salen
  solos, y el gate falla si el catálogo cambia y la página no (`npx vitest run -u` la rehace).
  Nadie edita esos ficheros a mano.
- **Lo escrito a mano** (primeros pasos, diferencias) es inglés de fuente y su traducción lleva en
  el frontmatter `sourceHash`, el hash del fichero inglés: `docs:check` falla con una traducción
  desfasada, como en nubigest.
- **Las palabras del motor en una guía no se teclean**: `<Command id="LINE" />` es el nombre en el
  lenguaje de comandos de la página (`LINEA` en `/es`), y `<Session name="…" />` una figura de
  `recordDemo` con su transcript, ambos del motor en el idioma de la página; el `.md` los escribe
  como texto (el nombre; el transcript en un bloque).
- **La navegación** tiene dos grupos, _Usar_ y _Construir_, con los títulos de `messages`, no
  separadores en `meta.json` traducidos aparte.
- **Una página traducida** lleva hreflang y su propio canónico en cada idioma (`pageMetadata` sin
  `contentLocale`), en el sitemap con alternates y en `llms.txt` (la inglesa) bajo _Usar_;
  _Construir_ sigue como está.

| Entrega | Qué                                    | De dónde sale cada dato                                                                                                                                                                                                                                                                                     |
| ------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1       | Referencia de comandos y la estructura | Por grupo de la cinta (`COMMAND_FILING`, títulos de `Groups`): nombre, alias y descripción de `autocadCommands(locale)`; la primera pregunta de cada comando, grabada con `recordDemo` en el idioma (orden, palabras clave y valor por defecto del motor); el enlace a su entrada de `docs/coverage/`, que debe existir |
| 2       | Atajos                                 | `lib/docs/shortcuts.ts` (tecla y lo que hace: un comando o un modo); el test pulsa cada tecla en el arnés y comprueba el efecto, y barre F1–F12 y Ctrl/Ctrl+Mayús con letra o cifra: lo que `keyDown` consume y no está en la lista falla. Nombres: el comando del catálogo del motor, el modo de `StatusBar` del editor |
| 3       | Diferencias con AutoCAD                | Escrita en tres idiomas; cada sección (`## … [#id]`) está en lib/docs/differences.ts con su fuente, un `WHY` en el código o su entrada de cobertura, y una cita literal que `docs:check` busca en ese fichero: si la desviación desaparece, la página falla                                                             |
| 4       | Primeros pasos                         | Escrita en tres idiomas, corta: abrir `/draw`, la línea de comandos, responder a una pregunta (punto, coordenada, opción, Intro, Esc), las ayudas al dibujo, deshacer, guardar; las figuras con `<Session>` y los nombres con `<Command>`                                                                     |
| 5       | F1                                     | La ayuda del comando en curso, como AutoCAD, si la skill `autocad-research` confirma qué hace F1 en 2027 y Chrome deja que la página lo tome (`kReservedCommandIds`); si no, se anota aquí y en cobertura por qué no                                                                                            |

**Qué comprueba `docs:check`** además de lo de hoy: cada página de _Usar_ existe en los tres idiomas;
una traducción escrita tiene `sourceHash` igual al de su inglés; una generada (`GENERATED_PAGES`) no
lo tiene; las secciones de `differences` son las mismas en cada idioma y las de
lib/docs/differences.ts, y la cita de cada una está en su fuente; un enlace a
`/docs/commands#id` nombra un comando de la referencia. **Qué comprueba Vitest**: las páginas
generadas al día, cada `<Command id>` y `<Session name>` de una guía existe, y los atajos contra el
runtime.

