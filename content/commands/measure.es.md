---
title: "Graduar en AutoCAD: comando GRADUA (MEASURE)"
metaTitle: "Graduar en AutoCAD: comando GRADUA (MEASURE)"
description: "Cómo funciona GRADUA (MEASURE, alias GD) de AutoCAD en español: puntos o bloques cada cierta longitud a lo largo de un objeto, desde el extremo designado."
figure: "Una polilínea de 190 graduada cada 15 desde el extremo designado: doce puntos, el último a 10 del otro extremo."
sourceHash: "3975c3873eff"
---

GRADUA (MEASURE en inglés) marca un objeto cada cierta longitud. Designa una línea, un arco, un círculo, una elipse, un arco elíptico, una polilínea, una polilínea 3D o una spline, e indica la longitud, escrita o con dos puntos: GRADUA pone un objeto de punto cada esa longitud a lo largo del objeto, hasta donde quepa uno, y termina. No mide una distancia por ti ni corta el objeto. Empieza en el extremo más cercano al punto donde designaste, así que designa cerca del extremo desde el que quieras medir; lo que sobra queda en el otro extremo, y cuando la longitud cabe un número entero de veces, el otro extremo también recibe un punto. Un círculo empieza en su punto de 0° y va en sentido contrario a las agujas del reloj, lo designes donde lo designes; una polilínea cerrada empieza en su primer vértice.

Los puntos se dibujan como dice el estilo de punto del dibujo, un punto diminuto por defecto: elige antes una figura visible con <Command id="PTYPE" /> o con PDMODE. Los puntos quedan sobre el objeto, en la capa actual con el color, el tipo de línea y el grosor de línea actuales; todo es un paso que <Command id="U" /> deshace, y los puntos son el conjunto de selección Previo. Una longitud mayor que el objeto recibe <Message id="objectNotThatLong" />, y una tan corta que haría más de 32767 puntos, <Message id="objectTooLong" />; ninguna de las dos crea nada. Cualquier otro objeto recibe <Message id="cannotMeasureObject" />. El desplegable Puntos de las herramientas de Dibujo también inicia GRADUA.

## Options

### Block

En lugar de puntos, referencias a un bloque que ya esté en el dibujo: indica su nombre, después si cada una se alinea con el objeto, <Keyword id="Yes" /> (por defecto) o <Keyword id="No" />, y después la longitud. Alineada, cada referencia gira con el objeto en su sitio, según la línea o tangente a un arco, empiece la graduación por el extremo que empiece; sin alinear, todas conservan la X del SCP. Un nombre sin bloque detrás se rechaza y se vuelve a pedir.

## Missing

Hacia dónde va una polilínea cerrada designada pasada su mitad: aquí se gradúa hacia atrás desde su primer vértice, como AutoCAD gradúa una elipse o una spline cerradas, pero no se ha comprobado qué hace AutoCAD con una polilínea. Los puntos de un círculo empiezan siempre según la X del SCP, donde AutoCAD los empieza en el ángulo de forzcursor, SNAPANG, que MellowCAD no tiene.

## Questions

### ¿Cómo se llama el comando MEASURE en español?

GRADUA, con el alias `GD`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_MEASURE`.

### ¿Sirve GRADUA para medir distancias?

No: pone puntos a una longitud que tú das. Para medir la distancia entre dos puntos, usa <Command id="DIST" />; para la longitud de un objeto, <Command id="LIST" /> o <Command id="AREA" />.

### ¿Desde qué extremo empieza GRADUA?

Desde el extremo más cercano al punto donde designaste el objeto. Desígnalo cerca del extremo desde el que quieras medir la primera longitud.

### ¿Por qué no veo los puntos que hace GRADUA?

Se dibujan como puntos diminutos, el estilo de punto por defecto. Abre <Command id="PTYPE" /> y elige una cruz o un círculo, o pon PDMODE a `3`: todos los puntos cambian a la vez.

### ¿Qué diferencia hay entre GRADUA y DIVIDE?

<Command id="DIVIDE" /> parte un objeto en un número de partes iguales; GRADUA avanza por él a una longitud dada y deja lo que sobra en el otro extremo.
