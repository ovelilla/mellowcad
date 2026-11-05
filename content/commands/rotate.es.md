---
title: "Girar en AutoCAD: GIRA (ROTATE)"
metaTitle: "Girar en AutoCAD: comando GIRA (ROTATE)"
description: "Cómo funciona GIRA (ROTATE, alias GI) de AutoCAD en español, solicitud a solicitud: punto base y ángulo, Copiar y Referencia. Pruébalo gratis online."
figure: "Un rectángulo girado 30° sobre su esquina con Copiar: el original se conserva."
sourceHash: "0e5ae021e108"
---

GIRA (ROTATE en inglés) gira los objetos que designas alrededor de un punto base: los designas, das el punto base y después el ángulo, escrito o señalado como un punto cuya dirección desde el punto base es el ángulo. Su primera línea dice en qué sentido es positivo, el contrario a las agujas del reloj por defecto (ANGDIR), y dónde está el 0 (ANGBASE). Intro en el ángulo repite el último giro, 0 en un dibujo nuevo. Los objetos giran sobre un eje paralelo a la Z del SCP que pasa por el punto base, así que en 3D conservan su altura. El giro es un paso que Deshacer revierte.

## Options

### Copy

Gira una copia y deja los objetos donde estaban, diciendo <Message id="rotatingCopy" />. Después vuelve a pedir el ángulo.

### Reference

Gira desde un ángulo que tienes hasta el que quieres: pide el ángulo de referencia (escrito, o dos puntos que lo miden) y después el nuevo ángulo, y gira la diferencia. Para dejar horizontal una arista inclinada, señala sus dos extremos como referencia y escribe 0.

### Points

En el nuevo ángulo de Referencia: el nuevo ángulo es el de una línea entre dos puntos que señalas, así que los objetos se alinean con una arista ya dibujada.

## Missing

Mientras das el ángulo, el conjunto girado sigue al cursor con el color de cada objeto, pero no con su tipo de línea ni su grosor de línea.

## Questions

### ¿Cómo se llama el comando ROTATE en español?

GIRA, con el alias `GI`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ROTATE`.

### ¿Cómo giro un objeto para alinearlo con otro?

Elige <Keyword id="Reference" />, señala dos puntos de la arista del objeto, elige <Keyword id="Points" /> y señala dos puntos de la línea con la que debe quedar alineado.

### ¿Cómo giro un objeto y conservo el original?

Elige <Keyword id="Copy" /> antes de dar el ángulo: gira la copia y el original se queda.

### ¿Por qué GIRA gira hacia el otro lado?

Un ángulo positivo gira en sentido contrario a las agujas del reloj, como dice ANGDIR en la primera línea. Escribe un ángulo negativo, `-30`, para girar en el sentido de las agujas del reloj.
