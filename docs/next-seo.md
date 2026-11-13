# Visibilidad y tráfico orgánico — plan maestro

> **Estado:** auditoría, plan y sesiones 01 y 02 hechos y publicados (5/11/2026), la 03 (la serie
> de comandos, completa) publicada el 6/11 y el 7/11, la 04 (la landing) publicada el 6/11, la 05
> (lanzamiento) preparada el 6/11, que publica el dueño según el calendario de L5, y la 06 (12
> ejercicios y 3 guías en los cuatro idiomas) y la 07 (DXF: su brief, `docs/next-dxf.md`, y abrir
> un DXF con OPEN y DXFIN) y la 05b (un sitio para reportar problemas, la condición del
> lanzamiento suave del 12/11) hechas y publicadas el 7/11, y la 07b (la página «abrir DXF
> online») hecha y publicada el 8/11, y la 08 (el francés, `live` en `/fr`) hecha y publicada el
> 9/11, y la 09 (el italiano, `live` en `/it`), guardar como DXF (la fase 2 de `docs/next-dxf.md`)
> y la 07c (la página «editar DXF online») hechas y publicadas el 12/11, como POINT, DIVIDE y
> MEASURE (la fase 4 de `docs/next-dxf.md`, con sus páginas de comando) y SOLID, y LEADER (con
> su página de comando) el 13/11; por decisión del dueño la visibilidad va antes que cualquier
> funcionalidad; siguiente, por orden del dueño (12/11/2026), una sesión cada vez, nunca en
> paralelo: el alemán (L8) y luego idiomas alternando con lo que quede del DXF, además de lo que
> queda de §7.
> Esperan detrás
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
quedan anotados para el roadmap (abajo).

**Entrada para el roadmap: comandos que se buscan y no existen** (sin página hasta que existan;
sugerencias de autocompletado con el nombre y «autocad», 5/11/2026, en inglés / español /
portugués, de `keywords-en-autocomplete.csv` y `keywords-es-pt-universe.csv`):

| Comando | en | es | pt | Nota |
| --- | --: | --: | --: | --- |
| LAYOUT (presentaciones) | 56 | 15 | 29 | con PLOT, la base de imprimir; hoy sin presentaciones |
| PLOT | 39 | 9 | 27 | «trazar», «plotar»; nada de PDF ni impresión hoy (`i18n.md`) |
| ALIGN | 34 | 16 | 9 | «alinear», «alinhar» |
| TABLE | 32 | 3 | 5 | |
| BOUNDARY | 31 | 2 | 1 | |
| GROUP | 28 | 4 | 4 | |
| XREF | 28 | 5 | 14 | con XCLIP (3 / 2 / 4) |
| XLINE | 26 | 0 | 3 | Bing: help.autodesk.com n.º 1 en «autocad xline command» |
| OVERKILL | 20 | 0 | 23 | «command to delete overlapping lines» es la consulta «qué comando» más buscada |
| SWEEP, LOFT | 19, 17 | 0 | 2 | los que el 3D aún no tiene (Estado los nombra) |
| MLEADER | 8 | 1 | 1 | |
| LENGTHEN | 7 | 4 | 0 | |
| WBLOCK | 6 | 0 | 0 | |
| MLINE | 1 | 6 | 4 | «multilínea»: más en español y portugués |

### L4. Rediseño de la landing

Objetivo: que quien llega de Google entienda en cinco segundos qué es, que es gratis y sin
instalar, que trabaja como AutoCAD en su idioma y que hace 2D y 3D, y empiece a dibujar. Concepto
recomendado: «CAD online gratis, al estilo AutoCAD» (`landing.md` §5), con figuras 3D dibujadas por
el motor y 6–8 pantallas. **Terminado:** la landing nueva en los cuatro idiomas, con su plan y sus
decisiones, dentro de los presupuestos de `.claude/rules/i18n.md`.

### L5. Lanzamiento y autoridad

Objetivo: los primeros 20–30 dominios que enlazan y el tráfico de lanzamiento, la causa de más
peso. El kit (`docs/plans/seo/launch-kit.md`, al día con la landing publicada y con las reglas de
cada sitio leídas el 6/11) tiene los textos de Reddit, Product Hunt, AlternativeTo, SaaSHub y los
demás directorios, el guion de Show HN (Hacker News prohíbe ya en sus normas el texto generado o
editado con IA, también en los comentarios: lo escribe a mano el dueño) y el correo base; los
materiales (8 imágenes de galería, el vídeo de 46 s, el logotipo) y los 50 correos de outreach,
uno por artículo y en su idioma, están en `~/seo-data/launch/`, fuera del repo, que es público,
como la lista de los 73 artículos y sus contactos (`~/seo-data/audit-2026-11-05/authority-*.csv`).
Lo medido: ninguno de los 73 nombra a MellowCAD, 53 nombran alguna herramienta del navegador (casi
todas modeladores 3D) y 36 enlazan sin `nofollow`: los enlaces que cuentan salen del outreach, no de
las plataformas de lanzamiento. El outreach va en diciembre, antes de que los listados se reescriban
para 2027. **Ninguna publicación la hace una sesión.**
**Terminado:** el kit al día con la landing nueva y las publicaciones hechas por el dueño, con su
fecha aquí.

**Calendario** (preparado el 6/11/2026; las fechas son objetivos y cada paso espera a su condición;
el texto de cada uno, en la sección del kit indicada; anota la fecha real al hacerlo):

| Cuándo | Qué (lo hace el dueño) | Texto | Condición |
| --- | --- | --- | --- |
| lun 9/11 | GitHub: la vista previa social (descripción y temas, puestos el 6/11); las cuentas, con el nombre de usuario `ovelilla`, nunca el nombre completo (Product Hunt necesita una semana antes de publicar); el vídeo en YouTube, oculto | kit §0, §4 | — |
| 6/11 (hecho) | Directorios: SaaSHub enviado y verificado, AlternativeTo enviado a la cola gratuita (sin la revisión de 15 $); G2, OpenAlternative y TheCADHub no admiten hoy (kit §6); el vídeo en YouTube, oculto, en el canal renombrado `ovelilla`; hello@mellowcad.com reenvía al dueño. **7/11, noche:** la descripción de SaaSHub dice ya que abre DXF (la sesión 05b, con la sesión del dueño). **9/11:** SaaSHub aprueba la ficha (su correo: en «Recently verified»); sus ofertas, no (la ficha destacada de pago, su insignia con enlace y SaaSHub Submit: kit §6); su descripción dice ya el francés (§7, punto 9) | kit §6 | — |
| 9/11 (hecho) | Appvizer y Quelle-Alternative, por la sesión a petición del dueño: en Appvizer, el alta gratuita de editor (su enlace francés da 404; el internacional, con hello@mellowcad.com), que valida la cuenta en 24 h y luego pide la ficha, con texto propio; Quelle-Alternative no tiene formulario, y la propuesta, en francés, salió por correo a contact@digitiz.fr desde la dirección del dueño. **10/11:** Digitiz contesta que toda alta es de pago (200 €, primera posición de por vida): descartado por el dueño, como las demás ofertas de pago | kit §6 | — |
| 9–13/11 | Participar de verdad en r/AutoCAD y r/cad | kit §3 | — |
| jue 12/11 | **r/SideProject**, pidiendo opiniones: es el lanzamiento suave (el dueño no tiene cinco usuarios de AutoCAD a mano) | kit §3 | el sitio para reportar problemas (sesión 05b): publicado y probado el 7/11 (§7, punto 8) |
| 6/11 (hecho) | AlternativeTo aprobado el mismo día, por la cola gratuita (`/software/mellowcad/`), con sus seis alternativas; se ven las seis capturas y el vídeo, y la categoría, Photos & Graphics, es la de AutoCAD, FreeCAD y Onshape. Acceso de desarrollador pedido por la sesión con hello@mellowcad.com y confirmado por el dueño el mismo día: espera la revisión de su equipo. El autor, de «Oscar Velilla» a «ovelilla» por decisión del dueño: enviado como sugerencia, espera la aprobación de un administrador. Su insignia, no: un enlace saliente en la landing que no da posicionamiento. **7/11, 00:30:** sale en la lista de AutoCAD gratis y online (17.ª de 24, tras «Show more»); el autor sigue siendo «Oscar Velilla» y la ficha no ofrece edición: ni el cambio de autor ni el acceso de desarrollador, aprobados aún. **7/11, 13:34:** acceso de desarrollador aprobado (los cambios se publican al momento) y la ficha dice ya «Developed by ovelilla». **7/11, noche:** su descripción decía que no lee DXF; la sesión 05b, a petición del dueño, la cambió por la frase del kit §6 («It opens DXF files but does not save them yet, and has no DWG or printing.»), visible con sesión al momento y en la página pública cuando caduque su caché | kit §6 | — |
| lun 16/11 y cada lunes | Seguimiento: ¿aparece MellowCAD en la lista de AutoCAD gratis y online de AlternativeTo (22 herramientas el 6/11)?, correo en hello@ | kit §6 | — |
| semana del 16/11 | Arreglar lo que salga de r/SideProject (sesiones) | — | — |
| mié 18/11, 14:00–16:00 (hora de España) | **Show HN**, escrito a mano; todo el día respondiendo | kit §2 | lo del lanzamiento suave, arreglado |
| jue 19/11 | Artículo técnico en dev.to sobre el motor, escrito a mano | kit §6 | — |
| lun 23/11 | r/AutoCAD | kit §3 | los fallos de Show HN, arreglados |
| mar 24/11 | En español: r/programacion (dentro de su 10 %), foros y grupos de estudiantes | kit §3 | — |
| mié 25/11 | r/cad | kit §3 | — |
| jue 26/11 | r/Arquitectura, con la etiqueta «Software» | kit §3 | — |
| sáb 28/11 | r/webdev, Showoff Saturday, escrito a mano | kit §3 | — |
| mar 1 – jue 3/12 | Outreach, tanda 1: los artículos A en inglés, MakeUseOf y Hackaday | `~/seo-data/launch/outreach/` | — |
| sáb 5/12, 00:01 PT (09:01 en España) | **Product Hunt**, programado desde el día antes | kit §4 | cuenta con una semana; vídeo en YouTube |
| mar 8 – vie 11/12 | Outreach, tanda 2: los A en español, portugués, árabe, francés y alemán; recordatorio único de la tanda 1 (jue 10) | ídem | — |
| lun 14 – mié 16/12 | Outreach, tanda 3 (B y C); los creadores (`authority-creators.csv`) con los hilos de HN y PH como contexto; profesores (correo del kit §3) | ídem | — |
| vie 18/12 | Recordatorio único de la tanda 2 | ídem | — |
| lun 4/1/2027 | Recordatorio único de la tanda 3; volver a escribir a las listas que publiquen su edición de 2027 | ídem | — |
| enero | Medir (sesión 10, §6) | — | — |

**Qué mirar después de cada paso**: Vercel Analytics, los referentes (news.ycombinator.com,
reddit.com, producthunt.com, dev.to, alternativeto.net) y las visitas de `/draw` por visita a la
landing, por idioma; GitHub, Insights → Traffic (referentes), las estrellas y las issues que
lleguen por los formularios (sesión 05b); Search Console,
Enlaces (dominios que enlazan, tarda semanas) y Rendimiento; Bing, Backlinks. Un enlace nuevo de
una lista se comprueba con su página (que lleve `href` a mellowcad.com, con o sin `nofollow`) y
se anota aquí.

**Visto al preparar los materiales (6/11)**, para su sesión: ZOOM Extensión no encuadra un sólido
en una vista isométrica (anotado en `docs/next-solids.md`, fase 6c); no frena el lanzamiento, pero
quien pruebe el 3D lo verá.

### L6. Práctica y guías

Objetivo: «practicar AutoCAD online», «ejercicios de AutoCAD» y las guías por tarea («fazer planta
baixa», «dibujar planos online»), donde ninguna herramienta compite: ejercicios dibujados por el
motor que se abren en `/draw` con su dibujo, en los idiomas vivos. Más adelante, una página honesta
de «alternativa gratis a AutoCAD en el navegador», cuando haya enlaces. **Terminado:** al menos 12
ejercicios y 3 guías publicados e indexables.

### L7. Producto con impacto en la búsqueda: DXF, después PDF

Objetivo: abrir las familias de DXF (§2.3) con la fidelidad de siempre: OPEN de un .dxf, SAVEAS al
tipo DXF, DXFIN y DXFOUT como en AutoCAD 2027. La sesión investiga, escribe su brief
(`docs/next-dxf.md`) y hace la primera entrega; después, las páginas «abrir DXF online» por
idioma. PDF y PLOT, más tarde (no hay presentaciones). Es la excepción a la pausa de
funcionalidades: es producto, pero por la búsqueda.

### L8. Idiomas nuevos

Con el criterio del dueño (demanda y AutoCAD 2027 en ese idioma), cada uno con la skill
`add-language`: **francés** (AutoCAD localizado; Francia y el Magreb, que `/ar` no alcanza; hecho
el 9/11, sesión 08, `docs/plans/fr-language.md`) y
**italiano** (localizado; la mayor proporción de búsquedas de AutoCAD de los grandes mercados de la
UE; KulmanLab es n.º 1 allí para «cad online gratis»; hecho el 12/11, sesión 09,
`docs/plans/it-language.md`). Después, alemán, ruso (Yandex tiene el 72 %
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
| 05b Reportar problemas | `docs/plans/seo/05b-reportes.md` | — | 07b, 08 |
| 06 Práctica y guías | `docs/plans/seo/06-practica.md` | 03 | 07 |
| 07 DXF | `docs/plans/seo/07-dxf.md` | — (motor) | 01–06 |
| 07b Abrir DXF online | `docs/plans/seo/07b-dxf-paginas.md` | 07 | 08 |
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

Ninguna sesión publica, envía ni cambia nada fuera del repo sin un encargo del dueño: esto es
suyo. Los encargos permanentes están anotados en su punto (la cola de indexación del punto 2, que
el dueño dio a las sesiones el 6/11).

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
   **Tras la sesión 03 (6/11, hecho a petición del dueño):** el sitemap reenviado (Google lo leyó al
   momento: 195 páginas) y «Solicitar indexación» de los cuatro índices `/docs/commands` y de
   OFFSET y TRIM en casi todos los idiomas, 11 URLs, hasta la cuota diaria de Google. Quedan 33 de
   la lista (diez comandos por idioma), y tras publicar la 04 las cuatro portadas delante (37), una
   docena al día:
   `node gsc-request.mjs gsc-request-pending.txt` en ~/seo-data/scripts (con el Chrome del README
   de esa carpeta abierto), que salta las ya pedidas. **La cola la llevan las sesiones**, no el
   dueño: el hook de inicio (`.claude/hooks/session-start.mjs`) avisa cuando quedan URLs y ha
   pasado un día desde que la cuota cortó la última tanda, y la sesión la envía al empezar. Las URLs
   de una tanda nueva, ya publicada, se añaden a esa lista. **6/11:** las 40 de la segunda tanda de
   comandos (ERASE a BREAK en los cuatro idiomas), añadidas al final antes de su push: el script
   salta, sin gastar cuota, una URL que aún no responde 200 (`not live`), y la vuelve a intentar en
   la tanda siguiente. **6/11:** las 40 de la tercera tanda (SPLINE a ZOOM), añadidas igual antes de su
   push. **6/11:** las 32 de la cuarta (CYLINDER a MASSPROP), igual, y las 28 de la quinta (UCS a
   SOLIDEDIT). **6/11:** las 40 de la sexta (ATTDEF a COLOR), igual, y las 40 de la séptima (UNDO a
   COPYCLIP), y las 12 de la octava (VIEW, PLAN y UCSICON): 269 en la cola. **7/11:** la tanda
   del día, 11 pedidas (las cuatro portadas, TRIM en árabe, HATCH en los cuatro idiomas y SCALE en
   inglés y español) hasta la cuota, a las 23:09 UTC del 6/11; y las 4 de la novena (-OSNAP),
   añadidas al final antes de su push: 262 en la cola. **7/11:** las 64 de la sesión 06 (el índice
   de ejercicios, las tres guías y los doce ejercicios, en los cuatro idiomas), añadidas igual: 326.
   **7/11, 23:10 UTC (sesión 07b):** la tanda del día, 11 pedidas (SCALE en portugués y árabe,
   FILLET y BLOCK en los cuatro idiomas, TEXT en inglés) hasta la cuota, a las 23:14 UTC: 315 en
   la cola. **8/11:** las 4 de la sesión 07b (`/docs/open-dxf` en los cuatro idiomas), añadidas al
   final antes de su push: 319. **8/11:** la 07b publicada a petición del dueño (`c481a0a7`), con
   IndexNow (499 URLs del sitemap, 200).
   **9/11 (decisión del dueño): la cola se ordena por prioridad y sale del sitemap.** A la cola le
   faltaban 147 de las 499 URLs publicadas (LINE, CIRCLE, MOVE, COPY y otros 25 comandos de la
   primera tanda, `/docs`, las guías y la documentación del motor), porque se iba llenando a mano y
   por orden de publicación. Ahora `node gsc-prioritize.mjs` (en ~/seo-data/scripts) la rehace antes
   de cada tanda a partir del sitemap publicado, quitando lo ya pedido: primero los índices y las
   guías (`/docs/floor-plan` delante, «floor plan» es el término más buscado tras «autocad»), luego
   los comandos por su índice de Google Trends de la auditoría y los ejercicios, cada idioma pesado
   por su mercado. `/privacy` queda fuera. Ya no se añade nada a mano: 451 en la cola, unos 41 días
   a 11 al día. El sitemap no hay que tocarlo: `app/sitemap.ts` lo genera en cada despliegue, con
   `lastmod` del último commit de cada página, y Google lo relee solo.
   **9/11 (sesión 08):** el francés, publicado. Sus URLs (`/fr`, sus páginas «Use», las 97 de
   comando y los 12 ejercicios) no se añaden a mano: `gsc-prioritize.mjs`, que pesa `/fr` (0,5,
   entre el 0,6 de pt-BR y el 0,35 del árabe), rehízo la cola desde el sitemap publicado tras el
   push: 571, 120 de ellas francesas (`/fr/docs/commands`, la décima).
   **10/11:** la tanda del día, 11 pedidas (las guías del plano y de abrir un DXF en tres idiomas,
   `/docs` y `/es/docs`, `/fr`, `/docs/exercises` y `/fr/docs/commands`) hasta la cuota, a las
   10:48 UTC: 560 en la cola. Desde hoy la tanda se reclama con un cerrojo (`flock` sobre
   `.batch.lock` en ~/seo-data/scripts), y el hook calla mientras otra sesión la envía.
   **11/11:** la tanda del día, 11 pedidas (las portadas de `/docs` en francés, los ejercicios en
   pt-BR y francés, la guía de abrir un DXF en árabe…) y un error (`/ar/docs/floor-plan`), hasta la
   cuota a las 21:12 UTC: 549 en la cola, de 620 en el sitemap.
   **12/11 (sesión 09):** el italiano, publicado. Sus 121 URLs entran por `gsc-prioritize.mjs`, que
   pesa `/it` a 0,4 (Italia, 113 en el índice de la auditoría, sola), entre el francés y el árabe:
   669 en la cola, `/it` y sus centros delante. IndexNow, las 741 del sitemap (200); Bing,
   «Request indexing» de `/it` y sus nueve páginas «Use» y centros (cuota 90 restante).
   **12/11 (sesión 07c):** `/docs/edit-dxf` en los seis idiomas, publicada; `gsc-prioritize.mjs`
   la pesa ya como centro (25, bajo `/docs/open-dxf`, 70: Trends da «dxf editor» 12 contra «dxf
   viewer» 80), y no como documentación (0,03), que la dejaba en los puestos 440 a 666: 675 en la
   cola, las seis entre los puestos 6 y 29. IndexNow, las 747 del sitemap (200).
   **12/11, 21:51 UTC (sesión de SOLID):** la tanda del día, 11 pedidas (`/it`, sus comandos, su
   guía del plano y su página de abrir un DXF, `/ar/docs/floor-plan`, `/docs/edit-dxf`…) hasta la
   cuota: 682 en la cola, de 765 en el sitemap.
3. **Bing Webmaster Tools**: la clave responde ya en producción
   (`https://mellowcad.com/1eb5d0fec5dc99d5695b010f04667a07.txt`, 5/11); enviar el sitemap a IndexNow:
   `npm run indexnow` lista lo que enviaría y `npm run indexnow -- --send` lo envía (se niega si la
   clave no está desplegada); repetirlo en cada push con páginas nuevas o cambiadas. Inspección de
   URLs → «Request indexing» de `/docs/commands` y `/pt-br`, hoy «descubiertas pero no rastreadas»;
   un Site Scan para que el informe de SEO tenga datos. **6/11:** IndexNow enviado con las 195 URLs
   (202) y «Request indexing» de las 44 URLs de la lista de Google (los índices y diez comandos por
   idioma; cuota de 100 al día); quedaban `/pt-br`, pedida después con las portadas (§8, la 04), y
   el Site Scan. **9/11 (por la sesión, a petición del dueño):** el Site Scan del sitemap (650
   páginas como máximo; Bing avisa por correo al acabar) y «Request indexing» de las 20 primeras
   URLs francesas de la cola de Google, todas «descubiertas pero no rastreadas» (cuota 100 → 81).
   El 6/11, tras el push de la segunda tanda, IndexNow con las 235 URLs del sitemap (200).
4. **GitHub y npm**: la descripción y los temas del repositorio, puestos el 6/11 (el `gh repo edit`
   de `docs/plans/seo/launch-kit.md` §0); la vista previa social (Settings → Social preview,
   `og-card-en.png`), que GitHub no deja poner por API, puesta el 9/11 por la sesión con la sesión
   de GitHub del dueño: la página del repositorio la sirve. **9/11, npm (a petición del dueño):**
   `f38e1dfe` sube las versiones y el workflow Release publica el motor 0.3.0, con procedencia y su
   descripción nueva; react 0.1.1 y el editor 0.2.0, después: sus trusted publishers habían caducado
   sin usarse (`.claude/rules/engine-package.md`), el dueño los rehízo con su llave y un segundo
   Release los publicó, con procedencia y sus etiquetas. Los tres, la última versión en npm.
5. **Directorios** con cuenta propia (AlternativeTo, SaaSHub, G2, TheCADHub y los demás del kit,
   §6): ya, la semana del 9/11 (calendario de L5). Tras el push de la sesión 08, las fichas de
   AlternativeTo y SaaSHub dicen el francés con el texto del kit (§6, «In English, Spanish,
   Brazilian Portuguese and French…»): punto 9.
6. **Show HN, Reddit, Product Hunt y dev.to**, con los textos del kit y en las fechas del
   calendario de L5 (02–04 ya están publicados).
7. **Outreach** a los autores de los artículos de la lista: los 50 correos de
   `~/seo-data/launch/outreach/`, en tres tandas de diciembre (calendario de L5).
8. **Lo de la sesión 05b, hecho por una sesión a petición del dueño (7/11):** el push, el reporte
   privado de vulnerabilidades activado (Settings → Advanced Security; la API responde
   `{"enabled":true}`) y los enlaces abiertos de verdad, con la sesión de GitHub del dueño: desde
   Enviar comentarios en `/es/draw`, el selector muestra los dos formularios y Report a security
   vulnerability, y los dos traen la versión (`0.2.0+de8d801`), el navegador y el idioma. Visto de
   paso: GitHub solo enseña el selector a quien ha iniciado sesión, descarta un enlace `mailto:`
   (también el de Mbed TLS) y, con el reporte privado activo, pone él mismo el de la política de
   seguridad; `config.yml` se queda sin enlaces y quien no tiene cuenta tiene el correo junto a
   Report a problem en el pie. Las fichas de AlternativeTo y SaaSHub dicen ya que abre DXF (la de
   AlternativeTo, en su página pública cuando caduque la caché; calendario de L5). **12/11 (sesión
   07c):** las dos dicen ya que lo abre y lo guarda («It opens and saves DXF files, but has no DWG
   or printing yet.», el texto del kit) y el italiano; en AlternativeTo, también en «Supported
   Languages». SaaSHub, con lo que el Chrome de ~/seo-data guardaba de la cuenta del dueño, por su
   «Manage», sin revisión: la página pública lo sirve ya.
9. **Lo de la sesión 08, hecho por la sesión a petición del dueño (9/11):** el push
   (`c481a0a7..e122261e`, y después los arreglos del francés), verificado en producción (`/fr`,
   `/fr/draw` con sus nombres, el sitemap con 620 URLs, `hreflang` en las cinco portadas); IndexNow
   con las 620 URLs (200); la cola de Google rehecha (punto 2); y la ficha de AlternativeTo, con la
   sesión de Google del dueño en el Chrome de ~/seo-data: el francés en la descripción y en
   «Supported Languages»; y la de SaaSHub, en su descripción, cuando el dueño volvió a entrar
   (su sesión, un enlace por correo a `hello@mellowcad.com`, había caducado), el día en que
   SaaSHub la aprobó.

## 8. Estado

Una línea por sesión, que cada una actualiza al cerrar su parte.

- Auditoría: hecha el 5/11/2026 (`4c6094db`, `7eede991` y el kit de lanzamiento).
- 01 Técnica y rastreo: hecha y publicada el 5/11/2026 (`bd30cf81` a `506c3d5b`). Medido en builds
  de producción de antes y después: de 111 URLs rastreables (92 HTML, 45 copias, 7.064 enlaces
  internos, 58,3 MB de HTML) a 78 (47 HTML, 0 copias, 3.741 enlaces, 8,9 MB); las 43 indexables son
  las del sitemap, con título y descripción únicos y `lastmod`; `/docs/engine/api` de 9,1 MB a
  0,6 MB y ninguna página por encima de 1 MB; JSON-LD con 0 errores en el validador de schema.org;
  Lighthouse igual (100 en `/`, `/es` y `/docs/commands`) y `/docs/commands` de 777 a 320 KB en
  escritorio. Quedan del dueño (§7): IndexNow y la prueba de resultados enriquecidos.
  `/pt-BR` sigue en 404 (una redirección pide rutas sensibles a mayúsculas, sin verificar en Vercel).
- 02 Posicionamiento y metadatos: hecha y publicada el 5/11/2026 (`353027e8`, `146fffea`). La tabla
  de consultas de cada home, en L2; las 21 ubicaciones de `technical.md` §6.2, reescritas (16) o
  conservadas por estar ya bien (5: el `featureList`, «Todavía no» y «A continuación», el README y
  los recuentos de idiomas), cada una con su motivo en los commits. Titles de 52 a 59 caracteres y
  descriptions de 145 a 155, con la consulta principal delante, sostenidos por
  `i18n/messages.test.ts`; el FAQ pregunta por el 3D; las tarjetas OG, vistas en los cuatro
  idiomas. Quedan del dueño (§7): la vista previa social de GitHub y la próxima publicación en npm.
- 03 Una página por comando: la mecánica y la primera tanda hechas el 5/11/2026 y publicadas el
  6/11 (`4f005c37` a `1ca32508`), con IndexNow, el sitemap reenviado y la indexación pedida en
  Google y Bing (§7). **38 comandos con página** en los cuatro
  idiomas (152 URLs más en el sitemap, con hreflang): BLOCK, INSERT, TEXT, MTEXT, SCALE, LAYER,
  HATCH (con la galería de patrones del motor), las siete cotas y DIMSTYLE, PLINE, FILLET, OFFSET,
  TRIM y EXTEND, ARRAY y sus tres tipos; el 3D (EXTRUDE, REVOLVE, PRESSPULL, BOX, UNION, SUBTRACT,
  INTERSECT, SLICE); y LINE, CIRCLE, MOVE, COPY, ROTATE, MIRROR. Cada una se genera de sus notas
  (`content/commands/`) y del motor, y `docs:check` la tiene al día con su entrada de cobertura; F1
  abre la página del comando. El índice, «AutoCAD commands list» / «Lista de comandos de AutoCAD
  en español e inglés» / «Comandos do AutoCAD em português e inglês» / «قائمة أوامر الأوتوكاد
  واختصاراتها», con los dos nombres y un enlace a cada página. **Segunda tanda, hecha y
  publicada el 6/11** (`26626a1d`): ERASE, ARC, RECTANG, POLYGON, ELLIPSE, CHAMFER, STRETCH, EXPLODE,
  JOIN y BREAK (40 URLs, en la cola de indexación de §7). En portugués, el título lleva delante la
  palabra que se busca también en retângulo, polígono, elipse, arco, apagar y explodir (la skill lo
  dice). **Tercera tanda, hecha y publicada el 6/11** (`dd93d98b`): SPLINE, PEDIT, MATCHPROP, PROPERTIES,
  LINETYPE, LWEIGHT, UNITS, AREA, DIST y ZOOM (40 URLs más, ya al final de la cola de §7), con lo que
  la segunda ola está completa: 58 comandos con página. LINETYPE y LWEIGHT cuentan la forma de
  guion que ejecutan (no hay Administrador ni cuadro de grosores); la figura de UNITS y la de
  PROPERTIES muestran lo que dibuja el motor (el cuadro y la paleta son del editor), y las de
  LWEIGHT, PROPERTIES y ZOOM son el último fotograma del editor (`live`), porque una imagen fija no
  dibuja grosores, pinzamientos ni la vista. **Cuarta tanda, hecha el 6/11 y publicada el 7/11:** la
  primera mitad del resto del 3D, las primitivas y la consulta: CYLINDER, SPHERE, CONE, WEDGE,
  TORUS, PYRAMID, REGION y MASSPROP (32 URLs más, al final de la cola de §7): 66 comandos con
  página. Las primitivas, como BOX, en vivo desde el sureste; la esfera y el toroide con el estilo
  Conceptual, porque Oculto solo dibuja su contorno; REGION, cuatro líneas y un círculo con su
  recuento, y MASSPROP, el informe de un prisma. **Quinta tanda, hecha el 6/11 y publicada el 7/11:** el
  resto del 3D, UCS, 3DORBIT, VSCURRENT, SECTION, FILLETEDGE, CHAMFEREDGE y SOLIDEDIT (28 URLs más,
  al final de la cola de §7), con lo que el 3D está entero: 73 comandos con página. Todas en vivo
  (las de vista porque una imagen fija enmarca la planta): UCS lleva el origen a la cara superior de
  un prisma y dibuja un círculo en ella; 3DORBIT arrastra desde la planta; VSCURRENT, un bloque
  taladrado en Conceptual; SECTION, el perfil de ese bloque por el plano ZX, sacado delante con
  MOVE. UCS y SOLIDEDIT, con una `###` por palabra clave que se elige y las subrespuestas dentro.
  Los términos árabes sin glosario, en la tabla de `docs/i18n/ar.md` («Command pages»), para la
  revisión nativa. **Sexta tanda, hecha el 6/11 y publicada el 7/11:** los atributos, ATTDEF, ATTEDIT,
  EATTEDIT y ATTDISP, y STYLE, DIMSPACE, TEXTEDIT, PURGE, LTSCALE y COLOR (40 URLs más, al final de
  la cola de §7): 83 comandos con página. Todas fijas, ninguna trata de una ayuda; DIMSPACE (tres
  cotas en cadena, escalonadas, alineadas con 0) y LTSCALE (una placa de 4 m a escala 1 y a 20)
  con un antes encima de la sesión: el `before` de las notas, `<slug>Before` en las sesiones. STYLE
  y COLOR cuentan lo que hacen la paleta de estilos y la forma de guion; la figura de STYLE, el `?`
  de TEXT, lo que guarda un estilo. Arreglado de paso en el motor: una imagen fija (las figuras, las
  miniaturas) no seguía ATTDISP ni FILL. **Séptima tanda, hecha el 6/11 y publicada el 7/11:** UNDO,
  REDO, LIST, ID, PAN, SNAP, 3DPOLY, SPLINEDIT, CHPROP y COPYCLIP (40 URLs más, al final de la cola
  de §7): 93 comandos con página. U y MREDO los cuentan UNDO y REDO; CUTCLIP, COPYBASE y PASTECLIP,
  COPYCLIP; -PAN, PAN. Fijas salvo PAN y SNAP, en vivo (la vista y la rejilla), y 3DPOLY, en vivo
  desde el sureste como BOX; UNDO con un antes encima (`undoBefore`). Arreglado de paso en el
  motor: el historial de una sesión escribía `PAN:` o `3DORBIT:` al Intro que lo acaba y perdía la
  línea con que empieza PAN (la de 3DORBIT, publicada, también cambia). **Octava tanda, hecha el
  6/11 y publicada el 7/11:** VIEW, PLAN y UCSICON (12 URLs más, al final de la cola de §7): 96 comandos
  con página. Las tres en vivo, sobre un bloque escalonado: VIEW, Isométrica SO respondida en la
  primera solicitud, como la escriben los menús de AutoCAD; PLAN, la planta de un SCP girado 30°
  desde esa isométrica; UCSICON, Sin origen y luego Origen con el SCP en el escalón. VIEW cuenta
  las vistas ortogonales con el SCP que alinean y las isométricas, y el ViewCube y el control de
  vista como otros caminos. De los seis candidatos que «Lo que queda» no nombraba, UCSICON llena una
  página y REGEN, FILL, NAVVCUBE, FROM y CLEANSCREENON se quedan en el índice, cada uno con su motivo
  en `docs/plans/seo/03-comandos.md`. En el motor, de paso: una demo puede mostrar el icono SCP
  (`demo({ ucsIcon: true })`, `18fab8f6`). Publicadas las tres primeras tandas el 6/11, 58
  comandos, y de la cuarta a la novena el 7/11. **Novena tanda, hecha y publicada el
  7/11:** -OSNAP (4 URLs más, al final de la cola de §7): 97 comandos con página, la primera
  de un comando de guion (`/docs/commands/-osnap`; F1 y el índice ya tomaban el slug). Es la página
  de las referencias a objetos, porque no hay OSNAP ni su cuadro: los modos de -OSNAP, una `###`
  por modo con lo que encuentra y su marcador, F3 y el menú de la barra de estado, las de un solo
  uso (sus mayúsculas o Mayús + clic derecho) y FROM; sus preguntas, las del autocompletado («osnap
  command», «osnap not working», «osnap shortcut key», «osnap settings»; en español «comando osnap
  en español», en Brasil «para que serve» y «não funciona»). En vivo: -OSNAP `_MID,_CEN` sin
  referencias activas y una línea del punto medio de un borde al centro de un círculo, con el
  marcador de Punto medio en otro borde. En el motor, de paso: `-REF` arranca -REFENT, como dice
  el acad.pgp español de 2027 (`a5e046c4`; los historiales de las 105 sesiones, iguales en los
  cuatro idiomas), y la sonda names/p30 confirma la `D` de Desativado (OFF) en pt-BR. **Quedan 43
  comandos sin página, y ninguno la llena**: la
  serie está completa (la lista y sus motivos, en `docs/plans/seo/03-comandos.md`, «Lo que
  queda»). Para la sesión 04: el tablero de comandos de la landing puede enlazar cada
  comando con página (`commandPageIds`).
- 04 Rediseño de la landing: hecha y publicada el 6/11/2026 (`82c1eaf2` a `719f3b03`). Tras el push,
  «Request indexing» de `/`, `/es`, `/pt-br` y `/ar` en Bing (aceptadas, cuota 97 de 100) e IndexNow
  con las 195 URLs del sitemap (200); en Google, las cuatro portadas encabezan la cola de «Solicitar
  indexación» (37 URLs, §7), que no admite más hasta pasadas las 23:03 UTC del 6/11. El plan, lo cambiado al construir, lo medido y el test de cinco
  segundos antes y después, en `docs/plans/seo/04-landing-plan.md`. Concepto A con el hero del B y
  el «para quién» del C: el H1 es la categoría («CAD online gratis con comandos de AutoCAD»), la
  píldora gratis / sin registro / nada que instalar encima, el lead con los alias del motor en el
  idioma de la página, el hero con forma de editor (la brida trazada en planta y, al responder
  -VIEW, el mismo dibujo con su sólido en Isométrica SO, Oculto; la etiqueta de vista y el
  ViewCube dibujados desde el `EngineState` de la grabación; la última línea de comando es la caja
  real), las cifras en la primera pantalla; secciones con los términos de búsqueda en sus H2
  (comandos, dibujo 2D, sólidos 3D, gratis y privado, para quién, estado y el FAQ con la pregunta
  de clase), el tablero enlazando las 38 páginas de comando; fuera la sección del motor, las listas
  repetidas y la tarjeta del OFFSET. De 11,7 a 7,4–7,9 pantallas de escritorio (móvil, de 19,3 a
  15,1); primera carga 247,4–248,9 KB en Brotli (árabe 271,7; antes 241–243 y 265), dentro de 250
  y 275; Lighthouse igual antes y después. El motor: Conceptual corta las celdas de una cara plana
  en sus aristas (sin escalones) y `recordDemo` devuelve el último estado. La tarjeta OG dibuja la
  brida y su sólido.
- 05 Lanzamiento: preparado el 6/11/2026; lo publica el dueño según el calendario de L5. El kit,
  al día con la landing publicada y con las reglas de cada sitio leídas ese día (Hacker News
  prohíbe ya el texto generado o editado con IA; Product Hunt pide una semana de cuenta;
  AlternativeTo, una descripción sin URLs, y su cola gratuita puede no llegar nunca; r/brdev,
  r/arquitetura y otros prohíben promocionar productos; no hay subreddit de AutoCAD en español).
  Los materiales en `~/seo-data/launch/`, dibujados por MellowCAD desde un build de producción
  local: 8 imágenes de galería a 1270×760 (2×), el vídeo de 46 s a 1920×1080 (inglés, español y
  3D), el logotipo de 240 a 1024 px; 50 correos de outreach, uno por artículo y en su idioma, 5
  fichas de directorio en su lugar y 3 competidores descartados. Publicado: nada todavía.
- 05b Reportar problemas: hecha y publicada el 7/11/2026 (`e5b445ff` a `07457557`; el push, el
  reporte privado de vulnerabilidades y la prueba de los enlaces, hechos por la sesión a petición
  del dueño: §7, punto 8), con lo que la condición del lanzamiento suave del 12/11 está cumplida. Dos
  formularios de issues de GitHub (`.github/ISSUE_TEMPLATE/`), en inglés, diciendo que se puede
  escribir en español, portugués o árabe y que una issue es pública: algo que no funciona (qué
  hiciste, qué pasó, qué hace AutoCAD) y un comando u opción que falta o no hace lo de AutoCAD 2027;
  `config.yml` quita la issue en blanco, y la política de seguridad, `SECURITY.md`, la enlaza GitHub
  en el selector: el reporte privado, nunca una issue. El correo para quien no tiene cuenta no cabe en
  GitHub (descarta el `mailto:` y pide sesión para ver el selector): está junto al enlace del pie.
  Los dos enlaces abren el selector (`/issues/new/choose`), que según la documentación de GitHub
  pasa los campos al formulario elegido, con la versión (la del motor y el commit que construyó
  Vercel) y el idioma, y el navegador desde el editor; nada pasa por un servidor nuestro y
  `/privacy` no cambia.
  En el editor, Send Feedback / Enviar comentarios / Enviar feedback, los nombres de AutoCAD 2027
  (su menú Ayuda, acad.cuix `ID_SendFeedback`, y el botón del panel Connect de la pestaña Inicio,
  visto en el escritorio), al final del menú de la aplicación con su WHY hasta que haya pestaña
  Inicio (`docs/next-autocad-ui.md`, fase 2); en árabe, إرسال ملاحظات †. La URL se la pasa la app
  (`feedback`, nuevo en `@mellowcad/editor`, con su changeset). En el pie, Report a problem /
  Reportar un problema / Relatar um problema / الإبلاغ عن مشكلة, junto al correo. `lib/report.test.ts`
  comprueba que cada campo que rellena la URL es un `id` de cada formulario. Verificado en Chrome
  en los cuatro idiomas: el menú, el pie, el árabe y el ancho de móvil. **Medido de paso**, en builds
  de producción locales (Brotli q11): la primera carga de la landing ya estaba en el límite antes de
  esta sesión, por lo añadido en 06 y 07: pt-BR lo pasaba (250,5 KB contra 250) y es lo tocaba
  (250,0); en, 248,8, y ar, 273,3 (contra 275); la 04 midió de 247,4 a 271,7. Por eso el pie no pone
  el navegador, que pediría una isla; su enlace suma 0,1–0,2 KB de HTML (es 250,2). Queda para quien
  toque la landing después: volver bajo 250. De paso, el README y el kit de lanzamiento decían que
  no abre DXF, y el texto de r/SideProject dice dónde reportar un fallo.
- 06 Práctica y guías: hecha y publicada el 7/11/2026 (`7c988f39` a `08a26c98`). La biblioteca
  `/docs/exercises` («AutoCAD practice exercises», «Ejercicios de AutoCAD para practicar», «Exercícios
  de AutoCAD para praticar», «تمارين أوتوكاد»), con 12 ejercicios por nivel —junta, escuadra en L,
  escalera y placa de montaje; brida, mesa redonda, parcela, eje, bloque isométrico y polea; biela y
  soporte de cojinete—, de mecánica, arquitectura y obra civil, en 2D, isométrico y 3D. Cada uno es
  una página generada de sus notas y del motor: el enunciado, los comandos que practica (enlazados),
  el dibujo acotado (el perfil y el sólido en los 3D), la solución paso a paso con la figura y el
  historial de cada paso, la versión imprimible (negro sobre blanco, «Imprimir o guardar como PDF»)
  y «Abrir en el editor»: `/draw?drawing=<slug>` carga el dibujo acotado a la izquierda del origen,
  con sus capas en el idioma de la página y en un almacén propio, sin leer ni escribir el
  autoguardado de quien ya dibuja (verificado en Chrome: abrir, dibujar, recargar, NUEVO y volver,
  y el árabe). Tres guías, elegidas con los datos de la auditoría: el plano de una casa («planta
  baixa», «plano de casa»), las coordenadas y del 2D al 3D. Enlazado desde la navegación de la
  documentación, primeros pasos, la landing («para quién», la pregunta de clase del FAQ y el pie) y
  las 27 páginas de comando que practica («Practícalo»). Slugs en inglés (`i18n.md`). Traducido por
  un agente por idioma; el árabe de la capa Contorno es «الخطوط الظاهرة» («المحيط» es también la
  circunferencia). En el motor, de paso: `recordDemo` deja su dibujo en un almacén (`7c988f39`), el
  historial de una referencia tecleada (`b6742207`) y TRIM en una tangente calculada, que borraba
  entero el saliente grande de la biela (`1bfe25ac`). Lo decidido, los datos y lo que queda (más
  ejercicios, «aprender AutoCAD desde cero», la página de alternativa), en
  `docs/plans/seo/06-practica-plan.md`; las 64 URLs, al final de la cola de §7.
- 07 DXF: hecha y publicada el 7/11/2026 (`827fb5ef` a `4c31ea2c`). Investigado en la consola y el
  escritorio de AutoCAD 2027 (sondas `scripts/research/probes/dxf/`): OPEN y DXFIN (CARGADXF,
  IMPDXF) abren un DXF con el _Select File_ de siempre, SAVEAS y DXFOUT lo escriben desde _Save
  Drawing As_ o con FILEDIA 0 (versiones R12 a 2018, precisión, binario), y el lector de AutoCAD
  descarta el dibujo entero por cualquier imperfección. Tres competidores probados con nuestro DXF
  (KulmanLab, dxfviewer.app, CADCraft): ninguno sube el fichero y todos fallan en el texto. El brief,
  `docs/next-dxf.md`, decide abrir primero (OPEN ya es el selector de ficheros; guardar necesita el
  cuadro _Save Drawing As_, que no existe) y ordena cinco fases. **Primera entrega, abrir un DXF:**
  OPEN de un .dxf y DXFIN, ASCII y binario, R12 a 2018, el texto en su página de códigos; las
  entidades que el modelo tiene, con sus capas, estilos y bloques; lo que no tiene, contado en la
  línea de comandos (`7 objects not opened: 1 POINT, …`); los mensajes de AutoCAD para lo que no es
  DXF. Probado con ficheros escritos por AutoCAD 2027 (dos dibujos de referencia en las siete
  versiones y en binario) y en el editor real (Chrome). Un DXF de 50.000 objetos se lee en 0,2 s; de
  paso, el autoguardado sin sangrías, la mitad de grande (`f6a4d2c0`). El sitio lo dice en los cuatro
  idiomas: Estado, la FAQ de DWG/DXF, la sección de archivos, «para quién no es todavía» y la
  pregunta de la práctica. Las páginas «abrir DXF online», hechas en la 07b; queda guardar como DXF
  (fase 2) y lo que más falta en los DXF reales (fase 4, medida en la 07b: SOLID, LEADER, POINT, los
  tipos de línea del dibujo, las referencias externas y el patrón propio de cada sombreado).
- 07b Abrir DXF online: hecha y publicada el 8/11/2026 (`242d031f` a `bbeefd64`; el push, verificado
  en producción, y IndexNow, por la sesión a petición del dueño). Antes de
  escribir, el lector abrió los 154 dibujos de muestra de AutoCAD 2027 (guardados como DXF 2018 por
  la consola) y 577 DXF de otros programas (LibreCAD, ezdxf, dxf-parser, OpenSCAD, Inkscape): abren
  todos, y lo que más falta ordena la fase 4 de `docs/next-dxf.md` (`245efe69`); de paso, dos
  arreglos del lector (`242d031f`): lo que sigue a EOF, que AutoCAD abre, y el código de estilo
  tras el nombre de un patrón (`ANSI31,_O`). La página, `/docs/open-dxf`, una «Use» de la
  documentación tras los atajos («Open a DXF file online», «Abrir un archivo DXF online», «Abrir
  arquivo DXF online», «فتح ملف DXF أون لاين»), con el título de búsqueda de lo que busca cada
  idioma: «Free DXF viewer online: open DXF in your browser» ("dxf viewer online", 1,6K en Bing en
  tres meses), «Abrir DXF online gratis: visor DXF sin instalar», «Abrir arquivo DXF online:
  visualizador grátis» y, del autocompletado de Google en Egipto y Arabia Saudí, «فتح ملف DXF أون
  لاين: عارض ملفات DXF مجاني»; lo que abre y lo que no, como la entrada de DXFIN, OPEN y DXFIN en
  el editor y cinco preguntas (`FAQPage`). Arriba, elegir o soltar un DXF lo abre en `/draw` sin
  subirlo (IndexedDB y el `openFile` del motor, `761a6083`); un DWG se contesta en la página.
  Enlazada desde la sección de archivos y la respuesta de DWG y DXF de la landing, primeros pasos,
  la navegación y `llms.txt`; `/privacy` dice qué más guarda el navegador. Sin página de comando
  para OPEN ni DXFIN: lo que su entrada da es esta página. El H2 y la descripción de la landing,
  sin DXF: su familia es otra, y la página la cubre. El kit de lanzamiento ya decía lo que la
  página afirma. Verificado en Chrome sobre un build de producción: una muestra de AutoCAD elegida
  en `/docs/open-dxf` y la demo de three-dxf soltada en `/es/docs/open-dxf`, cada una con su
  informe en la línea de comandos. La primera carga de la landing, bajo el presupuesto otra vez
  (`18161b41`, la lista de comandos del hero llega al usar su línea): de 248,9, 250,2, 250,4 y
  273,3 KiB a 247,7, 248,9, 249,1 y 272,0 (en, es, pt-BR, ar), los dos enlaces nuevos incluidos.
  Visto de paso, sin arreglar: la transición de vista al entrar en el editor desde el sitio
  termina a veces a los 4–5 s, no a los 0,4 (Chrome, sin mover el ratón; también en `HEAD`), y
  mientras dura el lienzo tapa el historial de la línea de comandos y los clics van a `<html>`; la
  de la página de DXF se salta por eso.
- 08 Francés: hecha y publicada el 9/11/2026 (`2294f28f` a `9336ef8d`, y `10d28c9e` y
  `f11b8428` el mismo día; las fases, lo medido y lo que queda, en `docs/plans/fr-language.md`;
  el push, IndexNow y las fichas de AlternativeTo y SaaSHub, por la sesión a petición del dueño:
  §7, punto 9).
  El francés, `live` en `/fr` con el sistema entero:
  el sitio, el editor, las seis páginas «Use», las 97 de comando y los 12 ejercicios, y el lenguaje
  de comandos de AutoCAD 2027 en francés, sacado de su consola (el paquete de idioma instalado en
  el AutoCAD del dueño, y la 2027.1 aplicada otra vez): 426 sondas corridas en fr-FR y emparejadas
  con las inglesas, los nombres por `getcname` (LIGNE, DECALER, AJUSTER; del `acad.pgp`, E es
  ETIRER y EF borra), la interfaz por id del paquete instalado (`propose-interface.mjs`, nuevo) y
  `frenchPrompts.test.ts` con lo que imprimió la consola. Los títulos, de lo que se busca en
  francés (autocompletado, Trends y resultados): «CAO en ligne gratuite avec les commandes AutoCAD
  — MellowCAD», «logiciel de CAO gratuit» en la descripción (CAO y no DAO ni CAD: Trends da 40 a
  «logiciel cao» contra 2), «Commandes AutoCAD en français et en anglais» para la lista y
  «Exercices AutoCAD gratuits, avec corrigés». La tipografía francesa, con el espacio de no
  separación (U+00A0) ante `:` `;` `!` `?` y dentro de « », nunca el estrecho, que las fuentes de
  la tarjeta no tienen. La primera carga de la landing, medida en builds de producción antes y
  después: 247,8, 249,0, 249,3, 272,2 y 249,8 KiB (en, es, pt-BR, ar y fr), con nueve textos
  franceses acortados antes de pasar a `live` (el francés llegaba a 250,0, a 19 bytes del límite).
  AZERTY, verificado en Chrome: Ctrl+&, Ctrl+ç y Ctrl+Z, y las teclas muertas en la línea de
  comandos y la entrada dinámica. Lo que no encajó, corregido en el sistema: los dos puntos de una
  etiqueta por idioma en el generador (`LABEL_END`), `console-pair.mjs` conservando el U+00A0 de
  Autodesk, el banner francés de `runacc.sh`, y, para todos los idiomas, la composición de una
  tecla muerta sobre el dibujo, que la emulación pierde (skill `browser-verify`). Lo que nombraba
  los idiomas a mano (el README, los paquetes y sus páginas, los formularios de issues, el kit de
  lanzamiento) dice ya el francés; el brief del sistema de idiomas, publicado, se borra: lo que
  seguía vigente estaba ya en las reglas, las skills, `docs/i18n/README.md` y esta L8. Después de
  publicar, el mismo día: lo que el francés redacta por comando y el inglés no (`10d28c9e`: cinco
  ids de prompt, tres etiquetas por prompt, doce respuestas pegadas a los dos puntos y las líneas
  de LIST de una polilínea ajustada, que reproduce ya la consola línea a línea) y los conmutadores,
  vistos en el AutoCAD francés de escritorio (`f11b8428`: `<Ortho actif>`, `<Accrochage actif>`
  en F9; la tabla y lo supuesto decían `activé`). Sin revisión de un nativo, por decisión del
  dueño (no conoce a ninguno): lo escrito a mano lo releyó un modelo el mismo día, contra el
  inglés, las tablas y los menús de Autodesk (10 textos del sitio, 3 del editor, 5 páginas «Use»,
  4 ejercicios y 41 páginas de comando; `docs/i18n/fr.md`, «Review»).
- 09 Italiano: hecha y publicada el 12/11/2026 (`docs/plans/it-language.md`, `docs/i18n/it.md`):
  el paquete de idioma instalado en el AutoCAD del dueño y la 2027.1 otra vez, el lenguaje de
  comandos de la consola italiana (420 sondas), el sitio con lo que se busca en italiano («CAD
  online gratis», «comandi autocad inglese italiano», «file dxf»), los conmutadores y el ViewCube
  vistos en el escritorio (cinco de siete líneas supuestas estaban mal), y sin nativo, la relectura
  de un modelo. La primera carga de cada portada sigue bajo 250 KiB (`/fr`, la más justa, 73 bytes
  por debajo). **Siguiente idioma propuesto: el alemán**, el siguiente de L8 con el criterio del
  dueño (AutoCAD localizado), aunque la auditoría lo ve flojo («autocad befehle» casi 0, SERP
  llena). Search Console (28 días al 12/11) da los clics a España y a los países árabes (Egipto,
  Yemen, Siria, Arabia Saudí, Irak, Palestina, posiciones 1–5): un idioma `global` también rinde,
  así que si el dueño amplía el criterio, el vietnamita y el indonesio (auditoría, 3.º y 5.º) van
  antes que el alemán.
- Guardar como DXF (L7, la fase 2 de `docs/next-dxf.md`): hecho y publicado el 12/11/2026
  (`6e75779c`; el push, la comprobación en producción e IndexNow, 741 URLs con respuesta 200, por la
  sesión a petición del dueño). SAVEAS, SAVE y DXFOUT (SALVADXF, EXPDXF, SAUVEDXF) con el cuadro
  Guardar dibujo como de AutoCAD 2027, visto en su escritorio, y sus Opciones DXF; el DXF de 2000 a
  2018, ASCII o binario, que la consola de AutoCAD abre sin un error de AUDIT (36 ficheros). R12
  queda como fase propia. El sitio lo dice en los seis idiomas: Estado, el FAQ, la sección de
  archivos, la página «abrir DXF online» y su FAQ, la de diferencias, el README y el kit de
  lanzamiento (también los 51 correos de `~/seo-data/launch/outreach/`, que decían «sin DWG/DXF»).
  **La primera carga de cada portada**, Brotli q11, del build de `main` a este: `/` 253.822 →
  252.867, `/es` 255.094 → 254.232, `/pt-br` 255.211 → 254.361, `/ar` 278.702 → 277.786, `/fr`
  255.864 → 255.080, `/it` 255.124 → 254.184 bytes. La tecla de DXFOUT en el tablero de comandos
  dejaba `/fr` 58 bytes por encima de los 250 KiB; quitar del tablero la segunda copia, oculta, de
  cada descripción (el lector de pantalla lee ahora la burbuja) bajó todas las portadas por debajo
  de `main`. Las páginas cambiadas, ya rastreables, no entran en la cola de §7: no son nuevas.
- 07c Editar DXF online: hecha y publicada el 12/11/2026 (`d10f5dd3`; el push, la comprobación en
  producción, IndexNow, la cola de §7 y las fichas de AlternativeTo y SaaSHub, por la sesión a
  petición del dueño: §7, puntos 2 y 8). La demanda, medida (autocompletado en once países, Trends,
  Bing Keyword Research y los top 10): editar es de 1/6 a 1/7 de ver («dxf editor» 12 contra «dxf
  viewer» 80 en Trends; «dxf editor online» unas 20 contra «dxf viewer online» 1,7K en Bing), pero
  Google las responde con top 10 casi disjuntos, editores contra visores, y quien manda en las dos
  (Aspose, GroupDocs) tiene una URL por intención. Así que las dos cosas: **`/docs/edit-dxf`**,
  nueva, con el título de lo que busca cada idioma («Free online DXF editor: edit and save DXF
  files», «Editor DXF online gratis: editar y guardar DXF»…), la isla que abre el fichero, editarlo,
  Guardar dibujo como y sus Opciones DXF, lo que guarda y lo que no vuelve, empezar uno de cero y
  seis preguntas; y `/docs/open-dxf` conserva su título de visor (la familia grande) y enlaza la
  nueva. Enlazada desde primeros pasos, la respuesta de DWG y DXF de la portada (las palabras que
  ya decían que guarda) y `llms.txt`. Los datos y la decisión, en `docs/plans/seo/07c-dxf-editar.md`.
  **La primera carga de cada portada**, Brotli q11, del build de `main` a este: `/` 252.909 →
  252.895, `/es` 254.173 → 254.178, `/pt-br` 254.400 → 254.432, `/ar` 277.762 → 277.816, `/fr`
  255.108 → 255.084 (916 bytes bajo 250 KiB), `/it` 254.293 → 254.264. **Ctrl+O en `/draw`**,
  probado con teclas del sistema (XTEST, y SendKeys desde Windows por el RDP de WSLg) en Chrome
  sobre X11, la plataforma del Chrome del dueño: abre el selector de archivos y escribe `_open`;
  no es un fallo nuestro (`07c-dxf-editar.md` §4).
- DXF fase 4, POINT: hecha y publicada el 12/11/2026 (`3fc5500f`; L7, la excepción: el tercer
  objeto que más falta en los DXF reales y la base de dos comandos de la tabla de L3). En
  producción, las 30 páginas (las tres nuevas y abrir y editar un DXF, en los seis idiomas) con su
  título, las 18 nuevas en el sitemap, el FAQ y el tablero de la portada, y DIVIDE, PDMODE y el
  cuadro de PTYPE en `/draw`; IndexNow recibió las 765 URLs y la cola de §7 pasó de 675 a 693. La entidad POINT, PDMODE y PDSIZE,
  POINT, PTYPE y su cuadro Estilo de punto, DIVIDE, MEASURE y la referencia Nodo, en los seis
  idiomas; el DXF en los dos sentidos (`docs/next-dxf.md`, fase 4). DIVIDE y MEASURE salen de la
  tabla de L3. **Páginas de comando nuevas**, con lo que se busca en cada idioma: `divide`
  («Dividir en partes iguales en AutoCAD: comando DIVIDE», «Dividir em partes iguais no AutoCAD»,
  DIVISER, DIVIDI), `measure` («Graduar en AutoCAD: comando GRADUA», MEDIDA, MESURER, MISURA) y
  `ptype` (su entrada llena una: las veinte figuras, el tamaño relativo y absoluto); `-osnap`
  nombra Nodo. Abrir y editar un DXF dicen que los puntos abren y se guardan, y el FAQ de la
  portada los quita de lo que se queda fuera. `gsc-prioritize.mjs`: la auditoría no tiene cifra
  de Trends para DIVIDE ni MEASURE, así que no entran en `COMMANDS` y cuentan con la de por
  defecto. **La primera carga de cada portada**, Brotli q11, del build de `main` a este: `/`
  252.638 → 252.922, `/es` 253.921 → 254.174, `/pt-br` 254.175 → 254.388, `/ar` 277.519 →
  277.735, `/fr` 254.890 → 255.116 (884 bytes bajo 250 KiB), `/it` 254.050 → 254.325: las cuatro
  teclas nuevas del tablero de comandos y la respuesta del FAQ.
- DXF fase 4, SOLID: hecha y publicada el 12/11/2026 (`612220bc`; L7, la excepción, por orden del
  dueño: el objeto que más falta en los DXF reales). El push salió con los dos commits que
  esperaban en `main` (el cuadro de confirmación del push, `ae0ccbdc`, y el orden del roadmap,
  `d7333f4e`). En producción: abrir y editar un DXF dicen en los seis idiomas que los sólidos 2D
  abren y se guardan, el índice de comandos lista SOLID (SOLIDO, SÓLIDO, SOLIDE, POLIG) y `/draw`
  trae sus solicitudes en cada idioma; IndexNow recibió las 765 URLs del sitemap (200), sin páginas
  nuevas que poner en la cola de §7. El sólido 2D y SOLID (`docs/next-dxf.md`, fase 4, y
  `docs/coverage/draw.md`); con él abren enteras 107 de las 154 muestras (antes, 64). **Sin página
  de comando**: «autocad solid fill», «fillmode autocad», «autocad 2d solid» y sus equivalentes en
  España, México, Brasil, Francia e Italia valen 0 en Google Trends frente a «autocad hatch» 71–79
  (y «autocad offset» 12–17); el autocompletado da «solid fill», «relleno sólido» o «rellenar»,
  que son el sombreado SOLID de HATCH, y nada para «sólido 2d autocad» ni «comando solido
  autocad» (`~/seo-data/raw-2026-11-12/solid/`). **La primera carga de cada portada**, Brotli q11,
  del build de `main` a este: `/` 253.042 → 253.253, `/es` 254.460 → 254.520, `/pt-br` 254.586 →
  254.753, `/ar` 278.020 → 278.039, `/fr` 255.258 → 255.405 (595 bytes bajo 250 KiB), `/it`
  254.489 → 254.625. De paso: §7 sin los párrafos repetidos de la 07c, y la tanda del día a Google
  (11, hasta la cuota de las 21:51 UTC; 682 en la cola).
- 10 Medición: la primera, un mes después del push de 01–02.
