---
title: "Matriz de camino en AutoCAD: MATRIZCAMINO (ARRAYPATH)"
metaTitle: "Matriz de camino en AutoCAD: MATRIZCAMINO"
description: "Cómo funciona MATRIZCAMINO (ARRAYPATH) de AutoCAD en español, solicitud a solicitud: la trayectoria, Medir o Dividir, los elementos, su alineación. Pruébalo."
figure: "Un cuadrado pequeño al inicio de un arco, en matriz a lo largo de él: Dividir, 7 elementos, cada uno girado con el arco."
sourceHash: "d0d77418d682"
---

MATRIZCAMINO (ARRAYPATH en inglés) copia una selección a lo largo de un camino (una línea, un arco, un círculo o una polilínea) como un solo objeto de matriz. Pide los objetos, dice el tipo y si la matriz es asociativa, pide la curva de trayectoria y muestra la matriz al momento: los elementos separados una vez y media el tamaño de la selección, tantos como caben a lo largo del camino, cada uno girado según gira el camino. Un camino abierto empieza por el extremo más cercano al punto designado; un círculo, en su ángulo 0 y en sentido antihorario. Después, una sola solicitud edita la matriz en vivo hasta que Intro la crea, con sus opciones o con los pinzamientos de la vista previa, como en AutoCAD. Los objetos designados se quedan donde están, como su primer elemento.

## Options

### ASsociative

<Keyword id="Yes" />, la opción por defecto, crea un solo objeto de matriz, que sus pinzamientos y la paleta Propiedades cambian después; <Keyword id="No" /> crea copias independientes junto a los objetos designados. La respuesta se mantiene durante la sesión, también para <Command id="ARRAYRECT" /> y <Command id="ARRAYPOLAR" />.

### Method

<Keyword id="Measure" />, la opción por defecto, coloca los elementos a una distancia, tantos como caben; <Keyword id="Divide" /> reparte un número de elementos por igual a lo largo de todo el camino, uno en cada extremo de un camino abierto.

### Items

Con <Keyword id="Divide" />, el número de elementos. Con <Keyword id="Measure" />, la distancia entre ellos y después cuántos, hasta el máximo que cabe, que indica; <Keyword id="Fill entire path" /> los toma todos.

### Align items

<Keyword id="Yes" />, la opción por defecto, gira cada elemento según gira el camino desde su inicio; <Keyword id="No" /> solo lo desplaza a lo largo de él.

### eXit

Crea la matriz y termina el comando, como Intro.

## Missing

La matriz no sigue a su camino: si editas el camino después, la matriz conserva el camino con el que se creó. Las splines, las elipses y las polilíneas 3D aún no pueden ser caminos, ni un camino fuera del plano del SCP. No se ofrecen el punto base, la dirección de la tangente, las filas, los niveles, la dirección Z ni Expresión, ni un grupo en la solicitud del camino, y los pinzamientos de la matriz no tienen menús.

## Questions

### ¿Cómo hago una matriz a lo largo de una curva?

Escribe <Command id="ARRAYPATH" />, designa los objetos, pulsa Intro y designa el camino cerca del extremo por el que debe empezar; o escribe `MA` para <Command id="ARRAY" /> y elige <Keyword command="ARRAY" id="PAth" /> después de los objetos. Luego fija la distancia o el número de elementos, y pulsa Intro para crearla.

### ¿Por qué la matriz no sigue al camino?

Aquí una matriz conserva el camino tal como era al crearla: si desplazas o estiras el camino después, la matriz se queda como está, donde la matriz de camino asociativa de AutoCAD lo seguiría. Borrar el camino también deja la matriz. Si los elementos no giran con el camino, elige <Keyword id="Align items" /> y responde <Keyword id="Yes" />.

### ¿Cómo cambio el sentido de una matriz de camino?

Designa el camino cerca de su otro extremo: un camino abierto empieza por el extremo más cercano al punto designado. Un círculo siempre va en sentido antihorario desde su ángulo 0.

### ¿Cómo reparto los elementos por igual en todo el camino?

Elige <Keyword id="Method" />, después <Keyword id="Divide" /> y después <Keyword id="Items" />, y escribe cuántos: se reparten por igual, el primero y el último en los extremos de un camino abierto.
