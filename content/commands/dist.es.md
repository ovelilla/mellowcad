---
title: "Medir distancias en AutoCAD: comando DIST"
metaTitle: "Medir distancias en AutoCAD: comando DIST"
description: "Cómo funciona DIST (DI) de AutoCAD en español: la distancia entre dos puntos con sus ángulos e incrementos en X, Y y Z, o la longitud de una serie de puntos."
figure: "DIST a lo largo de la diagonal de una placa de 100 por 60: la distancia, el ángulo en el plano XY y los incrementos."
sourceHash: "31fbe420bc43"
---

DIST mide la distancia entre dos puntos. Señala, fuerza con referencia a objetos o escribe el primer punto y el segundo, y escribe en la solicitud de comando la distancia, el ángulo en el plano XY y el ángulo a partir de él, y los incrementos en X, Y y Z, y termina. Cada punto se mide donde está, con su Z, así que la distancia es la verdadera en el espacio. Intro en el primer punto parte del último punto dado, y en el segundo mide de vuelta al primero. Los números siguen la precisión del dibujo, y los ángulos AUPREC.

## Options

### Multiple

<Keyword id="Multiple" />, en la segunda solicitud: una serie de puntos en lugar de un tramo, con la distancia acumulada escrita antes de cada punto siguiente y mostrada sobre el cursor, hasta Intro o <Keyword id="Total" />.

### Arc

Mide a lo largo de arcos, con las opciones de arco de <Command id="PLINE" />: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. La longitud de cada arco se suma a la serie.

### Close

Vuelve al primer punto, suma ese último tramo, escribe el total y termina.

### Length

Añade un tramo de la longitud que escribes en la dirección del último.

### Undo

Deshace el último punto de la serie.

### Total

Escribe el total de la serie y termina; Intro hace lo mismo.

## Missing

MEDIRGEOM (MEASUREGEOM), las herramientas Medir de la cinta de opciones, que piden las solicitudes de DIST dentro de un bucle con Radio, Ángulo, Área, Volumen y Rápido: aquí el botón Distancia de la cinta ejecuta DIST. En el <Keyword id="Center" /> de la opción Arco, el ángulo incluido se lee en grados, donde AutoCAD 2027 lee ahí un número como una distancia en la dirección del cursor.

## Questions

### ¿Cuál es el comando para medir distancias en AutoCAD?

DIST, con el alias `DI`, y después Intro o la barra espaciadora. Se llama igual en AutoCAD en español y en inglés, y `_DIST` funciona en cualquier idioma.

### ¿Cómo mido una distancia en AutoCAD?

Escribe `DI` y señala los dos puntos, con referencia a objetos para caer en los puntos finales o los centros de los objetos. La distancia se escribe en la solicitud de comando con el ángulo y los incrementos.

### ¿Cómo mido la longitud total de varios tramos?

En el segundo punto elige <Keyword id="Multiple" /> y sigue señalando: la distancia acumulada se muestra en cada punto, e Intro escribe el total.

### ¿Cómo mido una distancia en 3D?

Da los puntos con su Z, o fuérzalos a objetos a su altura: DIST mide la distancia verdadera en el espacio y escribe el ángulo a partir del plano XY y el incremento en Z.

### ¿Por qué DIST muestra menos decimales de los que necesito?

Escribe las longitudes a la precisión del dibujo, dos decimales en un dibujo nuevo aquí. Pon más en <Command id="UNITS" />, hasta ocho.
