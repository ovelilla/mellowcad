# MellowCAD como librería — brief

> **Estado:** fases 1, 2, 3, 4 y 5 hechas (2026-10-30); de la 6, la parte local (2026-10-30), y
> lo de fuera espera el sí del dueño; las demás, sin ejecutar. Sigue la convención de `docs/next-*.md`: se borra cuando la fase 7 haya ocurrido. El
> análisis completo, con el inventario medido, las fuentes fechadas, el spike y el pase adversarial,
> está en https://claude.ai/artifact/VZnAHvDFL8wGadysVcjMdx (privado). El spike vive en la rama
> local worktree-agent-a498997d3f29c107f (commit 9bc6682), sin empujar.

## 1. Objetivo

mellowcad.com pasa a ser un sitio que _usa_ una librería CAD, sin lógica CAD propia; el motor y el
editor pasan a ser paquetes que cualquiera puede usar. Nada sale hacia fuera (npm, repo público,
Vercel) sin la palabra del dueño (§7).

## 2. Arquitectura

Las tres capas de la idea original se mantienen, pero el corte que decide es **npm para lo que lleva
lógica y tiene que poder recibir un arreglo; copy-in (registro shadcn) solo para presentación fina y
estable**. El editor hoy no es ninguna de las dos cosas: sus primitivos son forks (`button` con
`active`, `icon-flyout`, `cube`), su tema es global (`:root`, `dark:` siempre activo, portales a
`body`), usa Base UI directamente (19 `render=`) y cambia mucho (88 commits en components/cad
desde el 1 de septiembre). Por eso va a npm, y el registro llega después.

| Paquete             | Forma | Qué lleva                                                                                                                                                                                                                                                                                 | Cuándo                |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `@mellowcad/engine` | npm   | `cad/` tal cual (con `CadEngine` y los presentadores). Entradas `.` y `./locales/{en,es,ar}`, lista explícita. `sideEffects: false`, ESM, solo `icu-minify`.                                                                                                                              | primer lanzamiento    |
| `@mellowcad/react`  | npm   | `<CadCanvas>`, dueño del canvas y del ciclo de vida, `useEditorState`, `useEngineSelector` y los hooks de comportamiento sin estilo (`useCommandLineInput`, `useDynamicInput`, `useViewCubeDrag`). Sin CSS ni Base UI. Motor como peer.                                                 | segundo lanzamiento   |
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

1. **El motor, paquete del workspace** — **hecha** (d8bdad3, 95abf9b, e048eae; su regla es
   `.claude/rules/engine-package.md`). 1–2 días, sin dependencias. Antes, recortar `AGENTS.md`
   (10.210 B con un tope de 10 KB: 30 B de margen). Adoptar el spike: workspaces en `package.json`,
   el package.json propio de `cad/` (privado), los imports `@/cad` por `@mellowcad/engine`,
   `cad/entryPoints.test.ts` leyendo los `exports` y mapeando el nombre del paquete a su ruta (un
   import profundo sigue fallando), tsdown con `isolatedDeclarations`, `dist/` ignorado por git,
   ESLint, Prettier y la cobertura, y build + publint + attw en `.githooks/pre-commit`. Actualizar
   lo que queda falso: `cad/README.md` (columna «Today»), `.claude/rules/cad-engine.md`, `ui.md`,
   `i18n.md`, `marketing.md`, y una regla de empaquetado donde quepa en el presupuesto.
2. **La superficie pública del motor** — **hecha** (911117f, 2382c5d, 59c0ec5, 81d41c5, 3816c90,
   39c5d2c): 141 nombres en el barrel, `cad/api.md`, `cad/size.test.ts`,
   `npm run check:hosts -w cad`. 3–4 días, tras la 1. Defaults seguros. Barrel recortado (642
   exports; 65 se usan fuera de `cad/`). Un informe de API con firmas completas, no solo nombres (las
   piezas llaman a 96 de los 132 métodos de `CadEngine`), como test de instantánea. Presupuestos de
   tamaño como test con el rolldown que trae tsdown: islas por debajo de 1 KB y el motor completo
   hoy en 270 KB gz. `CadDriver` deja de importar el `en.json` crudo (68 KB) y usa una lista de ids
   generada. Un check previo a publicar que instala el tarball en anfitriones ajenos.
3. **Desacoplar el editor del sitio, en su sitio** — 6–9 días en cuatro entregas, tras la 1.
   (a) **Hecha** (e7e7725, cca5e90, 4815cf5): `CadWorkspace` recibe del anfitrión `mark` y
   `languages` (la página los calcula en el servidor con `languageLinks`), `layoutStorage` (sin
   clave no se guarda nada; el sitio pasa las de hoy desde `lib/site.ts`, congeladas por
   `lib/site.test.ts`; el script de cabecera es `paletteLayoutScript(key)`) y `sheet`, el id y el
   nombre de la transición de la celda del lienzo. Medido después: en components/cad/ ya no
   queda ningún import del sitio salvo next-intl. Lo que queda para las entregas siguientes:
   next-intl en 23 componentes y el `DirectionProvider` que monta el layout del sitio (b); el
   `<html>` que escriben `applyPaletteLayout` y el script (`data-palette`, `--palette-width`), la
   variante `palette-open`, los tokens de `app/[locale]/(app)/globals.css` y los portales a
   `body` (c); la lógica de §2 (d). `components/ui/`, `lib/utils.ts`, las dos libs de layout y
   `hooks/useCadEngine.ts` ya son del editor: viajan con él en la fase 4.
   (b) **Hecha** (1149321, e054052, 6265cb2): el catálogo del editor vive en
   components/cad/locales/ (`<tag>.json` sin la raíz `Editor`; `npm run locales` escribe
   `<tag>.ts` compilado con icu-minify y `values.ts`, los argumentos de cada mensaje tipados desde
   el inglés). Los 23 componentes lo leen con `useEditorText` (components/cad/editor-text.tsx,
   la misma forma que `t` y `t.rich`, con los formateadores de `Intl` sin opciones, como
   next-intl). `CadWorkspace` recibe `editorLocale` y `dir`, monta el `DirectionProvider` y marca
   su `<main>` con `lang` y `dir`; `/draw` carga el catálogo en el servidor
   (`i18n/editor.ts`) y el layout ya no monta `NextIntlClientProvider`. Medido en producción: /draw
   no recibe ningún chunk de next-intl (antes, uno); su JS sube 0,4 KB gz (el catálogo inglés, 3,3
   KB gz, entra en el bundle y sale use-intl) y su HTML baja 3,0 KB gz en inglés y unos 0,2 en
   es y ar. El DOM de las tres páginas es el de antes salvo `<main lang dir>`. Lo que queda: para
   (c), lo de abajo; para la fase 4, el `en.d.json.ts` del catálogo del editor (Oxc no lee el tipo
   de un JSON, como en el motor), su entrada `./locales/<tag>` en `exports`, y el test de
   components/cad/locales/ viaja con él (los dos checks del sitio, uno por idioma enrutado y
   completo si es `live`, se quedan en `i18n/messages.test.ts`).
   (c) **Hecha** (a6cf84d, 3f956bd, f2fb934): la raíz del editor es un `<div>` con
   `data-mellowcad-editor` (`EDITOR_ROOT_ATTRIBUTE`, lib/editor-root.ts), `lang` y `dir`, que
   lleva el `<main>` y, detrás, el nodo donde montan los 19 portales de Base UI
   (`usePortalContainer`; ESLint falla en un `Portal` sin `container`). Los tokens, el
   `color-scheme`, los estilos base (el rol de cuerpo incluido) y las reglas `:lang(ar)` viven en
   la raíz; los roles de tipo son `@theme inline`; `--active` lo escribe la raíz desde
   `THEME.grip` (`EDITOR_THEME_STYLE`), y lib/editor-root.test.ts los mantiene iguales y falla con
   un token del editor en `:root`. El script de cabecera escribe `data-palette` y
   `--palette-width` en la raíz con un `MutationObserver` mientras se parsea, y `palette-open` los
   lee allí: el editor ya no escribe en `<html>` ni en `<body>`. Medido en producción contra
   d35e983 (Chrome, /draw, /es/draw, /ar/draw a 1920 y 1280; en reposo, cada pestaña, el menú de
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
   (d) **Hecha** (436078e, bbad125, 2893587, 29450d0, 60e3c70, b2a781c, 9073173, dd5607e): la
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
   navegador contra 3a077d2, en /draw, /es/draw y /ar/draw: las coordenadas, las teclas de los dos
   campos, los menús de Zoom y Polar, los grosores y las precisiones dan lo mismo, y las 18
   capturas son iguales píxel a píxel; solo cambia el cubo, como se buscaba (3 px es un clic; un
   arrastre de 12 px gira lo de 7). Lo que hereda la fase 4: los hooks de react se quedan en el
   cableado (`preventDefault`, Command como Ctrl, el foco tras un Tab, la captura del puntero del
   cubo) y el reenfoque del cuadro dinámico (`mayTakeFocus`) sigue en su componente; quedan en el
   editor, como presentación, el orden de los grupos del menú de referencias, el de la barra de
   estado y la paleta, y el desplazamiento del cuadro respecto al cursor. Hallado (el aspecto no
   debía cambiar) y arreglado después: en /ar/draw las etiquetas de Polar no eran una isla LTR y
   se leían `...360 ,270 ,180 ,90`.
4. **Los paquetes React** — **hecha** (ad46dfb..a4711fd). 4–6 días en seis entregas, tras la 2 y la 3. El sitio los consume desde
   el fuente, como al motor. Medido antes de empezar, en 8f0b84d:
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
     los `ALLOWED` por ruta de lib/control-size.test.ts y del test de RTL no fallan por una entrada
     huérfana; `tailwindStylesheet` de Prettier y los alias de `components.json`. Los `DIRS` de
     lib/type-scale.test.ts y lib/control-size.test.ts sí fallan, con ENOENT.

   Las entregas:
   (a) **Hecha** (ad46dfb, e5af535, 864f339): **`@mellowcad/react`, el paquete**. packages/react
   lleva `useCadEngine`, `useEngineSelector`, `EditorState` y `UseCadEngineOptions` (motor y React
   19 como peers); el sitio lo importa por su nombre desde el fuente (`paths`, alias de Vitest). Su
   build es el del motor sin catálogos, sin React Compiler (los hooks fijan sus identidades a mano,
   que `useSyncExternalStore` pide); el hook construye y comprueba el motor y cada paquete de
   packages/, y `check` añade `scripts/packages/client-directive.ts`, que falla si un módulo de
   `dist` usa el runtime de React sin `"use client"` (rolldown lo conserva sin agrupar; su aviso se
   descarta por código). El generador de `cad/api.md` es `test/apiReport.ts`, compartido: oculta
   todo fuente del workspace tras la declaración que construiría, cruza paquetes por `paths` y
   reporta solo lo propio (`cad/api.md` sale idéntico; `packages/react/api.md`, con `POINTER_KEYS`
   como alcanzado). Lo que habría dejado de ver ficheros: la regla de ESLint de los listeners de
   teclas (`hooks/` → packages/react/src), `HOSTS` del test de entradas y el `LOAD_SCOPE_PATTERN`
   del de conocimiento (más packages/, y sus workspaces expandidos); `test/packages.test.ts` sujeta
   cada paquete de packages/ a su nombre y sus `exports` desde fuera (relativo, `@/` o profundo
   fallan, probado). La regla de empaquetado habla de los paquetes. Medido en producción contra
   8f0b84d (Chrome, /draw, /es/draw y /ar/draw a 1920 y 1280; en reposo, el menú de aplicación, el
   de referencias, un tooltip de la paleta de herramientas y la pestaña Capas a 1920): las 30
   capturas iguales píxel a píxel y el DOM del editor idéntico; el JS de /draw pesa lo mismo
   (597.144 B gz) y su CSS es el mismo byte a byte. Lo que hereda la (b): las piezas del cableado
   siguen en sus componentes; el `check:hosts` de react espera a los ejemplos (fase 5); las reglas
   de ESLint de `components/**` (literales, `Portal`, `type="number"`) y los checks de tipo, tamaño
   y RTL siguen nombrando components/, para la (c).
   (b) **Hecha** (1671ee6, add3a3a, 12d379d): **el cableado del DOM**. `<CadCanvas>` pinta el
   `<canvas>` con los atributos del anfitrión, construye el motor al montarse con sus opciones
   (leídas una vez: `store`, `scope`, `locale`, `paletteOpen`), lo entrega con
   `onEngine(engine)` y lo libera al desmontarse (`onEngine(null)`); el estado del chrome es
   `useEditorState(engine)`. Salen `useCadEngine` y `UseCadEngineOptions`: la construcción pasó
   al componente y las opciones son sus props (0.0.0, sin publicar; el editor era el único
   llamador). Los hooks: `useCommandLineInput` (valor, escritura y teclas del campo, sin
   autocompletar del navegador), `useDynamicInput` (la caja, su marca `data-dynamic-input` y las
   props de cada campo: Command como Ctrl, `preventDefault`, el foco tras un Tab, la selección al
   enfocar, el cursor al final de un párrafo; y el reenfoque tras cada render con `mayTakeFocus`,
   que la 3(d) dejaba en el componente: comparte con el `onFocus` de los campos la bandera que
   distingue un reenfoque del usuario, así que van juntos) y `useViewCubeDrag` (la pulsación
   izquierda, la captura en la superficie, ahora un ref y no `ownerSVGElement`, los movimientos,
   la suelta y el puntero perdido). Se prueban en Node sin jsdom: `test/renderHook.ts` hace un
   render con el renderizador de servidor y los manejadores reciben eventos hechos a mano; lo que
   corre un efecto es una función aparte (`takeFocus`, `mountEngine`). `api.md`: ocho nombres
   (eran cuatro). Medido en producción contra 5de813d (Chrome, /draw, /es/draw y /ar/draw; en
   reposo a 1920 y 1280, y a 1920 escribir en la línea de comandos, Espacio como Intro, la entrada
   dinámica tomando el foco, una longitud, Tab al ángulo, Command+Z, el cubo con hover, un clic
   bajo el umbral, un arrastre y uno que sale de su caja, el orden de Tab desde el body, y el
   cursor de un párrafo de MTEXT): 34 de 36 capturas iguales píxel a píxel y las otras dos con 3
   px en un dígito de las coordenadas, como dos ejecuciones de 5de813d entre sí; el foco, la
   selección y los valores, iguales tras cada paso; el DOM del editor, el mismo salvo el orden de
   tres atributos del `<input>` de la línea de comandos. El JS de /draw sube 0,6 KB gz, su CSS y
   la landing no cambian. Lo que hereda la (c): los componentes importan los hooks de
   `@mellowcad/react` (el editor lo tendrá como peer, con el motor); el lint de refs del React
   Compiler toma por ref un objeto con un miembro pasado como `ref` (por eso se desestructura
   `useViewCubeDrag`); el cableado que queda en components/cad es del propio chrome, no de una
   llamada al motor (el asa de anchura de la paleta con su captura, las flechas de `DecimalInput`,
   las teclas de los menús), y viaja con él; `test/renderHook.ts` sirve también a los tests del
   paquete del editor; el `check:hosts` de react sigue esperando a los ejemplos (fase 5).
   (c) **Hecha** (1481b09, 0fd4050, 49c0100): **`@mellowcad/editor`, en su sitio**. components/cad,
   components/ui y las libs editor-root, palette-layout y status-bar-layout pasan con `git mv` a
   `packages/editor/src` (el catálogo en `locales/`, los primitivos en `ui/`), con sus tests y los
   de tamaño, tipo y `cn`; el historial los sigue. `lib/utils.ts` y `components/ui/direction.tsx`
   no se mueven: son de la landing, byte a byte, y el editor lleva copias. El paquete es privado
   0.0.0 con el motor, react y React 19 como peers y las dependencias que ya tenía la raíz (el
   lockfile solo gana el enlace); `index.ts` exporta lo que usa el sitio: `CadWorkspace`,
   `paletteLayoutScript` y el tipo `EditorLocale`, más `./locales/{en,es,ar}`, una entrada por
   catálogo (su test lo sujeta). El sitio lo importa por su nombre desde el fuente. Sin build
   todavía: el hook corre cada script con `--if-present` y `test/packages.test.ts` solo deja
   saltárselo al que lista como pendiente. `npm run locales` escribe el `en.d.json.ts` del
   catálogo, con test de deriva; `tsc` lo lee (probado). Los checks que fallaban en silencio,
   arreglados y probados uno a uno haciéndolos fallar en packages/editor: las cinco reglas de
   ESLint (ahora también en `ui/`, que pasa la de literales); un `@/` dentro de un paquete, que
   seguía resolviendo a la copia del sitio, o una ruta relativa que sale de él; el test de RTL
   recorre packages/ y, como el de tamaños, falla con una excepción que ya no casa (encontró una
   vieja, `left-1/2` del área de trabajo); el test que impide a la landing incrustar piezas que
   leen el catálogo sigue el nombre por el barrel; `TEST_ROOTS` de `lib/facts.ts` cuenta
   packages/editor (sin eso la cifra de la landing bajaba de 4.400 a 4.300); los alias de
   `components.json` apuntan al editor; el `tailwindStylesheet` de Prettier ya lo alcanzaba
   (probado). Las reglas siguen a los ficheros; el p90 de reglas por fichero sigue en 46,7 KB.
   Medido en producción contra 8e30619 (Chrome; la landing en /, /es, /ar, /privacy y
   /ar/privacy a 1440, página entera; /draw, /es/draw y /ar/draw a 1920 y 1280 en reposo y, a
   1920, el menú de aplicación, el selector de capas, un tooltip de la paleta, los menús de
   referencias y de Polar, Personalización, la pestaña Capas y LINE con la entrada dinámica): las
   72 capturas iguales píxel a píxel (dos ejecuciones de la base difieren entre sí en dos de
   /ar/draw), el DOM del editor y el foco iguales, el `<head>` igual salvo los nombres de los
   chunks. La landing carga los mismos 13 ficheros de JS y CSS con el mismo hash; /draw, los
   mismos salvo un chunk de JS con los mismos módulos renumerados (mismo tamaño, +5 B gz), y su
   CSS es el mismo byte a byte. Hallado y sin tocar (la landing no debía cambiar): los 22 tests
   de packages/react nunca se contaron; contarlos lleva la cifra a 4.500. Lo que hereda la (d):
   sacar el editor de la lista de pendientes de `test/packages.test.ts` al darle `build` y
   `check`; `icons.tsx` y `ui/button.tsx` usan React sin `"use client"` (solo los importan
   módulos de cliente), y el check de `dist` los señalará; los tipos que alcanza el barrel
   (`LayoutStorage`, `SheetTransition`, `LanguageLink`) entran en su informe de API;
   `class-variance-authority` ya solo lo usa el editor y sigue también en la raíz. Para la (e),
   `globals.css` sigue en el sitio, y `editor-root.test.ts` y `palette-layout.test.ts` lo leen por
   ruta relativa, como la `css` de `components.json`.
   (d) **Hecha** (9538649, ae3fac2, c76e614): **el build del editor**. Medido antes en 59a89df
   con el tsconfig del build: 87 errores de `isolatedDeclarations`, todos mecánicos (51 TS9007:
   los componentes y los envoltorios de `ui/` devuelven `ReactElement`, `| null` los cuatro que
   pueden no pintar nada, y `cn`, `string`; 36 TS9010: los 33 glifos son `LucideIcon`, `Select`
   es `typeof SelectPrimitive.Root`, `buttonVariants` lleva escrito su tipo, y
   `EDITOR_THEME_STYLE` pierde el `as const satisfies`). Solo anotaciones. tsdown como el motor,
   con las entradas de catálogo (sus `.d.ts` leen el tipo de `en.d.json.ts`; los de `dist`
   tipan solos sin `skipLibCheck`), y el React Compiler con `@rolldown/plugin-babel` 0.2.4 y
   `babel-plugin-react-compiler` 1.0.0 con las opciones de Next (la 0.3.0 del plugin y tsdown
   0.23.3 siguen en cuarentena): 101 funciones compiladas, ningún bailout, y los 33 módulos con
   JSX importan `react/compiler-runtime`. `check` es publint `--strict`, attw y
   `client-directive.ts --compiled`, que ahora falla también con un módulo con JSX sin el
   runtime del compilador; probado rompiendo cada cosa (sin `"use client"` en
   `cad-workspace.tsx`, sin el plugin). El check señaló `ui/button.tsx`, que ahora es cliente
   (el compilador da a `Button` una caché, que es un hook); `icons.tsx` se queda sin directiva:
   no importa React, solo `createLucideIcon`, que un componente de servidor puede importar.
   `UNBUILT` desaparece y el hook ya no pasa `--if-present`: un paquete sin `build` y `check`
   lo hace fallar; desde un árbol sin `dist` el bucle pasa en el orden del glob (editor antes
   que react). `packages/editor/api.md`: los tres nombres y los catálogos, y lo que alcanzan
   (`WorkspaceProps` con `LayoutStorage`, `SheetTransition` y `LanguageLink`; `EditorCatalog`,
   `EditorMessages`, `DeepPartial`, `Compiled`); un campo añadido a `LanguageLink` lo hace
   fallar. Dependencias: solo entra `@rolldown/plugin-babel` (código publicado leído, sin
   scripts, firmas verificadas); lo demás ya estaba en el árbol. El paso de paquetes del hook
   pasa de 3,9 s a 7,8 s (el build del editor, 2,5 s, 1,9 de ellos Babel; su check, 1,2) y el
   hook entero, en reposo, de ~52 s a ~55 s. Medido en producción contra 59a89df: los 18
   ficheros de JS y CSS de `.next/static` iguales en nombre y bytes, y las 14 páginas
   prerenderizadas (/, /draw, /es/draw, /ar/draw entre ellas) iguales salvo el build id. Lo que
   hereda la (e): `dist` no lleva CSS (sus clases las compila el sitio desde `globals.css`), así
   que un anfitrión de `dist` aún no tiene estilos; `ButtonVariantProps` repite las variantes de
   `cva` (Oxc no infiere su tipo: una nueva va en los dos sitios, y el comentario lo dice);
   `WorkspaceProps.mark` es `React.ReactNode` por el espacio de nombres global de @types/react,
   y el informe imprime el patrón desestructurado de `CadWorkspace`: los dos cambian con las
   piezas de la (f). El `check:hosts` del editor espera a los ejemplos (fase 5), como el de
   react; la próxima revisión de dependencias toma tsdown 0.23.3 y el plugin 0.3.0 juntos en los
   tres paquetes.
   (e) **Hecha** (6e428d3, 7c1ec3f, 8aa9dd6): **el CSS precompilado**. Medido antes en 6df803f:
   Tailwind 4.3.3 deja fuera de la raíz la capa `theme` (14 variables en `:root, :host`), 37 reglas
   de preflight, la capa `properties` (`--shimmer-angle` en `:root, :host` y el respaldo de
   `@property` en `*`) y las 3 reglas del sitio; el CSS de /draw es todo del editor salvo esas 3,
   `.antialiased` y `.font-sans` del `<html>` del sitio y unas 25 utilidades que la detección
   automática saca de docs, reglas y tests (`text-[Npx]`, `collapse`…); la landing no lleva nada
   del editor. El tema declaraba `--font-sans: var(--font-sans)` y su propia `--font-mono` en
   `:root`, muertas en el sitio (las clases de next/font en `<html>`, sin capa, ganan) pero, en la
   raíz, un ciclo y una fuente tapada. Lo hecho: la mitad del editor de `globals.css` es
   packages/editor/src/styles.css, sin el `@import "tailwindcss"` (lo pone quien compila), y
   `globals.css` la importa por ruta, como `paths` le da los módulos; los dos tests que leían
   `globals.css` desde el paquete leen su hoja, y `components.json` apunta a ella. Las fuentes
   son `@theme inline reference`: las utilidades las leen y Tailwind no las declara. El build
   (`scripts/editor/styles.ts`, tras tsdown) compila esa hoja con `source(none)` y solo las
   fuentes del paquete, lleva lo de página a la raíz (el documento pasa a
   `:where([data-mellowcad-editor])`, lo demás a `:where(raíz, raíz *)` en su primer compuesto:
   especificidad cero) y minifica con la pasada de Lightning CSS de Tailwind: 58.844 B, 9.908 B gz.
   `check` falla con un selector que nombre `html`, `body`, `:root` o `:host`, o ni la raíz ni una
   clase (probado quitando la pasada); attw salta la hoja (no es un módulo) y publint queda
   limpio. `sideEffects` es `["**/*.css"]`: webpack 5 tira `import "@mellowcad/editor/styles.css"`
   con `false` (medido; Vite la conserva igual). `api.md` gana `./styles.css`, escrita desde el CSS
   compilado: la raíz, las capas (`properties`, `theme`, `base`, `components`, `utilities`) y lo
   que pone el anfitrión, lo que se lee sin respaldo y nunca se declara salvo lo que el editor
   escribe en línea (`--active`, las variables de los posicionadores de Base UI): `--font-sans` y
   `--font-mono` (probado: sin `reference`, desaparecen). Dependencias: ninguna nueva; las
   devDependencies del editor nombran lo que su build usa, ya en el árbol. Medido en producción
   contra 6df803f: tras la mudanza, los 38 ficheros de `.next/static` iguales en nombre y bytes;
   al final solo cambia el CSS de /draw, sin las dos declaraciones de fuente (−140 B, −19 B gz),
   y las páginas prerenderizadas son iguales salvo el build id y el nombre de ese CSS. En Chrome,
   /draw, /es/draw y /ar/draw a 1920 y 1280, en reposo y con el menú de aplicación: los 7.522
   elementos con todos sus estilos computados iguales y las 12 capturas idénticas. Con la hoja
   del paquete en lugar del CSS del sitio (bajada con los targets de Next) y lo mínimo de un
   anfitrión: `<html>` y `<body>` no reciben nada, y dentro de la raíz todo valor es el del sitio
   salvo la marca del sitio (`size-5`, una clase del anfitrión). El paso de paquetes del hook pasa
   de ~7,3 s a ~7,6 s, y el hook entero, en caliente, de 55,6 s a 56,6 s. Lo que hereda la (f): las utilidades siguen siendo clases globales y
   `@keyframes` y `@property` son del documento (`spin`, `enter`, `exit`, `prompt-fade`, los
   `--tw-*`): un anfitrión con otro Tailwind o tw-animate-css comparte esos nombres; una pieza
   sustituida trae sus clases, que compila el anfitrión, como la marca de hoy. La hoja apunta al
   baseline de Tailwind (Safari 16.4, Chrome 111, Firefox 128); el bundler del anfitrión baja más
   si quiere. Cuando el sitio pase a `dist` (antes de la 1.0), su parte de página necesita su
   propio preflight para `html` y `body` (el margen del body, la cadena de alturas) y compilar
   sus clases (`size-5`, `antialiased`, `font-sans`); las utilidades sueltas desaparecen. El
   `check:hosts` del editor (fase 5) debería importar la hoja desde el tarball en Vite y en Next.
   (f) **Hecha** (38284c5, efc75d1, a4711fd): **las piezas una a una y `<CadEditor>` con
   huecos**. Medido antes en c6e91e5: `CadWorkspace` compone nueve piezas que reciben solo
   `{ engine, state }` (la barra superior, además, `mark` y `languages`; la de estado, su clave;
   la entrada dinámica, una etiqueta del catálogo heredada de cuando la landing la incrustaba) y
   siete internas: los menús contextual, de referencias y de ciclo de selección, los tres
   diálogos, que el motor abre y de los que espera respuesta (`answerUnsavedText`, el menú que
   toma la siguiente pulsación), y el tooltip de rollover y el asa de la paleta, que van con su
   zona. Entre piezas no se comparte estado ni refs: solo la anchura de la paleta, del área de
   trabajo. tldraw 5.6.0 (2026-10-29): `TLUiComponents` es un registro de
   `ComponentType<Props> | null` opcionales (ausente, el de serie; `null`, apagado), los de serie
   se exportan para envolverlos y sus sustitutos leen el estado por contexto (`useEditor`). Lo
   hecho: `CadWorkspace` pasa a ser `CadEditor` (el sitio era su único llamador) con sus props en
   `CadEditorProps`, y `components: CadEditorComponents` con nueve huecos por el nombre de su pieza
   (`TopBar`, `ToolRail`, `PalettePanel`, `CommandLine`, `StatusBar`, `ViewportControls`,
   `ViewCube`, `NavigationBar`, `DynamicInput`). El sustituto recibe por props lo mismo que la
   pieza, no por contexto: `PieceProps`, y `TopBarProps` y `StatusBarProps` con lo que el
   anfitrión le da; con `null` su zona desaparece desde el primer pintado y el lienzo toma el
   sitio; la zona, su tamaño y su borde siguen siendo del editor. Los menús y diálogos no son
   huecos: apagarlos dejaría al motor esperando. Se exportan las nueve piezas (para envolver una
   o ponerla en un sustituto) y los cinco tipos (para tipar un sustituto o guardar los huecos en
   un módulo); `api.md` los recoge con lo que alcanzan, y añadir un campo a `PieceProps` o
   cambiar el tipo de un hueco lo hace fallar (probado). `EditorZones` (`@internal`, fuera de
   `dist`) es la rejilla con sus piezas, para que `cad-editor.test.ts` le dé un motor de
   pega con el renderizador de servidor: prueba que un sustituto pinta en el sitio de la pieza
   con el mismo motor, estado y props del anfitrión y que una pieza apagada se lleva su zona
   desde el primer pintado de `CadEditor` (los dos fallan rompiendo el hueco). Los restos de la
   (d): `ButtonVariantProps` sale de las claves de un objeto de variantes que Oxc sí infiere;
   `mark` es `ReactNode` importado; y el informe nombra un parámetro desestructurado por su tipo
   (`cadEditorProps: CadEditorProps`), no por el patrón (`cad/api.md` cambia en `recordDemo`).
   Dependencias: ninguna. Medido en producción contra c6e91e5: los 18 ficheros de JS y CSS de
   `.next/static` iguales salvo el chunk del editor de /draw (+355 B, +120 B gz); el CSS, igual
   byte a byte; las páginas de /draw, iguales salvo el build id, ese chunk y la referencia de
   cliente (`CadEditor`); la landing cambia solo la cifra de tests, que redondea hacia abajo a la
   centena y pasa de 4.496 a 4.500 con los cuatro tests nuevos (4.400+ → 4.500+, en los tres
   idiomas). En Chrome, /draw, /es/draw y /ar/draw a 1920 y 1280 en reposo y a 1920 con el menú de
   aplicación: los 5.067 elementos con sus atributos, cajas y estilos computados iguales, las 9
   capturas idénticas píxel a píxel y el mismo foco. Un anfitrión de `dist` (rolldown con
   `sideEffects`, React fuera): `CadEditor` pesa 418,2 KB gz (`CadWorkspace`, 417,6); solo
   `ViewCube`, 65,2; solo `StatusBar`, 77,0: el barril más grande no arrastra lo que no se
   importa. La cobertura de líneas baja de 96,1 % a 93,1 % sin bajar de los umbrales: el test
   carga por primera vez los componentes del editor y v8 cuenta lo que se carga.
5. **Ejemplos y documentación** — **hecha** (6fabbcf, 190b653, 983aea7, 104f5a0). Medido antes:
   el `check:hosts` del motor tardaba ~11 s con la caché de npm caliente (empaqueta, instala el
   tarball con `typescript` y `vite` exactos en un `/tmp`, sin el `.npmrc` del repo). Lo hecho:
   `examples/` fuera de los workspaces (Vite, su plugin y Next no entran en el lockfile), con tres
   anfitriones que un extraño copiaría: `engine-node` (CadDriver dibuja, `SAVE` entrega el fichero
   a un `FileTransport` que escribe a disco, la escena sale a SVG; `node main.ts`), `editor-vite`
   (`<CadEditor />`, la hoja importada del paquete, `--font-sans`/`--font-mono` y el body sin
   margen) y
   `editor-next` (una página de servidor da a `TopBar` un componente `"use client"` del anfitrión
   y apaga `PalettePanel`; fuentes de next/font, clases del sustituto con su propio Tailwind). El
   check pasa a `scripts/packages/hosts.ts`, uno para los tres: lee el paquete del directorio
   desde el que npm lo lanza, construye, comprueba y empaqueta ese paquete y sus peers nuestros,
   copia cada anfitrión (un ejemplo, o ficheros propios) con nuestros paquetes apuntando a los
   tarballs y el `.npmrc` del repo (la cuarentena), instala y corre sus pasos. Motor (~15 s): el
   ejemplo corre y tipa, y el anfitrión ajeno de antes. React (~40 s): los dos ejemplos del editor
   sin el editor; en Vite la página es el primer bloque `tsx` de su README (tsc sin
   `skipLibCheck`, build, un render con el renderizador de servidor), en Next una página de
   servidor pinta `CadCanvas`. Editor (~1 min): Vite tipa sin `skipLibCheck`, empaqueta con la
   hoja y renderiza `CadEditor` en español en Node; Next con Turbopack y con webpack prerenderiza
   la raíz y la zona superior sin la del panel, la carga de la página nombra la referencia de
   cliente `HostTopBar`, y su CSS lleva la hoja y la clase del anfitrión. `prepublishOnly` lo
   corre en los tres; el hook no (red). Rotos a propósito: sin `SvgScenePresenter` en el barril
   falla el ejemplo del motor; sin `useCommandLineInput`, el tsc del README de react; la hoja
   fuera de `files`, el `check` del editor (publint) y, saltándolo, el build de Vite. Un README
   por paquete (`packages/react/README.md`, `packages/editor/README.md`; `cad/README.md` gana
   «Without a browser»), sujetos por `test/packages.test.ts`: uno por paquete, cada import nombra
   una entrada y lo que exporta según su `api.md`, cada nombre PascalCase o especificador de la
   prosa está en los informes, y un bloque con la ruta de un ejemplo en su info string es ese
   fichero palabra por palabra (probado rompiendo cada uno); `test/knowledge.test.ts` los lee
   también. El mismo test fija los rangos de los ejemplos (`^versión` de los nuestros, el de la
   raíz para lo que el repo también usa); `vite` y `@vitejs/plugin-react` van en deps-review.
   Respuestas a lo que dejaba la 4: **una página de servidor sí puede** pasar en `components` un
   componente de un módulo `"use client"` (y `null`); **Next no tira la hoja** con
   `sideEffects: false` ni con Turbopack ni con webpack (Next marca el CSS como efecto lateral;
   medido): quien la tira es el webpack 5 suelto de la 4(e), que el check no cubre, y la lista se
   queda por él; **una pieza fuera de `CadEditor`** sale sin tokens, en inglés, con los popups en
   `<body>` sin estilo, y sin los menús y diálogos que monta `CadEditor`, así que un comando que
   abre uno espera para siempre: exportar la raíz arreglaría lo primero, no lo último, y una
   página con menos piezas es `CadEditor` con las demás a `null`. Lo dice el README; ningún
   nombre público nuevo. Lo que un anfitrión pone y el sitio ya pone: `--font-sans` y
   `--font-mono`, el body sin margen (el editor es `100svh`) y, para un sustituto, su propio
   Tailwind. Las piezas solo pintan cuando el motor existe, tras montar: un prerender tiene zonas,
   no piezas. En el repo: el `tsc` raíz comprueba los ejemplos contra el fuente salvo sus
   `vite.config.ts`, y el `globals.css` del sitio salta `examples/` en la detección de Tailwind.
   Hallado: las declaraciones del motor nombran tipos del DOM (`CadEngine` toma un canvas), así
   que un proyecto Node sin `"dom"` en `lib` y con `skipLibCheck` apagado no compila (el ejemplo
   deja el de `tsc --init`; el README lo dice). Hallado y arreglado después: `dispose()`
   cancelaba un autoguardado pendiente (350 ms de debounce) y `CadEngine` no lo vaciaba al cerrar la
   página; ahora lo escriben `dispose()`, `pagehide` y `visibilitychange`. Dependencias: solo `@vitejs/plugin-react`
   6.1.2, en el ejemplo (una dependencia, sin scripts de instalación, código leído). Medido en
   producción contra 65989c0, cada build en un worktree limpio: los 38 ficheros de `.next/static`
   iguales en nombre y bytes, sus manifiestos iguales, y las páginas prerenderizadas (HTML y RSC,
   / y /draw en los tres idiomas entre ellas) iguales salvo el build id. Hallado (la landing no debía
   cambiar) y arreglado después: la figura de OTRACK se grababa en el prerender esperando
   temporizadores reales, y con la máquina cargada salía sin una línea de rastreo; ahora `hover`
   agota el dwell sin reloj. Lo que heredan la 6 y la 7: los
   READMEs enlazan `examples/` y los otros READMEs por ruta relativa, que npm solo resuelve con
   `repository` (y su `directory`) en el package.json; los rangos `^0.0.0` de los ejemplos
   fallan el test en cuanto Changesets cambie una versión, así que la versión los mueve con ella;
   «not published yet» sale de los tres READMEs; `check:hosts` necesita red, y el del editor
   también Google Fonts (next/font).
6. **Publicar el motor 0.1.0** — la parte local, **hecha** (1fe18c6, 9203e5d, 6abb2b2, b16c114,
   0e80709 y el de la 0.1.0). Métricas de texto: todas de Arimo salvo la escala de AutoCAD
   (H = 1466, p301); Arimo tiene las anchuras y la línea de Arial pero no sus contornos (su H mide
   1409), así que la tinta se aparta un poco de la de AutoCAD (82 tests, con los valores de AutoCAD
   al lado). En producción, solo cambian el chunk del motor, una línea de la brida de la landing (la
   directriz de la cota de diámetro, 0,1 unidades del SVG) y las imágenes OG que la dibujan; /draw
   en reposo, idéntico píxel a píxel. LICENSE MIT a nombre del dueño en el repo y en cada paquete,
   y la nota de marca al final de cada README (la landing ya la tenía). Auditoría de los 12.134
   blobs de las 530 versiones: ningún secreto; `research/` y `.env*` nunca versionados; quedan
   para el sí del dueño `SEO-TRAFFIC-DROP-INVESTIGATION.md` (otros dominios de la cuenta de Vercel
   y su analítica, en la raíz y en el historial) y el email personal de autor en los 530 commits.
   Changesets 3.0.3 (`access` público, versiones independientes; el patch, no el major, para quien
   se queda fuera de rango por peer) y `npm run version-packages`, que mueve los rangos de
   `examples/`. El motor, 0.1.0 sin `private` y con `publishConfig.access` público; react y el
   editor, 0.0.1 privados (el peer `^0.0.0` ya no admitía la 0.1.0). `npm publish --dry-run -w cad`
   en verde con su `check:hosts`: 295 ficheros, 748,7 kB (2,7 MB sin comprimir), solo `dist`,
   README, LICENSE y package.json. Hallado y arreglado: dentro de `npm publish --dry-run`, el
   `npm pack` de attw no escribía el tarball (`npm_config_dry_run` heredado). Con el sí del
   dueño: la org, repo público, primera publicación desde su máquina con 2FA, trusted publisher,
   y el CI de vuelta (gratis en un repo público).
7. **Publicar react y editor 0.1.0** — 1 día, cuando el ritmo de `packages/editor` baje y terminen las
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

- 171 nombres públicos: 146 del motor (eran 642; la 3(d) sumó cinco), 8 de react y 17 del editor
  (`CadEditor` y sus nueve piezas, cinco tipos, `EditorLocale` y `paletteLayoutScript`; más sus
  tres catálogos y su hoja, con `data-mellowcad-editor`, sus capas, `--font-sans` y
  `--font-mono`), y lo que sus firmas alcanzan (`cad/api.md`, `packages/react/api.md`,
  `packages/editor/api.md`): cada uno es una promesa de semver.
- Tres superficies para una persona, sin CI: se publican escalonadas y el hook cubre los paquetes.
- Dependencias nuevas que vigilar: tsdown 0.23.2 usa `rolldown-plugin-dts` en beta (0.23.3 vuelve
  a la 0.28 estable y sale de la cuarentena el 2026-10-31: la próxima revisión la toma), y el
  editor compila con `@rolldown/plugin-babel` 0.2.4 (la 0.3.0 sale el 2026-11-01); attw trae
  su propio `typescript@5.6.1-rc`, anidado. Ninguna tiene scripts de instalación
  (`npm audit signatures` limpio).
- Sin procedencia mientras el repo sea privado (npm no la genera desde repos privados).
- Propiedad intelectual: los catálogos transcriben el vocabulario de AutoCAD en español (frases
  cortas y nombres funcionales, el riesgo es bajo). Las métricas de texto ya no salen de Arial:
  todas se leen de Arimo menos la escala de AutoCAD (H = 1466, sonda text/p301), a costa de una
  tinta algo distinta de la de AutoCAD (fase 6).
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
