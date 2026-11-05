---
title: "Cota de radio en AutoCAD: ACORADIO (DIMRADIUS)"
metaTitle: "Acotar radios en AutoCAD: comando ACORADIO"
description: "Cómo acotar el radio de un arco, un círculo o un empalme con ACORADIO (DIMRADIUS, alias ACORAD) de AutoCAD en español. Pruébalo gratis online."
figure: "La esquina redondeada de una placa acotada por fuera y su agujero por dentro: cada curva designada y después el texto colocado."
sourceHash: "6b1cdea584be"
---

ACORADIO (DIMRADIUS en inglés) acota el radio de un círculo, un arco o un segmento de arco de una polilínea. Designa la curva y la línea de comandos dice la medida enseguida; después coloca la cota, y el comando termina. Como en AutoCAD, su texto es el radio precedido de una R, sobre una línea en la dirección de un radio que termina en una flecha sobre la curva, por dentro o por fuera de ella según donde la coloques. Por fuera, la línea sigue a través de la curva hasta el centro, como la dibuja ISO-25.

## Options

### Text

Pide el texto que se escribe en lugar de la medida, que ofrece por defecto: Intro mantiene la medida. En lo que escribes, `<>` representa la medida con su R, así que `<> TÍP.` escribe `R10 TÍP.` para un radio de 10.

### Angle

Pide el ángulo del texto, que se dibuja entonces con ese ángulo, con su centro sobre la línea, y la línea se detiene en él. 0 lo devuelve a la línea.

## Missing

La opción de texto de líneas múltiples: el texto de una cota es una sola línea, que se fija con <Keyword id="Text" /> en la línea de comandos, nunca en el editor de texto. En un arco, la flecha queda entre sus extremos, mientras que AutoCAD dibuja una línea de extensión de arco hasta una cota colocada más allá de ellos. No se puede designar una curva dentro de una referencia a bloque. Las líneas de centro del estilo (un tamaño de marca de centro negativo) no se dibujan, y sus ajustes para el texto fuera de la curva no se ofrecen: el texto va siempre a lo largo de la línea, sin tramo horizontal, como lo dibuja ISO-25. Una cota no es asociativa: no sigue a la curva que mide.

## Questions

### ¿Cómo se llama el comando DIMRADIUS en español?

ACORADIO, con el alias `ACORAD`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMRADIUS`.

### ¿Cómo acoto un empalme o una esquina redondeada?

Designa el redondeo: un empalme es un arco, o un segmento de arco de una polilínea, como las esquinas que <Command id="RECTANG" /> redondea con su opción <Keyword command="RECTANG" id="Fillet" />, y ACORADIO acepta los dos.

### ¿Por qué no puedo designar el objeto que quiero acotar?

ACORADIO acepta un círculo, un arco o un segmento de arco de una polilínea, también en una capa bloqueada. Cualquier otro objeto, una elipse incluida, dice <Message id="notCircleOrArc" /> y vuelve a preguntar; una curva dentro de una referencia a bloque aún no se puede designar.

### ¿Cómo añado texto a una cota de radio?

Elige <Keyword id="Text" /> antes de colocarla y escribe `<> TÍP.`: `<>` es la medida con su R, así que la cota dice `R10 TÍP.`. Una vez colocada, la cambia Modificar texto en la paleta Propiedades.
