# Lanzamiento de MellowCAD — brief

> **Estado:** pendiente; la landing está terminada en código. Sigue la convención de `docs/next-*.md`:
> se borra cuando el lanzamiento haya ocurrido. Las reglas de la landing están en
> `.github/instructions/marketing.instructions.md`; el brief que la diseñó (`docs/next-landing.md`)
> está en el historial de git.

## 1. Requiere las cuentas y la URL pública

1. Dar de alta Search Console y Bing Webmaster Tools. Los tokens se leen de `GOOGLE_SITE_VERIFICATION`
   y `BING_SITE_VERIFICATION`.
2. Enviar el sitemap e inspeccionar `/` y sus idiomas (`/es`, `/ar`).
3. Pasar el Rich Results Test sobre el JSON-LD.
4. Comprobar la vista previa OG en X, LinkedIn, Slack y WhatsApp, en cada idioma.

## 2. Secuencia de lanzamiento

1. **Lanzamiento suave:** con el punto 1 hecho, 5 usuarios de AutoCAD prueban la landing y el editor en
   una sesión moderada (¿entienden qué es? ¿cuánto tardan en dibujar la primera línea?).
2. **Show HN** con el ángulo técnico: motor hexagonal y la fidelidad como especificación. La página
   está prerenderizada y la sirve el CDN, así que aguanta el pico.
3. **Reddit:** r/AutoCAD, r/cad, r/engineeringstudents y r/architecture, respetando sus normas de
   autopromoción y pidiendo feedback.
4. **Product Hunt** cuando esté pulida, con una galería de figuras dibujadas por el motor y un vídeo de
   30–45 s.
5. **Directorios:** AlternativeTo (como alternativa a AutoCAD, LibreCAD y QCAD) y SaaSHub.
6. **Outreach** a los autores de los listados "free AutoCAD alternatives / online CAD" que hoy
   posicionan.
7. **Artículo técnico** (dev.to, Hashnode o un blog propio) que enlace a la home. El repo es privado y
   el lanzamiento no depende de GitHub; si algún día se publica, necesita un README de verdad (el
   actual es el de la plantilla de shadcn).

Todo lo que se publique sigue la política de afirmaciones de `marketing.instructions.md`.

## 3. Medición

- Con el plan actual de Vercel, la conversión es por páginas vistas: las de `/draw` entre las de `/`.
- Cuando el plan incluya eventos personalizados (Pro), se instrumentan: `cta_click {position}`,
  `try_command {name}` y `send_to_desktop` en la landing, y `first_entity` y `file_saved` en el
  editor. Al principio no habrá tráfico para tests A/B: rinden más las sesiones moderadas.

## 4. Después

- Evaluar los ejercicios de práctica. Si llegan, irán dentro del editor y no como páginas.
- Una página nueva solo se reabre si Search Console muestra demanda para ella.
