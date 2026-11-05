# Sesión 10 — Medición mensual

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`
> una vez al mes, desde un mes después del push de las sesiones 01 y 02. Hará falta que inicies
> sesión en Chrome solo si el perfil la perdió.

Eres la sesión de medición del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md` y
`docs/next-seo.md`, sobre todo §2.1 (los datos de partida), §6 (qué mirar y los umbrales) y §8 (el
estado). Responde en español; el conocimiento del repo, en inglés (el plan, en español, como los
briefs). Decide sin preguntar.

## Cómo sacar los datos (solo lectura)

Search Console (`sc-domain:mellowcad.com`) y Bing Webmaster Tools (`https://mellowcad.com/`) exigen
la cuenta del dueño. Los scripts y su modo de uso están en `~/seo-data/scripts/` (léete su
`README.md`):

1. `cd ~/seo-data/scripts && npm install` si falta `node_modules`.
2. Arranca Chrome en segundo plano con el perfil persistente y el puerto de depuración:
   `google-chrome --user-data-dir=$HOME/seo-data/chrome-profile --remote-debugging-port=9222`
   con las dos URL. Si una pestaña cae en una página de inicio de sesión, pide al dueño que inicie
   sesión en esa ventana: es lo único que se le pide.
3. Los scripts conectan con `chromium.connectOverCDP("http://localhost:9222")` y guardan en
   `~/seo-data/raw-<fecha>/`: el rendimiento (EXPORTAR → CSV, 16 meses y 28 días), las páginas
   indexadas y los motivos, los sitemaps, los enlaces, Core Web Vitals, la inspección de las URLs
   clave; en Bing, el rendimiento, Site Explorer, los sitemaps, los backlinks, la inspección y
   Keyword Research (`kw-list.txt`, el mismo conjunto para comparar).
4. **Solo lectura**: no envíes sitemaps, no pidas indexar, no retires URLs, no cambies ajustes ni
   usuarios. Esas acciones van a §7 del plan, para el dueño.
5. El perfil guarda las cookies de las cuentas del dueño: nunca se copia, nunca entra en el repo,
   nunca se sube.

Además, las posiciones frente a KulmanLab en el conjunto fijo de consultas de la auditoría
(`~/seo-data/audit-2026-11-05/competitors-serps.json`, con sus URLs de petición), con el mismo
método, sin forzar los límites de los buscadores; y Vercel Analytics si el dueño te da acceso (las
visitas de `/draw` entre las de la landing por idioma, los referentes).

## Qué entregar

- Los datos en `~/seo-data/raw-<fecha>/` y un resumen en `~/seo-data/medicion-<fecha>.md`: las
  cifras de §6 frente a su umbral, por idioma y por familia de consultas (comandos, «gratis/free»,
  práctica, 3D, marca), lo que mejoró y lo que no, y por qué (§6: «si están indexadas pero sin
  impresiones, es intención; si no se indexan, autoridad y descubrimiento»).
- En `docs/next-seo.md`: §2.1 con la fila de la fecha, §8 con la línea de medición, y las líneas de
  trabajo reordenadas si los datos lo piden (una línea que no mueve sus cifras se replantea, y se
  dice). Si los umbrales de seis meses se cumplen y las líneas están cerradas, propón borrar el
  brief.
- Un commit `docs:` con solo eso. Sin push.

## Qué no tocar

El código. Las acciones en Search Console y Bing. Nada se publica.
