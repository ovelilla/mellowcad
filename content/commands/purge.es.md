---
title: "Purgar en AutoCAD: LIMPIA (PURGE)"
metaTitle: "Purgar bloques en AutoCAD: LIMPIA (PURGE)"
description: "Cómo purgar con LIMPIA (PURGE, alias LI) de AutoCAD en español: eliminar los bloques sin usar, por nombre o todos, verificando o no cada uno. Pruébalo gratis."
figure: "Dos bloques, TAG colocado en un muro y BOX, cuya única referencia se borró: LIMPIA, todos los nombres, sin verificar, elimina solo BOX."
sourceHash: "635e8ae855cb"
---

LIMPIA (PURGE en inglés) elimina lo que un dibujo define pero no usa; aquí, los bloques. El LIMPIA de AutoCAD abre el cuadro de diálogo Limpiar; MellowCAD no lo tiene, así que LIMPIA pide en la línea de comandos lo mismo que <Command id="-PURGE" />, como hace la consola de AutoCAD. Indica los parámetros Elementos anidados y Datos huérfanos, los dos desactivados, y pregunta qué tipo de objetos sin utilizar limpiar, ofreciendo solo <Keyword id="Blocks" />; Intro ahí lo termina.

Un bloque está en uso mientras una referencia del dibujo lo coloca, o lo contiene la definición de un bloque en uso, a cualquier profundidad. Borrar la última referencia de un bloque deja su definición en el dibujo, donde <Command id="INSERT" /> puede volver a colocarlo: LIMPIA es lo que la elimina. Un bloque contenido en un bloque que se conserva nunca se elimina, y una cadena de bloques que solo se contienen unos a otros se va en una sola ejecución. Si no hay ninguno que eliminar, dice <Message id="noUnreferencedBlocks" />. Cada ejecución es un paso que <Command id="U" /> deshace.

## Options

### Blocks

Pide los nombres que limpiar, `*` (todos los bloques sin utilizar) por defecto, o nombres con comodines, separados por comas. Después pregunta si se verifica cada nombre: <Keyword id="Yes" />, por defecto, pregunta por cada bloque antes de eliminarlo; <Keyword id="No" /> los elimina todos y dice cada nombre y cuántos.

## Missing

El cuadro de diálogo Limpiar, y todos los demás tipos: capas, tipos de línea, estilos de texto y de cota, grupos, materiales, estilos de directriz múltiple, de tabla y visuales, aplicaciones registradas, geometría de longitud cero, objetos de texto vacíos, datos huérfanos y Todo. Los parámetros Elementos anidados y Datos huérfanos no se pueden cambiar.

## Questions

### ¿Cómo se llama el comando PURGE en español?

LIMPIA, con el alias `LI`. `-LI` es <Command id="-PURGE" />, la forma de línea de comandos, que LIMPIA también ejecuta aquí. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PURGE`.

### ¿Cómo purgo los bloques sin usar en AutoCAD?

Escribe `LI`, elige <Keyword id="Blocks" />, pulsa Intro para todos los nombres y responde <Keyword id="No" /> para eliminarlos todos sin preguntar por cada uno.

### ¿Por qué no puedo purgar un bloque?

Porque está en uso: una referencia del dibujo lo coloca, o lo contiene un bloque en uso, quizá anidado varios niveles por debajo. Borra sus referencias, o descompón los bloques que lo contienen, y LIMPIA podrá eliminarlo.

### ¿Cómo purgo capas en AutoCAD?

En AutoCAD, con el tipo Capas de LIMPIA. Aquí todavía no, porque LIMPIA solo limpia bloques; suprime una capa vacía en el Administrador de propiedades de capas.
