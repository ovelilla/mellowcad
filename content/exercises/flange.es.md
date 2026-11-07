---
title: "Ejercicio de AutoCAD: una brida"
metaTitle: "Ejercicio de AutoCAD 2D: brida con chavetero"
description: "Dibuja una brida en AutoCAD: un agujero central con chavetero recortado, ocho agujeros en matriz polar, ejes y diámetros, resuelto paso a paso. Gratis online."
figure: "La brida, de 140 de diámetro, con su chavetero, sus ocho agujeros y las cotas de diámetro."
sourceHash: "32f94d57ae25"
---

Dibuja esta brida, en milímetros: 140 de diámetro, un agujero central de 60 con un chavetero de 16 de ancho cuyo lado superior está a 36 del centro, ocho agujeros de 14 sobre una circunferencia de centros de 110, y sus ejes. El chavetero es un rectángulo recortado en el agujero central; los agujeros, un círculo y una matriz polar.

## Steps

### Dibuja los círculos [#circles]

En la capa Contorno, dos círculos en `0,0`, cada uno por su <Keyword command="CIRCLE" id="Diameter" />: `140` y `60`.

### Recorta el chavetero [#keyway]

<Command id="RECTANG" /> de `-8,20` a `16,16` más allá: cruza el agujero central. <Command id="TRIM" /> recorta un objeto donde lo cruzan los demás: designa el arco del agujero central entre los lados del rectángulo y después el lado inferior del rectángulo, dentro del agujero. Lo que queda es el chavetero: sus dos laterales y su lado superior.

### Haz la matriz de los agujeros [#holes]

Un agujero sobre la circunferencia de centros: un círculo en `55<22.5`, a 55 del origen y a 22,5°, con un <Keyword command="CIRCLE" id="Diameter" /> de `14`. <Command id="ARRAYPOLAR" />: desígnalo, pulsa Intro y da el centro, `0,0`; <Keyword command="ARRAYPOLAR" id="ASsociative" /> y <Keyword command="ARRAYPOLAR" id="No" /> dejan ocho círculos independientes, que se pueden designar al acotar, y <Keyword command="ARRAYPOLAR" id="Items" />, `8`, los reparte por toda la vuelta. Después, en la capa Ejes, la circunferencia de centros, en `0,0` y de diámetro `110`.

### Dibuja los ejes [#centreLines]

Todavía en la capa Ejes, dos líneas con <Command id="LINE" /> por el centro, de 156 de largo: desde `-78,0`, `156,0` en horizontal; desde `0,-78`, `0,156` hacia arriba.

### Acótala [#dimensions]

En la capa Cotas, <Command id="DIMDIAMETER" /> en el agujero central, un agujero, la circunferencia de centros y el contorno, cada uno designado donde aún no lo cruza ninguna cota; después, <Command id="DIMLINEAR" /> a lo ancho del lado superior del chavetero: 16.
