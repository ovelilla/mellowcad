---
title: "Matriz en AutoCAD: MATRIZ (ARRAY)"
metaTitle: "Matriz en AutoCAD: comando MATRIZ (ARRAY)"
description: "Cómo funciona MATRIZ (ARRAY, alias MA) de AutoCAD en español, solicitud a solicitud: matriz rectangular, polar o de camino, editada en vivo. Pruébalo gratis."
figure: "Un cuadrado y su círculo en matriz con los valores por defecto: Intro para una rectangular, 4 columnas y 3 filas."
sourceHash: "5e0a412c9f13"
---

MATRIZ (ARRAY en inglés) copia una selección siguiendo un patrón: en columnas y filas, alrededor de un centro o a lo largo de un camino. Pide los objetos y después el tipo de matriz, e Intro elige la rectangular; luego pasa la selección a <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> o <Command id="ARRAYPATH" />, que siguen sin volver a pedir los objetos. Cada uno muestra la matriz al momento y la edita en vivo, con sus opciones y sus pinzamientos, hasta que Intro la crea: un objeto de matriz, o copias sueltas si has indicado que no sea asociativa. Toda la ejecución es un solo paso que Deshacer revierte, e Intro en la solicitud de comando repite MATRIZ.

## Options

### Rectangular

Columnas y filas, y niveles apilados en Z si los quieres: <Command id="ARRAYRECT" />. Empieza con 4 columnas y 3 filas, separadas una vez y media el tamaño de la selección.

### PAth

A lo largo de una línea, un arco, un círculo o una polilínea: <Command id="ARRAYPATH" />. Pide la curva de trayectoria y coloca los elementos a lo largo de ella, cada uno girado según gira el camino.

### POlar

Alrededor de un punto central: <Command id="ARRAYPOLAR" />. Pide el centro y empieza con 6 elementos en una vuelta completa.

## Missing

El tipo que se ofrece es siempre <Keyword id="Rectangular" />: no se lee ARRAYTYPE, la variable que fija el tipo por defecto de AutoCAD.

## Questions

### ¿Cómo se llama el comando ARRAY en español?

MATRIZ, con el alias `MA`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ARRAY`. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> y <Command id="ARRAYPATH" /> no tienen alias y, escritos enteros, se saltan la pregunta del tipo.

### ¿Cómo hago una matriz polar o circular?

Elige <Keyword id="POlar" />, o ejecuta <Command id="ARRAYPOLAR" />, y precisa el punto central: la selección se copia a su alrededor, con 6 elementos al principio. Cambia cuántos son con <Keyword command="ARRAYPOLAR" id="Items" />, y el ángulo que ocupan con <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### ¿Cómo descompongo una matriz?

Desígnala y ejecuta <Command id="EXPLODE" />: la matriz se convierte en los objetos de sus elementos, cada objeto en su propia capa. Para tener copias sueltas desde el principio, responde <Keyword command="ARRAYRECT" id="No" /> a <Keyword command="ARRAYRECT" id="ASsociative" /> antes de pulsar Intro.

### ¿Cómo cambio una matriz ya creada?

Desígnala. Sus pinzamientos la cambian: el cuadrado del punto base la desplaza, las flechas cambian cuántas columnas y filas hay y su separación, y un número escrito con una flecha de cantidad activa es la nueva cantidad. La paleta Propiedades muestra sus columnas, filas y separaciones, o sus elementos y ángulos, para escribirlos de nuevo. ARRAYEDIT aún no existe.
