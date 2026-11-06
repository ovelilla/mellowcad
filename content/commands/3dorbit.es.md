---
title: "Órbita 3D en AutoCAD: comando 3DORBITA (3DORBIT)"
metaTitle: "Órbita 3D en AutoCAD: 3DORBITA (3DORBIT) y atajo"
description: "Cómo funciona la órbita 3D de AutoCAD en español (3DORBITA, 3DO, ORBIT): girar la vista, salir, Mayús y la rueda, y volver a planta. Pruébalo gratis."
figure: "Un prisma visto primero en planta: 3DORBITA, un arrastre hacia un lado y hacia abajo, después Intro, y el prisma se ve desde encima de su esquina frontal."
sourceHash: "66fc1859c8fd"
---

3DORBITA (3DORBIT en inglés) gira la vista alrededor del dibujo mientras arrastras; nada del dibujo se mueve ni cambia. Arrastrar en horizontal gira la cámara alrededor del eje Z universal, y arrastrar arriba y abajo la sube o la baja, alrededor del centro del dibujo que queda bajo el centro de la pantalla, en proyección paralela. Empieza diciendo cómo salir: mientras se ejecuta solo puedes orbitar, e Intro o Esc lo terminan, hayas arrastrado o no.

Si mantienes pulsadas Mayús y la rueda del ratón, orbitas desde cualquier sitio, incluso dentro de otro comando, y el botón Órbita de la barra de navegación también lo ejecuta. Escrito con un apóstrofo delante, `'3DORBITA`, funciona dentro de otro comando, que sigue después. Cada arrastre es un paso para <Keyword command="ZOOM" id="Previous" /> de <Command id="ZOOM" />, y toda la ejecución es un solo paso de deshacer, así que <Command id="U" /> devuelve la vista. Para ver los sólidos como sólidos, no como alambres, usa <Command id="VSCURRENT" />; el 3D de MellowCAD es solo de sólidos y aún parcial.

## Missing

El menú contextual, con sus proyecciones, sus estilos visuales y los demás modos de navegación. Orbitar solo alrededor de los objetos designados. La perspectiva. La órbita libre y la continua (3DFORBIT y 3DCORBIT) y el resto de la navegación 3D de AutoCAD.

## Questions

### ¿Cuál es el atajo de la órbita 3D en AutoCAD?

`3DO` u `ORBIT`, y después Intro o la barra espaciadora: son los alias de 3DORBITA en AutoCAD en español, y `_3DORBIT` también funciona. Sin escribir nada, mantén pulsadas Mayús y la rueda del ratón y arrastra.

### ¿Cómo orbitar con el ratón en AutoCAD?

Mantén pulsada Mayús, pulsa la rueda del ratón y arrastra: en horizontal para girar el modelo, arriba y abajo para mirarlo desde más alto o más bajo. Suelta y vuelves al comando en el que estabas.

### ¿Cómo salir de la órbita 3D?

Pulsa Intro o Esc. La vista se queda donde la dejaste.

### ¿Cómo volver a la vista en planta después de orbitar?

Ejecuta <Command id="PLAN" /> y pulsa Intro, o <Command id="-VIEW" /> y <Keyword command="VIEW" id="Top" />, o haz clic en la cara superior del ViewCube. <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> retrocede un arrastre cada vez.
