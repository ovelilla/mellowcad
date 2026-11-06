---
title: "Estilo de texto en AutoCAD: ESTILO (STYLE)"
metaTitle: "Estilo de texto en AutoCAD: comando ESTILO"
description: "Cómo funciona ESTILO (STYLE, alias EST) de AutoCAD en español: crear, renombrar, suprimir y hacer actual un estilo de texto, y su altura. Pruébalo gratis."
figure: "Una placa de nombre: ESTILO, después TEXTO, cuyo Estilo ? enumera el estilo del dibujo, Standard en Arial, y el nombre de la placa escrito con él."
sourceHash: "8c15a1a95e66"
---

ESTILO (STYLE en inglés) gestiona los estilos de texto del dibujo: aquello con lo que se escribe un texto. Cada texto, texto de líneas múltiples y atributo tiene un estilo, y los nuevos toman el estilo actual, Standard en un dibujo nuevo. El ESTILO de AutoCAD abre el cuadro de diálogo Estilo de texto; MellowCAD aún no lo tiene, así que ESTILO abre la tabla de texto de la paleta Estilos, donde también están los estilos de cota de <Command id="DIMSTYLE" />. Una designación hecha antes se descarta, como la descarta el cuadro de diálogo, y escrito con un apóstrofo dentro de un comando, `'ESTILO`, se abre sin terminar ese comando.

La tabla enumera los estilos, con el actual marcado. Nuevo crea una copia del estilo designado, llamada `Estilo1`, `Estilo2`… el primer nombre libre, y la hace actual. Definir actual hace actual un estilo; su nombre se puede volver a escribir, y un nombre ya en uso, en mayúsculas o en minúsculas, se rechaza, como lo rechaza AutoCAD. Suprimir elimina un estilo, pero nunca Standard, el estilo actual ni uno en uso. Altura da a un estilo una altura fija: 0, el valor por defecto, la deja libre, así que <Command id="TEXT" /> pide una cada vez; con una altura fijada, TEXTO no la pide. Cada cambio es un paso que <Command id="U" /> deshace. Con textos designados, la fila Estilo de texto de la paleta Propiedades les da otro estilo, en un paso.

## Missing

El cuadro de diálogo Estilo de texto y su vista preliminar: ESTILO abre en su lugar la paleta Estilos. Fuente, estilo de fuente y fuente grande, factor de anchura, ángulo oblicuo y los efectos Cabeza abajo, Reflejado a la izquierda y Vertical: todos los estilos se dibujan en Arial, derechos y con anchura 1. Los estilos anotativos, y el estilo Anotativo que un dibujo nuevo de AutoCAD tiene junto a Standard. `-STYLE`, que lo pregunta todo en la línea de comandos.

## Questions

### ¿Cómo se llama el comando STYLE en español?

ESTILO, con los alias `EST` y `ESTILODD`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_STYLE`.

### ¿Cómo cambio el estilo de texto en AutoCAD?

Para el texto nuevo, haz actual el estilo en la paleta Estilos que abre ESTILO, o con la opción <Keyword command="TEXT" id="Style" /> de <Command id="TEXT" />. Para el texto ya escrito, desígnalo y elige el estilo en la fila Estilo de texto de la paleta Propiedades.

### ¿Cómo cambio la fuente de un estilo de texto?

En AutoCAD, en Nombre de fuente del cuadro de diálogo Estilo de texto. Aquí todavía no: todos los estilos se dibujan en Arial, y un estilo solo se distingue por su nombre y su altura.

### ¿Por qué TEXTO no me pide la altura?

El estilo actual tiene una altura propia. Pon su altura a 0 en la paleta Estilos y <Command id="TEXT" /> vuelve a pedir la altura, ofreciendo la última usada.
