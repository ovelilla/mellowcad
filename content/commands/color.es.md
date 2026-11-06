---
title: "Color en AutoCAD: comando COLOR"
metaTitle: "Color de objetos en AutoCAD: COLOR y PorCapa"
description: "Cómo funciona COLOR (alias COL) de AutoCAD en español: el color de los objetos nuevos, PorCapa, un color de índice por nombre o número, o RGB. Pruébalo gratis."
figure: "Una placa dibujada PorCapa, su agujero en rojo, su taladro en el color verdadero 0,128,255, y después COLOR de nuevo a PorCapa."
sourceHash: "93793c2915da"
---

COLOR, con el mismo nombre en español, fija el color con que se dibujan los objetos nuevos. AutoCAD abre el cuadro de diálogo Seleccionar color; MellowCAD aún no lo tiene, así que COLOR ejecuta la forma de línea de comando que AutoCAD también tiene, <Command id="-COLOR" />. Pide el color de objeto por defecto y ofrece el actual, `PORCAPA` en un dibujo nuevo: PorCapa significa que cada objeto toma el color de su capa, y un color elegido en su lugar es el del propio objeto. Escribe el número o el nombre de un color de índice, o elige <Keyword id="Truecolor" />. Intro conserva el color actual, y el cambio es un paso que <Command id="U" /> deshace.

Una palabra que no entiende dice <Message id="colorRequired" />, y 0, un número negativo o uno mayor que 255, <Message id="invalidColorNumber" />; después vuelve a preguntar. Escrito con un apóstrofo dentro de un comando, `'COLOR`, cada objeto dibujado después toma el color nuevo: cada segmento de <Command id="LINE" /> toma el color actual al empezar. COLOR solo fija lo que viene después; la paleta Propiedades o la lista desplegable de colores de la barra superior cambian los objetos ya dibujados.

## Options

### Truecolor

Pide un color como tres valores de 0 a 255, rojo, verde y azul, separados por comas sin espacios: `0,128,255` es un azul medio. Un color que también es un color de índice, `255,0,0`, se guarda como ese color de índice.

### BYLAYER

Los objetos nuevos toman el color de su capa, como al principio.

### RED

Color de índice 1, que también se escribe `1`.

### YELLOW

Color de índice 2, que también se escribe `2`.

### GREEN

Color de índice 3, que también se escribe `3`.

### CYAN

Color de índice 4, que también se escribe `4`.

### BLUE

Color de índice 5, que también se escribe `5`.

### MAGENTA

Color de índice 6, que también se escribe `6`.

### WHITE

Color de índice 7, que también se escribe `7`: blanco sobre un fondo oscuro y negro sobre uno claro.

## Missing

El cuadro de diálogo Seleccionar color, los cuadernos de colores y la forma HSL. Los colores de índice 8 a 255: solo se aceptan del 1 al 7. PorBloque. Un color verdadero que coincide con un color de índice se guarda como ese color de índice, donde AutoCAD conserva el RGB. La transparencia (CETRANSPARENCY) y los valores por defecto de cada tipo de objeto, HPCOLOR, HPLAYER, DIMLAYER y TEXTLAYER.

## Questions

### ¿Cómo se llama el comando COLOR en español?

COLOR, igual que en inglés, con el alias `COL`. El nombre inglés con un guion bajo delante, `_COLOR`, funciona en cualquier idioma de AutoCAD.

### ¿Cómo cambio el color de un objeto en AutoCAD?

Desígnalo y elige el color en la lista desplegable de colores de la barra superior o en la fila Color de la paleta Propiedades: cambia en un paso. O copia el color de otro objeto con <Command id="MATCHPROP" />. COLOR solo fija el color de los objetos que se dibujan después.

### ¿Qué significa PorCapa en AutoCAD?

Que el objeto toma el color de su capa, así que cambiar el color de la capa en el Administrador de propiedades de capas cambia todos los objetos PorCapa que contiene. Es el valor por defecto, y mantiene los colores de un dibujo organizados por capas: <Command id="LAYER" />.

### ¿Cómo uso colores RGB en AutoCAD?

Elige <Keyword id="Truecolor" /> y escribe los tres valores separados por comas, como `0,128,255`.
