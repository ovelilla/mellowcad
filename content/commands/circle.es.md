---
title: "Círculo en AutoCAD: comando CIRCULO (CIRCLE)"
metaTitle: "Círculo en AutoCAD: comando CIRCULO (CIRCLE)"
description: "Cómo funciona CIRCULO (CIRCLE, alias C) de AutoCAD en español, solicitud a solicitud: centro y radio o Diámetro, 2P, 3P y Ttr. Pruébalo gratis online."
figure: "Tres círculos: centro y radio, los dos extremos de un diámetro (2P), y centro y Diámetro."
sourceHash: "62e25bc029f9"
---

CIRCULO (CIRCLE en inglés) dibuja un círculo a partir de su centro y su radio, escrito o dado por un punto del círculo, o de cualquiera de las otras formas que ofrece su primera solicitud. Intro en el radio repite el tamaño del último círculo, que se guarda para el dibujo. Mientras das el radio, una línea discontinua ámbar va del centro al cursor, y pasa del borde cuando das el diámetro, como la dibuja AutoCAD. El círculo queda en el plano de su primer punto, a la elevación actual si el punto no tiene una Z propia.

## Options

### 3P

Por tres puntos. Escrito con referencias Tangente, `_TAN` en cada uno, es la opción Tan, Tan, Tan de AutoCAD: el círculo tangente a tres objetos.

### 2P

Por los dos extremos de un diámetro.

### Ttr

Tangente a dos objetos, con un radio: designa cada línea, círculo o arco cerca de donde el círculo debe tocarlo y después da el radio. De los círculos que caben, dibuja el que toca más cerca de tus designaciones; si no cabe ninguno, dice <Message id="circleDoesNotExist" />.

### Diameter

En la solicitud del radio: da el diámetro en su lugar, escrito o como un punto.

## Missing

Ttr sobre un segmento de polilínea, que AutoCAD acepta y MellowCAD rechaza; la entrada Tan, Tan, Tan de la paleta de herramientas (escrita, 3P con tres referencias Tangente, funciona); las propiedades rápidas al hacer doble clic en un círculo.

## Questions

### ¿Cómo se llama el comando CIRCLE en español?

CIRCULO, con el alias `C`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_CIRCLE`.

### ¿Cómo dibujo un círculo tangente a dos líneas?

Elige <Keyword id="Ttr" />, designa la primera línea y después la segunda, cerca de donde el círculo debe tocarlas, y escribe el radio.

### ¿Cómo dibujo un círculo tangente a tres objetos?

Elige <Keyword id="3P" /> y escribe `_TAN` antes de cada uno de los tres puntos, designando cada objeto cerca de donde el círculo debe tocarlo.

### ¿Cómo dibujo un círculo por su diámetro?

Da el centro, elige <Keyword id="Diameter" /> y escríbelo. O elige <Keyword id="2P" /> y da los dos extremos del diámetro.
