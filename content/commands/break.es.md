---
title: "Partir en AutoCAD: comando PARTE (BREAK)"
metaTitle: "Partir en AutoCAD: comando PARTE (BREAK)"
description: "Cómo funciona PARTE (BREAK, alias P) de AutoCAD en español: la designación es el primer punto, después el segundo, o Primer punto. Pruébalo gratis online."
figure: "Una línea partida entre dos puntos dados con Primer punto, y un círculo partido desde donde se designó, en sentido contrario a las agujas del reloj, hasta un segundo punto."
sourceHash: "f351112ef2fc"
---

PARTE (BREAK en inglés) quita un tramo de un objeto, o lo divide en dos. Designa el objeto: como en AutoCAD, el punto donde lo designaste es el primer punto de ruptura, así que la siguiente solicitud pide solo el segundo, y se quita lo que queda entre los dos. Una línea, un arco, una polilínea abierta, un arco elíptico o una spline pierden lo que hay entre los puntos y pasan a ser dos objetos; un círculo o una elipse pierden lo que va en sentido contrario a las agujas del reloj del primer punto al segundo, y una polilínea cerrada lo que hay entre ellos en el orden de sus vértices: cada uno pasa a ser un solo objeto abierto. Un punto fuera del objeto se toma en su punto más cercano, y uno más allá de un extremo corta hasta ese extremo. Mientras das el segundo punto, lo que PARTE conservaría se muestra sobre el objeto. La rotura es un paso que Deshacer revierte.

## Options

### First point

En el segundo punto de ruptura: vuelve a dar el primer punto y después el segundo, cuando donde designaste el objeto no es donde empieza el hueco.

## Missing

Un arco, un círculo o una elipse que no están paralelos al SCP, que AutoCAD parte y MellowCAD no encuentra. Una elipse entera a la que <Command id="MIRROR" /> ha dado la vuelta, que AutoCAD parte en el otro sentido.

## Questions

### ¿Cómo se llama el comando BREAK en español?

PARTE, con el alias `P`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_BREAK`.

### ¿Cómo parto una línea en un punto?

Ejecuta <Command id="BREAKATPOINT" />, designa la línea y da el punto: pasa a ser dos líneas que se tocan ahí. En PARTE, escribe `@` en el segundo punto de ruptura para lo mismo.

### ¿Cómo parto una línea entre dos puntos?

Designa la línea, elige <Keyword id="First point" /> y da el primer punto y el segundo: se quita lo que hay entre ellos. O designa la línea en el primer punto y da solo el segundo.

### ¿Por qué no puedo partir un bloque o un texto?

PARTE parte líneas, arcos, círculos, polilíneas, elipses y splines. Una referencia a bloque dice <Message id="cannotBreakBlock" />, y un texto, una cota o un sombreado <Message id="objectCannotBeBroken" />; aplica antes <Command id="EXPLODE" /> a un bloque para partir sus piezas.

### ¿Hacia qué lado parte PARTE un círculo?

En sentido contrario a las agujas del reloj, del primer punto al segundo, como en AutoCAD. Da los puntos al revés para quedarte con la otra parte.
