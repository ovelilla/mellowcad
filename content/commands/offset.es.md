---
title: "Desfase en AutoCAD: DESFASE (OFFSET)"
metaTitle: "Desfase en AutoCAD: comando DESFASE (OFFSET)"
description: "Cómo funciona DESFASE (OFFSET, alias DF) de AutoCAD en español, solicitud a solicitud: distancia o punto a Atravesar, Borrar y Capa. Pruébalo gratis online."
figure: "Un rectángulo desfasado 6 hacia dentro y un círculo 6 hacia fuera: cada uno designado y después su lado."
sourceHash: "b495af1e1410"
---

DESFASE (OFFSET en inglés) dibuja una copia de un objeto paralela a él, a la distancia que escribes o pasando por un punto que señalas: una línea da una línea paralela; un círculo o un arco, uno concéntrico; una polilínea, un contorno por dentro o por fuera, y una elipse o una spline, una spline que la sigue. Como en AutoCAD, toma un objeto cada vez: das la distancia una vez y después designas un objeto y el lado donde va su copia, tantas veces como quieras. Intro lo termina.

## Options

### Through

En lugar de una distancia, cada copia pasa por un punto que señalas o escribes. Es la opción por defecto de la primera solicitud, así que Intro la elige mientras no se haya dado una distancia; a partir de entonces, Intro repite la última distancia en ese dibujo.

### Erase

Pregunta si se borra cada objeto de origen después de desfasarlo, <Keyword id="Yes" /> o <Keyword id="No" /> (por defecto). Con <Keyword id="Yes" />, la copia sustituye al objeto. La elección se mantiene el resto de la sesión, y el siguiente DESFASE la dice en su primera línea.

### Layer

Pregunta dónde van las copias: en la capa <Keyword id="Current" /> o en la del objeto de <Keyword id="Source" /> (por defecto). También se mantiene durante la sesión.

### Exit

Termina el comando, como Intro en la solicitud del objeto.

### Multiple

En la solicitud del lado: sigue desfasando el mismo objeto sin volver a designarlo, cada copia una distancia más allá de la anterior, hasta Intro o <Keyword id="Exit" />.

### Undo

Deshace la última copia, sea del objeto que sea, y vuelve a pedir un objeto. Si no queda ninguna copia que deshacer, lo dice.

## Missing

OFFSETGAPTYPE 1 y 2: las esquinas de una polilínea desfasada se cierran siempre como con 0, alargando los segmentos hasta que se encuentran. El desfase de una spline o de una elipse queda dentro de la tolerancia de AutoCAD, pero sus nodos caen donde los pone MellowCAD, no donde los pone AutoCAD. Con punto a atravesar sobre una spline, la información de herramientas muestra X e Y, no la distancia.

## Questions

### ¿Cómo se llama el comando OFFSET en español?

DESFASE, con los alias `DF` y `EQ`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_OFFSET`.

### ¿Por qué no puedo desfasar un objeto?

DESFASE desfasa líneas, arcos, círculos, polilíneas 2D, elipses y splines. Rechaza los textos, los textos de líneas múltiples, las referencias a bloque, las cotas y los sombreados con <Message id="cannotOffsetObject" />, y lo mismo cuando la distancia reduciría a nada un círculo, un arco o una polilínea. Un objeto de una capa bloqueada no se puede designar, y una polilínea 3D se pasa por alto.

### ¿Cómo desfaso la misma línea varias veces?

Designa la línea y escribe la letra de <Keyword id="Multiple" /> en la solicitud del lado: cada punto de ese lado hace una copia más, cada una una distancia más allá de la anterior. O deja la opción por defecto y designa cada vez la copia más reciente.

### ¿Cómo pongo las copias en la capa actual?

Elige <Keyword id="Layer" /> en la primera solicitud y después <Keyword id="Current" />. Desde entonces, cada copia va a la capa actual, hasta que vuelvas a elegir <Keyword id="Source" />.
