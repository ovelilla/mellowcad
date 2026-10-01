# Internacionalización de MellowCAD — brief

> **Estado:** aprobado para ejecución por fases (§11). Sigue la convención de `docs/next-*.md`: se borra
> cuando la última fase esté en producción, y lo que deba perdurar se promueve a `.github/instructions/`
> (§14).
>
> **Para quién:** quien implemente (tú o un agente en próximas sesiones). Las decisiones están cerradas
> (§13) y se apoyan en la investigación de §3 y en las referencias. Ante un hueco, se elige la opción más
> estándar y actual, se anota en §15 y se sigue adelante, sin preguntar.
>
> **Sustituye** a lo que `docs/next-landing.md` decía sobre activar idiomas (§3.5, §7.7 y D8).

## 0. Resumen ejecutivo

1. **Tres idiomas:** inglés (por defecto y sin prefijo), español y árabe. `/`, `/draw` y `/privacy` no
   cambian; el español vive en `/es/…` y el árabe en `/ar/…`, editor incluido (`/es/draw`, `/ar/draw`).
2. **Cada idioma se comporta como un paquete de idioma de AutoCAD.** AutoCAD localiza nombres de comando,
   alias, solicitudes y palabras clave, y deja siempre a mano los nombres globales (ingleses) con el
   prefijo `_`. El español será el AutoCAD en español: `LINEA`, `DESFASE`, `[Cerrar/desHacer]`, y `_LINE`
   sigue funcionando. No existe AutoCAD en árabe, y quien delinea en árabe trabaja con el AutoCAD inglés:
   la interfaz en árabe está en árabe, y el dibujo y la línea de comandos hablan el idioma de comandos
   global.
3. **Dos idiomas por locale, con una frontera clara (§4.2):** el área de dibujo, la línea de comandos y la
   entrada dinámica usan el _idioma de comandos_; las paletas, las barras, los menús y la landing usan el
   _idioma de la interfaz_. En `en` y `es` coinciden; en `ar`, no.
4. **El motor lleva su propia i18n y no depende ni de next-intl ni de React.** Tiene catálogos por idioma
   en ICU MessageFormat (la sintaxis de next-intl, así que hay un solo flujo de traducción), compilados en
   el build con `icu-minify` (runtime de menos de 1 KB). Cada idioma es un módulo propio (`cad/locales/es`,
   mañana `@mellowcad/engine/locales/es`) y se pasa de forma explícita:
   `new CadEngine(canvas, { locale: es })`. El inglés va dentro del motor, da el tipo a los demás idiomas y
   es el respaldo clave a clave; quien integre el motor puede sustituir cualquier mensaje.
5. **next-intl 4.14 con enrutado, todo estático.** `defineRouting` con `localePrefix: "as-needed"` y sin
   detección, sin cookie y sin cabecera `Link`. El idioma sale de `next/root-params` (Next 16.3). Las dos
   root layouts pasan a `app/[locale]/(marketing)` y `app/[locale]/(app)` con `generateStaticParams`.
   **No hay proxy:** la reescritura de las URL sin prefijo la hacen `rewrites()` y `redirects()` de
   `next.config.ts`, que el router de la plataforma resuelve sin invocar una función en cada visita.
6. **Los valores técnicos no se localizan nunca.** Coordenadas, longitudes, ángulos, unidades y todo lo
   que se teclea usan punto decimal, coma entre X e Y y dígitos latinos, igual que en cualquier AutoCAD. El
   separador decimal de las cotas (DIMDSEP) pertenece al estilo de cota, no al idioma.
7. **RTL completo en la interfaz, nunca en el dibujo.** `dir` en `<html>`, propiedades lógicas de
   Tailwind 4.3 (`ms-`, `ps-`, `inset-s-`, `text-start`…), el `DirectionProvider` de Base UI y lados
   lógicos en los popups. Los iconos de dirección lineal se reflejan; los geométricos y los circulares,
   no. El lienzo, la línea de comandos, las coordenadas, el icono SCP y cualquier número técnico son
   siempre LTR: el plano no se refleja.
8. **Árabe:** Readex Pro variable (23 KB con el subconjunto árabe) detrás de Inter, dígitos latinos, sin
   tracking ni mayúsculas y con interlineado propio.
9. **SEO:** `hreflang` en el HTML y en el sitemap, con `x-default` → `/`; sin redirección por
   `Accept-Language`. El selector de idioma son enlaces rastreables a la URL equivalente. Cada idioma nace
   como `draft` (accesible, `noindex`, sin anunciar) y pasa a `live` cuando está completo y revisado; el
   árabe exige una revisión nativa.
10. **Traducción:** el vocabulario de comandos en español no se traduce, se copia de la ayuda oficial de
    Autodesk en español, que usa los mismos GUID que la inglesa. El resto del español lo redacta el
    proyecto y lo revisa su autor. El árabe se redacta con un glosario y lo revisa un hablante nativo. Los
    tests garantizan que todos los idiomas tienen las mismas claves, ICU válido y los mismos argumentos.
11. **Siete fases (§11):** 0 motor con vocabulario identificado · 1 enrutado y catálogos en inglés ·
    2 español: interfaz y landing · 3 español: idioma de comandos (publicación de `es`) · 4 preparación
    RTL · 5 árabe (publicación de `ar`) · 6 contrato del paquete. Las fases 0, 1 y 4 no cambian nada
    visible en inglés.

## 1. Punto de partida

Inventario del 27/09/2026 sobre `56db9ce`, con un escaneo de AST que excluye comentarios y tests:

| Ámbito                    | Hoy                                                                                                                                                                                           | Qué implica                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Motor (`cad/`)            | ~450 textos visibles en ~45 ficheros, todos en inglés, sin tabla de cadenas ni `Intl`                                                                                                         | Hay que extraerlos a catálogos antes de traducir nada                                             |
| Comandos                  | 65 comandos y 61 alias (`TOOL_COMMANDS`, `runtimeCommands.ts`). `commandPrompt()` compone `NOMBRE [Opción/Opción]:` con las etiquetas inglesas; `runCommand` no conoce el prefijo `_`          | El nombre, el alias y la etiqueta son la misma cadena inglesa                                     |
| Opciones                  | 58 `CommandOption {key, label}`. La letra es la inicial de la etiqueta inglesa, y 55 sitios comparan `key.toLowerCase()` con letras fijas (`case "c"`)                                          | Localizar una etiqueta rompería su tecla: hace falta un identificador estable                     |
| Entrada dinámica          | ~104 etiquetas de campo (~75 únicas) en 32 herramientas, con estilos mezclados ("Specify insertion point" junto a "Length")                                                                  | Pasan al catálogo del idioma de comandos                                                          |
| Mensajes                  | ~29 ("Unknown command", `N object(s) erased` con el plural inglés hecho a mano…) y 4 errores de fichero que se muestran vía `error.message`                                                  | ICU `plural`; los errores pasan a códigos que el catálogo traduce                                 |
| Paleta de propiedades     | 120 literales en `EngineState.ts` (grupos, filas, tipos con `one/many`); la UI usa `row.label` como clave de React                                                                            | Catálogo de la interfaz del motor y claves de React por id                                        |
| Texto sobre el lienzo     | 12 nombres de referencia a objetos, tooltip polar, lectura de MEASURE; anchos estimados a 6,4 px por carácter                                                                                 | Idioma de comandos, siempre LTR                                                                   |
| Dominio                   | Nombres de color, tipos de línea, "ByLayer", patrones de sombreado, `Layer${n}`, `Copy of …`, nombre del fichero descargado                                                                   | Ids en el dominio; los nombres visibles salen de los catálogos                                    |
| Editor (React)            | 197 literales (162 únicos) en `components/cad`, sin next-intl; 15 atajos escritos como texto                                                                                                 | Mensajes `Editor.*` de next-intl                                                                  |
| Duplicados                | Nombres de referencia a objetos ×3; "Command:" ×5; "Unknown command" ×3. `runtimeFrom.ts`, `runtimeScene.ts:113-115` y `EngineState.buildEngineState` no los importa nadie                   | Se unifican o se borran al extraer                                                                |
| Landing                   | `messages/en.json`: 19 espacios, 222 claves, ~1.980 palabras; 4 plurales hechos a mano (`One`/`Other` con `#`); 6 `t.raw()` con `.replace`; `Intl.*("en")` fijo en 3 sitios; `lang="en"` fijo en 3 layouts | ICU `plural`, `t.rich` y el locale activo                                                         |
| Landing desde el motor    | Transcripciones, descripciones del catálogo de comandos, chips de las figuras y 12 textos de `diagrams.ts` salen del motor en el build; `hero-sheet.tsx` y `DemoScript` parsean el prompt como texto | El motor tiene que renderizar en un idioma concreto sin estado global y dar el prompt estructurado |
| RTL                       | Sin `dir` en ningún sitio; 75 clases físicas (`left-*`, `pl-*`, `text-right`…) y 0 lógicas; `side="right"` en 6 sitios; el lienzo dibuja etiquetas con `textAlign` por defecto (`start`)        | Migración a propiedades lógicas y lienzo explícitamente LTR                                       |
| Fuentes                   | Inter y Geist Mono, solo `latin`, y ninguna trae árabe. La imagen OG mide el texto a 0,6 em por carácter                                                                                       | Fuente árabe nueva y otra medida en la OG                                                         |
| next-intl                 | 4.14.7 sin enrutado. `requestLocale` está marcado como obsoleto en favor de `next/root-params`                                                                                                 | El patrón de §5.3                                                                                 |

## 2. Objetivos y límites

**Objetivos**

- La landing, la privacidad y el editor completos en inglés, español y árabe, con la calidad de un
  producto nativo en cada uno.
- Un usuario de AutoCAD en español trabaja de memoria en `/es/draw`, igual que uno del AutoCAD inglés en
  `/draw`.
- El árabe es RTL de verdad, sin romper el dibujo, que es geometría.
- El motor sale de aquí listo para publicarse como paquete: su i18n no depende de la app.
- Todo sigue prerenderizado y dentro de los presupuestos de `docs/next-landing.md` §8 (§8.3 recoge el
  del árabe).

**Fuera de este brief**

- Traducir datos del usuario: nombres de capas, estilos, bloques y el contenido de textos y cotas.
- Texto de dibujo en escrituras RTL (dirección de párrafo en TEXT, MTEXT). El lienzo muestra lo que se
  escriba, pero sin un modelo de dirección propio. Queda anotado como hueco en `docs/autocad-coverage.md`.
- Más idiomas. La arquitectura los admite, y añadir uno se hace como las fases 2–3 o la 5.
- Detección automática del idioma, rutas traducidas (`/es/dibujar`) y variantes regionales (`es-MX`).
- Publicar el motor en npm, que es otro proyecto. Aquí se deja su i18n preparada para ese paso (fase 6).

## 3. Qué hace AutoCAD (investigación)

### 3.1 Idiomas

AutoCAD y AutoCAD LT existen en 14 idiomas: inglés, alemán, francés, italiano, español, japonés, coreano,
chino simplificado y tradicional, portugués de Brasil, ruso, checo, polaco y húngaro, también como
paquetes de idioma. **No hay árabe ni hebreo.** Quien delinea en árabe usa el AutoCAD inglés (en el
Magreb, a menudo el francés).

### 3.2 Qué se localiza

Una versión localizada cambia todo el lenguaje de órdenes, no solo la interfaz. Comprobado en la ayuda
de AutoCAD 2026 en español:

- **Nombres de comando.** `TEXT` → `TEXTO`, `OFFSET` → `DESFASE`, `CIRCLE` → `CIRCULO`,
  `ERASE` → `BORRA`, `LAYER` → `CAPA`, `COPY` → `COPIA`, `LINE` → `LINEA`, `REVCLOUD` → `NUBEREV`;
  `ZOOM` no cambia. `EQDIST`, el nombre que se recuerda de versiones antiguas, ya no es el de OFFSET:
  por eso cada nombre se comprueba en la ayuda actual y no se da nada por sabido.
- **Alias** (el `acad.pgp` de cada idioma). `L` → LINEA, `C` → CIRCULO, `A` → ARCO, `CP` → COPIA y
  `Z` → ZOOM coinciden con los ingleses, pero `B` → BORRA (en inglés, `E` → ERASE) y `CA` → CAPA (en
  inglés, `LA`). El fichero apunta a los nombres del idioma (`A, *ARCO`), no a los globales. Y `U`
  no deshace: en español es el alias de UNIR, y el comando que deshace una operación es `H` (§15).
- **Solicitudes y palabras clave.** `Precise punto siguiente o [Cerrar/desHacer]:`. La parte en
  mayúsculas de cada palabra clave es su abreviatura, y puede ir en cualquier posición (`desHacer` → `H`,
  como `eXit` o `toP` en `initget`). Hay abreviaturas de varias letras: las justificaciones de TEXTO son
  `SIZ`, `SC`, `SD`, `MI`, `MC`, `MD`, `II`, `IC` e `ID`.
- **Mensajes, paletas, cuadros de diálogo y ayuda.**

### 3.3 Nombres globales

- Un comando precedido de `_` se interpreta por su nombre global en cualquier idioma (`_LINE` en el
  AutoCAD español), y lo mismo pasa con las palabras clave (`_C`). Así se escriben guiones y macros que
  funcionan en todas las versiones. El prefijo `.` fuerza el comando original aunque se haya redefinido
  (`._LINE`).
- `initget` modela cada opción con una palabra local y otra independiente del idioma:
  `(initget "Abc Def _Ghi Jkl")`. Al escribir `A` se recibe `Ghi`, y al escribir `_J`, `Jkl`. **El
  comando recibe siempre la palabra global**, se escriba como se escriba.

### 3.4 Números

AutoCAD usa el punto decimal en la entrada y en la visualización, en todos los idiomas, y la coma separa
las coordenadas (`10.5,20`). Las cotas son la excepción: su separador decimal es la variable DIMDSEP del
estilo de cota, una propiedad del dibujo.

## 4. El modelo: idioma de la interfaz e idioma de comandos

### 4.1 Decisión

| Locale | Interfaz | Idioma de comandos                                 | Equivale a                                                                |
| ------ | -------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| `en`   | inglés   | global                                             | AutoCAD en inglés                                                         |
| `es`   | español  | el del AutoCAD en español, con `_` para los globales | AutoCAD en español                                                        |
| `ar`   | árabe    | global                                             | AutoCAD en inglés con la interfaz en árabe (no existe un AutoCAD árabe) |

Por qué:

- **La fidelidad es la especificación** (AGENTS.md). Quien usa a diario el AutoCAD en español escribe
  `L`, `DESFASE`, `B` y `H` para deshacer. Darle `OFFSET`, `E` y `U` sería el AutoCAD inglés con otra
  ropa.
- **Quien habla español pero usa el AutoCAD inglés**, algo habitual, ya eligió ese producto: usará
  `/draw`, igual que instaló la versión en inglés. Y en `/es/draw` sigue teniendo los nombres globales
  con `_`, exactamente como en el AutoCAD español.
- **Las alternativas rompen algo.** Traducir solo las etiquetas separa la palabra de su tecla
  (`Deshacer` no contiene la `U`). Mezclar solicitudes en español con palabras clave inglesas da un
  producto que ningún usuario de AutoCAD ha visto. Y un selector de "idioma de comandos" independiente
  sería una opción inventada: en AutoCAD, ese idioma lo decide el paquete de idioma.
- **Para el árabe no hay AutoCAD al que parecerse.** Sus usuarios leen las solicitudes inglesas todos los
  días, así que el idioma de comandos es el global. Traducirlo crearía un vocabulario sin precedente y
  metería texto bidireccional en la línea de comandos y en el lienzo. Es una desviación forzada por algo
  que no existe, y lleva su `WHY` y su nota en `docs/autocad-coverage.md`.

`docs/next-landing.md` §7.7 suponía nombres internacionales también en español; este modelo lo sustituye.

### 4.2 La frontera

| Idioma de comandos                                                                                                                                                                                                                                                                                                                  | Idioma de la interfaz                                                                                                                                                                                                                                                                  | Datos del dibujo (nunca se traducen)                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Nombres de comando y alias; "Command:"; las solicitudes de la línea de comandos y de la entrada dinámica; las palabras clave y sus abreviaturas; los mensajes de la línea de comandos; todo lo que se dibuja sobre el lienzo (tooltips de referencia a objetos, polar, rastreo, lectura de MEASURE); los listados de `?`; los nombres por defecto de lo que crea un comando (`Capa1`, `Copia de …`, el nombre del fichero descargado) | Paletas (Propiedades, Capas, Estilos, Bloques), barra de estado, barra de comandos, barra de herramientas y sus tooltips, menús (incluido el de referencias a objetos), la lista de autocompletado (el nombre en el idioma de comandos y la descripción en el de la interfaz), el panel Acerca de, la landing y los metadatos | Nombres de capas, estilos, bloques, tipos de línea y patrones; el contenido de textos y cotas; las unidades guardadas; los ids de todo |

Reglas que se derivan de la tabla:

- **El idioma de comandos es LTR en los tres locales.** Si algún día un locale tuviera un idioma de
  comandos RTL, esta decisión se reabre.
- **Un nombre por defecto se fija al crear el objeto**, en el idioma de comandos de ese momento. Una
  `Capa1` creada en español se sigue llamando `Capa1` en inglés, como en AutoCAD, donde el nombre es un
  dato.
- **Los nombres visibles de valores con id son interfaz** (el color `Red`/`Rojo`, `ByLayer`/`PorCapa`,
  las unidades); lo que se guarda es el id.
- **El vocabulario que es del motor lo nombra el motor.** Los nombres de las referencias a objetos, de
  los tipos de entidad y de los comandos los lee el host del estado del motor; next-intl guarda solo los
  textos propios de la app. Así desaparecen las tres copias de los nombres de las referencias.

### 4.3 Lo que se escribe

- **Comandos:** el nombre o un alias del idioma de comandos, o `_` más el nombre global, en todos los
  locales (también en `en`, como en el AutoCAD inglés). El `-` de las versiones de línea de comandos es
  parte del nombre (`-BLOQUE`). No se distinguen mayúsculas, y la comparación usa `toUpperCase()`, nunca
  `toLocaleUpperCase()`, que con un locale turco convierte `i` en `İ`.
- **Palabras clave:** la abreviatura o la palabra completa del idioma de comandos, sin distinguir
  mayúsculas, o `_` más la abreviatura o la palabra global. El comando recibe siempre el id global.
- **Tecla única:** hoy, una letra que coincide con una opción la ejecuta al pulsarla. Eso se mantiene
  solo cuando la letra es por sí sola una abreviatura completa y no empieza otra. Una abreviatura de
  varias letras (`SIZ`) se escribe y se confirma con Intro.
- **Números:** sin cambios (§3.4).
- **Distribución del teclado:** los atajos con Ctrl/⌘ se reconocen por `e.code` cuando `e.key` no es una
  letra latina. Con la distribución árabe, Ctrl+Z llega con otra letra, y los aceleradores del escritorio
  no dependen de la distribución: es una corrección que impone la plataforma, con su `WHY`. El texto se
  toma de `e.key` tal cual: quien escribe `LINE` con la distribución árabe obtiene lo mismo que en
  AutoCAD, un comando desconocido.

## 5. La app: next-intl con enrutado

### 5.1 URL

|            | `en`       | `es`          | `ar`          |
| ---------- | ---------- | ------------- | ------------- |
| Landing    | `/`        | `/es`         | `/ar`         |
| Editor     | `/draw`    | `/es/draw`    | `/ar/draw`    |
| Privacidad | `/privacy` | `/es/privacy` | `/ar/privacy` |
| Imagen OG  | `/og`      | `/es/og`      | `/ar/og`      |
| Manifest   | `/manifest.webmanifest` | `/es/manifest.webmanifest` | `/ar/manifest.webmanifest` |

- **Los slugs no se traducen** (`/es/draw`, no `/es/dibujar`). Google acepta cualquiera de las dos
  formas, y una sola ruta por página simplifica los enlaces, el `hreflang` y las reglas.
- **Lo que no tiene idioma queda fuera de `[locale]`:** `/sketches/hero.json` (un dibujo no tiene
  idioma), `sitemap.xml`, `robots.txt` y los iconos.
- `/en` y `/en/…` redirigen de forma permanente a la URL sin prefijo, y `/opengraph-image` a `/og`.

### 5.2 Árbol de rutas

```
app/
  [locale]/
    (marketing)/layout.tsx          root layout de la landing: lang, dir, fuentes, DirectionProvider
    (marketing)/page.tsx
    (marketing)/privacy/page.tsx
    (marketing)/not-found.tsx       el "Unknown command" de la 404, localizado
    (marketing)/404/page.tsx        notFound(), prerenderizada; la reescritura fallback trae aquí lo desconocido
    (app)/layout.tsx                root layout del editor
    (app)/draw/page.tsx
    og/route.tsx                    imagen OG de la landing (force-static)
    og/draw/route.tsx               imagen OG del editor
    manifest.webmanifest/route.ts   manifest por idioma
  sketches/hero.json/route.ts       sin idioma
  sitemap.ts, robots.ts, icon.svg, apple-icon.png, favicon.ico
  global-not-found.tsx              red de seguridad en inglés para lo que no pase por [locale] (/404)
```

- **`[locale]` es un parámetro raíz de las dos root layouts** ("cualquier layout sin otra layout por
  encima es una root layout"), así que `next/root-params` lo lee en cualquier Server Component.
- Cada root layout exporta `generateStaticParams` con todos los locales y `dynamicParams = false`.
- **Los route handlers no pueden leer root params**, así que la OG y el manifest leen `params` y piden
  sus textos con `getTranslations({ locale, namespace })`. `global-not-found.tsx`, que queda fuera de
  `[locale]`, hace lo mismo con el locale por defecto: sin él, `i18n/request.ts` no encontraría el
  parámetro y respondería con `notFound()`.
- **No se usan metadatos por fichero dentro de `[locale]`.** Los metadatos por fichero ganan al objeto
  `metadata`, y dentro de `[locale]` generarían para el inglés una URL `/en/…` que redirige. Las imágenes
  OG son route handlers con nombre, y `pageMetadata` las cita de forma explícita, como hoy.

### 5.3 Configuración

`i18n/routing.ts`, la única fuente de verdad de los idiomas:

```ts
export const routing = defineRouting({
  locales: ["en", "es", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Sin negociación por Accept-Language (Google la desaconseja y sus rastreadores no la envían).
  // Sin la detección, la cookie ya no sirve para nada, y la privacidad sigue diciendo que no hay cookies.
  localeDetection: false,
  localeCookie: false,
  // El hreflang va en el HTML y en el sitemap, generados desde `routing`; la cabecera sería una
  // tercera copia que mantener en sintonía.
  alternateLinks: false,
})

export const DIRECTION = { en: "ltr", es: "ltr", ar: "rtl" } as const

/** draft: accesible y noindex, sin anunciar (fuera del selector, del hreflang y del sitemap). */
export const LOCALE_STATUS = { en: "live", es: "draft", ar: "draft" } as const
```

`i18n/request.ts`, con el patrón de next-intl para Next 16.3 (sin `setRequestLocale` en ninguna página):

```ts
export default getRequestConfig(async ({ locale }) => {
  // Un locale explícito (route handlers, global-not-found) gana; si no, el parámetro raíz.
  if (!locale) {
    const value = await rootParams.locale()
    if (!hasLocale(routing.locales, value)) notFound()
    locale = value
  }
  return { locale, messages: await loadMessages(locale), timeZone: "UTC" }
})
```

`loadMessages` mezcla los mensajes del locale sobre los ingleses, así que una clave que falte muestra el
inglés y nunca la clave; los tests (§10) hacen que eso no pase en un idioma `live`.

`next.config.ts`, la reescritura `as-needed` sin proxy:

```ts
async redirects() {
  return [
    { source: "/en", destination: "/", permanent: true },
    { source: "/en/:path*", destination: "/:path*", permanent: true },
    { source: "/opengraph-image", destination: "/og", permanent: true },
  ]
},
async rewrites() {
  return {
    // afterFiles: después de los ficheros estáticos y las páginas no dinámicas (sitemap, sketches,
    // iconos) y antes de las rutas dinámicas, que es donde vive [locale].
    afterFiles: [
      { source: "/", destination: "/en" },
      { source: "/:first((?!(?:en|es|ar)(?:/|$)|_)[^/]+)/:rest*", destination: "/en/:first/:rest*" },
    ],
    // Lo que ninguna ruta sirve va a la 404 prerenderizada de su idioma.
    fallback: [{ source: "/:locale(en|es|ar)/:path*", destination: "/:locale/404" }],
  }
},
```

Los locales de la expresión se generan a partir de `routing.locales`, y la expresión exacta la fijan los
tests de §10. El primer segmento que empieza por `_` (`/_next`, `/_vercel`) no se reescribe.

**Por qué sin proxy:** la documentación de next-intl usa su middleware, pero con la detección, la cookie
y la cabecera `Link` desactivadas, lo único que haría es esta reescritura y la redirección de `/en`. En
Next 16 el proxy corre en Node en cada petición que casa con su matcher. Pondría una función delante de
cada visita a un sitio completamente estático, a cambio de algo que `rewrites()` y `redirects()` resuelven
en el router de la plataforma. `defineRouting` y la navegación de next-intl no necesitan el proxy. Si
algún día hace falta negociar el idioma, se añade `proxy.ts` con el mismo `routing`. La decisión lleva su
`WHY` en `next.config.ts`.

**Layouts:** `const locale = await getLocale()`; `<html lang={locale} dir={DIRECTION[locale]}>`; y
`generateMetadata` con `getTranslations`.

### 5.4 Mensajes

- **`messages/{en,es,ar}.json`**, con los espacios de hoy más `Editor.*` para la envoltura React del
  editor (CommandBar, ToolRail, DrawingAids, Layers, Styles, Blocks, Properties, About, CommandLine…).
  Las claves son semánticas (`Editor.CommandBar.save`), nunca la frase inglesa.
- **El inglés es la fuente y el tipo:** `AppConfig.Messages = typeof en`, `AppConfig.Locale` sale de
  `routing.locales`, y el plugin usa `experimental.createMessagesDeclaration: "./messages/en.json"` para
  comprobar también los argumentos de cada mensaje.
- **ICU de verdad.** `{count, plural, …}` sustituye a los pares `One`/`Other` (el árabe tiene seis
  categorías: `zero`, `one`, `two`, `few`, `many`, `other`), y `t.rich` sustituye a los seis `t.raw()` con
  `.replace`. Un número es `{n, number}`: next-intl tipa `{n}` como texto. Las islas reciben los
  plurales ya partidos por categoría (`pluralMessage`, §15 fase 1).
- **Las islas de la landing siguen recibiendo sus textos como props.** La regla de la landing no cambia:
  no se envuelve el árbol con todos los mensajes.
- **El editor sí usa `NextIntlClientProvider`, pero solo con `Editor.*`.** En v4, si no recibe
  `messages`, pasa al cliente todos los mensajes.
- **Precompilación:** `experimental.messages` con `precompile: true` (ICU compilado en el build y
  runtime `icu-minify`). Adoptada en la fase 1: el runtime de next-intl en `/draw` baja de 11,8 a
  5,4 KB gz. Un mensaje precompilado con argumentos es un array, así que `t.raw` queda fuera.
- **Formatos:** `getFormatter`/`useFormatter` con el locale activo, y ningún `Intl.*("en")` fijo. Los
  tres de hoy (`continue-drawing`, `live-canvas`, `lib/og.tsx`) pasan a usar el locale.
- **Valores LTR dentro de un texto RTL:** un nombre de comando, una tecla, un número con unidad, un email
  o una URL se aíslan con los aislantes Unicode FSI/PDI (U+2068/U+2069), escritos en el catálogo como
  los escapes `\u2068`/`\u2069`, en el texto, los atributos, los metadatos y la OG. No con una
  etiqueta `<cmd>`: la paridad de etiquetas obliga a ponerla también en inglés (§15, fase 5).
- **Sin literales:** `react/jsx-no-literals` en `components/cad/**` y `components/marketing/**`, con una
  lista corta de signos permitidos (`×`, `—`, `·`).
- Las flechas "→" están fuera de los mensajes, en `ForwardArrow`, que las refleja en RTL (§7.4).

### 5.5 SEO y selector de idioma

- **`pageMetadata({ locale, path, … })`:** canonical por locale; `alternates.languages` con todos los
  locales `live` más `x-default` → la URL inglesa; `openGraph.locale` (`en_US`, `es_ES`, `ar_AR`) y
  `alternateLocale`. Cada versión se lista a sí misma y a todas las demás.
- **Sitemap:** una entrada por página y locale `live`, con sus `alternates.languages`.
- **Los locales `draft`** llevan `robots: { index: false }` y no aparecen en el `hreflang`, el sitemap ni
  el selector.
- **`/draw` sigue siendo `noindex`** en todos los idiomas y no lleva `hreflang`.
- **JSON-LD:** `inLanguage` y `url` por locale.
- **Sin redirección por `Accept-Language` y sin aviso.** El selector está a la vista.
- **El selector** son enlaces `<a href hrefLang lang>` con el nombre de cada idioma en su propio idioma
  ("English", "Español", "العربية") y sin banderas, que representan países, no idiomas. Vive en el cajetín
  del footer como lista estática (siempre en el HTML, rastreable) y en la cabecera como menú con un globo.
  Los enlaces se construyen con `localePath(locale, href)` (`i18n/navigation.ts`), que da lo mismo que
  `getPathname({ locale, href })` —un test lo comprueba— sin importar `next-intl/navigation`: su
  `createNavigation` mete el runtime cliente de next-intl (~12 KB gz) en la landing aunque solo se use
  en el servidor. Tampoco el `Link` de next-intl con `locale`: fuerza el prefijo `/en` para que un
  proxy actualice la cookie, y aquí sería una redirección en cada enlace al inglés. La navegación es completa, porque cambiar de idioma cambia `lang`,
  `dir`, las fuentes y los catálogos del motor.
- **En el editor**, una fila "Idioma" en el panel Acerca de con los mismos enlaces. El dibujo sobrevive en
  el autosave, que no depende del idioma.
- **Textos de búsqueda por mercado:** el español se investiga por separado ("comandos de autocad",
  "autocad online gratis"…; `next-landing.md` §7.7), y los títulos y descripciones se escriben, no se
  traducen literalmente. Lo mismo vale para el árabe.

### 5.6 Imagen OG y manifest

- **Satori, el motor de `next/og`, da forma a las letras árabes pero no reordena el texto bidireccional:**
  las líneas de varias palabras salen al revés. Los arreglos (vercel/satori#745, vercel/next.js#92111)
  siguen abiertos, y además IBM Plex Sans Arabic hace fallar su parser (Context Substitution Format 3).
- **La OG árabe usa Readex Pro y el orden visual precalculado:** las líneas las decide el mensaje (una
  frase por línea) y `bidi-js` ordena las palabras de cada una; Satori invierte cada palabra árabe por
  su cuenta. Hacen falta dos arreglos más (§15, fase 5): el ancho de cada palabra con opentype.js y
  Readex Pro cargada la última. Todo queda aislado en `lib/og.tsx` con
  su `WHY`, y se retira cuando Satori reordene por su cuenta. Lo primero de la fase 5 es comprobar que
  Satori acepta Readex Pro. Si falla como IBM Plex Sans Arabic, la OG usa otra fuente de la tabla de
  §8.2 que sí funcione, y la web se queda con Readex Pro. Satori necesita woff o ttf, no woff2, así
  que la fuente se guarda en `assets/fonts/`, como las otras dos.
- **El manifest por idioma** lleva `lang`, `dir`, `name`, `description` y `start_url` (`/es/draw`). Cada
  idioma se instala como su propia app, porque el `id` por defecto es la `start_url`. Así el nombre y el
  idioma de una app instalada nunca cambian porque el usuario visite otro idioma.

## 6. El motor: i18n como paquete

### 6.1 Requisitos

- **Nada de next-intl, React ni DOM en el núcleo de i18n.**
- **Sin efectos al importar.** Es la regla del barrel (`cad-engine.instructions.md`): un registro global
  de idiomas desaparecería con el tree-shaking. El idioma se pasa siempre de forma explícita.
- **Un módulo por idioma, y el inglés dentro del motor.**
- **Tipado por el catálogo inglés.**
- **Sobrescribible por quien lo integre.**
- **Determinista:** los mismos dígitos y plurales en cualquier navegador, venga el ICU que venga en el
  host.
- **Un idioma por render, sin estado global.** La landing dibuja figuras en tres idiomas en el mismo
  build.

### 6.2 Precedentes

| Editor     | Cómo lo hace                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Excalidraw | Prop `langCode`; exporta `languages`, con un indicador `rtl` por idioma; un JSON por locale; `useI18n` para los hijos                     |
| tldraw     | Más de 40 idiomas; `overrides.translations`; la clave que falta sale en inglés; el locale forma parte de las preferencias del usuario     |
| CKEditor 5 | `language: { ui, content }`, con el idioma de la interfaz separado del del contenido; cada traducción se importa como un módulo           |

MellowCAD toma de CKEditor el objeto de idioma explícito y la separación de dos idiomas, y de tldraw el
respaldo inglés clave a clave y las sustituciones. A eso añade la separación propia de AutoCAD entre la
interfaz y el idioma de comandos.

### 6.3 Catálogos

```
cad/i18n/            núcleo: tipos, formateador, resolución de nombres y palabras clave
cad/locales/en.json  fuente: { interface: {…}, commands: {…} }
cad/locales/es.json
cad/locales/ar.json  solo `interface`: su idioma de comandos es el global
cad/locales/*.ts     generados (compilados) y confirmados en git, con un test que detecta la deriva
```

Estructura de un catálogo (claves orientativas; las ids son los nombres y palabras globales, que son los
identificadores independientes del idioma de AutoCAD):

```jsonc
{
  "interface": {
    "tool": { "line": "Line", "circleCenterRadius": "Circle, Center, Radius" },
    "description": { "LINE": "Creates straight line segments" },
    "property": { "group": { "geometry": "Geometry" }, "row": { "startX": "Start X" } },
    "entityType": { "line": "{count, plural, one {Line} other {Lines}}" },
    "color": { "red": "Red" },
    "byLayer": "ByLayer",
    "snap": { "endpoint": "Endpoint" }
  },
  "commands": {
    "names": { "LINE": ["LINE", "L"], "OFFSET": ["OFFSET", "O"] },
    "keywords": { "LINE": { "Close": "Close", "Undo": "Undo" } },
    "prompts": { "LINE": { "firstPoint": "Specify first point", "nextPoint": "Specify next point" } },
    "format": { "withOptions": "{prompt} or [{options}]", "command": "Command" },
    "messages": {
      "unknownCommand": "Unknown command \"{name}\".",
      "erased": "{count, plural, one {# object erased.} other {# objects erased.}}"
    },
    "feedback": { "snap": { "endpoint": "Endpoint" }, "polar": "Polar: {distance} < {angle}" }
  }
}
```

- **`names` y `keywords` son vocabulario, no mensajes ICU.** Una palabra clave marca su abreviatura con
  mayúsculas (`desHacer`), como `initget`. Las palabras clave van por comando, porque la abreviatura
  depende de con qué otras opciones comparte solicitud.
- **Los mensajes son ICU MessageFormat 1**, la sintaxis de next-intl y de FormatJS. Unicode MessageFormat
  2 es el estándar que viene, pero `Intl.MessageFormat` sigue en fase 1 de TC39: se revisará cuando llegue
  a los navegadores.
- **La solicitud se compone en el motor** a partir de sus partes (texto, palabras clave y valor por
  defecto). `format.withOptions` recoge lo que cambia con el idioma (`or` → `o`). El estado del motor
  expone la solicitud estructurada además del texto compuesto, y `hero-sheet.tsx` y `DemoScript` dejan de
  parsear cadenas.
- **Los comandos propios, que no son de AutoCAD** (`CIRCLE2P`, `ARCSCE`…), derivan su nombre en cada
  idioma del nombre base de ese idioma, igual que hoy derivan del inglés, y constan como propios en
  `docs/autocad-coverage.md`.

### 6.4 API

```ts
import { CadEngine } from "@/cad" // el inglés va dentro
import { es } from "@/cad/locales/es" // mañana: "@mellowcad/engine/locales/es"

const engine = new CadEngine(canvas, { locale: es })
engine.setLocale(ar) // reemite el estado; lo ya escrito en la línea de comandos se queda como está
```

```ts
interface EngineLocale {
  readonly tag: string // BCP 47, el que recibe Intl
  readonly interface: DeepPartial<InterfaceCatalog> // lo que falte sale del inglés
  readonly commands?: CommandLanguage // sin él, el idioma de comandos es el global
}
```

- `CadRuntime`, `CadDriver`, `createHarness`, `recordDemo` y `commandCatalog` aceptan `locale`, así que
  la landing renderiza cada idioma en el build sin estado compartido.
- **`extendLocale(base, overrides)`** permite a un host cambiar textos. Una cadena sin argumentos ya es un
  mensaje compilado válido; una con argumentos la compila el host en su build con `icu-minify/compile`.
- **Un idioma de comandos, o completo o nada.** Si un locale trae `commands`, debe cubrir todos los
  comandos y palabras clave (un test lo exige para los idiomas propios). En uno ajeno incompleto, lo que
  falte queda solo con su nombre global.
- **Rutas públicas:** React importa `@/cad` y `@/cad/locales/*`, y nada más. Esas rutas son los futuros
  subpaths `exports` del paquete; `cad-engine.instructions.md` lo recoge.
- **Carga:** el editor y el canvas vivo de la landing importan el catálogo con un mapa de imports
  dinámicos por idioma, así que cada idioma es un chunk propio que se carga junto al motor. El inglés no
  se descarga aparte.

### 6.5 Formato

- **`icu-minify/format`** (MIT, sin efectos, sin dependencias en runtime, 779 B gz medidos) recibe los
  formateadores del motor: `Intl.NumberFormat(tag, { numberingSystem: "latn", … })`,
  `Intl.PluralRules(tag)` e `Intl.DateTimeFormat(tag, { numberingSystem: "latn", timeZone: "UTC" })`, en
  caché. Así, los dígitos no dependen de la versión de CLDR del navegador.
- **La compilación va en el build, no en runtime:** `icu-minify/compile` depende del parser de FormatJS,
  que pesa demasiado para enviarlo al navegador. Lo ejecuta un script de generación (`npm run locales`),
  y un test compara lo generado con lo compilado al vuelo.
- **Los valores técnicos no pasan por `Intl`.** `formatLength`/`formatAngle` (`toFixed`) siguen igual, y
  sus resultados entran en los mensajes ya formateados, como texto.
- **Dependencia:** `icu-minify` sale del repositorio de next-intl y se versiona con él. Si eso llegara a
  estorbar, su runtime (≈2 KB sin comprimir) se incorpora al motor con su licencia.

### 6.6 Del dominio a los catálogos

- **`domain/` deja de producir texto visible.** Los colores, los tipos de línea, "ByLayer", los patrones
  y las unidades exponen ids, y el nombre visible sale del catálogo en `application/` (`EngineState`,
  solicitudes). Es lo que ya pide la regla de capas: el dominio es puro y no sabe nada de idiomas.
- **Los errores de fichero** (`drawingFile.ts`) lanzan un código (`DrawingFileError.code`) que la línea
  de comandos traduce; `error.message` sigue en inglés para los logs.
- **La paleta de propiedades usa ids como claves de React**, no la etiqueta (hoy, dos traducciones
  iguales producirían claves duplicadas).

## 7. RTL

### 7.1 Documento

- `<html lang={locale} dir={DIRECTION[locale]}>` en las dos root layouts. El mapa estático de §5.3 sirve
  igual en el servidor y en cualquier navegador; `Intl.Locale#getTextInfo()` no está en todos.
- **`DirectionProvider`** (el `components/ui/direction.tsx` de shadcn sobre el de Base UI) en las dos
  layouts, con la dirección del locale. Base UI 1.7 lo usa para el teclado y el posicionamiento.
- **`components.json` → `"rtl": true`**, para que todo lo que añada `shadcn add` salga con clases
  lógicas. Lo existente se convierte con `shadcn migrate rtl components/ui`, y después los `start-*` y
  `end-*` que emite el CLI se cambian por `inset-s-*` e `inset-e-*`: Tailwind 4.2 los marcó como
  obsoletos.

### 7.2 Propiedades lógicas

| Físico                                     | Lógico                                                  |
| ------------------------------------------ | ------------------------------------------------------- |
| `ml-*` / `mr-*`, `pl-*` / `pr-*`           | `ms-*` / `me-*`, `ps-*` / `pe-*`                        |
| `left-*` / `right-*`                       | `inset-s-*` / `inset-e-*`                               |
| `text-left` / `text-right`                 | `text-start` / `text-end`                               |
| `border-l` / `border-r`, `rounded-l` / `rounded-r` | `border-s` / `border-e`, `rounded-s` / `rounded-e` |
| `float-left`                               | `float-start`                                           |
| `slide-in-from-left`                       | `slide-in-from-start`                                   |
| `side="right"` (Base UI)                   | `side="inline-end"`                                     |
| `padding-left` en CSS                      | `padding-inline-start`                                  |

- `left-1/2 -translate-x-1/2` (centrar) es simétrico y se queda. También se quedan físicas las posiciones
  que salen de la geometría: la entrada dinámica se coloca en coordenadas del lienzo.
- `translate-x` en animaciones direccionales pasa a una variante lógica o a `rtl:` explícito.
- Los envoltorios `ui/tooltip.tsx` y `ui/popover.tsx` aceptan los lados lógicos (hoy solo aceptan los
  físicos).
- Un test recorre `components/**` y `app/**` y falla si encuentra clases físicas fuera de una lista de
  excepciones justificadas.

### 7.3 Lo que nunca se refleja

- **El lienzo:** `<canvas dir="ltr">`, `ctx.direction = "ltr"` y un `textAlign` físico explícito en
  `CanvasScenePresenter`. Y `ctx.lang` con el idioma de comandos (`Scene.lang`): el lienzo hereda el
  `lang` de la página, que decide la fuente de una familia genérica, y en `/ar` las letras del icono SCP
  salían con otra (§15, fase 4).
- **El SVG del motor:** `direction="ltr"`, `lang` del idioma de comandos y `text-anchor` explícito en
  `SvgScenePresenter`; en la landing, las figuras (`<svg direction="ltr">`: React no tipa `dir` en
  SVG), la hoja del hero, la hoja viva, los separadores de cota y el marco de la hoja van en LTR.
- **El icono SCP, la lectura de coordenadas, la línea de comandos y la entrada dinámica**, porque el
  idioma de comandos es LTR.
- **Cualquier valor técnico en una paleta:** campos numéricos, ángulos, unidades. Llevan `dir="ltr"`
  y `text-end`, que en la isla es su derecha, porque en un párrafo RTL `-12.5` se ve `12.5-`. No
  `<bdi>`: un número no tiene carácter fuerte que decida su dirección con `dir=auto`.
- Los atajos (`<kbd dir="ltr">`), los emails y las URL.
- **La justificación de TEXTO es física:** izquierda es izquierda, como en AutoCAD.

### 7.4 Iconos

- **Se reflejan** (`rtl:-scale-x-100`) los que expresan dirección lineal o de lectura: las flechas de
  avance y retroceso, la flecha de los CTA, enviar, abrir fuera (↗), y deshacer, rehacer y "zoom previo",
  porque el tiempo lineal se refleja en RTL (Material Design). La flecha de los CTA sigue siendo el
  glifo `→` del texto, reflejado (`ForwardArrow`): U+2192 no tiene espejo bidi, y un icono SVG habría
  cambiado los píxeles del inglés.
- **No se reflejan** los circulares (girar, refrescar: los relojes giran igual en RTL) ni los que dibujan
  geometría CAD (alargar, simetría, desfase, cotas, SCP), porque el plano no se refleja.

### 7.5 El editor en RTL

- La envoltura se refleja: la barra de herramientas pasa al borde derecho, las paletas al izquierdo y la
  barra de estado invierte su orden. Eso sale solo de las propiedades lógicas; el lienzo no se mueve.
- Las flechas del teclado en menús, deslizadores y pestañas siguen la dirección (Base UI, con el
  `DirectionProvider`).

### 7.6 La landing en RTL

- La composición se refleja y los dibujos no (§7.3).
- Las 8 declaraciones físicas de `marketing.css` pasan a lógicas, salvo las simétricas.
- La transición de la hoja del hero al lienzo no depende de la dirección, pero se comprueba en los tres
  idiomas.

## 8. Tipografía y formatos por idioma

### 8.1 Español

- El subconjunto `latin` ya cubre ñ, tildes, ¿ y ¡: no hace falta ninguna fuente nueva.
- **El español ocupa un 20–30 % más:** el hero, los botones y los tooltips tienen que aguantarlo.
- **Registro:** en la landing, tuteo directo, como el inglés ("Type L. Press Enter. Draw."). En el editor,
  el registro de Autodesk en español: las solicitudes son las suyas ("Precise…"), y la envoltura usa
  infinitivos y nombres ("Guardar dibujo"). Español neutro, sin vosotros ni voseo y sin regionalismos
  ("equipo" o "dispositivo", no "ordenador" ni "computadora"). Comillas angulares «» en la prosa, como
  recomienda la RAE.

### 8.2 Árabe

- **Fuente: Readex Pro variable,** `subsets: ["arabic"]`, detrás de Inter en la pila. Los tramos latinos
  y los dígitos siguen en Inter, y el árabe cae en Readex Pro. Pesos medidos del subconjunto árabe en
  woff2 (API de Google Fonts, 27/09/2026):

  | Fuente                        | KB                 | Nota                                                                |
  | ----------------------------- | ------------------ | ------------------------------------------------------------------- |
  | **Readex Pro** (variable)     | **23**             | Superfamilia árabe-latina pensada para la legibilidad               |
  | Cairo / Alexandria (variable) | 31                 | Kufi, más de titular                                                |
  | Rubik (variable)              | 32                 | Redondeada, no casa con Inter                                       |
  | IBM Plex Sans Arabic          | 43 + 46 (2 pesos)  | Estática; además hace fallar a Satori                               |
  | Noto Sans Arabic (variable)   | 166                | La que sugiere shadcn; fuera de presupuesto                         |

- **`preload: false`:** una fuente declarada en la layout compartida se precargaría en todos los
  idiomas. Solo la pila de `/ar` la nombra (`scriptFontVariables`), así que `/` y `/es` nunca
  descargan el fichero árabe; en `/ar` se descubre con el CSS, y el fallback con métricas ajustadas de
  `next/font` contiene el CLS. Va justo detrás de Inter y antes de los dos fallbacks: el de Inter es un
  Arial local, que tiene árabe y se quedaría con esas letras. Si la medición de §10 lo
  contradice, se sirve desde `public/` con un preload solo en `/ar`.
- **`:lang(ar)`:** `letter-spacing: 0` (el tracking rompe las ligaduras de la escritura cursiva), sin
  `uppercase` en las etiquetas, interlineado de 1,8 en el cuerpo y de 1,3 en los titulares (los trazos
  árabes chocan con el 1,0 del display), tamaño calibrado con capturas y sin cursivas. El tecleo animado
  (`1ch` por carácter) solo anima el idioma de comandos, que es latino, así que no le afecta.
- **Monoespaciada:** Geist Mono no tiene árabe. Una etiqueta en árabe cae en Readex Pro, y los datos
  (números, comandos) siguen en mono.
- **Dígitos latinos.** CLDR 46 hizo de `latn` el sistema por defecto de `ar` (comprobado en Node 24:
  ICU 78.3, CLDR 48, `new Intl.NumberFormat("ar").format(1234.5)` → `1,234.5`); `ar-EG` y `ar-SA` siguen
  con dígitos arábigo-índicos. Un navegador con un CLDR anterior al 46 formatearía con arábigo-índicos los
  recuentos que se formatean en el cliente, y solo esos, nunca un valor técnico. Para que eso no rompa la
  hidratación, un número que pinta el servidor no se vuelve a formatear en el cliente, y el motor fija
  `latn` (§6.5).
- **Plurales:** seis categorías, que dependen de las dos últimas cifras (0 `zero`, 1 `one`, 2 `two`,
  3 `few`, 11 `many`, 100 `other`, 103 `few`). Los mensajes árabes las usan donde el idioma las
  necesita, y `other` es obligatoria.
- **Fechas:** calendario gregoriano y meses de CLDR ("26 سبتمبر 2026"), con `timeZone: "UTC"`.
- **Puntuación y listas:** coma «،», interrogación «؟» y punto y coma «؛»; las listas, con
  `Intl.ListFormat` ("LINE وCIRCLE وARC").
- **Registro:** árabe estándar moderno (فصحى), neutro.

### 8.3 Presupuestos

| Presupuesto                     | `en` / `es`                  | `ar`                                     |
| ------------------------------- | ---------------------------- | ---------------------------------------- |
| JS propio en la landing         | ≤ 15 KB gz (sin cambios)     | igual                                    |
| Fuentes                         | 2 ficheros, ≤ 110 KB         | 3 ficheros, ≤ 140 KB                     |
| Transferencia de la 1.ª carga   | ≤ 250 KB gz                  | ≤ 275 KB gz (la fuente de la escritura)  |
| Lo que la i18n suma al motor    | el catálogo inglés compilado ≤ 8 KB gz (6,7 tras la auditoría; el chunk entero, 135,2 KB gz, lo fijan las funciones del motor: §15) | igual: los otros idiomas van aparte |
| Catálogo del motor por idioma   | inglés dentro del motor      | ≤ 12 KB gz, cargado con el motor         |
| Mensajes del editor en cliente  | solo `Editor.*`: 2,1 KB gz en el HTML y 5,4 KB gz de runtime (fase 1) | igual       |
| Funciones por visita a página   | ninguna (sin proxy)          | ninguna                                  |

## 9. Traducción

- **La fuente es el inglés:** los mensajes de la app y los catálogos del motor.
- **El idioma de comandos en español se copia, no se traduce.** Sale de la ayuda de AutoCAD 2026 en
  español, que usa los mismos GUID que la inglesa (comprobado con TEXT, ZOOM y OFFSET):
  `help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/<GUID>.htm`, HTML plano que se lee con `curl`.
  Las páginas de referencia dan el nombre, las solicitudes y las opciones, pero no las mayúsculas de las
  palabras clave. Esas salen de las solicitudes reales del producto: las páginas "Para…" de Autodesk y las
  transcripciones publicadas (el material de la Universidad de Granada, por ejemplo). Los alias, de la
  guía de métodos abreviados de Autodesk en español. Lo que no se pueda verificar se marca "sin verificar"
  en `docs/autocad-coverage.md`, nunca se inventa.
- **La interfaz en español usa la terminología de Autodesk en español:** referencia a objetos, rastreo
  polar, orto, entrada dinámica, capas, propiedades, tipo de línea, grosor de línea, sombreado, cota,
  bloque, espacio modelo… Así la envoltura y el idioma de comandos hablan igual.
- **Glosario:** `docs/i18n-glossary.md`, un documento duradero, no un brief. Recoge los términos CAD en
  inglés, español y árabe, y la fuente de cada uno.
- **El árabe** se redacta con el glosario (un modelo de lenguaje sirve de borrador) y lo revisa un
  hablante nativo antes de pasar a `live`: la landing, la privacidad y la envoltura del editor. Una tanda
  nueva de textos en árabe se revisa antes de publicarse.
- **La privacidad** se traduce entera en cada idioma: el RGPD pide la información en un lenguaje claro
  para quien la lee. La versión española la revisa el autor, que es el responsable del tratamiento.
- **Una clave nueva llega con su traducción en todos los idiomas `live` en el mismo cambio.** Los tests lo
  exigen. Los formatos (JSON con ICU) se importan en cualquier plataforma de traducción (Crowdin, Tolgee,
  Lokalise) si algún día hace falta.

## 10. Calidad y pruebas

**Vitest**

- **Catálogos (app y motor):** cada idioma `live` tiene las mismas claves que el inglés, ICU que se
  analiza sin errores, los mismos argumentos y los mismos tipos, y las mismas etiquetas de texto
  enriquecido. Los plurales árabes tienen `other`. Se usa `@formatjs/icu-messageformat-parser` como
  devDependency explícita.
- **Vocabulario del motor:** todos los comandos tienen nombre en cada idioma de comandos; no hay dos
  comandos con el mismo nombre o alias en un idioma; cada palabra clave tiene su abreviatura en
  mayúsculas y es única en su solicitud; `_` resuelve nombres y palabras globales; la opción que se
  ejecuta es el id global; las solicitudes se componen bien en cada idioma; los dígitos son latinos
  aunque se inyecte un ICU que diga otra cosa; y ningún `toLocaleUpperCase`.
- **El harness en español:** una muestra de herramientas con `createHarness({ locale: es })`. `LINEA`
  con `H`, `DESFASE`, las palabras clave de `ZOOM` y las justificaciones de `TEXTO` (`SIZ`…).
- **Los guiones y los tests nombran las opciones por su id** (`.option("Close")`), no por su letra. Las
  letras se prueban aparte, por idioma.
- **Contenido:** los hechos y los guiones de la landing, por idioma (la transcripción en español escribe
  `LINEA`).
- **Enrutado:** la tabla de reescrituras y redirecciones se genera con una función que se prueba con
  rutas de ejemplo (`/`, `/draw`, `/privacy`, `/es`, `/es/draw`, `/ar`, `/en`, `/en/draw`, `/xx`,
  `/sketches/hero.json`).
- **Adaptador:** los atajos con Ctrl y una distribución no latina (`key: "ز"`, `code: "KeyZ"`) en
  `CadEngine.test.ts`, con el DOM falso de siempre.
- **Clases físicas:** el test de §7.2.

**Playwright** (lo que el harness no ve), sobre el build de producción:

- En cada idioma: `lang`, `dir`, canonical y `hreflang`; los enlaces del selector; la 404 localizada;
  la transición entre la landing y el editor en los dos sentidos; axe sin violaciones.
- En `ar`: un recorrido solo con teclado (el orden de tabulación empieza a la derecha, los menús se
  abren y se recorren con el teclado; la envoltura no tiene submenús, pestañas ni barras con flechas
  horizontales, así que no hay flechas que inviertan: §15, fase 5); los popups en su lado lógico;
  capturas frente al inglés; las etiquetas del lienzo no se desplazan; los números negativos se ven bien
  en las paletas.
- Las fuentes: `/` y `/es` no piden el fichero árabe.
- Los presupuestos de §8.3 por idioma, y que la salida del build no tenga middleware.

## 11. Fases

### Fase 0 — Vocabulario con identidad (motor) · L

- `CommandOption` pasa a `{ id, keyword }`: el id es la palabra global (`Close`) y `keyword`, la del
  idioma de comandos con sus mayúsculas. Las herramientas comparan ids, no letras (los 55 sitios).
- Resolución de palabras clave (abreviatura o palabra completa, `_` global) y la regla de la tecla única
  de §4.3.
- `_` para los nombres globales en `runCommand`, también en inglés.
- Extraer los ~450 textos a `cad/locales/en.json`, con el script de generación y el formateador con
  `latn`. `EngineLocale`, la opción `locale` y `setLocale`; `commandCatalog(locale)`,
  `recordDemo(…, { locale })`, `createHarness({ locale })`.
- La solicitud estructurada en el estado del motor; `hero-sheet.tsx` y `DemoScript` dejan de parsearla.
- El dominio expone ids (§6.6); los errores de fichero, códigos.
- Lienzo y SVG explícitamente LTR (§7.3).
- Unificar o borrar los duplicados (§1).
- **Aceptación:** el comportamiento en inglés no cambia. Una prueba de instantánea de todas las
  solicitudes y mensajes es idéntica antes y después; los tests solo cambian `.option("C")` por ids;
  nada visible cambia; el chunk del motor crece lo que cuestan el catálogo inglés y su mecanismo,
  medido en +5,5 KB gz (el objetivo inicial de 3 KB no contaba las claves del catálogo; §15).

### Fase 1 — Enrutado y catálogos en inglés (app) · M–L

- El árbol de §5.2, `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts` con root params, las
  reescrituras y redirecciones, `generateStaticParams`, la 404 localizada, la OG y el manifest por
  idioma.
- `pageMetadata` por idioma, con el `hreflang` preparado; solo `en` es `live`, así que todavía no se
  emite ninguno.
- La envoltura del editor pasa a `Editor.*`; `NextIntlClientProvider` con ese subconjunto; se evalúa la
  precompilación; `react/jsx-no-literals`.
- `lang` y `dir` desde el locale, y el `DirectionProvider` montado (en `ltr`).
- Plurales ICU, `t.rich` e `Intl` con el locale activo en la landing.
- **Aceptación:** `/`, `/draw` y `/privacy` sirven el mismo HTML salvo los hashes y lo que la fase
  cambia a propósito (`dir`, `og:locale`, la URL de la OG, un chunk; §15); todo sigue prerenderizado
  (○/●, nunca ƒ) y sin middleware en la salida del build; se cumplen los presupuestos; lint sin
  literales.

### Fase 2 — Español: interfaz, landing y SEO · M

- `messages/es.json` completo (landing, privacidad y editor) y la `interface` del motor en español.
- Textos de búsqueda en español, a partir de la investigación de palabras clave; OG en español.
- `es` sigue en `draft`.
- **Aceptación:** paridad de claves; el autor revisa la landing y la privacidad; la maquetación aguanta la
  expansión (capturas).

### Fase 3 — Español: idioma de comandos · L

- El vocabulario de AutoCAD en español, comando a comando y con el GUID citado (§9): nombres, alias,
  solicitudes, palabras clave con sus mayúsculas y mensajes.
- Las transcripciones y el catálogo de comandos de la landing en español.
- La fila de cada comando en `docs/autocad-coverage.md` recoge su nombre en español y lo que esté "sin
  verificar".
- **Publicación:** `es` → `live`, lo que lo añade al selector, al `hreflang` y al sitemap.
- **Aceptación:** un usuario del AutoCAD en español escribe `LINEA`/`L`, `DESFASE`, `_LINE` y `H` para
  deshacer, y funciona; la muestra del harness en español pasa.

### Fase 4 — Preparación RTL (sin árabe) · M

- La migración a propiedades lógicas (§7.2), `components.json` con `rtl: true` y `shadcn migrate rtl`,
  los lados lógicos en los popups, las islas LTR (§7.3) y los iconos (§7.4).
- Los cuatro campos `type="number"` de las paletas (forzcursor, escalas, estilos de cota y texto) pasan
  a texto con `inputmode="decimal"` y su propio paso con las flechas: Chrome los escribe con el idioma
  del navegador (`3,75`), sea cual sea el `lang`, y un valor técnico va siempre con punto (§15, fase 2).
- Lo que añadió el 3D (auditoría, §15): el ViewCube es geometría —caras, rótulos por afinidad, brújula,
  triángulos atados a los lados de la pantalla y el orden de las flechas de giro— y va en una caja
  `dir="ltr"`; su columna con la paleta de propiedades es envoltura y pasa al borde izquierdo con las
  paletas; los menús de vista, del cubo y del SCP, con márgenes y marcas lógicos; la lectura de
  coordenadas con su Z, isla LTR; Órbita y las flechas de giro del cubo no se reflejan, «Zoom previo»
  sí. La caja de TEXTOM es la entrada dinámica: isla LTR (el texto de dibujo RTL sigue fuera, §2).
- **Aceptación:** con `dir="rtl"` forzado en una prueba, la envoltura se refleja bien y el dibujo no; el
  inglés sale idéntico en capturas antes y después.

### Fase 5 — Árabe · M–L

- `messages/ar.json` y la `interface` del motor en árabe; Readex Pro y los ajustes `:lang(ar)`; la OG
  árabe; el manifest en árabe; la comprobación RTL de §10.
- Lo que añadió el 3D: `Editor.ViewCube` y la `interface` nueva del motor (vistas predefinidas, caras
  y brújula del cubo, herramientas, filas Z, SPLINE, TEXTOM y atributos), con su columna en el
  glosario. Las letras de la brújula se deciden con la revisión nativa: no hay AutoCAD árabe que copiar.
- **Publicación:** `ar` sale en `draft` y pasa a `live` tras la revisión nativa.
- **Aceptación:** paridad, la comprobación RTL completa y los presupuestos de `ar`.

### Fase 6 — Contrato del paquete (i18n) · S

- `cad/locales/*` como puntos de entrada públicos (los futuros subpaths), y `EngineLocale`,
  `extendLocale` y el catálogo documentados para quien integre el motor.
- Un test que hace de host ajeno con un idioma parcial y una sustitución.
- `EngineNames` crece con cada vocabulario del motor (desde la auditoría, `views`, `viewCubeFaces` y
  `compass`): documentarlo como la fuente de los nombres que pinta un host.
- Cambiar la forma de un catálogo es un cambio incompatible: versión mayor.

**Orden y publicación:** 0 → 1 → 2 → 3 (publica `es`) → 4 → 5 (publica `ar` en `draft`, y en `live` tras
la revisión). La fase 4 puede adelantarse a la 2 si conviene: no depende de ningún idioma.

## 12. Riesgos y mitigaciones

| Riesgo                                                                        | Mitigación                                                                                                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Un nombre o una palabra clave en español equivocados (como `EQDIST`)          | Se copia de la ayuda de 2026 con el GUID citado; lo que no se pueda verificar se marca, nunca se inventa                                          |
| Las mayúsculas de las palabras clave no están en la referencia                | Solicitudes reales del producto y transcripciones fiables; marca de "sin verificar" en la cobertura                                               |
| Traducción al árabe de baja calidad                                           | Glosario, revisión nativa y `draft` hasta entonces                                                                                                |
| El RTL rompe el inglés                                                        | Las propiedades lógicas no cambian nada en LTR; capturas antes y después en la fase 4                                                             |
| Satori no reordena el árabe                                                   | Orden visual con `bidi-js` y líneas decididas en el mensaje, aislado en `lib/og.tsx` hasta que Satori lo resuelva                                  |
| Los rewrites no cubren algo que next-intl esperaba del proxy                  | Tests de enrutado; `defineRouting` es compartido, así que añadir `proxy.ts` es un cambio pequeño                                                   |
| `next/root-params` es nuevo (16.3)                                            | Es el patrón que recomienda next-intl; la alternativa (`params` más `setRequestLocale`) sigue documentada                                          |
| Dígitos distintos entre el servidor y navegadores con un CLDR antiguo         | El motor fija `latn`; los números que pinta el servidor no se vuelven a formatear en el cliente                                                   |
| Los atajos con Ctrl no funcionan con una distribución no latina               | Respaldo con `e.code`, con test                                                                                                                   |
| Crece el JS del editor                                                        | Solo `Editor.*` en el cliente, precompilación, catálogos por chunk y presupuesto de §8.3                                                          |
| La fuente árabe penaliza el LCP o el CLS de `/ar`                             | Se mide; el plan B es servirla desde `public/` con preload solo en `/ar`                                                                          |
| `icu-minify` va ligado a las versiones de next-intl                           | Runtime diminuto y MIT: se puede incorporar al motor si hiciera falta                                                                             |
| Deriva entre los catálogos generados y sus fuentes                            | Test que compila al vuelo y compara                                                                                                               |

## 13. Decisiones tomadas

| #   | Decisión                             | Resolución                                                                                                                  | Por qué                                                                                                                                                                         |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I1  | Idiomas                              | `en` (por defecto), `es`, `ar`, sin región                                                                                  | El contenido no depende del país; `hreflang` acepta el idioma solo                                                                                                              |
| I2  | Idioma de comandos                   | El del paquete de idioma de AutoCAD: `es` localizado con `_` para los globales; `en` y `ar`, global                         | La fidelidad es la especificación; no existe AutoCAD en árabe                                                                                                                   |
| I3  | Frontera                             | Dibujo, línea de comandos y entrada dinámica: idioma de comandos. Envoltura y landing: interfaz. Datos: nunca               | Separa los dos idiomas sin ambigüedad y deja el lienzo LTR en todos los locales                                                                                                 |
| I4  | URL                                  | `as-needed`: el inglés sin prefijo y `/es`, `/ar`; slugs sin traducir; `/en/*` redirige                                    | Las URL de hoy no cambian; una ruta por página                                                                                                                                  |
| I5  | Proxy                                | Ninguno; `rewrites()` (afterFiles) y `redirects()`                                                                         | Sin detección, cookie ni cabecera, el proxy solo reescribiría, y costaría una función por visita en un sitio estático                                                           |
| I6  | Locale en el servidor                | `next/root-params` en `i18n/request.ts`; `getLocale()` en las layouts; sin `setRequestLocale`                              | El patrón de next-intl para Next 16.3                                                                                                                                           |
| I7  | Detección                            | Ninguna: ni `Accept-Language` ni cookie ni aviso                                                                           | Google lo desaconseja; la privacidad sigue sin cookies                                                                                                                          |
| I8  | i18n del motor                       | Catálogos propios en ICU, compilados con `icu-minify`, un módulo por idioma, pasados de forma explícita; el inglés dentro   | Paquete sin framework, sin efectos al importar, con tree-shaking y la misma sintaxis que la app                                                                                 |
| I9  | Números                              | Los técnicos, siempre `toFixed` con punto; los de la interfaz, con el locale y dígitos latinos                             | Así funciona AutoCAD; CLDR 46 ya usa `latn` para `ar`                                                                                                                           |
| I10 | RTL                                  | Propiedades lógicas, `DirectionProvider` y lados lógicos; lienzo, comandos y valores técnicos LTR                          | Estándar de shadcn y Base UI; el plano es geometría                                                                                                                             |
| I11 | Fuente árabe                         | Readex Pro variable detrás de Inter, sin preload                                                                            | 23 KB frente a 166 de Noto Sans Arabic; IBM Plex Sans Arabic, la otra opción sobria, pesa 89 KB en dos pesos y hace fallar a Satori                                              |
| I12 | Estado de un idioma                  | `draft` (accesible, `noindex`, sin anunciar) → `live`                                                                       | Se publica cuando está completo y revisado; el árabe, tras la revisión nativa                                                                                                   |
| I13 | Selector                             | Enlaces `<a hrefLang lang>` con el nombre de cada idioma en su idioma, sin banderas, en el footer y la cabecera; navegación completa | Rastreable; las banderas son países; cambiar de idioma cambia `lang`, `dir`, fuentes y catálogos                                                                            |
| I14 | OG árabe                             | Satori con orden visual por `bidi-js` y Readex Pro                                                                          | Satori no reordena el texto bidireccional (los PR siguen abiertos)                                                                                                              |
| I15 | Fuente de verdad del español de AutoCAD | La ayuda de Autodesk en español (mismos GUID), las solicitudes reales y la guía de alias                               | Evita recordar mal (`EQDIST`)                                                                                                                                                   |

## 14. Reglas a promover al terminar

- **Nuevo `.github/instructions/i18n.instructions.md`**, transversal (`messages/**`, `i18n/**`,
  `cad/i18n/**`, `cad/locales/**`, `app/[locale]/**`, `components/**`). Recoge:
  - el modelo de dos idiomas y la tabla de la frontera;
  - que no hay literales y cómo se escribe ICU;
  - el aislamiento bidi;
  - las propiedades lógicas, las islas LTR y los iconos;
  - las fuentes por escritura;
  - `hreflang` y los estados `draft`/`live`;
  - la lista de pasos para añadir un idioma.
- **`cad-engine.instructions.md`:** los textos solo en catálogos; el dominio expone ids; nada de estado
  global de idioma; `cad/locales/*` como puntos de entrada públicos.
- **`cad-tools.instructions.md`:** las opciones por id global; las solicitudes desde el catálogo; nunca
  comparar letras.
- **`ui.instructions.md`:** las reglas de RTL, el `DirectionProvider`, los lados lógicos y las islas LTR.
- **`marketing.instructions.md`:** el enrutado, el selector, `hreflang` y las figuras por idioma.
  Sustituye la regla del selector inerte.
- **`testing.instructions.md`:** los tests por idioma y la lista de comprobación RTL de Playwright.
- **`AGENTS.md`:** una línea que diga que los textos viven en `messages/` (next-intl) y `cad/locales/`
  (motor), y que remita a `i18n.instructions.md`.
- **`docs/autocad-coverage.md`:** el nombre en español de cada comando; las desviaciones (el idioma de
  comandos global en árabe, los atajos por `e.code`); el hueco del texto de dibujo RTL.

## 15. Notas de implementación

### Fase 0 — diseño (27/09/2026)

**Capas.** Dos capas nuevas bajo `cad/`, con su fila en `cad-engine.instructions.md`:

| Capa        | Puede importar | Contiene                                                                                        |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `i18n/`     | nada (y el runtime de `icu-minify/format`) | el formateador con dígitos `latn`, las reglas de palabras clave y de nombres, `DeepPartial` |
| `locales/`  | `i18n/`        | `en.json` (fuente), `en.ts` (generado), `types.ts` (`EngineLocale` y los tipos del catálogo)     |

`application/` puede importar además de `i18n/` y `locales/`; `domain/`, `scene/` y `serialization/` no
conocen ningún idioma. `i18n/` no conoce la forma del catálogo, así que no hay ciclo: los tipos del
catálogo viven en `locales/types.ts` y salen de `en.json` con `resolveJsonModule`. `EngineText`
(`application/EngineText.ts`) es el único que junta las dos cosas: mezcla el locale sobre el inglés y
ofrece los accesores tipados que usan el runtime, las herramientas y `EngineState`.

**`cad/locales/en.json`.** Dos ramas, como en §6.3:

- `interface`: `tool` (etiqueta por id de herramienta), `description` (de los comandos que no son
  herramienta), `snap`, `color`, `byLayer`, `linetype`, `hatchPattern`, `entity` (`{count, plural}`),
  `property` (`title`, `group`, `row`, `value`, `justify`, `dimensionKind`).
- `commands`: `names` (`GLOBAL: [nombre, ...alias]`), `keywords` (`GLOBAL: { id: palabra }`), `prompts`
  (plano, por id semántico: un texto por significado, compartido entre comandos), `format` (la
  composición de la solicitud), `messages` (línea de comandos), `feedback` (lienzo), `listing` (los `?`)
  y `defaults` (`Layer{n}`, `Copy of {name}`, el nombre del fichero).

Las claves son semánticas (`prompts.firstExtensionOrigin`), nunca la frase inglesa. `names` y `keywords`
son vocabulario y no se compilan. Un `<` seguido de letra se escribe `'<'` (ICU lo leería como etiqueta).

```ts
interface EngineLocale {
  readonly tag: string // BCP 47
  readonly interface: DeepPartial<InterfaceCatalog>
  readonly commands?: DeepPartial<CommandCatalog> // sin él, el idioma de comandos es el global
}
```

**Catálogo compilado.** `scripts/locales/compile.ts` (Node 24 ejecuta el TypeScript sin compilar, como
`scripts/icons/generate.ts`; `npm run locales`) lee cada `cad/locales/*.json`, compila con
`icu-minify/compile` todas las hojas salvo `names` y `keywords`, y escribe `cad/locales/<tag>.ts`, que se
confirma en git y queda fuera de Prettier. `cad/locales/locales.test.ts` genera el módulo en memoria con
la misma función y lo compara, byte a byte, con el confirmado: la deriva falla la suite. El mismo test
analiza cada mensaje con `@formatjs/icu-messageformat-parser`.

**Formateador.** `icu-minify/format` con formateadores en caché por locale:
`NumberFormat(tag, { numberingSystem: "latn", useGrouping: false })`, `PluralRules(tag)` y
`DateTimeFormat(tag, { numberingSystem: "latn", timeZone: "UTC" })`. `useGrouping: false` porque la
línea de comandos de AutoCAD escribe los recuentos sin separador de miles, y así lo hacía el motor. Los
valores técnicos siguen saliendo de `formatLength`/`formatAngle` y entran en los mensajes como texto.

**Opciones por id global.** La herramienta declara `CommandOption { id, value? }`: el id es la palabra
global (`"Close"`, `"Included angle"`) y `value` el id de otra palabra de la misma tabla cuando la opción
muestra su estado (`Erase` + `Yes` → `Erase: Yes`; `Yes`, `Current`, `Divide`… son de verdad las
palabras de las subsolicitudes de AutoCAD). `invokeOption(id)` recibe siempre el id global: los 55
`key.toLowerCase()` pasan a comparar ids. El runtime resuelve cada opción contra la tabla del comando
activo y la expone en `EngineState.commandOptions` como `CommandOptionUi { id, keyword, abbreviation,
key, label }`. Se aparta de la letra del brief (`{ id, keyword }` en la herramienta) para que ninguna
herramienta tenga texto: el `keyword` lo pone el runtime, que es quien conoce el idioma.

**Resolución de palabras clave** (`i18n/keywords.ts`), entre las opciones ofrecidas en ese momento:

1. La abreviatura es el primer tramo de mayúsculas de la palabra (`Close` → `C`, `desHacer` → `H`,
   `eXit` → `X`, `SIZ` → `SIZ`). Un test exige que toda palabra tenga una.
2. Se acepta la abreviatura o la palabra completa, sin distinguir mayúsculas y comparando con
   `toUpperCase()`, nunca `toLocaleUpperCase()`.
3. Con `_` delante se compara con la abreviatura o la palabra **global** (la tabla inglesa), en todos los
   idiomas.
4. **Tecla única:** una opción tiene `key` solo si su abreviatura es de una letra y ninguna otra
   abreviatura ofrecida empieza por ella; si no, `key` es `null` y se escribe y se confirma con Intro. La
   tecla solo actúa con la entrada vacía: sin esa condición no se podría escribir `_C` ni `SIZ`. En inglés
   todas las abreviaturas son de una letra y únicas, así que nada cambia.
5. Lo escrito y confirmado (en la línea de comandos o en un campo de la entrada dinámica que no sea de
   texto libre) se resuelve primero como palabra clave de la solicitud en curso y, si no lo es, como
   comando, como hasta ahora.

**Nombres de comando.** Registro por nombre global; la búsqueda se construye con los nombres y alias del
idioma de comandos. `_NOMBRE` busca solo entre los nombres globales (`names[GLOBAL][0]`), como dice §4.3.
Las variantes propias (`CIRCLE2P`…) llevan su nombre explícito en cada catálogo.

**Solicitud estructurada.** `EngineState.commandLine` añade `command` (el nombre del comando en curso en el
idioma de comandos, o `null`), `idlePrompt` (`Command:`) y `promptSegments`: el mensaje
`format.promptWithKeywords` (`"{head} <keywords>[{list}]</keywords>:"`) se formatea con una etiqueta ICU,
así que el host distingue el tramo de las palabras clave sin analizar texto. `DemoPrompt` guarda lo mismo y
`TranscriptLine` añade `segments`; `hero-sheet.tsx` y `DemoScript` dejan de trocear cadenas. Cada paso de
opción registra la abreviatura que se escribió, que es lo que muestra la transcripción.

**Textos en herramientas.** `DynamicField.label` pasa a `prompt` (id de `commands.prompts`), que se
resuelve al construir el estado: un `setLocale` a mitad de un comando reetiqueta la solicitud abierta.
`ToolContext.text` da los mensajes y el texto del lienzo; `ctx.report` sigue recibiendo texto.
`Tool.label` desaparece: la etiqueta sale de `interface.tool[id]`.

**Dominio y errores.** `STANDARD_COLORS` lleva `id` (`red`…), `LINETYPES` y `HATCH_PATTERNS` pierden
`name`/`description`, y `colorName`, `linetypeName` y `hatchPatternName` salen del dominio: los nombres
visibles llegan por `EngineState.names` (y por el catálogo en las solicitudes). `lineweightLabel` se queda:
`0.25 mm` es un valor técnico. `parseDrawingFile` lanza `DrawingFileError` con `code`; la línea de
comandos traduce el código y `message` sigue en inglés para los registros.

**API.** `CadRuntime` recibe un quinto argumento `{ locale }` y gana `setLocale`; `CadEngineOptions`,
`CadDriverOptions` (y con él `createHarness`), `commandCatalog(locale?)`, `recordDemo(script, { locale })`
y `promptText(prompt, answer, locale?)` aceptan el locale. El harness gana `.option(id)`: busca la opción
ofrecida con ese id y la contesta como un usuario (su tecla, o la abreviatura e Intro); un id que el
comando no tiene lanza un error.

**Duplicados de §1.** `runtimeFrom.ts`, `runtimeScene.ts` y `buildEngineState` se borran: nadie los
importa y `cad-runtime.instructions.md` ya dice que FROM, la escena y `buildState` viven en la clase. Los
nombres de las referencias a objetos (`SceneBuilder`, `drawing-aids.tsx`, `snap-override-menu.tsx`) pasan
al catálogo (`interface.snap` para los menús, `commands.feedback.snap` para el lienzo) y React los lee de
`state.names`. `Command:` y `Unknown command` salen del catálogo en la línea de comandos del editor, el
hero, el CTA final, el 404 y el `Command:` de prueba de la landing.

**Red de seguridad.** `cad/application/englishSurface.test.ts` recorre con el harness todos los comandos,
sus solicitudes, opciones, mensajes, referencias a objetos, polar, MEASURE, pinzamientos y la paleta de
propiedades, y `content/transcripts.test.ts` fija las transcripciones de la landing y los tiempos del hero.
Las dos instantáneas se escribieron antes del cambio y no pueden cambiar.

### Fase 0 — estado (27/09/2026): terminada

**Hecho.** Todo el alcance de §11: opciones por id global (las 55 comparaciones de letras pasan a ids),
`_` en `runCommand` y en las palabras clave, el catálogo `cad/locales/en.json` con su módulo compilado
y el test de deriva, `EngineLocale` con `locale` y `setLocale` en `CadEngine`, `CadRuntime`,
`CadDriver`/`createHarness`, `recordDemo` y `commandCatalog`, la solicitud estructurada, ids en el
dominio, `DrawingFileError`, lienzo y SVG LTR, y los duplicados de §1 fuera. `icu-minify` es
dependencia y `@formatjs/icu-messageformat-parser`, devDependency.

**Verificado.** `typecheck`, `lint` y `test` en verde (1 146 tests; la cobertura sigue por encima del
trinquete). Las dos instantáneas salen byte a byte iguales que antes del cambio. En el navegador, sobre
los builds de producción de antes y de después servidos a la vez: el mismo recorrido de `/draw` (LINE
con Undo y Close por tecla, OFFSET y sus conmutadores, un comando desconocido, la paleta de propiedades,
el menú de referencias a objetos, la lista de la barra de estado y los selectores de color, tipo de línea y
grosor) y de `/` (las 46 líneas del hero con su tramo de palabras clave, la tarjeta de OFFSET, el CTA, el
`Command:` de prueba y el 404) da exactamente el mismo texto; la captura de `/draw` es idéntica byte a
byte. En la hoja del hero difieren 246 píxeles de antialiasing en una línea: la solicitud era dos nodos de
texto (`location` y un espacio) y ahora es uno, y Chrome redondea distinto la posición subpíxel del tramo
siguiente. Los glifos no se mueven; no se imita el troceado antiguo.

**Correcciones al brief** (lo que no funcionaba como estaba escrito):

- **Presupuesto del chunk.** Medido con `next build` en dos worktrees: el chunk del editor pasa de
  84 273 a 89 808 B gz, **+5 535 B**, no ≤ 3 KB. Desglose con esbuild del motor solo: el catálogo inglés
  cuesta 3 720 B (unos 2,6 KB son las propias frases, que antes estaban en el código, y el resto sus
  claves semánticas, que ahora aparecen en el catálogo y en quien las cita), el runtime de
  `icu-minify/format` 595 B y el mecanismo (`EngineText`, reglas de palabras clave, formateador) unos
  600 B netos, ya descontado el texto que salió del código. Ya se aplica el único recorte con sentido: el
  módulo inglés no envía las entradas que repiten su clave (sus palabras clave, que son sus ids, y los
  tipos de línea o patrones que se llaman como su id); siguen en `en.json` como inventario. Bajar de ahí
  exigiría claves crípticas o renunciar a icu-minify, que el brief fija. §8.3 y la aceptación de §11
  recogen la cifra medida; los demás idiomas no suman al chunk, porque van en el suyo.
- **`CommandOption`** es `{ id, value? }` en la herramienta y `CommandOptionUi { id, keyword,
  abbreviation, key, label }` en el estado (§15, diseño).
- **La tecla única solo con la entrada vacía**, también en la caja de la entrada dinámica; sin eso `_C`
  no se podría escribir. En inglés no cambia nada que se pueda hacer con el teclado sobre el lienzo.
- **Lo que se confirma en la caja de la línea de comandos se lee antes como palabra clave.** Antes, `C` e
  Intro a mitad de LINE arrancaban CIRCLE; ahora responden Close, como en AutoCAD. Es la regla 5 del
  diseño; sobre el lienzo la letra ya ejecutaba la opción al pulsarla.
- **`_` solo con nombres globales** (`_LINE`, no `_L`), como decía §4.3; queda en
  `docs/autocad-coverage.md`.
- **Tests existentes.** Además de `.option("C")` → `.option("Close")`, `commandCatalog.test.ts` se adapta
  a las formas nuevas (`TOOL_COMMANDS` da el nombre global y `CommandInfo` lleva `id`); lo que comprueba
  es lo mismo.
- **`messages/en.json`** pierde `Commands.tryNoMatch`, `FinalCta.prompt` y `NotFound.prompt`, y
  `NotFound.unknown` pasa a ser `NotFound.help` (`Press F1 for help.`): el resto sale del motor.
- **Las islas `dir="ltr"` de la landing** (§7.3) quedan para la fase 4, con el resto del RTL; aquí solo
  los presentadores del motor.

**Para la fase 1.** `engineText(locale)` es la puerta para que la landing tome del motor lo que es suyo
(`idlePrompt()`, `message("unknownCommand", …)`), y `EngineState.names` la de la envoltura del editor.

### Fase 1 — estado (27/09/2026): terminada

**Hecho.** El árbol de §5.2 bajo `app/[locale]`, con `generateStaticParams` y `dynamicParams = false` en
las dos root layouts; `i18n/routing.ts` (con `OG_LOCALE` y `LIVE_LOCALES`), `i18n/request.ts` con
`next/root-params`, `i18n/messages.ts` (el idioma sobre el inglés, clave a clave) e `i18n/rewrites.ts`
(redirecciones, `afterFiles` y `fallback`), sin proxy. La OG de la landing y la del editor y el
manifest son route handlers por idioma; `/sketches/hero.json` queda fuera de `[locale]`. `lang`, `dir`
y el `DirectionProvider` de shadcn en las dos layouts. `pageMetadata`, el sitemap y el JSON-LD por
idioma, con el `hreflang` preparado (no se emite con un solo idioma `live`) y `noindex` en los `draft`.
Todos los enlaces de la landing, las reglas de especulación, el sketch vivo y la transición van al
editor de su idioma. La 404 de cada idioma dentro de su layout. La envoltura del editor en `Editor.*`
(147 mensajes en 15 espacios) con `NextIntlClientProvider` solo con ese espacio y la precompilación
adoptada. Plurales ICU (`Hero.continue`, `LiveSketch.saved`, `Editor.Layers.selected`,
`Editor.Blocks.references`), `t.rich` y `Intl` con el locale activo. `react/jsx-no-literals`. Reglas
en el nuevo `.github/instructions/i18n.instructions.md` y en los de la landing, la UI y los tests.

**Verificado.** `typecheck`, `lint` y `test` en verde (1 178 tests; 32 nuevos de enrutado, catálogos,
enlaces y plurales). Build de producción en un worktree: todo `○`/`●`, ningún `ƒ`, manifest de
middleware vacío. Servidos a la vez el build de la fase 0 y este: el recorrido de `/draw` y de `/` del
estado de la fase 0 da el mismo texto y la captura de `/draw` es idéntica byte a byte; solo cambia la
404 (abajo). Con `curl`: `/en…` → 308 a la URL sin prefijo, `/opengraph-image` → `/og`, `/xx`,
`/es/xx` y `/ar/a/b` → 404 en su idioma, y la OG, el manifest, el sitemap y el dibujo del hero en su
sitio. En el navegador: `lang`, `dir`, canonical, `og:locale`, manifest, JSON-LD, enlaces y reglas de
especulación de `/`, `/es`, `/ar`, `/privacy`, `/es/privacy` y los tres editores; la transición
`/es` → `/es/draw` y vuelta; y, con claves de prueba en `es.json` (solo en el worktree), que el español
gana clave a clave y el resto cae al inglés, también precompilado y en el plural de la isla.

**El HTML de `/`, `/draw` y `/privacy`** es el de antes salvo los hashes y lo que la fase cambia a
propósito: `dir="ltr"`; `og:locale` `en` → `en_US` (el formato de Open Graph); la OG en `/og` y
`/og/draw` en vez de `/opengraph-image` y la URL con hash del editor; los ids de `useId` (el árbol
tiene un proveedor más); y un chunk más en cada página.

**Presupuestos** (gzip -9 de los chunks que cita cada página, frente al build de la fase 0):

| Página     | Antes    | Después  | Qué                                                                                           |
| ---------- | -------- | -------- | --------------------------------------------------------------------------------------------- |
| `/`        | 180,8 KB | 181,5 KB | las islas 5,5 KB (+0,06); `UnknownCommand` 0,46 KB, que la 404 del idioma trae al layout; `DirectionProvider` +0,15 KB |
| `/privacy` | 175,4 KB | 176,0 KB | lo mismo sin las islas                                                                        |
| `/draw`    | 353,1 KB | 356,1 KB | runtime de next-intl precompilado 5,4 KB (11,8 sin precompilar); el chunk del motor 89 928 B (89 808 tras la fase 0) |

Los mensajes `Editor.*` viajan en el HTML de `/draw`: +2,1 KB gz.

**Correcciones al brief:**

- **La 404 no es una ruta comodín.** `(marketing)/[...rest]/page.tsx` sale `ƒ`: una función por cada
  URL mal escrita en un sitio estático, contra la aceptación de esta fase. En su lugar,
  `(marketing)/404/page.tsx` llama a `notFound()`, se prerenderiza por idioma y una reescritura
  `fallback` le manda lo desconocido (con `dynamicParams = false`, las `fallback` se aplican antes de la
  404). **Next 16.3 envía el `notFound()` de una página como un documento vacío** con el estado 404, el
  título y `noindex`, y pinta la 404 en el navegador al hidratar; la comodín dinámica hace exactamente
  lo mismo, así que no se pierde nada. `/404` lo atiende `global-not-found`. Corregidos §5.2 y §5.3.
- **Los enlaces no usan `getPathname` de next-intl.** `createNavigation` registra su `Link` cliente
  allí donde se importa y metía el runtime de next-intl (11,8 KB gz) en la landing aunque solo se
  llamara en el servidor. `localePath` hace lo mismo para este enrutado (solo antepone el prefijo) y un
  test lo compara con `getPathname`. Corregido §5.5.
- **La precompilación se adopta** (§5.4): baja el runtime del editor de 11,8 a 5,4 KB gz. Un mensaje
  precompilado con argumentos es un array, así que `mergeMessages` lo trata como hoja y `t.raw` queda
  fuera.
- **Números en ICU.** next-intl tipa `{n}` como texto: los argumentos numéricos pasan a
  `{n, number}` (misma salida en inglés por debajo de 1 000).
- **Las reescrituras dejan en paz `_next` y `_vercel`** (§5.3).
- **Los `t.raw` eran cuatro**, dos pares de plurales; los `{command}` de la 404 y de la caja de prueba
  vienen del motor y siguen rellenándose en la isla.
- **La aceptación "el mismo HTML"** admite lo que la fase cambia a propósito (arriba). Corregido §11.

**Huecos decididos:**

- **Islas con plurales:** el servidor parte el mensaje ICU en una forma por categoría del idioma
  (`pluralMessage`) y la isla elige con `Intl.PluralRules` (`formatPlural`); ni proveedor ni parser en
  la landing.
- **Las combinaciones de teclas son mensajes** (`Editor.Keys`: `Supr` en un teclado español); las
  teclas de función, literales; los atajos que son alias de comando, del motor (`state.tools`).
- **Lista de signos permitidos** de `jsx-no-literals`: además de `×`, `—` y `·`, `°`, los ejes `X` e
  `Y` (notación del dibujo) y `→` hasta que los CTA lleven el icono que se refleja (fase 4). La regla no
  ve los atributos: `aria-label`, `title` y `placeholder` se revisaron a mano.
- **`tsc` sin caché incremental** en `typecheck`: la caché no ve los cambios de `messages/en.d.json.ts`
  (generado por `next typegen` e ignorado por git) y arrastra errores viejos. Cuesta unos 2 s.
- **Vitest incluye `i18n/**` y `lib/**`**, con `next-intl` en `server.deps.inline`.
- **`es` y `ar` son `draft` y alcanzables.** `/ar` ya sale en RTL con el texto inglés: la puntuación
  al otro extremo, la línea de comandos reflejada y la caja de coordenadas con los ejes al revés. Es lo
  esperado hasta las fases 4 y 5, y por eso sigue en `draft`. Además, el HTML de la 404 del idioma no
  lleva `lang` hasta hidratar (el documento vacío de Next).
- **Las palabras de dos layouts** (`Common.labelSeparator`, `: `) y los datos del cajetín (`MC-001`,
  `1:1`), constantes con nombre.

**Para la fase 2.** `messages/es.json` se escribe entero (landing, privacidad y `Editor.*`) y el test
de catálogos ya comprueba claves, argumentos y etiquetas. Los nombres de comando dentro de frases
(`Type a command (LINE, TR, CO…)`, `run BLOCK`, `TEXT asks`) van en el idioma de comandos de ese
locale. El selector de idioma sigue inerte hasta que `es` pase a `live` (fase 3).

### Fase 2 — estado (27/09/2026): terminada, pendiente de la revisión del autor

**Hecho.** `messages/es.json` completo (landing, privacidad y `Editor.*`: 373 mensajes) y
`cad/locales/es.json` con toda la `interface` del motor en español; su idioma de comandos sigue siendo
el global hasta la fase 3. La terminología es la de la ayuda de AutoCAD 2026 en español, verificada
término a término con su fuente en el nuevo `docs/i18n-glossary.md`. El motor habla el idioma de la
página en los tres sitios donde dibuja: el editor recibe su catálogo desde la página, el sketch vivo
lo carga con el motor y el build de la landing lo usa para el catálogo de comandos, las figuras y los
textos del motor. Los dos diagramas llevan las palabras de la página. Textos de búsqueda en español y
OG en español. `es` sigue en `draft`.

**Verificado.** `typecheck`, `lint` y `test` en verde (1 186 tests): el español, completo en los dos
catálogos (clave a clave, con los mismos argumentos y etiquetas), el harness con el catálogo español
real y los diagramas reproducidos en los dos idiomas. Build de producción en un worktree, todo `○`/`●`.
En el navegador, frente al build de la fase 1: el recorrido del editor y de la landing en inglés da el
mismo texto y la captura de `/draw` sale idéntica byte a byte; el HTML inglés solo cambia en las tres
etiquetas del diagrama, ahora centradas de verdad («BROWSER» quedaba desplazada), y en una clase de la
etiqueta de hoja. `/es`, `/es/privacy` y `/es/draw`, capturados sección a sección a 1400 y a 390 px,
sin desbordamiento horizontal a 320, 360 y 390 px; el sketch vivo de `/es` carga el catálogo español y
dibuja; la OG y el manifest, en español. Presupuestos: la landing crece 0,1 KB gz (el mapa de
catálogos en la isla del sketch), el chunk del motor queda en 87,8 KB gz y el catálogo español viaja
en el HTML de `/es/draw` (+2,0 KB gz, frente a los 12 de §8.3).

**Revisión (01/10/2026):** las 221 cadenas en español de la landing, la privacidad, la 404 y la OG,
frente al inglés, a petición del autor: fieles, con los términos de Autodesk y el registro de §8.1.
Corregidas tres: «responsable del tratamiento» (el término del RGPD) y una frase más natural para el
contacto, el orden de los derechos («el acceso…, su supresión o la limitación de su uso, oponerte a él
o recibir una copia») y `PAGINA` en vez de `PAGE` como comando de reserva de la 404. Los hechos de la
privacidad son los de la versión inglesa, que el autor firma como responsable.

**Textos de búsqueda.** De las sugerencias de Google en España, México, Argentina, Colombia y Chile y
de los títulos que posicionan hoy (sin volúmenes: Trends no se pudo leer): «gratis» acompaña a todas
las búsquedas («cad online gratis», «cad 2d online gratis»), «CAD online» se dice así y no «en línea»
(esa búsqueda es de visores de archivos), «sin registro» es la forma de decir *no sign-up*, y
«comandos de AutoCAD» es común. Título: «CAD 2D online gratis con comandos de AutoCAD — MellowCAD»
(56); nunca «AutoCAD online gratis», que se leería como si esto fuera AutoCAD. Descripción: «CAD 2D
gratis en tu navegador con los comandos, alias y referencias a objetos de AutoCAD. Sin instalación ni
registro; tus dibujos no salen de tu equipo.» (153). El lead lleva los términos que el H1 no tiene.

**Correcciones al brief y a la fase 1:**

- **La fase 1 rompió el sketch vivo de la landing**: incrusta el `DynamicInput` del editor, que pasó a
  `useTranslations`, y la landing no tiene proveedor de mensajes, así que lanzaba al abrirse. Su
  verificación no llegó a pulsar «Try it here». El componente recibe ahora su palabra por props, y un
  test impide que la landing tome prestado un componente del editor que pida mensajes.
- **Los campos `type="number"` no se arreglan con `lang`.** Chrome los escribe con el idioma del
  navegador (`3,75`), sea cual sea el `lang` del campo o de la página (probado con los dos): la web
  inglesa ya los enseñaba así a quien tenga el navegador en español. Pasarlos a texto cambia su
  comportamiento; queda en el alcance de la fase 4, con el resto de valores técnicos de las paletas.
- **`Press F1 for help.`** es del idioma de comandos (acompaña a `Unknown command` en la 404), así que
  en `es` sigue en inglés hasta la fase 3, como seguirá en `ar`.

**Huecos decididos:**

- **Nombres de tipos de línea y de patrones de sombreado:** son datos del dibujo y no se traducen;
  `es.json` los deja fuera y caen al inglés. Un test exige el resto de la `interface`.
- **Registro:** tú en la landing; en el editor, el de Autodesk (etiquetas en infinitivo o nombre,
  frases en usted). «Intro» y «Supr», como en la ayuda de Autodesk, también en el H1.
- **La cabecera tiene su propia etiqueta** (`Header.cta`): «Empezar a dibujar →» no cabía junto al
  logo y el menú a 360 px y se partía en dos líneas; en español es «Dibujar», en inglés no cambia.
- **La etiqueta de hoja de «Herramientas» ya no se parte** cuando el título se alarga.
- **El selector de idioma** muestra el idioma de la página por su nombre (`Footer.languageName`) y un
  único texto de «próximamente»; sigue inerte hasta la fase 3.
- **Etiquetas de los diagramas:** centradas con TEXTO justificado `MC`, que el motor recuerda como
  TEXTJUSTIFY, así que la etiqueta alineada a la izquierda va primero. Al hacerlo apareció un hueco de
  fidelidad del motor: tras `MC` la solicitud sigue diciendo *start point* donde AutoCAD dice *middle
  point*; queda en la fila de TEXT de `docs/autocad-coverage.md`.
- **Términos sin verificar** (la fuente no los da): varias filas de geometría de la paleta de
  propiedades; están marcadas en el glosario para comprobarlas con una captura del producto.

**Para la fase 3.** Los mensajes que nombran comandos van hoy con los nombres globales, porque ese es
el idioma de comandos de `es` en esta fase, y hay que reescribirlos con los de AutoCAD en español:
`Commands.lead`, `Commands.tryPlaceholder`, `Commands.transcriptTitle`, `LiveSketch.hint`,
`Toolset.inquiryBody` (FROM), `Status.notYet4` y `next1`/`next3` (MTEXT, SPLINE), `Faq.a8`,
`Editor.CommandLine.placeholder`, `Editor.DrawingAids.linetypeScaleLabel` (LTSCALE → ESCALATL),
`Editor.Styles.heightHint` (TEXT), `Editor.Blocks.empty` (BLOCK), `Editor.About.howTo` y
`NotFound.help`. `Precision.osnapBody` ya dice «Tangente», que es lo que la figura dirá entonces.
`offsetTranscript` (`commands-section.tsx`) busca la línea por el texto `OFFSET`: con el nombre
localizado tendrá que buscarla por el comando.

### Fase 3 — estado (27/09/2026): terminada; `es` publicado

**Hecho.** `cad/locales/es.json` trae el idioma de comandos completo de AutoCAD 2026 en español:
65 nombres con sus alias, las palabras clave de 29 comandos con sus mayúsculas, 75 solicitudes, los
mensajes, los rótulos del lienzo, los listados y los nombres por defecto. Los guiones de las figuras
escriben los nombres globales con `_` (`_OFFSET`), como un guion de AutoCAD pensado para cualquier
idioma, así que la landing en español se dibuja y se transcribe en español («Comando: DESFASE»,
«Designe ubicación de línea de cota [Texto/ángUlo/…]»). Los textos de la landing y del editor que
nombran comandos usan los nombres españoles (`L` para LINEA, `DF` para DESFASE, `RR` para RECORTA,
ESCALATL, TEXTOM). Los alias de la landing se cuentan en el idioma de comandos de la página. `es` pasa
a `live`: `hreflang` recíproco con `x-default`, sitemap con alternativas, `og:locale:alternate` y el
selector de idioma de §5.5 (enlaces con el nombre de cada idioma en sí mismo, en el pie, en un menú
con globo en la cabecera, dentro del menú en el móvil y en «Acerca de» del editor). La fila de cada
comando en `docs/autocad-coverage.md` lleva su nombre español, y una sección nueva recoge las fuentes
y lo que está sin verificar.

**Verificado.** `typecheck`, `lint` y `test` en verde (1 212 tests). La muestra del harness en
español de §10: `LINEA`, `L` y `_LINE`; `H` deshace el segmento en LINEA y deshace en `Comando:`;
`U` abre UNIR; DESFASE ofrece `[punto a Atravesar/Borrar: No/Capa: Origen/Múltiple: DES]`; ZOOM
toma `EScala` escrito y `Extensión` como `E` más Intro; TEXTO justifica con `SIZ`; un comando inglés
sin `_` es «Comando "LINE" desconocido.». Tests nuevos: un idioma de comandos es completo o no
existe; ningún nombre o alias se repite; ninguna palabra clave comparte abreviatura dentro de una
solicitud (las solicitudes salen de la instantánea inglesa); todas las figuras se reproducen en
español sin errores. En el navegador, sobre el build de producción y frente al de la fase 2: el
recorrido inglés del editor y de la landing da el mismo texto y la captura de `/draw` es idéntica
píxel a píxel; en el HTML inglés solo cambian el `hreflang` y el selector. `/es/draw` escribe y
responde en español y autocompleta con nombres españoles y descripciones españolas; `/es` dibuja
«Tangente» en su figura. Presupuestos: el catálogo español compilado pesa 5,7 KB gz y viaja en el
HTML de `/es/draw` (+3,4 KB gz; §8.3 permite 12); el selector añade 0,3 KB gz de JS a la landing y
0,5 KB al editor.

**Fuentes.** La investigación se hizo contra la ayuda de Autodesk en español (2026, que comparte los
GUID con la inglesa; y 2011–2013, que aún imprimía las solicitudes), capturas del producto en español
(2012–2020) y tres transcripciones del `acad.pgp` español (2012–2021). Los GUID de cada comando están
en `docs/autocad-coverage.md` y en el glosario; el detalle, en la sección «Spanish command language»
de la cobertura.

**Correcciones al brief:**

- **§3.2: el `acad.pgp` español apunta a los nombres españoles** (`A, *ARCO`), no a los globales, y
  un `*_MOVE` no funciona en un pgp. Corregido.
- **`H` no es un alias de DESHACER: es un comando** (el `U` inglés, «equivale a deshacer 1»), y `U`
  es el alias de UNIR. Aquí `H` va como alias de nuestro `UNDO`, que ya deshace una operación.
- **Los alias de 2026 no se pueden verificar del todo.** El `acad.pgp` español solo viene con el
  paquete de idioma. Los alias salen de tres transcripciones que coinciden entre sí y con la captura
  del fichero en la ayuda de 2026; la «Guía del autoestopista» de 2026 usa algunas letras inglesas (M,
  O, TR, EX…) que el pgp asigna a otros comandos, y no se siguen. Van marcados † en la cobertura.
- **Las mayúsculas:** la ayuda de Autodesk en español reescribe las de las palabras clave como
  iniciales; donde la ayuda y el producto no coinciden, gana la captura del producto
  (`punto a Atravesar`, `RAdio`, `jUstificar`, `EScala`), como pedía §9.
- **ACOANGULO y ACOANGULAR:** la página de 2026 se titula ACOANGULAR y todo lo demás dice ACOANGULO;
  los dos nombres abren el comando.

**Huecos decididos:**

- **Lo que ninguna fuente muestra** se redacta en el estilo de Autodesk y se marca sin verificar:
  casi todos los mensajes de la línea de comandos propios (nada designado, recuentos, errores de
  archivo), algunas solicitudes (patrón de sombreado, subsolicitudes de Ángulo y Girar de las cotas,
  referencia de GIRA y ESCALA) y las etiquetas de la entrada dinámica, que en AutoCAD no existen: son
  los nombres de sus solicitudes.
- **Los comandos propios** toman el nombre base español y las iniciales de su construcción:
  CIRCULOD, CIRCULO2P, CIRCULO3P, ARCOICF, ARCOCIF, ELIPSEC, ELIPSEARCO.
- **Los nombres de tipos de línea y patrones** siguen sin traducirse (datos del dibujo).
- **La FAQ en español** dice que los comandos tienen sus nombres de AutoCAD en español y que los
  globales funcionan con `_`: ahora es verdad, y es lo que busca quien escribe «comandos de autocad en
  español e inglés».

**Para cerrar del todo** hace falta una captura de AutoCAD 2026 en español (la prueba de 30 días con
el paquete de idioma basta) para confirmar los alias † y las solicitudes marcadas.

### Auditoría de lo añadido tras la fase 3 (01/10/2026)

**Alcance.** Los 31 commits de `a87cce0..c26da7e`, hechos con otra herramienta: TEXTOM, los atributos
de bloque, SPLINE, SCP y SIMBSCP, PLANTA, ELEV y la Z (2.5D), PTOVISTA, -VISTA, 3DORBITA, NAVVCUBE, el
ViewCube con sus menús, el menú de vistas y el botón Órbita.

**Lo que ya cumplía.** Ningún texto visible escrito en el código del motor: solicitudes, mensajes,
rótulos del lienzo (`+Z`, las letras del icono SCP), `*UNIVERSAL*`/`*SIN NOMBRE*` y `VIEWDIR` salen
del catálogo, y los campos de la entrada dinámica nombran su solicitud por id. Cada clave nueva está en
`en.json` y en `es.json`, en su rama (las de la paleta y el riel en `interface`; las del lienzo en
`commands.feedback`), y los módulos generados no derivan. El chrome nuevo lee `Editor.*` sin
literales, también en `aria-label` y `title`. Los guiones de las figuras siguen con `_NOMBRE` y
todas se reproducen en español sin errores. Los 18 nombres de comando nuevos coinciden con el título
de su página de la ayuda de 2026 en español (mismo GUID; la tabla está en la cobertura).

**Corregido:**

- **El español, contra las capturas del producto** (aCADemia 2011–2014), que ganan a la ayuda cuando
  difieren (§9): `[Rotación]` en -PTOVISTA (la ayuda dice Girar), `SUperior` en -VISTA (dos letras),
  `Altura` en TEXTOM (no `aLtura`), `Ángulo a partir del eje X en el plano XY` y `Ángulo a partir
  del plano XY` (estaban traducidas del inglés), `Precise la primera esquina` / `Indique la esquina
  opuesta`, y los dos espacios de `Dirección de vista actual:  VIEWDIR=…` y de la línea de modos de
  atributo. Alias nuevos con †: `AT`/`-AT` (ATRDEF, captura de 2013) y `-PV` (-PTOVISTA). Pasan a
  verificados los prompts de -ATRDEF, su línea de modos, ATRVIS, VPOINT, PLANTA y los de ELEV e ID;
  quedan marcados sin verificar los que no se marcaron (subsolicitudes de Elevación y Alt-objeto de
  RECTANG, el `Sí`/`No` de SCP, las filas de la paleta de TEXTOM y SPLINE, los rótulos de giro del
  cubo). Un test nuevo de `locale.test.ts` lo fija.
- **Las caras y la brújula del ViewCube y los nombres de las vistas predefinidas pasan al motor**
  (`interface.viewCube`, `interface.view`, en `state.names`): son ids del motor (`state.viewCube`,
  `state.view.preset`) que React traducía con `Editor.*`, y §4.2 dice que lo que nombra el motor lo
  nombra el motor. Los menús y tooltips del cubo, que son del host, siguen en `Editor.ViewCube`.
- **La sección Status de la landing** daba SPLINE y SCP como «lo siguiente» y las splines y el «3D»
  como «todavía no». Ahora: «Sólidos 3D» en lo que falta y, como siguiente, EDITSPLINE (lo que la
  cobertura pone en cola) y la interfaz en árabe (la fase 5). La regla queda en
  `marketing.instructions.md`.
- El glosario recoge los términos nuevos (vistas, ViewCube, menú SCP, órbita) con su fuente.

**El inglés.** Todos los cambios de las instantáneas tienen su commit: RECTANG ofrece
`[Elevation/Thickness]` (también en las transcripciones de la landing), DIST pregunta `First point`, la
paleta suma las filas Z y Normal, MEASURE su ΔZ. El único sin explicar, el `-HATCH` que al repetir la
pregunta conserva `ANSI31` en la caja, es una corrección: la primera pregunta ya lo precargaba, y el
borrado de todas las sesiones lo perdía al repetirla (lo cambió el commit de los atributos al borrar
solo la sesión contestada).

**Presupuestos** (build de producción de `main` en un worktree; gzip -9):

| Medida                         | Fase 2   | Ahora     | Qué                                                                    |
| ------------------------------ | -------- | --------- | ---------------------------------------------------------------------- |
| Chunk del motor                | 87,8 KB  | 135,2 KB  | +47,4 KB: herramientas nuevas (+125 KB sin comprimir), NURBS, ViewCube, métricas de Arial, Z |
| Catálogo inglés compilado      | 4,6 KB   | 6,7 KB    | lo único de i18n en ese crecimiento (sus frases son las del 3D)        |
| Catálogo español (chunk propio) | 5,7 KB  | 7,3 KB    | dentro de los 12 de §8.3                                               |
| JS de `/`                      | 181,5 KB | 182,0 KB  | la landing sigue sin cargar el motor                                   |

**Corrección al brief:** el límite de 90 KB del chunk del motor (§8.3) medía el motor entero, y lo
rompen las funciones del 3D, no la i18n, que solo suma su catálogo. §8.3 pasa a medir lo que la i18n
suma (el catálogo inglés compilado, ≤ 8 KB gz). El tamaño del editor no es un objetivo (decisión del
autor): quien abre un CAD espera una aplicación pesada, y sus chunks quedan en caché tras la primera
visita. Lo que sí tiene presupuesto es la primera carga de la landing, que no lleva el motor.

**Para las fases 4–6** (§11, ya ampliado): el ViewCube es geometría y va en una caja LTR, su columna se
refleja con las paletas; los menús nuevos, con márgenes lógicos; la lectura de coordenadas con Z, isla
LTR; Órbita y el giro del cubo no se reflejan. En la 5, el árabe de `Editor.ViewCube` y de la
`interface` nueva, y las letras de la brújula. En la 6, `EngineNames` como fuente de los nombres.

### Fase 4 — estado (01/10/2026): terminada

**Hecho.** Todo el alcance de §11, con lo que añadió el 3D:

- **Propiedades lógicas** en `components/**` y `app/**`, y las ocho declaraciones de `marketing.css`
  (quedan las simétricas). `components.json` con `rtl: true` y `shadcn migrate rtl` sobre
  `components/ui` (su `end-2` pasa a `inset-e-2`). `i18n/logical-properties.test.ts` falla con una
  clase o declaración física fuera de una lista de excepciones justificadas: en el árbol anterior
  encontraba 76.
- **Lados lógicos** en los popups: los tooltips y desplegables del riel y los menús que abren en el
  cursor (referencias a objetos, ciclo de selección) con `side="inline-end"`; `Side` y los envoltorios
  de `ui/` aceptan los dos tipos de lado.
- **Islas LTR:** el lienzo, la caja del ViewCube, la línea de comandos, la entrada dinámica, la lectura
  de coordenadas, los `<kbd>`, el correo de contacto, los valores de la paleta de propiedades y, en la
  landing, las figuras y glifos, la hoja del hero y la viva, el marco de la hoja, los separadores de
  cota, las transcripciones, la caja de prueba, la línea de la 404 y el `Comando:` del CTA final.
- **Iconos:** se reflejan deshacer, rehacer, zoom previo, enviar, abrir fuera y la flecha de los CTA
  (`ForwardArrow`); no se reflejan Órbita, el giro del cubo, girar ni los iconos CAD.
- **Los cuatro `type="number"`** pasan a `DecimalInput` (`components/cad/decimal-input.tsx`): texto con
  `inputMode="decimal"`, `dir="ltr"`, punto (acepta la coma que se teclee), las flechas suben y bajan
  el paso, y la misma semántica de antes (en vivo en las ayudas al dibujo; con Intro o al salir, y Esc
  para deshacer, en los estilos).
- **El idioma de comandos en lo dibujado:** `Scene.lang` (`EngineText.commandTag`) pasa a `ctx.lang` y
  al `lang` de cada texto SVG (abajo).

**Verificado.** `typecheck`, `lint` y `test` en verde (1 596 tests). Los builds de producción de la
auditoría (`8703f1e`) y de esta fase, servidos a la vez, capturados en 1 400 × 900 en 20 escenarios en
inglés (la landing entera por tramos, la privacidad, `/es`, el editor vacío, con dibujo, con selección,
con la entrada dinámica, el menú de vistas, el tooltip del riel, el panel de capas, el de unidades y
`/es/draw`): píxel a píxel idénticos salvo dos. El escenario con dibujo varía hasta 76 px entre dos
pasadas del mismo build (el indicador de autoguardado), y no es de esta fase. El panel de unidades
cambia a propósito: el campo de texto ya no reserva el hueco de las flechas que Chrome dibuja en un
`type="number"`, y el valor queda junto al margen. Aceptación RTL, en `/ar` y `/ar/draw` (RTL de verdad,
con el `DirectionProvider`) y en `/draw` con `dir="rtl"` forzado: el riel pasa al borde derecho y la
columna del cubo y las paletas al izquierdo; el lienzo es el mismo mapa de bits que en LTR
(`toDataURL`, 0 px); el cubo, colocado en el mismo sitio, sale idéntico (0 px) y con el mismo marcado; la
figura del hero y el separador de cota, idénticos (0 px); la flecha del CTA se refleja en RTL y no en
LTR; LTSCALE es un campo de texto decimal LTR y la flecha arriba lo sube a 1.1; sin desbordamiento
horizontal en `/ar`.

**Presupuestos** (frente al build de la auditoría): el JS de la landing crece 0,1 KB gz (`ForwardArrow` y
las clases), el del editor 0,7 KB (`DecimalInput` y la extensión de `cn`); el chunk del motor, 57 B
(`lang`). Todo sigue `○`/`●`.

**Correcciones al brief:**

- **El lienzo y el SVG también llevan `lang`**, no solo `dir`. Un contexto 2D hereda el `lang` de su
  elemento, y el `lang` decide la fuente de una familia genérica: en `/ar/draw` las letras X e Y del icono
  SCP (`monospace`) salían con otra fuente, 28 px distintos del inglés. La `Scene` lleva la etiqueta del
  idioma de comandos y los dos presentadores la aplican; desde entonces, 0 px. Corregido §7.3.
- **Un valor técnico lleva `dir="ltr"`, no `<bdi>`:** un número no tiene ningún carácter fuerte que
  decida su dirección con `dir=auto`, así que se fija; y `text-end`, que en la isla es su derecha.
  Corregido §7.3.
- **React no tipa `dir` en `<svg>`:** las figuras llevan `direction="ltr"`, el atributo de presentación.
- **La flecha de los CTA no pasa a ser un icono:** sigue siendo el glifo `→` del texto, reflejado con
  `rtl:-scale-x-100` (`ForwardArrow`). Un SVG cambiaba los píxeles del inglés, contra la aceptación, y
  U+2192 no tiene espejo bidi. Corregidos §5.4 y §7.4.
- **tailwind-merge 3.6 no sabe que `px` es `padding-inline`:** tras la migración, el `px-1.5` de quien
  llama ya no anulaba el `ps-2.5 pe-2` del selector, y su texto se movía 4 px. `cn()` empareja `px`,
  `mx` e `inset-x` con sus lados lógicos (`lib/utils.ts`, con test).
- **`dir` va en el contenedor de lo que se posiciona:** la especificación resuelve un `inset` lógico
  contra el bloque contenedor y Chrome contra el propio elemento; por eso la hoja viva entera es la isla
  LTR, no cada pieza.

**Huecos decididos:**

- **La columna del ViewCube** (el cubo y la paleta de propiedades) se refleja con las paletas: arriba a
  la izquierda en RTL. NAVVCUBELOCATION nombra una esquina del área de dibujo en un producto que no
  tiene RTL; aquí es envoltura, y el cubo por dentro no se refleja.
- **La hoja viva es LTR entera**, con sus dos botones (abrir el editor, cerrar) en su esquina superior
  derecha: es la hoja del hero, y su sitio no cambia con el idioma.
- **Los valores técnicos se alinean a su derecha en todos los idiomas** (`text-end` dentro de la
  isla), como las cifras de una calculadora; los recuentos de la interfaz (objetos por capa o estilo)
  siguen a la página.
- **La lista de autocompletado** va dentro de la línea de comandos, LTR, aunque su descripción esté en
  el idioma de la interfaz.
- **`rtl:` también casa dentro de una isla LTR** (`[dir=rtl] *`): sirve para los iconos de la
  envoltura, no para distinguir una isla.

**Para la fase 5.** Con texto árabe de verdad: comprobar que las etiquetas largas caben en las paletas
y los menús, la descripción del autocompletado dentro de la línea de comandos LTR, las letras de la
brújula (sin AutoCAD árabe que copiar) y los ajustes `:lang(ar)` de §8.2.

### Fase 5 — estado (01/10/2026): terminada en `draft`; pendiente solo la revisión nativa

**Hecho.** `messages/ar.json` completo (landing, privacidad y `Editor.*`) y la `interface` entera del
motor en `cad/locales/ar.json`, sin `commands`: el idioma de comandos de `ar` es el global (§4.1), con
su `WHY` en `i18n/engine.ts` y su sección en `docs/autocad-coverage.md`. Árabe estándar moderno con
la columna árabe del glosario, que dice de cada término cómo se eligió; plurales de seis categorías
donde el sustantivo concuerda con el número; puntuación árabe, «», dígitos latinos, fechas
gregorianas en UTC y listas con `Intl.ListFormat`; los tramos LTR aislados con FSI/PDI. Readex Pro
variable (`subsets: ["arabic"]`, `preload: false`) detrás de Inter y Geist Mono solo en las páginas
árabes, y los ajustes `:lang(ar)` de §8.2. La OG árabe con Readex Pro y el orden de `bidi-js`. El
manifest en árabe (`lang`, `dir`, descripción, `start_url` `/ar/draw`). Textos de búsqueda propios.
`ar` sigue en `draft`.

**Verificado.** `typecheck`, `lint` y `test:coverage` en verde (`ar` en `TRANSLATED`, el harness con
el catálogo árabe, todas las figuras y los diagramas reproducidos en árabe, la OG ordenada). Sobre el
build de producción, servido a la vez que el de `6878cf2`:

- **El inglés y el español no cambian:** `/`, `/es`, `/privacy`, `/es/privacy`, `/draw`, `/es/draw`
  y las 404, capturados a 1 400 px por tramos y a 390 px, píxel a píxel idénticos y con el mismo
  texto; la OG y el manifest, byte a byte; el editor con una línea dibujada y seleccionada, idéntico
  en inglés. En español cambian solo, a propósito, los selectores de tipo y grosor de línea, que
  ahora dicen «PorCapa» (abajo).
- **RTL (§10):** `lang="ar"` y `dir="rtl"` en `/ar`, `/ar/privacy`, `/ar/draw` y la 404. El mismo
  dibujo en `/draw` y `/ar/draw` da el mismo mapa de bits del lienzo (`toDataURL`), con sus
  rótulos. `-12.50` y `-3.00` se leen bien en la paleta. El tooltip del riel se abre hacia el dibujo
  (`inline-end`: a la izquierda del riel en RTL). Solo con teclado: la tabulación empieza por la
  derecha (guardar, abrir, vistas…), el menú de vistas se abre con Intro, se recorre con las flechas y
  Escape devuelve el foco al botón. Sin desbordamiento a 320, 360 y 390 px; axe sin infracciones en
  `/ar`, `/ar/privacy`, `/ar/draw` y la 404. Capturas sección a sección frente al inglés.
- **Presupuestos (§8.3)**, primera carga con Brotli (documento, JS, CSS y fuentes): `/` 231,4 →
  231,9 KB (+0,3 de CSS: el `@font-face` y las reglas `:lang`), `/es` 232,6, **`/ar` 255,8 KB** (≤ 275)
  y `/ar/privacy` 232,5. Fuentes de `/ar`: 3 ficheros, 93,5 KB (Readex Pro 22,7; ≤ 140); `/` y `/es`
  piden 2, nunca el árabe. Catálogo árabe del motor: 3,3 KB gz (≤ 12), en el HTML de `/ar/draw`
  (+3,5 KB gz con los `Editor.*` árabes). El JS de la landing no cambia. Todo `●`/`○`, sin
  middleware.

**Textos de búsqueda.** De las sugerencias de Google en Arabia Saudí, Egipto, Emiratos, Marruecos,
Irak y Jordania (01/10/2026): se busca «أوتوكاد» (con o sin hamza), «رسم هندسي» (dibujo técnico),
«ثنائي الأبعاد», «أون لاين» (no «عبر الإنترنت»), «مجاني/مجانا» y «أوامر الأوتوكاد واختصاراتها»
(«اختصارات» es la palabra para los alias); «كاد» solo devuelve Cadillac y «بديل أوتوكاد» no se
usa, porque se leería como si esto fuera AutoCAD. Título: «رسم هندسي ثنائي الأبعاد أون لاين مجانًا
بأوامر أوتوكاد — MellowCAD»; descripción: «برنامج رسم هندسي ثنائي الأبعاد مجاني في متصفحك، بأوامر
أوتوكاد واختصاراتها ونقاط الالتقاط التي تعرفها. بلا تثبيت ولا تسجيل، ورسوماتك لا تغادر جهازك.»

**Correcciones al brief:**

- **Satori acepta Readex Pro, pero no su subconjunto árabe:** con el woff de Fontsource falla en
  cuanto una palabra árabe toca un carácter que el subconjunto no tiene (`اكتب.`). La OG usa el TTF
  estático 600 entero de Google Fonts (92 KB, solo en el build). Corregido §5.6.
- **Satori tiene dos fallos más con el árabe**, y `lib/og.tsx` los rodea con su `WHY`: mide cada
  palabra como la suma de sus letras aisladas, más anchas que la palabra unida que dibuja (un 15–40 %
  más, cada palabra arrastraba su hueco), así que opentype.js da a cada palabra su ancho real; y a
  una forma contextual, que no tiene punto de código, le busca otra fuente y le responde la última
  cargada, de modo que Readex Pro va la última o lanza `codePointAt`. Corregido §5.6.
- **Aislamiento con FSI/PDI, no con `<cmd>`.** La paridad de etiquetas del test exige la misma
  etiqueta en inglés y en español, y next-intl no admite argumentos que el mensaje no declare: habría
  que etiquetar ~30 mensajes ingleses y pasar a nodos las props de texto de una docena de componentes.
  Los aislantes hacen lo mismo en HTML, atributos, metadatos y OG, y el catálogo los muestra como
  escapes. Lo que se pega en la línea de comandos pierde los controles bidi
  (`setCommandLineText`). Corregido §5.4.
- **Un plural puede ocupar el sitio de un `{n, number}`:** en árabe el sustantivo concuerda con el
  número (`عنصر واحد`, `عنصران`, `3 عناصر`, `11 عنصرًا`, `100 عنصر`). El test de catálogos toma
  los dos como el mismo tipo de argumento.
- **«Las flechas al revés en los menús» no tiene objeto:** la envoltura no tiene submenús, pestañas,
  barras de menús ni barras con foco itinerante, que es donde Base UI invierte las flechas
  horizontales. El recorrido comprueba lo que sí depende de la dirección: el orden de tabulación, los
  lados lógicos de los popups y los menús por teclado. Corregido §10.
- **Los atajos con Ctrl por `e.code` (§4.3, §10) no estaban hechos;** con la distribución árabe, Ctrl+Z
  no deshacía. Hechos en `CadEngine` (`shortcutKey`) con su test.
- **Lo que encontró la comprobación RTL, en todos los idiomas:** los campos editables de la paleta no
  eran isla LTR (`12.50-`, la unidad delante); los selectores de tipo y grosor de línea no tenían
  `items` y cerrados mostraban el id `ByLayer` (también en español, que ahora dice «PorCapa»); las
  teclas del tablero de comandos y las listas de la sección de herramientas no eran islas (`-MTEXT`
  se leía `MTEXT-`); y axe pedía un landmark en el editor (`region`, también en inglés: ahora es
  `<main>`, mismos píxeles).
- **`:dir()` no sirve en el CSS:** Lightning CSS (dentro de Tailwind) lo baja a una lista de
  `:lang()` que casa también dentro de las islas LTR. Las reglas se escriben con atributos.

**Huecos decididos:**

- **Lo que habla el idioma de comandos lleva su `lang`** (`state.commandLine.lang`, nuevo en el
  estado del motor): las transcripciones, la línea de comandos, la entrada dinámica, la caja de
  prueba, la línea de la 404. Así un lector de pantalla lee `Command: LINE` en inglés en una página
  árabe. No en los contenedores cuyo `aria-label` está en árabe.
- **Tipografía:** los titulares árabes, a otro tamaño (Readex Pro es más grande que Inter al mismo
  cuerpo; «اضغط Enter.» cabe en una línea como «Press Enter.»); el árabe de `label-mono` y
  `data-mono` va con la pila sans, porque Geist Mono le prestaba espacios de 0,6 em; la etiqueta de
  los separadores de cota, dentro de su isla, con `dir="auto"`.
- **Términos con alternativa**, marcados † en el glosario: «بالطبقة» por ByLayer (lo habitual es «حسب
  الطبقة», que no cabía en el selector de color), «تقاطع ظاهري», «التقاط الكائنات», «مكعب العرض» por
  ViewCube. Las letras de la brújula son las iniciales de los mapas árabes: ش (شمال), ق (شرق), ج
  (جنوب), غ (غرب).
- **AutoCAD se escribe «أوتوكاد» en la prosa**, como lo escribe quien lo busca, y `AutoCAD` en el aviso
  de marca. La FAQ explica que los comandos están en inglés porque no existe AutoCAD en árabe.
- **El texto de dibujo árabe** (los rótulos de los dos diagramas) se dibuja LTR y se mide como glifo
  medio: legible, con un espaciado aproximado. Es el hueco de §2, anotado en la cobertura.
- **El nombre «العربية» del selector**, en las páginas inglesa y española, saldrá con la fuente del
  sistema cuando `ar` sea `live`: nombrar Readex Pro ahí haría descargar 23 KB por una palabra.

**Hallazgo sin corregir** (no es de esta fase y cambiaría el inglés): el selector de tipo de línea
cerrado muestra el id `DashDot` donde la lista dice «Dash dot».

**Pendiente para pasar `ar` a `live`:** la revisión de un hablante nativo de todo el árabe —
`messages/ar.json`, `cad/locales/ar.json` y la columna del glosario, con los † primero— y, con ella,
`LOCALE_STATUS.ar = "live"` y quitar «الواجهة العربية» (y su gemelo inglés y español) de lo siguiente
en la sección Status, que entonces ya estará hecho.

## Referencias

**Next.js y next-intl**

- Documentación de Next 16.3 en el repo (`node_modules/next/dist/docs/01-app/`):
  `02-guides/internationalization.md`, `03-api-reference/04-functions/next-root-params.md`,
  `03-api-reference/03-file-conventions/layout.md` (varias root layouts bajo un segmento dinámico),
  `03-api-reference/05-config/01-next-config-js/rewrites.md` (orden de `afterFiles`),
  `03-api-reference/03-file-conventions/proxy.md` (Node por defecto),
  `03-api-reference/04-functions/generate-metadata.md` (prioridad de los metadatos por fichero),
  `03-api-reference/03-file-conventions/01-metadata/sitemap.md` (`alternates.languages`).
- next-intl: [Next.js root params](https://next-intl.dev/blog/nextjs-root-params),
  [configuración del enrutado](https://next-intl.dev/docs/routing/configuration); los tipos de
  `next-intl` 4.14.7 (`localeCookie`, `alternateLinks`, `localeDetection`, `experimental.messages`,
  `createMessagesDeclaration`) y el `Link` que fuerza el prefijo al cambiar de idioma
  (`navigation/shared/createSharedNavigationFns.js`).
- [icu-minify](https://www.npmjs.com/package/icu-minify) (en `node_modules/icu-minify`).

**AutoCAD**

- [AutoCAD — idiomas](https://en.wikipedia.org/wiki/AutoCAD) (14 idiomas, sin árabe ni hebreo).
- [TEXTO (comando), AutoCAD 2026 Ayuda](https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/GUID-D1C664DD-63D9-467E-8EC1-2F5A1777A924.htm),
  [ZOOM (comando)](https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-Core/files/GUID-66E7DB72-B2A7-4166-9970-9E19CC06F739.htm),
  [DESFASE (comando), AutoCAD LT 2026](https://help.autodesk.com/cloudhelp/2026/ESP/AutoCAD-LT/files/GUID-C0E4246D-C420-42BD-A6FC-8B1852EFD005.htm).
- [Uso de alias para iniciar comandos](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-Product-Insights/files/GUID-DB0E87C4-2223-49ED-84F9-FBB3B6BA65A9.htm)
  y [Alias de comando, teclas de método abreviado y Autocorrección](https://help.autodesk.com/cloudhelp/2022/ESP/AutoCAD-DidYouKnow/files/GUID-D2B4BF16-B1F7-4EF2-89AF-88ACE85FAD73.htm).
- [initget (AutoLISP)](https://help.autodesk.com/view/ACD/2025/ENU/?guid=GUID-9ED8841B-5C1D-4B3F-9F3B-84A4408A6BBF):
  abreviaturas en mayúsculas en cualquier posición; palabras locales y globales.
- [Prefijos de comando](https://www.cadforum.cz/en/qaID.asp?tip=2425) (`_`, `.`) y
  [Working with non-English version of AutoCAD](https://blog.autodesk.io/working-with-non-english-version-of-autocad/).
- [Sintaxis vectorial 2D, Universidad de Granada](https://www.ugr.es/~ega3/Unidad%20didactica%2001%20Sintaxis%20vectorial%202D.pdf)
  ("Precise punto siguiente o [Cerrar/desHacer]").
- [Separador decimal y DIMDSEP](https://www.cadforum.cz/en/qaID.asp?tip=854).

**RTL, tipografía y formatos**

- shadcn/ui: [RTL](https://ui.shadcn.com/docs/rtl) y [RTL en Next.js](https://ui.shadcn.com/docs/rtl/next).
- Base UI 1.7: `direction-provider` y los lados `inline-start`/`inline-end` (documentación en
  `node_modules/@base-ui/react/docs`).
- Tailwind CSS 4.2: `inset-s-*`/`inset-e-*` y la obsolescencia de `start-*`/`end-*`
  ([notas de la versión](https://laravel-news.com/tailwindcss-4-2-0)).
- [Material Design — bidireccionalidad](https://m2.material.io/design/usability/bidirectionality.html).
- CLDR 46: `latn` como sistema de numeración por defecto de `ar`
  ([notas de la versión](https://cldr.unicode.org/downloads/cldr-46)).
- Satori y el árabe: [vercel/satori#745](https://github.com/vercel/satori/pull/745),
  [vercel/next.js#92111](https://github.com/vercel/next.js/pull/92111).

**SEO**

- Google: [versiones localizadas](https://developers.google.com/search/docs/specialty/international/localized-versions),
  [sitios multirregionales y multilingües](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
  y [políticas de spam](https://developers.google.com/search/docs/essentials/spam-policies) (el contenido
  a escala por traducción automática sin valor).

**Editores incrustables**

- [Excalidraw — props (`langCode`)](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/props),
  [tldraw — traducciones](https://tldraw.dev/community/translations) y
  [TLUiOverrides](https://tldraw.dev/reference/tldraw/TLUiOverrides).
