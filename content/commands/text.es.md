---
title: "Texto en AutoCAD: TEXTO (TEXT)"
metaTitle: "Texto en AutoCAD: comando TEXTO (TEXT)"
description: "Cómo funciona TEXTO (TEXT, alias T) de AutoCAD en español, solicitud a solicitud: punto inicial, altura, rotación y Justificar para alinear. Pruébalo gratis."
figure: "Dos líneas de texto centradas en un rectángulo con la justificación medio centro: cada línea, un objeto propio."
sourceHash: "44d0e1a420a7"
---

TEXTO (TEXT en inglés) escribe texto en una línea. Precisas un punto inicial, una altura y un ángulo de rotación, y después escribes una línea y pulsas Intro: la línea se convierte en un objeto propio y la siguiente empieza una línea más abajo. Una línea vacía termina el comando. Si antes señalas otro punto, las líneas siguientes empiezan allí, y Esc conserva las líneas ya escritas y descarta la que estabas escribiendo. Para un párrafo que se ajusta a una anchura, en un solo objeto, usa <Command id="MTEXT" />.

La primera línea indica el estilo, la altura y la justificación actuales. La altura es la que comparte con <Command id="MTEXT" /> y <Command id="ATTDEF" />, se guarda en el dibujo y el siguiente TEXTO la propone por defecto; un estilo con altura propia se salta la solicitud de altura. Intro en la solicitud del punto inicial continúa debajo de la última línea que escribió TEXTO, sin volver a pedir la altura ni el ángulo. Deshacer revierte toda la ejecución.

## Options

### Justify

Pregunta desde qué punto cuelga el texto: <Keyword id="Left" /> (por defecto), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> o uno de nueve puntos, superior, medio e inferior por izquierda, centro y derecha, como los lista la solicitud. Después, la solicitud del punto inicial pide el punto que nombra la justificación: para medio centro, el punto medio. Como en AutoCAD, los nueve también se aceptan sin estar en la lista de la primera solicitud, así que escribir allí las letras de medio centro pide el punto medio directamente. La justificación se guarda en el dibujo para el siguiente TEXTO.

### Style

Pide el nombre del estilo de texto que se hace actual; Intro conserva el que hay. <Keyword id="?" /> muestra los estilos del dibujo, y un nombre que el dibujo no tiene se rechaza y se vuelve a pedir. Los estilos se crean en la paleta que abre <Command id="STYLE" />.

## Missing

Las justificaciones Alinear y Ajustar. La opción <Keyword id="?" /> de <Keyword id="Style" /> muestra todos los estilos a la vez, sin preguntar cuáles ni detenerse página a página. El texto se escribe en el cuadro de entrada dinámica, no con un cursor sobre el dibujo, y su contenido no se puede reescribir en la paleta Propiedades, a la que también le faltan las filas de anotativo, factor de anchura, ángulo oblicuo y texto cabeza abajo o al revés. Un clic dentro del cuadro de un texto lo designa aunque no caiga sobre sus letras, donde AutoCAD no designa nada.

## Questions

### ¿Cómo se llama el comando TEXT en español?

TEXTO, con los alias `T` y `TEXTODIN`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_TEXT`. En español `T` es TEXTO, el texto en una línea; el de líneas múltiples es <Command id="MTEXT" />, alias `TXM`.

### ¿Qué comando de AutoCAD sirve para alinear texto?

La opción <Keyword id="Justify" /> de TEXTO: elígela en la primera solicitud, o escribe allí las letras de la justificación, y precisa el punto que nombra. Medio centro pone el centro de cada línea en su punto, como un rótulo en medio de un recuadro. Para que el texto siga una línea inclinada, escribe su ángulo en la solicitud de rotación.

### ¿Qué diferencia hay entre TEXTO y TEXTOM?

TEXTO crea un objeto por línea, que se desplaza, se edita y se justifica por separado, y nunca ajusta el texto a una anchura. <Command id="MTEXT" /> crea un solo objeto de párrafos que se ajustan a la anchura de un recuadro, justificado como un todo. Los dos comparten la altura de texto y los estilos de texto.

### ¿Cómo edito un texto en AutoCAD?

Haz doble clic en él: <Command id="TEXTEDIT" /> lo abre para que lo vuelvas a escribir y después pide el siguiente texto, hasta que pulsas Esc. Su altura y su rotación son filas de la paleta Propiedades, y sus pinzamientos lo desplazan.
