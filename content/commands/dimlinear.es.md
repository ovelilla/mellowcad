---
title: "Acotar en AutoCAD: ACOLINEAL (DIMLINEAR)"
metaTitle: "Acotar en AutoCAD: comando ACOLINEAL (DIMLINEAR)"
description: "Cómo acotar en AutoCAD en español con ACOLINEAL (DIMLINEAR, alias ACOLIN): dos orígenes o un objeto y la línea, horizontal o vertical. Pruébalo gratis online."
figure: "Un rectángulo acotado dos veces: su lado superior por sus dos esquinas, el derecho con Intro y designándolo."
sourceHash: "e48a0a6f18c9"
---

ACOLINEAL (DIMLINEAR en inglés) mide la distancia entre dos puntos en X o en Y y la dibuja como una cota: dos líneas de referencia, una línea de cota con sus flechas y la medida encima. Precisas el origen de la primera y de la segunda línea de referencia y después la ubicación de la línea de cota, y donde la colocas elige la dirección, como en AutoCAD: por encima o por debajo de los dos puntos mide en horizontal; a su lado, en vertical. Si en la primera solicitud pulsas Intro, designas una línea, un arco, un segmento de polilínea o un círculo: sus dos extremos, o el diámetro del círculo, son los orígenes. La línea de comandos dice entonces la medida, y el comando termina.

La cota se dibuja con el estilo de cota actual, ISO-25 en un dibujo nuevo: coma decimal y sin ceros a la derecha, como en los dibujos métricos de AutoCAD. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> y <Command id="DIMROTATED" />, que solo se escriben, son ACOLINEAL con la dirección fija.

## Options

### Text

Pide el texto que se escribe en lugar de la medida, que ofrece por defecto: Intro mantiene la medida. En lo que escribes, `<>` representa la medida, así que `<> mm` la escribe seguida de su unidad.

### Angle

Pide el ángulo del texto, que se dibuja entonces con ese ángulo en vez de a lo largo de la línea de cota. 0 lo devuelve a la línea.

### Horizontal

Mide en X dondequiera que coloques la línea de cota, que queda horizontal; la solicitud ofrece entonces solo <Keyword id="Text" /> y <Keyword id="Angle" />.

### Vertical

Mide en Y dondequiera que coloques la línea de cota, que queda vertical.

### Rotated

Pide el ángulo de la línea de cota, `0` por defecto, y mide a lo largo de él la distancia entre los orígenes. En un lado inclinado, su propio ángulo da su longitud, como hace <Command id="DIMALIGNED" />.

## Missing

La opción de texto de líneas múltiples: el texto de una cota es una sola línea, que se fija con <Keyword id="Text" /> en la línea de comandos, nunca en el editor de texto. Con un ángulo fijado con <Keyword id="Angle" />, AutoCAD centra el texto sobre la línea de cota; aquí queda encima, como sin él. Una cota no es asociativa: no sigue al objeto que mide.

## Questions

### ¿Cómo se llama el comando DIMLINEAR en español?

ACOLINEAL, con los alias `ACOLIN` y `DIMLIN`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMLINEAR`.

### ¿Cuáles son los comandos para acotar en AutoCAD?

<Command id="DIMLINEAR" /> para distancias horizontales y verticales, <Command id="DIMALIGNED" /> para una distancia a lo largo de un lado inclinado, <Command id="DIMRADIUS" /> y <Command id="DIMDIAMETER" /> para arcos y círculos, <Command id="DIMANGULAR" /> para ángulos, <Command id="DIMCONTINUE" /> y <Command id="DIMBASELINE" /> para cadenas de cotas, <Command id="DIMSPACE" /> para igualar su separación y <Command id="DIMSTYLE" /> para su aspecto. DIM, el comando de AutoCAD que hace cualquier tipo de cota desde una sola solicitud, y QDIM, que acota muchos objetos de una vez (sus nombres en inglés), aún no están en MellowCAD.

### ¿Por qué la cota no sigue al objeto cuando lo modifico?

Porque las cotas de MellowCAD aún no son asociativas, como dice <Message id="nonAssociativeDimension" />: una cota conserva los puntos que se le dieron. Estíralos juntos: captura el extremo que mueves y el origen de la cota que está en él con una ventana de captura de <Command id="STRETCH" />, y la medida se vuelve a calcular; o arrastra el pinzamiento del origen a su nuevo sitio.

### ¿Cómo cambio el tamaño del texto y las flechas de las cotas?

En el estilo de cota, como en AutoCAD: <Command id="DIMSTYLE" /> (`ACES`) abre los estilos de cota, aquí en la paleta Estilos, donde AutoCAD tiene el Administrador de estilos de cota. Allí se fijan la altura de texto, el tamaño de flecha, la escala general y los decimales del estilo actual, y todas las cotas de ese estilo los siguen.
