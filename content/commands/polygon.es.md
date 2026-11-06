---
title: "Polígono en AutoCAD: POLIGONO (POLYGON)"
metaTitle: "Polígono en AutoCAD: comando POLIGONO (POLYGON)"
description: "Cómo dibuja POLIGONO (POLYGON, alias PG) un polígono regular en AutoCAD: los lados, el centro, Inscrito o Circunscrito, o un Lado. Pruébalo gratis online."
figure: "Dos círculos de radio 30, un hexágono inscrito en uno y circunscrito al otro, y un pentágono por su Lado."
sourceHash: "90e1cc9a53c4"
---

POLIGONO (POLYGON en inglés) dibuja un polígono regular, con todos sus lados y ángulos iguales, como una sola polilínea cerrada. Pide el número de lados, de 3 a 1024, después el centro y si el polígono va inscrito en un círculo o circunscrito alrededor de él, y después el radio de ese círculo. O se construye sobre uno de sus lados. El número de lados y la elección de inscrito o circunscrito son los valores por defecto del siguiente POLIGONO, en ese dibujo. Un radio escrito como número dibuja horizontal el lado de abajo; uno dado como punto, señalado o escrito, fija a la vez el tamaño y el giro del polígono. Mientras das el radio, el polígono sigue al cursor, con una línea discontinua ámbar desde el centro.

## Options

### Edge

En lugar de un centro: da los dos extremos de un lado, y el polígono se construye a partir de él en sentido contrario a las agujas del reloj.

### Inscribed

Los vértices quedan sobre el círculo: el radio va del centro a un vértice. Es la opción por defecto.

### Circumscribed

Los lados tocan el círculo en su punto medio: el radio va del centro al centro de un lado.

## Missing

El forzado de cursor girado: un radio escrito como número dibuja siempre el lado de abajo horizontal respecto al SCP, donde AutoCAD lo gira según el ángulo de forzado, SNAPANG.

## Questions

### ¿Cómo se llama el comando POLYGON en español?

POLIGONO, con el alias `PG`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_POLYGON`.

### ¿Cómo dibujo un hexágono en AutoCAD?

Ejecuta POLIGONO, escribe `6` como número de lados, da el centro, elige <Keyword id="Inscribed" /> o <Keyword id="Circumscribed" /> y escribe el radio. Entre caras planas, un hexágono circunscrito mide el doble del radio que escribes.

### ¿Qué diferencia hay entre inscrito y circunscrito?

Con <Keyword id="Inscribed" />, las esquinas del polígono tocan el círculo, así que cabe dentro de él. Con <Keyword id="Circumscribed" />, son sus lados los que tocan el círculo, así que el círculo cabe dentro del polígono. Con el mismo radio, el circunscrito es el mayor.

### ¿Cómo dibujo un polígono con una longitud de lado dada?

Elige <Keyword id="Edge" /> y da los dos extremos de un lado: `0,0` y después la longitud escrita respecto a él, como `40,0`. Los demás lados siguen en sentido contrario a las agujas del reloj.
