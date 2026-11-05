---
title: "Matriz polar en AutoCAD: MATRIZPOLAR (ARRAYPOLAR)"
metaTitle: "Matriz polar en AutoCAD: comando MATRIZPOLAR"
description: "Cómo funciona MATRIZPOLAR (ARRAYPOLAR) de AutoCAD en español, solicitud a solicitud: el centro, los elementos, el ángulo de relleno y el giro. Pruébalo gratis."
figure: "Un agujero de una brida en matriz alrededor del centro de la brida: 8 elementos en una vuelta completa."
sourceHash: "efed541dea7f"
---

MATRIZPOLAR (ARRAYPOLAR en inglés) copia una selección alrededor de un punto central, como un solo objeto de matriz. Pide los objetos, dice el tipo y si la matriz es asociativa, pide el punto central y muestra la matriz al momento: 6 elementos en una vuelta completa, cada uno girado a medida que da la vuelta. Después, una sola solicitud la edita en vivo hasta que Intro la crea, con sus opciones o con los pinzamientos de la vista previa, como en AutoCAD. Los objetos designados pasan a ser su primer elemento.

## Options

### ASsociative

<Keyword id="Yes" />, la opción por defecto, crea un solo objeto de matriz, que sus pinzamientos y la paleta Propiedades cambian después; <Keyword id="No" /> crea copias independientes junto a los objetos designados. La respuesta se mantiene durante la sesión, también para <Command id="ARRAYRECT" /> y <Command id="ARRAYPATH" />.

### Items

El número de elementos, de 1 a 32767; se mantiene el ángulo que ocupan.

### Angle between

El ángulo de un elemento al siguiente. El ángulo de relleno pasa a ser ese número de pasos, en el mismo sentido, y una vuelta completa cuando llegan a 360°.

### Fill angle

El ángulo que ocupan los elementos, positivo en sentido antihorario y negativo en sentido horario; se mantiene el número de elementos. En una vuelta completa, los elementos quedan a una vuelta dividida entre su número; en menos, el último cae al final del ángulo.

### ROTate items

<Keyword id="Yes" />, la opción por defecto, gira cada elemento a medida que rodea el centro; <Keyword id="No" /> solo lo desplaza, así que todos quedan orientados como el primero.

### eXit

Crea la matriz y termina el comando, como Intro.

## Missing

El punto base; el eje de rotación, para una matriz alrededor de un eje en el espacio; <Keyword id="ROWs" /> y Niveles, para anillos de elementos y copias apiladas en Z; Expresión, que vincula un valor con los parámetros del dibujo. Los menús de los pinzamientos de la matriz (Radio de estiramiento, Conteo de elementos, Ángulo de relleno…) y Ctrl para recorrerlos.

## Questions

### ¿Cómo hago una matriz polar?

Escribe <Command id="ARRAYPOLAR" />, designa los objetos, pulsa Intro y precisa el punto central; o escribe `MA` para <Command id="ARRAY" /> y elige <Keyword command="ARRAY" id="POlar" /> después de los objetos. Luego elige <Keyword id="Items" /> para fijar cuántos son, y pulsa Intro para crearla.

### ¿Cómo hago una matriz en solo una parte del círculo?

Elige <Keyword id="Fill angle" /> y escribe el ángulo: 180 reparte los elementos en medio círculo en sentido antihorario, y -180 en sentido horario. Se mantiene el número de elementos, el primero y el último en los extremos del ángulo.

### ¿Cómo evito que los elementos giren?

Elige <Keyword id="ROTate items" /> y responde <Keyword id="No" />: cada elemento se desplaza alrededor del centro sin girar.

### ¿Cómo cambio el radio de una matriz polar?

Designa la matriz y arrastra su pinzamiento cuadrado del punto base hacia el centro o alejándolo de él: la distancia al centro es el nuevo radio. O escribe de nuevo el Radio en la paleta Propiedades.
