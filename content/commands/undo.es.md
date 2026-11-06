---
title: "Deshacer en AutoCAD: comando DESHACER (UNDO)"
metaTitle: "Deshacer en AutoCAD: DESHACER, H y Ctrl+Z"
description: "Cómo funciona DESHACER (UNDO) de AutoCAD en español: varios pasos atrás, Marca y Retorno, Inicio y Fin, Control, y en qué se diferencia de H y Ctrl+Z."
before: "Una placa con dos agujeros y una línea que la cruza, dibujados con cuatro comandos: RECTANG, CIRCULO dos veces y LINEA."
figure: "DESHACER 2: se deshacen los dos últimos comandos, la línea y el segundo agujero, y la placa conserva su primer agujero."
sourceHash: "b4fed2178b6a"
---

DESHACER (UNDO en inglés) deshace comandos. Un paso es un comando entero: todo lo que dibujó una LINEA se va de una vez, tuviera los segmentos que tuviera, y lo mismo lo que fijó un comando, como ESCALATL. DESHACER escribe sus parámetros actuales y después pide el número de operaciones que deshacer o una opción; Intro deshace una. Escribe en una línea los nombres de los comandos que ha deshecho, `CIRCULO LINEA`, y <Message id="everythingUndone" /> cuando se le acaban; a partir de ahí, <Message id="nothingToUndo" />. Un comando que no cambió nada, como ID o LIST, también es un paso, y también lo es lo que ZOOM y ENCUADRE hicieron con la vista.

<Command id="U" /> es la forma corta: un paso atrás, sin preguntar nada. Ctrl+Z en la solicitud de comando ejecuta H; dentro de un comando es la opción desHacer de ese comando, como la escribe la macro de AutoCAD: LINEA deshace su último segmento y sigue. <Command id="REDO" />, justo después, recupera lo que deshizo el último H o DESHACER.

## Options

### Auto

Pregunta <Keyword id="ON" /> o <Keyword id="OFF" />, ofreciendo el parámetro actual, que después muestra la línea de parámetros. En AutoCAD hace un solo paso de los comandos que ejecuta una opción de menú; aquí ningún menú ejecuta más de uno, así que no agrupa nada.

### Control

Pregunta cuánto deshacer se conserva, <Keyword id="All" /> por defecto. <Keyword id="None" /> descarta todos los pasos guardados y desactiva el deshacer: H dice entonces <Message id="uDisabled" />, y DESHACER pide Control directamente. <Keyword id="One" /> conserva solo el último paso, y DESHACER pide entonces 1 o Control. Todas vuelve a activar el deshacer completo. <Keyword id="Combine" /> dice si varios ZOOM y ENCUADRE seguidos son un solo paso, y <Keyword id="Layer" /> si lo son varias ediciones seguidas en el Administrador de propiedades de capas, Sí por defecto en los dos. Los parámetros son del dibujo y no se guardan con él: un dibujo nuevo o abierto empieza en Todas, Combinar Sí y CApa Sí.

### BEgin

Empieza un grupo: los comandos ejecutados hasta <Keyword id="End" /> forman un paso, que H deshace entero y nombra `GRUPO` junto con ellos. Mientras hay un grupo abierto, H, un número y Retorno se detienen en su inicio. Inicio con un grupo abierto lo cierra primero.

### End

Cierra el grupo que abrió Inicio.

### Mark

Deja una marca entre los pasos. Retorno, H y un número se detienen en ella, con <Message id="markEncountered" />.

### Back

Deshace todos los pasos hasta la última marca, y la marca con ellos. Sin marca, pregunta si se deshace todo, Sí por defecto.

## Missing

Auto no agrupa nada, ya que aquí ningún menú ejecuta más de un comando. Combinar y CApa duran lo que la sesión del navegador, donde AutoCAD los conserva de una sesión a otra. Los botones Deshacer y Rehacer de la barra superior no escriben nada en el historial, donde la barra de herramientas de acceso rápido de AutoCAD escribe lo suyo. Ctrl+Mayús+Z también rehace, sin decir nada, aunque AutoCAD no le asigna nada.

## Questions

### ¿Cuál es el atajo de DESHACER en AutoCAD?

Ctrl+Z, o `H` e Intro: un paso atrás (en AutoCAD en español, `U` es <Command id="JOIN" />). DESHACER no tiene alias; escríbelo entero para un número de pasos o sus opciones, o `_UNDO` en cualquier idioma de AutoCAD.

### ¿Qué diferencia hay entre H y DESHACER?

<Command id="U" /> deshace el último comando y no pregunta nada. DESHACER pregunta cuántos deshacer, y tiene Marca y Retorno para volver a un punto marcado, Inicio y Fin para hacer de varios comandos un solo paso, y Control para limitar el deshacer o desactivarlo.

### ¿Cómo deshago varios comandos a la vez?

Escribe `DESHACER` y el número de comandos, por ejemplo `5`. O elige <Keyword id="Mark" /> antes de una serie que quizá quieras descartar, y <Keyword id="Back" /> para volver a ella.

### ¿Por qué no funciona DESHACER?

Se desactivó el deshacer con Control <Keyword id="None" />: H lo dice, y DESHACER pide Control. Responde <Keyword id="All" /> para volver a activarlo. Los pasos dados antes se han perdido.

### ¿Cómo rehago lo que he deshecho?

<Command id="REDO" />, justo después de H o DESHACER, lo recupera entero. Ctrl+Y rehace un paso cada vez.
