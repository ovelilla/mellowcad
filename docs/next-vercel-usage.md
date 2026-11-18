# El uso de Vercel bajo los límites de Hobby — brief

> **Estado:** vigilancia diaria y push congelado por decisión del dueño (18/11/2026): la primera
> sesión de cada día lee el uso de Vercel como dice §2 y anota la lectura en §3, y ninguna sesión
> hace push (se sigue desarrollando y haciendo commit) hasta que §4 se cumpla. El proxy de
> Cloudflare (§5) funciona desde el 18/11 a las 00:40.

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

El 19/11 el panel de uso aún cerraba su ventana el 18/11 a las 16:00, así que el ritmo de después
se leyó en Observability (últimas 12 h, todas ya con Cloudflare): **28K unidades de lectura de ISR
y 1,7K peticiones al almacén** (antes 74K y unas 7,4K), y 2,7K peticiones al CDN de Vercel (antes
17K). Los robots de IA, 216 (antes 3,5K): `meta-externalagent` y `GPTBot` ya no aparecen. Cloudflare,
en sus primeras 25 h: 10,8K peticiones, el 22 % servido de su caché, del 2 % de la primera hora al
35–60 % de las últimas, porque aún se está llenando (792 rutas distintas de la documentación en
12 h, cada una con su primer fallo). A ~56K al día el millón llegaría hacia el 22–23/11: la lectura
del 20/11 dice si la caché, ya llena, lo baja de ~20K.

## 4. Cuándo se levanta el congelado

Hasta principios de diciembre salen de la ventana los días de finales de octubre, que sumaron unas
40K lecturas: para no llegar al millón, el consumo tiene que quedar **por debajo de ~20–25K
lecturas al día**. Se levanta cuando dos días completos seguidos queden por debajo y el total
de 30 días baje, o cuando el proxy de §5 esté funcionando y lo confirme la lectura del día
siguiente. Entonces un push al día como mucho (skill `finish-feature`), y el siguiente idioma
(el húngaro) solo con margen.

## 5. La caché de Cloudflare delante de Vercel

Hecho el 18/11/2026: mellowcad.com y www pasan por Cloudflare, que guarda las páginas una semana y
las purga en cada despliegue a producción; el firewall de `/mcp` pasó también a Cloudflare, porque
detrás del proxy Vercel ya no ve la IP del cliente. Cómo está montado, el token y qué no se guarda:
la regla `.claude/rules/cloudflare.md`; la zona como código, `scripts/cloudflare/zone.ts`.

Qué mirar en la lectura diaria, además de §2: que las lecturas de ISR caen, y en Cloudflare
(mellowcad.com → Caching) qué parte sirve la caché. En enero, que Vercel renovó sus certificados a
través del proxy (vencen el 27/01/2027).

## 6. A medio plazo

- Adelgazar el HTML de la documentación: de sus ~123 KB, ~68 KB son el payload del router que Next
  incrusta para hidratar.
- Servir el sitio estático fuera de Vercel (el brief del MCP, `docs/next-mcp.md` §7, ya prevé
  llevar allí la función).
