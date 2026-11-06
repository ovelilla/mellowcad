---
title: "Elipse en AutoCAD: comando ELIPSE (ELLIPSE)"
metaTitle: "Elipse en AutoCAD: comando ELIPSE (ELLIPSE)"
description: "Cómo funciona ELIPSE (ELLIPSE, alias EL) de AutoCAD en español: un eje y el otro semieje, por su Centro, Rotación o un Arco elíptico. Pruébalo gratis."
figure: "Una elipse por los dos extremos de un eje, otra por su Centro, y medio Arco elíptico, de 0 a 180 grados."
sourceHash: "2ee0d1b3a8a4"
---

ELIPSE (ELLIPSE en inglés) dibuja una elipse a partir de los dos extremos de un eje y después la distancia de su centro al extremo del otro eje: la mitad de la longitud del otro eje. Cualquiera de los dos ejes puede ser el mayor. Es una elipse de verdad, como la de AutoCAD, no una polilínea, así que las referencias Centro, Cuadrante y Cercano la encuentran, y sus pinzamientos la desplazan y fijan cada semieje. Mientras das el segundo extremo, una línea discontinua ámbar sale del primero; en la distancia, la elipse sigue al cursor. La elipse se crea en la capa actual, con las propiedades actuales en el momento en que queda fijada.

## Options

### Arc

Dibuja un arco elíptico: las mismas solicitudes que una elipse, y después un ángulo inicial y un ángulo final, en sentido contrario a las agujas del reloj desde el extremo del primer eje que diste.

### Center

Empieza por el centro: después el extremo de un eje, y después la distancia al otro.

### Rotation

En lugar de la distancia: el ángulo que se gira la elipse alrededor de su primer eje, como un círculo visto con ese ángulo. 0 dibuja un círculo; un ángulo a menos de 0,6 grados de 90 se rechaza con <Message id="invalid" />.

### Parameter

En un arco, en lugar del ángulo inicial o final: el ángulo sobre el círculo desde el que se dibuja la elipse, el parámetro de AutoCAD. <Keyword id="Angle" /> vuelve a los ángulos.

### Included angle

En un arco, en lugar del ángulo final: cuánto recorre desde el inicio. Intro toma 180, media elipse.

## Missing

Isocírculo, que AutoCAD ofrece solo con el estilo de forzado isométrico, que aquí no está hecho. PELLIPSE 1, una elipse dibujada como polilínea. Sombrear o acotar una elipse, y las referencias Intersección, Tangente y Perpendicular sobre ella. Los pinzamientos en flecha de los extremos de un arco elíptico, aquí cuadrados, y escribir una longitud o un ángulo con un pinzamiento activo. Un punto con Z en la distancia se mide en planta, donde AutoCAD lo mide en el espacio.

## Questions

### ¿Cómo se llama el comando ELLIPSE en español?

ELIPSE, con el alias `EL`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ELLIPSE`.

### ¿Cómo dibujo media elipse en AutoCAD?

Elige <Keyword id="Arc" />, da el eje y la distancia, y después un ángulo inicial de `0` y un ángulo final de `180`. O pulsa Intro en <Keyword id="Included angle" />, que recorre 180 por defecto.

### ¿Cómo dibujo una elipse desde su centro?

Elige <Keyword id="Center" />, da el centro, después el extremo de un eje y después la distancia del centro al extremo del otro: los dos semiejes de la elipse.

### ¿Cómo dibujo un círculo isométrico en AutoCAD?

AutoCAD lo dibuja con la opción Isocírculo de ELIPSE, una vez que el estilo de forzado es isométrico. Ninguna de las dos cosas está hecha aún en MellowCAD.
