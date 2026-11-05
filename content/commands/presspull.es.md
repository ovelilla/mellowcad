---
title: "Presionar/Tirar en AutoCAD: PRESIONARTIRAR (PRESSPULL)"
metaTitle: "Comando PRESIONARTIRAR (PRESSPULL) en AutoCAD"
description: "Cómo funciona PRESIONARTIRAR (PRESSPULL) de AutoCAD en español: presiona o tira de un objeto cerrado, un área delimitada o una cara. Pruébalo gratis online."
figure: "El área entre un rectángulo y un círculo presionada 8 hacia abajo: una placa con un agujero, vista desde el sureste con el estilo visual Oculto."
sourceHash: "b806d59060e1"
---

PRESIONARTIRAR (PRESSPULL en inglés) extruye lo que señalas con un clic: un objeto cerrado, un área que unos objetos cierran alrededor del clic o una cara plana de un sólido 3D. Haz clic y después escribe la altura, o mueve el cursor y haz clic: una altura positiva tira; una negativa, presiona. Un objeto cerrado o un área se convierten en un sólido nuevo, el que haría <Command id="EXTRUDE" />, y los objetos se quedan; las islas de un área son agujeros en él, como en la sesión. Una cara añade su prisma a su sólido o se lo quita: la cara superior de un prisma, tirada, lo hace más alto. La solicitud vuelve para el siguiente clic hasta Intro, y toda la ejecución es un paso que Deshacer revierte.

Mantén Ctrl y se ilumina la cara que tomaría un clic; Ctrl+clic desfasa esa cara en su lugar, prolongando sus vecinas hasta encontrarla, de modo que un lado inclinado conserva su pendiente. Como en AutoCAD, PRESIONARTIRAR funciona con clics: a un número o un punto escritos en su primera solicitud responde <Message id="presspullClick" />, y la vuelve a hacer.

## Options

### Multiple

En la solicitud de la altura, o en la de la distancia de desfase: sigue haciendo clic para añadir más —objetos cerrados y áreas, o caras de un mismo sólido— y después pulsa Intro: una sola altura sirve para todos. Una cara señalada después de un objeto o un área se filtra.

## Missing

Una cara curva, que AutoCAD también desfasa: aquí el clic no encuentra ninguna cara. Un desfase cuyas caras vecinas son conos, esferas o toroides, o planos y caras curvas a la vez, o que empujaría una cara a través de la opuesta: el sólido queda como estaba. Las áreas que AutoCAD estampa en una cara (IMPLIEDFACE), y Ctrl+Mayús+E. Un objeto abierto, que AutoCAD extruye como superficie: aún no hay superficies. Mientras arrastras, la vista previa muestra el prisma de la cara o el sólido nuevo, no el sólido tal como quedará, y una cara solo se ilumina con Ctrl. Un área delimitada fuera del plano del SCP no se ha probado.

## Questions

### ¿Qué diferencia hay entre PRESIONARTIRAR y EXTRUSION?

<Command id="EXTRUDE" /> toma los objetos cerrados que designas, los borra según DELOBJ y ofrece una dirección, una inclinación y una expresión. PRESIONARTIRAR toma clics —un objeto cerrado, el área dentro de varios objetos o una cara de un sólido, que añade a ese sólido o le recorta— y conserva los objetos. A partir de un objeto, los dos crean el mismo sólido.

### ¿Cómo extruir una cara de un sólido?

Ejecuta PRESIONARTIRAR, haz clic en la cara y da la distancia: una positiva la saca y el sólido crece; una negativa la hunde. Mantén Ctrl al hacer clic para desfasar la cara en su lugar. Por ahora, solo caras planas.

### ¿Por qué no funciona PRESIONARTIRAR?

Necesita un clic sobre algo cerrado. A un número o un punto escritos en su primera solicitud, y a un clic sobre un objeto abierto o una cara curva, PRESIONARTIRAR responde <Message id="presspullClick" /> y vuelve a preguntar. Haz clic sobre un objeto cerrado, dentro de un área que unos objetos cierran en planta o sobre una cara plana de un sólido.

### ¿Cómo se llama el comando PRESSPULL en español?

PRESIONARTIRAR, también PULSARTIRAR. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_PRESSPULL`. Ctrl+Mayús+E, la tecla de AutoCAD para él, aún no existe aquí.
