---
title: "Copiar en AutoCAD: COPIA (COPY)"
metaTitle: "Copiar en AutoCAD: comando COPIA (COPY)"
description: "Cómo funciona COPIA (COPY, alias CP) de AutoCAD en español, solicitud a solicitud: un punto base y tantas copias como coloques. Pruébalo gratis online."
figure: "Un círculo copiado tres veces en X desde un mismo punto base, y después Intro."
sourceHash: "e74bbdabf97c"
---

COPIA (COPY en inglés) coloca copias de los objetos que designas: los designas, das un punto base y después un segundo punto para cada copia. Como en AutoCAD, cuyo modo de copia es Múltiple por defecto, sigue pidiendo una más hasta que pulsas Intro o eliges Salir, cada copia medida desde el mismo punto base. Las copias conservan la capa, el color y todas las demás propiedades de los objetos. Si había objetos designados antes del comando, son esos los que copia, y mientras colocas una copia el conjunto sigue al cursor.

## Options

### Displacement

Se elige en la solicitud del punto base, o con Intro en ella: pide un desplazamiento como vector, `30,0` coloca una copia 30 en X, y termina. Propone el último que usó COPIA en ese dibujo.

### Exit

Termina el comando, como Intro una vez colocada una copia.

### Undo

Deshace la última copia colocada. Deshacer la primera dice <Message id="commandCompletelyUndone" /> y vuelve a pedir el segundo punto.

## Missing

No se ofrece el modo Único de COPYMODE (copiar una vez y terminar): COPIA es siempre Múltiple, así que la solicitud del punto base solo ofrece <Keyword id="Displacement" />. Tampoco se ofrece Matriz en el segundo punto, la fila de copias equidistantes de AutoCAD.

## Questions

### ¿Cómo se llama el comando COPY en español?

COPIA, con los alias `CP` y `DUP`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_COPY`.

### ¿Cómo hago varias copias a la vez?

Sigue colocando: cada punto que das es una copia más desde el mismo punto base, hasta Intro. Para copias en filas, columnas o alrededor de un centro, <Command id="ARRAY" /> las hace de una vez.

### ¿Cómo copio un objeto a una distancia exacta?

Da el punto base y escribe el segundo punto como la distancia: `30,0` lo copia 30 en X, porque la entrada dinámica lee desde el primero un punto que viene después. O apunta el cursor hacia donde quieres ir, con Orto o el rastreo polar, y escribe solo la distancia.

### ¿Por qué COPIA no tiene la opción Matriz?

MellowCAD todavía no la ofrece. Para una fila de copias equidistantes, <Command id="ARRAYRECT" /> con una fila hace lo mismo y las mantiene como una matriz que se puede editar.
