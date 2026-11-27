---
title: "Sombreado en AutoCAD: SOMBREA (HATCH)"
metaTitle: "Sombreado en AutoCAD: comando SOMBREA (HATCH)"
description: "Cómo funciona SOMBREA (HATCH, alias SB) de AutoCAD en español: punto interno u objetos, patrón, escala, ángulo e islas. Pruébalo gratis online."
figure: "Un rectángulo con un círculo dentro, sombreado con ANSI31 desde un punto interno: el círculo queda libre, como isla."
sourceHash: "e0fc9a2fa81f"
---

SOMBREA (HATCH en inglés) rellena un área cerrada con un patrón de líneas, o sólido. Precisa un punto dentro del área y encuentra el contorno en los objetos que la rodean, dejando libre como isla lo que hay dentro —un círculo en un rectángulo, un texto—; o designa los objetos que la delimitan. Señala tantas áreas como quieras: Intro, o Esc, hace un solo sombreado de todas, en la capa actual y detrás de su contorno. Todo el comando es un paso que Deshacer revierte.

Mientras se ejecuta, la cinta de opciones muestra la ficha contextual Creación de sombreado, como la de AutoCAD: Designar puntos y Seleccionar, la galería de patrones, Tipo de sombreado (Sólido o Patrón), Ángulo, Escala de patrón de sombreado y Cerrar Creación de sombreado. Con la cinta de opciones cerrada, AutoCAD abre el cuadro de diálogo Sombreado y degradado, que MellowCAD no tiene: ahí SOMBREA pregunta en la línea de comandos lo mismo que <Command id="-HATCH" />, con el patrón en <Keyword id="Properties" />. Esc conserva el sombreado, mientras que en <Command id="-HATCH" /> descarta las áreas. Cada sombreado empieza con el patrón, la escala y el ángulo que se dieron al anterior: ANGLE, a escala 1 y ángulo 0, en un dibujo nuevo.

Con sombreados designados, la cinta de opciones muestra la ficha Editor de sombreado, como la de AutoCAD: el patrón, el tipo, el ángulo o la escala que se elijan allí los cambian con -EDITSOMB, que también se puede escribir, y los sombreados siguen designados; Cerrar Editor de sombreado los suelta.

## Options

### Properties

Se pregunta en la línea de comandos con la cinta de opciones cerrada, o en <Command id="-HATCH" />; con la cinta abierta, la ficha define los mismos tres. Pide el nombre del patrón, en mayúsculas o en minúsculas, ofreciendo el actual: <Keyword id="Solid" /> rellena el área, y <Keyword id="?" /> enumera los patrones con sus descripciones y vuelve al punto. Para un patrón, pide después la escala —un número mayor que 0, o dos puntos medidos— y el ángulo, escrito o con dos puntos. El siguiente sombreado conserva los tres.

<Session name="hatchPatterns" caption="SOLID y once patrones de acadiso.pat, cada uno sombreado en un cuadrado de 30 de lado a escala 1, y AR-CONC y AR-SAND a 0.08 y 0.1." />

### Select objects

En lugar de un punto interno, designa los objetos que delimitan el área; con la cinta de opciones abierta vuelve a preguntar tras cada designación, <Keyword id="Pick internal point" /> vuelve al punto e Intro termina el comando, y con ella cerrada Intro vuelve al punto. Un objeto que no cierra ningún área se deja fuera; cuando ninguno delimita una, Intro dice <Message id="unableToHatchBoundary" /> y no hace nada. Una región da su contorno, y sus huecos como islas.

### Undo

Aparece en la solicitud de la cinta de opciones, y en la de <Command id="-HATCH" /> se acepta sin aparecer: deshace las áreas del último punto señalado y vuelve a preguntar, sin tocar los objetos designados; mientras designas objetos, deshace la última designación. Dice <Message id="noBoundaryToUndo" /> cuando no queda ningún punto que deshacer.

## Missing

Elipses y splines como contorno: un área que cierran no se encuentra, y una región con una arista así se deja fuera. Tolerancia de huecos (HPGAPTOL): el área tiene que estar cerrada del todo. Sombreados asociativos, los estilos de isla Normal e Ignorar. Los degradados, los patrones definidos por el usuario y el resto de patrones de acadiso.pat no se crean aquí: solo los traen los sombreados de un DXF, los degradados en sus colores y los patrones con sus líneas. Las demás opciones de <Command id="-HATCH" />: dibujar un contorno, eliminar contornos, opciones avanzadas, orden de dibujo, origen, anotativo, color, capa y transparencia; las opciones Dibujar y Parámetros de la solicitud de la cinta de opciones. De Creación de sombreado, Eliminar y Volver a crear, los tipos Degradado y Definido por el usuario, los colores, la transparencia, el origen y las opciones. El cuadro de diálogo de la edición de sombreados (`_HATCHEDIT`) y el doble clic que en AutoCAD abre el Editor de sombreado; de esa ficha, los contornos, los colores, la transparencia, el origen y las opciones. MIRRHATCH 1: un sombreado reflejado con simetría conserva siempre el ángulo de su patrón. Los menús de los pinzamientos de un sombreado.

## Questions

### ¿Cómo se llama el comando HATCH en español?

SOMBREA, con los alias `SB` y `SMB` (en AutoCAD en español, `H` es <Command id="U" />, deshacer). Como allí, el nombre inglés también funciona con un guion bajo delante: `_HATCH`. Abre la ficha Creación de sombreado; <Command id="-HATCH" /> lo pregunta todo en la línea de comandos.

### ¿Por qué no funciona el sombreado?

Casi siempre porque el área no está cerrada: dice <Message id="hatchNoBoundary" />, y basta el hueco más pequeño, porque nada lo salva. Cierra el contorno y vuelve a precisar el punto. Un área cerrada por una elipse o una spline todavía no se encuentra, y los objetos de una capa desactivada no se ven.

### ¿Qué patrones de sombreado hay y puedo descargar más?

Una selección de acadiso.pat, el archivo de patrones métrico de AutoCAD: SOLID, ANGLE, de ANSI31 a ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL y ZIGZAG. La ficha Creación de sombreado los muestra; <Keyword id="?" /> en <Keyword id="Properties" /> los enumera. Todavía no se puede cargar un archivo de patrones propio o descargado, pero los sombreados de un DXF se abren con el patrón que traen, sea cual sea, como los dibuja AutoCAD.

### ¿Cómo cambio la escala de un sombreado?

Mientras precisas los puntos, en Escala de patrón de sombreado de la ficha Creación de sombreado, o en <Keyword id="Properties" /> con <Command id="-HATCH" />, después del nombre del patrón. Una vez hecho, designa el sombreado y cambia Escala en la paleta Propiedades, o dale el patrón, la escala y el ángulo de otro con <Command id="MATCHPROP" />. Una escala tan pequeña que el patrón necesitaría demasiadas líneas dice <Message id="hatchTooDense" /> y no hace el sombreado.

### ¿Cómo calculo el área de un sombreado?

Desígnalo y lee Área en Geometría, en la paleta Propiedades, sin sus islas; con varios designados, Área acumulada las suma. O ejecuta <Command id="AREA" />, elige <Keyword command="AREA" id="Object" /> y designa el sombreado.
