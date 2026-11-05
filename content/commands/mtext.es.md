---
title: "MTEXT en AutoCAD: TEXTOM, texto de líneas múltiples"
metaTitle: "MTEXT en AutoCAD: comando TEXTOM en español"
description: "Cómo funciona TEXTOM (MTEXT, alias TXM) de AutoCAD en español: esquinas o Anchura, Altura, Justificar e Interlineado, párrafos en un objeto. Pruébalo gratis."
figure: "Una nota en un recuadro: primero la altura, después la esquina opuesta, y un párrafo ajustado a la anchura entre ambas."
sourceHash: "a53001f9674d"
---

TEXTOM (MTEXT en inglés) escribe texto de líneas múltiples: un solo objeto con párrafos que se ajustan a una anchura. Precisas una primera esquina y la opuesta, y el recuadro entre ellas fija la anchura; después escribes en un editor dibujado en su sitio, donde Intro empieza un párrafo nuevo y Ctrl+Intro, o un clic fuera del marco, conserva el texto. Esc con algo escrito pregunta si quieres guardarlo, como el cuadro de cambios sin guardar de AutoCAD. Para líneas que sean cada una un objeto propio, usa <Command id="TEXT" />.

La primera línea indica el estilo y la altura actuales. Cada opción se pide en la solicitud de la esquina opuesta y vuelve a ella, así que una ejecución fija la altura, la justificación y lo demás antes de cerrar el recuadro. Las palabras pasan a la línea siguiente donde una línea superaría la anchura, y una palabra más larga que la anchura sobresale. La altura se comparte con <Command id="TEXT" /> y se guarda en el dibujo; la justificación, la rotación y el interlineado vuelven a sus valores por defecto en cada ejecución. <Command id="-MTEXT" /> pregunta lo mismo y después toma el texto en la línea de comandos, línea a línea.

## Options

### Height

Fija la altura del texto, escrita o como la distancia de la primera esquina a un punto; debe ser mayor que cero. Se mantiene para la siguiente ejecución y para <Command id="TEXT" />.

### Justify

Fija de cuál de los nueve puntos del recuadro cuelga el texto: superior izquierda por defecto, o superior, medio e inferior por izquierda, centro y derecha, como los lista la solicitud. El texto cuelga de ese punto del recuadro, en el sentido que se haya arrastrado el recuadro.

### Line spacing

Pide el tipo, al menos (por defecto), que deja sitio a una línea con letras más altas, o exactamente, y después un factor escrito con una x, como `2x`, o una distancia. El interlineado sencillo es 1x, y el factor va de 0.25x a 4x.

### Rotation

Gira el recuadro y su texto, con un ángulo escrito o señalado desde la primera esquina.

### Style

Hace actual un estilo de texto, por su nombre; <Keyword id="?" /> muestra los estilos del dibujo, y un nombre que el dibujo no tiene se rechaza. Los estilos se crean en la paleta que abre <Command id="STYLE" />.

### Width

Pide la anchura en lugar de la esquina opuesta, escrita o como la distancia a un punto, y después abre el editor. Una anchura de 0, o Intro, deja las líneas sin ajustar, cada una tan larga como se escribió.

## Missing

Las columnas, que AutoCAD 2027 ofrece en la solicitud de la esquina opuesta, no se ofrecen. El formato dentro del texto, como la altura, la fuente o el color de una palabra, las fracciones apiladas o el subrayado, no se dibuja ni se aplica, y el editor no tiene regla, tabulaciones, sangrías, listas ni la ficha Editor de texto de la cinta de opciones, ni un cursor sobre el dibujo. No hay máscara de fondo ni marco de texto, altura definida, escala anotativa ni referencia a objetos Punto en sus esquinas, y un clic dentro de su cuadro lo designa aunque no caiga sobre sus letras, donde AutoCAD no designa nada.

## Questions

### ¿Cómo se llama el comando MTEXT en español?

TEXTOM, con los alias `TXM` y `MTEXT`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_MTEXT`. En español `T` no es TEXTOM sino <Command id="TEXT" />, el texto en una línea. <Command id="-MTEXT" />, `-TXM`, pide lo mismo y toma el texto en la línea de comandos.

### ¿Cómo hago un salto de línea en TEXTOM?

Pulsa Intro: empieza un párrafo nuevo. Dentro de un párrafo, las líneas se ajustan solas a la anchura del recuadro. Ctrl+Intro, o un clic fuera del marco, cierra el editor y conserva el texto.

### ¿Cómo cambio la anchura de un texto de líneas múltiples?

Desígnalo y arrastra el pinzamiento de su lado: el texto se vuelve a ajustar a la nueva anchura, desde su punto de justificación. La fila Anchura definida de la paleta Propiedades lo hace con un número, y sus filas de espacio de línea cambian el interlineado.

### ¿Cómo convierto un TEXTOM en texto de una línea?

Descomponlo con <Command id="EXPLODE" />: cada una de sus líneas pasa a ser un <Command id="TEXT" />, justificado a la izquierda donde estaba la línea, como en AutoCAD. Para volver a escribirlo, en cambio, haz doble clic en él y se abre su editor.
