# MellowCAD como librería — brief

> **Estado:** fases 1, 2 y 3 hechas (2026-10-29); la 4, repartida en seis entregas; las demás, sin
> ejecutar. Sigue la convención de `docs/next-*.md`: se borra cuando la fase 7 haya ocurrido. El
> análisis completo, con el inventario medido, las fuentes fechadas, el spike y el pase adversarial,
> está en https://claude.ai/artifact/VZnAHvDFL8wGadysVcjMdx (privado). El spike vive en la rama
> local worktree-agent-a498997d3f29c107f (commit b1c7923), sin empujar.

## 1. Objetivo

mellowcad.com pasa a ser un sitio que _usa_ una librería CAD, sin lógica CAD propia; el motor y el
editor pasan a ser paquetes que cualquiera puede usar. Nada sale hacia fuera (npm, repo público,
Vercel) sin la palabra del dueño (§7).

## 2. Arquitectura

Las tres capas de la idea original se mantienen, pero el corte que decide es **npm para lo que lleva
lógica y tiene que poder recibir un arreglo; copy-in (registro shadcn) solo para presentación fina y
estable**. El editor hoy no es ninguna de las dos cosas: sus primitivos son forks (`button` con
`active`, `icon-flyout`, `cube`), su tema es global (`:root`, `dark:` siempre activo, portales a
`body`), usa Base UI directamente (19 `render=`) y cambia mucho (88 commits en `components/cad`
desde el 1 de septiembre). Por eso va a npm, y el registro llega después.

| Paquete             | Forma | Qué lleva                                                                                                                                                                                                                                                                                 | Cuándo                |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `@mellowcad/engine` | npm   | `cad/` tal cual (con `CadEngine` y los presentadores). Entradas `.` y `./locales/{en,es,ar}`, lista explícita. `sideEffects: false`, ESM, solo `icu-minify`.                                                                                                                              | primer lanzamiento    |
| `@mellowcad/react`  | npm   | `useCadEngine`, `useEngineSelector`, un `<CadCanvas>` dueño del canvas y del ciclo de vida, y los hooks de comportamiento sin estilo (teclas de la línea de comandos y de la entrada dinámica, arrastre del ViewCube). Sin CSS ni Base UI. Motor como peer.                                | segundo lanzamiento   |
| `@mellowcad/editor` | npm   | Las piezas exportadas una a una y `<CadEditor>` con huecos para sustituirlas (como `components` en tldraw); sus primitivos Base UI, CSS precompilado y acotado a la raíz del editor, el catálogo de textos del editor, compilado con React Compiler. Motor y react como peers. | segundo lanzamiento   |
| registro shadcn     | copia | Piezas copiables con sus primitivos bajo una ruta propia (`files[].target`), sin pisar los del usuario. Solo Base UI.                                                                                                                                                                     | bajo demanda (fase 8) |

**La línea entre npm y la copia:** va debajo (motor o hooks) todo lo que un segundo anfitrión tendría
que reimplementar para comportarse como AutoCAD — el formato de coordenadas de la barra de estado,
los píxeles de grosor, el umbral de arrastre del ViewCube, las respuestas de ZOOM, las teclas de la
línea de comandos y de la entrada dinámica, la lista de POLARANG, las etiquetas de LUPREC. Desde la
3(d) todo eso es del motor; a los hooks de `@mellowcad/react` solo les queda el cableado del DOM.

## 3. Decisiones técnicas

Cada una con su porqué; el análisis tiene las fuentes.

- **Solo ESM**, `exports` con `types` primero y `default` al final: attw `esm-only` en verde en el spike.
- **tsdown con `unbundle: true`**: tsup remite a tsdown en su README. Un `dist` de un fichero lleva
  13,9 KB a la isla de `matchCommands`; sin agrupar pesa 0,36 KB, igual que desde el fuente (medido).
- **`isolatedDeclarations` con oxc**: 33 errores mecánicos; los .d.ts en 1,5 s frente a 2,5 s. Como
  oxc no lee el tipo de `en.json`, `npm run locales` genera también su tipo (con test de deriva).
- **publint `--strict` y attw en el hook**: 3,7 s; el hook es la única barrera con CI apagado. Lo que
  necesita red (instalar el tarball en anfitriones ajenos) va en un check previo a publicar.
- **npm workspaces, sin Turborepo ni pnpm**: ya se usa npm, y con dos o tres paquetes no hace falta más.
- **Rangos internos `^x.y.z` reales**: npm no tiene `workspace:` y publica `"*"` tal cual.
- **El repo consume el fuente** (`paths` en `tsconfig.json`, alias en `vitest.config.ts`, por nombre
  de paquete): ni el dev server, ni el hook, ni Vercel compilan antes. Next consume también `dist` sin
  `transpilePackages` (medido); el sitio pasa a `dist` antes de la 1.0.
- **`cad/` se queda donde está** como paquete del workspace; los nuevos van en packages/. Moverlo
  reapunta unas 90 citas de conocimiento sin aportar función, con sesiones en paralelo.
- **La app sigue en la raíz** (sin apps/web): con un Root Directory, el `ignoreCommand` de
  `vercel.json` dejaría de ver `cad/` y los arreglos del motor no desplegarían.
- **Defaults seguros en `CadEngineOptions`**: sin `store`, ningún autosave; sin `scope`, el motor
  acotado a su canvas. El editor pide los de hoy explícitamente. Antes de la 0.1.0, porque serían API.
- **El motor es peer** de react y del editor (una sola instancia); Base UI es dependencia del editor.
- **React Compiler en el paquete publicado**, no en el anfitrión: el chrome baja de ~7 ms a ~3 ms
  (`next.config.ts`) y un anfitrión sin compilador no lo tendría.
- **`"use client"` solo en módulos de componentes**, nunca en los de idioma: `/draw` carga el catálogo
  en el servidor y lo pasa como prop.
- **El catálogo del editor** (las 259 claves `Editor.*` de `messages/`) usa el mecanismo del motor:
  `en.json` de referencia y tipo, ICU compilado en build con `icu-minify`, inglés de respaldo clave
  a clave, `extend` para el anfitrión. El tipado por argumento (`createMessagesDeclaration`) y los
  cinco checks de `i18n/messages.test.ts` se portan; sus claves son API (añadir es minor, quitar
  es major). `dir` y el idioma son props: la librería no toca `<html>`, la URL ni localStorage sin
  opción.
- **Changesets 3, 0.x**, con minor para lo incompatible. **1.0** cuando el build de Vercel consuma
  `dist`, el informe de API lleve semanas sin cambios y la forma de los catálogos esté congelada.

## 4. Fases

Cada fase se publica sola, con el gate en verde y producción desplegando como hoy. Las estimaciones
son días de sesión.

1. **El motor, paquete del workspace** — **hecha** (4172113, afb6e62, 13d6d5a; su regla es
   `.claude/rules/engine-package.md`). 1–2 días, sin dependencias. Antes, recortar `AGENTS.md`
   (10.210 B con un tope de 10 KB: 30 B de margen). Adoptar el spike: workspaces en `package.json`,
   el package.json propio de `cad/` (privado), los imports `@/cad` por `@mellowcad/engine`,
   `cad/entryPoints.test.ts` leyendo los `exports` y mapeando el nombre del paquete a su ruta (un
   import profundo sigue fallando), tsdown con `isolatedDeclarations`, `dist/` ignorado por git,
   ESLint, Prettier y la cobertura, y build + publint + attw en `.githooks/pre-commit`. Actualizar
   lo que queda falso: `cad/README.md` (columna «Today»), `.claude/rules/cad-engine.md`, `ui.md`,
   `i18n.md`, `marketing.md`, y una regla de empaquetado donde quepa en el presupuesto.
2. **La superficie pública del motor** — **hecha** (bf89978, deb9e72, bf1a8c0, 464bf3a, 52025e0,
   8f72e70): 141 nombres en el barrel, `cad/api.md`, `cad/size.test.ts`,
   `npm run check:hosts -w cad`. 3–4 días, tras la 1. Defaults seguros. Barrel recortado (642
   exports; 65 se usan fuera de `cad/`). Un informe de API con firmas completas, no solo nombres (las
   piezas llaman a 96 de los 132 métodos de `CadEngine`), como test de instantánea. Presupuestos de
   tamaño como test con el rolldown que trae tsdown: islas por debajo de 1 KB y el motor completo
   hoy en 270 KB gz. `CadDriver` deja de importar el `en.json` crudo (68 KB) y usa una lista de ids
   generada. Un check previo a publicar que instala el tarball en anfitriones ajenos.
3. **Desacoplar el editor del sitio, en su sitio** — 6–9 días en cuatro entregas, tras la 1.
   (a) **Hecha** (61b75e3, b0ddb5a, 7c673de): `CadWorkspace` recibe del anfitrión `mark` y
   `languages` (la página los calcula en el servidor con `languageLinks`), `layoutStorage` (sin
   clave no se guarda nada; el sitio pasa las de hoy desde `lib/site.ts`, congeladas por
   `lib/site.test.ts`; el script de cabecera es `paletteLayoutScript(key)`) y `sheet`, el id y el
   nombre de la transición de la celda del lienzo. Medido después: en `components/cad/` ya no
   queda ningún import del sitio salvo next-intl. Lo que queda para las entregas siguientes:
   next-intl en 23 componentes y el `DirectionProvider` que monta el layout del sitio (b); el
   `<html>` que escriben `applyPaletteLayout` y el script (`data-palette`, `--palette-width`), la
   variante `palette-open`, los tokens de `app/[locale]/(app)/globals.css` y los portales a
   `body` (c); la lógica de §2 (d). `components/ui/`, `lib/utils.ts`, las dos libs de layout y
   `hooks/useCadEngine.ts` ya son del editor: viajan con él en la fase 4.
   (b) **Hecha** (56ad55f, a5dfe4f, 43351c8): el catálogo del editor vive en
   `components/cad/locales/` (`<tag>.json` sin la raíz `Editor`; `npm run locales` escribe
   `<tag>.ts` compilado con icu-minify y `values.ts`, los argumentos de cada mensaje tipados desde
   el inglés). Los 23 componentes lo leen con `useEditorText` (`components/cad/editor-text.tsx`,
   la misma forma que `t` y `t.rich`, con los formateadores de `Intl` sin opciones, como
   next-intl). `CadWorkspace` recibe `editorLocale` y `dir`, monta el `DirectionProvider` y marca
   su `<main>` con `lang` y `dir`; `/draw` carga el catálogo en el servidor
   (`i18n/editor.ts`) y el layout ya no monta `NextIntlClientProvider`. Medido en producción: /draw
   no recibe ningún chunk de next-intl (antes, uno); su JS sube 0,4 KB gz (el catálogo inglés, 3,3
   KB gz, entra en el bundle y sale use-intl) y su HTML baja 3,0 KB gz en inglés y unos 0,2 en
   es y ar. El DOM de las tres páginas es el de antes salvo `<main lang dir>`. Lo que queda: para
   (c), lo de abajo; para la fase 4, el `en.d.json.ts` del catálogo del editor (Oxc no lee el tipo
   de un JSON, como en el motor), su entrada `./locales/<tag>` en `exports`, y el test de
   `components/cad/locales/` viaja con él (los dos checks del sitio, uno por idioma enrutado y
   completo si es `live`, se quedan en `i18n/messages.test.ts`).
   (c) **Hecha** (4e3d4ab, ac2a700, 4f0a36b): la raíz del editor es un `<div>` con
   `data-mellowcad-editor` (`EDITOR_ROOT_ATTRIBUTE`, `lib/editor-root.ts`), `lang` y `dir`, que
   lleva el `<main>` y, detrás, el nodo donde montan los 19 portales de Base UI
   (`usePortalContainer`; ESLint falla en un `Portal` sin `container`). Los tokens, el
   `color-scheme`, los estilos base (el rol de cuerpo incluido) y las reglas `:lang(ar)` viven en
   la raíz; los roles de tipo son `@theme inline`; `--active` lo escribe la raíz desde
   `THEME.grip` (`EDITOR_THEME_STYLE`), y `lib/editor-root.test.ts` los mantiene iguales y falla con
   un token del editor en `:root`. El script de cabecera escribe `data-palette` y
   `--palette-width` en la raíz con un `MutationObserver` mientras se parsea, y `palette-open` los
   lee allí: el editor ya no escribe en `<html>` ni en `<body>`. Medido en producción contra
   8d00796 (Chrome, /draw, /es/draw, /ar/draw a 1920 y 1280; en reposo, cada pestaña, el menú de
   aplicación, un menú y un popover de la barra de estado, un tooltip): las 42 capturas iguales
   píxel a píxel salvo el ruido de la barra de desplazamiento del panel (también entre dos
   ejecuciones del antes), los mismos estilos computados en cada texto y popup, y el mismo apilado
   sobre el lienzo, la entrada dinámica y el ViewCube; anchura y pliegue sobreviven a la recarga
   sin desplazamiento, la caja del lienzo del primer frame es la final, con y sin JS; la
   transición desde la landing forma el par en 36 de 36. La landing no cambia (CSS y JS idénticos
   byte a byte); /draw sube 46 B gz de CSS, 0,2 KB gz de HTML (el script) y 1,1 KB gz de JS (los
   17 `usePortalContainer`, memoizados por el compilador). Lo que queda: para (d), la lógica de §2,
   sin cambios; para la fase 4, la capa `theme` de Tailwind (`--spacing`, sus fuentes y colores) y
   su preflight siguen en `:root`, `html` y `body` (son de Tailwind: el CSS precompilado del
   paquete los acota o los prefija), la parte de página de `globals.css` (`color-scheme` y fondo de
   `body`, el tiempo de la transición) se queda en el sitio, y `data-mellowcad-editor` pasa a ser
   API (el script y el CSS del anfitrión lo nombran).
   (d) **Hecha** (6570edf, 4ce5027, 3c3c985, efb5787, d1de717, 49bec9b, 921f55f, e36269a): la
   lógica de §2 es del motor, con sus tests en el harness. La vista previa de grosor llama a
   `lineweightPixels`; `LENGTH_PRECISIONS` (las precisiones de LUPREC, que fijan también su rango
   en el motor), `POLAR_ANGLE_MENU`, `EngineState.coordinates` (el texto de la barra de estado con
   `formatLength`: el cero sin signo), `ZOOM_MENU`, `ZoomOption` y `zoom(option)` (`navigate` queda
   para Pan y Orbit), `commandLineKey(key)` y `dynamicInputKey(field, key, modifiers)` (dicen si
   tomaron la tecla; `CadDriver.enter`, `escape` y `arrow` pasan por la segunda, así que los 5.094
   tests del motor recorren la ruta del cuadro), y `viewCubePress`, `viewCubeMove` y
   `viewCubeRelease` con `ViewCubeTarget`: el motor distingue clic de arrastre. El umbral se midió
   en AutoCAD 2027 de escritorio (view/d10): el cubo usa el rectángulo de arrastre de Windows, más
   de 4 px en horizontal o en vertical, y orbita desde donde lo deja (antes, 3 px en redondo y desde
   la pulsación). Sobre el dibujo el lazo empieza pasados 7 px en horizontal y 8 en vertical
   (erase/d15), no a los 4 del motor, cuyas tres copias son ahora un `DRAG_THRESHOLD_PX` con el
   valor de siempre y la desviación anotada en `docs/coverage/command-line.md`, para la revisión
   de la selección. Salen de `CadEngine` los 12 métodos que ya no llama ningún anfitrión
   (`viewCubePick`, `compassPick`, `viewCubeDrag`, `submitCommandLine`, `completeCommandLine`,
   `recallCommand`, `setCommandHistoryOpen`, `runUndoMacro`, `commitDynamicInput`,
   `cancelDynamicInput`, `cycleSnap`, `dynamicOptionKey`; `navigate` pierde ZOOM). Medido en el
   navegador contra 4c1a5f2, en /draw, /es/draw y /ar/draw: las coordenadas, las teclas de los dos
   campos, los menús de Zoom y Polar, los grosores y las precisiones dan lo mismo, y las 18
   capturas son iguales píxel a píxel; solo cambia el cubo, como se buscaba (3 px es un clic; un
   arrastre de 12 px gira lo de 7). Lo que hereda la fase 4: los hooks de react se quedan en el
   cableado (`preventDefault`, Command como Ctrl, el foco tras un Tab, la captura del puntero del
   cubo) y el reenfoque del cuadro dinámico (`mayTakeFocus`) sigue en su componente; quedan en el
   editor, como presentación, el orden de los grupos del menú de referencias, el de la barra de
   estado y la paleta, y el desplazamiento del cuadro respecto al cursor. Hallado y sin tocar (el
   aspecto no debía cambiar): en /ar/draw las etiquetas de Polar no son una isla LTR y se leen
   `...360 ,270 ,180 ,90`.
4. **Los paquetes React** — 4–6 días en seis entregas, tras la 2 y la 3. El sitio los consume desde
   el fuente, como al motor. Medido antes de empezar, en a6d96d0:
   - **Lo que cruza.** El editor toma de los hooks `useCadEngine`, `useEngineSelector` y
     `EditorState` (22 módulos, 20 solo el tipo) y 43 nombres del motor; los hooks, `CadEngine`,
     `DrawingStore`, `EngineLocale` y `EngineState`. El sitio toma del editor `CadWorkspace` (con
     `LayoutStorage`, `SheetTransition` y `LanguageLink`), `EditorLocale`, los catálogos `es` y `ar`
     y `paletteLayoutScript`. `cn` lo usan también tres piezas de la landing, y `DirectionProvider` su
     layout: el sitio se queda con los suyos.
   - **React Compiler con tsdown 0.23.2**: `@rolldown/plugin-babel` 0.2.4 (la 0.3.0 está en
     cuarentena) con `babel-plugin-react-compiler` 1.0.0 como plugin de Babel, sin el
     `@vitejs/plugin-react` de la receta de tsdown 0.23.4, que pide `vite` como peer (spike). Sin
     agrupar, cada módulo de `dist` conserva su `"use client"` (rolldown avisa con
     `MODULE_LEVEL_DIRECTIVE`) y la salida importa `react/compiler-runtime`: React 19 es peer.
   - **El CSS.** Compilado con Tailwind 4.3.3, `globals.css` deja fuera de la raíz la capa `theme`
     (`:root, :host`, 14 variables), unas 40 reglas de preflight sobre elementos sueltos
     (`html, :host`, `*`, `button`…), el respaldo de `@property` sobre `*` y lo del sitio. Tailwind
     no tiene opción para acotarlos: el CSS del paquete es su salida con esos selectores
     reescritos a la raíz (`:where([data-mellowcad-editor])`, especificidad cero) en una pasada de
     PostCSS, minificada con Lightning CSS, los dos ya en el árbol. Las fuentes llegan del
     anfitrión en `--font-sans` y `--font-mono`: también es API.
   - **Lo que fallaría en silencio al mover ficheros**: `i18n/logical-properties.test.ts` recorre
     solo `components` y `app`; las globs de ESLint (los literales, el `Portal` sin `container`,
     `type="number"`, los listeners de teclas) nombran `components/` y `hooks/`; el `include` de
     Vitest no ve el test del catálogo fuera de `components/`; `LOAD_SCOPE_PATTERN` de
     `test/knowledge.test.ts` no cuenta `packages/` en el p90; `HOSTS` de `cad/entryPoints.test.ts`;
     los `ALLOWED` por ruta de `lib/control-size.test.ts` y del test de RTL no fallan por una entrada
     huérfana; `tailwindStylesheet` de Prettier y los alias de `components.json`. Los `DIRS` de
     `lib/type-scale.test.ts` y `lib/control-size.test.ts` sí fallan, con ENOENT.

   Las entregas:
   (a) **`@mellowcad/react`, el paquete**: packages/react con los hooks que hay, el sitio por su
   nombre desde el fuente, su build, publint, attw y un check de `"use client"` en el hook, su
   informe de API (el generador del motor, compartido) y, para packages/, lo que fallaría en
   silencio. Sin React Compiler: sus hooks fijan sus identidades a mano, porque
   `useSyncExternalStore` lo pide, y el paquete no necesita Babel. ~1 día.
   (b) **El cableado del DOM**: `<CadCanvas>`, dueño del canvas y del ciclo de vida, y los hooks sin
   estilo que dejó la 3(d) (las teclas de la línea de comandos y de la entrada dinámica, el
   arrastre del cubo), usados por los componentes del editor. ~1 día.
   (c) **`@mellowcad/editor`, en su sitio**: components/cad, components/ui, `lib/utils.ts`,
   `lib/editor-root.ts` y las dos libs de layout pasan a packages/editor; el sitio lo importa por su
   nombre desde el fuente; el `en.d.json.ts` del catálogo y sus entradas `./locales/<tag>`; los
   checks siguen a los ficheros; la landing, con su `cn` y su `DirectionProvider`. ~1,5 días.
   (d) **El build del editor**: tsdown con React Compiler, `isolatedDeclarations`, publint, attw,
   el check de `"use client"` y su informe de API. ~1 día.
   (e) **El CSS precompilado** (`./styles.css`), acotado a la raíz, con un check de que no declara
   nada en `:root`, `html` ni `body`; `data-mellowcad-editor` y las variables de fuente, como API.
   ~1 día.
   (f) **Las piezas una a una** y `<CadEditor>` con huecos para sustituirlas (`components`, como en
   tldraw), en el informe de API. ~1 día.
5. **Ejemplos y documentación** — 2–3 días, tras la 4. Un anfitrión headless en Node y otro con
   Vite + React, que sirven también de smoke tests del check previo a publicar. Un README por paquete,
   a partir de `cad/README.md`.
6. **Publicar el motor 0.1.0** — 2–3 días, tras la 2. Métricas de texto desde una fuente OFL,
   LICENSE MIT, nota de marca, auditoría del historial, Changesets, quitar `private`. Con el sí del
   dueño: repo público, primera publicación desde su máquina con 2FA, trusted publisher, y el CI de
   vuelta (gratis en un repo público).
7. **Publicar react y editor 0.1.0** — 1 día, cuando el ritmo de `components/cad` baje y terminen las
   revisiones de comandos.
8. **Registro shadcn** — bajo demanda, tras la 7.

Bloqueos: 1 → 2 → 6; 1 → 3 → 4 → 5 → 7; la org de npm → 6; 7 → 8. La 2 y la 3 pueden ir en paralelo.

## 5. Descartado

- **El registro shadcn como canal principal del editor**: forks de primitivos, tema global, Base UI
  directo, pérdida del React Compiler y de los arreglos (§2).
- **Mover `cad/` a packages/engine y la app a apps/web**: no aportan función (§3).
- **CJS, Turborepo, pnpm, `size-limit`**: nada los necesita hoy; los presupuestos de tamaño se miden
  con el rolldown que ya trae tsdown.

## 6. Riesgos

- 146 nombres públicos (eran 642; la 3(d) sumó cinco), más lo que sus firmas alcanzan
  (`cad/api.md`): cada uno es una promesa de semver.
- Tres superficies para una persona, sin CI: se publican escalonadas y el hook cubre los paquetes.
- Dependencias nuevas que vigilar: tsdown 0.23.2 usa `rolldown-plugin-dts` en beta (0.23.3 vuelve
  a la 0.28 estable y sale de la cuarentena el 2026-10-31: la próxima revisión la toma); attw trae
  su propio `typescript@5.6.1-rc`, anidado. Ninguna tiene scripts de instalación
  (`npm audit signatures` limpio).
- Sin procedencia mientras el repo sea privado (npm no la genera desde repos privados).
- Propiedad intelectual: los catálogos transcriben el vocabulario de AutoCAD en español (frases
  cortas y nombres funcionales, el riesgo es bajo) y las métricas de texto salen de Arial (se
  cambian de fuente, §7).
- Hacer público el repo es irreversible en la práctica: lo que se haya visto, se ha visto.

## 7. Decisiones tomadas

El dueño las delegó el 2026-10-29. Lo que sale hacia fuera (la org, hacer público el repo, la
primera publicación) se ejecuta en la fase 6, con un sí suyo en ese momento.

- **Licencia MIT**, para los paquetes y el repo: es lo que usan los análogos nativos de shadcn y no
  obliga a nada a quien la usa. Cubre el código, no el nombre ni el logo. Antes de publicar: las
  métricas de texto se vuelven a medir de Arimo o Liberation Sans (SIL OFL, mismas anchuras y
  alturas que Arial por diseño; la tinta se compara con los tests), y AutoCAD solo se nombra para
  describir la compatibilidad, con una nota de que el proyecto no está afiliado a Autodesk.
- **El mismo repo `mellowcad` se hace público** en la fase 6, tras auditar su historial (secretos) y
  lo que versiona. Con un repo público, GitHub Actions es gratis en sus runners estándar: vuelve el
  CI y se publica con trusted publishing y procedencia, sin coste.
- **Org de npm `mellowcad`**, plan gratuito (paquetes públicos ilimitados). Solo el dueño puede
  crearla, con su cuenta y 2FA; conviene hacerlo pronto para reservar el nombre.
- **Nombres**: `@mellowcad/engine`, `@mellowcad/react`, `@mellowcad/editor`.
- **Sin tier de pago**: open source puro. Se reconsidera solo si hay adopción.
- **Publicar sin coste**: la primera versión de cada paquete, desde la máquina del dueño con 2FA (el
  trusted publisher se configura en los ajustes de un paquete que ya existe); las siguientes,
  desde GitHub Actions con trusted publishing.
