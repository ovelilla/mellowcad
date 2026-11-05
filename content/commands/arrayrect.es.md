---
title: "Matriz rectangular en AutoCAD: MATRIZRECTANG (ARRAYRECT)"
metaTitle: "Matriz rectangular en AutoCAD: MATRIZRECTANG"
description: "Cómo funciona MATRIZRECTANG (ARRAYRECT) de AutoCAD en español, solicitud a solicitud: columnas, filas, niveles y separación, asociativa o no. Pruébalo gratis."
figure: "Un cuadrado y su círculo en 5 columnas y 3 filas, a 16 y 14: primero el número, después la separación."
sourceHash: "c8c8d747d0c9"
---

MATRIZRECTANG (ARRAYRECT en inglés) copia una selección en columnas y filas, y en niveles si los quieres, como un solo objeto de matriz. Pide los objetos, dice el tipo y si la matriz es asociativa, y la muestra al momento: 4 columnas a lo largo del eje X del SCP y 3 filas a lo largo de su Y, separadas una vez y media el tamaño de la selección. Después, una sola solicitud la edita en vivo hasta que Intro la crea, con sus opciones o con los pinzamientos de la vista previa, como en AutoCAD: haz clic en una de sus flechas y después donde debe quedar, o escribe un número, para fijar una cantidad o una separación. Esc también crea la matriz. Los objetos designados pasan a ser su primer elemento.

## Options

### ASsociative

<Keyword id="Yes" />, la opción por defecto, crea un solo objeto de matriz: sus pinzamientos y la paleta Propiedades lo cambian después, y <Command id="EXPLODE" /> lo descompone en sus elementos. <Keyword id="No" /> crea copias independientes junto a los objetos designados. La respuesta se mantiene durante la sesión, también para <Command id="ARRAYPOLAR" /> y <Command id="ARRAYPATH" />.

### COUnt

El número de columnas y después el de filas, de 1 a 32767 cada uno.

### Spacing

La distancia entre columnas y después entre filas; si es negativa, hacia la izquierda o hacia abajo. O <Keyword id="Unit cell" />: las dos esquinas de un rectángulo cuyos lados son las dos distancias.

### COLumns

El número de columnas y la distancia entre ellas.

### Rows

El número de filas, la distancia entre ellas y la elevación que cada fila sube sobre la anterior.

### Levels

Copias apiladas a lo largo del eje Z del SCP: el número de niveles y después la distancia entre ellos, o con <Keyword id="Total" /> la distancia del primer nivel al último.

### eXit

Crea la matriz y termina el comando, como Intro.

## Missing

El punto base; <Keyword id="Total" /> en las distancias entre columnas y entre filas (<Keyword id="Levels" /> sí lo tiene); Expresión, que vincula un valor con los parámetros del dibujo. ARRAYEDIT y ARRAYCLOSE, que editan el origen de una matriz o sustituyen sus elementos. Los menús de los pinzamientos de la matriz (Conteo de columnas, Espaciado total de columnas, Ángulo de eje…) y Ctrl para recorrerlos, así que una separación total o un ángulo de eje no se pueden fijar desde un pinzamiento; tampoco escribe un pinzamiento sus líneas en la línea de comandos. En la paleta, las coordenadas X e Y del punto base no se pueden escribir de nuevo.

## Questions

### ¿Cómo hago una matriz rectangular?

Escribe <Command id="ARRAYRECT" />, que no tiene alias, o `MA` para <Command id="ARRAY" /> e Intro en su pregunta, porque la rectangular es la de por defecto. Designa los objetos y pulsa Intro: la matriz se dibuja al momento, lista para editarla.

### ¿Cómo fijo la distancia entre filas y columnas?

Elige <Keyword id="Spacing" /> y escribe la distancia entre columnas y después entre filas; una negativa va hacia la izquierda o hacia abajo. Con <Keyword id="Unit cell" />, dos esquinas dan las dos a la vez. O arrastra las flechas de la segunda columna y de la segunda fila.

### ¿Cómo hago que las copias sean objetos independientes?

Elige <Keyword id="ASsociative" /> y responde <Keyword id="No" /> antes de pulsar Intro: cada copia es un objeto propio. Una matriz asociativa se puede descomponer en sus elementos más tarde con <Command id="EXPLODE" />.

### ¿Cómo hago una matriz 3D?

Elige <Keyword id="Levels" />: las filas y columnas se copian hacia arriba a lo largo del eje Z del SCP, tantos niveles como indiques y a la distancia que des. <Keyword id="Rows" /> pide además una elevación, que sube cada fila sobre la anterior.
