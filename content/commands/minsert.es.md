---
title: "Insertar un bloque en matriz en AutoCAD: INSERTM (MINSERT)"
metaTitle: "Comando INSERTM (MINSERT) de AutoCAD"
description: "Cómo inserta INSERTM (MINSERT) de AutoCAD un bloque en filas y columnas como un solo objeto, qué pregunta y por qué DESCOMP lo rechaza. Pruébalo gratis."
figure: "Un asiento convertido en bloque y después colocado por INSERTM en tres filas de cinco: un solo objeto."
sourceHash: "d43a50bbc8fe"
---

INSERTM (MINSERT en inglés) inserta muchas veces un bloque definido en el dibujo, en filas y columnas, como un solo objeto. Pregunta lo mismo que <Command id="-INSERT" /> —el nombre del bloque (Intro toma el que ofrece, el último insertado), el punto de inserción, los factores de escala X e Y y el ángulo de rotación—, después el número de filas y el de columnas (Intro es 1) y después la distancia entre filas y la distancia entre columnas. Solo se piden las distancias que los números necesitan, y una fila de una columna es una referencia a bloque normal. Un bloque con atributos pide sus valores al final, una vez, y todas las copias los muestran.

Las filas van a lo largo del eje Y del bloque y las columnas a lo largo de su eje X, los dos girados por la rotación; las distancias están en unidades de dibujo, sea cual sea la escala, y una negativa coloca las copias hacia abajo o hacia la izquierda. En la distancia entre filas, dos puntos precisan en su lugar una casilla de unidades: su anchura es la distancia entre columnas y su altura la distancia entre filas. El resultado es el bloque InsertM de AutoCAD: se desplaza, copia, gira, escala y refleja como uno, <Command id="LIST" /> añade sus filas y columnas, y la paleta Propiedades las muestra como Columnas, Espacio entre columnas, Filas y Espacio entre filas, que se pueden escribir. <Command id="EXPLODE" /> lo cuenta como mal insertado y lo deja entero, como hace AutoCAD. Un DXF lo abre y lo guarda como el propio AutoCAD.

## Options

### ?

En el nombre del bloque: lista los bloques del dibujo, como hace <Command id="BLOCK" />, y termina.

### Scale

En el punto de inserción: pide un solo factor para los dos ejes y vuelve a pedir el punto. Después del punto no se piden los factores X e Y.

### Rotate

En el punto de inserción: pide el ángulo, que gira cada copia y la matriz entera, y vuelve a pedir el punto. Después del punto no se pide la rotación.

## Missing

En el punto de inserción, Puntobase, X, Y y Z, y en la escala X, Esquina y XYZ, como le faltan a -INSERT; la `~` que abre un archivo de dibujo; los bloques anotativos, que aquí no existen. Una cota lineal designa el INSERTM entero, no un objeto de una de sus copias. Las filas Anotativo, Unidad de bloque y Factor de unidad de la paleta Propiedades.

## Questions

### ¿Qué es el comando INSERTM en AutoCAD?

Inserción múltiple: coloca un bloque en una matriz rectangular de filas y columnas, como un solo objeto. Cambia luego los números o la separación en la paleta Propiedades.

### ¿Cómo se descompone un bloque insertado con INSERTM?

No se puede: <Command id="EXPLODE" /> dice que está mal insertado y lo deja, en AutoCAD igual que aquí, aunque pongas sus filas y columnas a 1. Inserta otra vez el bloque con <Command id="-INSERT" />, o coloca las copias con <Command id="ARRAYRECT" />, cuya matriz se descompone en sus elementos.

### ¿Cómo se llama MINSERT en AutoCAD en español?

INSERTM. No tiene alias ni botón en la cinta de opciones, así que se escribe entero; `_MINSERT` funciona en cualquier idioma de AutoCAD.

### ¿Qué diferencia hay entre INSERTM y MATRIZ?

INSERTM repite un bloque como una sola referencia que no se puede descomponer. <Command id="ARRAYRECT" /> repite cualquier objeto como una matriz asociativa, con pinzamientos para cambiar sus números y su separación, que <Command id="EXPLODE" /> descompone.
