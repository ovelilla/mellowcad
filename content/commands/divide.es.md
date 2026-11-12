---
title: "Dividir en partes iguales en AutoCAD: comando DIVIDE"
metaTitle: "Dividir en partes iguales en AutoCAD: DIVIDE"
description: "Cómo funciona DIVIDE (DIV) de AutoCAD en español: puntos o bloques en partes iguales de una línea, un círculo, un arco o una polilínea. Pruébalo gratis online."
figure: "PDMODE 3 para que los puntos se vean como cruces; después una línea dividida en 5 y un círculo en 6, que empieza en su punto de 0°."
sourceHash: "6f3c52078466"
---

DIVIDE (el mismo nombre en inglés y en español) marca un objeto en partes iguales. Designa una línea, un arco, un círculo, una elipse, un arco elíptico, una polilínea, una polilínea 3D o una spline, señalándolo o escribiendo un punto sobre él, e indica el número de segmentos, de 2 a 32767: DIVIDE pone un objeto de punto en cada división y termina. No corta el objeto, que sigue entero. Un objeto abierto dividido en 5 recibe 4 puntos, desde su inicio; uno cerrado recibe 5, su inicio entre ellos: un círculo desde su punto de 0°, en sentido contrario a las agujas del reloj, y una polilínea cerrada desde su primer vértice. Los puntos quedan sobre el objeto, a su altura, en la capa actual con el color, el tipo de línea y el grosor de línea actuales.

Los puntos se dibujan como dice el estilo de punto del dibujo, y el de por defecto es un punto diminuto que se esconde bajo la línea: elige antes una figura visible con <Command id="PTYPE" /> o con PDMODE. Toda la división es un paso que <Command id="U" /> deshace, y sus puntos son el conjunto de selección Previo, listos para borrarlos o desplazarlos. Cualquier otro objeto, un texto o una referencia a bloque, recibe <Message id="cannotDivideObject" />, y el comando termina. El desplegable Puntos de las herramientas de Dibujo también inicia DIVIDE.

## Options

### Block

En lugar de puntos, referencias a un bloque que ya esté en el dibujo: indica su nombre, después si cada una se alinea con el objeto, <Keyword id="Yes" /> (por defecto) o <Keyword id="No" />, y después el número de segmentos. Alineada, cada referencia gira con el objeto en su sitio, según la línea o tangente a un arco; sin alinear, todas conservan la X del SCP. Un nombre sin bloque detrás se rechaza y se vuelve a pedir. Los atributos variables del bloque se omiten, como en AutoCAD.

## Missing

Una hélice, que MellowCAD aún no puede dibujar. Los bloques a lo largo de un objeto que no está en el plano del SCP se colocan en el plano del SCP, donde la ayuda de AutoCAD los pone en el del propio objeto. Los puntos de un círculo empiezan siempre según la X del SCP, donde AutoCAD los empieza en el ángulo de forzcursor, SNAPANG, que MellowCAD no tiene.

## Questions

### ¿Cómo se llama el comando para dividir en partes iguales en AutoCAD?

DIVIDE, con el alias `DIV`, en español y en inglés. Escribe `DIV` y pulsa Intro o la barra espaciadora; `_DIVIDE` funciona en cualquier idioma de AutoCAD.

### ¿Por qué no funciona el comando DIVIDE?

Seguramente sí funciona: los puntos están ahí, dibujados como puntos diminutos sobre la línea. Abre <Command id="PTYPE" /> (`DDPTYPE`) y elige una cruz o un círculo, o escribe PDMODE y `3`: todos los puntos del dibujo cambian a la vez. Para designarlos, usa la referencia a objetos Nodo, `PUN`.

### ¿Cómo divido una línea en partes iguales?

Ejecuta DIVIDE, designa la línea y escribe el número de partes, `5` para cinco. Los cuatro puntos entre las partes son donde engancharte: la referencia a objetos Nodo los encuentra.

### ¿Cómo divido un círculo en partes iguales?

Igual: designa el círculo y escribe el número de partes. Un objeto cerrado recibe tantos puntos como partes, así que 6 da seis puntos, el primero en el punto de 0° del círculo y después en sentido contrario a las agujas del reloj.

### ¿Cómo parto una línea en trozos separados?

DIVIDE solo marca los sitios. Para cortar la línea en ellos, usa <Command id="BREAK" />, o <Command id="BREAKATPOINT" /> en cada punto, enganchándote a él con Nodo.
