---
title: "Simetría en AutoCAD: comando SIMETRIA (MIRROR)"
metaTitle: "Simetría en AutoCAD: comando SIMETRIA (MIRROR)"
description: "Cómo funciona SIMETRIA (MIRROR, alias SI) de AutoCAD en español, solicitud a solicitud: dos puntos de la línea de simetría y borrar o no el origen. Pruébalo."
figure: "Un contorno cerrado reflejado respecto a una línea de simetría vertical, conservando el origen."
sourceHash: "fd4b7540311a"
---

SIMETRIA (MIRROR en inglés) refleja los objetos que designas respecto a una línea: los designas, das el primer y el segundo punto de la línea de simetría y después dices si se borran los objetos de origen. El reflejo es una copia y, con la respuesta por defecto, No, los originales se quedan: así se dibuja por mitades una pieza simétrica. Los dos puntos se toman en la planta del SCP, de modo que una línea de simetría dibujada con Orto refleja en recto, en horizontal o en vertical. Como en AutoCAD con MIRRTEXT a 0, su valor por defecto, un texto se sigue leyendo de izquierda a derecha en el reflejo, y un sombreado conserva el ángulo de su patrón. La simetría es un paso que Deshacer revierte.

## Options

### Yes

Borra los objetos de origen y solo queda el reflejo: un volteo en su sitio.

### No

La respuesta por defecto: conserva los objetos de origen junto a su reflejo.

## Missing

MIRRTEXT y MIRRHATCH se quedan en 0: un texto nunca se refleja para leerse al revés y un patrón de sombreado nunca se refleja. Un texto dentro de una referencia a bloque reflejada vuelve a leerse como uno suelto, mientras que AutoCAD lo refleja con el bloque. Una elipse reflejada conserva su normal, así que su ángulo inicial y su ángulo final se leen distintos de los de AutoCAD para la misma curva. Mientras el reflejo sigue al cursor lleva el color de cada objeto, no su tipo de línea ni su grosor de línea.

## Questions

### ¿Cómo se llama el comando MIRROR en español?

SIMETRIA, con el alias `SI`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_MIRROR`.

### ¿Cómo hago una simetría sin que el texto quede al revés?

No tienes que hacer nada: como en AutoCAD con MIRRTEXT a 0, un texto reflejado se sigue leyendo con normalidad, colocado donde cae el reflejo de su recuadro.

### ¿Cómo hago una simetría y borro el original?

Responde <Keyword id="Yes" /> cuando SIMETRIA pregunta si se borran los objetos de origen.

### ¿Cómo hago una simetría horizontal o vertical?

Activa Orto (F8) y da los dos puntos de la línea de simetría a lo largo del eje respecto al que reflejas: una línea vertical voltea izquierda y derecha; una horizontal, arriba y abajo.
