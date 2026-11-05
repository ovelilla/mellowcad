# Sesión 07 — DXF: investigación, brief y primera entrega

> Para el dueño: pega todo este fichero en una sesión nueva de Claude Code en `~/projects/mellowcad`,
> con el razonamiento al máximo. Es una línea larga: esta sesión la investiga, escribe su brief y
> hace la primera entrega; las siguientes siguen el brief.

Eres la sesión 07 del plan de visibilidad de MellowCAD. Lee primero `AGENTS.md`,
`docs/next-seo.md` (el plan maestro), `.claude/rules/cad-engine.md` (el modelo y las capas, la
serialización) y la entrada de OPEN, SAVEAS y QSAVE en `docs/coverage/clipboard-and-files.md`.
Responde en español; el código, los comentarios y el conocimiento del repo, en inglés. Decide sin
preguntar. La fidelidad a AutoCAD 2027 es la especificación (`AGENTS.md`): investiga antes de
construir (skill `autocad-research`).

## Contexto

La auditoría de visibilidad del 5/11/2026 (`~/seo-data/audit-2026-11-05/competitors.md` y
`kulmanlab.md`) encontró que el DXF es el mayor hueco de producto con efecto en la búsqueda:

- Las familias «dwg/dxf viewer online», «abrir dxf online», «editor dxf online» son de
  herramientas (7,5 visores por top 10 de Google), y entran dominios de 2025–2026. En Bing, en tres
  meses: «dwg viewer online» 6,5K búsquedas, «dxf viewer online» 1,6K, «visor dwg online» 670.
- Todos los parecidos ponen el DXF en su H1: KulmanLab («CAD Online — Free Online CAD & DXF
  Editor», importa y exporta DXF AC1032, imprime a PDF), CADCraft, Open CAD Studio, BenCAD,
  DXFDraw. Quien busca «CAD online» a menudo tiene un DXF que abrir.
- MellowCAD guarda solo en su formato JSON propio (`cad/serialization/`); la landing lo dice en
  «Todavía no». El modelo ya está hecho a la manera del DXF (Z y normal por entidad como los guarda
  el DXF, OCS 210: `docs/coverage/roadmap.md`, filas 1–2).

## Objetivo

Que un usuario de AutoCAD abra aquí un DXF y guarde su dibujo como DXF, con los comandos, las
solicitudes y las opciones de AutoCAD 2027: OPEN de un .dxf, SAVEAS al tipo DXF (versiones y
precisión), DXFIN y DXFOUT, y lo que cada uno hace con lo que el modelo no tiene.

## Qué investigar

- En AutoCAD 2027 (consola y escritorio, skill `autocad-research`): OPEN y SAVEAS con un .dxf
  (el diálogo, FILEDIA = 0 y sus solicitudes), DXFIN y DXFOUT, las versiones de DXF que ofrece,
  la precisión decimal, el DXF binario, qué pasa con un DXF que trae lo que no sabemos dibujar,
  los mensajes; el formato DXF de 2018 (AC1032), sus secciones y la correspondencia entidad a
  entidad con el modelo (`cad/domain/`); los sólidos 3D, que en el DXF son ACIS (SAT), fuera por
  ahora (`docs/next-solids.md` §6).
- El navegador: abrir y guardar ficheros (lo que ya hacen OPEN y SAVEAS), el tamaño de un DXF real
  y el rendimiento al importarlo.
- Qué ofrece cada competidor con DXF y dónde falla (para decir con exactitud lo que haremos).

## Qué entregar

1. **El brief** en `docs/next-<tema>.md` (el nombre lo eliges tú: dxf), con la convención de los
   briefs (`> **Estado:** …`, en español, se borra al terminar): el objetivo, las decisiones
   (versión, entidades, ACIS fuera, lector tolerante como el de `cad/serialization/`), las fases,
   los riesgos; y su fila en `docs/coverage/roadmap.md`.
2. **La primera entrega**, terminada (skill `finish-feature`): la que más valor da con menos riesgo,
   probablemente exportar (SAVEAS al tipo DXF y DXFOUT de las entidades 2D) o importar las
   entidades 2D comunes; decídelo con la investigación. Con sus tests del harness y ficheros DXF de
   referencia escritos por AutoCAD 2027, su entrada en `docs/coverage/` y los textos del sitio que
   cambie (Estado «Todavía no», la FAQ «¿Puedo abrir o guardar DWG o DXF?») en los cuatro idiomas
   (`.claude/rules/i18n.md`: el DXF se afirma solo cuando exista, y exactamente).

## Qué no tocar

DWG (formato cerrado; fuera de esta línea), PDF y PLOT (sin presentaciones; otra línea). Las
páginas «abrir DXF online» por idioma van después de que la importación exista, en una sesión de
contenido. Nada de push ni de publicaciones.

## Terminado cuando

- El brief escrito y su fila en el roadmap; la primera entrega hecha, con el gate verde y un commit
  por bloque; la línea de la sesión 07 en `docs/next-seo.md` §8 actualizada con lo que queda.

## Cómo trabajar

Otras sesiones pueden estar trabajando en el árbol: añade solo tus ficheros. Puedes usar subagentes
para investigación independiente, con moderación (pocos a la vez y sin que lancen otros): el dueño
lo pidió por el coste.
