---
title: "Extruir en AutoCAD: EXTRUSION (EXTRUDE)"
metaTitle: "Extruir en AutoCAD: comando EXTRUSION (EXTRUDE)"
description: "Cómo funciona EXTRUSION (EXTRUDE, alias EXT) de AutoCAD en español: de un perfil 2D cerrado a un sólido 3D, altura, Dirección e Inclinación. Pruébalo gratis."
figure: "Una polilínea cerrada en forma de L extruida 20 hasta un sólido, vista después desde el sureste con el estilo visual Oculto."
sourceHash: "53bfe3dd1e9c"
---

EXTRUSION (EXTRUDE en inglés) convierte perfiles 2D cerrados en sólidos 3D: saca cada uno en línea recta de su plano, a la altura que le das. Designa los perfiles —círculos, elipses, polilíneas o splines cerradas, regiones— y pulsa Intro; después escribe la altura o precísala con un punto. La última altura es la opción por defecto de la siguiente ejecución. Cada perfil se convierte en un sólido propio, en la capa actual, y se borra, como indica DELOBJ por defecto. El comando entero es un paso que Deshacer revierte.

El 3D de MellowCAD es solo de sólidos, y aún parcial: un perfil abierto, que AutoCAD convierte en superficie, recibe <Message id="sweepRefusedType" /> y sale del conjunto de selección.

## Options

### MOde

Pide <Keyword id="SOlid" /> o <Keyword id="SUrface" />. <Keyword id="SOlid" /> es la opción por defecto y la única que hay: sin objetos de superficie todavía, <Keyword id="SUrface" /> se rechaza.

### Direction

En lugar de una altura, dos puntos dan la dirección y la longitud: los perfiles se extruyen a lo largo de esa línea, inclinados si ella lo está. Una dirección contenida en el plano del perfil recibe <Message id="directionParallel" />, y el comando termina.

### Path

Aparece en la lista, como en AutoCAD, pero no está hecha: elegirla se rechaza y se vuelve a pedir la altura.

### Taper

Pide un ángulo entre −90 y 90 grados y después otra vez la altura: un ángulo positivo estrecha el sólido a medida que sube; uno negativo lo ensancha. Un círculo que se cierra antes de llegar a la altura acaba en un punto, un cono; un perfil que no admite la inclinación no crea nada.

### Expression

La altura como expresión: `2*3` es 6. Por ahora, solo aritmética.

## Missing

<Keyword id="Path" />, el barrido a lo largo de una trayectoria. El modo <Keyword id="SUrface" /> y los perfiles abiertos, de los que AutoCAD hace superficies: aún no hay objetos de superficie. Las caras de los sólidos y las áreas que un clic encuentra dentro de unos objetos, que toma <Command id="PRESSPULL" />. Una inclinación sobre una elipse, una spline o un arco que se une al segmento siguiente en una esquina. Los parámetros y las funciones de <Keyword id="Expression" />. <Command id="EXPLODE" /> de un sólido extruido con lados curvos, que AutoCAD convierte en superficies y regiones. Sus pinzamientos, y su altura y su ángulo de inclinación editados en la paleta Propiedades.

## Questions

### ¿Cómo se llama el comando EXTRUSION en inglés?

EXTRUDE. En AutoCAD en español es EXTRUSION, con el alias `EXT`, y el nombre inglés también funciona en cualquier idioma con un guion bajo delante: `_EXTRUDE`.

### ¿Cómo extruir en AutoCAD 3D?

Dibuja el contorno como un solo objeto cerrado —una polilínea cerrada, un círculo o una región—, ejecuta EXTRUSION, desígnalo, pulsa Intro y escribe la altura. Visto desde arriba, un sólido parece su contorno: gira la vista con el ViewCube, o con <Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" />, para verlo en 3D.

### ¿Por qué EXTRUSION no crea un sólido?

El perfil está abierto o se cruza consigo mismo. Una línea, un arco o una polilínea abierta dan una superficie en AutoCAD, y MellowCAD aún no tiene superficies: EXTRUSION dice <Message id="sweepRefusedType" /> y los quita del conjunto de selección; un perfil que se cruza consigo mismo recibe <Message id="sweepSelfIntersecting" />, y también sale. Une las piezas con <Command id="JOIN" />, haz con ellas una región con <Command id="REGION" /> o haz clic dentro de ellas con <Command id="PRESSPULL" />.

### ¿Cómo extruir una forma con un agujero?

Haz de ella una sola región: <Command id="REGION" /> sobre el contorno y el agujero, y después resta con <Command id="SUBTRACT" /> la región del agujero de la del contorno. Extruye esa región y el agujero atraviesa el sólido. O ejecuta <Command id="PRESSPULL" /> y haz clic entre el contorno y el agujero.

### ¿Cómo extruir a lo largo de una trayectoria?

Todavía no se puede: <Keyword id="Path" /> aparece, pero se rechaza, y el barrido aún no existe. <Keyword id="Direction" /> extruye a lo largo de la línea recta entre dos puntos.
