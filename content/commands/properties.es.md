---
title: "Paleta Propiedades en AutoCAD: PROPIEDADES (PROPERTIES)"
metaTitle: "Paleta Propiedades en AutoCAD: PROPIEDADES"
description: "Cómo funciona la paleta PROPIEDADES (PROPERTIES, Ctrl+1) de AutoCAD en español: filas General y Geometría, *VARIOS*, un tipo de objeto cada vez. Pruébalo."
figure: "Un círculo designado en la solicitud Comando, con sus pinzamientos, y después PROPIEDADES: la paleta se abre junto al dibujo con las filas del círculo."
sourceHash: "696137498888"
---

PROPIEDADES (PROPERTIES en inglés) abre la paleta Propiedades. Como en AutoCAD es una paleta, no un cuadro de diálogo: se queda abierta junto al dibujo, aquí como una pestaña del panel de paletas, mientras designas y dibujas, hasta que <Command id="PROPERTIESCLOSE" /> la cierra. Ctrl+1 la muestra y la oculta, y escrito con un apóstrofo delante, `'PROPIEDADES`, se abre dentro de un comando en curso. En una ventana ancha está abierta desde el principio.

Con objetos designados muestra sus propiedades, y cambias una escribiendo o eligiendo un valor nuevo en su fila. Primero va General, en el orden de AutoCAD: Color, Capa, Tipo de línea, Grosor de línea y Altura de objeto, con `*VARIOS*` donde los objetos designados difieren. Debajo, las filas propias de cada tipo: el inicio y el fin de una línea, su longitud y su ángulo; el centro, el radio, el diámetro, la circunferencia y el área de un círculo; las de un arco, una elipse, los vértices y grosores de una polilínea, los puntos de una spline, las de un texto o una referencia a bloque. Las coordenadas están en el SCP actual, y las filas que solo informan, como la longitud de una línea, aparecen en gris. La lista desplegable de arriba ofrece `Todos` y cada tipo con su número: elige uno para ver y editar solo ese tipo. Sin nada designado, General muestra la capa, el color, el tipo de línea y el grosor actuales, que ahí se fijan para los objetos nuevos. Cada edición es un paso que <Command id="U" /> deshace.

## Missing

La escala del tipo de línea, el estilo de trazado, la transparencia y el hipervínculo de General, y el material. Las filas de geometría de varios objetos del mismo tipo a la vez, el contenido de un texto y los valores de los atributos no se editan aquí. Selección rápida, el conmutador de PICKADD, ocultar automáticamente, anclar y dejar flotante la paleta.

## Questions

### ¿Cómo se llama el comando PROPERTIES en español?

PROPIEDADES, con el alias `PR`, y Ctrl+1, que la vuelve a ocultar. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PROPERTIES`.

### Ha desaparecido la paleta Propiedades: ¿cómo la recupero?

Pulsa Ctrl+1 o escribe `PR`: la paleta vuelve a verse, como pestaña del panel de paletas junto al dibujo. Ctrl+1 pulsado mientras se ve la oculta, y a menudo es así como desapareció.

### ¿Cómo cambio las propiedades de varios objetos a la vez?

Desígnalos todos y cambia la fila: cada objeto designado toma el valor nuevo. Una fila cuyos valores difieren dice `*VARIOS*` hasta que la fijas. Para cambiar solo los círculos de entre ellos, por ejemplo, elige ese tipo en la lista desplegable de arriba.

### ¿Qué diferencia hay entre PROPIEDADES e IGUALARPROP?

PROPIEDADES muestra y fija los valores de los objetos designados. <Command id="MATCHPROP" /> los copia de un objeto a otros, sin escribir ningún valor.
