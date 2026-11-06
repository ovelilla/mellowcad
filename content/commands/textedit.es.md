---
title: "Editar texto en AutoCAD: EDITARTEXTO (TEXTEDIT)"
metaTitle: "Editar texto en AutoCAD: comando EDITARTEXTO"
description: "Cómo funciona EDITARTEXTO (TEXTEDIT, alias ED) de AutoCAD en español: editar textos, textos de líneas múltiples y atributos, uno tras otro. Pruébalo gratis."
figure: "El PALTE mal escrito de una placa de nombre, designado con EDITARTEXTO y reescrito PLATE, y después Esc para terminar el comando."
sourceHash: "2d0ed6fe5acc"
---

EDITARTEXTO (TEXTEDIT en inglés) edita objetos de anotación: indica el modo de edición actual, Múltiple al principio, y pide que designes uno. Un texto de una línea se abre para volver a escribirlo donde está; un texto de líneas múltiples, en el editor de <Command id="MTEXT" />; una definición de atributo, como su identificador, su solicitud y su valor por defecto. En el modo Múltiple pide después el siguiente objeto, hasta que Esc o Intro terminan el comando, y toda la ejecución es un paso que <Command id="U" /> deshace. Un doble clic en un texto o en una definición de atributo ejecuta EDITARTEXTO, y en un texto de líneas múltiples abre el editor para ese único objeto.

Esc en el editor de un texto de una línea descarta esa edición y pide el siguiente objeto; un segundo Esc termina el comando. Un objeto en una capa bloqueada dice <Message id="objectOnLockedLayer" /> y vuelve a preguntar, y un clic sobre cualquier otra cosa vuelve a preguntar en silencio. Un texto designado antes del comando se abre enseguida.

## Options

### Undo

Revierte la última edición de esta ejecución y vuelve a preguntar; si no queda ninguna, dice que el comando se ha deshecho por completo.

### Mode

Pide el modo de edición: <Keyword id="Single" /> termina el comando tras un objeto, <Keyword id="Multiple" /> pide otro. El modo se conserva para el siguiente EDITARTEXTO, en todos los dibujos.

## Missing

El texto de las cotas: EDITARTEXTO no edita el texto de una cota, que la opción Texto de <Command id="DIMLINEAR" /> fija al colocarla. Editar el contenido de un texto en la paleta Propiedades. EDITTXTM (`_MTEDIT`) escrito, y `_-MTEDIT`. Mientras el editor está abierto, la línea de comandos muestra `EDITARTEXTO:`, donde AutoCAD edita en el sitio y no pregunta nada.

## Questions

### ¿Cómo se llama el comando TEXTEDIT en español?

EDITARTEXTO, con el alias `ED`; también `DDEDIC` y `TEDIT`, nombres más antiguos de AutoCAD. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_TEXTEDIT`.

### ¿Cómo edito un texto en AutoCAD?

Haz doble clic en él, o escribe `ED` y desígnalo; vuelve a escribirlo y pulsa Intro. EDITARTEXTO pide después el siguiente texto que editar, hasta que pulsas Esc. Su altura y su rotación son filas de la paleta Propiedades, y su estilo, la fila Estilo de texto.

### ¿Cómo edito varios textos seguidos?

Deja EDITARTEXTO en el modo <Keyword id="Multiple" />, el que tiene por defecto: después de cada texto pide el siguiente. <Keyword id="Mode" /> y <Keyword id="Single" /> hacen que termine tras uno, como hace un doble clic.

### ¿Por qué el doble clic no edita mi texto?

Puede que el texto esté en una capa bloqueada: desbloquéala en el Administrador de propiedades de capas. EDITARTEXTO aún no edita el texto de una cota, y los valores de atributo de un bloque abren <Command id="EATTEDIT" />.
