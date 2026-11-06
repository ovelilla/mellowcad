---
title: "Coordenadas de un punto en AutoCAD: comando ID"
metaTitle: "Coordenadas de un punto en AutoCAD: comando ID"
description: "Cómo funciona ID de AutoCAD en español: señala o fuerza un punto y lee su X, Y y Z en el SCP actual en la línea de comandos, también dentro de otro comando."
figure: "ID con referencia a Centro en el agujero de una placa: la X, la Y y la Z del centro."
sourceHash: "3f6bc32d12e5"
---

ID, con el mismo nombre en español, escribe las coordenadas de un punto. En `Precise punto:` señálalo, fuérzalo con una referencia a objetos o escríbelo, e ID escribe su X, su Y y su Z en una línea en la solicitud de comando, y termina. Los valores están en el SCP actual, a la precisión del dibujo. Con una referencia a objetos, la Z es la altura del objeto en ese punto; si no, la del plano de elevación. Intro lo termina sin decir nada, y los objetos designados antes de ID se descartan al empezar. Escrito con un apóstrofo delante, `'ID`, funciona dentro de otro comando, que sigue después.

## Questions

### ¿Para qué sirve el comando ID en AutoCAD?

Dice dónde está un punto: X, Y y Z, en el SCP actual. No dibuja ni cambia nada.

### ¿Cómo saco las coordenadas de un punto?

Escribe `ID` y haz clic en el punto con una referencia a objetos, Punto final o Centro, para que caiga exactamente en él. Las coordenadas se escriben en la solicitud de comando.

### ¿Cómo saco la coordenada Z de un punto?

Fuérzalo con una referencia a objetos: ID escribe la Z del objeto en ese punto. Un clic sin más da la Z del plano de elevación, 0 salvo que ELEVATION o el SCP la suban.

### ¿Por qué ID muestra unas coordenadas que no esperaba?

ID lee en el SCP actual. Si el SCP se ha desplazado o girado, los números se miden desde su origen a lo largo de sus ejes: <Command id="UCS" /> Univ para leer coordenadas universales.
