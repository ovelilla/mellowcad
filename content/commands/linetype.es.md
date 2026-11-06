---
title: "Tipos de línea en AutoCAD: TIPOLIN (LINETYPE)"
metaTitle: "Tipos de línea en AutoCAD: comando TIPOLIN"
description: "Cómo funciona TIPOLIN (LINETYPE, alias TL) de AutoCAD en español: el tipo de línea de los objetos nuevos, PorCapa y por qué un trazo sale continuo. Pruébalo."
figure: "Una placa cuyo agujero se dibuja con HIDDEN actual y sus dos ejes con CENTER, y después TIPOLIN vuelve a PorCapa."
sourceHash: "1cae7261efc0"
---

TIPOLIN (LINETYPE en inglés) fija el tipo de línea con que se dibujan los objetos nuevos. AutoCAD abre el Administrador de tipos de línea; MellowCAD aún no lo tiene, así que TIPOLIN ejecuta la forma de línea de comando que AutoCAD también tiene, <Command id="-LINETYPE" />. Dice el tipo de línea actual, `PorCapa` al principio, y vuelve a pedir una opción tras cada respuesta, hasta que Intro lo termina. PorCapa significa que cada objeto toma el tipo de línea de su capa; un tipo de línea nombrado en su lugar es el del propio objeto. Toda la ejecución es un paso que <Command id="U" /> deshace, y escrito con un apóstrofo dentro de un comando, su tipo de línea se aplica a lo que ese comando dibuja después.

Todo dibujo tiene seis tipos de línea cargados: Continuous y, del archivo métrico de AutoCAD acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM y DASHDOT. El patrón se dispone en cada línea como lo dispone AutoCAD: centrado a lo largo de ella, con trazos iguales en los dos extremos.

## Options

### ?

Enumera tipos de línea en dos columnas, nombre y descripción. En la solicitud de opciones, los de acadiso.lin; en la de Definir, los cargados en el dibujo cuyo nombre coincide con lo que escribes, todos con `*`.

### Set

Pide el nombre del tipo de línea y ofrece el actual; escribe el nombre de uno cargado, o <Keyword id="BYLayer" />. Un nombre que no está cargado no se encuentra, como dice AutoCAD, y vuelve la solicitud de opciones; Intro conserva el actual.

## Missing

El Administrador de tipos de línea, y cargar, crear o describir tipos de línea: solo existen los seis de arriba, y la lista solo describe Continuous. Una escala de tipo de línea por objeto (CELTSCALE): solo la del dibujo, <Command id="LTSCALE" />. PorBloque. PSLTSCALE y MSLTSCALE, porque no hay espacio papel. Los nombres de tipo de línea de AutoCAD en español: aquí son ingleses en todos los idiomas. PLINEGEN: una polilínea nueva empieza el patrón de nuevo en cada vértice, salvo que la opción generarTlínea de <Command id="PEDIT" /> lo active.

## Questions

### ¿Cómo se llama el comando LINETYPE en español?

TIPOLIN, con los alias `TL`, `TLINEA` y `DDLTYPE`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_LINETYPE`.

### ¿Por qué mi línea de trazos se ve continua?

Una línea más corta que una repetición de su patrón se dibuja continua, como en AutoCAD: el patrón de CENTER mide unas 51 unidades a la escala por defecto. Sube o baja <Command id="LTSCALE" /> para ajustar el patrón al dibujo. Comprueba también que el tipo de línea del objeto, o el de su capa si es PorCapa, no sea Continuous.

### ¿Cómo cambio el tipo de línea de un objeto ya dibujado?

Desígnalo y elige el tipo de línea en la fila Tipo de línea de la paleta Propiedades, o cópialo de otro objeto con <Command id="MATCHPROP" />. TIPOLIN solo fija el tipo de línea de lo que se dibuja después.

### ¿Cómo cambio la escala del tipo de línea en AutoCAD?

Escribe <Command id="LTSCALE" /> y el nuevo factor: 2 hace cada trazo el doble de largo, en todo el dibujo.
