---
title: "Desplazar en AutoCAD: DESPLAZA (MOVE)"
metaTitle: "Desplazar en AutoCAD: comando DESPLAZA (MOVE)"
description: "Cómo funciona DESPLAZA (MOVE, alias D) de AutoCAD en español, solicitud a solicitud: punto base y segundo punto, o un desplazamiento X,Y,Z. Pruébalo gratis."
figure: "Un círculo desplazado 50 a la derecha: designado, su centro como punto base y el segundo punto escrito."
sourceHash: "753ca38448bf"
---

DESPLAZA (MOVE en inglés) lleva los objetos que designas de un sitio a otro: los designas, das un punto base y después un segundo punto, y se mueven la distancia y en la dirección que van del primero al segundo. Nada más cambia en ellos. Como en AutoCAD, si había objetos designados antes del comando, son esos los que mueve; un punto se puede señalar, tomar con una referencia a objetos o escribir, y mientras eliges el segundo punto el conjunto sigue al cursor, con una línea desde el punto base. El desplazamiento es un paso que Deshacer revierte.

## Options

### Displacement

Se elige en la solicitud del punto base, o con Intro en ella, que es la opción por defecto: pide el desplazamiento como un vector, `10,5` mueve 10 en X y 5 en Y, y propone el último que usó DESPLAZA en ese dibujo. En el segundo punto, Intro hace lo mismo con el punto base: sus coordenadas son el desplazamiento.

## Missing

Dos de los modos de designación de AutoCAD en la solicitud de objetos, Grupo y Múltiple, y designar con Ctrl las caras, aristas o vértices de un sólido para darle otra forma. Mientras el conjunto sigue al cursor lleva el color de cada objeto, pero no su tipo de línea ni su grosor de línea, y los objetos de una referencia a bloque llevan todos el color de la referencia.

## Questions

### ¿Cómo se llama el comando MOVE en español?

DESPLAZA, con el alias `D`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_MOVE`.

### ¿Cómo desplazo un objeto una distancia exacta?

Da el punto base y escribe el desplazamiento como segundo punto: `50,0` lo mueve 50 en X. Con la entrada dinámica activada, como al empezar, un punto después del primero es relativo a él, así que el historial lo escribe `@50,0`. O apunta el cursor hacia donde quieres ir, con Orto o el rastreo polar, y escribe solo la distancia.

### ¿Cómo subo objetos en 3D?

Da al desplazamiento una Z: `0,0,5` como segundo punto, o como <Keyword id="Displacement" />, sube el conjunto 5. Un punto escrito sin Z queda a la elevación actual.

### ¿Qué diferencia hay entre DESPLAZA y ESTIRA?

DESPLAZA mueve objetos enteros. <Command id="STRETCH" /> mueve solo los extremos y vértices que quedan dentro de su ventana de captura, y estira los objetos a los que pertenecen.
