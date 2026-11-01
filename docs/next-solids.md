# Sólidos 3D con núcleo propio — brief

> **Estado:** en curso: las fases 1 a 5 y las entregas 6a y 6b están hechas (1/11/2026); lo
> siguiente, la 6c: 3DMOVE, 3DROTATE, UCS Face y UCSDETECT. Se borra cuando la fase 7 esté hecha; hasta entonces cada fase cerrada se marca aquí.

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
   ROTATE, SCALE y ERASE sobre ellos), UCS Face y el SCP dinámico (UCSDETECT).
7. **SWEEP, LOFT** y superficies NURBS generales; las booleanas y empalmes que las tocan.

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
estilos Realistic y materiales.
