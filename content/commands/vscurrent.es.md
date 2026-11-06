---
title: "Estilos visuales en AutoCAD: ESTVISACTUAL (VSCURRENT)"
metaTitle: "Estilos visuales en AutoCAD: ESTVISACTUAL (EVA)"
description: "Cómo funciona ESTVISACTUAL (VSCURRENT, alias EVA) de AutoCAD en español: Estructura alámbrica 2D, Oculto y Conceptual, y cómo volver a la alámbrica. Pruébalo."
figure: "Una pieza con un agujero pasante, vista desde el sureste: ESTVISACTUAL Conceptual sombrea sus caras y dibuja sus aristas encima."
sourceHash: "ddb8f2338e68"
---

ESTVISACTUAL (VSCURRENT en inglés) define el estilo visual: cómo dibuja la vista los sólidos 3D. Pide un estilo, ofrece el actual como opción por defecto, e Intro lo conserva. <Keyword id="2dwireframe" /> dibuja todas las aristas, también las de detrás; <Keyword id="Hidden" /> oculta lo que tapan las caras; <Keyword id="Conceptual" /> pinta las caras, sombreadas. El estilo pertenece a la vista y se guarda con el dibujo, y cada ejecución es un paso de deshacer. No se puede usar dentro de otro comando.

Lo que no es un sólido —líneas, círculos, regiones, textos— se dibuja como en Estructura alámbrica 2D sea cual sea el estilo, con sus propios colores. En Oculto y Conceptual, un clic toma el sólido cuya cara está más cerca de ti bajo el cursor, nunca uno a través de una cara que lo tapa, y las referencias a objetos siguen encontrando todas las aristas. Un sólido de una capa bloqueada dibuja sus aristas más tenues. El 3D de MellowCAD es solo de sólidos y aún parcial.

## Options

### 2dwireframe

Todas las aristas de todos los sólidos, incluidas las de detrás, con las líneas que muestran sus caras curvas; es la opción por defecto en un dibujo nuevo. Al volver a ella desde otro estilo, ESTVISACTUAL dice <Message id="regeneratingModel" />.

### Hidden

Las aristas de cada sólido, y los contornos de sus caras curvas, allí donde ninguna cara de ningún sólido las tapa, en el color del objeto: un sólido detrás de otro queda oculto por él. Las líneas que muestran una cara curva en Estructura alámbrica 2D no se dibujan.

### Conceptual

Las caras que miran hacia ti, pintadas en el color del objeto, que vira a un azul frío en el lado opuesto a la luz, la cual sigue tu punto de vista; y encima, las aristas de Oculto dibujadas en un solo color, sea cual sea el del objeto. Aquí y en Oculto, un cilindro o un cono vistos en planta muestran solo su círculo, como en AutoCAD.

## Missing

Los demás estilos de AutoCAD —Estructura alámbrica, Realista, Sombreado, Sombreado con aristas, Tonos de gris, Esbozo y Rayos X— y dar el nombre de un estilo o listarlos con `?`: la solicitud lista solo los tres estilos que existen, y rechaza cualquier otra respuesta.

## Questions

### ¿Cómo cambiar el estilo visual en AutoCAD?

Ejecuta ESTVISACTUAL (o `EVA`) y elige el estilo: <Keyword id="Hidden" /> para ocultar las aristas de detrás, <Keyword id="Conceptual" /> para sombrear las caras. Solo cambia la vista, no los objetos. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_VSCURRENT`.

### ¿Cómo volver a Estructura alámbrica 2D?

Ejecuta ESTVISACTUAL y elige <Keyword id="2dwireframe" />, cuya letra es `2`.

### ¿Qué diferencia hay entre Oculto y Conceptual?

Los dos ocultan lo que tapan las caras. Oculto dibuja solo aristas, sobre el fondo, como un dibujo de líneas; Conceptual también pinta las caras, sombreadas por la luz, con las mismas aristas encima.

### ¿Por qué sigo viendo líneas a través del sólido?

No forman parte de un sólido. Las líneas, los círculos y las regiones se dibujan como en Estructura alámbrica 2D en todos los estilos, así que una línea detrás de un prisma sigue viéndose. En <Keyword id="2dwireframe" />, también se ven las aristas del propio sólido que quedan detrás: elige <Keyword id="Hidden" />.
