---
title: "Ejercicio de AutoCAD: una parcela"
metaTitle: "Ejercicio de AutoCAD: área y lados de un terreno"
description: "Dibuja una parcela en AutoCAD con coordenadas polares, a partir de la longitud y el ángulo de sus lados; mide su área y acótala. Gratis, paso a paso, online."
figure: "Una parcela de cinco lados, en metros, con cada lado acotado y un ángulo."
sourceHash: "f5542a75eef7"
---

Dibuja esta parcela, en metros, a partir de la longitud y la dirección de sus lados: 40 a 0°, 30 a 80°, 35 a 155° y 25 a 230°, y de vuelta al inicio. Mide su área y su perímetro, y acota cada lado y el ángulo de su segundo vértice. Las coordenadas polares, una longitud y un ángulo, dibujan cada lado desde el final del anterior. La escala de cota general del dibujo está ajustada para metros.

## Steps

### Dibuja el contorno [#boundary]

En la capa Contorno, <Command id="PLINE" /> desde `0,0` y después cada lado como su longitud y su ángulo: `40<0`, `30<80`, `35<155` y `25<230`, cada uno medido desde el último punto. <Keyword command="PLINE" id="Close" /> dibuja el quinto lado y cierra el contorno: un solo objeto, que <Command id="AREA" /> puede medir.

### Mide su área [#area]

<Command id="AREA" />, después <Keyword command="AREA" id="Object" />, y designa el contorno: la línea de comandos da su área, en metros cuadrados, y su perímetro.

### Acótala [#dimensions]

En la capa Cotas, <Command id="DIMALIGNED" /> e Intro en su primera solicitud: entonces pide un objeto, y al designar un lado se acota ese lado, en paralelo a él. Coloca cada cota fuera de la parcela. <Command id="DIMANGULAR" /> en los dos lados que se encuentran en `40,0` da el ángulo entre ellos, 100°.
