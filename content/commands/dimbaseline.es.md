---
title: "Cota de línea base en AutoCAD: ACOLINEABASE (DIMBASELINE)"
metaTitle: "Cotas de línea base en AutoCAD: ACOLINEABASE"
description: "Cómo funciona ACOLINEABASE (DIMBASELINE, alias ACOLINE) de AutoCAD en español: cotas desde una misma base y su intervalo. Pruébalo gratis online."
figure: "Un perfil escalonado acotado 30 desde su lado izquierdo, y después 70 y 100 desde el mismo lado, cada una en una línea más alejada."
sourceHash: "cd7902f90b59"
---

ACOLINEABASE (DIMBASELINE en inglés) dibuja cotas que miden todas desde una misma línea de referencia, la base: cada una va de la primera línea de referencia de la última cota al siguiente punto que precisas, con su línea de cota un intervalo más alejada. Empieza desde la última cota lineal o alineada hecha desde que se abrió el dibujo, así que suele ir después de <Command id="DIMLINEAR" /> o <Command id="DIMALIGNED" />; si no hay ninguna, pregunta desde cuál empezar. La línea de comandos dice cada medida en cuanto se hace. Intro en la solicitud del origen elige <Keyword id="Select" />, e Intro allí termina el comando, como Esc.

El intervalo es el intervalo de línea base del estilo de cota actual, 3,75 en ISO-25, por la escala general de la base. Como en AutoCAD, cada cota nueva mide en la dirección de su base y toma el estilo de cota y la capa de la base, con el color, el tipo de línea y el grosor de línea actuales.

## Options

### Select

Pide la cota base: designa una lineal o alineada cerca de la línea de referencia desde la que medir. Un punto escrito ahí también designa. Una cota de radio o de diámetro se rechaza con <Message id="associativeDimensionRequired" />, y se vuelve a preguntar.

### Undo

Deshace la última cota hecha y sigue desde la anterior, tantas veces como cotas haya. Cuando no queda ninguna, responde <Message id="commandCompletelyUndone" /> y la solicitud sigue.

## Missing

Una cota no es asociativa: las cotas no siguen a los objetos que miden. Una cota angular no puede ser la base: AutoCAD toma la que se hizo la última o la que se designa; aquí, si es la última, el comando pide una cota, y si se designa, se rechaza como una de radio. Aún no existen las cotas de coordenadas.

## Questions

### ¿Cómo se llama el comando DIMBASELINE en español?

ACOLINEABASE, con el alias `ACOLINE`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMBASELINE`.

### ¿Cómo cambio la separación de las cotas de línea base?

Es el intervalo de línea base del estilo de cota: <Command id="DIMSTYLE" /> (`ACES`) abre los estilos en la paleta Estilos, donde está en Líneas, como en AutoCAD. Las cotas ya dibujadas mantienen su sitio; <Command id="DIMSPACE" /> las vuelve a espaciar por igual.

### ¿Cómo empiezo desde otra cota?

Pulsa Intro en la primera solicitud, o elige <Keyword id="Select" />, y designa la cota cerca de la línea de referencia desde la que medir: todas las cotas nuevas empiezan allí.

### ¿Qué diferencia hay entre ACOLINEABASE y ACOCONTINUA?

ACOLINEABASE mide todas las cotas desde la misma línea de referencia, cada una en una línea más alejada. <Command id="DIMCONTINUE" /> las pone una tras otra en una línea, cada una desde donde terminó la anterior.
