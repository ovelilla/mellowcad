# Sólidos 3D con núcleo propio — brief

> **Estado:** en curso: la fase 1 está hecha y la 2a de la fase 2 (31/10/2026); la 2b, a medias:
> WEDGE, PYRAMID, CYLINDER y CONE hechas (1/11/2026); lo siguiente, SPHERE y TORUS. Se borra cuando la fase 7 esté hecha; hasta entonces cada fase cerrada se marca aquí.

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
   en la entrada de BOX de `docs/coverage/draw.md`. **2b:** CYLINDER, CONE, SPHERE, WEDGE, TORUS y
   PYRAMID, con las isolíneas de sus caras curvas; WEDGE y PYRAMID hechas (1/11/2026: la primitiva
   guardada es una unión por tipo, el fichero la versión 44, los valores por defecto compartidos
   entre primitivas), CYLINDER y CONE también (el núcleo con círculos, elipses, ápices, cilindros y
   conos; las isolíneas; versión 45). **2c:** MASSPROP y los grips de las primitivas.
3. **De 2D a 3D**: EXTRUDE, REVOLVE, PRESSPULL de regiones y perfiles cerrados.
4. **Booleanas 3D** entre planos y cuádricas.
5. **Estilo Hidden** (líneas ocultas en el motor), sombreado en canvas, VSCURRENT.
6. **Edición**: SLICE, SECTION, CHAMFEREDGE, FILLETEDGE en los casos analíticos, SOLIDEDIT de caras;
   sub-objetos con Ctrl+clic, 3DMOVE / 3DROTATE, UCS Face y el SCP dinámico (UCSDETECT).
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
