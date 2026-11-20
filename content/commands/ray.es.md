---
title: "Rayo en AutoCAD: comando RAYO (RAY)"
metaTitle: "Rayo en AutoCAD: una línea hasta el infinito"
description: "Cómo dibuja RAYO (RAY) de AutoCAD líneas de construcción que empiezan en un punto y van al infinito en un sentido, y cómo se recortan en líneas. Pruébalo."
figure: "Rayos desde un mismo punto inicial a través de tres puntos, cada uno siguiendo más allá del borde de la vista."
sourceHash: "732d6e8c23de"
---

RAYO (RAY en inglés) dibuja rayos: líneas de construcción que empiezan en un punto y llegan al infinito en un sentido. Precisa el punto inicial y después un punto a atravesar: el rayo empieza en el primero y pasa por el segundo. Cada punto más hace otro rayo desde el mismo inicio, hasta que Intro termina el comando. Un punto a atravesar sobre el inicio se rechaza con <Message id="invalid" />. Cada rayo va en la capa actual con el color, el tipo de línea y el grosor de línea actuales.

Un rayo cruza la vista por mucho que encuadres o hagas zoom, y la extensión del dibujo lo deja fuera, como en AutoCAD. La referencia a objetos Punto final encuentra su inicio; Cercano, Perpendicular e Intersección funcionan a lo largo de él. <Command id="TRIM" /> y <Command id="BREAK" /> convierten en una línea el tramo que contiene el inicio, y <Command id="EXTEND" /> lleva el inicio hacia atrás hasta un borde que tenga detrás. <Command id="XLINE" /> dibuja líneas que van en los dos sentidos.

## Missing

LONGITUD (LENGTHEN) y <Command id="JOIN" /> de un rayo aún no se han comprobado frente a AutoCAD, ni los menús de sus pinzamientos.

## Questions

### ¿Qué es el comando RAYO en AutoCAD?

Una línea de construcción con inicio: empieza en un punto y sigue para siempre en un sentido. Úsalo como referencia sobre la que dibujar, y después recórtalo en una línea o bórralo.

### ¿Tiene alias el comando RAYO?

No: AutoCAD no da alias a RAYO, así que escríbelo entero, `RAYO`. Está en el grupo Dibujo ampliado de la cinta de opciones, y aquí en las herramientas de Dibujo, junto a Línea de construcción.

### ¿Cómo hago que un rayo termine en una línea?

Recórtalo: ejecuta <Command id="TRIM" /> y designa la parte que pasa de la línea. Lo que queda desde el inicio hasta la línea es un objeto de línea.

### ¿Qué diferencia hay entre un rayo y una línea?

Una línea tiene dos extremos; un rayo tiene uno, su inicio, y sigue sin fin. En un archivo DXF un rayo se guarda como RAY, y se abre como tal.
