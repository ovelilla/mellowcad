---
title: "Editar atributos en AutoCAD: ATREDIT (ATTEDIT)"
metaTitle: "Editar atributos en AutoCAD: comando ATREDIT"
description: "Cómo funciona ATREDIT (ATTEDIT, alias ATR) de AutoCAD en español: cambiar los valores de atributo de un bloque, un campo por solicitud. Pruébalo gratis."
figure: "Tres rótulos de puerta, referencias a un bloque con el atributo NUM: ATREDIT designa el último, insertado como 2, y su cuadro lo cambia a 3."
sourceHash: "4a8ee28ecc53"
---

ATREDIT (ATTEDIT en inglés) cambia los valores de atributo de una referencia a bloque. Pide que designes la referencia y después abre un cuadro con un campo por cada uno de sus atributos, rotulado con la solicitud del atributo y relleno con su valor, como el cuadro de diálogo Editar atributos de AutoCAD. Vuelve a escribir los valores, con Tab para pasar de un campo al siguiente, e Intro, el Aceptar de AutoCAD, los aplica en un paso que <Command id="U" /> deshace; Esc, su Cancelar, no cambia nada.

La designación toma el objeto que queda bajo el cursor. Cualquier cosa que no sea una referencia a bloque se rechaza, igual que una referencia cuyo bloque no tiene atributos, y se vuelve a preguntar; un clic en vacío vuelve a preguntar en silencio. No cambia la definición del bloque, ni sus demás referencias: cada una tiene valores propios. <Command id="EATTEDIT" /> edita los mismos valores en un cuadro rotulado por identificador, y un doble clic en una referencia con atributos lo ejecuta.

## Missing

`-ATTEDIT` (-ATREDIT en español), la forma de línea de comandos que edita los atributos uno a uno o de forma global, y su alias `-ATR`. Los botones Anterior y Siguiente de Editar atributos, para un bloque con más atributos de los que caben en una página, y su línea Nombre de bloque. EDITATRINSITU (`_ATTIPEDIT`), que edita un atributo en su sitio, y su Ctrl+doble clic. El pinzamiento propio de un atributo desbloqueado en una referencia, y las filas de atributos de la paleta Propiedades.

## Questions

### ¿Cómo se llama el comando ATTEDIT en español?

ATREDIT, con los alias `ATR` y `DDATTE`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_ATTEDIT`.

### ¿Cómo edito los atributos de un bloque en AutoCAD?

Escribe `ATR` y designa la referencia, o haz doble clic en ella, que ejecuta <Command id="EATTEDIT" />. Cambia los valores en el cuadro y pulsa Intro. Para cambiar los propios atributos, su identificador, su solicitud o su posición, edita las definiciones y redefine el bloque con <Command id="BLOCK" />.

### ¿Por qué ATREDIT dice que el bloque no tiene atributos editables?

Porque el bloque de la referencia que designaste no contiene atributos: ATREDIT edita los valores de una referencia a un bloque que los tiene. Una definición que aún no ha entrado en un bloque se edita con <Command id="TEXTEDIT" />, con un doble clic en ella.

### ¿Qué diferencia hay entre ATREDIT y EDITATR?

Las dos editan los valores de una referencia. El cuadro de ATREDIT rotula cada campo con la solicitud del atributo, como el cuadro de diálogo Editar atributos de AutoCAD; el de <Command id="EATTEDIT" />, el Editor de atributos mejorado, con su identificador. En AutoCAD, EDITATR también tiene fichas para las opciones de texto y las propiedades de cada atributo.
