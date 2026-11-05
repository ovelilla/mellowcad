# Visibilidad y tráfico orgánico — plan maestro

> **Estado:** auditoría, plan y sesión 01 hechos (5/11/2026), y por decisión del dueño la
> visibilidad va antes que cualquier funcionalidad; siguiente: la sesión 02, posicionamiento y
> metadatos (§5), y el push de 01 con sus acciones de §7. Esperan detrás
> `docs/next-solids.md`, `docs/next-integrations.md` y la revisión 32 del roadmap. Se borra cuando §6
> se cumpla a seis meses y cada línea esté hecha o descartada.

## 1. Objetivo

Que mellowcad.com tenga visibilidad y tráfico orgánico: aparecer en las búsquedas de quien quiere
dibujar en CAD en el navegador, practicar AutoCAD o consultar un comando, y alcanzar y superar a
KulmanLab, el competidor más parecido, en Google y Bing.

**Prioridad (decisión del dueño, 5/11/2026):** no tiene sentido seguir añadiendo comandos si nadie
encuentra el producto. Las funcionalidades en curso esperan detrás de este trabajo. Nada de lo
existente es sagrado (la landing, su concepto, las reglas del sitio); lo fijo son las invariantes
del motor, la fidelidad a AutoCAD de `AGENTS.md` y la honestidad de lo que se afirma
(`.claude/rules/i18n.md`, «Claims and copy»).

## 2. Diagnóstico

### 2.1 Los datos (5/11/2026)

Extraídos con Playwright de la sesión del dueño, en solo lectura; los ficheros están en
`~/seo-data/raw-2026-11-05/` y los informes de la auditoría en `~/seo-data/audit-2026-11-05/`
(fuera del repo).

| Qué | Google (Search Console) | Bing (Webmaster Tools) |
| --- | --- | --- |
| Rendimiento, desde el principio | 8 clics, 82 impresiones, CTR 9,8 %, posición media 41,3 (30/9–3/11) | 0 clics, 14 impresiones (4/10–3/11) |
| Páginas con clics | `/ar` 5 (posición 5,9: Egipto, Yemen, Arabia Saudí), `/es` 2, `/` 1 | — (`/es` 10 impresiones, posición 6,3) |
| Consultas visibles | «cad gratis online» 10 imp., pos. 57,6; «2d cad online» 10, pos. 75,7; «autocad online gratis» 1, pos. 96 | «editor cad 2d online gratis» pos. 3; «cad en línea gratis» pos. 6; «cad en linea sin descargar» pos. 5 |
| Indexación | 6 URLs indexadas en el informe del 23/10 (`/`, `/es`, `/ar` y sus `/privacy`); la inspección del 5/11 da también `/pt-br`, `/docs/commands` y `/es/docs/commands`, rastreadas por primera vez el 4/11, tras reenviar el sitemap el 3/11 (43 URLs) | 5 URLs indexadas; `/docs/commands` y `/pt-br`, «descubiertas pero no rastreadas» |
| `site:mellowcad.com` (5/11) | unos 37 resultados; la búsqueda de marca ya muestra `/ar/docs/engine/drawings`, una copia inglesa bajo `/ar` | unos 50 resultados |
| Enlaces externos | 0 | 0 |
| Core Web Vitals | sin datos de campo | — |
| Rastreo | 1.970 peticiones (30/9–3/11), 100 ms de respuesta media | IndexNow sin configurar |
| Copilot | — | 10 citas (22/10 y 3/11) |

Volumen (Bing, mundial, 5/8–2/11/2026; Google suele ser un orden de magnitud mayor):
«autocad online» 23,4K · «free cad software» 9,5K · «autocad gratis» 7,5K · «autocad free» 6,7K ·
«dwg viewer online» 6,5K · «online cad» 2,3K · «dxf viewer online» 1,6K · «autocad online
gratis» 1,5K · «autocad commands» 1,3K · «kulmanlab» 992 · «autocad shortcuts» 792 · «autocad en
ligne» 746 · «visor dwg online» 670 · «free online cad» 640 · «comandos de autocad» 601 ·
«autocad exercises» 363 · «autocad practice» 192 (`bing-keyword-research-summary.csv`). Las
consultas por comando («autocad offset command») no llegan al umbral de Bing.

### 2.2 Las causas y su peso

| # | Causa | Peso | Evidencia | Línea |
| --- | --- | --- | --- | --- |
| 1 | **Autoridad, antigüedad y descubrimiento** | 40 % | 0 enlaces externos; dominio del 27/8/2026, ni una captura en la Wayback Machine; sin lanzamiento. KulmanLab tiene cinco meses más, Product Hunt (7 + 1 votos), foros, DEV y Medium (unos 12–15 dominios, casi todos suyos). En Google entran herramientas jóvenes con webs de 4 páginas (GeneralCAD, n.º 2 en Reino Unido para «2d cad online»): lo que falta no es volumen sino señales de fuera. En Bing, los dominios de 2026 ocupan 5,7 de cada 10 puestos genéricos (CADCraft, de 24 días, es n.º 3). | L5, L1 |
| 2 | **Intención de búsqueda y posicionamiento** | 20 % | El title, el H1 y los H2 no contienen lo que se busca: el H1 es «Type L. Press Enter. Draw.», con la categoría en una línea gris de 12 px; el title inglés no dice «free». KulmanLab es n.º 1 en Google España para «cad online gratis», «cad gratis online», «cad 2d online gratis» y «programa cad gratis online» con títulos y H1 exactos. Todo dice «2D», y Estado ponía los sólidos 3D bajo «Todavía no» (corregido en `4c6094db`). | L2, L4 |
| 3 | **Superficie indexable** | 15 % | 43 URLs, 60 de las 92 HTML del sitio son documentación para desarrolladores en inglés (con sus copias); los 140 comandos están en una sola página por idioma, unas 21 palabras cada uno, y en español sin el nombre inglés. Las dos familias que ninguna herramienta ocupa son nuestras: la referencia de comandos (Autodesk n.º 1–2, el resto webs pequeñas) y «practicar AutoCAD online» (cursos, un blogspot, YouTube). Las 2.442 páginas de comando de KulmanLab no posicionan en ninguna de las 7 consultas probadas: cuenta la calidad, no el número. | L3, L6 |
| 4 | **Producto** | 15 % | Sin DXF/DWG ni PDF. Las familias «dwg/dxf viewer», «abrir dxf online», «editor dxf online» son de herramientas (7,5 visores por top 10 de Google) y todos los parecidos (KulmanLab, CADCraft, Open CAD Studio, BenCAD, DXFDraw) ponen DXF en su H1. | L7 |
| 5 | **La landing como captación** | 5 % | 11,7 pantallas de escritorio y 19,3 de móvil; el H1 es un acertijo para quien no usa AutoCAD; ninguna prueba en la primera pantalla; el hero muestra un dibujo, no el producto; las respuestas que deciden (DWG, impresión) al 78–88 % del scroll. | L4 |
| 6 | **Técnica** | 5 % | Limpia: 43/43 URLs con 200 y canónica propia, hreflang recíproco, Lighthouse móvil 97–100, LCP 1,1–1,2 s. Fallos: 45 copias de la documentación inglesa bajo `/es`, `/ar` y `/pt-br` (33 % de los enlaces internos, 37 MB), `/docs/engine/api` de 9,1 MB (Google lee 2 MB), títulos de la documentación genéricos o repetidos, sin datos estructurados en la documentación, la landing sin un enlace a `/docs/commands`, sin IndexNow. | L1 |

### 2.3 Lo que se busca y quién lo tiene

De los estudios de palabras clave (`keywords-en.md`, `keywords-es-pt.md`, `languages.md`) y de
los 209 top 10 recogidos (`competitors.md`); MellowCAD no está en ninguno:

| Familia | Demanda | Quién la tiene | Para MellowCAD |
| --- | --- | --- | --- |
| **Un comando** («offset in autocad», «comando desfase autocad», «escala autocad», «hachura autocad») | La mayor: en EE. UU. block 4,4, text 4,3, scale 2,7, hatch 1,8 frente a «autocad online» 2,2 (Trends, «autocad» = 100); 1.700 consultas distintas en español, 1.500 en portugués, 3.226 en inglés | Autodesk Help n.º 1 (a menudo una versión vieja), después plantillas finas, PDFs, vídeos | **Ganable**: nadie junta las solicitudes de AutoCAD, sus opciones, una figura y probarlo (L3) |
| **La lista de comandos y los atajos** («comandos de autocad», «autocad commands», «atajos de autocad») | Bing, 3 meses: 1,3K, 601, 792 (shortcuts) | La guía de atajos de Autodesk n.º 1–2, una lista bilingüe, PDFs | Ganable del 3.º al 5.º puesto (L3) |
| **CAD online gratis** («cad online gratis», «cad online grátis», «free online cad», «2d cad online») | Brasil «cad online» 3,9; España 2,0; EE. UU. «free cad» 16,4, «online cad» 9,2 | Herramientas: KulmanLab n.º 1 en ES, MX, BR y EE. UU. («2d cad online»); 2–3 herramientas por top 10 | Ganable por la home con el texto justo y enlaces (L2, L4, L5) |
| **Practicar AutoCAD** («ejercicios autocad», «autocad practice drawings», «practicar autocad online») | Pequeña pero constante; mayor en la India; Bing «autocad exercises» 363 | PDFs, un blogspot, cursos, YouTube; ninguna herramienta | **Ganable y única** (L6) |
| **DXF y DWG** («dwg viewer online», «abrir dxf online», «dwg a pdf») | Grande: Bing «dwg viewer online» 6,5K; Trends «dwg a pdf» 2,2 ES, 4,9 BR | Visores y herramientas, también nuevas | Cerrada hasta que exista el DXF (L7) |
| **AutoCAD online / gratis** | La mayor en volumen (Bing «autocad online» 23,4K) | Autodesk (5 de cada 10 puestos), portales de descarga, YouTube | No: intención de marca o descarga |
| **Alternativas a AutoCAD, CAD gratis** | Media | Listados, Reddit, AlternativeTo (n.º 1–2 en Bing) | Solo entrando en los listados (L5) |
| **CAD 3D online** | Media | Tinkercad, Onshape, SketchUp, FreeCAD; ningún dominio joven en Google | Decir el 3D con exactitud, sin perseguir la consulta todavía |

Los **slugs**, en inglés (`/es/docs/commands/offset`): México, el resto de América Latina y Brasil
buscan el nombre inglés del comando, y España busca la palabra de uso diario («recortar»), que no es
ni RECORTA ni TRIM; las palabras locales van en el title y el H1. **Estacionalidad**: las búsquedas
de aprendizaje caen en verano y en diciembre y suben de enero a marzo: L3 y L6, indexadas antes de
mediados de enero.

Lo que **no** es causa: el rastreo (Google y Bing reciben lo mismo que un navegador), la velocidad,
el hreflang o las canónicas.

## 3. Hecho en la sesión de auditoría

- **`4c6094db`**: Estado dice lo que hace el 3D y que es parcial, y «Todavía no» lo que le falta,
  en los cuatro idiomas y en el `featureList` del JSON-LD. Las reglas que frenaban el sitio,
  reescritas: `.claude/rules/marketing.md` ya no limita el sitio a la landing, el 404, `/privacy`
  y la documentación ni pide datos de Search Console para una página que aún no existe;
  `.claude/rules/i18n.md` afirma el 3D parcial en vez de prohibirlo y deja localizar los slugs con
  datos de búsqueda; el README, al día (3D, cuatro idiomas, los tres paquetes en npm).
- **`7eede991`**: el plan, los prompts de cada sesión (`docs/plans/seo/`) y las pausas en los
  briefs. El brief de lanzamiento anterior (next-launch.md, en el historial de git) queda integrado
  en L5 y borrado: sus restricciones («una página nueva solo si Search Console muestra demanda»,
  «los ejercicios irán dentro del editor y no como páginas») decaen.
- **El commit siguiente**: el kit de lanzamiento (`docs/plans/seo/launch-kit.md`).

## 4. Líneas de trabajo

Por impacto y dependencias; la línea N es la sesión N. Cada sesión se abre con su prompt
(`docs/plans/seo/`) con el razonamiento al máximo, y se cierra con la skill `finish-feature`, un
commit por bloque y sin push.

### L1. Técnica y rastreo

Objetivo: cada URL indexable única, ligera y bien descrita, y lo nuevo descubierto en días.
IndexNow; las copias de la documentación inglesa fuera del rastreo; `/docs/engine/api` por debajo
de 1 MB; títulos y descripciones únicos; `BreadcrumbList` y `sameAs`; la landing enlazando la
referencia de comandos; `llms.txt` con los cuatro idiomas y el 3D; los fallos menores.
**Terminado:** ninguna URL del sitemap duplicada ni por encima de 1 MB, todas con título único;
la clave de IndexNow servida y el envío preparado para el dueño; JSON-LD válido en la landing y la
documentación; Lighthouse sin regresión.

### L2. Posicionamiento 2D → 2D y 3D, y metadatos

Objetivo: que cada idioma vivo diga lo que se busca y lo que el producto es: CAD online gratis,
con los comandos de AutoCAD de tu idioma, 2D y 3D (parcial), sin instalar ni registrarse. Títulos,
descripciones, el eyebrow del H1, el lead, la imagen OG, el manifest, el JSON-LD, `llms.txt`, el
README, npm y GitHub, con las palabras de §2.3. **Terminado:** las 21 ubicaciones de
`technical.md` §6.2 reescritas o conservadas con su motivo; title ≤ 60 caracteres y description
≤ 155 por idioma, con la consulta principal al principio; las traducciones revisadas;
`CONTENT_UPDATED`.

**Las consultas de la home por idioma** (sesión 02, con los datos de §2; los textos escritos con
ellas, en «Search texts» de `docs/i18n/<tag>.md`):

| Home | Principal | Secundarias | Title |
| --- | --- | --- | --- |
| `/` | free online cad | online cad, cad online free, 2d cad online, AutoCAD commands, no sign-up | «Free online CAD, 2D & 3D, with AutoCAD commands — MellowCAD» (59) |
| `/es` | cad online gratis | cad gratis online, cad 2d online gratis, programa cad gratis online, cad online, sin registro, comandos de AutoCAD en español | «CAD online gratis: 2D, 3D y comandos de AutoCAD — MellowCAD» (59) |
| `/pt-br` | cad online grátis | cad online, cad online gratuito, cad 2d online grátis, programa cad gratuito, sem cadastro, comandos do AutoCAD em português | «CAD online grátis: 2D, 3D e comandos do AutoCAD — MellowCAD» (59) |
| `/ar` | رسم هندسي اون لاين | اوتوكاد اون لاين، بديل اوتوكاد مجاني، برنامج رسم هندسي مجاني، رسم ثنائي الابعاد اون لاين، أوامر الأوتوكاد واختصاراتها | «رسم هندسي أون لاين مجانًا بأوامر أوتوكاد — MellowCAD» (52) |

La home no persigue «autocad online gratis» ni «autocad web» (consultas de marca: Autodesk), «cad 3d
online» (Tinkercad, Onshape: el 3D se dice, no se persigue) ni DXF y DWG (L7). Las demás familias
son de otras páginas: la lista de comandos y cada comando (L3: «comandos de autocad», «autocad
commands», «comandos do autocad em português e inglês», «اوامر الاوتوكاد واختصاراتها»), la
práctica (L6: «practicar autocad online», «autocad practice», «exercícios autocad») y la
alternativa a AutoCAD (L6: «alternativa a autocad gratis», «alternativa ao autocad gratuito»).

### L3. La referencia de comandos: una página por comando

Objetivo: la familia más ganable de §2.3. Una página por comando y por idioma, generada del
catálogo del motor y de `docs/coverage/` (nombre localizado y global, alias, solicitudes, opciones,
lo que falta, una figura del motor, «pruébalo»), y el índice como «lista de comandos de AutoCAD»;
F1 lleva a la página. **Terminado:** todas en los cuatro idiomas, en el sitemap con hreflang, sin
páginas finas, indexadas antes de mediados de enero. Los comandos que se buscan y no existen
(XLINE, OVERKILL, MEASURE, DIVIDE, ALIGN, MLINE, XREF, PLOT) quedan anotados para el roadmap.

### L4. Rediseño de la landing

Objetivo: que quien llega de Google entienda en cinco segundos qué es, que es gratis y sin
instalar, que trabaja como AutoCAD en su idioma y que hace 2D y 3D, y empiece a dibujar. Concepto
recomendado: «CAD online gratis, al estilo AutoCAD» (`landing.md` §5), con figuras 3D dibujadas por
el motor y 6–8 pantallas. **Terminado:** la landing nueva en los cuatro idiomas, con su plan y sus
decisiones, dentro de los presupuestos de `.claude/rules/i18n.md`.

### L5. Lanzamiento y autoridad

Objetivo: los primeros 20–30 dominios que enlazan y el tráfico de lanzamiento, la causa de más
peso. El kit (`docs/plans/seo/launch-kit.md`) tiene los textos de Reddit, Product Hunt,
AlternativeTo y SaaSHub, el guion de Show HN (Hacker News pide que ese texto lo escriba a mano su
autor, sin LLM), el correo de outreach en inglés y en español, la galería y el vídeo, y el
calendario; la lista de los 73 artículos de seis idiomas con los contactos de sus autores, y la de
creadores, quedan fuera del repo, que es público (`~/seo-data/audit-2026-11-05/authority-*.csv`).
Lo medido: ninguno de los 73 nombra a MellowCAD, 53 nombran alguna herramienta del navegador (casi
todas modeladores 3D) y 36 enlazan sin `nofollow`: los enlaces que cuentan salen del outreach, no de
las plataformas de lanzamiento. Los directorios pueden ir ya; Show HN, Reddit y Product Hunt, cuando
L2 y L4 estén publicados; el outreach, en diciembre, antes de que los listados se reescriban para
2027. **Ninguna publicación la hace una sesión.**
**Terminado:** el kit al día con la landing nueva y las publicaciones hechas por el dueño, con su
fecha aquí.

### L6. Práctica y guías

Objetivo: «practicar AutoCAD online», «ejercicios de AutoCAD» y las guías por tarea («fazer planta
baixa», «dibujar planos online»), donde ninguna herramienta compite: ejercicios dibujados por el
motor que se abren en `/draw` con su dibujo, en los idiomas vivos. Más adelante, una página honesta
de «alternativa gratis a AutoCAD en el navegador», cuando haya enlaces. **Terminado:** al menos 12
ejercicios y 3 guías publicados e indexables.

### L7. Producto con impacto en la búsqueda: DXF, después PDF

Objetivo: abrir las familias de DXF (§2.3) con la fidelidad de siempre: OPEN de un .dxf, SAVEAS al
tipo DXF, DXFIN y DXFOUT como en AutoCAD 2027. La sesión investiga, escribe su brief
(`docs/next-<tema>.md`) y hace la primera entrega; después, las páginas «abrir DXF online» por
idioma. PDF y PLOT, más tarde (no hay presentaciones). Es la excepción a la pausa de
funcionalidades: es producto, pero por la búsqueda.

### L8. Idiomas nuevos

Con el criterio del dueño (demanda y AutoCAD 2027 en ese idioma), cada uno con la skill
`add-language`: **francés** (AutoCAD localizado; Francia y el Magreb, que `/ar` no alcanza) y
**italiano** (localizado; la mayor proporción de búsquedas de AutoCAD de los grandes mercados de la
UE; KulmanLab es n.º 1 allí para «cad online gratis»). Después, alemán, ruso (Yandex tiene el 72 %
de sus búsquedas), polaco, checo, húngaro, y japonés, coreano y chino (AutoCAD conserva allí los
nombres ingleses: tipo `global`). Fuera del criterio pero con más demanda que varios de esos:
persa (el mayor término de AutoCAD en una escritura no latina; antes, comprobar el acceso desde Irán
y las sanciones), vietnamita e indonesio, sin AutoCAD en su idioma (`languages.md` §B.6): decisión
del dueño si quiere ampliar el criterio. Cada idioma nuevo, después de L3 y L4, para nacer con
ellas.

### L9. Medición

§6, cada mes: la sesión 10 extrae los datos con el mismo método, los compara con los umbrales y
actualiza §2.1 y §8.

## 5. Orden y dependencias

| Sesión | Prompt | Depende de | En paralelo con |
| --- | --- | --- | --- |
| 01 Técnica y rastreo | `docs/plans/seo/01-tecnica.md` | — | 07 |
| 02 Posicionamiento y metadatos | `docs/plans/seo/02-posicionamiento.md` | 01 (`llms.txt`, JSON-LD) | 07 |
| 03 Una página por comando | `docs/plans/seo/03-comandos.md` | 01, 02 | 04, 07 |
| 04 Rediseño de la landing | `docs/plans/seo/04-landing.md` | 02 | 03, 07 |
| 05 Lanzamiento | `docs/plans/seo/05-lanzamiento.md` | 02, 03, 04 publicados | — |
| 06 Práctica y guías | `docs/plans/seo/06-practica.md` | 03 | 07 |
| 07 DXF | `docs/plans/seo/07-dxf.md` | — (motor) | 01–06 |
| 08 Francés | `docs/plans/seo/08-frances.md` | 03, 04 | 07 |
| 09 Italiano | `docs/plans/seo/09-italiano.md` | 08 | 07 |
| 10 Medición | `docs/plans/seo/10-medicion.md` | cada mes desde el push de 01–02 | — |

Dos sesiones en paralelo comparten el árbol: cada una añade solo lo suyo y respeta los ficheros
del otro (`AGENTS.md`). Tras 01 y 02, el dueño hace el push: lo antes que se rastree lo nuevo,
antes empieza a contar el tiempo.

## 6. Medición

Plazos realistas para un dominio de dos meses y medio sin enlaces: Google tarda semanas en indexar
y meses en confiar; Bing es más rápido.

| Cuándo | Qué mirar | Umbral de «funciona» |
| --- | --- | --- |
| Cada semana, el primer mes tras el push de 01–02 | Search Console → Páginas (indexadas), Sitemaps; Bing → Site Explorer, inspección de URLs | ≥ 35 URLs del sitemap indexadas en Google y ≥ 20 en Bing a las 4 semanas |
| A las 4–6 semanas | Rendimiento (28 días), por familia de consultas (filtro por regex: comando/command/atajo/shortcut; gratis/free/grátis; practicar/practice/ejercicios) | ≥ 500 impresiones / 28 días; consultas de comando apareciendo |
| A los 3 meses (con 03, 04 y el lanzamiento) | Rendimiento, Enlaces, Vercel Analytics (visitas de `/draw` entre visitas de la landing, por idioma; referentes) | ≥ 5.000 impresiones y ≥ 150 clics / 28 días; ≥ 10 dominios enlazando; top 20 en «cad online gratis» y «cad 2d online gratis» (es) |
| A los 6 meses | Lo mismo, y las posiciones frente a KulmanLab en el conjunto fijo de consultas de `competitors-serps.json` | ≥ 1.500 clics / 28 días; top 10 en «cad online gratis», «cad 2d online gratis», «lista de comandos de autocad» y «practicar autocad online»; por delante de KulmanLab en al menos la mitad del conjunto |

Si a las 6 semanas las páginas están indexadas pero sin impresiones, el problema es de intención
(L2, L3); si no se indexan, de autoridad y descubrimiento (L5, IndexNow).

## 7. Lo que hace el dueño a mano

Ninguna sesión publica, envía ni cambia nada fuera del repo: esto es del dueño.

1. **El push** de los commits de cada sesión (despliega en Vercel). Cuanto antes se publiquen 01 y
   02, antes empieza a contar el tiempo de Google.
2. **Search Console**, tras cada push con páginas nuevas o cambiadas: Inspección de URLs →
   «Solicitar indexación» de las URLs clave (`/`, `/es`, `/pt-br`, `/ar`, `/docs/commands` y sus
   versiones; tras la sesión 03, el índice y una decena de páginas de comando por idioma). El sitemap
   ya está enviado (3/11) y se relee solo. A las 1–2 semanas, Páginas: que crezcan las indexadas.
   Tras el push de 01: la prueba de resultados enriquecidos (search.google.com/test/rich-results,
   pide sesión) de `/` y de `/docs/engine/api`, que debe detectar las migas (`BreadcrumbList`); el
   validador de schema.org ya dio 0 errores y 0 advertencias en las dos. Las 45 copias de la
   documentación inglesa bajo `/es`, `/ar` y `/pt-br` redirigen ya (308): Páginas las irá mostrando
   como «Página con redirección», sin hacer nada.
3. **Bing Webmaster Tools**: tras el push de 01, comprobar que la clave responde
   (`https://mellowcad.com/1eb5d0fec5dc99d5695b010f04667a07.txt`) y enviar el sitemap a IndexNow:
   `npm run indexnow` lista lo que enviaría y `npm run indexnow -- --send` lo envía (se niega si la
   clave no está desplegada); repetirlo en cada push con páginas nuevas o cambiadas. Inspección de
   URLs → «Request indexing» de `/docs/commands` y `/pt-br`, hoy «descubiertas pero no rastreadas»;
   un Site Scan para que el informe de SEO tenga datos.
4. **GitHub y npm**: la descripción y los temas del repositorio, ya, con el comando `gh repo edit`
   de `docs/plans/seo/launch-kit.md` §0 (hoy 0 estrellas, sin temas, «2D engine»); la descripción
   de los paquetes sale con su próxima publicación.
5. **Directorios** con cuenta propia (AlternativeTo, SaaSHub, TheCADHub y los demás del kit, §6):
   ya, no esperan a la landing.
6. **Show HN, Reddit, Product Hunt**, con los textos y el calendario del kit, cuando 02–04 estén
   publicados.
7. **Outreach** a los autores de los artículos de la lista, con el correo del kit.

## 8. Estado

Una línea por sesión, que cada una actualiza al cerrar su parte.

- Auditoría: hecha el 5/11/2026 (`4c6094db`, `7eede991` y el kit de lanzamiento).
- 01 Técnica y rastreo: hecha el 5/11/2026 (`bd30cf81` a `506c3d5b`), sin push. Medido en builds
  de producción de antes y después: de 111 URLs rastreables (92 HTML, 45 copias, 7.064 enlaces
  internos, 58,3 MB de HTML) a 78 (47 HTML, 0 copias, 3.741 enlaces, 8,9 MB); las 43 indexables son
  las del sitemap, con título y descripción únicos y `lastmod`; `/docs/engine/api` de 9,1 MB a
  0,6 MB y ninguna página por encima de 1 MB; JSON-LD con 0 errores en el validador de schema.org;
  Lighthouse igual (100 en `/`, `/es` y `/docs/commands`) y `/docs/commands` de 777 a 320 KB en
  escritorio. Quedan del dueño (§7): el push, IndexNow y la prueba de resultados enriquecidos.
  `/pt-BR` sigue en 404 (una redirección pide rutas sensibles a mayúsculas, sin verificar en Vercel).
- 02 Posicionamiento y metadatos: pendiente.
- 03 Una página por comando: pendiente.
- 04 Rediseño de la landing: pendiente.
- 05 Lanzamiento: pendiente (los directorios pueden ir ya).
- 06 Práctica y guías: pendiente.
- 07 DXF: pendiente.
- 08 Francés: pendiente.
- 09 Italiano: pendiente.
- 10 Medición: la primera, un mes después del push de 01–02.
