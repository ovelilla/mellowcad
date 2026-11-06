---
title: "Alinear y espaciar cotas en AutoCAD: ACOESPAC (DIMSPACE)"
metaTitle: "Alinear y espaciar cotas en AutoCAD: ACOESPAC"
description: "Cómo funciona ACOESPAC (DIMSPACE) de AutoCAD en español: igualar el espacio entre cotas o alinearlas con 0, y Auto según la altura de texto. Pruébalo gratis."
before: "El borde superior de una placa acotado en una cadena de tres, cada cota colocada a una altura propia, tal como se dibujaron."
figure: "ACOESPAC desde la primera cota, las otras dos designadas y el intervalo 0: la cadena alineada en una sola línea."
sourceHash: "7ec7c0eb9883"
---

ACOESPAC (DIMSPACE en inglés) ajusta el espacio entre cotas lineales y alineadas paralelas. Designas la cota base, que se queda donde está, y después las cotas que se van a espaciar; Intro termina la designación y pide el intervalo. La línea de cada cota se desplaza entonces, alejándose de la base en el orden en que están, a esa distancia de la anterior. Un intervalo de 0 las alinea todas en la línea de la base: una cadena escalonada tal como se dibujó se lee como una sola. Lo único que cambia es dónde quedan las líneas de cota, en un paso que <Command id="U" /> deshace.

La base se designa, se escribe como un punto o se toma con `úLTimo`; una que no es una cota dice <Message id="selectedObjectNotDimension" /> y vuelve a preguntar. Un conjunto designado antes del comando es el que se espacia. Una cota con otro ángulo que la base se cuenta y se deja donde está, y un intervalo negativo se rechaza con <Message id="negativeSpacing" />.

## Options

### Auto

La opción por defecto, con Intro: un intervalo del doble de la altura de texto del estilo de cota de la base, multiplicado por su escala general, para que la pila quepa con su propio texto.

## Missing

Las cotas angulares, que ACOESPAC aún no espacia. AutoCAD solo desplaza una cota donde hace falta; aquí se vuelve a espaciar cada cota designada.

## Questions

### ¿Cómo alineo cotas en AutoCAD?

Ejecuta ACOESPAC, designa la cota con la que deben alinearse las demás, desígnalas, pulsa Intro y escribe `0`: cada línea de cota pasa a la línea de la base.

### ¿Cómo hago que la separación entre cotas sea igual?

Ejecuta ACOESPAC, designa como base la cota más cercana al objeto, designa las demás y pulsa Intro dos veces: <Keyword id="Auto" /> las espacia con el doble de la altura de texto. O escribe la distancia que quieras, como `8`.

### ¿Cuál es la separación entre cotas por defecto en AutoCAD?

El <Keyword id="Auto" /> de ACOESPAC es el doble de la altura de texto del estilo de cota. <Command id="DIMBASELINE" /> usa en cambio el intervalo de línea base del estilo, 3,75 en ISO-25, para cada cota que añade.

### ¿Por qué ACOESPAC no desplaza una cota?

Solo espacia cotas paralelas a la base: una con otro ángulo se cuenta y se deja donde está. Las cotas angulares aún no se espacian.
