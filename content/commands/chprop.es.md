---
title: "Cambiar propiedades en AutoCAD: CAMBPROP (CHPROP)"
metaTitle: "Cambiar propiedades en AutoCAD: comando CAMBPROP"
description: "Cómo funciona CAMBPROP (CHPROP) de AutoCAD en español: cambia color, capa, tipo de línea y su escala, grosor de línea o altura de objeto de lo que designas."
figure: "CAMBPROP en una línea que cruza el agujero de una placa: color 1 y tipo de línea CENTER, un eje, en la capa en la que estaba."
sourceHash: "4ba30c3c6070"
---

CAMBPROP (CHPROP en inglés) cambia las propiedades de los objetos que designas, en la línea de comandos: las filas General de la paleta Propiedades, preguntadas como solicitudes. Designa los objetos, o desígnalos antes del comando, y después elige una propiedad que cambiar; tras cada una vuelve a pedir otra, hasta que Intro lo termina. La solicitud de cada propiedad ofrece por defecto el valor del conjunto, <Message id="varies" /> donde los objetos difieren, e Intro ahí deja a cada objeto el suyo. Lo que fijas se aplica al terminar el comando, así que Esc deja todos los objetos como estaban. Los objetos de una capa bloqueada se cuentan y se dejan fuera, cada uno diciendo <Message id="objectOnLockedLayer" />. Toda la ejecución es un paso que <Command id="U" /> deshace.

## Options

### Color

Un número de color de 1 a 255, un nombre como `rojo`, `PORCAPA`, o <Keyword id="Truecolor" /> y su `Rojo,Verde,Azul`, como los admite <Command id="COLOR" />; lo que COLOR rechaza se rechaza aquí y se vuelve a preguntar.

### LAyer

El nombre de una capa, en mayúsculas o minúsculas. Un nombre que no puede ser de una capa dice <Message id="invalidLayerName" />, y uno que no está en el dibujo dice que no se encuentra; los dos vuelven a preguntar. CAMBPROP no crea capas.

### LType

El nombre de un tipo de línea, en mayúsculas o minúsculas, o `PorCapa`. Uno que el dibujo no ha cargado se carga desde acad.lin, el archivo de AutoCAD en pulgadas, como hace AutoCAD incluso en un dibujo métrico; un nombre que tampoco tiene ese archivo dice que no se encuentra y vuelve a la solicitud de propiedad.

### ltScale

La escala de tipo de línea propia de los objetos, que multiplica la de <Command id="LTSCALE" /> solo para ellos: una distancia, escrita o medida con dos puntos; una negativa se toma por su tamaño, y 0 dice <Message id="valueMustBeNonzero" /> y vuelve a preguntar.

### LWeight

Un grosor de línea en milímetros, redondeado al estándar más cercano como lo redondea <Command id="LWEIGHT" />, o `PorCapa`; `?` los enumera.

### Thickness

Una distancia, escrita o medida con dos puntos, también negativa o cero. Se fija en las líneas, círculos, arcos y polilíneas del conjunto, a lo largo de la normal de cada uno; de cada objeto de otro tipo dice, al terminar, que no puede cambiar su altura de objeto.

## Missing

TRansparencia, Material y aNotativo, que los objetos no tienen aquí, así que la solicitud no los muestra. PorBloque en Color, Tlínea y Grosorl, y el Por defecto de Grosorl. Un color verdadero igual a un color de índice se lee como el de índice: `255,0,0` se ofrece como `1 (rojo)`. Los libros de colores. La altura de objeto de un texto y de una definición de atributo, que se quedan como están. CAMBIA (CHANGE), cuya opción Propiedades hace la misma pregunta con eLev.

## Questions

### ¿Cómo se llama el comando CHPROP en español?

CAMBPROP, sin alias: escribe `CAMBPROP`, o `_CHPROP` en cualquier idioma de AutoCAD. Intro en la solicitud de comando lo repite.

### ¿Qué diferencia hay entre CAMBPROP y PROPIEDADES?

Cambian las mismas propiedades. <Command id="PROPERTIES" /> las muestra en una paleta, también con la geometría de cada objeto; CAMBPROP las pide en la línea de comandos, lo que te deja las manos en el teclado.

### ¿Cómo cambio el color de unos objetos desde la línea de comandos?

Escribe `CAMBPROP`, designa los objetos, pulsa Intro, elige <Keyword id="Color" /> y escribe el color, como `1` para el rojo. Pulsa Intro otra vez para terminar.

### ¿Cómo paso varios objetos a otra capa?

Ejecuta CAMBPROP, desígnalos, elige <Keyword id="LAyer" /> y escribe el nombre de la capa. La capa tiene que existir: créala antes en <Command id="LAYER" />.
