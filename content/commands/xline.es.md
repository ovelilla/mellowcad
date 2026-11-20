---
title: "Línea auxiliar en AutoCAD: comando LINEAX (XLINE)"
metaTitle: "Línea auxiliar en AutoCAD: LINEAX (XLINE)"
description: "Cómo dibuja LINEAX (XLINE, alias XL) de AutoCAD líneas auxiliares infinitas: por dos puntos, horizontales, verticales, en ángulo, bisectriz o desfase."
figure: "Líneas auxiliares por un punto, una horizontal y la bisectriz del ángulo entre dos líneas, cada una cruzando toda la vista."
sourceHash: "5b81d2c75993"
---

LINEAX (XLINE en inglés) dibuja líneas de construcción: líneas de longitud infinita, que cruzan toda la vista por mucho que encuadres o hagas zoom, para trazar un dibujo antes de que entren las líneas definitivas. Precisa un punto y después un punto a atravesar: la línea auxiliar pasa por los dos, y cada punto más hace otra por el primero, hasta que Intro termina el comando. Un punto a atravesar sobre el primer punto se rechaza con <Message id="invalid" />. Cada línea auxiliar va en la capa actual con el color, el tipo de línea y el grosor de línea actuales.

Una línea auxiliar no tiene extremos: un zoom a la extensión del dibujo la deja fuera, como en AutoCAD. La referencia a objetos Punto medio encuentra el punto por el que se dibujó; Cercano, Perpendicular e Intersección funcionan a lo largo de ella, y <Command id="TRIM" /> o <Command id="BREAK" /> la convierten en un rayo, o en dos, que es como las líneas de construcción se vuelven líneas del dibujo. <Command id="RAY" /> dibuja la mitad que empieza en un punto.

## Options

### Hor

Líneas auxiliares horizontales, según el eje X del SCP, cada una por un punto que precisas, hasta Intro.

### Ver

Líneas auxiliares verticales, según el eje Y del SCP, cada una por un punto que precisas.

### Ang

Líneas auxiliares en ángulo: escríbelo, o precisa dos puntos, y después los puntos a atravesar. Intro en el ángulo toma 0. <Keyword id="Reference" /> mide el ángulo desde una línea que designas, una línea, una línea auxiliar o un rayo, en sentido contrario a las agujas del reloj: cualquier otra cosa se rechaza con <Message id="noUsableObjectSelected" />.

### Bisect

La línea auxiliar que divide un ángulo en dos: precisa su vértice, un punto en su primer lado y después un punto en su segundo lado, y la bisectriz pasa por el vértice. Cada punto más en el segundo lado hace otra bisectriz del mismo primer lado.

### Offset

Líneas auxiliares paralelas a un objeto lineal, una línea, una línea auxiliar o un rayo: indica la distancia, designa el objeto y señala el lado, una y otra vez hasta Intro. <Keyword id="Through" /> hace pasar cada una por un punto que precisas. La distancia es la que recuerda <Command id="OFFSET" />, y la que este ofrece después.

## Missing

LONGITUD (LENGTHEN) y <Command id="JOIN" /> de una línea auxiliar aún no se han comprobado frente a AutoCAD, ni los menús de sus pinzamientos.

## Questions

### ¿Cuál es el comando de línea auxiliar en AutoCAD en español?

LINEAX, con el alias `XL`, el mismo que en inglés: escríbelo y pulsa Intro o la barra espaciadora. La cinta de opciones lo llama Línea de construcción, en el grupo Dibujo ampliado; aquí está en las herramientas de Dibujo, junto a Rayo.

### ¿Cómo dibujo una línea auxiliar horizontal o vertical?

Ejecuta LINEAX, escribe la letra de <Keyword id="Hor" /> o la de <Keyword id="Ver" /> y señala los puntos por los que pasa. Horizontal y vertical son las del SCP actual.

### ¿Cómo recorto una línea auxiliar?

Con <Command id="TRIM" />, como cualquier línea: cortada por un lado, una línea auxiliar se convierte en un rayo; cortada por los dos, en una línea. Lo mismo ocurre con <Command id="BREAK" />.

### ¿Por qué ZOOM Extensión no tiene en cuenta mis líneas auxiliares?

Una línea auxiliar no tiene extensión: llega al infinito en los dos sentidos. AutoCAD deja las líneas auxiliares y los rayos fuera de la extensión del dibujo, y MellowCAD también.

### ¿Qué diferencia hay entre LINEAX y RAYO?

Una línea auxiliar llega al infinito en los dos sentidos; un rayo, de <Command id="RAY" />, empieza en un punto y va en un solo sentido.
