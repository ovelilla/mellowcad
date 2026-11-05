---
title: "Crear bloques en AutoCAD: BLOQUE (BLOCK)"
metaTitle: "Crear bloques en AutoCAD: comando BLOQUE (BLOCK)"
description: "Cómo funciona BLOQUE (BLOCK, alias BQ) de AutoCAD en español, solicitud a solicitud: nombre, punto base y objetos; redefinir, atributos. Pruébalo gratis online."
figure: "Una silla, un rectángulo y una línea, convertida en el bloque B1: su nombre, un punto base en el centro de su borde delantero y los dos objetos designados."
sourceHash: "ca24f209008c"
---

BLOQUE (BLOCK en inglés) guarda un conjunto de objetos en el dibujo con un nombre, para que <Command id="INSERT" /> pueda colocarlo de nuevo tantas veces como quieras, cada copia una referencia a esa única definición. Pide el nombre, después el punto base de inserción —el punto por el que se coloca cada referencia— y después los objetos. Intro termina la designación y define el bloque, y los objetos designados se convierten en una referencia a él, donde estaban. Todo el comando es un paso que Deshacer revierte.

El BLOQUE de AutoCAD abre el cuadro de diálogo Definición de bloque, que MellowCAD no tiene: aquí BLOQUE pide en la línea de comandos lo mismo que <Command id="-BLOCK" />, como hace la consola de AutoCAD. Un nombre puede tener espacios y hasta 255 caracteres, pero ninguno de `< > / \ " : ; ? * | , =` ni el acento grave: Intro solo o un nombre así dice <Message id="invalidNewBlockName" /> y vuelve a preguntar. Un nombre que el dibujo ya tiene, en mayúsculas o en minúsculas, pregunta si se redefine ese bloque, <Keyword id="Yes" /> o <Keyword id="No" /> (por defecto, que termina el comando).

## Options

### ?

Enumera los bloques del dibujo: pregunta cuáles, `*` (todos) por defecto o un nombre con comodines, escribe los nombres que coinciden y cuántos hay de cada tipo, y termina. Los bloques anónimos, como los de una matriz, se cuentan, pero nunca se nombran.

## Missing

El cuadro de diálogo Definición de bloque de AutoCAD: BLOQUE pregunta en la línea de comandos. En el punto base, las opciones para hacer el bloque anotativo y para conservar o borrar los objetos: aquí siempre se convierten en una referencia. ATTREQ 0, que se salta el cuadro de valores de atributo, y los comandos que sincronizan y ordenan los atributos de un bloque (`_ATTSYNC`, `_ATTREDEF`, `_BATTMAN`, `_BATTORDER`): un bloque redefinido deja los atributos de sus referencias como estaban, como hace AutoCAD. PorBloque: un objeto dentro de un bloque no puede tomar el color, el tipo de línea ni el grosor de línea propios de la referencia, como hace en AutoCAD uno dibujado PorBloque. En un SCP girado, AutoCAD 2027 desplaza los objetos que convierte; aquí se quedan donde estaban, a propósito.

## Questions

### ¿Cómo se llama el comando BLOCK en español?

BLOQUE, con el alias `BQ` (en AutoCAD en español, `B` es <Command id="ERASE" />). Como allí, el nombre inglés también funciona con un guion bajo delante: `_BLOCK`. En AutoCAD abre el cuadro de diálogo Definición de bloque; aquí pregunta en la línea de comandos, como `-BQ` (<Command id="-BLOCK" />).

### ¿Cómo se crea un bloque en AutoCAD?

Escribe `BQ` y un nombre, precisa el punto base —una esquina, o el centro del borde sobre el que se apoyará el bloque— y designa los objetos. Intro define el bloque y convierte los objetos en una referencia a él. Una designación hecha antes del comando también se toma, después del punto base.

### ¿Cómo redefino un bloque?

Ejecuta BLOQUE con el nombre del bloque y responde <Keyword id="Yes" />; después precisa un punto base y designa los objetos nuevos: cada referencia al bloque muestra la nueva definición. Los objetos no pueden incluir una referencia al propio bloque: un conjunto así se rechaza y el comando termina.

### ¿Cómo creo un bloque con atributos?

Define primero los atributos con <Command id="ATTDEF" /> y desígnalos con los demás objetos: entran en el bloque en el orden en que los designas. La referencia que los sustituye abre un cuadro con un campo por atributo, rotulado con su solicitud y relleno con su valor por defecto: Intro aplica los valores y Esc conserva los de por defecto.

### ¿Cómo se explota (descompone) un bloque?

<Command id="EXPLODE" /> convierte una referencia de nuevo en los objetos que muestra, un nivel de anidamiento cada vez, cada uno en su capa y con su color. Los atributos vuelven como sus definiciones, y los valores se pierden.
