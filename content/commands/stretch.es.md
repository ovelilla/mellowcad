---
title: "Estirar en AutoCAD: ESTIRA (STRETCH)"
metaTitle: "Estirar en AutoCAD: comando ESTIRA (STRETCH)"
description: "Cómo funciona ESTIRA (STRETCH, alias EI) de AutoCAD en español: una ventana de captura, punto base y segundo punto, y por qué a veces solo desplaza. Pruébalo."
figure: "Un rectángulo y un círculo estirados 40 a la derecha con una ventana de captura sobre el lado derecho: las esquinas que quedan dentro se mueven, y el círculo con ellas."
sourceHash: "de8671fb4290"
---

ESTIRA (STRETCH en inglés) mueve la parte del dibujo que atrapa una ventana de captura y estira lo que la une al resto. Designa con una ventana de captura, arrastrada de derecha a izquierda, o un polígono de captura, sobre los extremos y vértices que quieres mover; después da un punto base y un segundo punto, como en <Command id="MOVE" />. Lo que atrapa la ventana se mueve esa distancia: los extremos de una línea, los vértices de una polilínea, los extremos de un arco, el contorno de un sombreado, los orígenes de una cota. Lo que queda entero dentro se mueve entero; un círculo, un texto o una referencia a bloque se mueve cuando su centro o su punto de inserción queda dentro. Los objetos designados uno a uno, o con Ventana, también se mueven enteros. El estiramiento es un paso que Deshacer revierte.

## Options

### Displacement

Se elige en la solicitud del punto base, o con Intro en ella, que es la opción por defecto: pide el movimiento como un vector, `40,0` estira 40 en X. En el segundo punto, Intro hace lo mismo con el punto base: sus coordenadas son el movimiento.

## Missing

Un arco elíptico con un extremo dentro de la ventana, que AutoCAD deforma: aquí se mueve entero si su centro está dentro, y si no, se queda. Un sombreado no asociativo atrapado en parte, que AutoCAD deja donde está. El texto de una cota en su sitio por defecto se queda cuando solo él queda atrapado.

## Questions

### ¿Cómo se llama el comando STRETCH en español?

ESTIRA, con el alias `EI`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_STRETCH`.

### ¿Por qué ESTIRA solo desplaza los objetos?

Porque el objeto entero queda dentro de la ventana, o lo has designado señalándolo: ESTIRA los mueve enteros. Arrastra una ventana de captura, de derecha a izquierda, solo sobre los extremos que quieres mover.

### ¿Cómo estiro una distancia exacta?

Da el punto base y escribe el movimiento: `40,0` estira 40 en X, relativo al punto base con la entrada dinámica activada. O apunta el cursor hacia donde quieres ir, con Orto o el rastreo polar, y escribe solo la distancia.

### ¿Se puede estirar un bloque en AutoCAD?

Una referencia a bloque se mueve entera cuando su punto de inserción queda dentro de la ventana, y se queda donde está cuando no: su interior no se estira. Aplica antes <Command id="EXPLODE" /> para estirar sus piezas.
