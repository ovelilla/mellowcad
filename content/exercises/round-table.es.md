---
title: "Ejercicio de AutoCAD: una mesa redonda con sillas"
metaTitle: "Ejercicio de AutoCAD: mesa redonda y seis sillas"
description: "Dibuja una mesa redonda con seis sillas en AutoCAD: una silla y una matriz polar alrededor del centro de la mesa, y sus cotas, paso a paso. Gratis online."
figure: "Una mesa redonda de 120 con seis sillas, en planta, acotada en centímetros."
sourceHash: "1e307bf5e17a"
---

Dibuja una mesa redonda de 120 con seis sillas, en centímetros: cada silla, un asiento de 44 por 40 con las esquinas redondeadas con radio 4 y un respaldo de 8 de fondo, con su frente a 8 del borde de la mesa. Dibuja una silla por encima de la mesa y deja que una matriz polar coloque las seis. La escala de cota general del dibujo está ajustada para centímetros.

## Steps

### Dibuja la mesa [#table]

En la capa Contorno, <Command id="CIRCLE" /> en `0,0`, <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Dibuja una silla [#chair]

El asiento, por encima de la mesa: <Command id="RECTANG" /> con un <Keyword command="RECTANG" id="Fillet" /> de `4`, de `-22,68` a `44,40` más allá. Después, el respaldo, con el empalme de nuevo a `0`, de `-22,108` a `44,8` más allá. <Command id="RECTANG" /> conserva su radio de empalme hasta que lo cambias.

### Haz la matriz de las sillas [#array]

<Command id="ARRAYPOLAR" />: designa el asiento y el respaldo, pulsa Intro, da el centro de la mesa, `0,0`, y después <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Cada silla gira al colocarse, así que las seis miran hacia la mesa.

### Acótala [#dimensions]

En la capa Cotas, <Command id="DIMDIAMETER" /> en la mesa, colocada dentro, y <Command id="DIMLINEAR" /> para la anchura de la silla de arriba, 44, y su fondo con el respaldo, 48.
