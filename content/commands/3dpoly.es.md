---
title: "Polilínea 3D en AutoCAD: comando 3DPOL (3DPOLY)"
metaTitle: "Polilínea 3D en AutoCAD: comando 3DPOL (3DPOLY)"
description: "Cómo funciona 3DPOL (3DPOLY, alias 3P) de AutoCAD en español: polilínea 3D de segmentos rectos, cada punto a su Z, Cerrar y desHacer, y en qué difiere de POL."
figure: "Una polilínea 3D que sube 15 en cada esquina de un rectángulo de 60 por 40 en el suelo, vista desde el sureste."
sourceHash: "b74d0c411c73"
---

3DPOL (3DPOLY en inglés) dibuja una polilínea 3D: segmentos rectos por puntos que tienen cada uno su propia Z, como un solo objeto. Precisa el punto inicial y después un punto final para cada segmento, hasta que Intro lo termina; incluso un punto inicial solo se conserva, como una polilínea de un vértice. Intro en el punto inicial se rechaza con <Message id="invalidPoint" />: no tiene la opción Continuar que tiene LINEA. Un punto escrito con Z la conserva, `30,0,15`; uno escrito sin ella, o señalado, queda a la elevación del plano de trabajo, y un punto forzado a un objeto toma la Z del objeto en ese punto. Los puntos se leen en el SCP actual.

A diferencia de una polilínea de <Command id="PLINE" />, no tiene plano, ni arcos, ni grosores, ni altura de objeto, y se dibuja continua sea cual sea su tipo de línea, que conserva. La polilínea entera es un paso que <Command id="U" /> deshace; Esc conserva lo dibujado. EDITPOL la edita con una lista de opciones más corta, y su curva Spline le ajusta una curva suave.

## Options

### Close

Desde el segundo segmento: dibuja un segmento de vuelta al punto inicial y termina.

### Undo

Deshace el último vértice y sigue desde el anterior. Si no queda ningún segmento: <Message id="all3dSegmentsUndone" />.

## Missing

Una polilínea 3D ajustada con curva aparece como Ninguna en la fila Ajustar/Suavizar de la paleta Propiedades, donde AutoCAD dice Cuadrática o Cúbica, y ahí no se puede cambiar. No puede ser contorno de un sombreado ni el camino de MATRIZCAMINO, y la paleta no tiene fila Material. La entrada dinámica pide el punto inicial en un solo cuadro, con su Z escrita tras una segunda coma, donde AutoCAD muestra campos X, Y y Z. Los menús de los pinzamientos al pasar el cursor: Estirar, Añadir vértice, Eliminar vértice y los demás.

## Questions

### ¿Cómo se llama el comando 3DPOLY en español?

3DPOL, con el alias `3P`, y después Intro o la barra espaciadora. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_3DPOLY`.

### ¿Qué diferencia hay entre POL y 3DPOL?

Una polilínea de <Command id="PLINE" /> está en un solo plano y puede tener arcos y grosores. Una polilínea 3D solo tiene segmentos rectos, pero cada vértice puede estar a una altura distinta: el trazado de una tubería, el eje de una carretera, un cable.

### ¿Cómo dibujo una polilínea 3D a distintas alturas?

Escribe cada punto con su Z, `x,y,z`, o fuérzalo a objetos que estén a las alturas que quieres. Con la entrada dinámica, un punto que viene después del primero es relativo: `60,0,15` avanza 60 en X y sube 15 desde el anterior.

### ¿Cómo suavizo una polilínea 3D?

Pásala por <Command id="PEDIT" /> y elige su curva Spline: una curva suave que los vértices enmarcan. anularcuRVatura la vuelve a dejar recta.
