# DXF: abrir y guardar como en AutoCAD — brief

> **Estado:** investigación, brief y fase 1 (abrir un DXF con OPEN y DXFIN) hechos y
> publicados el 7/11/2026 (sesión 07 del plan de visibilidad), la fase 3 (la página «abrir DXF
> online», sesión 07b) el 8/11, con la fase 4 ordenada por lo que falta en 731 DXF reales, y la
> fase 2 (guardar como DXF, de 2000 a 2018) y su página, «editar DXF online» (sesión 07c),
> publicadas el 12/11; queda de ella el DXF R12. Siguiente, la fase 4. Se borra cuando la fase 5 esté hecha; hasta entonces cada fase cerrada se marca aquí.

## 1. Objetivo

Que un usuario de AutoCAD abra aquí un DXF y guarde su dibujo como DXF, con los comandos, las
solicitudes y las opciones de AutoCAD 2027: OPEN de un .dxf, DXFIN, SAVEAS al tipo DXF (versiones y
precisión) y DXFOUT, y que cada uno diga con exactitud qué hace con lo que el modelo no tiene. Es la
línea L7 de `docs/next-seo.md`: las familias «dxf viewer online», «abrir dxf online» y «editor dxf
online» son de herramientas (7,5 visores por top 10 de Google), y todos los parecidos ponen el DXF
en su H1.

## 2. Lo que hace AutoCAD 2027

Investigado el 7/11/2026 en la consola (sondas `scripts/research/probes/dxf/`, transcripciones en
`research/probes/dxf/`), el escritorio, las tablas de cadenas y la ayuda.

- **OPEN** abre el cuadro _Select File_ con _Files of type_ «Drawing (*.dwg)», «Standards (*.dws)»,
  «DXF (*.dxf)» y «Drawing Template (*.dwt)» (22504). Con FILEDIA 0, `Enter name of drawing to open
  <.>:`. Al abrir un DXF solo escribe `Regenerating model.`.
- **DXFIN** (es CARGADXF, pt-BR IMPDXF: tablas 52635) es OPEN con el tipo «DXF (*.dxf)»
  preseleccionado (escritorio) y la misma solicitud con FILEDIA 0 (x004, x005). El `acad.pgp` aún
  trae `DXFIN, *OPEN` y `DXFOUT, *SAVEAS` en «Aliases for commands discontinued in AutoCAD 2004»,
  pero el comando nativo gana: tecleados, corren DXFIN y DXFOUT (x007).
- **SAVEAS** abre _Save Drawing As_: _File name_, _Files of type_ (las siete versiones de DWG, DWS,
  DWT y siete de DXF: «AutoCAD 2018 DXF (*.dxf)», «AutoCAD 2013/LT2013 DXF», 2010, 2007, 2004, 2000
  y «AutoCAD R12/LT2 DXF») y el botón _Options_, cuya pestaña _DXF Options_ tiene _Format_ (ASCII o
  Binary), _Select objects_, _Save thumbnail preview image_ y _Decimal places of accuracy (0 to
  16)_. Con FILEDIA 0: `Current file format: AutoCAD 2018 Drawing` / `Enter file format
  [R14(LT98&LT97)/…/2018(LT2018)/Standards/DXF/Template] <2018>:`; tras `DXF`, `Current DXF
  settings: Precision= 16 Format= ASCII Preview= No Version= 2018` / `Enter decimal places of
  accuracy (0 to 16) or [Binary/select Objects/Preview/Version] <16>:` (Version: `[R12(LT2)/2000
  (LT2000)/…/2018(LT2018)] <2018>:`, y vuelve a la precisión; Binary escribe ya) y `Save drawing as
  <Drawing1.dxf>:` (x001, x003).
- **DXFOUT** (es SALVADXF, pt-BR EXPDXF: 52636) abre el mismo cuadro con «AutoCAD 2018 DXF»
  preseleccionado; con FILEDIA 0 pide primero el nombre y luego la precisión (x002). Como SAVEAS,
  el dibujo pasa a llamarse como el DXF. Los ajustes DXF duran la sesión.
- **QSAVE de un dibujo abierto desde un DXF no escribe DXF**: pregunta el formato, DWG 2018 por
  defecto, como SAVEAS (x013). Por eso nuestro QSAVE, que descarga el formato propio, sigue siendo
  coherente tras abrir un DXF.
- **El lector de AutoCAD es estricto** y descarta el dibujo entero, sin que RECOVER lo salve
  (t-*, r-*): sin EOF (`DXF read error on line 23.`), con una entidad o un código de grupo que no
  conoce (`Undefined group code 77 for object on line 22.`), con un grupo obligatorio ausente
  (`Required group 11 not supplied on line 14.`), sin los marcadores de subclase de 2000 en adelante
  (`The following error was encountered while reading` / `in LINE starting at line 16:` / `Class
  separator for class AcDbEntity expected`) o con un número que no lo es; siempre termina en
  `Invalid or incomplete DXF input -- drawing discarded.` (20542), y lo que no es DXF, con
  `Error in drawing header on line 1.` y `<fichero> is not valid DXF file` (20539). Un fichero con
  solo la sección ENTITIES, como los que escriben muchos programas, abre bien.
- **El formato**: de AC1009 (R12) a AC1032 (2018), en ASCII o binario (`AutoCAD Binary DXF\r\n\x1a\0`,
  códigos de 2 bytes; de 1 en R12). Hasta 2004 el texto va en la página de códigos de
  `$DWGCODEPAGE` (ANSI_1252) con `\U+XXXX` para lo que no cabe; desde 2007, UTF-8. Un dibujo de
  una línea ocupa 120 KB en 2018 (los objetos por defecto) y 7,5 KB en R12; 50.000 objetos, 7,1 MB.
- **Cada entidad, como la escribe AutoCAD**: el dibujo de referencia (f001) tiene una de cada tipo
  del modelo y algunas que no tiene; guardado por AutoCAD en las siete versiones y en binario (f002)
  es la base de los tests (`cad/serialization/dxf/fixtures/`).

## 3. Los competidores

Las herramientas parecidas (`~/seo-data/audit-2026-11-05/competitors.md`, `kulmanlab.md`):
KulmanLab importa y exporta DXF AC1032 (y su JSON), sin 3D, con presentaciones e impresión a PDF;
CADCraft, OpenCAD Studio, Open CAD Studio y cadelo dicen DWG y DXF; dxfviewer.app y voltplot son
visores «sin subir el fichero»; ShareCAD, Aspose y GroupDocs suben el fichero a su servidor.

El dibujo de referencia de 2018, el de R12 y el binario, abiertos en tres de ellas el 7/11/2026
(capturas en `~/seo-data/dxf-competitors-2026-11-07/`, fuera del repo): ninguna sube el fichero, y
todas fallan en el texto. **KulmanLab** abre
el ASCII de 2018 y de R12 y avisa de lo que no lee (`Could not read XLINE / RAY / LEADER / 3DSOLID /
REGION`), pero el binario queda en blanco sin aviso, el ANSI31 sale como un relleno pálido, no hay
capas apagadas, y en R12 las cotas valen 0 y `\U+03B1` y los acentos se rompen; exporta DXF sin
elegir versión. **dxfviewer.app** abre los tres, pero es solo un visor: dibuja continuo el tipo de
línea discontinuo, pierde las capas inutilizadas, cambia el color verdadero y rompe la α (y en R12,
la ñ); no exporta DXF. **CADCraft** (Rust en un canvas) abre los tres con la mejor fidelidad de
capas (apagada, inutilizada, bloqueada) y exporta DXF de 2000 a 2018, pero no dibuja ñ, ü ni α y
no avisa de nada. Ninguna trabaja con los comandos de AutoCAD en su idioma (KulmanLab responde con
sus propias solicitudes y su `POL` es polígono).

Lo nuestro: los DXF de AutoCAD R12 a 2018, ASCII y binarios, abiertos en el navegador sin subirlos,
con su texto intacto en cualquier versión, lo que no se puede abrir dicho al abrirlo, y editados con
los comandos, solicitudes y opciones de AutoCAD 2027 en inglés, español o portugués de Brasil.

## 4. Decisiones

- **Primero abrir, luego guardar.** Abrir da más con menos riesgo: OPEN ya usa el selector de
  ficheros del navegador, que es el _Select File_ de AutoCAD, y DXFIN es OPEN con otro tipo; abre la
  familia de búsqueda mayor y es lo que necesitan las páginas «abrir DXF online». Guardar necesita
  el cuadro _Save Drawing As_ con sus tipos, que hoy no existe: SAVEAS descarga directamente el
  formato propio (CLIPBOARD-D4), y la ruta de FILEDIA 0 de SAVEAS ofrece formatos DWG que no
  escribimos.
- **El lector, en `cad/serialization/dxf/`**: puro y sin DOM, como el JSON; recibe los bytes (el
  binario y las páginas de códigos los necesitan) y devuelve un `ParsedDrawing` con un informe de lo
  que se quedó fuera.
- **Tolerante, no estricto como AutoCAD** (desviación anotada en la cobertura): un código de grupo,
  una entidad o un marcador de subclase que no conoce se saltan, un grupo que falta toma su valor
  por defecto o, si sin él no hay objeto, salta el objeto; los ficheros de otros programas que
  AutoCAD rechaza abren aquí. Los mensajes de AutoCAD (20539, 20542) quedan para lo que no es DXF
  o se corta a mitad de una sección, y el dibujo abierto sigue como estaba.
- **Todas las versiones**, de R12 a 2018, ASCII y binarias, y la página de códigos de
  `$DWGCODEPAGE` hasta 2004.
- **Las entidades del modelo** (LINE, CIRCLE, ARC, ELLIPSE, LWPOLYLINE, POLYLINE 2D con su ajuste y
  3D, SPLINE, TEXT, MTEXT, ATTDEF, INSERT con sus ATTRIB, DIMENSION lineal, alineada, angular, radio
  y diámetro, HATCH), con su capa, color, tipo y grosor de línea, plano y altura de objeto. Lo
  demás se queda fuera y se cuenta por tipo en la línea de comandos: POINT, SOLID, XLINE, RAY,
  LEADER, MLEADER, TABLE, las cotas que no hay, las mallas, imágenes, y los ACIS (3DSOLID, REGION,
  BODY, SURFACE: su SAT, fuera hasta `docs/next-solids.md` §6). Tampoco hay presentaciones: lo que
  está en el espacio papel se cuenta aparte.
- **Las tablas**: capas (una inutilizada, apagada: no hay FREEZE), tipos de línea por nombre (los
  del registro dibujan su patrón; otro nombre se conserva y dibuja continuo), estilos de texto y de
  cota (un código ausente vale lo que dice la referencia DXF, los valores imperiales, no ISO-25),
  bloques (los anónimos de las cotas, `*D`, se derivan aquí y se descartan; las referencias
  externas no se cargan). Los colores índice pasan a su RGB con la paleta de AutoCAD y ByBlock a
  ByLayer (el modelo no tiene ninguno de los dos).
- **Las unidades**: `$INSUNITS` milímetros, centímetros o metros pasa al dibujo; pulgadas, pies o
  sin unidad dejan los números como están, en milímetros (el modelo solo tiene esas tres).
- **El puerto**: `FileTransport.open` dice qué tipos acepta y devuelve el nombre y los bytes del
  fichero; un anfitrión que devuelva texto, como hasta ahora, sigue valiendo para el JSON y el DXF
  ASCII en UTF-8.

## 5. Fases

Cada una se entrega terminada (skill `finish-feature`), con su investigación antes.

1. **Abrir un DXF**: OPEN de un .dxf y DXFIN, el lector, el informe, el puerto y los textos del
   sitio que dicen que no abre DXF. **Hecha** (7/11/2026, `4c31ea2c`): el lector en
   `cad/serialization/dxf/`, cargado solo al abrir un DXF; lo que hace y lo que le falta, en la
   entrada de DXFIN de `docs/coverage/clipboard-and-files.md`; el autoguardado, de paso, sin sangrías
   (`f6a4d2c0`).
2. **Guardar como DXF**: el cuadro _Save Drawing As_ (SAVEAS, DXFOUT, Ctrl+Mayús+S) con _File name_,
   los tipos que escribimos y _Options_ (_DXF Options_), y el escritor de 2000 a 2018, ASCII y
   binario, con su precisión y _Select objects_; cada fichero, abierto por AutoCAD en la consola en
   los tests de su desarrollo. R12 convierte lo que R12 no tiene (como hace AutoCAD: una elipse,
   polilínea): fase propia si pesa. Al cerrarla, la página «abrir DXF online», su FAQ y el kit de
   lanzamiento dicen que guarda. **Hecha y publicada** (12/11/2026, `6e75779c`, tras la sesión 09 del
   plan de visibilidad), sin
   R12: el cuadro, visto en el escritorio en inglés (sonda `d01`) y con sus etiquetas de los cinco
   idiomas de AutoCAD; el escritor en `cad/serialization/dxf/writeDxf.ts`, cargado solo al abrir el
   cuadro, cuyos ficheros de los dos dibujos de referencia y de uno de cada clase restante, en las
   seis versiones, ASCII y binarios, abre la consola de AutoCAD 2027 sin un error de AUDIT
   (`scripts/research/probes/dxf/audit.sh`) y traza como los suyos (`plot.sh`); la precisión
   redondea los grupos que redondea AutoCAD (x015, x021). Lo que hace y lo que le falta, en la
   entrada de DXFOUT de `docs/coverage/clipboard-and-files.md`. Queda, como fase propia: R12 (su
   tipo y la versión R12, que convierten lo que R12 no tiene), y las vistas preliminares van con
   la fase 5.
3. **Las páginas «abrir DXF online»** por idioma, en una sesión de contenido (`docs/next-seo.md`).
   **Hecha** (8/11/2026, sesión 07b, `bbeefd64`): `/docs/open-dxf` en los cuatro idiomas, que abre
   en `/draw` el DXF que se elige o se suelta en ella, sin subirlo (`openFile`, `761a6083`); lo que
   afirma es la entrada de DXFIN (`.claude/rules/docs.md`). Con la fase 2, su pareja: `/docs/edit-dxf`
   en los seis idiomas (12/11/2026, sesión 07c, `d10f5dd3`), para «editor dxf online», que Google
   responde con otros resultados; lo que afirma de guardar es la entrada de DXFOUT
   (`docs/plans/seo/07c-dxf-editar.md`). Ctrl+O abre el selector en `/draw` con un teclado de
   verdad (su §4).
4. **Lo que más falta en los DXF reales**, en el orden medido el 8/11/2026 (sesión 07b) abriendo
   con el lector los 154 dibujos de muestra de AutoCAD 2027 (su carpeta `Sample`, guardados como
   DXF 2018 por la consola) y 577 DXF de otros programas (la biblioteca de piezas de LibreCAD, los
   ficheros de prueba de ezdxf, dxf-parser y OpenSCAD, y cinco de Inkscape). Todos abren: de las
   muestras, 45 enteras, y de los otros, 552; la más grande (6,8 MB, 12.944 objetos) se lee en
   0,15 s. Los ficheros y el script que los mide, en `research/dxf-corpus/` (fuera de git, con su
   README), para medir otra vez tras cada entrega. Cada uno, con su comando cuando lo haya:
   1. **SOLID**: en 67 de las 154 muestras (2.831 objetos: flechas y rellenos de bloques
      antiguos).
   2. **LEADER** (22 muestras, 823 objetos) y MLEADER (1 muestra y 2 ficheros de otros).
   3. **POINT** y PDMODE: 20 muestras y 18 ficheros de otros (16 piezas de LibreCAD, el
      levantamiento de un medidor láser Leica DISTO).
   4. **Los tipos de línea del dibujo**, su tabla LTYPE: ACAD_ISO02W100 a ISO09W100 (de 6 a 12
      muestras cada uno), los escalados (HIDDEN2, CENTER2, DASHED2…), DOT, los nombres del
      `acadiso.lin` español y brasileño (OCULTO, PONTOS, HÍFEN) y los complejos (BATTING, GAS,
      ZIGZAG); en LibreCAD, los K5LT de un conversor (27 piezas). Hoy dibujan continuo. Es una
      tabla por dibujo, no más entradas en el registro de los seis, que saldrían en todos los
      selectores con un nombre en cada catálogo.
   5. **Las referencias externas**: 16 muestras (los planos de los conjuntos de planos tienen su
      modelo en referencias).
   6. **El patrón de cada sombreado**: un DXF trae las líneas de cualquier patrón (53, 43–46, 79,
      49), y dibujarlas del fichero cubre los que no están entre los 24 (HOUND, GRASS, INSUL), los
      definidos por el usuario (`_USER`, `U`: 9 muestras) y los propios de cada programa. Los
      degradados (6 muestras, 144 sombreados), aparte.
   7. 3DFACE (8 muestras), WIPEOUT (3), IMAGE (1, y 1 de otros), TABLE (las de las muestras están
      en presentaciones; 1 de otros), y sin ningún caso medido XLINE, RAY, MINSERT como tal, los
      colores índice como tales y las sustituciones de estilo de cada cota (XDATA `DSTYLE`).

   Y **las presentaciones**: 20 de las 154 muestras no tienen nada en el espacio modelo (47 tienen
   algo en una presentación) y abren vacías, con la línea que cuenta lo que no se abrió. Arreglado
   de paso (`242d031f`): lo que sigue a EOF no se lee, como lo abre AutoCAD, y un patrón con su
   código de estilo (`ANSI31,_O`, 5 muestras) dibuja su relleno.
5. **El resto**: el informe de lo que se pierde al guardar, las vistas preliminares, ACIS con los
   sólidos.

## 6. Riesgos

- **Los DXF reales traen lo que no tenemos**: se ve como objetos ausentes. El informe lo dice al
  abrir y la fase 4 cierra primero lo más común.
- **Tamaño**: medido en la fase 1 con un DXF de AutoCAD de 50.000 objetos (7,1 MB), que se lee en
  0,2 s, se carga en 0,03 y se dibuja en 0,03. El autoguardado vive en `localStorage` (unos 5 MB) y
  falla en silencio con un dibujo mayor: con sangrías ese dibujo ocupaba 10,8 MB, y desde la fase 1
  se guarda sin ellas, 5,5 MB, unos 110 caracteres por objeto. Uno mayor abre, pero no sobrevive a
  recargar la página sin guardarlo, y la barra no lo dice: avisar de ese fallo, o guardar en
  IndexedDB, queda para cuando un DXF real lo pida.
- **Las fuentes**: el texto se mide con las métricas de Arial; un SHX se ve con otra letra.
- **Lo estricto de AutoCAD**: abrir aquí lo que AutoCAD rechaza es útil, pero ese dibujo, guardado
  en la fase 2, debe salir válido.
