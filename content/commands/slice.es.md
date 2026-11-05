---
title: "Cortar sólidos en AutoCAD: CORTE (SLICE)"
metaTitle: "Cortar sólidos en AutoCAD: comando CORTE (SLICE)"
description: "Cómo funciona CORTE (SLICE, alias CO) de AutoCAD en español: los sólidos, el plano por dos puntos, 3puntos o el SCP, y el lado que se queda. Pruébalo gratis."
figure: "Un cilindro cortado por su eje con dos puntos, conservando la mitad del lado designado: visto desde el sudeste."
sourceHash: "07b1512fb042"
---

CORTE (SLICE en inglés) corta sólidos 3D con un plano y conserva la parte de un lado, o las dos partes como dos sólidos. Pide los sólidos que vas a cortar, hasta Intro: como en AutoCAD 2027, descarta el conjunto designado antes del comando y vuelve a pedirlo, y pasa por alto lo que no es un sólido. Después, el plano: por defecto das dos puntos, y el plano pasa por ellos en vertical, perpendicular al plano XY del SCP; las opciones lo dan de otro modo. Por último, un punto del lado que quieres conservar, o Intro para conservar los dos.

El mismo plano corta todos los sólidos del conjunto. Uno que el plano no toca, o solo roza en una cara, una arista o un vértice, se queda como estaba, y CORTE lo dice. Un sólido cortado ya no es un prisma ni un cilindro, y no tiene historial. Todo el comando es un solo paso de deshacer. El 3D de MellowCAD aún es parcial: hay sólidos, pero no superficies ni mallas.

## Options

### Object

Toma el plano de un objeto que designas: un círculo, una elipse, un arco, una polilínea 2D o una spline plana, también un círculo inclinado. Una línea, o el propio sólido, no tiene plano propio: dice <Message id="unableToExtractPlane" /> y vuelve a preguntar. Intro termina el comando.

### Surface

Pide una superficie por la que cortar. MellowCAD aún no tiene superficies, así que designar dice <Message id="noSurfacesSelected" />, e Intro termina el comando.

### Zaxis

Pide un punto del plano y después un punto de su eje Z, la recta perpendicular a él. Los dos no pueden ser el mismo punto.

### View

El plano paralelo a la pantalla, por un punto que das; Intro toma 0,0,0.

### XY

El plano XY del SCP, por un punto que das: un punto a cierta altura da un corte horizontal a esa altura. Intro toma el origen del SCP.

### YZ

El plano YZ del SCP, por un punto que das; Intro toma el origen del SCP.

### ZX

El plano ZX del SCP, por un punto que das; Intro toma el origen del SCP.

### 3points

Tres puntos del plano, que entonces puede inclinarse en cualquier dirección. Es la opción por defecto de la primera solicitud, así que Intro la elige. El segundo punto tiene que ser distinto del primero, y el tercero no puede estar en la recta que pasa por ellos.

### Both

En la solicitud del lado, y es su opción por defecto, así que Intro la elige: se conservan las dos partes. El sólido se queda con una, y la otra pasa a ser un sólido nuevo con la misma capa, el mismo color, tipo de línea y grosor de línea, no los actuales. Un punto, en cambio, conserva el lado en que está y descarta el otro; un punto sobre el plano se rechaza.

## Missing

Las superficies, como plano de corte y como objetos que cortar, y las mallas. Una polilínea 3D plana como objeto del plano, que AutoCAD admite. Un toroide o un sólido de revolución cortado ni perpendicular a su eje ni a lo largo de él, y los demás cortes para los que MellowCAD aún no tiene una forma exacta, que dicen que ha fallado una operación booleana.

## Questions

### ¿Cómo se llama el comando SLICE en español?

CORTE, con el alias `CO`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_SLICE`. En español, `CO` no es <Command id="COPY" />, cuyo alias es `CP`.

### ¿Cómo se usa CORTE en AutoCAD 3D?

Designa el sólido y pulsa Intro. Señala dos puntos por los que pase el corte: el plano queda vertical, por ellos. Después señala un punto del lado que quieres conservar, o pulsa Intro para conservar las dos mitades y separa una con <Command id="MOVE" />. Para un corte inclinado, elige <Keyword id="3points" /> y da tres puntos del plano.

### ¿Puede CORTE cortar líneas u objetos 2D?

No: CORTE corta sólidos 3D y pasa por alto las líneas, las regiones y los bloques; un conjunto solo con ellos termina el comando. Para cortar objetos 2D, usa <Command id="TRIM" /> o <Command id="BREAK" />. En AutoCAD, CORTE también corta superficies y mallas, que MellowCAD aún no tiene.

### ¿Por qué dice que el plano cortante no interseca el sólido?

Porque el plano no lo toca, o solo lo roza en una cara, una arista o un vértice: ese sólido se queda entero. Revisa cómo diste el plano. Con dos puntos queda vertical, así que dos puntos de la cara superior de un sólido lo cortan en vertical, no en horizontal; para un corte horizontal, elige <Keyword id="XY" /> y da un punto a la altura del corte.
