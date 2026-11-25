---
title: "Estilos de cota en AutoCAD: ACOESTIL (DIMSTYLE)"
metaTitle: "Estilo de cota en AutoCAD: ACOESTIL (DIMSTYLE)"
description: "Cómo funciona ACOESTIL (DIMSTYLE) de AutoCAD en español: estilos de cota desde ISO-25, altura de texto, flechas, escala y separador decimal. Pruébalo gratis."
figure: "Cotas dibujadas en ISO-25, el estilo actual: flechas, el texto sobre la línea y una coma como separador decimal."
sourceHash: "7bcae870d3ae"
---

ACOESTIL (DIMSTYLE en inglés) gestiona los estilos de cota del dibujo: conjuntos de parámetros con nombre, tamaño de flecha, altura de texto, escala general, unidades y demás, que cada cota toma de su estilo. Un dibujo nuevo empieza con ISO-25 como estilo actual, el estilo métrico con el que empieza AutoCAD. ACOESTIL abre el Administrador de estilos de cota, como en AutoCAD; escrito con un apóstrofo dentro de un comando, `'ACOESTIL`, se abre sin terminar ese comando.

El administrador nombra el estilo actual y lista los estilos, todos los estilos o solo los estilos en uso. Definir actual hace actual el estilo designado. Nuevo... pide un nombre, `Copia de` el estilo por el que comienza, y después abre los parámetros del estilo nuevo; queda como actual al cerrarse el administrador. Modificar... abre los parámetros del estilo designado en las fichas del administrador: Líneas (intervalo de línea base, ampliar líneas de cota, desfase desde origen), Símbolos y flechas (tamaño de flecha, marcas de centro), Texto (altura de texto, desfase de línea de cota), Ajustar (la escala general, y si se dibuja la línea de cota entre las líneas de referencia) y Unidades principales (precisión, separador decimal, ceros a la derecha, precisión angular). Aceptar los aplica, y todas las cotas de ese estilo se vuelven a dibujar al instante. Un clic derecho en un estilo le cambia el nombre o lo suprime; un nombre ya en uso se rechaza, e ISO-25, el estilo actual y un estilo en uso no se pueden suprimir. Todo lo hecho en el administrador es un solo paso que Deshacer revierte.

## Missing

La vista preliminar, la descripción, las modificaciones temporales del estilo y la comparación de estilos del administrador; tampoco hay subestilos para un tipo de cota, ni unidades alternativas ni tolerancias, y solo los parámetros listados arriba. Una variable de cota escrita en la línea de comandos, como DIMSCALE, no crea una modificación del estilo actual. Un dibujo nuevo solo tiene ISO-25, sin los estilos Standard y Anotativo que un dibujo métrico nuevo de AutoCAD también contiene.

## Questions

### ¿Cómo se llama el comando DIMSTYLE en español?

ACOESTIL, con los alias `ACES`, `ACOEST`, `AES` y `DCOTA`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMSTYLE`. <Command id="-DIMSTYLE" /> trabaja en la línea de comandos: guarda los parámetros actuales como un estilo nuevo o hace actual un estilo por su nombre.

### ¿Cómo cambio el tamaño del texto de las cotas?

Designa el estilo en el administrador, pulsa Modificar... y cambia Altura de texto, en Texto, o Usar escala general, en Ajustar, que multiplica todos los tamaños del estilo, flechas y desfases junto con el texto. Todas las cotas de ese estilo se vuelven a dibujar al instante. Para cambiar solo algunas cotas, dales un estilo propio.

### ¿Cómo aplico un estilo de cota a cotas ya dibujadas?

Designa las cotas y elige el estilo en la fila Estilo de cota de la paleta Propiedades, o haz clic derecho y elígelo en Estilo de cota: un solo paso de deshacer en los dos casos. Las cotas nuevas toman el estilo actual, que se cambia con Definir actual en el administrador.

### ¿Cómo pongo punto en lugar de coma en las cotas?

ISO-25 escribe una coma, como `82,5`. En Unidades principales, cambia Separador decimal a punto o a espacio; Precisión y Suprimir ceros a la derecha están ahí también. La línea de comandos sigue dando la medida con punto, como la de AutoCAD.

### ¿Cómo creo un estilo de cota nuevo?

Pulsa Nuevo..., ponle nombre y elige el estilo por el que comienza, después Continuar: se abren sus parámetros, y Aceptar lo crea. Queda como actual al cerrarse el administrador, y toda cota que dibujes desde entonces usa ese estilo.
