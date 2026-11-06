---
title: "Zoom en AutoCAD: comando ZOOM y sus opciones"
metaTitle: "Zoom en AutoCAD: comando ZOOM y sus opciones"
description: "Cómo funciona ZOOM (Z) de AutoCAD en español: Extensión, Ventana, Previo, EScala con nX, Objeto y Todo, la rueda del ratón y el zoom transparente. Pruébalo."
figure: "Una placa con un agujero pequeño cerca de su esquina: ZOOM Extensión y después una ventana alrededor del agujero, que entonces llena la vista."
sourceHash: "cd72af4956e4"
---

ZOOM agranda o reduce la vista; nada del dibujo se mueve ni cambia de tamaño. Su primera solicitud admite una esquina, que empieza una ventana, un factor de escala o una opción. Escrito con un apóstrofo delante, `'ZOOM` o `'Z`, funciona dentro de otro comando, que sigue después. La rueda del ratón acerca y aleja alrededor del cursor, y un doble clic con el botón de la rueda es ZOOM Extensión. Cada ZOOM es un paso de deshacer, y varios seguidos uno solo, así que <Command id="U" /> también devuelve la vista.

## Options

### All

Encuadra todo lo dibujado, como <Keyword id="Extents" />.

### Extents

Encuadra todo lo dibujado, tan grande como cabe en la ventana. Sin nada dibujado dice <Message id="regeneratingModel" />, y escrito dentro de otro comando se niega con <Message id="requiresRegen" />, como el de AutoCAD.

### Previous

Vuelve a la vista anterior, hasta 20 vistas atrás. Si no queda ninguna: <Message id="noPreviousView" />.

### Scale

Un factor: `2X` acerca el doble que la vista actual, `0.5X` la mitad, y `2` sin la X el doble de la escala de la vista de ZOOM Todo. `nXP`, el factor del espacio papel, se lee como `nX`: aquí solo hay espacio modelo. Un factor escrito en la primera solicitud hace lo mismo sin elegir la opción.

### Window

Dos esquinas, señaladas o arrastradas, encuadran ese rectángulo. Una esquina señalada en la primera solicitud hace lo mismo.

### Object

Encuadra los objetos que designas, o los designados antes de ZOOM.

## Missing

Tiempo real: Intro en la primera solicitud termina ZOOM, donde AutoCAD empieza a hacer zoom con el ratón; aquí eso lo hace la rueda. Dinámico, Centro y los ocultos Izquierda y Vmax.

## Questions

### ¿Cuál es el atajo de ZOOM en AutoCAD?

`Z`, y después Intro o la barra espaciadora. El comando se llama igual en AutoCAD en español, y `_ZOOM` funciona en cualquier idioma. `Z` y después `E` es ZOOM Extensión.

### ¿Cómo hago zoom para ver todo el dibujo?

<Keyword id="Extents" />: escribe `Z`, Intro, `E`, Intro. O haz doble clic con el botón de la rueda del ratón.

### ¿Qué significa ZOOM XP en AutoCAD?

`nXP` ajusta una ventana gráfica de una presentación a una escala respecto al espacio papel: `1/50XP` muestra el modelo a 1:50 en la hoja. MellowCAD no tiene presentaciones, así que `XP` se lee como `X`.

### ¿Cómo hago zoom a un objeto en AutoCAD?

Elige <Keyword id="Object" /> y desígnalo, o desígnalo antes y ejecuta ZOOM Objeto: la vista lo encuadra.

### ¿Cómo vuelvo a la vista anterior?

<Keyword id="Previous" />, una y otra vez para las vistas de antes, hasta 20.
