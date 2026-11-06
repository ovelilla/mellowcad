---
title: "Encuadre en AutoCAD: comando ENCUADRE (PAN)"
metaTitle: "Encuadre en AutoCAD: ENCUADRE (PAN) y alias E"
description: "Cómo funciona ENCUADRE (PAN, alias E) de AutoCAD en español: arrastra la vista con la mano o la rueda, -ENCUADRE por dos puntos y dentro de otro comando."
figure: "ENCUADRE arrastrado hacia la derecha y hacia abajo, y después Intro: la placa se desliza en la vista, sin cambiar sus coordenadas."
sourceHash: "0ca3050831f3"
---

ENCUADRE (PAN en inglés) desliza la vista; nada del dibujo se mueve. Empieza con <Message id="panExit" /> y no pregunta nada más: el cursor se convierte en una mano, y arrastrar con el botón izquierdo mueve la vista con él, tantas veces como quieras, hasta que Intro o Esc lo terminan. Sin ENCUADRE, arrastrar con el botón de la rueda del ratón encuadra en cualquier momento, incluso en mitad de un comando. Cada ENCUADRE es un paso de deshacer, unido a los ZOOM y ENCUADRE de alrededor, así que <Command id="U" /> devuelve la vista. Escrito con un apóstrofo delante, `'ENCUADRE` o `'E`, funciona dentro de otro comando, que sigue después.

<Command id="-PAN" /> encuadra en cambio por dos puntos: un punto base y un segundo punto, y la vista se mueve la distancia entre ellos; o un desplazamiento escrito en la primera solicitud, como `50,0`, e Intro en la segunda. También es transparente, y es su propio paso de deshacer.

## Missing

El menú contextual que AutoCAD muestra con un clic derecho mientras encuadras, con Salir, Encuadre, Zoom, Órbita 3D, Ventana, Zoom original y Extensión.

## Questions

### ¿Cómo se llama el comando PAN en español?

ENCUADRE, con el alias `E`, y después Intro o la barra espaciadora. O sin comando: mantén pulsada la rueda del ratón y arrastra. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PAN`.

### ¿Cómo encuadro con el ratón en AutoCAD?

Mantén pulsado el botón de la rueda y arrastra: la vista sigue al cursor. Gira la rueda para acercar y alejar alrededor del cursor. En un panel táctil, ejecuta ENCUADRE y arrastra con el botón izquierdo.

### ¿Cómo encuadro mientras dibujo?

Arrastra con el botón de la rueda, o escribe `'E` en la solicitud del comando: el comando espera mientras encuadras y después vuelve a preguntar donde estaba.

### ¿Cómo encuadro una distancia exacta?

Usa <Command id="-PAN" />: escribe el desplazamiento, como `100,0`, y pulsa Intro en el segundo punto. La vista se mueve 100 unidades en X.
