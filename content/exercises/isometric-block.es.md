---
title: "Ejercicio isométrico de AutoCAD: un bloque escalonado"
metaTitle: "Dibujo isométrico para practicar AutoCAD: bloque"
description: "Dibuja un bloque escalonado en isométrico en AutoCAD con LINEA y coordenadas polares según los ejes de 30°, 90° y 150°, y acótalo. Gratis, paso a paso, online."
figure: "Un bloque escalonado en isométrico, de 60 de largo, 40 de fondo y 40 de alto, con sus medidas acotadas a lo largo de sus aristas."
sourceHash: "c1039d3b5e97"
---

Dibuja este bloque escalonado en isométrico, en milímetros: 60 de largo, 40 de fondo y 40 de alto, con un escalón de 20 de fondo y 20 de alto a lo largo de su frente. Cada arista sigue uno de los ejes isométricos: 30° y 210° para la longitud, 150° y 330° para el fondo, 90° y 270° para la altura. MellowCAD aún no tiene el dibujo isométrico de AutoCAD —su resolución isométrica y sus isocírculos—, así que las aristas son líneas escritas con coordenadas polares: una longitud y un ángulo.

## Steps

### Dibuja el frente del escalón [#front]

En la capa Contorno, <Command id="LINE" /> desde `0,0`, la esquina delantera inferior: `60<30`, `20<90`, `60<210` y después <Keyword command="LINE" id="Close" />.

### Dibuja el lateral [#side]

Otra vez desde `0,0`, el lateral izquierdo: `40<150`, `40<90`, `20<330`, `20<270` y `20<330`. Intro termina la línea en la arista delantera del escalón.

### Dibuja la parte superior [#top]

El resto empieza en esquinas ya dibujadas: escribe `_END`, la referencia a objetos Punto final para un solo punto, y señala la esquina. Desde la esquina superior derecha del frente: `20<150`, `20<90`, `20<150` y `60<210`. Después, dos líneas de `60<210`, desde el pie de la contrahuella del escalón y desde su borde superior.

### Acótalo [#dimensions]

En la capa Cotas, <Command id="DIMALIGNED" /> a lo largo de las aristas, cada cota junto a la suya: 60 y 40 abajo, 40 en vertical por la izquierda y 20 en vertical por la derecha.
