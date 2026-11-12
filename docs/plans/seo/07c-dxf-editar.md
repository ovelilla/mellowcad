# Sesión 07c — Editar un DXF online: la página

> Hecha el 12/11/2026, tras publicar guardar como DXF (`6e75779c`). Línea L7 de
> `docs/next-seo.md`; lo que la página afirma sale de las entradas de DXFIN y DXFOUT de
> `docs/coverage/clipboard-and-files.md` (`.claude/rules/docs.md`, «The DXF pages»).

## 1. La demanda (12/11/2026)

Medida, no recordada. Los ficheros, en `~/seo-data/raw-2026-11-12/edit-dxf/` (fuera del repo):
`autocomplete.jsonl`, `bing-keyword-research.json`, `trends.jsonl`, `serps.jsonl` y los scripts
que los sacaron.

**Google Trends** (12 meses; cada fila, una comparación de hasta cinco términos, 100 = el máximo
de esa fila):

| Dónde | Ver / abrir | Editar | Otros |
| --- | --- | --- | --- |
| Mundo | «dxf viewer» 80, «dxf viewer online» 23 | «dxf editor» 12, «edit dxf» 4, «dxf editor online» 1 | — |
| EE. UU. | «dxf viewer» 19 | «edit dxf» 1, «dxf editor» 0 | «dxf to pdf» 50, «create dxf» 6 |
| India | «dxf viewer» 30 | «edit dxf» 1 | «dxf to pdf» 67 |
| España | «abrir dxf» 4, «visor dxf» 1 | «editar dxf» 0, «editor dxf» 0 | «crear dxf» 0 |
| México | «abrir dxf» 1 | «editar dxf» 2 | — |
| Brasil | «abrir dxf» 7 | «editor dxf» 2 | — |
| Francia | «ouvrir dxf» 3 | «editeur dxf» 0, «modifier dxf» 0 | «fichier dxf» 25 |
| Italia | «aprire dxf» 2, «visualizzatore dxf» 1 | «modificare dxf» 0 | «file dxf» 55 |
| Egipto | — | «تعديل ملف dxf» 0 | «ملف dxf» 2 |

**Bing Keyword Research** (3 meses, mundial, con la sesión del dueño): «dxf viewer» 13,5K, «dxf
file» 3,1K, «dxf converter» 3,1K, «dxf to pdf» 1,8K, «dxf viewer online» 1,7K, «dxf editor» 329,
«fichier dxf» 258 (Francia 197), «dxf online» 112, «open dxf online» 42, «dxf editor online» unas
20 (EE. UU. 12, España 5, India 4). Las demás consultas de editar, en cualquier idioma, no llegan
al umbral de Bing; su top 10 sí sale: editdxf.com, Aspose `/3d/editor/dxf`, dxfdraw.com,
cadautoscript, AICADGIS, KulmanLab, can-cut.

**Autocompletado de Google** (por país, cada semilla sola y con « a» a « z»):

- **en** (EE. UU., Reino Unido, India): «dxf editor online free», «edit dxf online free», «modify
  dxf online», «online dxf editor free», «edit dxf file online (free)», «create dxf online free»,
  «create dxf file free online», «open and edit dxf file online», «can you edit a dxf file», «how
  to edit dxf files», «aspose online dxf editor».
- **es** (España, México, Argentina, Colombia): «editor dxf online gratis» en los cuatro,
  «editar dxf online gratis», «editar archivo dxf online», «editar dxf en linea» (México,
  Colombia), «modificar archivo dxf», «crear archivo dxf», «como editar dxf» (Argentina).
- **pt-BR**: «editor dxf online gratis», «editar dxf online gratis», «editar arquivo dxf online»,
  «criar arquivo dxf online»; «modificar dxf online» solo completa a PDF.
- **fr** (Francia, Bélgica, Marruecos): «éditeur dxf en ligne», «éditeur dxf gratuit», «modifier
  (fichier) dxf en ligne», «créer un fichier dxf en ligne», «dessin dxf en ligne», «logiciel dxf
  gratuit en ligne».
- **it**: «editor dxf online gratis», «modificare dxf online gratis», «modificare file dxf
  online», «creare file dxf online», «dxf online editor».
- **ar** (Egipto, Arabia Saudí): nada de editar en árabe («تعديل ملف dxf», «محرر dxf» y «انشاء
  ملف dxf» no completan); «فتح ملف dxf اون لاين», «برنامج تصميم dxf» y, en inglés, «dxf online
  editor».

**Los top 10 de Google** (12/11/2026, en el Chrome del dueño, `gl` y `hl` de cada país; título del
resultado y H1 de la página):

| Consulta | Quién | H1 que posiciona |
| --- | --- | --- |
| «dxf editor online» (EE. UU.) | SmartCAD, KulmanLab, AICADGIS, cad-editor.com, can-cut, DWG FastView, Aspose, ShareCAD, ZWSoft (listado) | «Free CAD Online & DXF Editor in your browser» (KulmanLab), «Free Web-Based DXF Editor» (AICADGIS), «Free Online Editor for DXF Files» (Aspose) |
| «edit dxf online» (EE. UU.) | los mismos, y smartcad.app | ídem |
| «editor dxf online» (España) | Aspose `/es/editor/dxf` n.º 1, SmartCAD, AICADGIS, cad-editor, ShareCAD, can-cut, DWG FastView, smartcad.app, GroupDocs (metadatos) | «Editor en línea gratuito para archivos de DXF» |
| «editar dxf online» (México) | AICADGIS n.º 1, cad-editor, Aspose, SmartCAD, can-cut, mnki.ai | «Editor DXF online gratuito» (título de AICADGIS) |
| «editor dxf online» (Brasil) | Aspose `/pt/editor/dxf` n.º 1, AICADGIS, cad-editor, ShareCAD, can-cut, ACCA (visor) | «Editor online gratuito para arquivos DXF» |
| «éditeur dxf en ligne» (Francia) | Aspose `/fr/editor/dxf` n.º 1, KulmanLab `/fr/`, GroupDocs y Conholdate (metadatos), SmartCAD | «Éditeur en ligne gratuit pour les fichiers DXF» |
| «editor dxf online» (Italia) | Aspose `/it/editor/dxf` n.º 1, AICADGIS, cad-editor, can-cut, GroupDocs | «Editor online gratuito per file DXF» |
| «تعديل ملف dxf اون لاين» (Egipto) | online-convert, SmartCAD, Aspose `/ar/editor/dxf`, AICADGIS, KulmanLab `/ar/` | «محرر DXF ثنائي الأبعاد مجاني عبر الإنترنت في متصفحك» (KulmanLab) |
| «create dxf online» (EE. UU.) | can-cut n.º 1, SmartDraw, KulmanLab, un generador con IA, cad-editor, Onshape, convertidores | — |
| «crear dxf online» (España) | convertidores de imagen a DXF, KulmanLab n.º 3, un tutorial de Onshape | — |
| «dxf viewer online» (EE. UU.) | ShareCAD, Autodesk Viewer, dwgsee, voltplot, filestash, GroupDocs, eMachineShop, swyvl | «Free online DXF viewer», «Online DXF Viewer» |
| «abrir dxf online» (España) | ShareCAD, GroupDocs `/es/viewer/dxf`, allinpdf, filestash, imagetostl, Autodesk Viewer | «Ver DXF en línea», «Visor DXF online» |

## 2. La decisión: las dos cosas, sin que compitan

- **Una página nueva, `/docs/edit-dxf`** (slug inglés, `.claude/rules/i18n.md`), para editar,
  modificar y crear un DXF y guardarlo otra vez. Google responde a «editor dxf online» y a «dxf
  viewer online» / «abrir dxf online» con resultados casi disjuntos (solo ShareCAD y DWG FastView
  están en los dos) y con H1 distintos: editores contra visores. Los que mandan en las dos
  familias (Aspose, GroupDocs) tienen una URL por intención y formato (`/editor/dxf`,
  `/viewer/dxf`). Una página que quisiera las dos no tendría el H1 de ninguna.
- **`/docs/open-dxf` conserva su título de visor**: es la familia grande (Trends 80 contra 12;
  Bing 1,7K contra unas 20 en «… online») y está en la cola de indexación desde el 8/11. Se
  amplía hacia la nueva en vez de retitularse: su sección «Edit it and keep it» y su pregunta de
  guardar resumen y enlazan `/docs/edit-dxf`, que es la que cuenta el cuadro, las versiones y lo
  que se pierde. Ninguna lleva las palabras de la otra en el título.
- **Crear un DXF no tiene página propia**: su top 10 es de convertidores de imagen a DXF (otra
  intención) y las herramientas que dibujan (can-cut, KulmanLab, SmartDraw) posicionan con la
  portada. Va como sección y pregunta de la página de editar.
- **Los títulos** dicen primero lo que se busca en cada idioma, con «gratis» y la acción:
  «Free online DXF editor: edit and save DXF files», «Editor DXF online gratis: editar y guardar
  DXF», «Editor DXF online grátis: editar e salvar DXF», «Éditeur DXF en ligne gratuit : modifier
  un DXF», «Editor DXF online gratis: modificare file DXF» y, sin datos en árabe, el patrón de los
  H1 árabes que posicionan, «محرر DXF أون لاين مجاني: عدّل ملف DXF واحفظه». Las notas de cada
  idioma, en «Search texts» de `docs/i18n/<tag>.md`.
- **Qué afirma**: lo de las entradas de DXFIN y DXFOUT y nada más. Guarda DXF de 2000 a 2018,
  ASCII o binario, con el cuadro Guardar dibujo como y sus Opciones DXF; AutoCAD 2027 abrió sin
  error de AUDIT cada clase de objeto en cada versión; lo que no se abrió no se guarda, ni los
  sólidos 3D ni las regiones, ni las modificaciones de estilo de cada cota ni los parámetros de
  una matriz; sin miniatura, sin R12, sin DWG.
- **Enlaces internos**: la página de abrir (dos enlaces), primeros pasos («que GUARDARCOMO vuelve a
  guardar como DXF»), la respuesta de DWG y DXF del FAQ de la portada (las palabras que ya decían
  que guarda DXF, ahora enlace) y, con ella, `llms.txt`; la navegación tras «abrir», el sitemap con
  hreflang (los dos, solos desde `USE_PAGES`).

## 3. La primera carga de cada portada

Brotli q11 de todo lo que carga la primera visita (HTML, CSS, JS, fuentes), en builds de
producción locales, Chrome a 1366×768; el método reproduce a ±110 bytes las cifras de §8.

| Build | `/` | `/es` | `/pt-br` | `/ar` | `/fr` | `/it` |
| --- | --: | --: | --: | --: | --: | --: |
| `main` (`13a593e2`) | 252.909 | 254.173 | 254.400 | 277.762 | 255.108 | 254.293 |
| esta rama | 252.895 | 254.178 | 254.432 | 277.816 | 255.084 | 254.264 |

De −29 a +54 bytes: el enlace nuevo de la respuesta del FAQ no pesa. `/fr` sigue la más justa, 916
bytes bajo los 256.000 de 250 KiB.

## 4. Ctrl+O en `/draw`, con un teclado de verdad

La sesión anterior solo vio el selector de archivos con OPEN escrito. Probado sobre el build de
producción de `main`, en un Chrome con perfil limpio sobre X11 (XWayland, la plataforma del Chrome
del dueño en WSLg), con las teclas enviadas por el sistema y no por CDP: con XTEST (libXtst) y
desde Windows (`WScript.Shell.SendKeys`, que entra por el RDP de WSLg como el teclado). En los dos
casos la página recibe `keydown` de confianza (`isTrusted`), lo previene, el historial escribe
`_open` y se abre la ventana nativa «Open File» (vista en la lista de ventanas de X; Escape la
cierra y OPEN termina sin abrir nada). **No es un fallo nuestro.** La única vez que no se abrió,
la ventana de Chrome aún no tenía el foco del teclado: no llegó a la página ninguna tecla, tampoco
Escape. El teclado emulado de Playwright también lo abre, con ventana y sin ella: lo que vio la
sesión anterior no se reproduce, y lo más probable es lo mismo, una página sin el foco del
teclado.
