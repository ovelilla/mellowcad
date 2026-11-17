# El uso de Vercel bajo los límites de Hobby — brief

> **Estado:** vigilancia diaria y push congelado por decisión del dueño (18/11/2026): la primera
> sesión de cada día lee el uso de Vercel como dice §2 y anota la lectura en §3, y ninguna sesión
> hace push (se sigue desarrollando y haciendo commit) hasta que §4 se cumpla. El proxy de
> Cloudflare (§5) está aprobado y pendiente de que el dueño inicie sesión en Cloudflare.

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

## 4. Cuándo se levanta el congelado

Hasta principios de diciembre salen de la ventana los días de finales de octubre, que sumaron unas
40K lecturas: para no llegar al millón, el consumo tiene que quedar **por debajo de ~20–25K
lecturas al día**. Se levanta cuando dos días completos seguidos queden por debajo y el total
de 30 días baje, o cuando el proxy de §5 esté funcionando y lo confirme la lectura del día
siguiente. Entonces un push al día como mucho (skill `finish-feature`), y el siguiente idioma
(el húngaro) solo con margen.

## 5. La caché de Cloudflare delante de Vercel

El DNS de mellowcad.com ya está en Cloudflare. El plan, aprobado por el dueño el 18/11:

- El registro del dominio, **con proxy**; SSL/TLS en **Full (strict)**.
- Una regla de caché para el sitio: se guarda en caché con **Edge TTL de 4 horas, ignorando la
  cabecera de origen** (Vercel manda `max-age=0, must-revalidate`); la del navegador, la de
  origen. Quedan fuera las peticiones del router de Next (cabecera `RSC` o parámetro `_rsc`:
  Cloudflare no respeta `Vary`, y una petición con `RSC` dejaría el payload del router en caché
  para la URL de la página), `/mcp`, `/api/` y `/_vercel/` (las mediciones de Vercel).
- **Smart Tiered Cache** activado: una sola petición a Vercel por URL y TTL, no una por centro de
  datos.
- Tras cada push, **Purge Everything** en Cloudflare, o las páginas cambiadas tardan hasta 4 h en
  verse.

El token de Cloudflare del entorno es de otra zona: hace falta que el dueño inicie sesión en
Cloudflare en ese Chrome.

## 6. A medio plazo

- Adelgazar el HTML de la documentación: de sus ~123 KB, ~68 KB son el payload del router que Next
  incrusta para hidratar.
- Servir el sitio estático fuera de Vercel (el brief del MCP, `docs/next-mcp.md` §7, ya prevé
  llevar allí la función).
