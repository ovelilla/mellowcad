# DXF: abrir y guardar como en AutoCAD — brief

> **Estado:** investigación, brief y fase 1 (abrir un DXF con OPEN y DXFIN) hechos y
> publicados el 7/11/2026 (sesión 07 del plan de visibilidad), la fase 3 (la página «abrir DXF
> online», sesión 07b) el 8/11, con la fase 4 ordenada por lo que falta en 731 DXF reales, y la
> fase 2 (guardar como DXF, de 2000 a 2018) y su página, «editar DXF online» (sesión 07c),
> publicadas el 12/11; queda de ella el DXF R12. La fase 4 empezó el 12/11 con POINT (y PDMODE,
> PDSIZE, PTYPE, DIVIDE, MEASURE y la referencia Nodo), publicado ese día, y siguió con SOLID,
> hecho y publicado el 12/11, que llevó las muestras enteras de 64 a 107 de 154, y con LEADER,
> hecho y publicado el 13/11, que las llevó a 121; el alemán (`docs/next-seo.md`, L8), hecho y
> publicado el 13/11, y el punto 4 de la fase 4 (los tipos de línea del dibujo, su tabla LTYPE),
> hecho y publicado el 13/11, y el ruso (`docs/next-seo.md`, L8), hecho y publicado el 13/11;
> y el punto 5 (las referencias externas), hecho el 16/11 y publicado el 17/11, que llevó las muestras
> sin nada fuera de 121 a 135 de 154, y el punto 6 (el patrón de cada sombreado), hecho y
> publicado el 17/11, que dibuja como AutoCAD 445 sombreados de 27 muestras; y el checo
> (`docs/next-seo.md`, L8), hecho y publicado el 17/11; y los degradados (el punto 6b), hechos
> y publicados el 17/11, que llevaron las muestras sin nada fuera de 135 a 141 de 154, y del
> punto 7 3DFACE, hecho y publicado el 17/11, que las llevó a 148, y WIPEOUT, hecho el 19/11 (sin
> publicar: el push está congelado), que las llevó a 151, después del húngaro (`docs/next-seo.md`,
> L8), hecho el 19/11, e IMAGE, hecho el 19/11 (sin publicar), que las llevó a 152 y los ficheros
> de otros a 574; siguiente, por orden del dueño, lo que quede del punto 7 (TABLE, MULTILEADER…),
> y después otro idioma, alternando, una sesión cada vez.
> Se borra cuando la fase 5 esté hecha; hasta entonces cada fase cerrada se marca aquí.

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
  demás se queda fuera y se cuenta por tipo en la línea de comandos: XLINE, RAY,
  LEADER, MLEADER, TABLE, las cotas que no hay, las mallas, imágenes, y los ACIS (3DSOLID, REGION,
  BODY, SURFACE: su SAT, fuera hasta `docs/next-solids.md` §6). Tampoco hay presentaciones: lo que
  está en el espacio papel se cuenta aparte.
- **Las tablas**: capas (una inutilizada, apagada: no hay FREEZE), tipos de línea por nombre (los
  del registro dibujan su patrón; otro nombre se conserva y dibuja continuo), estilos de texto y de
  cota (un código ausente vale lo que dice la referencia DXF, los valores imperiales, no ISO-25),
  bloques (los anónimos de las cotas, `*D`, se derivan aquí y se descartan; una referencia
  externa se conserva como la abre AutoCAD cuando no encuentra su dibujo: fase 4, punto 5). Los colores índice pasan a su RGB con la paleta de AutoCAD y ByBlock a
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
      antiguos). **Hecho y publicado** (12/11/2026, `612220bc`): el sólido 2D (relleno según FILLMODE solo visto en
      planta, designado como área o, con FILLMODE desactivado, por sus aristas; un pinzamiento por
      esquina; Propiedades con Vértice actual, Elevación y Altura de objeto; las transformaciones,
      STRETCH, LIST y REGION) y SOLID con sus solicitudes, su lazo y su triángulo con Intro, en los
      seis idiomas (consola, tablas 20607–20610, escritorio; sondas `solid2d/`); el DXF en los dos
      sentidos, que la consola de AutoCAD abre sin un error de AUDIT en las seis versiones, ASCII y
      binario, y traza como el suyo. TRACE solo se anota: en AutoCAD 2027 TRACE es la función de
      marcas y ninguno de los 731 ficheros tiene uno. El corpus, medido otra vez: abren los 2.831
      SOLID de las muestras y los 8 de 2 ficheros de otros; muestras que abren enteras, de 64 a
      107, y ficheros de otros, de 570 a 572; los rellenos de los bloques antiguos se ven como en
      el trazado de AutoCAD (DesignCenter_Plant_Process). Sin página de comando: «solid», «2d
      solid», «relleno sólido» y «fillmode» valen 0 en Trends en los siete mercados frente a
      «autocad hatch» 71–79, y «solid fill» es el sombreado SOLID de HATCH (datos en
      `~/seo-data/raw-2026-11-12/solid/`). Lo que hace y le falta, en `docs/coverage/draw.md`.
   2. **LEADER** (22 muestras, 823 objetos) y MLEADER (1 muestra y 2 ficheros de otros). **LEADER
      hecho y publicado** (13/11/2026, `f17f119e`): la directriz (sus vértices con el gancho, la flecha cerrada rellena de
      DIMASZ × DIMSCALE, dibujada solo si el primer tramo mide al menos el doble, el spline, la
      línea bajo el texto con DIMTAD 1, las sustituciones DSTYLE que su paleta muestra) asociada a
      su MTEXT o bloque, que sigue en el mismo paso cuando se mueve, gira, escala o borra el texto,
      y que COPY y los demás copian en pareja; LEADER con sus solicitudes, Formato, Deshacer y las
      anotaciones Copiar, Ninguna y Textom (el editor en sitio) en los seis idiomas (consola,
      tablas AcDimRes 5507–5533, escritorio; sondas `leader/`); pinzamientos, Propiedades,
      transformaciones, STRETCH, EXPLODE y LIST como los de AutoCAD. El DXF en los dos sentidos con
      su texto (340 y ACAD_REACTORS, las sustituciones como DSTYLE): la consola abre los 12 ficheros
      (seis versiones, ASCII y binario) sin un error de AUDIT, los lee asociados (mover el texto
      arrastra la directriz) y los traza como los suyos. El corpus, medido otra vez: abren las 823
      directrices de las 22 muestras y las muestras enteras pasan de 107 a 121; los ficheros de
      otros, 572 de 577 (ninguno tenía directrices). Se anotan: MLEADER y QLEADER (MULTILEADER es
      otro objeto, con su tabla MLEADERSTYLE: 1 muestra y 4 objetos de 2 ficheros de otros), y las
      anotaciones Tolerancia (no hay objeto TOLERANCE) y Bloque. Con página de comando,
      `/docs/commands/leader` en los seis idiomas: «autocad leader» vale 13 en Trends en el mundo
      y 18 en EE. UU., como «autocad offset» (12–17), y el autocompletado español pide su nombre
      inglés («comando directriz en ingles autocad»); los términos localizados, MLEADER y QLEADER
      valen 0 (`~/seo-data/raw-2026-11-13/leader/`). Lo que hace y le falta, en
      `docs/coverage/dimensions.md`.
   3. **POINT** y PDMODE: 20 muestras y 18 ficheros de otros (16 piezas de LibreCAD, el
      levantamiento de un medidor láser Leica DISTO). **Hecho** (12/11/2026): la entidad POINT,
      PDMODE y PDSIZE (sus figuras medidas en el escritorio de AutoCAD 2027), POINT, PTYPE y su
      cuadro Estilo de punto, DIVIDE, MEASURE y la referencia Nodo, en los seis idiomas; el DXF en
      los dos sentidos, con `$PDMODE` y `$PDSIZE`, que la consola de AutoCAD abre sin un error de
      AUDIT en las seis versiones, ASCII y binario. El corpus, medido otra vez: los 101 puntos de 20
      muestras y los 49 de 18 ficheros de otros abren; muestras que abren enteras, de 54 a 64, y
      ficheros de otros, de 554 a 570. De paso, Guardar dibujo como propone el nombre del fichero
      abierto o del último DXF guardado, como AutoCAD (escritorio point/d01). Lo que hace y le falta,
      en `docs/coverage/draw.md` y `drafting-aids.md`.
   4. **Los tipos de línea del dibujo**, su tabla LTYPE: ACAD_ISO02W100 a ISO09W100 (de 6 a 12
      muestras cada uno), los escalados (HIDDEN2, CENTER2, DASHED2…), DOT, los nombres del
      `acadiso.lin` español y brasileño (OCULTO, PONTOS, HÍFEN) y los complejos (BATTING, GAS,
      ZIGZAG); en LibreCAD, los K5LT de un conversor (27 piezas). **Hecho y publicado**
      (13/11/2026, `4240632d`): una tabla por dibujo, como la LTYPE de AutoCAD (nombre, sin
      distinguir mayúsculas; descripción de 47 caracteres; las longitudes de AutoCAD, con
      puntos y huecos, y el texto y las formas de un complejo), guardada en el fichero (versión
      53) y en el DXF de R12 a 2018 (74/75/340/46/50/44/45/9, el estilo del texto y el STYLE del
      fichero de formas por handle). Los seis que trae todo dibujo, con sus nombres de
      acadiso.lin (DASHED…) y su WHY reescrito: los desplegables no tienen «Otro…» ni hay
      Administrador de tipos de línea; los demás se cargan de acadiso.lin (sus 59, citados) o de
      acad.lin (en pulgadas). -LINETYPE con Cargar, Definir que carga de acadiso.lin y `?` que
      pide el fichero; PURGE con tLíneas; CHPROP con Escalatl y su Tlínea que carga de acad.lin;
      la escala de cada objeto (DXF 48, CELTSCALE, la fila Escala de tipo de línea de la paleta;
      un sólido 3D se queda en 1), en los seis idiomas (consola de AutoCAD 2027, tablas de cadenas;
      sondas `ltype/`). El texto de un complejo (GAS_LINE, HOT_WATER_SUPPLY, CLF) se dibuja como lo
      traza AutoCAD (p14, p15: nuestro render y su trazado coinciden); las formas no (falta el
      SHX). La consola de AutoCAD abre los 12 ficheros del dibujo de tipos de línea sin un error
      de AUDIT y lee GAS_LINE y BATTING como sus propios registros, y los 60 de referencia
      anteriores siguen limpios. El corpus: enteras, 121 de 154 muestras y 572 de 577 ficheros de
      otros, como antes (ningún tipo de objeto nuevo); con tipos de línea que AutoCAD dibuja de
      otro modo, de 52 muestras a 3 (solo formas: BATTING, ZIGZAG) y de 28 ficheros de otros a 0.
      En producción, un DXF de AutoCAD con ACAD_ISO02W100 y HIDDEN2 abierto en `/draw` dibuja sus
      guiones. Lo que hace y le falta, en `docs/coverage/properties.md` (Linetypes, CHPROP, la
      paleta), `modify.md` (PURGE) y `clipboard-and-files.md` (DXFIN, DXFOUT).
   5. **Las referencias externas**: 16 muestras (los planos de los conjuntos de planos tienen su
      modelo en referencias). **Hecho** (16/11/2026, publicado el 17/11): una referencia externa se abre
      como la abre AutoCAD 2027 cuando no encuentra su dibujo junto al fichero, que en el
      navegador es siempre (una página solo lee el fichero que se le da: WHY en la entrada de
      DXFIN). Dice sus dos líneas al abrir (`Resolve Xref "part": <ruta>`, `"part.dwg" cannot be
      found.`, acdb 7172/7174/7235, en los seis idiomas de sus consolas), se conserva y se dibuja
      como el texto que AutoCAD pone en su lugar (`Xref <ruta>`, acdb 7211, altura 2,5 sea cual sea
      TEXTSIZE o las unidades, en Standard, que la referencia mueve, escala, estira y refleja:
      medido con EXTMIN/EXTMAX y TEXTBOX en la consola, sondas `xref/p04`–`p06`, `p16`); EXPLODE
      (`1 was an external reference.`), -INSERT (`** Error: Cannot INSERT an Xref…`), -BLOCK
      (`"part" is an Xref. It cannot be redefined.`, y su `?`, `Xref: not found` contada en
      External References) y LIST (`External reference`) responden como AutoCAD (`p08`–`p15`,
      `p17`), PURGE la borra si nadie la usa y COPY la copia, como allí; la paleta Bloques no la
      ofrece. Se guarda en el fichero propio (versión 54) y DXFOUT la escribe como el DXFOUT de
      AutoCAD guarda una que no encontró (el BLOCK vacío con el indicador 4 y su ruta): la consola
      abre los 12 ficheros (seis versiones, ASCII y binario) sin un error de AUDIT, la lee como suya
      y, con el dibujo de vuelta a su lado, la carga (`"part" loaded.`). El corpus, medido otra
      vez: muestras sin nada fuera, de 121 a 135 de 154 (14 de ellas con referencias, abiertas
      como las abre AutoCAD sin sus ficheros; las otras 2 tienen además 3DFACE o WIPEOUT); ficheros
      de otros, 572 de 577, como antes (ninguno tiene referencias). Quedan anotados XREF y -XREF,
      la paleta Referencias externas que AutoCAD abre en ese caso (la consola corre
      EXTERNALREFERENCES; el escritorio, un cuadro de tareas), XREFNOTIFY y XCLIP. Lo que hace y le
      falta, en `docs/coverage/clipboard-and-files.md` (DXFIN, DXFOUT), `modify.md` (EXPLODE),
      `draw.md` (BLOCK, INSERT) e `inquiry.md` (LIST); las páginas «abrir DXF online» y «editar
      DXF online», en los ocho idiomas, ya no la cuentan entre lo que queda fuera.
   6. **El patrón de cada sombreado**: un DXF trae las líneas de cualquier patrón (53, 43–46, 79,
      49), y dibujarlas del fichero cubre los que no están entre los 24 (HOUND, GRASS, INSUL), los
      definidos por el usuario (`_USER`, `U`: 9 muestras) y los propios de cada programa. Los
      degradados (6 muestras, 144 sombreados), aparte. **Hecho y publicado** (17/11/2026): un
      sombreado guarda las líneas de su patrón cuando no son las del registro (el tipo, 76, y las
      líneas, 78…49, pasadas a unidades del patrón) y se dibuja con ellas, como AutoCAD dibuja el
      que tiene (consola, sondas `hatchpat/`: un MYPAT personalizado que AutoCAD no tiene y un `_U`
      se trazan igual que los suyos); una Escala o un Ángulo nuevos lo leen otra vez como
      -HATCHEDIT (el que AutoCAD no encuentra conserva lo dibujado, p02, p05; uno de acadiso.pat
      vuelve al registro, p04; uno definido por el usuario se rehace de su intervalo), MATCHPROP
      como el de AutoCAD (p07, p08), EXPLODE lo convierte en líneas, LIST nombra `_U` con la letra
      de cada idioma y su intervalo (p06u), la paleta dice su Tipo (ax26res 84) y DXFOUT lo
      escribe con 76 y 77: la consola abre los 12 ficheros sin un error de AUDIT y los traza como
      el suyo. El corpus: los 37 sombreados de 11 muestras que no dibujaban su patrón (HOUND,
      GRASS, INSUL, P1, `_USER`, `U`, `_U`) lo dibujan, y con ellos 408 que se dibujaban con las
      líneas de acadiso.pat donde el fichero trae las de acad.pat, en pulgadas, 25,4 veces más
      juntas (ANSI31, STEEL, AR-CONC… en dibujos métricos): 445 de 27 muestras, y 18 ANSI31 de 2
      ficheros de otros. Las muestras sin nada fuera siguen en 135 (el patrón nunca se contó como
      fuera). Los degradados son otro relleno (450, colores, sin líneas): el punto 6b. Se anotan: las filas Espaciado y Doble de la paleta y su Escala de uno definido por
      el usuario (sin escritorio), y que un patrón de acadiso.pat que no traemos (HOUND) conserva
      sus líneas al cambiar de escala, donde AutoCAD lo lee otra vez. Lo que hace y le falta, en
      `docs/coverage/draw.md` (HATCH), `clipboard-and-files.md` (DXFIN, DXFOUT) e `inquiry.md`.
   6b. **Los degradados**: 6 muestras, 144 sombreados (las flechas y etiquetas de los bloques de
      anotación). **Hechos y publicados** (17/11/2026): el sombreado guarda su degradado (los nueve
      nombres de AutoCAD, dos colores o uno con su tinte, el ángulo y Centrado; fichero versión 56)
      y se dibuja como lo traza AutoCAD, medido píxel a píxel en sus trazados (sondas
      `gradient/g03`–`g06`): sobre la extensión del contorno, mezclado en RGB, el coseno de un cuarto
      de vuelta muestreado en cuartos; LINEAR, CYLINDER y CURVED a lo largo de la extensión girada,
      SPHERICAL y HEMISPHERICAL sobre el cuadrado del lado mayor sin girar; cada nombre centrado, en
      un rectángulo ancho, alto, girado y en un círculo, a menos de 0,015 del rango de color, y
      nuestro dibujo del fichero de AutoCAD con doce (g16) a 0,012 de su trazado. La escena lleva el
      degradado como marco afín y paradas de color (`SceneGradient`), que canvas y SVG pintan con
      sus degradados. ROTATE y MIRROR no cambian su ángulo, una referencia de bloque lo gira con el
      bloque y EXPLODE de ella deja el del bloque (g08–g10); EXPLODE del sombreado dice `Cannot
      explode HATCH`, MATCHPROP lo copia entero (g14), LIST lo dice en los nueve idiomas de sus
      consolas (g11, g13) y la paleta muestra sus filas (ax26res 322–329, sin escritorio:
      **no verificadas**). DXFOUT lo escribe como AutoCAD desde 2004 y, en 2000, como el suyo: un
      SOLID con los colores en xdata (g15); la consola abre los 12 ficheros sin un error de AUDIT, los
      lee como sus degradados y los traza como el suyo (g17). De paso, un objeto invisible (60 1)
      no se abre: son los estados ocultos de los bloques dinámicos, 13.793 en 43 muestras, que se
      dibujaban amontonados sobre el visible (las flechas de los bloques de anotación). El corpus:
      abren los 144 degradados; muestras sin nada fuera, de 135 a 141 de 154; ficheros de otros,
      572 de 577, como antes (ninguno tiene degradados). Se anotan: crearlos con -HATCH (su opción
      Gradient, con los nombres de degradado traducidos en cada idioma y el tinte de un color, que
      AutoCAD deriva con un redondeo propio) y la pestaña de HATCH; CURVED sin centrar en una caja
      ancha, por una regla no hallada; la paleta en el escritorio. Lo que hace y le falta, en
      `docs/coverage/draw.md` (HATCH), `clipboard-and-files.md` (DXFIN, DXFOUT), `modify.md`
      (EXPLODE, MATCHPROP) e `inquiry.md` (LIST); las páginas «abrir DXF online» ya no los cuentan
      entre lo que queda fuera.
   7. 3DFACE (8 muestras), WIPEOUT (3), IMAGE (1, y 1 de otros), TABLE (las de las muestras están
      en presentaciones; 1 de otros), y sin ningún caso medido XLINE, RAY, MINSERT como tal, los
      colores índice como tales y las sustituciones de estilo de cada cota (XDATA `DSTYLE`).
      **3DFACE hecho y publicado** (17/11/2026): la cara 3D (cuatro esquinas en el SCU con su Z,
      un triángulo repite la tercera, y sus aristas ocultas, DXF 70; fichero versión 57) y 3DFACE
      con su Invisible, en los nueve idiomas de consola (sondas `face3d/f00`–`f13`; tablas
      20611–20615; nombres de la ayuda y de cada acad.pgp: es 3DCARA, pt-BR y fr FACE3D, pl 3WPOW).
      Se dibuja, designa y engancha por sus aristas visibles, continua sea cual sea su tipo de
      línea (f09: la DASHED se traza continua); MIRROR invierte sus esquinas y su primera arista
      pasa a ser la tercera (f10, f11); STRETCH mueve las esquinas atrapadas con su Z; EXPLODE,
      OFFSET, BREAK, FILLET, CHAMFER, EXTEND, DIVIDE y AREA la rechazan con las palabras de AutoCAD
      (f07, f12, f13); LIST en cada idioma (f03); pinzamientos por esquina y paleta (ax26res 18–24,
      49, 279; sin escritorio: **no verificados**). DXF en los dos sentidos: la consola abre los 12
      ficheros sin un error de AUDIT y los traza como el suyo. El corpus: abren las 30 de 8 muestras
      y la de otro programa; muestras sin nada fuera, de 141 a 148 de 154; ficheros de otros, de 572
      a 573. Se anotan: su cara en un estilo sombreado u oculto, la región de REGION, EDGE, PFACE y
      las mallas. **WIPEOUT hecho** (19/11/2026, sin publicar: el push está congelado): la
      cobertura (un polígono en su plano que tapa con el fondo lo dibujado antes y queda bajo lo
      dibujado después, su marco según WIPEOUTFRAME, guardado en el dibujo, fichero versión 58) y
      WIPEOUT con Marcos y Polilínea en los diez idiomas de consola (sondas `wipeout/w00`–`w16`; sus
      palabras no están en acadres: salen de cada consola, y los nombres de la ayuda: es y pt-BR
      COBERTURA, fr NETTOYER, it ENTCOPR, de ABDECKEN, ru МАСКИРОВКА, pl PRZYKRYJ, cs PŘEKRÝT, hu
      KITAKAR); designada dentro y por su marco, referencias en su marco, pinzamientos por vértice,
      MOVE…STRETCH, EXPLODE en líneas, LIST, y OFFSET, AREA, BREAK y DIVIDE la rechazan con las
      palabras de AutoCAD. DXF en los dos sentidos: AutoCAD 2027 guarda WIPEOUTFRAME como variable
      del dibujo (DICTIONARYVAR) y en el 70 de WIPEOUTVARIABLES (0 o 1); la consola abre los 12
      ficheros de w15 sin un error de AUDIT, lee WIPEOUTFRAME 2 desde 2004 y los traza como el suyo.
      El corpus: abren las 11 de 3 muestras; muestras sin nada fuera, de 148 a 151 de 154; ficheros
      de otros, 573 de 577, como antes. Se anotan: FRAME, DRAWORDER, TEXTMASK, las filas de la paleta
      y los pinzamientos (sin escritorio: **no verificados**). **IMAGE hecho** (19/11/2026, sin
      publicar): la imagen ráster (`ImageEntity`, fichero versión 59) como la abre AutoCAD 2027
      cuando no encuentra su fichero, que en el navegador es siempre (sondas `image/i00`–`i15`,
      `s1`–`s11`, variantes de un DXF suyo): su marco según IMAGEFRAME (variable del dibujo,
      RASTERVARIABLES 70 de bits: 2 es 3) y la ruta escrita dentro, de altura el ancho del marco
      entre sus caracteres, centrada y con la base 0,64 alturas bajo el centro, a lo largo de U y
      hacia V, reflejada con MIRROR, sin tapar nada y sin aplicar su recorte; designada por el
      marco y la ruta, nunca por dentro; END, MID, NEA y PER en el marco, CEN en su centro, INS en
      su esquina; STRETCH arrastra una sola esquina (la última atrapada de inf-izq, sup-izq,
      sup-der, inf-der) con la opuesta fija y escala por el mayor de los dos cocientes, nunca la
      mueve entera; EXPLODE deja las cuatro líneas del marco; OFFSET, AREA, BREAK, DIVIDE y TRIM la
      rechazan con las palabras de AutoCAD; LIST como en cada una de las diez consolas (sus
      palabras no están en acadres; el ruso escribe el ancho bajo «Масштаб», que aquí da la
      escala: anotado). DXF en los dos sentidos: IMAGEDEF con su nombre de ACAD_IMAGE_DICT o de su
      fichero, un IMAGEDEF_REACTOR por imagen y las cuatro clases; la consola abre los 12 ficheros
      del dibujo de i13 (seis imágenes: copia, reflejada, roja DASHED de otro fichero, recortada en
      triángulo, inclinada) sin un error de AUDIT, los lee como suyos con IMAGEFRAME 2 y, con los
      ficheros al lado, los carga y traza como el suyo. El corpus: abren la de VBA_Map2Globe y la
      de LibreCAD; muestras sin nada fuera, de 151 a 152 de 154; ficheros de otros, de 573 a 574 de
      577. Se anotan: los píxeles, IMAGE (la paleta), -IMAGE, IMAGEATTACH, IMAGECLIP, IMAGEADJUST,
      IMAGEQUALITY, TRANSPARENCY, la paleta y los pinzamientos (sin escritorio: **no
      verificados**). **Queda del punto 7**, por orden: TABLE (1 de otros, ACAD_TABLE),
      MULTILEADER (1 muestra y 2 ficheros, 4 objetos), y XLINE, RAY, MINSERT, los colores índice y
      las sustituciones DSTYLE de cada cota; quedan para la próxima sesión de esta fase. Lo que
      queda fuera del corpus tras IMAGE: 1 MULTILEADER y una malla (POLYLINE de caras) en las
      muestras; 4 MULTILEADER y 1 ACAD_TABLE en los de otros.

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
