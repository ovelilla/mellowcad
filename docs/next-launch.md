# Lanzamiento de MellowCAD — brief

> **Estado:** pendiente; la landing está terminada en código. Sigue la convención de `docs/next-*.md`:
> se borra cuando el lanzamiento haya ocurrido. Las reglas de la landing están en
> `.claude/rules/marketing.md`; el brief que la diseñó (`docs/next-landing.md`) está en el historial
> de git.

## 1. Search Console y Bing

- Pendiente: revisar el informe **Páginas** de Search Console y, cuando haya tráfico, **Core Web
  Vitals** (el objetivo de LCP de campo es ≤ 1,8 s).
- El Rich Results Test no mostrará la ficha de software de Google: exige `aggregateRating` o `review`,
  y no se inventan valoraciones. Que no sea apta es lo esperado.

## 2. Secuencia de lanzamiento

1. **Lanzamiento suave:** 5 usuarios de AutoCAD prueban la landing y el editor en
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
7. **Artículo técnico** (dev.to, Hashnode o un blog propio) que enlace a la home. El repo es público
   (MIT) desde el 2026-10-30 y su README presenta el proyecto a quien lo visita; el lanzamiento no
   depende de GitHub.

Todo lo que se publique sigue la política de afirmaciones de `.claude/rules/i18n.md` («Claims»).

## 3. Medición

- Con el plan actual de Vercel, la conversión es por páginas vistas: las de `/draw` entre las de `/`.
- Cuando el plan incluya eventos personalizados (Pro), se instrumentan: `cta_click {position}`,
  `try_command {name}` y `send_to_desktop` en la landing, y `first_entity` y `file_saved` en el
  editor. Al principio no habrá tráfico para tests A/B: rinden más las sesiones moderadas.

## 4. Después

- Evaluar los ejercicios de práctica. Si llegan, irán dentro del editor y no como páginas.
- Una página nueva solo se reabre si Search Console muestra demanda para ella.
