---
title: "Escalar en AutoCAD: ESCALA (SCALE)"
metaTitle: "Escalar en AutoCAD: comando ESCALA (SCALE)"
description: "Cómo funciona ESCALA (SCALE, alias ES) de AutoCAD en español: un factor, Copiar y Referencia para escalar a una medida conocida. Pruébalo gratis online."
figure: "Una placa con su agujero escalada en una copia con Referencia, respecto a su esquina: la arista de 40 señalada y convertida en 60."
sourceHash: "005829bf17ad"
---

ESCALA (SCALE en inglés) agranda o reduce los objetos que designas respecto a un punto base, que se queda donde está: un factor 2 los duplica y uno de 0.5 los reduce a la mitad, igual en todas las direcciones. Designa los objetos, precisa el punto base y escribe el factor, o mueve el cursor y señala: los objetos lo siguen. Intro ahí, sin escribir nada, escala por el último factor usado. Cada ejecución es un paso que Deshacer revierte.

Escala todo lo que toma, como AutoCAD: el patrón de un sombreado crece con su contorno, una cota mide su nueva longitud y un objeto fuera del plano se escala también en Z respecto al punto base.

## Options

### Copy

Escala una copia y deja los objetos como estaban: dice <Message id="scalingCopy" /> y vuelve a pedir el factor, con <Keyword id="Copy" /> todavía en la lista.

### Reference

Pide una longitud de referencia, escrita o señalada con dos puntos, y después la longitud que debe tener: el factor es la nueva longitud entre la de referencia. La nueva longitud se escribe, o es la distancia de un punto al punto base; <Keyword id="Points" /> pide dos puntos y mide entre ellos. Las dos longitudes ofrecen las últimas dadas, 1 en un dibujo nuevo.

## Missing

Intro en el primer o el segundo punto de <Keyword id="Points" /> termina el comando sin escalar, mientras que AutoCAD escala por lo que marca el cursor ahí. Un factor diminuto se aplica sin aviso, mientras que AutoCAD dice que lo ignora. Los objetos arrastrados se dibujan como los arrastra <Command id="MOVE" />, solo con su color.

## Questions

### ¿Cómo se llama el comando SCALE en español?

ESCALA, con el alias `ES` (en AutoCAD en español, `SC` es <Command id="SECTION" />). Como allí, el nombre inglés también funciona con un guion bajo delante: `_SCALE`.

### ¿Cómo se escala con referencia en AutoCAD?

Elige <Keyword id="Reference" /> en el factor, señala los dos extremos de una arista cuya longitud conoces y escribe la que debe tener. Todo lo designado se escala por la nueva longitud entre la antigua, así que un dibujo a un tamaño equivocado queda bien a partir de una sola medida conocida.

### ¿Cómo escalo un objeto sin perder el original?

Elige <Keyword id="Copy" /> en el factor: se escala la copia y el original se queda donde estaba.

### ¿Cómo cambio la escala del tipo de línea?

No con ESCALA, que cambia el tamaño de los objetos: <Command id="LTSCALE" /> fija lo largos que se dibujan los trazos y los huecos de todos los tipos de línea.

### ¿Cómo pongo un plano a escala para imprimir?

MellowCAD no tiene presentaciones, ventanas gráficas ni trazado: se dibuja a tamaño real en espacio modelo, y ESCALA cambia el tamaño de los propios objetos, no cómo se imprimirían.
