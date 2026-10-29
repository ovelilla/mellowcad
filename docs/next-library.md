# MellowCAD como librería — brief

> **Estado:** propuesta, sin ejecutar. Sigue la convención de `docs/next-*.md`: se borra cuando la
> fase 7 haya ocurrido. El análisis completo, con el inventario medido, las fuentes fechadas, el
> spike y el pase adversarial, está en https://claude.ai/artifact/VZnAHvDFL8wGadysVcjMdx (privado). El
> spike vive en la rama local worktree-agent-a498997d3f29c107f (commit b1c7923), sin empujar.

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
los píxeles de grosor (`lineweightPixels` ya existe), el umbral de arrastre (3 px en
`components/cad/view-cube.tsx`, 4 px en el motor), las respuestas de ZOOM, las teclas de la línea
de comandos y de la entrada dinámica, la lista de POLARANG, las etiquetas de LUPREC.

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

1. **El motor, paquete del workspace** — 1–2 días, sin dependencias. Antes, recortar `AGENTS.md`
   (10.210 B con un tope de 10 KB: 30 B de margen). Adoptar el spike: workspaces en `package.json`,
   el package.json propio de `cad/` (privado), los imports `@/cad` por `@mellowcad/engine`,
   `cad/entryPoints.test.ts` leyendo los `exports` y mapeando el nombre del paquete a su ruta (un
   import profundo sigue fallando), tsdown con `isolatedDeclarations`, `dist/` ignorado por git,
   ESLint, Prettier y la cobertura, y build + publint + attw en `.githooks/pre-commit`. Actualizar
   lo que queda falso: `cad/README.md` (columna «Today»), `.claude/rules/cad-engine.md`, `ui.md`,
   `i18n.md`, `marketing.md`, y una regla de empaquetado donde quepa en el presupuesto.
2. **La superficie pública del motor** — 3–4 días, tras la 1. Defaults seguros. Barrel recortado (642
   exports; 65 se usan fuera de `cad/`). Un informe de API con firmas completas, no solo nombres (las
   piezas llaman a 96 de los 132 métodos de `CadEngine`), como test de instantánea. Presupuestos de
   tamaño como test con el rolldown que trae tsdown: islas por debajo de 1 KB y el motor completo
   hoy en 270 KB gz. `CadDriver` deja de importar el `en.json` crudo (68 KB) y usa una lista de ids
   generada. Un check previo a publicar que instala el tarball en anfitriones ajenos.
3. **Desacoplar el editor del sitio, en su sitio** — 6–9 días en cuatro entregas, tras la 1.
   (a) `components/cad/top-bar.tsx` deja de importar `LogoMark` y `useLanguageLinks`: pasan a ser
   props o slots. Las claves `easycad:*` de `lib/palette-layout.ts` y `lib/status-bar-layout.ts`
   y el script de cabecera pasan a ser opciones. (b) El catálogo del editor sustituye a next-intl en
   los 23 componentes. (c) Los tokens y la variante `palette-open` quedan acotados a la raíz del
   editor, con un contenedor para los portales, y `--active` se genera de `THEME.grip`. (d) La
   lógica de §2 baja de la línea.
4. **Los paquetes React** — 4–6 días, tras la 2 y la 3. packages/react y packages/editor: tsdown
   unbundle, React Compiler (verificar cómo se integra en tsdown), un check de que cada componente
   de `dist` lleva `"use client"`, y CSS precompilado. El sitio los consume desde el fuente. Los
   checks de `lib/type-scale.test.ts`, `lib/control-size.test.ts` e
   `i18n/logical-properties.test.ts` siguen a los ficheros (hoy fallarían en silencio).
5. **Ejemplos y documentación** — 2–3 días, tras la 4. Un anfitrión headless en Node y otro con
   Vite + React, que sirven también de smoke tests del check previo a publicar. Un README por paquete,
   a partir de `cad/README.md`.
6. **Publicar el motor 0.1.0** — 1 día, tras la 2 y las decisiones de §7. Org, LICENSE, Changesets,
   quitar `private`, y publicar desde la máquina del dueño con 2FA, con su confirmación expresa.
7. **Publicar react y editor 0.1.0** — 1 día, cuando el ritmo de `components/cad` baje y terminen las
   revisiones de comandos.
8. **Registro shadcn** — bajo demanda, tras la 7.

Bloqueos: 1 → 2 → 6; 1 → 3 → 4 → 5 → 7; §7 → 6; 7 → 8. La 2 y la 3 pueden ir en paralelo.

## 5. Descartado

- **El registro shadcn como canal principal del editor**: forks de primitivos, tema global, Base UI
  directo, pérdida del React Compiler y de los arreglos (§2).
- **Mover `cad/` a packages/engine y la app a apps/web**: no aportan función (§3).
- **CJS, Turborepo, pnpm, `size-limit`**: nada los necesita hoy; los presupuestos de tamaño se miden
  con el rolldown que ya trae tsdown.

## 6. Riesgos

- 642 símbolos públicos: cada uno que quede en el barrel es una promesa de semver.
- Tres superficies para una persona, sin CI: se publican escalonadas y el hook cubre los paquetes.
- Dependencias nuevas que vigilar: tsdown 0.23.2 usa `rolldown-plugin-dts` en beta; attw trae su
  propio `typescript@5.6.1-rc`. Ninguna tiene scripts de instalación (`npm audit signatures` limpio).
- Sin procedencia mientras el repo sea privado (npm no la genera desde repos privados).
- Propiedad intelectual: los catálogos transcriben el vocabulario de AutoCAD en español y las
  métricas de texto salen de Arial.

## 7. Decisiones del dueño

Son hacia fuera: el plan no las toma.

- **Licencia**: abierta (MIT o Apache-2.0, como todos los análogos nativos de shadcn), source-available
  (tldraw) o dual (AGPL más comercial), tras revisar los catálogos de AutoCAD, las métricas de Arial y
  el uso de la marca.
- **Hacer público el repo**: no hace falta para npm; sí para la procedencia y para el directorio de
  shadcn.
- **Scope y org de npm**: `@mellowcad/engine`, `@mellowcad/react` y `mellowcad` están libres
  (2026-10-29); si la org existe solo se ve con sesión.
- **Nombres**: `@mellowcad/engine`, `@mellowcad/react`, `@mellowcad/editor`.
- **Un tier de pago**: ninguno, soporte o plantillas pro, complementos con otra licencia, o clave
  de licencia.
- **Cómo se publica**: desde su máquina con 2FA, o pagando Actions para trusted publishing.
