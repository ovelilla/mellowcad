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
  inglés, `LA`). El fichero apunta a los nombres globales: `A, *ARC` define el alias del comando ARCO.
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
    (marketing)/[...rest]/page.tsx  notFound() para cualquier otra ruta
    (app)/layout.tsx                root layout del editor
    (app)/draw/page.tsx
    og/route.tsx                    imagen OG de la landing (force-static)
    og/draw/route.tsx               imagen OG del editor
    manifest.webmanifest/route.ts   manifest por idioma
  sketches/hero.json/route.ts       sin idioma
  sitemap.ts, robots.ts, icon.svg, apple-icon.png, favicon.ico
  global-not-found.tsx              red de seguridad en inglés para lo que no pase por [locale]
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
      { source: "/:first((?!(?:en|es|ar)(?:/|$))[^/]+)/:rest*", destination: "/en/:first/:rest*" },
    ],
  }
},
```

Los locales de la expresión se generan a partir de `routing.locales`, y la expresión exacta la fijan los
tests de §10.

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
  `.replace`.
- **Las islas de la landing siguen recibiendo sus textos como props.** La regla de la landing no cambia:
  no se envuelve el árbol con todos los mensajes.
- **El editor sí usa `NextIntlClientProvider`, pero solo con `Editor.*`.** En v4, si no recibe
  `messages`, pasa al cliente todos los mensajes.
- **Precompilación:** se prueba `experimental.messages` con `precompile: true` (ICU compilado en el
  build y runtime `icu-minify`). Se adopta si los tests pasan y reduce el JS del editor; es un flag del
  plugin y se retira sin tocar nada más.
- **Formatos:** `getFormatter`/`useFormatter` con el locale activo, y ningún `Intl.*("en")` fijo. Los
  tres de hoy (`continue-drawing`, `live-canvas`, `lib/og.tsx`) pasan a usar el locale.
- **Valores LTR dentro de un texto RTL:** un nombre de comando, una tecla, un número con unidad, un email
  o una URL se aíslan con una etiqueta del mensaje (`<cmd>{name}</cmd>` → `<bdi dir="ltr">`) o, en texto
  plano (títulos, OG), con los aislantes Unicode FSI/PDI (U+2068/U+2069).
- **Sin literales:** `react/jsx-no-literals` en `components/cad/**` y `components/marketing/**`, con una
  lista corta de signos permitidos (`×`, `—`, `·`).
- Las flechas "→" dejan de estar en los mensajes y pasan a ser un icono que se refleja en RTL (§7.4).

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
  Los enlaces se construyen con `getPathname({ locale, href })`, no con el `Link` de next-intl con
  `locale`: ese fuerza el prefijo `/en` para que un proxy actualice la cookie, y aquí sería una
  redirección en cada enlace al inglés. La navegación es completa, porque cambiar de idioma cambia `lang`,
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
- **La OG árabe usa Readex Pro y el orden visual precalculado:** las líneas las decide el mensaje (el
  título lleva sus saltos de línea) y `bidi-js` reordena cada una. Todo queda aislado en `lib/og.tsx` con
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
  `CanvasScenePresenter`. Hoy usa `start`, que en RTL anclaría las etiquetas a la derecha.
- **El SVG del motor:** `direction="ltr"` y `text-anchor` explícito en `SvgScenePresenter`; en la landing,
  las figuras, la hoja del hero, los separadores de cota y las esquinas de referencia van en un contenedor
  `dir="ltr"`.
- **El icono SCP, la lectura de coordenadas, la línea de comandos y la entrada dinámica**, porque el
  idioma de comandos es LTR.
- **Cualquier valor técnico en una paleta:** campos numéricos, ángulos, unidades. Llevan `dir="ltr"` o
  `<bdi>`, porque en un párrafo RTL `-12.5` se ve `12.5-`.
- Los atajos (`<kbd dir="ltr">`), los emails y las URL.
- **La justificación de TEXTO es física:** izquierda es izquierda, como en AutoCAD.

### 7.4 Iconos

- **Se reflejan** (`rtl:-scale-x-100`) los que expresan dirección lineal o de lectura: las flechas de
  avance y retroceso, la flecha de los CTA, enviar, abrir fuera (↗), y deshacer, rehacer y "zoom previo",
  porque el tiempo lineal se refleja en RTL (Material Design).
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
  idiomas. Con `unicode-range`, `/` y `/es` nunca descargan el fichero árabe; en `/ar` se descubre con el
  CSS, y el fallback con métricas ajustadas de `next/font` contiene el CLS. Si la medición de §10 lo
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
| Catálogo del motor por idioma   | inglés dentro del motor      | ≤ 12 KB gz, cargado con el motor         |
| Mensajes del editor en cliente  | solo `Editor.*`, a medir en la fase 1 | igual                           |
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
- En `ar`: un recorrido solo con teclado (las flechas en menús van al revés); capturas frente al inglés;
  las etiquetas del lienzo no se desplazan; los números negativos se ven bien en las paletas.
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
  nada visible cambia; el chunk del motor crece ≤ 3 KB gz.

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
- **Aceptación:** `/`, `/draw` y `/privacy` sirven el mismo HTML salvo los hashes; todo sigue estático
  (○) y sin middleware en la salida del build; se cumplen los presupuestos; lint sin literales.

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
- **Aceptación:** con `dir="rtl"` forzado en una prueba, la envoltura se refleja bien y el dibujo no; el
  inglés sale idéntico en capturas antes y después.

### Fase 5 — Árabe · M–L

- `messages/ar.json` y la `interface` del motor en árabe; Readex Pro y los ajustes `:lang(ar)`; la OG
  árabe; el manifest en árabe; la comprobación RTL de §10.
- **Publicación:** `ar` sale en `draft` y pasa a `live` tras la revisión nativa.
- **Aceptación:** paridad, la comprobación RTL completa y los presupuestos de `ar`.

### Fase 6 — Contrato del paquete (i18n) · S

- `cad/locales/*` como puntos de entrada públicos (los futuros subpaths), y `EngineLocale`,
  `extendLocale` y el catálogo documentados para quien integre el motor.
- Un test que hace de host ajeno con un idioma parcial y una sustitución.
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

(Vacía hasta la fase 0.)

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
