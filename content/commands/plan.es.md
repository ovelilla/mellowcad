---
title: "Vista en planta en AutoCAD: comando PLANTA (PLAN)"
metaTitle: "Vista en planta en AutoCAD: PLANTA (PLAN)"
description: "Cómo funciona PLANTA (PLAN) de AutoCAD en español: la vista en planta del SCP actual, de uno guardado o del Universal, y cómo volver a la planta. Pruébalo."
figure: "La pieza escalonada vista desde el suroeste, con su SCP girado 30 grados alrededor de Z: PLANTA e Intro miran desde arriba en perpendicular a ese SCP, con su eje X a la derecha, así que la pieza se ve girada."
sourceHash: "50d157803309"
---

PLANTA (PLAN en inglés) mira desde arriba, en perpendicular, al plano XY de un SCP, con su eje X apuntando a la derecha: la vista en planta, tal como dibujaste. Pregunta qué SCP —el actual, uno guardado o el universal— e Intro elige el actual. Después encuadra todo el dibujo y dice <Message id="regeneratingModel" />.

Nada del dibujo se mueve, y el SCP sigue como estaba: PLANTA solo gira la vista. Es un paso de deshacer, así que <Command id="U" /> devuelve la vista, y <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> retrocede a la vista de antes. Es el camino de vuelta a la planta después de <Command id="3DORBIT" /> o de una vista isométrica de <Command id="VIEW" />. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Current ucs

La planta del SCP actual, la opción por defecto. Después de girar el SCP 30 grados alrededor de Z con <Command id="UCS" />, el dibujo se ve girado 30 grados en el sentido de las agujas del reloj, de modo que el eje X del SCP apunta a la derecha; después de un SCP sobre una cara inclinada, mira de frente a esa cara.

### Ucs

La planta de un SCP guardado con <Keyword command="UCS" id="NAmed" /> de <Command id="UCS" />, que escribes por su nombre. Si ese nombre no está guardado, dice que no encuentra ese SCP y vuelve a preguntar; <Keyword id="?" /> lista los guardados, como hace SCP, y también vuelve a preguntar. El SCP actual no cambia.

### World

La planta del sistema de coordenadas universal: el dibujo como estaba al principio, X a la derecha e Y arriba, sea cual sea el SCP actual, que sigue como estaba.

## Missing

Sin nada dibujado, PLANTA deja el zoom donde estaba, donde AutoCAD encuadra los límites del dibujo.

## Questions

### ¿Cómo volver a la vista en planta en AutoCAD?

Escribe `PLANTA` y pulsa Intro dos veces: el segundo Intro elige <Keyword id="Current ucs" />. Si el SCP está girado y quieres la planta del universal, elige <Keyword id="World" />.

### ¿Qué comando pone la vista en planta del SCP?

PLANTA con <Keyword id="Current ucs" />: mira en perpendicular al SCP actual, con su eje X a la derecha. Gira primero el SCP con <Command id="UCS" />, después ejecuta PLANTA y pulsa Intro dos veces, y dibujas sobre la planta girada como si estuviera derecha.

### ¿Por qué mi dibujo sale girado en la vista en planta?

La vista es la planta de un SCP girado. Ejecuta PLANTA y elige <Keyword id="World" /> para ver el dibujo otra vez con la X universal a la derecha; <Command id="UCS" /> e Intro también devuelven el SCP al Universal.

### ¿PLANTA cambia el SCP?

No. Solo gira la vista; el SCP sigue como estaba. Las vistas ortogonales de <Command id="VIEW" /> son las que también giran el SCP.
