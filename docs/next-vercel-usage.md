# El uso de Vercel bajo los límites de Hobby — brief

> **Estado:** vigilancia diaria, con el congelado del push (18/11/2026) levantado por el dueño el
> 22/11/2026: la primera sesión de cada día lee el uso de Vercel como dice §2 y anota la lectura en
> §3, y el push es uno al día como mucho, con la palabra del dueño (§4). El proxy de Cloudflare
> (§5) funciona desde el 18/11 a las 00:40. El 20/11 las lecturas de ISR pasaron del millón (§3).
> Desde el 21/11 a las 09:40 el sitio es un export estático en producción, que deja las lecturas
> de ISR de las páginas en cero: la lectura del 22/11 a las 00:45 lo confirmó (cero en 12 h, §3),
> y el 22/11 a las 09:30 el dueño dio su palabra: la zona de Cloudflare aplicada, que reabre el
> sitio a los rastreadores (§5), y el push hasta `43bb8b9b`. El siguiente, el 24/11 a las 08:40,
> hasta `48ce4a75`.

## 1. El problema

El 17/11/2026 el panel de uso (Hobby, ventana móvil de 30 días) estaba en **698.764 de 1.000.000
lecturas de ISR** y **5,34 de 10 GB de Fast Origin Transfer**, las dos subiendo (de ~2K lecturas
al día en octubre a 50–125K al día del 12 al 17/11). En Hobby, pasar un límite deja esa función
parada 30 días: aquí, servir las páginas.

Cada petición que el CDN no tiene en caché se lee del almacén de ISR: una página de la
documentación pesa ~123 KB sin comprimir, unas 15 unidades de lectura y 123 KB de Fast Origin
Transfer. Lo que las disparaba:

- **El prefetch de `Link`**: 17 a 86 peticiones por página de la documentación vista, la mitad
  fallos de caché. Quitado el 17/11 (`e2f71846`), y ESLint lo impide.
- **Los rastreadores de entrenamiento**: `meta-externalagent` (~5.600 peticiones al día) y
  `GPTBot` (~720). Fuera por `robots.txt` el 18/11 (`a500d37e`); tardan hasta 24 h en releerlo.
- **Los despliegues**: cada uno vacía la caché del CDN (10 y 11 pushes el 12 y el 13/11).
- **Cada idioma nuevo**: cambia las ~1.000 páginas de comandos (su fecha en el sitemap), y los
  buscadores las vuelven a leer todas.

## 2. La lectura diaria

Con el Chrome del perfil del dueño (`~/seo-data/scripts/README.md`), la página de uso del
proyecto en el panel de Vercel (equipo ovelillas-projects, proyecto mellowcad, Usage): el total de
**ISR Reads** y de **Fast Origin Transfer**, y la barra del último día completo de cada uno. Las
rutas que más leen, en Observability → ISR (últimas 12 h), y los robots, en Observability → AI
Traffic. La CLI no sirve: en Hobby sus métricas solo cubren 30 minutos.

## 3. Lecturas

| Fecha (hora de España) | ISR Reads (30 d) | Último día completo | Fast Origin Transfer (30 d) | Nota |
| --- | --- | --- | --- | --- |
| 17/11 23:20 | 698.764 | ~76K | 5,34 GB | antes de las medidas |
| 18/11 00:24 | 702.458 | ~125K | — | recién desplegadas las medidas |
| 19/11 00:40 | 779.111 | 18/11 aún incompleto | 5,97 GB | primer día con Cloudflare: abajo |
| 19/11 11:10 | 789.877 | 18/11: ~76K | 6,05 GB | ventana hasta las 03:00: +10,8K en 11 h |
| 20/11 10:40 | **1.005.030** | 19/11: ~50K | 7,9 GB | límite pasado; ventana hasta el 20/11 a las 02:00 |
| 21/11 09:00 | 1M (el proyecto, 864K) | — | **8,14 GB** (el proyecto, 6,63) | ventana hasta el 21/11 a las 00:00; el mismo día, el export estático a producción |
| 22/11 00:45 | el proyecto, 865K | — | el proyecto, 6,63 GB | ventana hasta el 21/11 a las 16:00; Observability, 12 h ya estáticas: **0 lecturas de ISR** |
| 23/11 00:30 | el proyecto, 864K | — | el proyecto, 6,62 GB | ventana hasta el 22/11 a las 16:00, tras el push de las 09:30; Observability, 12 h: **0 lecturas de ISR**; CDN Requests 210K en 30 días |
| 24/11 00:00 | el proyecto, 862K | — | el proyecto, 6,61 GB | ventana hasta el 23/11 a las 16:00, sin push desde el del 22/11; Observability, 12 h: **0 lecturas de ISR**; CDN Requests 213K en 30 días |
| 25/11 10:05 | el proyecto, 859K | — | el proyecto, 6,58 GB | ventana hasta el 25/11 a las 02:00, tras el push del 24/11 a las 08:40; Observability, 12 h: **0 lecturas de ISR**; CDN Requests 222K en 30 días |
| 26/11 08:40 | el proyecto, 857K | — | el proyecto, 6,57 GB | ventana hasta el 26/11 a las 00:00, sin push desde el del 24/11; Observability, 12 h: **0 lecturas de ISR**; CDN Requests 234K en 30 días |
| 27/11 08:35 | el proyecto, 856K | — | el proyecto, 6,56 GB | ventana hasta el 27/11 a las 00:00, tras el push del 26/11 a las 10:46; Observability, 12 h: **0 lecturas de ISR**; CDN Requests 247K en 30 días |

El 19/11 el panel de uso aún cerraba su ventana el 18/11 a las 16:00, así que el ritmo de después
se leyó en Observability (últimas 12 h, todas ya con Cloudflare): **28K unidades de lectura de ISR
y 1,7K peticiones al almacén** (antes 74K y unas 7,4K), y 2,7K peticiones al CDN de Vercel (antes
17K). Los robots de IA, 216 (antes 3,5K): `meta-externalagent` y `GPTBot` ya no aparecen. Cloudflare,
en sus primeras 25 h: 10,8K peticiones, el 22 % servido de su caché, del 2 % de la primera hora al
35–60 % de las últimas, porque aún se está llenando (792 rutas distintas de la documentación en
12 h, cada una con su primer fallo). A ~56K al día el millón llegaría hacia el 22–23/11: la lectura
del 20/11 dice si la caché, ya llena, lo baja de ~20K.

El 19/11 a las 11:10, Observability (últimas 12 h): **15K unidades de lectura**, la mitad que las
12 h anteriores (28K), y 1K peticiones al almacén, casi todas a rutas distintas (438 de 547 en la
documentación): primeros fallos de la cola larga, no repeticiones. Cloudflare sirve ya el 35 % de
lo que recibe (22 % el primer día). A ~30K al día el total aún sube, unos 25K al día netos con lo que
sale de la ventana: no se levanta el congelado. El húngaro (`cdd8d646`) esperó a que §4 se cumpliera: sus páginas y la fecha nueva de las de
comandos traerían otra oleada de rastreo (publicado el 21/11 con el export estático: abajo).

El 20/11 a las 09:18 Vercel avisó del **100 % de las lecturas de ISR** (1.005.030 de 1.000.000 a las
10:40), y el 19/11 a las 18:31 del 75 % de Fast Origin Transfer (7,9 de 10 GB el 20/11). Las barras
diarias bajan (17/11 ~140K, 18/11 ~80K, 19/11 ~50K lecturas; Fast Origin Transfer, ~1 GB, ~0,6 y
~0,4 GB), y Observability, en las últimas 12 h, 19K unidades de lectura y 1,2K peticiones al
almacén (751 a la documentación, 566 rutas distintas): unas 38K al día, aún por encima de §4. Los
días que salen de la ventana hasta el 30/10 suman 2–5K cada uno, así que el total no vuelve bajo
el millón antes de mediados de diciembre, haga lo que haga la caché; Fast Origin Transfer, a
~0,4 GB al día, llega a los 10 GB hacia el 25/11. A esa hora el sitio sigue sirviendo (Cloudflare y
Vercel dan HIT).

Cloudflare, en las mismas 12 h: 1.478 aciertos y 1.337 fallos (el 52 % de lo cacheable), y los
fallos son la cola larga de rastreadores que leen cada página una vez: SemrushBot 173, Applebot
155, Reflectionbot 109, Amazonbot 108, Googlebot ~130, FontScanBot 22, ExaSearchBot 19, YandexBot
19, Kaupr 13, KeenableBot 13, MJ12bot 12. `mellowcad.vercel.app` responde 200 sin pasar por
Cloudflare, pero no es la fuga: los fallos de Cloudflare cuadran con lo que ve Vercel. Ese día no
se mandó el lote de indexación de Google (§7 de `docs/next-seo.md`): cada URL pedida es otro
rastreo que falla la caché.

El 22/11 a las 00:45 el panel de uso aún cerraba su ventana el 21/11 a las 16:00, seis horas
después del export, y sus totales del proyecto eran los de la víspera (865K lecturas, 6,63 GB).
Observability, en las últimas 12 h (del 21/11 a las 12:45 en adelante, todas con el sitio
estático): ISR **sin datos, cero unidades de lectura y de escritura**, y 5,3K peticiones al CDN de
Vercel (unas 10,6K al día: la ingesta de Web Analytics 740, `/en/404` 331, servido de caché al 99 %,
la de Speed Insights 281, `/api/mcp` 51, y el resto ficheros de `_next/static` servidos de caché
al 77–87 %). La función de `/mcp` da un 65 % de «Timeout» en 4,4 s de CPU y 0 % de errores: sin
mirar; quizá sus GET de streaming, que esperan hasta vencer. §4 se cumple por su tercera condición.

Pro (20 $/mes, con 20 $ de crédito de uso al mes) no tiene límite de lecturas de ISR, sino precio:
0,40–0,64 $ por millón de unidades, y Fast Origin Transfer a 0,06–0,43 $ el GB; el uso de este mes
cabría en el crédito. Pasarse a Pro es decisión del dueño (gasto), pendiente el 20/11.

## 4. Cuándo se levanta el congelado

Hasta principios de diciembre salen de la ventana los días de finales de octubre, que sumaron unas
40K lecturas: para no llegar al millón, el consumo tiene que quedar **por debajo de ~20–25K
lecturas al día**. Se levanta cuando dos días completos seguidos queden por debajo y el total
de 30 días baje, o cuando el proxy de §5 esté funcionando y lo confirme la lectura del día
siguiente, o cuando el export estático (en producción desde el 21/11/2026 a las 09:40) deje las
lecturas de ISR en cero y lo confirme la lectura del día siguiente. Entonces un push al día como mucho (skill `finish-feature`), y cada idioma nuevo solo con margen.

El push del export estático (21/11 a las 09:20, de `a500d37e` a `0f86c6ad`) llevó, con él, todo lo
que esperaba en `main`: el húngaro, el japonés y el coreano (las 381 URL de `/hu`, `/ja` y `/ko`
están en el sitemap de producción), WIPEOUT, IMAGE, la tabla, MULTILEADER, XLINE y RAY, la
búsqueda de la documentación y la función del MCP. Desde entonces el congelado sigue: esperan
`2348a4df` y `217fe33e` (MINSERT y su página) y el chino, hasta que la lectura del 22/11 confirme
las lecturas de ISR en cero y el dueño dé su palabra. La lectura del 22/11 (00:45) las confirmó en
cero, y el dueño la dio ese día: el push de las 09:30, de `0f86c6ad` a `43bb8b9b`, llevó MINSERT y
su página, la reapertura a los rastreadores, el chino simplificado y los colores índice con las
sustituciones DSTYLE. El congelado queda levantado; las lecturas de los días siguientes dicen si
vuelve. El push del 24/11 a las 08:40, de `43bb8b9b` a `48ce4a75`, con la palabra del dueño y tras
la lectura del 24/11 (§3), llevó el chino tradicional, 3DMESH y la malla poligonal, los SCP con
nombre en el DXF y R12 con la caja del punto 2.6 de §5 de `docs/next-dxf.md`; el CI y el
despliegue, en verde, y la caché de Cloudflare purgada a las 08:55. El push del 26/11 a las 10:46,
de `48ce4a75` a `9f9b5236`, con la palabra del dueño y tras la lectura del 26/11 (§3), llevó las
fases 1 a 3 de `docs/next-autocad-ui.md` (el ribbon, la barra de título, las paletas y los
diálogos de estilos); el CI y el despliegue, en verde, y la caché de Cloudflare purgada a las
10:59. El push del 27/11 a las 11:04, de `9f9b5236` a `b65df121`, con la palabra del dueño y tras
la lectura del 27/11 (§3), llevó las fases 4 a 6 de `docs/next-autocad-ui.md` (la fila inferior,
la línea de comandos flotante, el ViewCube y los grips; los tooltips, el menú contextual del
ribbon y Customize; las pestañas contextuales, -HATCHEDIT con ellas) y la revisión de
dependencias del 27/11; el CI y el despliegue, en verde, la caché de Cloudflare purgada a las
11:19 e IndexNow con las 1.950 URL del sitemap (200).

## 5. La caché de Cloudflare delante de Vercel

Hecho el 18/11/2026: mellowcad.com y www pasan por Cloudflare, que guarda las páginas una semana y
las purga en cada despliegue a producción; el firewall de `/mcp` pasó también a Cloudflare, porque
detrás del proxy Vercel ya no ve la IP del cliente. Cómo está montado, el token y qué no se guarda:
la regla `.claude/rules/cloudflare.md`; la zona como código, `scripts/cloudflare/zone.ts`.

Desde el 20/11 a las 10:50, una regla del cortafuegos devuelve 403 a los rastreadores que no traen
visitas (herramientas de SEO, rastreadores de entrenamiento, scrapers: `UNWANTED_CRAWLERS` en
`scripts/cloudflare/zone.ts`), que eran cerca de un tercio de los fallos de caché (§3).

El 21/11, con el sitio ya estático, el dueño decidió reabrirlo: la regla queda en el código como
interruptor apagado (como los de `/mcp`), y `robots.txt` ya no excluye a GPTBot ni a
meta-externalagent. Un fallo de caché es ahora un fichero, una petición de las del millón al mes de
Hobby, nunca una lectura de ISR: aunque volvieran todos (unas 6–7 mil peticiones al día, el peor
caso sin un acierto), quedarían bajo las 400 mil al mes con las ~5.400 diarias de ahora; y que los
modelos conozcan MellowCAD es publicidad gratis. La zona se aplicó (`npm run cloudflare -- --apply`)
el 22/11 a las 09:30, tras la lectura que confirmó las lecturas de ISR en cero (AhrefsBot recibe
un 200 desde entonces), y `robots.txt` con el push de esa mañana. Si un rastreador se desmadra (Bytespider no lee `robots.txt`), se vuelve a encender.

Qué mirar en la lectura diaria, además de §2: que las lecturas de ISR caen, y en Cloudflare
(mellowcad.com → Caching) qué parte sirve la caché. En enero, que Vercel renovó sus certificados a
través del proxy (vencen el 27/01/2027).

## 6. A medio plazo

- Adelgazar el HTML de la documentación: de sus ~123 KB, ~68 KB son el payload del router que Next
  incrusta para hidratar.
- Servir el sitio como ficheros estáticos: en producción desde el 21/11/2026, en el mismo
  proyecto de Vercel (`.claude/rules/i18n.md`). Lo que no arregla es el millón de CDN Requests al
  mes de Hobby, que Cloudflare mantiene lejos (unas 5.400 al día con él, 34.000 sin él). Si Hobby
  se queda corto, la salida es Cloudflare Workers Static Assets: gratis hasta 20.000 ficheros por
  versión (el export tiene unos 12.200; 4.900 sin los segmentos de prefetch, que nadie pide) y
  25 MiB por fichero, peticiones a ficheros ilimitadas, y `not_found_handling: "404-page"` da el
  404 de cada idioma. El MCP no cabe en su plan gratis (10 ms de CPU, `node:vm`); ya es una
  función aparte (`api/mcp.js`), lista para irse a Workers de pago (`docs/next-mcp.md` §7).
