---
title: "Línea en AutoCAD: comando LINEA (LINE)"
metaTitle: "Línea en AutoCAD: comando LINEA (LINE) y alias"
description: "Cómo funciona LINEA (LINE, alias L) de AutoCAD en español, solicitud a solicitud: puntos señalados o escritos, desHacer y Cerrar. Pruébalo gratis online."
figure: "Un triángulo: su primer punto escrito, los dos siguientes desde el último punto, y después Cerrar."
sourceHash: "5065fc1817a1"
---

LINEA (LINE en inglés) dibuja segmentos rectos, cada uno un objeto propio: das el primer punto y después cada punto siguiente, hasta Intro. Un punto se señala, se toma con una referencia a objetos o se escribe. Como en AutoCAD con la entrada dinámica activada, un punto escrito después del primero se mide desde el anterior, así que `80,0` dibuja 80 en X y el historial lo escribe `@80,0`; un número solo es una distancia en la dirección del cursor, y `<30` fija el punto siguiente a 30°. Intro o el botón derecho en el primer punto siguen desde el final de la última línea, polilínea o arco, tangente a un arco y pidiendo solo la longitud. Dibuje los segmentos que dibuje, un solo H deshace el comando entero.

## Options

### Undo

Deshace el último segmento y vuelve a preguntar desde el punto anterior. Si no queda ningún segmento, dice <Message id="allLineSegmentsUndone" /> y vuelve a pedir el primer punto.

### Close

Se ofrece a partir del segundo segmento: dibuja el último segmento de vuelta al primer punto y termina el comando, cerrando la figura.

## Missing

Tangente o Perpendicular escritas en el primer punto esperan al siguiente (una referencia diferida), como en AutoCAD, pero solo sobre líneas, círculos y arcos, no sobre un segmento de polilínea, una elipse o una spline, y no se resuelven dos Perpendiculares diferidas.

## Questions

### ¿Cómo se llama el comando LINE en español?

LINEA, con el alias `L`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_LINE`.

### ¿Cómo dibujo una línea con un ángulo y una longitud?

Da el primer punto y escribe el siguiente como longitud y ángulo: `@100<30` dibuja 100 a 30°. O activa el rastreo polar, sigue su guía con ese ángulo y escribe solo la longitud.

### ¿Cómo sigo desde la última línea que dibujé?

Ejecuta LINEA y pulsa Intro en el primer punto: empieza desde el final de la última línea, polilínea o arco. Desde un arco, la línea sigue tangente a él y LINEA pide solo su longitud. Si no hay nada desde donde seguir, dice <Message id="noLineOrArcToContinue" />.

### ¿Por qué mi línea son trozos separados?

Cada segmento que dibuja LINEA es una línea propia, como en AutoCAD. Para un solo objeto, dibuja con <Command id="PLINE" /> o une después las líneas con <Command id="JOIN" />.
