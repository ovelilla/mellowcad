# mellowcad.com como ficheros estáticos en Vercel Hobby — brief

> **Estado:** sonda hecha el 20–21/11/2026, sin acordar y sin publicar nada: servir el sitio con
> `output: "export"` desde el mismo proyecto de Vercel, con Cloudflare delante, es viable con
> condiciones (§2). Falta el sí del dueño para ejecutarlo (§5) y para el despliegue de prueba que
> lo confirma (§6); el push sigue congelado (`docs/next-vercel-usage.md` §4). Se borra cuando el
> export esté en producción o se descarte.

## 1. Qué se propone y por qué

La cuenta pasó el millón de lecturas de ISR de Hobby (`docs/next-vercel-usage.md` §3) y el
alojamiento tiene que costar 0 $/mes. En Vercel, toda página prerrenderizada del App Router vive
en el almacén de ISR aunque nunca se revalide; un fichero estático solo cuenta peticiones de CDN y
Fast Data Transfer. Con `output: "export"` todo el sitio son ficheros estáticos: las lecturas de
ISR y el Fast Origin Transfer de las páginas quedan en cero sin quitar ninguna.

Para el visitante no cambia nada: mismas direcciones, mismos idiomas, misma navegación sin
recargas. Cambian dos cosas por dentro: la búsqueda de la documentación pasa al navegador (§4.6) y
el MCP pasa a ser una función de Vercel fuera de Next (§4.5).

## 2. Veredicto: viable con condiciones

1. **Un despliegue de prueba que lo confirme** (§6): lo probado es local, con `vercel build` y un
   emulador del enrutado.
2. **La búsqueda deja de ser una función**: índice estático por idioma (§4.6).
3. **Se apoya en algo que Vercel hace y no documenta**: su builder aplica los rewrites, redirects
   y headers del `next.config.ts` aunque Next avise de que en export no se aplican (§4.3). Si lo
   quitaran, las mismas reglas caben en `vercel.json` (13 reglas, lejos de las 2.048).

Lo que **no** arregla: el millón de CDN Requests al mes de Hobby sigue ahí. Sin Cloudflare el
sitio iba a unas 34.000 al día (ese ritmo); con él, a unas 5.400. Cloudflare se queda.

## 3. Lo que ya está comprobado en la documentación (20/11/2026)

Vercel (vercel.com/docs):

- Hobby incluye al mes 100 GB de Fast Data Transfer, 10 GB de Fast Origin Transfer, 1.000.000 de
  CDN Requests (antes «Edge Requests»), 1.000.000 de invocaciones y 4 h de CPU activa. La tabla de
  Hobby ya no publica cupo de ISR. Al pasar un límite, el equipo entero queda en pausa
  (`503 DEPLOYMENT_PAUSED`), en general 30 días (/docs/plans/hobby, /docs/limits).
- Un fichero estático solo cuenta CDN Request y Fast Data Transfer: «Static assets and functions
  all incur CDN Requests»; Fast Origin Transfer es «data sent between the CDN and Vercel
  Functions» (/docs/manage-cdn-usage).
- No hay tope de ficheros de salida (avisa de builds lentos desde 100.000) ni límite documentado
  por fichero estático o total. Build: 45 minutos, 2 CPU y 8 GB en Hobby. 100 despliegues al día.
  2.048 rutas por despliegue; cada rewrite, redirect o header de `vercel.json` cuenta una.
- `vercel.json`: `routes` ya se puede combinar con `rewrites`, `redirects`, `headers`,
  `cleanUrls` y `trailingSlash`; lo que figura como deprecado ahí es `handle`
  (/docs/project-configuration/vercel-json#routes). El `404.html` propio solo existe en la raíz; un
  404 por prefijo no está documentado. La fase `error` solo la define la Build Output API
  (/docs/build-output-api/configuration#routes).
- Los ficheros estáticos se cachean en el CDN de Vercel durante la vida del despliegue; cabecera
  por defecto `public, max-age=0, must-revalidate`; cada despliegue tiene su caché. Skew
  Protection no existe en Hobby.
- Funciones en Hobby: 300 s, 2 GB, bundle de 250 MB; 12 funciones por despliegue sin framework.

Cloudflare Workers Static Assets (developers.cloudflare.com), la salida si Hobby se queda corto:

- Gratis: 20.000 ficheros por versión y 25 MiB por fichero; de pago, 100.000. Las peticiones a
  ficheros son gratis e ilimitadas y no cuentan contra las 100.000 al día de Workers.
- `not_found_handling: "404-page"` sirve el `404.html` más cercano subiendo por el árbol, con
  estado 404: justo el 404 por idioma. `_redirects`: 2.000 estáticas y 100 dinámicas, sin regex.
- El plan gratis da 10 ms de CPU por petición: el MCP (unos 25 ms, y `node:vm`) no cabe ahí.
  Con un script presente, toda petición sin fichero que no sea una navegación lo invoca.

Next 16.4.6: el export no admite rewrites, redirects, headers, proxy ni route handlers que lean la
petición; los GET `force-static` sí (su guía `static-exports.md`, en `node_modules`).

## 4. La evidencia de la sonda

Hecha sobre `96c1449e`, con 12 idiomas; el coreano (`1ded1e8c`) añade otro idioma de unos 920
ficheros y 58 MB a las cifras de §4.2.

### 4.1 Compila

`next build` con export prerrenderiza las 3.291 rutas en 64–71 s (16 núcleos, pico de 1,8–2,5 GB).
Pasan sin tocar: `next/root-params`, `experimental.globalNotFound` (emite `404.html`), la macro
de Fumadocs, next-intl precompilado, `dynamicParams = false` y las rutas con punto
(`manifest.webmanifest`). Lo que hubo que cambiar:

- Las dos funciones salen de `app/`: la del MCP y la de la búsqueda.
- `app/robots.ts` y `app/sitemap.ts` necesitan `export const dynamic = "force-static"`.
- **Un route handler sin extensión choca consigo mismo**: el export escribe su cuerpo en la ruta
  tal cual, y `docs-md/commands` es a la vez fichero y carpeta (`EISDIR`); igual `og` y
  `og/draw`. Con extensión en el último segmento no chocan, y el alojamiento saca de ella el
  tipo de contenido.
- **Las cabeceras de un route handler se pierden** (es un fichero): el `Link` canónico de los
  `.md` y el `X-Robots-Tag: noindex` de la lista de comandos y de los dibujos pasan a
  `headers()` del config, que el builder de Vercel sí emite.
- **`next dev` se rompe con el export activo**: una ruta reescrita (`/` sobre `/en`) responde 500,
  «missing param in generateStaticParams(), required with output: export». Con el export solo en
  el build de producción, el servidor de desarrollo responde como hoy.
- Rewrites, redirects y headers en el config: Next avisa tres veces y compila.

### 4.2 Medidas de `out/` (12 idiomas)

| | Ficheros | Tamaño |
| --- | --- | --- |
| Total | 11.215 | 621 MB (unos 110 MB en gzip) |
| HTML de página | 1.577 | 243 MB |
| Payload del router (`<página>.txt`) | 1.575 | 120 MB |
| Segmentos (`<página>/__next.*.txt`) | 6.291 | 239 MB |
| Markdown | 1.515 | 10 MB |
| `_next/static` | 52 | 3,8 MB |

- Una página de documentación son 6 ficheros (HTML, payload y 4 de segmentos) más su `.md`: la de
  LINE, 120 KB de HTML (19,8 en gzip) y 60 KB de payload (10,7). El payload y su
  `__next._full.txt` son idénticos byte a byte.
- Por idioma: 920 ficheros y 57–64 MB; el inglés, 1.025 y 65 MB («Build» solo existe en inglés).
- El mayor: `sitemap.xml`, 2,1 MB; después un chunk de 1,94 MB y el HTML del ejercicio de la
  polea, 1,2 MB.
- Contra Cloudflare gratis: el 56 % de los 20.000 ficheros (caben unos 9 idiomas más) y el 8 % de
  los 25 MiB. Los 6.291 de segmentos solo los pide el prefetch, que el sitio tiene quitado:
  borrarlos tras el build dejaría 4.924, si algún día hiciera falta.

### 4.3 El enrutado: no hace falta generar `vercel.json`

El builder de Vercel (`@vercel/next` 29.0.0, en la CLI 65.14.0) detecta el export («detected
`next export`») y sigue leyendo `.next/routes-manifest.json`: sirve cada `.html` sin extensión
(1.577 `overrides`, sin `cleanUrls`) y emite los headers, los redirects y las tres fases de
rewrites del config. Comprobado en su código y con `vercel build` en local, que no despliega: 37
rutas, la tabla de hoy.

| Regla de `i18n/rewrites.ts` | Qué pasa |
| --- | --- |
| Headers de seguridad | Igual |
| Los 7 redirects (`/en/…` con 308, «Build» en inglés, `/opengraph-image`, los iconos) | Iguales |
| `/` → `/en` y la regla genérica del inglés | Iguales |
| Los 2 de `.md` (`beforeFiles`) | Misma fuente; el destino gana `.md` |
| `/index.rsc` y `/index.segments/*` | Sustituidas (abajo) |
| El `fallback` al 404 de cada idioma | No pasa como rewrite (abajo) |

**Qué sustituye a las reglas de `/index.rsc`.** En export el router no usa cabeceras: al navegar
pide `<ruta>.txt` (`/index.txt` para la raíz) y al precargar `<ruta>/__next.<segmento>.txt`. La
regla genérica ya lleva `/draw.txt` bajo `/en`; la raíz necesita las suyas, porque `[locale]`
escribió `en.txt` y `en/__next.…`, y esa regla deja en paz un primer segmento con `_`:

```ts
{ source: "/index.txt", destination: `/${defaultLocale}.txt` },
{
  source: "/:file(__next\\.[^/]+\\.txt)",
  destination: `/${defaultLocale}/:file`,
},
```

**El 404 de cada idioma.** Hoy el estado 404 lo pone el prerender de `[locale]/404`. Un rewrite
sobre un fichero estático respondería 200 (deducido, sin probar en un despliegue). Lo sustituyen
tres entradas `routes` en `vercel.json`, que la CLI acepta con el preset de Next y coloca delante
de la suya (`.* → /404`); el `fallback` del config queda vacío en producción:

```json
"routes": [
  { "src": "^/(?:(?:en|es|…)/)?404/?$", "status": 404, "continue": true },
  { "handle": "error" },
  { "src": "^/(es|ar|pt-br|…)(?:/.*)?$", "status": 404, "dest": "/$1/404" },
  { "src": "^/.*$", "status": 404, "dest": "/en/404" }
]
```

La lista de segmentos sale de `routing`: `vercel.json` se genera o se fija con un test
(`test/vercel.test.ts`), nunca a mano. Pega conocida: la documentación de `vercel.json` marca
`handle` como deprecado, aunque es lo que emite el propio builder.

### 4.4 La navegación

`.vercel/output` servido con un emulador que interpreta su `config.json` (una aproximación a las
fases de Vercel escrita para la sonda, no su router) y recorrido con Chrome por Playwright:

- `/` → `/docs` → `/docs/commands` → `/docs/commands/line` → `/privacy`, y lo mismo bajo `/es`:
  todo navegación de cliente, una petición `GET <ruta>.txt?_rsc=…` con 200 por salto, ninguna
  recarga. Volver a `/` pide `/index.txt` (200); «atrás» no pide nada.
- Los únicos 404 son los scripts de `/_vercel/insights`, que solo existen en Vercel.
- `/draw` es una carga completa, como hoy: es otro root layout.
- `/es/nope` da 404 en español, `/xx/yy` en inglés y `/ar/nope` en árabe, con `noindex`.
- `/es/draw?drawing=gasket` carga su dibujo (200).
- Los `__next.*.txt` no se piden nunca (prefetch quitado): su regla solo está comprobada con curl.

### 4.5 `/mcp` fuera de Next

Una función de Vercel en `api/`, junto al export, con el preset de Next:

- Vercel busca las funciones en `api/` antes de que corra el build, así que en git va un stub que
  reexporta `GET`, `POST` y `DELETE` de un fichero que el build genera con rolldown desde el
  handler de hoy, sacado tal cual a `lib/mcp/` (no tiene nada de Next salvo `maxDuration`, que
  pasa a `functions` en `vercel.json`). El fichero generado empieza por `_` para que Vercel no
  haga de él otra función, y se ignora en git. Un rewrite lleva `/mcp` a `/api/mcp`.
- `vercel build` produce la función `mcp.func` (nodejs26.x, `maxDuration` 5) con el bundle dentro: 2,31 MB
  (629 KB en gzip). Llamado fuera de Next responde `tools/list` y `tools/call` con 200, unos 20 ms
  en caliente y 125 MB de memoria.
- No va a Workers gratis (`node:vm`, 10 ms de CPU). El riesgo de Hobby no cambia: agotar el cupo
  de funciones pausa también el sitio (`docs/next-mcp.md` §7).

```js
// api/mcp.js
export { DELETE, GET, POST } from "./_handler.mjs"
```

```ts
// el build: como scripts/mcp/build.ts, con los dos alias
const build = await rolldown({
  input: "<la entrada que reexporta el handler>",
  platform: "node",
  resolve: { alias: { "@mellowcad/engine": "<raíz>/cad/index.ts", "@": "<raíz>" } },
})
await build.write({ file: "api/_handler.mjs", format: "esm", codeSplitting: false, minify: true })
```

### 4.6 La búsqueda: índice estático por idioma

| Índice de un idioma | Crudo | gzip | Brotli |
| --- | --- | --- | --- |
| Completo (el texto de las páginas, como hoy) | 5,3–7,5 MB | 1,02–1,30 MB | 570–691 KB |
| Ligero (títulos, descripciones, encabezados) | 1,4–1,9 MB | 265–318 KB | 142–166 KB |

**Recomendado: el completo**, descargado al abrir el diálogo de búsqueda. Da los resultados de
hoy, no añade ningún contador que pueda pausar el sitio y solo lo paga quien busca; el mayor (el
ruso, 7,5 MB) queda lejos de cualquier límite. El ligero cuesta la cuarta parte y deja de buscar
en el texto: es la salida si el peso molesta. Una función aparte no ahorra nada: fuera de Next no
puede importar `docsSource`, así que cargaría ese mismo índice, con invocaciones a cambio.

El índice de un idioma es un route handler `force-static` dentro de `[locale]` que exporta
`initAdvancedSearch({ indexes })` con las páginas de `docsSource.getPages(locale)` y los mismos
campos que la función de hoy (hoy una sola base guarda todos los idiomas y filtra por `locale`:
exportada entera serían unos 75 MB). **Sin medir**: lo que añade al navegador el cliente estático
de Fumadocs; se mide contra los presupuestos de `.claude/rules/i18n.md` antes de darlo por bueno.

## 5. El plan, en orden

Un worktree nuevo desde `main` (la sonda quedó en `96c1449e`, sin commit: §7). Cada paso es un
commit con su gate; los pasos 1 y 2 valen también con el servidor de hoy, así que pueden quedar
hechos aunque el 4 se retrase.

1. **Extensiones y cabeceras.** Las tarjetas pasan a `og.png` y `og/draw.png`, la lista de
   comandos a `command-list.json`, los dibujos a `<nombre>.json` y los `.md` llevan la extensión
   en el último segmento del handler (el destino de sus rewrites la gana). Redirects 308 desde
   las direcciones viejas de las tarjetas, que las redes sociales tienen guardadas. Las cabeceras
   de §4.1 a `headers()`. `force-static` en robots y sitemap. Sus tests (`lib/og.test.ts`,
   `i18n/rewrites.test.ts`, `i18n/navigation.test.ts`).
2. **La búsqueda estática** (§4.6): la ruta del índice, `components/docs/docs-search.tsx` con el
   cliente estático de la versión instalada de Fumadocs (leer su API antes), medir, y borrar la
   función. Comprobar en un navegador que busca en inglés, español, árabe y japonés.
3. **El MCP a `api/`** (§4.5): el handler a `lib/mcp/`, el stub, el script del build (el `build`
   de `package.json` lo corre antes de `next build`), el rewrite, `functions` en `vercel.json`,
   y `test/mcp-route.test.ts` apuntando al handler.
4. **El cambio**: `output: process.env.NODE_ENV === "production" ? "export" : undefined` con su
   `WHY`; las reglas de §4.3 en `i18n/rewrites.ts`; el `fallback` vacío en producción y las
   `routes` de `vercel.json` generadas desde `routing`; `i18n/rewrites.test.ts`,
   `i18n/next-config.test.ts` y `test/vercel.test.ts`. `vercel build` en local debe dar la misma
   tabla que §4.3 (un test sobre su `config.json` detectaría que Vercel deja de leer el manifiesto).
5. **Lo que se mueve con ello** (§7): reglas, skills, la zona de Cloudflare y los briefs.
6. **El despliegue de prueba y sus comprobaciones** (§6), con el sí del dueño. Después, el push,
   también con su sí. La vuelta atrás es revertir el commit del paso 4: los demás valen igual.

## 6. Sin verificar: las pruebas de un despliegue de prueba

Un preview (no producción) de la rama, y contra su URL:

1. **Lecturas de ISR en cero**: pedir unas 50 páginas distintas y mirar Observability → ISR.
2. **Los 404**: `curl -sI` a `/es/nope`, `/xx` y `/es/404` → 404, y el cuerpo en su idioma.
3. **Los payloads**: `/index.txt`, `/__next._tree.txt` y `/docs/commands/line.txt` → 200
   `text/plain`; en un navegador, navegar de `/` a `/docs` sin recarga.
4. **El Markdown**: `/docs/engine.md` → 200 `text/markdown` con su `Link` canónico; el
   `X-Robots-Tag` en `/command-list.json`.
5. **`/mcp`**: un `tools/list` por POST; y que el build de Vercel genere el bundle antes de
   empaquetar la función (en local corre en ese orden).
6. **El build**: su duración con las 2 CPU de Hobby (tope, 45 minutos) y la subida de los 621 MB.
7. **Cloudflare**, ya en producción: que guarda `<ruta>.txt?_rsc=…` con la regla cambiada, y que
   la purga por despliegue sigue esperando al commit nuevo.

## 7. Qué más se mueve

```
Tests     i18n/rewrites.test.ts, i18n/next-config.test.ts, i18n/navigation.test.ts,
          lib/og.test.ts, test/mcp-route.test.ts, test/vercel.test.ts,
          test/cloudflare.test.ts, test/knowledge.test.ts (las rutas que citan las reglas)
Reglas    .claude/rules/i18n.md (URLs sin proxy, el 404, los presupuestos),
          docs.md (búsqueda, los .md), marketing.md (tarjetas, 404), mcp.md, cloudflare.md
Skills    browser-verify y language-review: `next start` no sirve un export; se sirve out/
Briefs    docs/next-vercel-usage.md (§4 y §6), docs/next-mcp.md (§7)
Zona      scripts/cloudflare/zone.ts: la regla de caché excluye hoy `_rsc=` y la cabecera
          RSC, que ahora van en los .txt, y /api/
Igual     .github/workflows/purge-cache.yml (el commit va en la página),
          scripts/vercel/ignore-build.sh
Código    lib/site.ts, package.json (build), .gitignore (el bundle del MCP)
```

La sonda sigue en su worktree, sin commit, con `out/` y `.vercel/output` del último build:

```
.claude/worktrees/static-export-probe          rama worktree-static-export-probe
  scripts/probe/serve-vercel-output.mjs        el emulador del enrutado (puerto 3010)
  scripts/probe/measure-out.mjs                las medidas de §4.2 y §4.6
  scripts/probe/build-mcp.ts, api/mcp.js       la función de §4.5
  app/[locale]/search-index*.json/             los dos índices, solo para medir
  .vercel/project.json                         identificadores inventados: borrarlo antes
                                               de cualquier despliegue desde ahí
```

Su diff (`git diff HEAD` allí) trae cada cambio de §4 ya escrito; si el worktree ya no existe,
este brief basta para rehacerlos.
