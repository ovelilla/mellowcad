---
title: "Ejercicio de AutoCAD: una biela con líneas tangentes"
metaTitle: "Ejercicio de AutoCAD 2D avanzado: biela"
description: "Dibuja una biela en AutoCAD: dos cubos unidos por líneas tangentes con la referencia a objetos Tangente, los arcos sobrantes recortados y sus cotas. Gratis."
figure: "Una biela de dos cubos a 90 de distancia, unidos por líneas tangentes, acotada."
sourceHash: "383984af61b7"
---

Dibuja esta biela, en milímetros: dos cubos a 90 de distancia, de radio 20 y 12, con agujeros de radio 10 y 6, unidos por líneas tangentes a ambos, con los arcos que quedan entre las líneas recortados. Las líneas tangentes toman la referencia a objetos Tangente en sus dos extremos; después, <Command id="TRIM" /> convierte el círculo de cada cubo en un arco.

## Steps

### Dibuja los cubos [#bosses]

En la capa Contorno, cuatro círculos con <Command id="CIRCLE" />, cada uno por su radio: `20` y `10` en `0,0`, `12` y `6` en `90,0`.

### Dibuja las líneas tangentes [#tangents]

<Command id="LINE" />; después escribe `_TAN`, la referencia a objetos Tangente para un solo punto, y designa el círculo grande cerca de su parte superior; otra vez `_TAN`, y designa el pequeño cerca de su parte superior. La línea toca los dos. Lo mismo por la parte inferior.

### Recorta los arcos [#trim]

<Command id="TRIM" />: designa cada cubo entre las dos líneas, por el lado que mira hacia el otro. Los arcos interiores desaparecen y cada círculo queda como un arco.

### Dibuja los ejes [#centreLines]

En la capa Ejes, el eje que pasa por los dos centros y una línea que cruza cada cubo.

### Acótala [#dimensions]

En la capa Cotas, la distancia entre los centros con <Command id="DIMLINEAR" />, los radios de los cubos con <Command id="DIMRADIUS" /> y sus agujeros con <Command id="DIMDIAMETER" />.
