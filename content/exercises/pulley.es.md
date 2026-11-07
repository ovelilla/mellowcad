---
title: "Ejercicio de AutoCAD 3D: una polea"
metaTitle: "Ejercicio de AutoCAD 3D: polea por revolución"
description: "Modela una polea en AutoCAD 3D: su media sección, una polilínea cerrada, girada en torno al eje Y hasta un sólido de revolución, paso a paso. Gratis online."
figure: "La media sección de la polea junto a su eje, con sus distancias al eje acotadas."
model: "La polea como sólido, vista desde el sureste con el estilo visual Conceptual."
sourceHash: "f9c2a81b39fe"
---

Modela esta polea haciendo girar su media sección alrededor de su eje, en milímetros: un agujero de 20, un cubo de 30 de largo y 40 de diámetro, un alma de 10 de espesor y una llanta de 24 de ancho, de 90 a 110 de diámetro, centrada en el cubo. La sección se dibuja como distancias al eje, que sube por el eje Y, así que cada diámetro se dibuja como su mitad.

## Steps

### Dibuja la media sección [#profile]

En la capa Contorno, una sola <Command id="PLINE" /> cerrada desde `10,0`, cada punto siguiente como un desplazamiento desde el anterior: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` y `-10,0`, y después <Keyword command="PLINE" id="Close" />.

### Gira la vista [#view]

<Command id="-VIEW" /> y <Keyword command="VIEW" id="SEiso" /> la muestran desde el sureste y desde arriba; <Command id="VSCURRENT" /> y <Keyword command="VSCURRENT" id="Conceptual" /> sombrean las caras, que es como mejor se ve una pieza torneada.

### Genera el sólido de revolución [#revolve]

<Command id="REVOLVE" />: designa la sección y pulsa Intro; después, <Keyword command="REVOLVE" id="Y" />: el eje Y es el de la polea. Intro toma el ángulo por defecto, una vuelta entera. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> la encuadra, y una escala de 0.8x deja margen alrededor.
