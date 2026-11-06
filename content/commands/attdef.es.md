---
title: "Atributos de bloque en AutoCAD: ATRDEF (ATTDEF)"
metaTitle: "Atributos en AutoCAD: comando ATRDEF (ATTDEF)"
description: "Cómo funciona ATRDEF (ATTDEF, alias AT) de AutoCAD en español: sus modos, identificador, solicitud y valor por defecto, y dónde va su texto. Pruébalo gratis."
figure: "Un rótulo de puerta: el atributo NUM centrado en un círculo, con su identificador como solicitud y 1 como valor por defecto, listo para entrar en un bloque."
sourceHash: "f0fc3d8763e7"
---

ATRDEF (ATTDEF en inglés) define un atributo: un identificador, una solicitud y un valor por defecto, colocados en el dibujo como una línea de texto. Desígnalo con los demás objetos al crear un bloque con <Command id="BLOCK" />, y cada referencia a ese bloque guarda un valor propio para él: el número de una puerta, el código de una pieza, el nombre de un local. Hasta entonces, la definición muestra su identificador.

El ATRDEF de AutoCAD abre el cuadro de diálogo Definir atributos, que MellowCAD no tiene: aquí ATRDEF pide en la línea de comandos lo mismo que <Command id="-ATTDEF" />, como hace la consola de AutoCAD. Indica los modos actuales y pide uno para cambiar, hasta que Intro sigue adelante. Después, el identificador: sin espacios, porque un espacio lo termina, y las minúsculas pasan a mayúsculas; Intro solo dice <Message id="tagCannotBeNull" />. Después, la solicitud con la que <Command id="INSERT" /> pedirá el valor, con Intro para tomar el identificador, y el valor por defecto. Por último, dónde va el texto, con las preguntas de <Command id="TEXT" />: un punto inicial, la altura y la rotación. La altura y la justificación son las de TEXTO, compartidas en los dos sentidos. Intro en el punto inicial coloca la definición una línea por debajo de la última definida, con su altura, rotación, estilo y justificación, así que los atributos de un bloque se apilan uno bajo otro.

## Options

### Invisible

El valor no se muestra en las referencias, hasta que <Command id="ATTDISP" /> lo activa. Cada modo es un conmutador: elegirlo lo cambia entre `S` y `N`, vuelve a escribir los modos y pregunta otra vez. Los modos se conservan para el siguiente ATRDEF.

### Constant

Todas las referencias tienen el mismo valor, que ATRDEF pide en lugar de una solicitud y un valor por defecto; INSERT nunca lo pregunta.

### Verify

INSERT pide el valor una segunda vez, para comprobarlo, después de pedir cada valor una vez.

### Preset

INSERT no pide el valor: cada referencia toma el valor por defecto.

### Lock position

Activado al principio: el atributo se queda donde lo coloca el bloque.

### Justify

Pregunta desde qué punto cuelga el texto, como TEXTO: <Keyword id="Left" />, <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> o uno de los nueve puntos, superior, medio e inferior por izquierda, centro y derecha. Después, la solicitud del punto inicial pide el punto que nombra: medio centro centra el valor en un rótulo.

### Style

Pide el estilo de texto que se usa, que pasa a ser el actual; <Keyword id="?" /> enumera los estilos del dibujo.

## Missing

El cuadro de diálogo Definir atributos: ATRDEF pregunta en la línea de comandos. Los modos Anotativo y Líneas múltiples, que AutoCAD 2027 enumera después de Bloquear posición, y las líneas de un atributo de líneas múltiples. Los campos, las justificaciones Alinear y Ajustar, y que el `?` de Estilo pregunte qué estilos enumerar.

## Questions

### ¿Cómo se llama el comando ATTDEF en español?

ATRDEF, con el alias `AT`. `-AT` es <Command id="-ATTDEF" />, la forma de línea de comandos, que ATRDEF también ejecuta aquí. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ATTDEF`.

### ¿Cómo se crea un bloque con atributos en AutoCAD?

Dibuja el símbolo, ejecuta ATRDEF para cada atributo y coloca su texto donde debe verse el valor. Ejecuta <Command id="BLOCK" />, precisa un punto base y designa el símbolo y los atributos, en el orden en que INSERT debe pedirlos. Cada <Command id="INSERT" /> del bloque pide entonces un valor para cada atributo, ofreciendo su valor por defecto.

### ¿Qué diferencia hay entre el identificador, la solicitud y el valor por defecto?

El identificador da nombre al atributo: es lo que muestra la definición y lo que rotula su campo en <Command id="EATTEDIT" />. La solicitud es la pregunta con la que INSERT pide su valor. El valor por defecto es el que se ofrece, y que Intro acepta.

### ¿Cómo edito una definición de atributo?

Haz doble clic en ella antes de que entre en un bloque: <Command id="TEXTEDIT" /> abre su identificador, su solicitud y su valor por defecto. Una vez en un bloque, los valores de cada referencia se editan con <Command id="ATTEDIT" /> o <Command id="EATTEDIT" />.
