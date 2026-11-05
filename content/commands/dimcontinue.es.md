---
title: "Cota continua en AutoCAD: ACOCONTINUA (DIMCONTINUE)"
metaTitle: "Cota continua en AutoCAD: comando ACOCONTINUA"
description: "Cómo funciona ACOCONTINUA (DIMCONTINUE, alias ACOCONT) de AutoCAD en español: cotas en cadena desde la última, con Designar y desHacer. Pruébalo gratis online."
figure: "Un perfil escalonado acotado 30 y continuado 40 y 30 en la misma línea: dos orígenes y después Intro dos veces."
sourceHash: "11fa474694fd"
---

ACOCONTINUA (DIMCONTINUE en inglés) dibuja una cadena de cotas una tras otra: cada una empieza en la segunda línea de referencia de la anterior y mide hasta el siguiente punto que precisas, en la misma línea de cota. Continúa la última cota lineal o alineada hecha desde que se abrió el dibujo, así que suele ir después de <Command id="DIMLINEAR" /> o <Command id="DIMALIGNED" />; si no hay ninguna, pregunta cuál continuar. La línea de comandos dice cada medida en cuanto se hace. Intro en la solicitud del origen elige <Keyword id="Select" />, e Intro allí termina el comando, como Esc.

Como en AutoCAD, cada cota nueva mide en la dirección de su base y toma el estilo de cota y la capa de la base, con el color, el tipo de línea y el grosor de línea actuales.

## Options

### Select

Pide la cota desde la que continuar: designa una lineal o alineada cerca de la línea de referencia desde la que seguir. Un punto escrito ahí también designa. Una cota de radio o de diámetro se rechaza con <Message id="associativeDimensionRequired" />, y se vuelve a preguntar.

### Undo

Deshace la última cota de la cadena y sigue desde la anterior, tantas veces como cotas haya. Cuando no queda ninguna, responde <Message id="commandCompletelyUndone" /> y la solicitud sigue.

## Missing

Una cota no es asociativa: una cadena no sigue a los objetos que mide. Una cota angular no se puede continuar: AutoCAD continúa la que se hizo la última o la que se designa; aquí, si es la última, el comando pide una cota, y si se designa, se rechaza como una de radio. Aún no existen las cotas de coordenadas.

## Questions

### ¿Cómo se llama el comando DIMCONTINUE en español?

ACOCONTINUA, con el alias `ACOCONT`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMCONTINUE`.

### ¿Qué diferencia hay entre ACOCONTINUA y ACOLINEABASE?

ACOCONTINUA pone las cotas una tras otra en una línea, cada una desde donde terminó la anterior. <Command id="DIMBASELINE" /> las mide todas desde la misma línea de referencia, cada una en una línea más alejada.

### ¿Cómo continúo desde una cota que no es la última?

Pulsa Intro en la primera solicitud, o elige <Keyword id="Select" />, y designa la cota cerca de la línea de referencia desde la que seguir: la cadena crece desde allí.

### ¿Por qué ACOCONTINUA me pide designar una cota?

Porque no tiene ninguna que continuar: no se ha hecho ninguna cota lineal o alineada desde que se abrió el dibujo, como en AutoCAD al abrir uno, o la última que se hizo es angular. Designa la cota desde la que continuar.
