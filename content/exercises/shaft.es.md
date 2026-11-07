---
title: "Ejercicio de AutoCAD: un eje escalonado"
metaTitle: "Pieza para practicar AutoCAD: eje escalonado"
description: "Dibuja un eje escalonado en AutoCAD: medio contorno como polilínea, achaflanado y reflejado con simetría, y sus longitudes en cadena. Gratis, paso a paso."
figure: "Un eje escalonado en vista lateral, de 150 de largo, con sus longitudes acotadas en cadena."
sourceHash: "8c649e73bc55"
---

Dibuja este eje escalonado en vista lateral, en milímetros: 150 de largo, con diámetros de 30, 40 y 30 en longitudes de 40, 60 y 50, y los dos extremos achaflanados a 2 por 2. Dibuja como una sola polilínea la mitad que queda por encima de la línea de eje, achaflánala y haz su simetría; después, las aristas que se ven a lo ancho del eje, la línea de eje y las longitudes. Los diámetros son los que se indican aquí.

## Steps

### Dibuja la mitad superior [#half]

En la capa Contorno, una sola <Command id="PLINE" /> desde `0,0`: hacia arriba `0,15`, a la derecha `40,0`, hacia arriba `0,5`, a la derecha `60,0`, hacia abajo `0,-5`, a la derecha `50,0` y hacia abajo `0,-15`, de vuelta a la línea de eje. Intro la termina.

### Achaflana los extremos [#chamfers]

<Command id="CHAMFER" /> y después <Keyword command="CHAMFER" id="Distance" />: `2`, e Intro toma `2` también para la segunda distancia. <Keyword command="CHAMFER" id="Multiple" /> achaflana una esquina tras otra sin volver a empezar: designa los dos segmentos de la esquina de cada extremo.

### Haz la simetría [#mirror]

<Command id="MIRROR" />: designa la polilínea, pulsa Intro, después la línea de simetría de `0,0` a `150,0`, la línea de eje, e Intro para conservar el original.

### Dibuja las aristas [#edges]

Con <Command id="LINE" />, las aristas que se ven a lo ancho del eje, cada una `0,30` hacia arriba desde abajo: desde `2,-15` y `148,-15` en los chaflanes, y desde `40,-15` y `100,-15` en los escalones.

### Dibuja la línea de eje [#axis]

En la capa Ejes, la línea de eje: una línea de `-8,0` a `166,0` más allá.

### Acótalo [#dimensions]

En la capa Cotas, <Command id="DIMLINEAR" /> para la primera longitud, 40, colocada debajo. <Command id="DIMCONTINUE" /> sigue desde su segunda línea de referencia: `#100,-20` y después `#150,-15`, escritos desde el origen con #, y pulsa Intro dos veces para terminarlo. Un último <Command id="DIMLINEAR" /> da la longitud total, 150, más abajo.
