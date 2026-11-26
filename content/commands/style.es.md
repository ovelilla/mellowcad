---
title: "Estilo de texto en AutoCAD: ESTILO (STYLE)"
metaTitle: "Estilo de texto en AutoCAD: comando ESTILO"
description: "Cómo funciona ESTILO (STYLE, alias EST) de AutoCAD en español: crear, renombrar, suprimir y hacer actual un estilo de texto, y su altura. Pruébalo gratis."
figure: "Una placa de nombre: ESTILO, después TEXTO, cuyo Estilo ? enumera el estilo del dibujo, Standard en Arial, y el nombre de la placa escrito con él."
sourceHash: "dc2db204a8ac"
---

ESTILO (STYLE en inglés) gestiona los estilos de texto del dibujo: aquello con lo que se escribe un texto. Cada texto, texto de líneas múltiples y atributo tiene un estilo, y los nuevos toman el estilo actual, Standard en un dibujo nuevo. ESTILO abre el cuadro de diálogo Estilo de texto, como en AutoCAD. Una designación hecha antes se descarta, como la descarta el cuadro de diálogo, y escrito con un apóstrofo dentro de un comando, `'ESTILO`, se abre sin terminar ese comando, que sigue en cuanto se cierra el cuadro.

El cuadro nombra el estilo actual y enumera los estilos, todos los estilos o solo los estilos en uso. Nuevo... pide un nombre, ofreciendo `Estilo1`, `Estilo2`… el primero libre, y crea una copia del estilo designado, que queda como actual. Definir actual hace actual el estilo designado; F2 edita su nombre, y un nombre ya en uso, en mayúsculas o en minúsculas, se rechaza, como lo rechaza AutoCAD. Suprimir elimina un estilo, pero nunca Standard, el estilo actual ni uno en uso. Altura da a un estilo una altura fija, que se aplica con Aplicar: 0, el valor por defecto, la deja libre, así que <Command id="TEXT" /> pide una cada vez; con una altura fijada, TEXTO no la pide. Cancelar descarta una altura no aplicada, y pasa a decir Cerrar en cuanto algo ha cambiado. Todo lo hecho en el cuadro es un solo paso que <Command id="U" /> deshace. Con textos designados, la fila Estilo de texto de la paleta Propiedades les da otro estilo, en un paso.

## Missing

La vista preliminar del cuadro. Fuente, estilo de fuente y fuente grande, factor de anchura, ángulo oblicuo y los efectos Cabeza abajo, Reflejado a la izquierda y Vertical: todos los estilos se dibujan en Arial, derechos y con anchura 1. Los estilos anotativos, y el estilo Anotativo que un dibujo nuevo de AutoCAD tiene junto a Standard. `-STYLE`, que lo pregunta todo en la línea de comandos.

## Questions

### ¿Cómo se llama el comando STYLE en español?

ESTILO, con los alias `EST` y `ESTILODD`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_STYLE`.

### ¿Cómo cambio el estilo de texto en AutoCAD?

Para el texto nuevo, haz actual el estilo con Definir actual en el cuadro que abre ESTILO, o con la opción <Keyword command="TEXT" id="Style" /> de <Command id="TEXT" />. Para el texto ya escrito, desígnalo y elige el estilo en la fila Estilo de texto de la paleta Propiedades. La lista Estilo de texto de la cinta de opciones (Anotar › Texto, y el panel desplegable de Inicio › Anotación) hace las dos cosas: con texto seleccionado le cambia el estilo; sin nada seleccionado, hace actual el estilo.

### ¿Cómo cambio la fuente de un estilo de texto?

En AutoCAD, en Nombre de fuente del cuadro de diálogo Estilo de texto. Aquí todavía no: todos los estilos se dibujan en Arial, y un estilo solo se distingue por su nombre y su altura.

### ¿Por qué TEXTO no me pide la altura?

El estilo actual tiene una altura propia. Pon su altura a 0 en el cuadro de diálogo Estilo de texto, después Aplicar, y <Command id="TEXT" /> vuelve a pedir la altura, ofreciendo la última usada.
