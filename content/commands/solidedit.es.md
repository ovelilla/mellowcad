---
title: "Editar sólidos en AutoCAD: EDITSOLIDO (SOLIDEDIT)"
metaTitle: "Editar sólidos en AutoCAD: comando EDITSOLIDO"
description: "Cómo editar caras de sólidos 3D con EDITSOLIDO (SOLIDEDIT) en AutoCAD en español: Extruir, Desplazar, Girar, Desfasar, Inclinar, Suprimir y Copiar. Pruébalo."
figure: "La cara superior de un prisma extruida 15 hacia arriba con una inclinación de 15 grados por EDITSOLIDO: un tronco de pirámide sobre el prisma, visto desde el sureste."
sourceHash: "775cdc271d4f"
---

EDITSOLIDO (SOLIDEDIT en inglés) edita un sólido 3D por sus caras. Dice si cada edición se comprueba y después pregunta qué editar: <Keyword id="Face" />, después la opción de caras, después las caras y después lo que pide la opción. Cada edición se hace en el acto, y las opciones de caras se vuelven a preguntar, así que una ejecución puede hacer varias ediciones; <Keyword id="eXit" /> o Intro salen de las opciones de caras y después del comando. Las vecinas de una cara la siguen: desplaza hacia arriba la cara superior de un prisma y sus lados crecen hasta encontrarla.

El sólido conserva su capa y sus propiedades, pero pierde lo que lo creó: un prisma deja de ser un prisma. Toda la ejecución es un solo paso de deshacer, y su <Keyword id="Undo" /> revierte dentro de ella las ediciones de una en una. Intro en la solicitud `Comando:` lo vuelve a ejecutar desde la primera pregunta. El botón de caras del panel Editar sólidos ejecuta directamente cada opción de caras. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### Face

Las opciones de caras. Cada una pide caras, hasta Intro: un clic o un punto escrito toma la cara más cercana a ti bajo él, o las dos caras de una arista que esté ahí, y una cara ya tomada da la que hay detrás. Una vez tomada una cara, <Keyword id="ALL" /> toma todas las caras de su sólido; <Keyword id="Remove" /> pasa a quitar caras del conjunto, y <Keyword id="Undo" /> revierte la última designación. Una designación en el vacío dice <Message id="noSolidsDetected" />. Solo caras de un mismo sólido.

### Extrude

Pide una altura y un ángulo de inclinación: cada cara crece hasta formar un prisma, que se añade al sólido o, con una altura negativa, se le resta, y que se estrecha al subir con un ángulo positivo. Intro en la altura toma la última altura que usaron las primitivas o <Command id="EXTRUDE" />.

### Move

Pide un punto base y un segundo punto: una cara plana se desplaza tanto como avanza ese recorrido a lo largo de su normal, y arrastra a sus vecinas. Intro en el segundo punto toma el punto base como desplazamiento.

### Rotate

Pide un eje, por dos puntos o a lo largo del <Keyword id="Xaxis" />, el <Keyword id="Yaxis" /> o el <Keyword id="Zaxis" /> del SCP, o perpendicular a la pantalla con <Keyword id="View" />, y después un ángulo: la cara gira alrededor de él según la regla de la mano derecha.

### Offset

Pide una distancia: la cara se desplaza hacia fuera a lo largo de su normal, o hacia dentro con una negativa, y arrastra a sus vecinas; las caras curvas también, alrededor de su eje. Un desfase hacia dentro de la mitad del lado mayor de la caja que envuelve el sólido se rechaza, y dice hasta dónde puede llegar.

### Taper

Pide un punto base, un punto a lo largo del eje de inclinación y un ángulo: la cara se inclina alrededor de la línea donde la corta el plano que pasa por el punto base, y un ángulo positivo la inclina hacia dentro a lo largo del eje.

### Delete

Quita la pared de un agujero, que se cierra, o la franja de un empalme o de un chaflán, y devuelve la arista a la que sustituía.

### Copy

Crea una región de cada cara plana, donde está o desplazada con dos puntos, en la capa actual y con las propiedades actuales.

### Undo

En las opciones de caras, revierte la última edición de esta ejecución; cuando ya no queda ninguna, <Message id="commandCompletelyUndone" />.

### eXit

Sale de las opciones de caras a la primera pregunta, y la de esa pregunta sale del comando; Intro hace lo mismo.

## Missing

<Keyword id="Edge" /> y <Keyword id="Body" />, y el <Keyword id="coLor" /> y el <Keyword id="mAterial" /> de las caras, que se ofrecen y se rechazan, como la <Keyword id="Path" /> de Extruir, el eje por objeto de Girar y su ángulo de <Keyword id="Reference" />. Captura, Borde y PolígonoC para designar caras. Desplazar, girar, inclinar o copiar una cara curva, desfasar una entre otras vecinas, suprimir una que no sea la pared de un agujero ni una franja, y una edición que cambia tanto la forma del sólido que una cara hace desaparecer a otra. Las ediciones junto a una cara extruida con inclinación. Un desfase hacia fuera demasiado grande para hacerse, que AutoCAD descarta en silencio y MellowCAD hace. Una vista previa mientras das una distancia o un ángulo.

## Questions

### ¿Cómo editar sólidos en AutoCAD con EDITSOLIDO?

Ejecuta EDITSOLIDO, elige <Keyword id="Face" /> y después qué hacer: <Keyword id="Extrude" /> o <Keyword id="Move" /> sobre una cara para que el sólido sea más alto, <Keyword id="Delete" /> para rellenar un agujero, <Keyword id="Taper" /> para inclinar un lado. Designa las caras, pulsa Intro y responde a las solicitudes de la opción. Para presionar o tirar rápido, <Command id="PRESSPULL" /> también arrastra una cara.

### ¿Cómo extruir una cara de un sólido 3D?

EDITSOLIDO, <Keyword id="Face" />, <Keyword id="Extrude" />, designa la cara y pulsa Intro, y después la altura y el ángulo de inclinación: el `15` y `15` de la figura levantan un tronco de pirámide sobre la cara superior de un prisma.

### ¿Cómo quitar un agujero de un sólido en AutoCAD?

EDITSOLIDO, <Keyword id="Face" />, <Keyword id="Delete" />, designa la pared del agujero y pulsa Intro: el agujero se rellena. Lo mismo quita un empalme o un chaflán.

### ¿Qué diferencia hay entre EDITSOLIDO y PRESIONARTIRAR?

<Command id="PRESSPULL" /> desplaza una cara con un arrastre o una distancia, en perpendicular a sí misma. EDITSOLIDO hace eso y más: inclina, gira, desfasa, suprime y copia caras, varias a la vez.
