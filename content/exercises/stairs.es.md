---
title: "Ejercicio de AutoCAD: una escalera en planta"
metaTitle: "Plano para practicar AutoCAD: escalera en planta"
description: "Ejercicio de arquitectura: dibuja en AutoCAD una escalera recta en planta, diez huellas con una línea y una matriz rectangular, la flecha de subida y las cotas."
figure: "Un tramo recto de escalera en planta, de 280 por 100 centímetros, con su flecha en el sentido de subida."
sourceHash: "ff6e60262cd9"
---

Dibuja un tramo recto de escalera en planta, en centímetros: 280 de largo y 100 de ancho, diez huellas de 28 y la flecha que indica el sentido de subida. La escala de cota general del dibujo está ajustada para un plano en centímetros, así que sus cotas se leen bien a este tamaño. Se dibuja el borde de una huella; una matriz rectangular coloca los demás.

## Steps

### Dibuja el contorno [#outline]

En la capa Contorno, <Command id="RECTANG" /> de `0,0` a `280,100`: el contorno del tramo.

### Dibuja la primera huella [#tread]

El borde de la primera huella, una <Command id="LINE" /> desde `28,0`, `0,100` hacia arriba, e Intro.

### Haz la matriz de las huellas [#array]

<Command id="ARRAYRECT" /> la copia a lo largo del tramo: designa la línea y pulsa Intro; después elige <Keyword command="ARRAYRECT" id="COUnt" />, `9` columnas y `1` fila, y <Keyword command="ARRAYRECT" id="Spacing" />, `28` entre columnas y `1` entre filas, que no hace nada con una sola fila. <Keyword command="ARRAYRECT" id="eXit" /> la deja como una matriz asociativa, que sus pinzamientos editan después.

### Dibuja la flecha [#arrow]

<Command id="PLINE" /> desde `14,50`, a lo largo del tramo hasta `226,0` más allá; después <Keyword command="PLINE" id="Width" />, `10` al principio y `0` al final, y un último segmento de `24,0`: la punta de la flecha. Intro la termina.

### Acótala [#dimensions]

En la capa Cotas, <Command id="DIMLINEAR" /> tres veces: la longitud debajo, la anchura a la derecha y una huella, 28, encima.
