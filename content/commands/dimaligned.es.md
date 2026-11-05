---
title: "Cota alineada en AutoCAD: ACOALINEADA (DIMALIGNED)"
metaTitle: "Cota alineada en AutoCAD: comando ACOALINEADA"
description: "Cómo funciona ACOALINEADA (DIMALIGNED, alias ACOALI) de AutoCAD en español: acotar un lado inclinado con dos orígenes o un objeto. Pruébalo gratis online."
figure: "El lado inclinado de un triángulo acotado en su longitud: sus dos extremos y después dónde va la línea."
sourceHash: "243f7657ed7d"
---

ACOALINEADA (DIMALIGNED en inglés) mide la distancia real entre dos puntos: su línea de cota es paralela a la línea que los une, con el ángulo que sea, mientras que <Command id="DIMLINEAR" /> solo mide en X o en Y. Sus solicitudes son las de <Command id="DIMLINEAR" />: el origen de la primera y de la segunda línea de referencia, o Intro y designar una línea, un arco o un segmento de polilínea para tomar sus dos extremos, y después la ubicación de la línea de cota, a un lado o al otro. Un círculo designado da su diámetro a través del punto donde se designó. La línea de comandos dice la medida, y el comando termina.

## Options

### Text

Pide el texto que se escribe en lugar de la medida, que ofrece por defecto: Intro mantiene la medida. En lo que escribes, `<>` representa la medida.

### Angle

Pide el ángulo del texto, que se dibuja entonces con ese ángulo en vez de a lo largo de la línea de cota. 0 lo devuelve a la línea.

## Missing

La opción de texto de líneas múltiples: el texto de una cota es una sola línea, que se fija con <Keyword id="Text" /> en la línea de comandos, nunca en el editor de texto. Con un ángulo fijado con <Keyword id="Angle" />, AutoCAD centra el texto sobre la línea de cota; aquí queda encima, como sin él. Una cota no es asociativa: no sigue al objeto que mide.

## Questions

### ¿Cómo se llama el comando DIMALIGNED en español?

ACOALINEADA, con el alias `ACOALI`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMALIGNED`.

### ¿Qué diferencia hay entre ACOLINEAL y ACOALINEADA?

En un lado inclinado, <Command id="DIMLINEAR" /> da su anchura o su altura, según su línea de cota sea horizontal o vertical; ACOALINEADA da su longitud, con la línea paralela al lado. En un lado en X o en Y, las dos dan el mismo número.

### ¿Cómo acoto una línea inclinada en AutoCAD?

Con ACOALINEADA: pulsa Intro en la primera solicitud, designa la línea y coloca la cota en el lado que quieras. O señala sus dos extremos con la referencia a objetos Punto final, para que los orígenes sean exactos.

### ¿Cómo escribo mi propio texto en una cota?

Elige <Keyword id="Text" /> antes de colocarla y escribe el texto: `<>` representa la medida, así que `<> mm` la escribe seguida de su unidad, e Intro sin escribir nada deja solo la medida. Una vez colocada, la cambia Modificar texto en la paleta Propiedades.
