---
title: "Insertar bloques en AutoCAD: INSERT"
metaTitle: "Insertar un bloque en AutoCAD: comando INSERT"
description: "Cómo insertar un bloque con INSERT (alias IN) de AutoCAD en español: la paleta Bloques, o -INSERT con escala, rotación y atributos. Pruébalo gratis online."
figure: "Una silla convertida en bloque y después insertada dos veces junto a una mesa: girada 180 tras su punto y 90 con Girar antes de él."
sourceHash: "e9859c7871f3"
---

INSERT, con el mismo nombre en español, coloca un bloque definido en el dibujo como referencia: una copia más, con su propio punto, escala y rotación, dibujada a partir de la única definición que hizo <Command id="BLOCK" />. Como el INSERT de AutoCAD 2027, abre la paleta Bloques, que muestra los bloques del dibujo; haz clic en uno y la línea de comandos pide su punto de inserción, con el bloque arrastrado bajo el cursor, y después su escala y su rotación. La paleta sigue abierta, así que un bloque tras otro es un clic en cada uno.

<Command id="-INSERT" /> lo pide todo en la línea de comandos: el nombre del bloque (Intro toma el que ofrece: el último insertado o, si no, el último definido), el punto de inserción, el factor de escala X, el factor de escala Y (Intro toma el de X) y el ángulo de rotación. Un factor negativo refleja el bloque, y dos distintos lo estiran: un círculo de dentro se dibuja como una elipse. Un bloque con atributos pide después cada valor por su solicitud, ofreciendo el de por defecto. Los objetos del bloque en la capa 0 toman la capa de la referencia; los demás conservan la suya. Cada inserción es un paso que Deshacer revierte.

## Options

### ?

En el nombre del bloque: enumera los bloques del dibujo, como <Command id="BLOCK" />, y termina.

### Scale

En el punto de inserción: pide un factor para los dos ejes y vuelve a pedir el punto, con el bloque arrastrado a ese tamaño. Después del punto ya no pregunta los factores X e Y.

### Rotate

En el punto de inserción: pide el ángulo, escrito o entre dos puntos, y vuelve a pedir el punto, con el bloque arrastrado ya girado. Después del punto ya no pregunta la rotación.

## Missing

Insertar otro archivo de dibujo: solo se insertan bloques definidos en el dibujo, y un nombre que no tiene se rechaza. En el punto de inserción, las opciones de punto base, X, Y, Z, descomponer y repetir; en la escala X, Esquina y XYZ, y señalar un punto como esquina opuesta. Con factores X e Y distintos, un texto o un atributo se dibuja al tamaño de X en lugar de estirarse, y el arco de una polilínea sigue siendo un arco; una X negativa no escribe un texto al revés. ATTDIA 1, el cuadro de diálogo de atributos al insertar, y ATTREQ 0. Las filas de anotativo y de unidades del bloque en la paleta Propiedades. PorBloque: un objeto dentro de un bloque no puede tomar el color, el tipo de línea ni el grosor de línea propios de la referencia, como hace en AutoCAD uno dibujado PorBloque.

## Questions

### ¿Cómo se llama el comando INSERT en español?

INSERT, igual que en inglés, con el alias `IN`. Abre la paleta Bloques, como en AutoCAD 2027; `-IN` es <Command id="-INSERT" />, que pregunta en la línea de comandos. El nombre inglés con un guion bajo delante, `_INSERT`, funciona en cualquier idioma de AutoCAD.

### ¿Cómo inserto un bloque en AutoCAD?

Escribe `IN` y haz clic en el bloque en la paleta Bloques, o escribe `-IN` y su nombre; precisa el punto de inserción y responde la escala y la rotación, con Intro para cada valor por defecto. <Keyword id="?" /> en el nombre enumera los bloques que hay.

### ¿Cómo inserto un bloque a escala?

Escribe el factor de escala X después del punto de inserción, e Intro en el de Y para que sean iguales; o elige <Keyword id="Scale" /> antes del punto y escribe un factor para los dos. Un factor negativo refleja el bloque, como una simetría.

### ¿Cómo inserto un bloque de otro dibujo?

No desde su archivo: INSERT solo coloca bloques definidos en el dibujo. Copia una referencia (Ctrl+C), abre el dibujo donde la quieres y pégala (Ctrl+V): su bloque viene con ella, salvo que ese dibujo ya tenga un bloque con ese nombre, cuya definición se conserva.
