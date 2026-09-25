# Landing de MellowCAD — brief estratégico

> **Estado:** aprobado para ejecución. Sigue la convención de `docs/next-*.md`: se borra cuando la landing
> esté en producción, y lo que deba perdurar se promueve a `.github/instructions/` (§14).
>
> **Para quién:** quien implemente la landing (tú o un agente en próximas sesiones). Todas las decisiones
> están cerradas (§13). Ante cualquier hueco, quien implemente elige la opción más estándar y actual, la
> anota aquí y sigue adelante, sin preguntar.

## 0. Resumen ejecutivo

1. **Landing en `/` y editor en `/draw`**, en el mismo proyecto y con dos root layouts. Hoy
   `mellowcad.com/` entrega a Google un `<canvas>` vacío: la URL con más autoridad potencial no tiene nada
   que indexar.
2. **Concepto visual: "la hoja de plano".** La página es un plano en espacio modelo: el mismo negro del
   canvas (`#0b0f14`), la rejilla de dibujo, cotas como separadores de sección y un cajetín como footer.
   Nada de gradientes genéricos de SaaS.
3. **El producto es la ilustración.** Todas las imágenes las dibuja el motor real. Un `SvgScenePresenter`
   nuevo (gemelo del `CanvasScenePresenter`) convierte la `Scene` en SVG durante el build. El hero se
   dibuja solo mientras una línea de comandos muestra los prompts que imprime el motor. No hay capturas que
   envejezcan ni afirmaciones que puedan desviarse del producto.
4. **Mensaje:** _Type L. Press Enter. Draw._ La memoria muscular de AutoCAD en una pestaña, sin instalar
   nada, sin cuenta y con los dibujos en tu equipo, siendo explícitos sobre lo que aún falta (DWG/DXF,
   PDF, 3D).
5. **SEO en tres capas:** técnica completa con las APIs de Next 16.3 (fase 1), un **hub de comandos
   AutoCAD** que capta la demanda informacional de exactamente nuestra audiencia (fase 3), y preparación
   para i18n y búsqueda generativa.
6. **El rendimiento forma parte del diseño:** página 100 % prerenderizada, Server Components, islas
   mínimas y animaciones solo con CSS. LCP ≤ 1,8 s p75 en móvil; el motor nunca entra en la carga inicial.
7. **Tema claro e i18n:** los selectores se construyen ya con su UI final pero deshabilitados. Los tokens
   siguen el patrón de clase de next-themes y los textos viven desde el primer día en next-intl (sin
   enrutado por idioma todavía), así que activarlos será configuración, no una refactorización.

## 1. Punto de partida

|              | Hoy                                                                                                                                                                                                     | Qué implica                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Dominio      | `mellowcad.com` en Vercel, `www` → apex                                                                                                                                                                 | Host canónico: `https://mellowcad.com`                                                    |
| `/`          | `CadWorkspace` (client component): el HTML servido es un `<canvas>`                                                                                                                                     | Cero contenido indexable en la URL principal                                              |
| Metadata     | Solo `title` y `description` en `app/layout.tsx`                                                                                                                                                        | Sin canonical, Open Graph, X ni JSON-LD; al compartir el enlace no hay imagen             |
| Ficheros SEO | No hay `robots`, `sitemap`, `manifest` ni imagen OG                                                                                                                                                     | Todo por hacer (§7.1)                                                                     |
| Favicon      | El de la plantilla de create-next-app (commit inicial)                                                                                                                                                  | Pestañas y resultados de Google muestran el logo de Next                                  |
| Stack        | Next 16.3.3 · React 19.2.8 · Tailwind 4 · shadcn/Base UI · lucide · next-themes (clase `.dark`, tecla D) · Inter + Geist Mono · Vercel Analytics + Speed Insights                                       | La landing se construye con esto; no hacen falta dependencias nuevas                      |
| Canvas       | `THEME` solo oscuro (`#0b0f14`, trazo `#e2e8f0`)                                                                                                                                                        | La landing nace oscura y conecta sin salto visual con el editor                           |
| Producto     | ~50 comandos AutoCAD (dibujo, modificación, cotas, bloques, sombreado), 12 referencias a objeto, OTRACK, polar, orto, entrada dinámica, capas, tipos y grosores de línea, autosave local, guardar/abrir | Hay material de sobra; faltan DWG/DXF, impresión/PDF, MTEXT, splines, presentaciones y 3D |
| Estado       | "Work in progress", proyecto personal, contacto por email                                                                                                                                               | La honestidad forma parte del mensaje; no es un descargo                                  |

## 2. Estrategia

### 2.1 Objetivo y métricas

**North star:** sesiones que empiezan a dibujar (≥ 1 entidad creada en `/draw`). La landing existe para
acortar el camino hasta ahí y para traer tráfico orgánico cualificado.

| Métrica                            | Fuente                                                       | Objetivo inicial (hipótesis; recalibrar a las 4 semanas)                          |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| Conversión `/` → `/draw`           | Vercel Analytics                                             | ≥ 30 % de las visitas a `/`                                                       |
| Activación en la primera sesión    | Evento del editor (cuando el plan de Vercel lo permita, §10) | ≥ 60 % de las sesiones de `/draw`                                                 |
| Clics orgánicos sin marca          | Search Console                                               | Crecimiento mensual; el clúster de comandos, en top 20 a los 3 meses de la fase 3 |
| Core Web Vitals (campo, p75 móvil) | Speed Insights                                               | LCP ≤ 1,8 s · INP ≤ 100 ms · CLS ≤ 0,05                                           |
| Lighthouse (laboratorio, móvil)    | Manual / CI                                                  | ≥ 95 en las cuatro categorías; objetivo 100                                       |

### 2.2 Audiencias, ordenadas por encaje con el producto actual

| Segmento                                                                               | Qué necesita                                                                                   | Encaje hoy                                 | Mensaje                                               | Canal principal                                   |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| **Quien aprende AutoCAD** (estudiantes de arquitectura, ingeniería y FP; autodidactas) | Practicar comandos sin licencia ni instalación, en cualquier ordenador (Chromebook, Mac, aula) | Alto: no necesita DWG                      | "Practice AutoCAD commands anywhere, for free"        | SEO informacional (comandos, atajos), comunidades |
| **Profesional de AutoCAD lejos de su puesto**                                          | Un croquis, una medida o una prueba rápida con sus atajos                                      | Medio: sin DWG/DXF ni PDF no cierra flujos | "Sketch with the commands you already know, in a tab" | SEO de categoría y "alternativa", boca a boca     |
| **Perfil técnico o curioso** (devs, makers, Hacker News)                               | Ver un motor CAD serio funcionando en el navegador                                             | Alto como amplificador                     | "A real CAD engine, in the browser"                   | Show HN, Reddit, artículos técnicos               |

Quedan fuera de foco por ahora los flujos DWG profesionales, el 3D, el BIM y los planos de vivienda para
particulares.

### 2.3 Posicionamiento

> _Para quien piensa en comandos de AutoCAD, MellowCAD es dibujo 2D en el navegador que funciona desde la
> memoria muscular (mismos comandos, alias, prompts y referencias a objeto), sin instalar nada, sin cuenta
> y sin que los dibujos salgan del dispositivo._

| Pilar                         | Cómo se demuestra en la página                                                                               |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Memoria muscular**          | Catálogo de comandos y alias derivado del registro (`TOOL_COMMANDS`); transcripciones generadas por el motor |
| **Cero fricción**             | El CTA abre el editor al instante; sin registro ni instalación                                               |
| **Precisión**                 | Viñetas renderizadas por el motor: osnaps, OTRACK, polar, ventanas de selección                              |
| **Tus dibujos, en tu equipo** | Autosave local, guardar/abrir fichero, analítica sin cookies (y por tanto sin banner de cookies)             |
| **Honestidad y evolución**    | Sección "lo que hay / lo que falta / lo siguiente" y changelog                                               |

**Tono:** tranquilo y preciso, con el humor seco de la cultura AutoCAD (prompts, `Unknown command`).
Frases cortas. Sin hype ("revolutionary", "AI-powered"), sin emojis y sin mayúsculas gritonas.

### 2.4 Diferenciación

Las SERP de _free online CAD_ y _AutoCAD alternative_ en 2026 las dominan listados de terceros que mezclan
tres tipos de producto:

|                                   | AutoCAD Web | Herramientas web propias (Rayon, Snaptrude, BranchCAD…) | Escritorio libre (LibreCAD, QCAD) | **MellowCAD**                 |
| --------------------------------- | ----------- | ------------------------------------------------------- | --------------------------------- | ----------------------------- |
| Precio                            | Suscripción | Freemium con límites                                    | Gratis                            | Gratis                        |
| Instalación / cuenta              | No / Sí     | No / Sí                                                 | Sí / No                           | **No / No**                   |
| Comandos, alias y prompts AutoCAD | Sí          | UX propia                                               | Parecidos, no idénticos           | **Sí: son la especificación** |
| DWG / DXF                         | Sí          | Variable                                                | DXF                               | Todavía no                    |
| Dónde viven los datos             | Nube        | Nube                                                    | Local                             | **Local, en el navegador**    |

Esta tabla es análisis interno: hay que verificarla antes de publicar cualquier comparativa. **El hueco:**
nadie combina fidelidad de interacción con AutoCAD, cero fricción, gratuidad y datos locales. La landing
tiene que demostrarlo, no solo decirlo.

### 2.5 Política de afirmaciones (no negociable)

- **Nunca** afirmar DWG/DXF, impresión o PDF, 3D, colaboración, sincronización en la nube, uso en móvil ni
  modo offline instalable. Solo cuando existan.
- "Free" sí, porque es cierto hoy; si algún día deja de serlo, se cambia el texto. "Open source", no: el
  repo es privado y no tiene licencia. Tampoco se enlaza a GitHub.
- Cualquier número (comandos, alias, osnaps, grosores) se **deriva del código en build**. Nunca se escribe
  a mano.
- "AutoCAD" solo como referencia nominativa ("works like AutoCAD", "AutoCAD commands") y con descargo en el
  footer. Nada de logos, colores de marca ni capturas de Autodesk, y "AutoCAD" nunca en el nombre, el logo
  ni el dominio.

## 3. Arquitectura técnica

### 3.1 Decisión: landing en `/` y editor en `/draw`, en el mismo proyecto y con dos root layouts

**Por qué:**

- **Autoridad.** Los enlaces entrantes apuntan a `mellowcad.com`, así que esa URL debe tener contenido
  indexable. El editor no lo tiene ni debe tenerlo.
- **Mismo proyecto.** La landing necesita el motor _en el servidor_ para dibujar sus ilustraciones (§3.4).
  Además comparte tokens y fuentes con la app, se despliega una sola vez y usa un único dominio (sin
  repartir señales con un subdominio).
- **Dos root layouts** (route groups). La landing no carga el `ThemeProvider` ni la tecla D, ni tampoco el
  CSS del editor, y cada lado configura su `<html>`: la landing con `dark` fijo y el editor con
  next-themes. Navegar de uno a otro provoca una recarga completa (lo documenta la guía de route groups),
  lo cual es aceptable e incluso deseable: el editor arranca limpio.
- **`/draw` y no `/app`:** es corto, es un verbo, se lee y se dicta bien ("mellowcad.com/draw"), y el CTA
  "Start drawing" dice lo mismo que la URL.

**Descartado:** un subdominio `app.` (reparte señales, añade configuración y no aporta nada); otro
framework para el marketing (un segundo stack, y se pierde el render del motor en el servidor); dejar la
app en `/` y la landing en `/home` (la raíz seguiría vacía para los buscadores).

**Migración sin pérdidas:** `localStorage` es por origen, no por ruta, así que los dibujos autoguardados
siguen ahí tras el cambio. Para quien vuelve, el CTA pasa a "Continue drawing" (§5.3). No hacen falta
redirecciones.

### 3.2 Árbol de rutas (v1)

```text
app/
├─ (marketing)/
│  ├─ layout.tsx            root layout: <html lang="en" class="dark">, fuentes, marketing.css,
│  │                        metadata base, <Analytics/>, <SpeedInsights/>
│  ├─ page.tsx              /          landing
│  ├─ privacy/page.tsx      /privacy
│  ├─ opengraph-image.tsx   imagen OG 1200×630 generada en build
│  └─ marketing.css         entrada de Tailwind acotada con @source + tokens de la landing
├─ (app)/
│  ├─ layout.tsx            root layout del editor: el app/layout.tsx actual + robots noindex + OG
│  └─ draw/page.tsx         /draw      <CadWorkspace />
├─ global-not-found.tsx     404 global (con varios root layouts no hay un layout común desde el
│                           que componer not-found; requiere experimental.globalNotFound)
├─ sitemap.ts · robots.ts · manifest.ts
└─ icon.svg · apple-icon.png · favicon.ico
components/marketing/       secciones (Server Components) + islas "use client" pequeñas
messages/en.json            todo el texto de la landing, por secciones (formato de next-intl)
i18n/request.ts             configuración de next-intl: locale fijo "en", sin enrutado por idioma (§3.5)
content/demos/              guiones de comandos que el motor reproduce en build (§3.4)
content/drawings/           dibujos hechos en MellowCAD (.ecad.json) para viñetas complejas
lib/site.ts                 SITE_URL, nombre, contacto, fecha del contenido
```

Más adelante (fases 3 y 4) se añaden `commands/`, `commands/[slug]/` (con `generateStaticParams` a partir
del registro), `shortcuts/`, `changelog/` y el árbol de idiomas (§3.5).

### 3.3 Render

- **100 % estática.** Nada en la landing lee cookies, cabeceras ni `searchParams`, así que Next la
  prerenderiza en build y Vercel la sirve desde CDN. No hace falta `cacheComponents` y no conviene
  activarlo solo por esto.
- **Server Components por defecto.** Solo hay islas cliente donde existe estado del navegador:
  `ContinueDrawing` (¿hay autosave?), `HeroControls` (pausa y repetición), `CommandTry` (autocompletado,
  con carga diferida) y `SendToDesktop` (móvil). En la fase 2 se añade `LiveCanvas`, bajo demanda.
- **JSON-LD** como `<script type="application/ld+json">` en la página, escapando `<` como `\u003c`, tal
  como recomienda la guía de Next.
- **CSS:** `marketing.css` con Tailwind v4 acotado a las carpetas de marketing (`source(none)` +
  `@source`), para no arrastrar las utilidades del editor. `experimental.inlineCss` es global (afectaría
  también a `/draw`, donde conviene cachear la hoja de estilos), así que no se activa sin medir.

### 3.4 El motor como ilustrador

Es la pieza más diferencial del plan y encaja limpiamente en la arquitectura hexagonal: `scene/types.ts`
ya prevé "SVG, WebGL or a test serialiser tomorrow".

```text
content/demos/hero.ts        guion en el mismo estilo encadenado que test/harness.ts
        │ (build, Node)
        ▼
CadRuntime headless          por cada paso: entidades nuevas + líneas de la línea de comandos
        │                    (los prompts reales, tal como los imprime el motor)
        ▼
buildDrawingPreview()        cámara común (zoomToBounds del dibujo final) → una Scene por paso
        ▼
SvgScenePresenter            <svg> inline: un <g> por paso, pathLength="1", colores como var(--cad-*),
                             y la línea de tiempo en custom properties para las animaciones CSS
```

```ts
// content/demos/hero.ts (ilustrativo)
export const hero = demo()
  .command("RECTANG")
  .type("0,0")
  .enter()
  .type("@120,80")
  .enter()
  .command("CIRCLE")
  .type("30,40")
  .enter()
  .type("12")
  .enter()
  .command("OFFSET")
  .type("4")
  .enter()
  .click(30, 52)
  .click(30, 70)
  .escape()
```

- **Conducir el motor con guiones.** Hay que extraer el núcleo del harness (`test/harness.ts`) a una
  pieza DOM-free en `cad/application/` y hacer que el harness la envuelva. Así existe una sola forma de
  conducir el motor, que la usan los tests y la landing.
- **`buildDrawingPreview()`** (application) generaliza `buildBlockPreview`: `Viewport` + `zoomToBounds` +
  `buildScene` sin rejilla ni overlays, para un dibujo o un subconjunto de entidades con una cámara
  compartida. Así las capas de cada paso encajan al píxel.
- **`SvgScenePresenter`** (adapters) es el gemelo del `CanvasScenePresenter` y devuelve un string SVG (el
  motor sigue sin React): `segment` → `<line>`, `circle` → `<circle>`, `arc`/`ellipse` → `<path d="…A…">`
  (sweep y large-arc a partir de los ángulos en pantalla; el giro completo, en dos medios arcos), `path` →
  `<path fill-rule="evenodd">`, `text` → `<text>` con la altura de mayúsculas calculada con un ratio fijo
  de la fuente, y `dash` → `stroke-dasharray`. Las coordenadas se redondean a 1 decimal. Una opción
  `palette` traduce los colores de `THEME` a `var(--cad-…)`, de modo que el tema claro no requiere volver a
  renderizar. Los tests de Vitest corren en Node, sin jsdom, e incluyen el caso de arco y elipse con el
  eje Y invertido, igual que ya se hace para el canvas.
- **Los prompts no se escriben a mano.** La transcripción animada del hero es la que imprime el motor al
  reproducir el guion. Si un prompt cambia, la landing se actualiza en el siguiente build; si un comando se
  rompe, falla el test del guion. **La página no puede mentir sobre el producto.**
- Las viñetas complejas (una planta, una pieza acotada) se dibujan en el propio MellowCAD y el
  `.ecad.json` se guarda en `content/drawings/`. Frase para la página: _"Every drawing on this page was
  drawn in MellowCAD."_
- El mismo SVG alimenta la imagen OG (fase 1) y las páginas de comando (fase 3).

### 3.5 Preparada para tema e i18n, sin activarlos

**Tema**

- Los tokens de la landing tienen la misma forma que los del editor (`:root` / `.dark`), pero en v1 solo
  se definen los oscuros y `<html class="dark">` va fijo en el layout de marketing.
- `ThemeSelect` tiene su UI final (un control segmentado System / Light / Dark con los iconos
  `Monitor`/`Sun`/`Moon` de lucide), `aria-disabled="true"`, tooltip "Light theme coming soon" y ningún
  handler.
- Para activarlo después: añadir los valores claros, envolver la landing con el `ThemeProvider` de
  next-themes usando **el mismo `attribute="class"` y la misma clave de almacenamiento que el editor** (así
  la preferencia viaja entre la landing y la app) y quitar el `aria-disabled`. Los SVG ya usan
  `var(--cad-*)`.
- `viewport` en v1: `themeColor: "#0b0f14"` y `colorScheme: "dark"`.

**Idiomas**

- **next-intl desde la v1**, que es el estándar de facto para i18n en el App Router, en su modo _sin
  enrutado por idioma_: `i18n/request.ts` devuelve el locale fijo `en` y `messages/en.json`, sin leer
  cabeceras ni cookies, así que la página sigue siendo estática. Los Server Components usan
  `getTranslations()` y los componentes no contienen literales. Los mensajes se tipan con la ampliación
  `AppConfig` de next-intl a partir del JSON. Los formatos usan su `useFormatter`/`getFormatter` (sobre
  `Intl`).
- Las islas cliente reciben sus textos como props desde el servidor, en lugar de envolver el árbol con
  todos los mensajes: así no viajan al navegador textos que no hacen falta.
- `LanguageSelect` tiene su UI final (un globo con "English" y "Español (soon)") y está deshabilitado
  igual que el de tema. Cuando se active serán **enlaces reales** a la URL equivalente (el `Link` de
  next-intl), no un toggle en JS, para que los rastreadores descubran las versiones.
- **No declarar `hreflang` mientras no exista el segundo idioma.**
- **Al activar el segundo idioma** (fase 4), se aplica el patrón documentado de next-intl para Next 16:
  las rutas de marketing pasan a `app/(marketing)/[locale]/`, `proxy.ts` usa el middleware de next-intl
  con `localePrefix: "as-needed"` (inglés sin prefijo en `/`, español en `/es/…`) y un `matcher` que
  excluye `/draw`, `_next`, `api` y los ficheros de metadata, y la renderización estática se mantiene con
  `generateStaticParams` más `setRequestLocale` en cada layout y página.

### 3.6 Cambios necesarios en el motor

| Fase | Cambio                                                                                             | Capa                     | Nota                                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `buildDrawingPreview()`                                                                            | application              | Generaliza `buildBlockPreview`; se exporta en el barrel                                                                                                                                                        |
| 1    | `SvgScenePresenter`                                                                                | adapters                 | Devuelve un string SVG; tests de estructura y de arcos/elipses                                                                                                                                                 |
| 1    | Conducción por guiones (extraída del harness)                                                      | application              | Headless y DOM-free; la reutilizan los tests, la landing y las páginas de comando                                                                                                                              |
| 1    | Lista pública de comandos (nombre, alias, descripción) y `matchCommands` en el barrel              | application              | Hoy `commandList` es privado en `CadRuntime` y `matchCommands` no se exporta                                                                                                                                   |
| 1    | Resumen del autosave (`hasSavedDrawing()` o nº de objetos)                                         | adapters + serialization | La landing no debe conocer la clave `easycad:autosave:v1`. Lo exige `ui.instructions.md`: si un botón necesita una capacidad del navegador, el motor le debe un método                                         |
| 2    | Opciones de `CadEngine`: `store` inyectable, teclado acotado a la superficie y rueda solo con foco | adapters                 | Hoy escucha `keydown` y `contextmenu` en todo el documento y hace `preventDefault` de la rueda: incrustado en la landing secuestraría el teclado y el scroll. Por defecto, el comportamiento actual del editor |

## 4. Dirección visual

### 4.1 Concepto: "la hoja de plano"

La página es una hoja de dibujo en espacio modelo, de noche. Quien usa AutoCAD a diario debe reconocer
cada detalle, y ninguno puede estar mal.

**Principios**

1. **El producto es la ilustración.** Ni stock, ni mockups de dispositivos, ni capturas falsas, ni
   imágenes generadas, ni renders 3D. Solo dibujos del motor.
2. **La precisión es el ornamento.** Cada elemento decorativo es un artefacto CAD real usado
   correctamente: flechas de cota, marcadores de referencia con su glifo exacto, icono SCP, ventanas de
   selección.
3. **Calma (mellow).** Mucho aire, un solo acento y movimiento lento y con propósito.
4. **La velocidad es parte del diseño.** Nada espera a JavaScript para verse.
5. **Interfaz honesta.** Lo que parece interactivo lo es; los selectores "coming soon" lo dicen.

**Por qué este concepto:** es auténtico para la audiencia (un vocabulario que reconoce al instante),
diferencia frente a las landings SaaS genéricas, es barato (CSS y SVG) y escala a todas las páginas
futuras, porque cada página es una "hoja" con su cajetín.

### 4.2 Color (oscuro, v1)

**Por qué oscuro primero:** es el espacio modelo en el que trabaja la audiencia, los dibujos de trazo claro
se leen mejor sobre tinta y el fondo es exactamente el del canvas, así que al pulsar el CTA el editor
aparece sobre el mismo negro, sin costuras. El tema claro llegará junto con el del editor.

| Token                           | Valor                              | Uso                                                                                  | Contraste sobre `--bg` |
| ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------ | ---------------------- |
| `--bg`                          | `#0b0f14`                          | Página (= `THEME.background`)                                                        | —                      |
| `--bg-raised`                   | `#111820`                          | Tarjetas, cabecera fija, cajetín                                                     | —                      |
| `--bg-sunken`                   | `#080b0f`                          | Pozos de la línea de comandos y del código                                           | —                      |
| `--grid-minor` / `--grid-major` | `rgb(148 163 184 / .06)` / `/ .12` | Rejilla de dibujo (derivada de `THEME.gridMinor/Major`)                              | —                      |
| `--border`                      | `rgb(148 163 184 / .16)`           | Bordes finos                                                                         | —                      |
| `--text`                        | `#e2e8f0`                          | Titulares y texto fuerte (= trazo de entidad)                                        | 15,6 : 1               |
| `--text-muted`                  | `#94a3b8`                          | Texto de cuerpo                                                                      | 7,5 : 1                |
| `--text-subtle`                 | `#74839a`                          | Etiquetas y pies; es el mínimo permitido                                             | ≈ 5,0 : 1              |
| `--accent`                      | `#f59e0b`                          | CTA principal, anillo de foco, énfasis puntual                                       | 9,0 : 1                |
| `--accent-ink`                  | `#0b0f14`                          | Texto sobre el acento                                                                | 9,0 : 1                |
| `--precision`                   | `#22d3ee`                          | Marcadores de referencia y medidas (= `THEME.snap`)                                  | 10,6 : 1               |
| `--cad-*`                       | Valores de `THEME`                 | Ejes, polar, OTRACK, pinzamientos, ventanas de selección; solo dentro de los dibujos | —                      |

**Por qué ámbar:** en el editor es el color de "seleccionado" (`THEME.selected`), es cálido (mellow), tiene
contraste de sobra y se aleja del azul SaaS por defecto. El cian queda reservado para la precisión, igual
que en el editor, y **no** se usa en enlaces: los enlaces son `--text` subrayado y pasan a ámbar al hacer
hover. Regla: un solo acento por vista; todo lo demás, escala de grises tinta.

### 4.3 Tipografía

- **Inter con el eje `opsz`** (`next/font/google` con `axes: ["opsz"]`; Inter lo expone de 14 a 32). A
  tamaño de titular usa automáticamente el corte Display, más fino y más apretado. Da un aspecto premium
  sin añadir familia y con continuidad total con el editor.
- **Geist Mono** (ya está en la app) para la línea de comandos, las coordenadas, las etiquetas, las teclas
  y los datos, con `tabular-nums`.
- Solo el subconjunto `latin`, que también cubre el español (ñ, tildes, ¿, ¡). Presupuesto de fuentes: 2
  ficheros y ≤ 110 KB woff2 en total. Si el eje `opsz` se sale del presupuesto, quedarse con `wght` y
  compensar con el tracking.

| Rol           | Tamaño (fluido)                          | Interlineado | Tracking | Peso                            |
| ------------- | ---------------------------------------- | ------------ | -------- | ------------------------------- |
| Display (H1)  | `clamp(2.75rem, 1.6rem + 4.2vw, 5.5rem)` | 1.0          | −0.035em | 600                             |
| H2            | `clamp(2rem, 1.4rem + 2.2vw, 3.25rem)`   | 1.08         | −0.025em | 600                             |
| H3            | `1.25rem` – `1.5rem`                     | 1.25         | −0.01em  | 600                             |
| Lead          | `1.125rem` – `1.25rem`                   | 1.6          | 0        | 400, `--text-muted`             |
| Cuerpo        | `1rem`                                   | 1.65         | 0        | 400                             |
| Etiqueta mono | `0.75rem`, mayúsculas                    | 1.4          | 0.14em   | Geist Mono 500, `--text-subtle` |
| Dato mono     | `0.875rem`                               | 1.5          | 0        | Geist Mono 400, `tabular-nums`  |

Reglas: `text-wrap: balance` en los titulares y `pretty` en los párrafos; párrafos de ≤ 64ch; las cifras
siempre en mono; sin cursivas ni mayúsculas en la sans.

### 4.4 Retícula, espaciado y la hoja

- 12 columnas, contenido de 1200 px como máximo y medianiles de 24 px (16 px en móvil). Base de 8 px.
  Ritmo vertical entre secciones de 128–160 px en escritorio y 80–96 px en móvil.
- **Rejilla de dibujo** de fondo hecha con dos `linear-gradient` (la menor cada 24 px y la mayor cada 5
  menores, como el `GRIDMAJOR` = 5 de AutoCAD) y difuminada con una `mask-image` radial. Coste cero.
- **Marco de hoja** (≥ 1440 px): un borde de 1 px a 24 px del viewport con referencias de zona (A–F en
  vertical, 1–8 en horizontal) en mono de 10 px, como una hoja normalizada. Es un pseudo-elemento fijo con
  `pointer-events: none`, oculto en pantallas más pequeñas.
- **Los separadores de sección son líneas de cota:** una línea fina con flechas rellenas en los extremos
  (las del estilo ISO-25 por defecto) y la etiqueta centrada en mono: `◀──── 02 · PRECISION ────▶`.
- **El footer es un cajetín** (§5.11).

### 4.5 Vocabulario gráfico CAD y sus reglas

| Elemento                       | Dónde                                                                                        | Regla                                                                                                                                          |
| ------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Marcadores de referencia       | Esquinas de las tarjetas (puntos finales) y centros de elementos circulares, en hover o foco | Glifo exacto de cada modo, reutilizando la forma que ya dibuja el motor; 10 px, trazo de 1,5 px, `--precision`. Nunca como decoración estática |
| Línea de comandos              | Hero, CTA final, 404                                                                         | `Command:` en `--text-subtle`, la entrada en `--text` y las opciones entre corchetes, con el estilo del `CommandLine` del editor               |
| Lectura de coordenadas         | Marco del hero                                                                               | `X 128.40  Y 64.20` en mono tabular, como en la barra de estado                                                                                |
| Icono SCP                      | Esquina inferior izquierda del marco del hero                                                | X roja e Y verde, con los colores de `THEME.axisX` y `THEME.axisY`                                                                             |
| Ventana y captura de selección | Hover de los grupos del catálogo                                                             | Azul continuo (ventana) o verde discontinuo (captura), con los rellenos de `THEME`                                                             |
| Líneas de cota                 | Separadores y diagramas                                                                      | Flechas y huecos de las líneas de referencia correctos                                                                                         |

Un glifo o una semántica equivocados (un marcador de punto medio cuadrado, una flecha al revés) los detecta
nuestra audiencia a la primera. Hay que revisarlo con alguien que use AutoCAD a diario.

### 4.6 Movimiento

- **Ploteo (hero y viñetas):** `stroke-dashoffset` de 1 a 0 con `pathLength="1"`, 250–700 ms por
  primitiva según su longitud, escalonado cada 40–80 ms y con la curva `cubic-bezier(0.65, 0, 0.35, 1)`.
  Las líneas discontinuas (CENTER, HIDDEN) y los textos aparecen por opacidad, porque su `dasharray` ya
  está ocupado.
- **Tecleo de la línea de comandos:** una animación de `width` en unidades `ch` con `steps(n)` (por eso la
  mono), sincronizada con el ploteo mediante custom properties (`--t`, `--d`) que calcula el servidor a
  partir del guion. Cero JS.
- **Revelado al hacer scroll:** `animation-timeline: view()` dentro de `@supports` y de
  `prefers-reduced-motion: no-preference`. Chromium y Safari 26 lo soportan; Firefox estable, todavía no.
  El contenido es visible por defecto: nada depende de una animación para aparecer.
- **Cabecera:** `sticky`, pasa de transparente a `--bg-raised` con `animation-timeline: scroll()`; sin
  soporte, tiene fondo siempre.
- **Micro-interacciones:** 120–180 ms. El anillo de foco aparece sin transición.
- **Hacia el editor (fase 2):** una view transition entre documentos (`@view-transition { navigation:
auto; }` en los dos CSS y `view-transition-name: drawing-sheet` en el marco del hero y en el contenedor
  del canvas). El marco crece hasta convertirse en el editor, en unos 400 ms. Funciona en Chromium y en
  Safari 18.2+; el resto lo ignora sin romperse.
- **Accesibilidad del movimiento:** con `prefers-reduced-motion`, todo aparece en su estado final y con la
  transcripción completa. La secuencia del hero dura 8–12 s, se reproduce una vez y tiene control de pausa
  y repetición (WCAG 2.2.2).

### 4.7 Logo, iconos e imágenes

- **Marca:** una "m" minúscula trazada como una polilínea con dos segmentos de arco (los _bulges_ de
  PLINE) que termina en un marcador de punto final cian. Suave (mellow) y precisa (CAD). Hay que validarla
  a 16 px y en monocromo. El logotipo es "MellowCAD" en Inter Display 600, con −0.02em.
- **Favicon:** `app/icon.svg` con `prefers-color-scheme` interno, `apple-icon.png` de 180 px, iconos de
  192 y 512 px (uno _maskable_) para el manifest y un `favicon.ico` de marca como alternativa. Sustituye al
  de la plantilla.
- **Iconos:** lucide (ya está en el proyecto) y los glifos CAD de `components/cad/icons.tsx` cuando
  encajen.
- **Imagen OG:** el dibujo del hero más el titular, generada con `ImageResponse` en build. Hay que
  comprobar que Satori rasteriza bien el SVG, incluidas las fuentes de las cotas.

### 4.8 Lo que no haremos

Gradientes de malla violeta y azul con manchas de brillo; glassmorphism por todas partes; un bento de
iconos genéricos; testimonios, logos de clientes o contadores inventados; parallax o scroll secuestrado;
vídeo en autoplay en el hero; banner de cookies (no hace falta, porque la analítica de Vercel no usa
cookies); widgets de chat; popups de salida; y cualquier elemento de la imagen de marca de Autodesk.

## 5. Estructura de la página

### 5.1 Mapa

| #   | Sección (ancla)             | Objetivo                                 | Rol SEO                                                | Rol de conversión          |
| --- | --------------------------- | ---------------------------------------- | ------------------------------------------------------ | -------------------------- |
| —   | Cabecera                    | Orientar y tener el CTA siempre a mano   | Enlaces internos                                       | CTA persistente            |
| 1   | Hero                        | Entender qué es en 5 s y verlo funcionar | H1 y categoría                                         | CTA principal              |
| 2   | Muscle memory (`#commands`) | Demostrar la fidelidad de los comandos   | "AutoCAD commands and aliases"                         | Autocompletado "Try it"    |
| 3   | Precision (`#precision`)    | Demostrar las ayudas al dibujo           | osnap, polar tracking, OTRACK                          | Deseo                      |
| 4   | Toolset (`#features`)       | Mostrar la amplitud                      | Nombres de comandos en HTML                            | CTA intermedio             |
| 5   | Local-first (`#privacy`)    | Quitar el miedo a perder o ceder datos   | "no install", "no sign-up"                             | Menos fricción             |
| 6   | Engine (`#engine`)          | Credibilidad técnica                     | Contenido único                                        | Confianza (perfil técnico) |
| 7   | Status (`#roadmap`)         | Expectativas honestas                    | Respuestas exactas para la IA ("does it support DWG?") | Evita rebotes frustrados   |
| 8   | FAQ (`#faq`)                | Resolver objeciones                      | Preguntas reales                                       | Objeción → CTA             |
| 9   | CTA final                   | Cerrar                                   | —                                                      | CTA                        |
| —   | Footer (cajetín)            | Metadatos, legal, selectores             | Enlaces, marca                                         | Contacto                   |

**Orden deliberado:** primero se **demuestra** (1–4), luego se **tranquiliza** (5–7) y al final se
**responde** (8). La sección de honestidad llega después de la demostración, cuando el visitante ya ha
visto valor.

### 5.2 Cabecera

```text
[m] MellowCAD        Features   Commands   Roadmap   FAQ              [ Start drawing → ]
```

Es fija. En móvil muestra el logo, el CTA y un menú hecho con el atributo `popover` nativo (cero JS). El CTA
es pequeño y ámbar.

### 5.3 Hero

```text
┌────────────────────────────────────────────────────────────────────────────────────┐
│  2D CAD IN YOUR BROWSER                        ┌──────────────────────────────────┐ │
│                                                │                                  │ │
│  Type L.                                       │  (dibujo del motor ploteándose:  │ │
│  Press Enter.                                  │   pieza con taladros, empalmes,  │ │
│  Draw.                                         │   ejes, sombreado y cotas)       │ │
│                                                │                                  │ │
│  The commands, aliases, prompts and object     │  Y                               │ │
│  snaps AutoCAD users already know — in a       │  └─X        X 128.40   Y 64.20   │ │
│  browser tab. Nothing to install, no           ├──────────────────────────────────┤ │
│  account, and your drawings stay on your       │ Command: CIRCLE                  │ │
│  device.                                       │ <prompt real impreso por motor>  │ │
│                                                │ Command: _▌               ❚❚  ↻  │ │
│  [ Start drawing → ]   See the commands        └──────────────────────────────────┘ │
│  Free · No sign-up · Nothing to install · Local autosave                           │
└────────────────────────────────────────────────────────────────────────────────────┘
```

- **H1 en dos niveles, ambos dentro del `<h1>`:** la etiqueta mono "2D CAD in your browser" y el display
  "Type L. Press Enter. Draw.", con un separador visualmente oculto para que los lectores de pantalla lo lean
  con naturalidad. **Por qué:** es literalmente el gesto de la memoria muscular (L = LINE), autoselecciona
  a la audiencia y transmite inmediatez, mientras el nivel superior ancla la categoría para los buscadores.
- **Marco del dibujo** (7 de 12 columnas): el SVG inline del motor (candidato a LCP junto al H1; al no ser
  una imagen, no hay descarga que esperar), la rejilla, el icono SCP, las coordenadas y la línea de
  comandos acoplada.
- **CTA:** "Start drawing" (→ `/draw`, un `<a>` real). A quien tiene un autosave, la isla
  `ContinueDrawing` le cambia el texto tras hidratar a "Continue drawing · 23 objects", con el `min-width`
  reservado para que el CLS sea 0.
- **Micro-prueba** bajo el CTA, en mono y `--text-subtle`.
- **Tema del dibujo:** una pieza mecánica (una brida o un soporte) que use lo que mejor luce y ya está
  implementado: RECTANG/PLINE, FILLET, CIRCLE, OFFSET, ejes con el tipo de línea CENTER, HATCH ANSI31,
  DIMLINEAR y DIMDIAMETER.

### 5.4 Muscle memory (`#commands`)

- **H2:** "The commands you know, down to the aliases."
- **Lead:** "Type L for LINE, O for OFFSET, TR for TRIM. MellowCAD reads the same aliases, asks the same
  questions in the same order and takes the same option letters."
- **Visual:** un tablero de teclas con los alias agrupados como la cinta de opciones (Draw, Modify,
  Annotate, View, Inquiry). En hover o foco muestra el nombre completo, la descripción del registro y el
  estado (completo o parcial). Todo se deriva de la lista pública de comandos (§3.6).
- **Isla "Try it"** (carga diferida): un prompt `Command:` con el autocompletado real (`matchCommands`);
  Enter abre `/draw`.
- **Tarjeta de transcripción:** una secuencia completa (por ejemplo, OFFSET) reproducida por el motor, con
  el pie "Same prompts, same order, same option letters as AutoCAD."

### 5.5 Precision (`#precision`)

- **H2:** "Precision you can feel under the cursor."
- Cuatro viñetas del motor, con overlays reales generados moviendo el cursor en el runtime headless:
  **osnaps** (una tangente con su tooltip), **OTRACK** (dos puntos adquiridos y sus trayectorias de
  alineación), **polar y orto** (la guía verde con "Polar: … < 30°") y **ventana frente a captura**. Cada
  una lleva su tecla (F8 Ortho, F9 Snap, F10 Polar) y una línea de texto.
- La entrada dinámica (`@100<30`, `#x,y`) solo se menciona en el texto: en el editor es UI HTML, no
  primitivas de escena, así que no se ilustra en v1.

### 5.6 Toolset (`#features`)

- **H2:** "A real 2D drafting toolset — and growing."
- Seis grupos presentados como un índice de planos: Draw · Modify · Annotate · Organize (capas, tipos de
  línea, 24 grosores, colores, bloques) · Inquiry & view · Files & clipboard. Cada grupo lleva una
  miniviñeta del motor: una polilínea con arcos, desfases concéntricos, una cadena de cotas, capas con
  CENTER y HIDDEN, un sombreado.
- En hover aparece una ventana de selección azul sobre el grupo. Los comandos son texto HTML y en la fase 3
  enlazarán a `/commands/[slug]`.
- CTA intermedio.

### 5.7 Local-first (`#privacy`)

- **H2:** "Your drawings stay on your device."
- Tres hechos: autosave en el navegador; guardar y abrir fichero (Ctrl+S / Ctrl+O); sin cuenta, sin subidas
  y con analítica sin cookies. Y la advertencia honesta que ya da el panel About: borrar los datos del
  sitio borra el autosave, así que conviene guardar un fichero.
- Un diagrama mínimo dibujado como un plano.

### 5.8 Engine (`#engine`)

- **H2:** "Not a drawing toy. A CAD engine."
- Núcleo geométrico puro · cada gesto es un solo paso de deshacer · formato de fichero versionado y
  tolerante · la fidelidad con AutoCAD como especificación · casi mil tests automatizados (la cifra del
  último release, redondeada a la baja).
- Un diagrama de capas (geometry → domain → scene → application → adapters) dibujado con cotas y un enlace
  a un futuro artículo técnico.

### 5.9 Status (`#roadmap`)

- **H2:** "Honest about what's here — and what isn't yet."
- Tres columnas: **Works today**, **Not yet** (DWG/DXF, impresión y PDF, presentaciones, MTEXT, splines,
  3D, móvil) y **Next up** (del roadmap: MTEXT, atributos de bloque, SPLINE, SCP).
- Fecha de actualización, enlace al changelog (fase 2) y "Missing something you need? Tell me" (el mailto
  actual).

### 5.10 FAQ (`#faq`) y CTA final

- **FAQ:** 8 preguntas en `<details>`/`<summary>` nativos (cero JS y accesibles), con respuestas de 1 a 3
  frases (§6).
- **CTA final:** "Your drafting table is one keystroke away.", un prompt `Command: _` con el cursor
  parpadeando (CSS) y el botón.

### 5.11 Footer: el cajetín

```text
┌──────────────────────┬────────────────────────────────────────┬────────────────────┐
│ [m] MellowCAD        │ PRODUCT  Start drawing · Commands ·    │ LANGUAGE  [EN ▾]   │
│ 2D CAD in your       │          Roadmap · FAQ · Privacy       │ THEME     [◐ ▾]    │
│ browser              │ CONTACT  <email>                       │ (coming soon)      │
├──────────────────────┼──────────────────┬─────────────────────┼────────────────────┤
│ DWG NO. MC-001       │ REV 0.0.x · date │ SCALE 1:1           │ SHEET 1 OF 1       │
└──────────────────────┴──────────────────┴─────────────────────┴────────────────────┘
AutoCAD is a registered trademark of Autodesk, Inc. MellowCAD is an independent project,
not affiliated with or endorsed by Autodesk.
```

Los selectores viven en el cajetín: encajan en la metáfora (son metadatos de la hoja) y dejan la cabecera
limpia y centrada en el CTA. `REV` sale de `package.json` y de la fecha del build. El cajetín no lleva
nombre de autor: la marca firma como proyecto independiente y el contacto es el email que ya publica el
panel About.

### 5.12 Móvil

El editor está pensado para teclado y ratón, como AutoCAD. En móvil se muestran el H1, el lead, el CTA con
la nota "Best on a computer with keyboard and mouse", el dibujo animado y la isla `SendToDesktop` (Web Share
API, con "copiar enlace" como alternativa) para convertir la intención en una visita posterior. No hay
canvas vivo en móvil.

### 5.13 404

```text
Command: PRICING
Unknown command "PRICING".  Press F1 for help.

[ Back to the drawing sheet ]   [ Start drawing ]
```

Es el mensaje real de AutoCAD con la ruta pedida: un guiño que solo entiende nuestra audiencia. Devuelve un
404 de verdad.

## 6. Textos clave de la v1 (inglés)

| Pieza               | Texto                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>` (home)    | `Online 2D CAD with AutoCAD commands — MellowCAD` (47 caracteres)                                                                                                                                             |
| Plantilla de título | `%s · MellowCAD`                                                                                                                                                                                              |
| Meta description    | `2D drafting in your browser with the commands, aliases and object snaps AutoCAD users know. No install, no sign-up; drawings stay on your device.` (145)                                                     |
| H1                  | `2D CAD in your browser` / `Type L. Press Enter. Draw.`                                                                                                                                                       |
| Lead                | `MellowCAD is 2D drafting in your browser that works the way AutoCAD does: the same commands, aliases, prompts and object snaps. Nothing to install, no account — and your drawings never leave your device.` |
| CTA                 | `Start drawing` / `Continue drawing` · secundario: `See the commands`                                                                                                                                         |
| Micro-prueba        | `Free · No sign-up · Nothing to install · Local autosave`                                                                                                                                                     |
| H1 alternativos     | `Draft from muscle memory.` · `AutoCAD muscle memory, in a browser tab.`                                                                                                                                      |

**Borradores de la FAQ** (`{N}` se deriva del registro):

1. **Is MellowCAD free?** Yes — free to use, with no account and no trial. It's an independent project
   under active development.
2. **Do I need to install anything?** No. It runs in a modern desktop browser — Chrome, Edge, Firefox or
   Safari. Open mellowcad.com/draw and type a command.
3. **Does it really work like AutoCAD?** That's the spec: commands, aliases, prompt order, option letters
   and defaults follow current AutoCAD. Some commands are still partial, and the roadmap lists exactly
   which options are missing.
4. **Can I open or save DWG or DXF files?** Not yet. Drawings are saved in MellowCAD's own versioned file
   format. DXF import and export are on the roadmap but not scheduled yet.
5. **Where are my drawings stored?** On your device. MellowCAD autosaves in your browser and never uploads
   your drawings. Clearing the site's data deletes the autosave, so press Ctrl+S to keep a file.
6. **Is MellowCAD affiliated with Autodesk?** No. It's an independent project. AutoCAD is a registered
   trademark of Autodesk, Inc.
7. **Does it work on tablets or phones?** It opens, but it's built for a keyboard and mouse, like AutoCAD.
   Use a computer.
8. **Which commands are supported?** {N} commands, including LINE, PLINE, CIRCLE, ARC, ELLIPSE, HATCH,
   OFFSET, TRIM, FILLET, ARRAY, dimensions, blocks and layers. See the full list with the supported
   options.

Para la versión en español: "Escribe L. Pulsa Intro. Dibuja.". Ojo: "Intro" es el nombre de la tecla en
España; para un español neutro, "Enter" o el símbolo ⏎.

## 7. SEO

### 7.1 SEO técnico (fase 1)

| Qué                    | Cómo en Next 16.3                                                                                                                       | Notas                                                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Base de URLs y títulos | `metadata` del layout de marketing: `metadataBase: new URL(SITE_URL)`, `title: { default, template }`, `description`, `applicationName` | `metadataBase` en ambos root layouts, desde `lib/site.ts`                                                                                           |
| Canónica               | `alternates: { canonical: "/" }` en cada página                                                                                         | Host apex con https (`www` ya redirige)                                                                                                             |
| Open Graph y X         | `opengraph-image.tsx` con `ImageResponse` (estático en build) y `export const alt`; `twitter: { card: "summary_large_image" }`          | Una por página de comando en la fase 3                                                                                                              |
| Iconos                 | `app/icon.svg`, `app/apple-icon.png` e iconos del manifest                                                                              | Fuera el favicon de la plantilla                                                                                                                    |
| `robots.txt`           | `app/robots.ts`: permitir todo y enlazar el sitemap                                                                                     | **No bloquear `/draw`**: si se bloquea, Google no puede leer su `noindex` y podría indexar la URL sin contenido                                     |
| `sitemap.xml`          | `app/sitemap.ts` solo con URLs indexables                                                                                               | `lastModified` = fecha real del contenido, no `new Date()` en cada build: Google solo usa `lastmod` si es fiable e ignora `changefreq` y `priority` |
| Manifest               | `app/manifest.ts`: `start_url: "/draw"`, `display: "standalone"`, colores `#0b0f14`, iconos, `categories`                               | Permite instalar el editor como app                                                                                                                 |
| Viewport               | `export const viewport = { themeColor, colorScheme }`                                                                                   | `themeColor` dentro de `metadata` está obsoleto                                                                                                     |
| Editor                 | `/draw`: `robots: { index: false, follow: true }`, título y OG propios, sin JSON-LD                                                     | La gente compartirá esa URL: necesita vista previa aunque no se indexe                                                                              |
| 404                    | `app/global-not-found.tsx` y `experimental.globalNotFound: true`                                                                        | Estado 404 real                                                                                                                                     |
| Semántica              | Un solo `<h1>`, jerarquía H2/H3, landmarks y todo el texto en HTML (Server Components)                                                  | El contenido nunca va dentro de un canvas                                                                                                           |
| Verificación           | `metadata.verification` (Google y `msvalidate.01` para Bing)                                                                            | Enviar el sitemap e inspeccionar `/`                                                                                                                |
| Cabeceras (opcional)   | `headers()` en `next.config.ts`: `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy`                                      | Higiene y puntuación de "Best Practices"                                                                                                            |

### 7.2 Datos estructurados

Un único `@graph` en la home:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://mellowcad.com/#website",
      "url": "https://mellowcad.com/",
      "name": "MellowCAD",
      "inLanguage": "en"
    },
    {
      "@type": "WebApplication",
      "@id": "https://mellowcad.com/#app",
      "name": "MellowCAD",
      "url": "https://mellowcad.com/draw",
      "description": "2D drafting in the browser with AutoCAD commands, aliases and object snaps.",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Any",
      "browserRequirements": "Requires JavaScript and a modern desktop browser.",
      "isAccessibleForFree": true,
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
      "featureList": ["…derivado del registro…"],
      "screenshot": "<URL absoluta de la imagen OG>",
      "softwareVersion": "<versión de package.json>",
      "publisher": { "@id": "https://mellowcad.com/#organization" }
    },
    {
      "@type": "Organization",
      "@id": "https://mellowcad.com/#organization",
      "name": "MellowCAD",
      "url": "https://mellowcad.com/",
      "logo": "https://mellowcad.com/icon.svg",
      "email": "<el email de contacto que ya publica el panel About>"
    }
  ]
}
```

- Se tipa con `schema-dts` (`WithContext<…>`), como sugiere la guía de JSON-LD de Next, y se genera desde
  `lib/site.ts` y el registro de comandos, no a mano.
- Sin `sameAs` mientras el repo sea privado; si algún día hay perfiles públicos, se añaden ahí.

- Google exige `aggregateRating` o `review` para el resultado enriquecido de _software app_: sin
  valoraciones reales no habrá estrellas. **No se inventan nunca**; el marcado sigue siendo útil para que
  entienda la entidad.
- `FAQPage` es opcional: desde 2023 Google solo muestra ese resultado enriquecido en webs gubernamentales y
  de salud. La semántica HTML de la FAQ es suficiente.
- En la fase 3: `TechArticle` y `BreadcrumbList` en las páginas de comando.
- Validar con el Rich Results Test y con el validador de schema.org.

### 7.3 Arquitectura de la información y palabras clave

| Clúster          | Consultas de ejemplo (EN)                                              | Intención                   | URL                           | Fase  |
| ---------------- | ---------------------------------------------------------------------- | --------------------------- | ----------------------------- | ----- |
| Marca            | mellowcad                                                              | Navegacional                | `/`                           | 1     |
| Categoría        | online cad, 2d cad online, cad in browser, free online cad software    | Comercial                   | `/`                           | 1     |
| Alternativa      | free autocad alternative, autocad online free, autocad web alternative | Investigación comercial     | `/` → `/alternatives/autocad` | 1 → 4 |
| Comandos         | autocad commands list, autocad shortcuts, autocad aliases              | Informacional (aprendizaje) | `/commands`, `/shortcuts`     | 3     |
| Por comando      | autocad offset command, how to trim in autocad, autocad fillet radius  | Informacional               | `/commands/offset`…           | 3     |
| Ayudas al dibujo | autocad osnap, polar tracking autocad, otrack                          | Informacional               | `/commands/osnap`…            | 3     |
| Práctica         | practice autocad online, learn autocad free                            | Informacional y comercial   | `/` y una futura `/practice`  | 4+    |

**No perseguir mientras no exista la función:** dwg viewer online, open dwg online, dxf editor online, cad
to pdf, 3d cad online, floor plan maker. Posicionar ahí trae visitas que rebotan y le enseñan a Google que la
página no satisface esa búsqueda.

Los volúmenes y la dificultad se validan con Keyword Planner y con los datos reales de Search Console tras el
lanzamiento, no a ojo.

### 7.4 Contenido que posiciona

1. **Hub `/commands` y 15 páginas de comando** (fase 3). Es la mayor demanda informacional de exactamente
   nuestra audiencia, y aquí tenemos una ventaja que no tiene nadie más: como la fidelidad es la
   especificación, cada página explica el comando _tal como funciona en AutoCAD_ y además permite
   practicarlo ahí mismo. Estructura: H1 "OFFSET command (O)" · qué hace · secuencia de prompts
   (reproducida por el motor) · tabla de opciones soportadas y pendientes (de `docs/autocad-coverage.md`)
   · consejos y trampas (por ejemplo, "OFFSET works on one object at a time") · ejemplo animado del motor ·
   "Try OFFSET in your browser" · comandos relacionados. De 400 a 900 palabras únicas por página. Se
   priorizan por demanda y completitud: OFFSET, TRIM, EXTEND, FILLET, CHAMFER, MIRROR, ARRAY (rect, polar,
   path), HATCH, DIMLINEAR, BLOCK/INSERT, EXPLODE, JOIN, STRETCH, SCALE, ROTATE, más OSNAP, OTRACK y POLAR
   como guías. Pocas y excelentes: la política de Google contra el contenido a escala castiga las
   plantillas vacías.
2. **`/shortcuts`:** una chuleta de alias generada a partir del registro e imprimible (`@media print`, A4 y
   Letter). Es un activo evergreen que atrae enlaces.
3. **`/changelog`:** entradas fechadas por versión (frescura, confianza y visitas recurrentes).
4. **Comparativas** (fase 4): `/alternatives/autocad`, con una tabla honesta y fechada.
5. **Oportunidad de producto** (fase 4+): **ejercicios de práctica**, es decir, dibujos acotados para
   reproducir en el navegador. "autocad practice drawings" es una búsqueda enorme entre estudiantes y
   encaja con el segmento de mejor encaje. Requiere trabajo de producto: se anota, no se hace ahora.

### 7.5 Búsqueda generativa (IA)

- **Rastreadores:** `robots.ts` permite todo, sin reglas por bot. Eso incluye los de búsqueda y peticiones
  de usuario (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot), que generan citas
  y visitas, y también los de entrenamiento (GPTBot, ClaudeBot, Google-Extended, CCBot,
  Applebot-Extended): a un producto gratuito le conviene que los modelos lo conozcan, y en el texto de
  marketing no hay nada que proteger.
- **Claridad de la entidad:** el mismo nombre ("MellowCAD") y la misma definición de una frase en el
  título, el hero, el JSON-LD y la primera respuesta de la FAQ.
- **Contenido con forma de respuesta:** respuestas directas en la FAQ, tablas con hechos explícitos y un
  estado fechado, para que un asistente pueda responder "¿MellowCAD abre DWG?" sin inventar.
- **Bing importa:** varios asistentes se apoyan en su índice, así que hay que dar de alta Bing Webmaster
  Tools e IndexNow.
- **`llms.txt`:** según la guía de Google de 2026, Google lo ignora, aunque algunos agentes sí lo leen.
  Cuesta 15 minutos: opcional en la fase 3 y con prioridad baja.

### 7.6 Enlaces y lanzamiento

Secuencia, tras la fase 1 y con la app estable:

1. **Lanzamiento suave:** Search Console y Bing, y 5 usuarios de AutoCAD probando la landing y el editor en
   una sesión moderada (¿entienden qué es? ¿cuánto tardan en dibujar la primera línea?).
2. **Show HN** con el ángulo técnico (motor hexagonal, la fidelidad como especificación). El CDN aguanta el
   pico sin problema.
3. **Reddit:** r/AutoCAD, r/cad, r/engineeringstudents y r/architecture, respetando sus normas de
   autopromoción y pidiendo feedback.
4. **Product Hunt** cuando esté pulida, con una galería de renders del motor y un vídeo de 30–45 s.
5. **Directorios:** AlternativeTo (como alternativa a AutoCAD, LibreCAD y QCAD) y SaaSHub.
6. **Outreach** a los autores de los listados "free AutoCAD alternatives / online CAD" que rankean hoy.
7. **Artículo técnico** (en dev.to, Hashnode o un blog propio) que enlace a la home. El repo es privado, así
   que el lanzamiento no depende de GitHub; si algún día se publica, necesitará un README de verdad (el
   actual es el de la plantilla de shadcn).

### 7.7 Internacionalización (futuro)

- **El español, primero:** hay un mercado enorme de estudiantes (España y Latinoamérica) y SERP menos
  disputadas. **Localizar, no traducir:** las consultas en español ("comandos de autocad", "autocad online
  gratis", "programa cad gratis online") se investigan por separado.
- `alternates.languages` con `x-default` → `/`, y las alternativas también en el sitemap.
- **Sin redirección automática por `Accept-Language`**, que Google desaconseja (sus rastreadores no envían
  ese idioma). Como mucho, un aviso que se pueda descartar.
- **Aviso de producto:** AutoCAD en español tiene nombres de comando localizados (LINEA, DESFASE,
  RECORTA…), mientras que MellowCAD usa los internacionales. El texto en español debe decirlo claramente;
  aceptar los nombres localizados sería una función del editor, no de la landing.

## 8. Rendimiento

| Presupuesto                         | Valor                                                                                                                       |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| LCP (campo p75, móvil)              | ≤ 1,8 s. El elemento LCP es el H1 o el SVG inline, nunca una imagen descargada                                              |
| INP                                 | ≤ 100 ms                                                                                                                    |
| CLS                                 | ≤ 0,02, con espacio reservado para las islas y fuentes con métricas de fallback ajustadas (`next/font` lo hace por defecto) |
| TBT (laboratorio)                   | ≤ 50 ms                                                                                                                     |
| JS propio en `/`                    | ≤ 15 KB gz por encima del runtime del framework; del motor, solo helpers mínimos y verificados                              |
| CSS                                 | ≤ 25 KB gz                                                                                                                  |
| Fuentes                             | 2 ficheros, ≤ 110 KB                                                                                                        |
| SVG del hero                        | ≤ 30 KB gz y unas 600 primitivas como máximo                                                                                |
| Transferencia total de la 1.ª carga | ≤ 250 KB gz                                                                                                                 |

Tácticas:

- Prerender y CDN; Server Components; el SVG crítico inline; animaciones solo con CSS; ningún tercero salvo
  Vercel.
- `content-visibility: auto` con `contain-intrinsic-size` en las secciones bajo el pliegue.
- **Barrel `@/cad`:** comprobar con `next experimental-analyze` que las islas que importan de `@/cad` no
  arrastran el motor. Si lo hacen, probar a declarar `"sideEffects": ["**/*.css"]` en `package.json`
  (seguro aquí, porque el motor es puro por diseño) y volver a medir.
- **Apertura instantánea del editor** (fase 2): Speculation Rules con `prefetch` de `/draw` y `eagerness:
"moderate"`, que se dispara al pasar el ratón por el CTA. `prerender` solo después de probarlo, porque
  ejecutaría el editor y la analítica en segundo plano.

## 9. Accesibilidad (WCAG 2.2 AA)

- Los contrastes de §4.2 están verificados; nada por debajo de `--text-subtle`.
- Anillo de foco de 2 px en `--accent` con 2 px de separación, _skip link_, landmarks, un solo H1 y
  `lang="en"`.
- Los SVG del motor llevan `role="img"`, `<title>` y `<desc>` descriptivos. La transcripción animada lleva
  `aria-hidden` y tiene una versión estática en un `<details>` "Show command transcript".
- Movimiento: `prefers-reduced-motion`, y pausa y repetición en el hero (2.2.2).
- Objetivos táctiles de al menos 24 × 24 px (2.5.8).
- Los selectores deshabilitados usan `aria-disabled` (siguen siendo enfocables y anuncian "coming soon"),
  nunca un `disabled` mudo.
- Fase 2: el canvas vivo solo captura teclas cuando tiene el foco, `Esc` cancela comandos y hay una salida
  visible (sin trampa de teclado, 2.1.2).
- Verificación: axe sin violaciones, un recorrido solo con teclado y una prueba rápida con lector de
  pantalla.

## 10. Conversión y medición

**Embudo:** visita `/` → clic en el CTA → `/draw` cargado → primera entidad (activación) → vuelve en 7 días.

**Palancas**

- Una única acción principal ("Start drawing") en la cabecera, el hero, tras el catálogo y el cierre; lo
  secundario nunca compite visualmente con ella.
- Quitafricciones junto al CTA: gratis, sin registro, sin instalar, autosave.
- "Continue drawing", con el número de objetos, para quien vuelve.
- En móvil, "Send to my computer".
- La prueba es el producto: el hero se dibuja solo y, en la fase 2, se puede usar ahí mismo.
- La sección de estado filtra a quien necesita DWG antes de que se frustre. Opcionalmente, se le puede
  ofrecer "Get one email when DXF export ships" (requiere un servicio de correo externo) para no perderlo
  del todo.
- Coordinación con el editor: quien llega desde la landing a un dibujo vacío debería ver una pista del
  primer paso ("Type a command: LINE, CIRCLE…"), y el panel About del editor puede enlazar al roadmap y a la
  FAQ de la landing.

**Medición**

- Se mantiene el plan actual de Vercel y la analítica ya instalada (sin cookies, sin banner). La
  conversión se mide con páginas vistas: las de `/draw` divididas entre las de `/`.
- No se llama a `track()` mientras el plan no incluya eventos personalizados (requieren Pro). La lista
  queda definida para ese día: `cta_click {position}`, `try_command {name}`, `send_to_desktop`,
  `demo_start` y `demo_handoff` (fase 2), y en el editor `first_entity` y `file_saved`.
- Al principio no habrá tráfico suficiente para tests A/B fiables: 5 sesiones moderadas con usuarios de
  AutoCAD rinden más que un experimento estadísticamente vacío.

## 11. Plan de ejecución

Tallas: S (≤ 1 día), M (2–3 días), L (4 días o más).

### Fase 0 — Cimientos · S–M

1. Mover el editor a `app/(app)/draw` con su root layout (el contenido del `app/layout.tsx` actual) y
   `noindex`. Comprobar que el autosave sigue ahí.
2. Root layout de marketing: fuentes, `marketing.css` acotado, tokens, `dark` fijo, `metadataBase`,
   Analytics y Speed Insights.
3. `lib/site.ts`; next-intl sin enrutado (`i18n/request.ts`, plugin en `next.config.ts`,
   `messages/en.json` con sus tipos). Comprobar al instalarlo que la versión declara compatibilidad con
   Next 16.3.
4. `global-not-found.tsx` y su flag.
5. Reglas: crear `marketing.instructions.md`, acotar el `applyTo` de `ui.instructions.md` al editor y
   añadir una línea en `AGENTS.md` (§14).
6. Commit de la fase junto con este brief (hoy está sin versionar).

**Salida:** `/draw` es idéntico al `/` actual, `/` muestra un placeholder, y `typecheck` + `lint` + `test`
están en verde.

### Fase 1 — Landing estática · L

1. Motor: `buildDrawingPreview`, `SvgScenePresenter`, conducción por guiones, lista pública de comandos y
   resumen del autosave, todo con tests.
2. Contenido gráfico: el guion del hero, las viñetas dibujadas en MellowCAD y un test que reproduce todos
   los guiones.
3. Sistema visual: tokens, escala tipográfica, rejilla, marco de hoja, separadores de cota y marcadores en
   hover.
4. Las secciones de §5, con los textos de `messages/en.json` y los datos derivados de `@/cad`.
5. Islas: `ContinueDrawing`, `HeroControls`, `CommandTry` (diferida) y `SendToDesktop`.
6. Selectores de tema e idioma inertes en el cajetín.
7. SEO técnico (§7.1 y §7.2), la página `/privacy` (qué se guarda en el navegador, qué mide la analítica y
   contacto) y el 404.
8. Pasadas de accesibilidad (§9) y de rendimiento (§8, con el analizador y Lighthouse).
9. Search Console y Bing: verificación, sitemap e inspección.

**Definición de hecho:** gates en verde · Lighthouse móvil ≥ 95 en las cuatro categorías · presupuestos de
§8 cumplidos · axe sin violaciones · JSON-LD válido · vista previa OG correcta en X, LinkedIn, Slack y
WhatsApp · `robots.txt` y `sitemap.xml` accesibles · `/draw` funcionando y con `noindex` · todos los números
de la página derivados del código · reglas actualizadas.

### Fase 2 — Viva e instantánea · M–L

1. Opciones de `CadEngine` (§3.6), con tests; el editor no cambia.
2. `LiveCanvas` en el hero, bajo demanda ("Try it here", solo en escritorio): store en memoria (nunca pisa
   el autosave del usuario), teclado y rueda solo con foco, y una salida visible.
3. "Open in the full editor": si no hay autosave, se guarda el boceto y se abre `/draw`; si lo hay, se
   pregunta (reemplazar, descargar el boceto o cancelar).
4. View transition del hero al editor.
5. Speculation Rules para `/draw`.
6. `/changelog`.

### Fase 3 — Motor de contenido · M, continuo

1. `/commands` y las 15 primeras páginas, con OG propia.
2. `/shortcuts` imprimible.
3. Enlazado interno desde el catálogo de la home.
4. `llms.txt` (opcional).

### Fase 4 — Alcance

1. Tema claro, junto con el del editor: valores claros de los tokens y selector activado.
2. Español: selector activado, `hreflang` e investigación de palabras clave en español.
3. Comparativas.
4. Campaña de lanzamiento (§7.6).
5. Evaluar los ejercicios de práctica.

**Por qué este orden:** hoy la raíz no tiene contenido indexable, así que cada semana sin la fase 1 es
indexación perdida. La demo viva es el mayor efecto "wow", pero exige tocar el motor, así que llega sobre
una base estática sólida. El contenido compone tráfico con el tiempo. El tema y la i18n llegan cuando la
base está estable, como ya tenías previsto.

## 12. Riesgos y mitigaciones

| Riesgo                                                                    | Mitigación                                                                                                                                                                                                 |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Usuarios recurrentes que esperan el editor en `/`                         | `localStorage` es por origen y los dibujos siguen ahí; "Continue drawing"; `start_url` del manifest en `/draw`                                                                                             |
| El barrel arrastra el motor a la landing                                  | Render en servidor, analizador y `sideEffects`                                                                                                                                                             |
| El canvas incrustado secuestra el teclado, el scroll o el menú contextual | Opciones de `CadEngine`, activación explícita y sin canvas vivo en móvil                                                                                                                                   |
| La demo pisa el dibujo guardado del usuario                               | Store en memoria y traspaso con confirmación                                                                                                                                                               |
| Prometer de más                                                           | La política de §2.5, la sección de estado y los números derivados                                                                                                                                          |
| Marca registrada                                                          | Uso nominativo, descargo y nada de la imagen de marca de Autodesk                                                                                                                                          |
| Penalización por contenido a escala                                       | 15 páginas excelentes antes que 50 mediocres                                                                                                                                                               |
| Expectativas en español (comandos localizados)                            | Texto explícito; la decisión de producto va aparte                                                                                                                                                         |
| SVG demasiado pesado (el sombreado genera muchos segmentos)               | Presupuesto de primitivas, redondeo y sombreados solo en zonas pequeñas                                                                                                                                    |
| Deriva entre la landing y el producto                                     | Datos derivados, tests de los guiones y un test de cobertura del catálogo: cada entrada de `TOOL_COMMANDS` debe tener su ficha, de modo que un comando nuevo rompe el test hasta que la landing lo refleje |
| El nombre heredado se ve (`.ecad.json`, clave `easycad:`)                 | La clave está congelada a propósito y el editor no cambia. La landing nunca menciona la extensión: habla del "formato propio y versionado"                                                                 |

## 13. Decisiones tomadas

| #   | Decisión                 | Resolución                                                                                                        | Por qué                                                                                        |
| --- | ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| D1  | Ruta del editor          | `/draw`                                                                                                           | Corta, es un verbo y coincide con el CTA; la raíz queda para el contenido indexable            |
| D2  | ¿Se dice "Free"?         | Sí                                                                                                                | Es cierto hoy; el JSON-LD lleva `price: 0`                                                     |
| D3  | GitHub y "open source"   | Ni enlace ni afirmación                                                                                           | El repo es privado (verificado: responde 404) y no tiene licencia                              |
| D4  | Analítica de eventos     | Plan actual y conversión por páginas vistas; eventos cuando el plan los incluya                                   | No se asume un gasto; la analítica actual ya no usa cookies                                    |
| D5  | Rastreadores de IA       | Todos permitidos, sin reglas por bot                                                                              | Es el `robots.txt` estándar y maximiza la visibilidad de un producto gratuito                  |
| D6  | Autoría                  | `Organization` "MellowCAD" en el JSON-LD; sin nombre personal; contacto con el email ya público                   | Patrón estándar de sitio de producto; no se publican datos personales nuevos                   |
| D7  | Tema del dibujo del hero | Pieza mecánica en el hero y viñeta arquitectónica en el catálogo                                                  | Luce lo que ya está implementado y habla a los dos perfiles de estudiante                      |
| D8  | i18n                     | next-intl desde la v1 sin enrutado; `[locale]` + `proxy.ts` con `localePrefix: "as-needed"` al activar el español | Estándar de facto en el App Router: activar idiomas será configuración, no una refactorización |

## 14. Reglas a promover al terminar

- **Nuevo `.github/instructions/marketing.instructions.md`** (`applyTo: "app/(marketing)/**,components/marketing/**,content/**,messages/**,i18n/**"`):
  páginas estáticas, sin APIs de petición; islas mínimas y justificadas; el motor nunca en el bundle
  inicial; los hechos del producto se derivan de `@/cad`; los guiones se verifican con tests; ilustraciones
  solo del motor, vía `SvgScenePresenter`; glifos CAD exactos; solo tokens (ningún hex suelto en los
  componentes); reglas de movimiento y de accesibilidad; presupuestos de rendimiento; política de
  afirmaciones; descargo de marca. Mismas convenciones de ficheros que `components/cad/` (kebab-case, un
  componente principal por fichero).
- **`ui.instructions.md`:** su `applyTo` (`components/**,app/**`) cubriría la landing con reglas propias
  del editor ("AboutPanel is the only non-CAD chrome"…). Hay que acotarlo a `components/cad/**` y
  `app/(app)/**`.
- **`AGENTS.md`:** una línea que diga que el editor vive en `/draw`, el marketing en `app/(marketing)` y que
  sus reglas están en `marketing.instructions.md`.
- **`cad-engine.instructions.md`:** registrar `SvgScenePresenter` como segundo presentador, de modo que
  cualquier primitiva nueva necesita una rama en los dos.

## Referencias

- Documentación de Next 16.3 incluida en el repo (`node_modules/next/dist/docs/01-app/`):
  `01-getting-started/14-metadata-and-og-images.md`, `02-guides/json-ld.md`,
  `02-guides/internationalization.md`, `02-guides/view-transitions.md`, `02-guides/public-static-pages.md`,
  `02-guides/package-bundling.md`, `03-api-reference/03-file-conventions/route-groups.md`,
  `03-api-reference/03-file-conventions/not-found.md`,
  `03-api-reference/03-file-conventions/01-metadata/{robots,sitemap,manifest,opengraph-image}.md` y
  `03-api-reference/05-config/01-next-config-js/inlineCss.md`.
- next-intl: [configuración del enrutado por idioma](https://next-intl.dev/docs/routing/setup) y
  [proxy/middleware](https://next-intl.dev/docs/routing/middleware)
- [Google: datos estructurados de Software App](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Vercel: eventos personalizados](https://vercel.com/docs/analytics/custom-events) y
  [precios de Web Analytics](https://vercel.com/docs/analytics/limits-and-pricing)
- [Anthropic: rastreadores de Claude](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [MDN: scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) y
  [View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
- [`llms.txt` y la guía de Google de 2026](https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained)
- SERP de referencia para "online CAD / AutoCAD alternative":
  [ZWSOFT](https://www.zwsoft.com/blog/2d-cad-online), [Snaptrude](https://www.snaptrude.com/alternatives/free-autocad),
  [BranchCAD](https://branchcad.com/blog/best-free-online-cad-software) y [Rayon](https://www.rayon.design/alternative-to/autocad)

## 15. Notas de implementación

Decisiones tomadas al ejecutar, en los huecos que el brief dejaba abiertos.

**Fase 0**

- La hoja de estilos del editor se movió con él a `app/(app)/globals.css` (y se actualizaron
  `.prettierrc` y `components.json`). Excluye con `@source not` las carpetas de la landing, igual que
  `marketing.css` solo escanea las suyas.
- `ui.instructions.md` se acotó a `components/cad/**`, `components/ui/**`,
  `components/theme-provider.tsx`, `app/(app)/**` y `hooks/**`: los tres últimos también son solo del
  editor.
- next-intl 4.14.7 (declara `next: ^16`). Mensajes importados de forma estática, tipos en
  `i18n/global.d.ts` y `timeZone: "UTC"` fijo para que una fecha se formatee igual en build.
- `/draw` no declara canónica: con `noindex` no aporta nada y mezcla señales.
- El 404 se prerenderiza una sola vez, así que la ruta pedida solo se conoce en el navegador: una isla
  mínima (`UnknownCommand`) la convierte en el nombre del comando; sin JS se lee `PAGE`.
- Para la fase 4: next-intl 4.14 marca `requestLocale` como obsoleto en favor de `next/root-params`.
  Al activar el español hay que seguir ese patrón en lugar del de `setRequestLocale` de §3.5.
