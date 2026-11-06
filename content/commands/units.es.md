---
title: "Unidades en AutoCAD: comando UNIDADES (UNITS)"
metaTitle: "Unidades en AutoCAD: comando UNIDADES (UNITS)"
description: "Cómo funciona UNIDADES (UNITS, alias UNS) de AutoCAD en español: el cuadro Unidades de dibujo, la precisión de 0 a 8 decimales y la escala de inserción."
figure: "UNIDADES abierto sobre una placa de 100 por 60 y después ID en su esquina opuesta: las coordenadas a la precisión del dibujo, dos decimales."
sourceHash: "1fd1973c3ebf"
---

UNIDADES (UNITS en inglés) abre el cuadro Unidades de dibujo, que fija cómo escribe el dibujo las longitudes y qué representa una unidad de dibujo. Como en AutoCAD el cuadro es modal: el comando dura hasta que Aceptar o Cancelar lo cierran, el cambio de Aceptar es un paso que <Command id="U" /> deshace, y Cancelar o Esc no cambian nada. Escrito con un apóstrofo delante, `'UNIDADES`, se abre dentro de un comando en curso, que sigue cuando el cuadro se cierra. Las unidades de la barra de estado y Unidades de dibujo del menú de la aplicación también lo abren.

El Tipo de Longitud es Decimales, y su Precisión, de 0 a 8 decimales, es la que usa cada longitud escrita: coordenadas, distancias, áreas y los valores por defecto que ofrecen las solicitudes. Un dibujo nuevo empieza aquí con dos decimales, donde la plantilla métrica de AutoCAD empieza con cuatro. La Escala de inserción dice qué es una unidad de dibujo, milímetros, centímetros o metros; la barra de estado y la entrada dinámica lo muestran. Muestra de salida enseña un punto a la precisión elegida.

## Missing

Los otros tipos de longitud, Pies y pulgadas, Ingeniería, Fraccionarios y Científicos, y la notación científica para una longitud enorme. El grupo Ángulo: los ángulos son grados decimales, en sentido contrario a las agujas del reloj desde el este, a la precisión que fija AUPREC, escrito. Las demás unidades de inserción, pulgadas y pies entre ellas; Iluminación; Dirección; y -UNIDADES, la forma de línea de comando.

## Questions

### ¿Cómo se llama el comando UNITS en español?

UNIDADES, con los alias `UNS` y `DDUNITS`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_UNITS`.

### ¿Cómo pongo las unidades del dibujo en milímetros o en metros?

Abre UNIDADES y elige Milímetros, Centímetros o Metros en Escala de inserción. Una unidad de dibujo sigue siendo una unidad: un muro de 5 m se dibuja como 5 en metros o como 5000 en milímetros. La elección dice cuál, y la barra de estado y la entrada dinámica lo muestran.

### ¿Cómo cambio el número de decimales?

Elige la Precisión en UNIDADES, de `0` a `0.00000000`. Cambia cómo se escriben las longitudes, nunca la geometría: una línea dibujada de 10.125 sigue midiendo 10.125 con cualquier precisión.

### ¿Por qué las cotas no siguen la precisión de UNIDADES?

Una cota escribe su valor con la precisión de su propio estilo de cota, no con la del dibujo. Cámbiala en <Command id="DIMSTYLE" />, en Unidades principales.

### ¿Puedo dibujar en pies y pulgadas?

Todavía no: las longitudes son decimales, y la escala de inserción ofrece milímetros, centímetros y metros. Faltan las unidades de arquitectura y de ingeniería.
