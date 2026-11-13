---
title: "Tipos de línea en AutoCAD: TIPOLIN (LINETYPE)"
metaTitle: "Tipos de línea en AutoCAD: comando TIPOLIN"
description: "Cómo funciona TIPOLIN (LINETYPE, alias TL) de AutoCAD en español: cargar tipos de línea de acadiso.lin, el actual, PorCapa y por qué un trazo sale continuo."
figure: "Una placa cuyo agujero se dibuja con HIDDEN actual y sus dos ejes con CENTER, y después TIPOLIN vuelve a PorCapa."
sourceHash: "d15530a865c1"
---

TIPOLIN (LINETYPE en inglés) fija el tipo de línea con que se dibujan los objetos nuevos. AutoCAD abre el Administrador de tipos de línea; MellowCAD aún no lo tiene, así que TIPOLIN ejecuta la forma de línea de comando que AutoCAD también tiene, <Command id="-LINETYPE" />. Dice el tipo de línea actual, `PorCapa` al principio, y vuelve a pedir una opción tras cada respuesta, hasta que Intro lo termina. PorCapa significa que cada objeto toma el tipo de línea de su capa; un tipo de línea nombrado en su lugar es el del propio objeto. Toda la ejecución es un paso que <Command id="U" /> deshace, y escrito con un apóstrofo dentro de un comando, su tipo de línea se aplica a lo que ese comando dibuja después.

Un dibujo tiene sus propios tipos de línea, guardados con él y en su DXF. Uno nuevo tiene seis: Continuous y, del archivo métrico de AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM y DASHDOT; los demás se cargan desde acadiso.lin, y un DXF trae los suyos, también ISO y complejos, cuyo texto, como el `GAS` de GAS_LINE, se dibuja a lo largo de la línea. El patrón se dispone en cada línea como lo dispone AutoCAD: centrado a lo largo de ella, con trazos iguales en los dos extremos, a la escala de <Command id="LTSCALE" /> y a la escala de tipo de línea del propio objeto, que fijan <Command id="CHPROP" /> y la paleta Propiedades y que CELTSCALE da a los objetos nuevos.

## Options

### ?

Enumera tipos de línea en dos columnas, nombre y descripción. En la solicitud de opciones pregunta qué archivo enumerar, acadiso.lin por defecto o acad.lin, el archivo de AutoCAD en pulgadas, y enumera sus tipos de línea en el orden del archivo; en la de Definir, los cargados en el dibujo cuyo nombre coincide con lo que escribes, todos con `*`, por orden alfabético.

### Load

Pregunta qué tipos de línea cargar, un nombre o varios separados por comas, también con comodines (`DASH*`), y después en qué archivo buscarlos, acadiso.lin al principio y luego el último en que buscaste. Cada uno que encuentra se carga y se indica, en el orden del archivo; por uno ya cargado pregunta antes, y <Keyword id="Yes" />, la opción por defecto, lo vuelve a cargar. Un nombre que el archivo no tiene, o un archivo que no sea acadiso.lin ni acad.lin, se indica.

### Set

Pide el nombre del tipo de línea y ofrece el actual; escribe el nombre de uno cargado, o <Keyword id="BYLayer" />. Uno que tiene acadiso.lin se carga antes, como hace AutoCAD; cualquier otro no se encuentra, como dice AutoCAD, y vuelve la solicitud de opciones. Intro conserva el actual.

## Missing

El Administrador de tipos de línea, y crear tipos de línea o cargarlos desde un archivo propio. Las formas de los tipos de línea complejos como BATTING o ZIGZAG, que se dibujan como los huecos que ocupan. PorBloque. PSLTSCALE y MSLTSCALE, porque no hay espacio papel. El acadiso.lin del AutoCAD de cada idioma, cuyos nombres carga AutoCAD en español o en alemán (TRAZOS, STRICHLINIE): Cargar lee el acadiso.lin inglés en todos los idiomas, aunque un dibujo hecho con ellos se abre con los suyos. PLINEGEN: una polilínea nueva empieza el patrón de nuevo en cada vértice, salvo que la opción generarTlínea de <Command id="PEDIT" /> lo active.

## Questions

### ¿Cómo se llama el comando LINETYPE en español?

TIPOLIN, con los alias `TL`, `TLINEA` y `DDLTYPE`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_LINETYPE`.

### ¿Por qué mi línea de trazos se ve continua?

Una línea más corta que una repetición de su patrón se dibuja continua, como en AutoCAD: el patrón de CENTER mide unas 51 unidades a la escala por defecto. Sube o baja <Command id="LTSCALE" /> para ajustar el patrón al dibujo. Comprueba también que el tipo de línea del objeto, o el de su capa si es PorCapa, no sea Continuous.

### ¿Cómo cambio el tipo de línea de un objeto ya dibujado?

Desígnalo y elige el tipo de línea en la fila Tipo de línea de la paleta Propiedades, o cópialo de otro objeto con <Command id="MATCHPROP" />. TIPOLIN solo fija el tipo de línea de lo que se dibuja después.

### ¿Cómo cambio la escala del tipo de línea en AutoCAD?

Escribe <Command id="LTSCALE" /> y el nuevo factor: 2 hace cada trazo el doble de largo, en todo el dibujo.

### ¿Cómo cargo un tipo de línea en AutoCAD?

AutoCAD lo carga en el Administrador de tipos de línea. Aquí, escribe `-TIPOLIN`, elige <Keyword id="Load" />, escribe el nombre del tipo de línea, como `HIDDEN2` o `ACAD_ISO02W100`, y pulsa Intro para buscarlo en acadiso.lin. <Keyword id="Set" /> carga uno que tiene acadiso.lin al hacerlo actual.
