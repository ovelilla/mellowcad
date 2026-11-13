---
title: "Directriz en AutoCAD: comando DIRECTRIZ (LEADER)"
metaTitle: "Directriz en AutoCAD: DIRECTRIZ (LEADER)"
description: "Cómo funciona DIRECTRIZ (LEADER, alias DIREC) de AutoCAD en español: una línea de la flecha a su texto, la línea de conexión y el formato. Pruébalo gratis."
figure: "Un agujero y su nota: DIRECTRIZ desde el borde del círculo, dos puntos y luego dos líneas de texto; el último tramo sube, así que una línea de conexión lo une al texto."
sourceHash: "1bf39ac320fd"
---

DIRECTRIZ (LEADER en inglés) dibuja una línea de una flecha a una nota. Precisa el punto inicial, donde va la flecha, y después tantos puntos como quieras; desde el segundo la solicitud ofrece <Keyword id="Annotation" />, que también toma Intro, <Keyword id="Format" /> y <Keyword id="Undo" />. Intro en los dos primeros puntos termina el comando sin dibujar nada. Después escribe la nota línea a línea, Intro tras cada una, e Intro en una línea vacía para acabar: la directriz y su texto, un texto de líneas múltiples, se crean juntos en un solo paso, en la capa actual con el color, el tipo de línea y el grosor de línea actuales.

El texto toma su altura, su separación de la línea y su sitio del estilo de cota actual: tras el final de la directriz, o antes cuando la directriz llega por la derecha, y encima del último tramo, que sigue por debajo del texto. Cuando el último tramo sube más de 15° respecto a la horizontal, DIRECTRIZ añade una línea de conexión, un trazo horizontal tan largo como la flecha que acaba en el punto que precisaste. La flecha es la cerrada rellena, dibujada solo cuando el primer tramo mide al menos el doble que ella.

La directriz sigue a su texto: desplaza, gira o escala el texto y el final de la directriz va con él, con la línea de conexión recalculada; borra el texto y la directriz se queda, sin línea de conexión. Una directriz y su texto copiados juntos siguen siendo pareja. Los pinzamientos de la directriz están en sus puntos; la paleta Propiedades muestra su tipo, el tamaño de flecha, el desfase y la posición del texto, y su escala.

## Options

### Annotation

Pide el texto, línea a línea. Intro en la primera línea pide en su lugar otra clase de anotación: <Keyword id="Mtext" /> (por defecto) abre el editor de texto en el final de la directriz, donde Intro parte la línea y Ctrl+Intro o un clic fuera termina; <Keyword id="Copy" /> pone en el final una copia del texto de líneas múltiples, el texto de una línea o la referencia a bloque que designes, y rechaza cualquier otra cosa con <Message id="leaderCopyRefused" />; <Keyword id="None" /> dibuja solo la directriz.

### Format

Fija cómo se dibuja la directriz y vuelve a los puntos: <Keyword id="Spline" /> la convierte en una curva suave por los puntos, <Keyword id="STraight" /> vuelve a los tramos rectos, <Keyword id="Arrow" /> recupera la flecha y <Keyword id="None" /> la quita. Intro deja el formato como está.

### Undo

Deshace el último punto y vuelve a pedirlo. En el segundo punto no hay nada que deshacer, y <Message id="invalidInputCapital" /> lo dice.

## Missing

Las anotaciones Tolerancia y Bloque: MellowCAD no tiene objeto de tolerancia geométrica, y un bloque no se inserta desde DIRECTRIZ, así que la solicitud de opciones ofrece Copiar, Ninguna y textoM. Las flechas distintas de la cerrada rellena, y el color y el grosor de línea propios de la directriz que da el estilo de cota. DIRECTRIZR (QLEADER) y DIRECTRIZM (MLEADER), la directriz rápida y la directriz múltiple, aún no están: las directrices múltiples de un DXF se quedan fuera al abrirlo.

## Questions

### ¿Cómo se llama el comando directriz en inglés?

LEADER. En AutoCAD en español es DIRECTRIZ, con el alias `DIREC`; escribe uno de los dos y pulsa Intro o la barra espaciadora. `_LEADER` funciona en cualquier idioma de AutoCAD.

### ¿Qué diferencia hay entre DIRECTRIZ y DIRECTRIZM?

DIRECTRIZ es el comando antiguo: una línea de directriz y un texto aparte que la línea sigue. DIRECTRIZM (MLEADER), el que AutoCAD recomienda ahora, crea un único objeto de directriz múltiple, con estilos propios y varias líneas hacia una misma nota. MellowCAD tiene DIRECTRIZ; abre y guarda las directrices de un archivo DXF, y deja fuera sus directrices múltiples.

### ¿Cómo hago una directriz con texto?

Ejecuta DIRECTRIZ, precisa el punto al que señalas y después dónde irá el texto, pulsa Intro y escribe el texto, línea a línea. Intro en una línea vacía termina. Si pulsas Intro en la primera línea, aparecen las otras anotaciones, el editor de texto entre ellas.

### ¿Cómo cambio el tamaño de la flecha de la directriz?

Designa la directriz y cambia Tamaño de flecha en la paleta Propiedades, que lo deja solo en esa directriz; o cambia el tamaño de flecha del estilo de cota, que siguen todas las directrices de ese estilo. La longitud de la línea de conexión sigue también al tamaño de flecha.

### ¿Por qué la directriz no tiene flecha?

O la quitó Ninguna en Formato, o el primer tramo mide menos del doble del tamaño de flecha, donde AutoCAD tampoco dibuja la flecha. Precisa el segundo punto más lejos del primero, o pon un tamaño de flecha menor.
