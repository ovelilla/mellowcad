# Sólidos 3D con núcleo propio — brief

> **Estado:** la fase 7 (SWEEP, LOFT) está investigada y planeada en cinco entregas, 7a a 7e
> (27/11/2026, §4); lo siguiente es la 7a, SWEEP sobre las superficies que ya hay. Las fases 1 a 6,
> hechas (la 6c el 27/11/2026). Se borra cuando la fase 7 esté hecha; hasta entonces cada entrega
> cerrada se marca aquí.

## 1. Objetivo

Que un usuario de AutoCAD modele sólidos aquí como allí: primitivas, extrusión y revolución de
perfiles 2D, booleanas, empalmes, secciones, con los comandos, prompts y opciones de AutoCAD 2027.
Sin sólidos, el 3D de la herramienta está incompleto: casi todo el 3D real de AutoCAD gira en torno
a ellos.

## 2. Decisiones

- **Núcleo propio, sin dependencias de terceros.** Como el resto del motor: la geometría, las NURBS
  y las intersecciones ya son nuestras, y el núcleo de sólidos se construye sobre ellas, en `cad/`
  (puro, sin DOM, probado con el harness y con tests de propiedades).
- **Canvas, sin WebGL.** Es como lo dibuja AutoCAD: en 2D Wireframe un sólido son sus aristas y sus
  isolíneas (ISOLINES 4); en Hidden, solo las líneas visibles, que calcula el motor y emite como
  primitivas (sirven igual al canvas, al SVG de la landing y a una exportación futura). El sombreado
  (Conceptual) se pinta con triángulos ordenados por profundidad. Un presentador WebGL sería otro
  presentador de la misma escena, solo si algún día lo pide el rendimiento.
- **Un sólido es un B-rep, no una malla** (§3). La malla se deriva para pintar; nunca se guarda
  como el sólido.
- **Fidelidad: AutoCAD 2027 es la especificación**, como siempre. La consola da MASSPROP (volumen,
  centroide, momentos de inercia) de cualquier sólido: números exactos para los tests de cada
  comando.
- **Superficies acotadas al principio**: planos, cilindros, conos, esferas, toros y las superficies
  de extrusión y revolución de lo que ya dibujamos. Sus intersecciones son casi todas analíticas.
  Las NURBS generales (SWEEP, LOFT) van al final.

## 3. Qué es un sólido aquí

Un **B-rep** (representación por fronteras), como el ACIS de AutoCAD:

- **Geometría exacta**: cada cara lleva su superficie (un plano, un cilindro de radio 10…), cada
  arista su curva (una recta, un arco, una elipse de intersección), cada vértice su punto.
- **Topología**: qué caras comparten cada arista, en qué orden la recorren (bucles), qué lado es el
  interior. Es lo que hace que el sólido sea cerrado y que se pueda preguntar si un punto está
  dentro.
- **Tolerancia única** del modelo (ACIS usa 1e-6), fijada desde el primer día: decide cuándo dos
  puntos, aristas o caras son la misma.

La malla (los triángulos que se pintan) se deriva del B-rep con la densidad que pida la vista.

## 4. Fases

Cada una se entrega terminada (skill `finish-feature`), con su investigación en AutoCAD antes.

1. **REGION y booleanas 2D** (UNION, SUBTRACT, INTERSECT de regiones): la primera topología
   (caras planas, bucles, aristas) y las booleanas sin intersección de superficies. Útil por sí
   sola. **Hecha** (31/10/2026): el núcleo plano en `cad/geometry/planarCurves.ts` y
   `planarRegions.ts` (aristas exactas —rectas, arcos, arcos elípticos, trozos de NURBS—, la
   tolerancia única `MODEL_TOLERANCE` de 1e-6), la entidad `region` (fichero versión 42) y sus
   comandos; lo que falta, en las entradas de REGION y UNION de `docs/coverage/`.
2. **La entidad sólido**: estructura, guardado (versión del fichero), primitivas (BOX, CYLINDER,
   SPHERE, CONE, WEDGE, TORUS, PYRAMID), alámbrico con isolíneas, selección, grips de las
   primitivas, snaps a vértices, aristas y centros, MOVE / COPY / ROTATE / SCALE / MIRROR, MASSPROP.
   En tres entregas: **2a hecha** (31/10/2026): la entidad `solid3d`, un B-rep en
   `cad/geometry/solids.ts` (vértices, aristas con su curva, caras con su superficie y bucles de
   coaristas; cada cara plana, una región de su plano), su fichero (versión 43), BOX, el alámbrico
   (aristas; ISOLINES guardada con el dibujo), selección, snaps y las transformaciones; lo que falta,
   en la entrada de BOX de `docs/coverage/draw.md`. **2b hecha** (1/11/2026): CYLINDER, CONE,
   SPHERE, WEDGE, TORUS y PYRAMID, con las isolíneas de sus caras curvas: la primitiva guardada es
   una unión por tipo, los valores por defecto compartidos entre primitivas, el núcleo con
   círculos, elipses, ápices, cilindros, conos, esferas y toros (caras sin aristas o con aristas
   degeneradas), el fichero en la versión 46; lo que falta, en sus entradas de `draw.md`. **2c:**
   MASSPROP y los grips de las primitivas. **Hecha** (1/11/2026): MASSPROP con las integrales
   exactas por cara en `cad/geometry/massProperties.ts` (el flujo de cada cara por el teorema de la
   divergencia, Green en las planas, Jacobi para los ejes principales como el de AutoCAD), el
   informe de sólidos y regiones en el SCP actual y el fichero `.mpr` (su entrada en
   `inquiry.md`); los grips de las siete primitivas y sus filas de Geometry en la paleta, en
   `cad/domain/solidGrips.ts` (dónde está cada uno, qué hace arrastrarlo y qué valores rechaza la
   paleta, medidos en el escritorio, solid/g01); lo que falta, en sus entradas de `draw.md`.
   **Fase 2 hecha.**
3. **De 2D a 3D**: EXTRUDE, REVOLVE, PRESSPULL de regiones y perfiles cerrados. **Hecha**
   (1/11/2026): el núcleo de barridos en `cad/geometry/sweeps.ts` (las caras que hace ACIS: planos,
   cilindros, conos, esferas, toros, cilindros elípticos y extrusiones y revoluciones de elipses y
   splines; aristas spline) y `faceDomains.ts` (cada cara barrida lleva su dominio en su superficie,
   integrado con reglas exactas: volumen y MASSPROP exactos, contrastados con la consola), el
   fichero en la versión 47; EXTRUDE (altura, Direction, Taper angle, Expression, DELOBJ), REVOLVE
   (eje por dos puntos, Object, X/Y/Z, STart angle, Reverse, EXpression) y PRESSPULL de objetos
   cerrados y áreas delimitadas, con LIST y el Solid type de la paleta; lo que falta, en sus
   entradas de `draw.md` (Path y SUrface, una conicidad con aristas cónicas, un eje fuera del plano
   del perfil). **Pendiente de escritorio** (no se pudo abrir el AutoCAD de escritorio en esta
   sesión): los grips de perfil y altura de un sólido extruido y uno revuelto y las filas de su
   paleta (MPGRIPDATA con -VIEW _SWISO), lo que PRESSPULL muestra al pasar y arrastrar, y lo que
   quedó de la 2c (las cajas dinámicas de las esquinas de BOX y los cuadrantes de CYLINDER con Ortho,
   Polar y un snap; Elliptical = Sí en un cilindro circular; Type de la pirámide en la paleta).
4. **Booleanas 3D** entre planos y cuádricas. **Hecha** (1/11/2026): las caras curvas se miden por
   Green en sus parámetros, sobre sus bucles (`cad/geometry/faceRegions.ts`; polos, el corte de un
   toro), exactas como antes; el núcleo de booleanas en `cad/geometry/solidBooleans.ts`
   (clasificación punto–sólido en `brepQueries.ts`, las intersecciones con forma cerrada en
   `intersections.ts`: plano con plano, cilindro, cono —elipse, parábola, hipérbola, rectas por el
   ápice—, esfera, toro y barridos en sus casos; superficies coaxiales; superficies de una misma
   dirección; cilindros de ejes que se cortan), con tests de propiedades (cerrado, Euler, la
   identidad de volúmenes) y contrastado con MPDUMP y MASSPROP (union/k01–k08); UNION, SUBTRACT e
   INTERSECT de sólidos y regiones mezclados, con LIST del compuesto (union/s01–s10). Lo que falta,
   en su entrada de `docs/coverage/modify.md`: las intersecciones sin forma cerrada (fase 7), la
   tangencia en una esquina, las láminas finas, que el núcleo rechaza con `1 boolean operation(s)
   failed.` (1 de cada 1.000 pares al azar). **Pendiente:** PRESSPULL sobre caras de sólidos (clic:
   extruir la cara; Ctrl+clic: desplazarla), que pide escoger caras con el cursor, de la fase 6
   (subobjetos), y desplazar caras con sus vecinas extendidas (SOLIDEDIT); INTERFERE, que la
   consola no carga (AcInterfere.dll) y cuyo diálogo pide el escritorio.
5. **Estilo Hidden** (líneas ocultas en el motor), sombreado en canvas, VSCURRENT. **Hecha**
   (1/11/2026): las líneas ocultas en `cad/geometry/hiddenLines.ts` (aristas y siluetas de las
   caras curvas —reglas de cilindros, conos y extrusiones, el círculo máximo de la esfera, el
   contorno de toros y revoluciones trazado en sus parámetros—, cortadas por rayos hacia el
   observador contra las caras de todos los sólidos, con topes documentados), contrastadas con los
   planos de la consola (visualstyle/p01–p06) y con tests de propiedades; la malla de cada cara en
   `cad/geometry/faceMesh.ts` (rejilla en sus parámetros, nunca guardada); VSCURRENT con 2D
   Wireframe, Hidden y Conceptual (Gooch ajustado al plano p03, aristas en color 7), el estilo
   guardado en el dibujo (versión 48), el SVG de Hidden con su snapshot; medido en Chrome con 24
   sólidos: unos 50 ms al girar la vista y menos de 10 ms al moverse. Lo que falta, en la entrada
   de VSCURRENT de `docs/coverage/view.md`: los demás estilos y Other, que Hidden oculte objetos que
   no son sólidos (líneas, la rejilla), las siluetas de 3 px y el tinte de un color en Conceptual;
   HIDE, que en 2027 es la vista facetada y temporal de 2D Wireframe (p04).
6. **Edición**, en tres entregas. **6a:** los subobjetos con Ctrl+clic (cara, arista y vértice, su
   resaltado, sus grips y la selección que los guarda), PRESSPULL sobre caras de sólidos (clic:
   extruir la cara; Ctrl+clic: desplazarla con sus vecinas extendidas; pendiente de la fase 4),
   SLICE y SECTION. **Hecha** (1/11/2026): el núcleo en `cad/geometry/solidEdits.ts` (cortar un
   B-rep por un plano con las booleanas contra el semiespacio, su sección como región del plano,
   extruir una cara con su prisma y desplazarla con sus vecinas extendidas: entre planos moviendo
   sus vértices, con vecinas curvas a escuadra por el prisma) y un arreglo de las booleanas (caras
   coincidentes con las aristas al revés); los subobjetos en `cad/application/subobjectPick.ts` y
   `cad/domain/solidSubobjects.ts`, guardados aparte en la selección; PRESSPULL sobre caras, SLICE
   y SECTION (`PlaneCutTool`), contrastados con la consola (slice/s01–s13, section/c01–c10,
   solidedit/e01–e05) y el escritorio (subobjetos y PRESSPULL en una caja). Lo que falta, en sus
   entradas de `modify.md`, `draw.md` y `command-line.md`: arrastrar los grips de subobjetos y
   MOVE, ROTATE, SCALE y ERASE sobre ellos (6c), SUBOBJSELECTIONMODE, el desfase junto a conos,
   esferas o toros, las superficies. **6b:** FILLETEDGE y CHAMFEREDGE en los casos analíticos y
   SOLIDEDIT de caras. **Hecha** (1/11/2026): el núcleo de empalmes y chaflanes en
   `cad/geometry/solidBlends.ts` (sin booleanas: la topología se rehace alrededor de las aristas —
   cilindro o plano en una arista recta entre planos, toro o cono en un círculo entre plano y
   cilindro coaxial, los extremos en la cara de enfrente, cadenas tangentes, inglete con elipse,
   esquina esférica, cara gastada del todo—, con las cifras de la consola), y en `solidEdits.ts` el
   plano de una cara cambiado (Rotate, Taper), el desfase con vecinas coaxiales (el tronco de e03,
   321.9504), Delete de agujeros y tiras, Extrude con inclinación; FILLETEDGE y CHAMFEREDGE
   (`EdgeBlendTool`: clic, Ctrl+Espacio, punto tecleado, Chain, Loop, Radius, Distance, Expression,
   la vista previa y el pinzamiento del radio; FILLETRAD3D en el dibujo, versión 49) y SOLIDEDIT de
   caras (`SolideditTool`: Extrude, Move, Rotate, Offset, Taper, Delete y Copy, con los botones del
   panel), contrastados con la consola (filletedge/f01–f07, chamferedge/c01–c07,
   solidedit/e06–e12) y el escritorio (la arista al pasar, la vista previa, el pinzamiento, el
   diálogo de coLor). Lo que falta, en sus entradas de `modify.md`: empalmes de dos radios o sobre
   caras curvas, la bola que rueda sobre una cara estrecha (f05), coLor y mAterial, Edge y Body,
   las caras curvas en Move, Rotate, Taper y Copy, las ediciones que cambian la topología (e12).
   **6c, lo siguiente:** 3DMOVE y 3DROTATE (también de subobjetos, con MOVE,
   ROTATE, SCALE y ERASE sobre ellos y el modo SUbobject de `Select objects:`, que la consola mostró
   en solid-edits/p241–p264: SUB-01 de `docs/plans/solid-edits-review.md`), UCS Face y el SCP dinámico (UCSDETECT).
   **6c hecha** (27/11/2026): UCS Face sobre sólidos (`08909487`), el SCP dinámico (`a5b113db`),
   los subobjetos como conjunto de MOVE, COPY, ROTATE, SCALE y ERASE (SUB-01, SED-08: `3db85422`),
   3DMOVE con su gizmo (`4ff7d096`) y 3DROTATE con el suyo; lo que falta, en sus entradas de
   `coordinate-systems.md`, `drafting-aids.md`, `command-line.md` y `modify.md` (el menú del gizmo,
   DEFAULTGIZMO, 3DSCALE, el estilo 3D Wireframe, un vértice movido y una cara girada en su plano,
   que AutoCAD triangula). **El plan de la 6c** (27/11/2026), por lo que cada pieza necesita de la
   anterior; un commit por pieza, cada una cerrada con `finish-feature` y leída por un segundo
   contexto:
   1. **UCS Face sobre sólidos** (`docs/coverage/coordinate-systems.md`). La consola (ucs/p500–p553):
      la cara es la que el rayo de la vista cruza primero por el punto (un punto tecleado también);
      el origen, el punto de la cara; Z, su normal hacia fuera (en una curva, la del punto); X, a lo
      largo de la arista recta de la cara más cercana al punto, o en horizontal (Z × normal) si esa
      arista es vertical o no hay recta; su sentido, hacia abajo, luego +X, luego −Y del SCU (p552:
      no el SCP). `Enter an option [Next/Xflip/Yflip] <accept>:` (25649; sin Next, 43707, cuando el
      rayo no cruza otra cara: una esfera, p516); Next, la cara siguiente del rayo, en ciclo, o la
      otra cara de la arista si el punto cae en una (p503, p506, p521–p523); Xflip y Yflip, 180°
      sobre X o Y; LASTPOINT, el punto dado; U, `UCS`. Lo que la consola no enseña (la vista previa
      del icono al pasar, el resaltado de la cara) lo da el escritorio. Da el marco de cara que usan
      2 y 4.
   2. **UCSDETECT** (el SCP dinámico): la variable (registro, 1, transparente, p519), F6 y su botón
      de la barra de estado (oculto por defecto en la de AutoCAD, 20052–20053, 33750); con un comando
      de dibujo pidiendo un punto, el cursor sobre una cara plana de un sólido alinea el plano de
      trabajo con ella hasta que el comando acaba (la ayuda, About Aligning the UCS Dynamically).
      Cuándo se adquiere y se suelta, qué X lleva y cómo se ve: el escritorio.
   3. **Los subobjetos como conjunto** (SUB-01, SED-08): el modo SUbobject y Ctrl+clic en `Select
      objects:` de MOVE, ROTATE, SCALE, ERASE y COPY, un subobjeto preseleccionado como preselección;
      MOVE, ROTATE y SCALE dan forma al sólido por ellos con las vecinas extendidas (el núcleo: cara
      movida, girada y escalada; arista movida con sus caras planas inclinadas; vértice movido con
      sus caras partidas en triángulos, solid-edits/p244–p249, p261, p262), COPY copia el sólido
      entero (p247), ERASE lo deja y le quita la primitiva (p241, p264). Lo necesitan 4 y 5.
   4. **3DMOVE** (`3M`, es `DESPLAZA3D`): los prompts de MOVE (3dmove/p01–p14; `U` lo nombra, no es
      transparente, `Regenerating model.` al acabar en una vista 3D en 2D Wireframe, que pasa a 3D
      Wireframe mientras dura), y en una vista 3D el gizmo de desplazar en el centro del conjunto:
      ejes y planos que se iluminan, el arrastre restringido y sus prompts (`Specify stretch point or
      [Base point/Copy/Undo/eXit]:`, 25356, por confirmar en el escritorio). Sin botón en la cinta
      de Drafting & Annotation (está en la de 3D Modeling): tecleado, con su WHY.
   5. **3DROTATE** (`3R`, es `ROTACION3D`): en planta, los prompts de ROTATE (3drotate/p06); en una
      vista 3D, `Specify base point:` (Intro: el centro del gizmo), `Pick a rotation axis:` (solo con
      el ratón sobre un anillo del gizmo: la consola dice `Invalid 2D point.`, p01–p05), `Specify
      angle start point or type an angle:` y `Specify angle end point:` (21206, 21735). Reutiliza el
      gizmo de 4.

   El escritorio (una sesión, con el ratón y la palabra del dueño): la vista previa y el resaltado de
   UCS Face; cuándo UCSDETECT adquiere una cara, su X y su aspecto; los gizmos de 3DMOVE y 3DROTATE
   (tamaño, colores, qué se ilumina, el arrastre, los prompts trazados con su `initget`) y el menú
   contextual del gizmo. Lo que se decida dejar fuera (el menú del gizmo, DEFAULTGIZMO a `Command:`,
   GTLOCATION, 3DSCALE) va a Missing de cada entrada.
   **Resuelto el 27/11/2026** lo visto el 6/11 en el navegador (ZOOM Extensión en Isométrica SO
   dejaba el cilindro de la brida, Ø100 × 14, de borde a borde, su canto bajo la línea de comandos
   flotante): el motor encuadraba el contorno de los objetos, y AutoCAD, en una vista 3D o una planta
   girada, la caja de EXTMIN y EXTMAX tal como la ve la vista (zoom/z01–z03: 94.1265 donde el
   contorno mide 69.2); la entrada de ZOOM en `docs/coverage/view.md`.
7. **SWEEP, LOFT** y superficies NURBS generales; las booleanas y empalmes que las tocan.
   **La investigación** (27/11/2026, consola en en-US y es-ES, trazada, con MPDUMP y MASSPROP:
   `scripts/research/probes/sweep/` y `scripts/research/probes/loft/`): ACIS hace analítico lo que
   puede y NURBS lo demás. SWEEP: un círculo por una recta, un cilindro (s01, 4712.3890); por un arco, un
   toro (s03, 789.5683, Pappus); por una polilínea, un cilindro por tramo cortados a inglete, la
   arista de la esquina una elipse (s04, 2261.9467, la longitud entera por el área); por una spline,
   una NurbSurface bicúbica ajustada, 46 × 82 puntos de control, periódica en u (s05, 1221.8824:
   la cifra de su aproximación); con Scale 0.5 por una recta, una NurbSurface aunque es un cono
   (s08, 2748.8936, el tronco exacto). Los prompts: `Select objects to sweep or [MOde]:` (33780),
   `Select sweep path or [Alignment/Base point/Scale/Twist]:` (33632; una selección de un objeto:
   FOO da `*Invalid selection*` y la lista de modos; Intro acaba el comando sin hacer nada),
   Alignment `Align sweep object perpendicular to path before sweep [Yes/No]<Yes>:` (33638/33639,
   el último su defecto), Base point `Specify base point:`, Scale `Enter scale factor or
   [Reference/Expression]<1.0000>:` (`Value must be positive and nonzero.`; Reference pide dos
   longitudes y LIST dio 0.5 para 5 → 10, **por releer**), Twist `Enter twist angle or allow
   banking for a non-planar sweep path [Bank/EXpression]<0.0000>:` (29554; Bank lo activa y el
   defecto pasa a `<Bank>`, 33754; un ángulo lo apaga). Un recorrido en el plano del perfil sin
   alinear: `Path curve is coplanar with or tangent to the plane of the profile curve.` y `Unable to
   sweep 1 selected objects.` (s02, s09); el perfil mismo como recorrido, `Profile curve may not be
   selected as path curve.` (s15). Alineado, el perfil lleva su base (la de EXTRUDE, o Base point)
   al principio del recorrido, su normal a la tangente y su Y a tangente × X; adónde va su X
   depende de la dirección del recorrido (a X por ±Y, a Y por +X: s13, s16–s21), **por fijar** antes
   de construir. LIST: `Solid type = Sweep`, `Sweep length`, `Profile
   rotation`, `Scale along path`, `Twist along path`, `Bank`. LOFT: `Select cross sections in
   lofting order or [POint/Join multiple edges/MOde]:` (33616), ` 2 cross sections selected`,
   `Enter an option [Guides/Path/Cross sections only/Settings] <Cross sections only>:` (34735); dos
   círculos coaxiales dan un cono exacto (l01, 3665.1914), tres o un rectángulo y un círculo
   NurbSurfaces (l02, l03); una sola sección, `At least two profiles must be selected.` (l04). El
   escritorio (la vista previa al pasar por el recorrido, los pinzamientos, el cuadro Loft
   Settings) quedó sin ver: una ventana ajena se abrió encima y se dejó para la entrega de cada
   comando.

   **El plan**, por lo que cada pieza necesita de la anterior; cada entrega con su investigación,
   `new-command` por comando, `finish-feature`, un commit por pieza y la segunda lectura:
   - **7a — SWEEP sobre las superficies que ya hay.** Todo el diálogo de SWEEP (MOde, Alignment,
     Base point, Scale, Twist, Bank, Expression), y el sólido cuando el núcleo de la fase 3 lo hace
     exacto: un perfil cerrado (círculo, elipse, polilínea, spline cerrada, cara de región) por una
     recta, un arco o una polilínea plana de rectas y arcos, con las esquinas a inglete (los tramos
     son extrusiones y revoluciones, el inglete el corte por el plano bisector de `solidEdits.ts` y
     la unión de `solidBooleans.ts`); LIST, la paleta, el fichero. Un recorrido de spline, elipse o
     polilínea 3D, un Scale distinto de 1 y un Twist distinto de 0 dicen `Unable to sweep 1 selected
     objects.` hasta la 7b, anotado en su entrada. **Por qué cabe en una sesión:** no añade
     superficies; usa lo que MASSPROP, Hidden, las booleanas y los subobjetos ya saben de
     extrusiones y revoluciones, y su trabajo es el comando y su objeto, como EXTRUDE en la fase 3.
   - **7b — la superficie de barrido general en el B-rep**: un perfil llevado por un recorrido
     cualquiera, con su marco (alineado, inclinado o no), su escala y su torsión, evaluado de forma
     exacta (no la NURBS ajustada de ACIS, cuya cifra es la de su aproximación: los tests comparan
     con la exacta y anotan la diferencia como se hizo con k05); su evaluación y sus derivadas, la
     inversión (de un punto a sus parámetros), la normal, la malla, las isolíneas, la silueta de
     Hidden (el contorno en parámetros de toros y revoluciones), los cortes de un rayo
     (subdivisión y Newton), la clasificación punto–sólido, MASSPROP por cuadratura de Gauss sobre
     el dominio recortado, las transformaciones y el fichero. Con ella, SWEEP por splines,
     polilíneas 3D y elipses, Scale y Twist, y EXTRUDE Path.
   - **7c — LOFT** sobre una superficie NURBS de verdad (la de 7b para los métodos numéricos): el
     paso por las secciones (Smooth fit, Ruled, Normal to, Draft angles), Cross sections only,
     Guides, Path, POint, Join multiple edges, MOde, el cuadro Loft Settings y sus variables
     (LOFTNORMALS, LOFTANG1/2, LOFTMAG1/2, LOFTPARAM), cerrado; los casos que ACIS hace analíticos
     (l01).
   - **7d — la intersección superficie–superficie general** (§5): puntos de partida por
     subdivisión de los dominios, marcha predictor–corrector con la tolerancia única, las curvas
     como NURBS de aristas; con ella las booleanas, SLICE y SECTION de las caras de 7b y 7c y de los
     pares analíticos sin forma cerrada que `modify.md` deja aquí (cilindros cruzados, conos, toros,
     extrusiones), y PRESSPULL sobre ellas.
   - **7e — empalmes y chaflanes sobre caras cualesquiera**: la bola que rueda (una superficie de
     barrido de 7b a lo largo de la curva de contacto), FILLETEDGE y CHAMFEREDGE junto a caras
     curvas y generales, los dos radios que se encuentran (f01) y la cara estrecha (f05).

## 5. Riesgos

- **Booleanas robustas**: caras coincidentes, aristas tangentes, casi-contactos. Se contienen con la
  tolerancia única, predicados geométricos cuidados y tests de propiedades (Euler, sólido estanco,
  vol(A∪B) = vol(A) + vol(B) − vol(A∩B)).
- **Intersección superficie-superficie general** (fase 7): el problema más duro de un núcleo así. Por
  eso va al final, con todo lo anterior ya en pie.
- **Empalmes de aristas** sobre superficies cualesquiera: solo los analíticos en la fase 6.
- **Tamaño**: es comparable a todo el motor construido hasta hoy. Meses, no semanas.

## 6. Fuera, por ahora

Leer y escribir el SAT de ACIS en DXF / DWG (sólidos de otros ficheros), el modelado de mallas
(MESH, SMOOTH), las superficies como objetos propios (PLANESURF, NETWORK), la perspectiva y los
estilos Realistic y materiales: texturas, brillo especular y sombreado suave piden un presentador
WebGL, no el canvas. Los demás estilos visuales (Wireframe, Shaded, Shaded with edges…) y el menú
de estilo de los controles de la ventana gráfica los quiere el dueño (8/11/2026): una entrega
propia tras la fase 6, anotada en `docs/coverage/roadmap.md`.
