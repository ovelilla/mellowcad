---
title: "Editor de atributos mejorado en AutoCAD: EDITATR (EATTEDIT)"
metaTitle: "Editor de atributos en AutoCAD: comando EDITATR"
description: "Cómo funciona EDITATR (EATTEDIT) de AutoCAD en español: los valores de atributo de un bloque en el Editor de atributos mejorado, con doble clic. Pruébalo."
figure: "Dos mesas, referencias a un bloque con los atributos NUM y PART: EDITATR designa la segunda y su campo PART pasa a ser B-200."
sourceHash: "3517c89fd5da"
---

EDITATR (EATTEDIT en inglés) abre el Editor de atributos mejorado de AutoCAD para una referencia a bloque: pide que designes un bloque y después muestra un campo por cada uno de sus atributos, rotulado con su identificador y relleno con su valor, como los enumera la ficha Atributo del editor. Vuelve a escribir los valores, con Tab para pasar de un campo a otro, e Intro los aplica en un paso que <Command id="U" /> deshace; Esc no cambia nada.

Un doble clic en una referencia con atributos ejecuta EDITATR, como en AutoCAD: la línea de comandos lo escribe con el punto en el que hiciste doble clic como respuesta, y el cuadro se abre enseguida. La designación toma el objeto que queda bajo el cursor: cualquier cosa que no sea una referencia a bloque se rechaza, igual que un bloque sin atributos, y se vuelve a preguntar. Solo cambia la referencia designada; la definición del bloque y sus demás referencias conservan sus valores.

## Missing

La ficha Opciones de texto del editor (estilo, justificación, altura, rotación, factor de anchura y el resto del texto de cada atributo) y su ficha Propiedades (capa, tipo de línea, color, grosor de línea), y su botón Seleccionar bloque. EDITATRINSITU (`_ATTIPEDIT`), que edita un atributo en su sitio, y su Ctrl+doble clic. El pinzamiento propio de un atributo desbloqueado en una referencia, y las filas de atributos de la paleta Propiedades. `-ATTEDIT` (-ATREDIT en español).

## Questions

### ¿Cómo se abre el Editor de atributos mejorado en AutoCAD?

Haz doble clic en una referencia a bloque que tenga atributos, o escribe `EDITATR` y desígnala. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_EATTEDIT`.

### ¿Cómo cambio el valor de un atributo en AutoCAD?

Haz doble clic en el bloque, escribe el valor nuevo en el campo del atributo y pulsa Intro. Cada referencia conserva sus propios valores: cambiar una deja las demás como están.

### ¿Por qué no puedo editar los atributos de un bloque con doble clic?

EDITATR se abre para una referencia cuyo bloque contiene atributos, y un bloque creado sin ellos no tiene ninguno: defínelos con <Command id="ATTDEF" /> y desígnalos con los demás objetos al crear el bloque. Si no se ve el valor de un atributo, comprueba <Command id="ATTDISP" />, que puede ocultar los atributos invisibles o todos.

### ¿Qué diferencia hay entre EDITATR y ATREDIT?

Editan los mismos valores. EDITATR rotula cada campo con su identificador, como la ficha Atributo del Editor de atributos mejorado; <Command id="ATTEDIT" />, con su solicitud, como el cuadro de diálogo Editar atributos. En AutoCAD, EDITATR también edita las opciones de texto y las propiedades de cada atributo.
