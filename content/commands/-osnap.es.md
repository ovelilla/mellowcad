---
title: "Referencia a objetos en AutoCAD: comando -REFENT (-OSNAP)"
metaTitle: "Referencia a objetos en AutoCAD: OSNAP y -REFENT"
description: "La referencia a objetos (OSNAP) de AutoCAD en español: -REFENT fija los modos, F3 la activa y FIN, MED o Mayús + clic derecho fuerzan uno. Pruébalo gratis."
figure: "-REFENT fija Punto medio y Centro como referencias implícitas; después LINEA va del punto medio de un lado al centro del círculo, y el lado superior muestra su marcador de Punto medio."
sourceHash: "acf7c6b99589"
---

La referencia a objetos lleva un punto señalado exactamente a un punto de un objeto: un extremo, un punto medio, un centro. Con la referencia a objetos activada, el cursor cerca de uno de esos puntos muestra su marcador, en verde, y su nombre en la información de herramientas; un clic cae entonces en ese punto, no donde está el cursor. Las referencias a objetos implícitas son los modos que actúan en cada solicitud de punto: al principio Punto final, Centro, Intersección y Extensión, como en AutoCAD. F3 activa y desactiva la referencia a objetos, escribiendo `<Refent activado>` o `<Refent desactivado>`, y también el botón Referencia a objetos de la barra de estado, cuyo menú tiene una casilla para cada modo. Con varias referencias bajo el cursor gana la más cercana, y Tab recorre las demás. Orto, el rastreo polar y el modo Forzcursor nunca desvían un punto hallado por una referencia.

-REFENT (-OSNAP en inglés) fija las referencias implícitas en la línea de comandos. Muestra los modos activos y después pide una lista de modos: cada uno por sus mayúsculas, separados por comas, como en `FIN,MED,CEN`, o `_END,_MID` en cualquier idioma de AutoCAD. La lista sustituye a las referencias implícitas y activa la referencia a objetos; <Keyword id="NONe" />, <Keyword id="OFF" /> o Intro sin más las quitan todas. Un modo que no conoce recibe <Message id="invalidOsnapModes" />, y la pregunta otra vez. Escrito con un apóstrofo delante, `'-REFENT`, funciona dentro de otro comando. Las referencias implícitas duran hasta que se recarga la página, y entonces vuelven a ser las cuatro de AutoCAD: como en AutoCAD, el dibujo no las guarda.

Para un solo punto, usa una modificación de referencia: escribe las mayúsculas de un modo en una solicitud de punto, `MED` o `_MID`, o mantén pulsada Mayús y haz clic con el botón derecho para elegirlo en un menú. Solo se busca esa referencia, sean cuales sean las implícitas, y solo para ese punto; si no encuentra nada, rechaza el punto y vuelve a preguntar. Escrito por sus mayúsculas, <Keyword id="NONe" /> desactiva la referencia a objetos para un punto. El mismo menú ofrece <Command id="FROM" />: un punto base y después un desfase desde él, así que `@10,0` queda 10 a su derecha.

## Options

### ENDpoint

El extremo más cercano de una línea, un arco, un segmento de polilínea, un arco elíptico o una spline: las esquinas de un rectángulo, los vértices de un polígono. Su marcador es un cuadrado.

### MIDpoint

El punto medio de una línea, un arco, un segmento de polilínea, un arco elíptico o una spline. Un triángulo.

### CENter

El centro de un círculo, un arco o un arco de polilínea. Pasa el cursor por la propia curva: en el centro no hay nada que atrapar. Un círculo.

### QUAdrant

Los puntos de un círculo o un arco a 0°, 90°, 180° y 270°, según la X y la Y del SCP, y los extremos de los ejes de una elipse. Un rombo.

### INTersection

Donde se cruzan dos objetos, o donde una ruta de rastreo polar cruza un objeto. Una cruz.

### EXTension

Más allá del extremo de una línea, un arco o el segmento recto de una polilínea: pasa el cursor por el extremo y después aléjate siguiendo la línea del objeto. Aparece una ruta discontinua desde el extremo, y una distancia escrita se mide a lo largo de ella. Un signo más.

### INSertion

El punto de inserción de un texto, una definición de atributo o una referencia a bloque.

### PERpendicular

El pie de la perpendicular desde el último punto a una línea, también más allá de sus extremos, un círculo, un arco o un segmento de polilínea. En el primer punto de <Command id="LINE" /> espera al punto siguiente: la línea sale perpendicular al objeto. Un ángulo recto.

### TANgent

El punto de un círculo o un arco donde lo toca una línea desde el último punto. En el primer punto de <Command id="LINE" /> espera al punto siguiente: la línea sale tangente a la curva. Un círculo con una barra.

### NEArest

El punto de un objeto más cercano al cursor. Un reloj de arena.

### APParent

Intersección ficticia: donde dos objetos se cruzan en la vista, aunque estén a distintas alturas; donde se cortan de verdad, es su intersección.

### PARallel

Mantén el cursor un momento sobre una línea y después muévete en su dirección desde el último punto: una ruta paralela a la línea sujeta el punto siguiente.

### NONe

Ninguna referencia implícita: la referencia a objetos no encuentra nada hasta que se vuelve a fijar un modo.

### OFF

Lo mismo que <Keyword id="NONe" />: se quitan todas las referencias implícitas.

## Missing

El cuadro de diálogo Parámetros de dibujo que abren REFENT y REF en AutoCAD (OSNAP y OS en inglés): aquí son comandos desconocidos, y el menú de la barra de estado fija los modos. Nodo y Centro geométrico, como modos y en los menús. Punto medio entre 2 puntos, el Punto de rastreo temporal y las teclas que se mantienen pulsadas para una referencia de un solo punto (Mayús + A, Mayús + Q…). Intersección, Perpendicular y Tangente en elipses, Perpendicular y Tangente en splines, y Extensión desde el extremo de un arco de polilínea, o con su distancia y su ángulo en la información de herramientas. Una Perpendicular o una Tangente que espere al otro punto al principio de un comando que no sea <Command id="LINE" /> ni <Command id="CIRCLE" />. Los parámetros de la mira y del marcador, APERTURE y AUTOSNAP.

## Questions

### ¿Cómo se llama el comando OSNAP en español?

REFENT, con el alias `REF`: en AutoCAD abre el cuadro de diálogo Parámetros de dibujo en la ficha Referencia a objetos, para elegir las referencias implícitas. MellowCAD no tiene ese cuadro: escribe `-REFENT` o `-REF` y una lista de modos, o márcalos en el menú del botón Referencia a objetos de la barra de estado. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_-OSNAP`.

### ¿Qué tecla activa la referencia a objetos?

F3 la activa y la desactiva, como en AutoCAD; el botón Referencia a objetos de la barra de estado hace lo mismo. Mayús + clic derecho en una solicitud de punto abre el menú de las referencias para un solo punto.

### ¿Por qué no funciona la referencia a objetos?

Puede que F3 la haya desactivado: su botón de la barra de estado lo muestra. O el modo no está entre los implícitos: fíjalo con `-REFENT` o con el menú del botón. El cursor tiene que acercarse a unos 10 píxeles del punto y, para un centro, pasar por el propio círculo o arco. Las referencias solo funcionan mientras un comando pide un punto.

### ¿Cómo fuerzo una referencia a objetos para un solo punto?

En la solicitud de punto, escribe las mayúsculas del modo, como `FIN` o `TAN`, o elígelo en el menú de Mayús + clic derecho. Vale solo para ese punto, esté o no ese modo entre los implícitos.

### ¿Se guardan los modos de referencia a objetos?

Hasta que se recarga la página; entonces vuelven a ser Punto final, Centro, Intersección y Extensión. AutoCAD tampoco los guarda en el dibujo.
