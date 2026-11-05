---
title: "Estilos de cota en AutoCAD: ACOESTIL (DIMSTYLE)"
metaTitle: "Estilo de cota en AutoCAD: ACOESTIL (DIMSTYLE)"
description: "Cómo funciona ACOESTIL (DIMSTYLE) de AutoCAD en español: estilos de cota desde ISO-25, altura de texto, flechas, escala y separador decimal. Pruébalo gratis."
figure: "Cotas dibujadas en ISO-25, el estilo actual: flechas, el texto sobre la línea y una coma como separador decimal."
sourceHash: "a363c0740c11"
---

ACOESTIL (DIMSTYLE en inglés) gestiona los estilos de cota del dibujo: conjuntos de parámetros con nombre, tamaño de flecha, altura de texto, escala general, unidades y demás, que cada cota toma de su estilo. Un dibujo nuevo empieza con ISO-25 como estilo actual, el estilo métrico con el que empieza AutoCAD. Donde AutoCAD abre el cuadro Administrador de estilos de cota, ACOESTIL abre aquí la tabla de cotas de la paleta Estilos, una ficha del panel de paletas que sigue abierta mientras dibujas; <Command id="STYLE" /> abre la misma paleta en sus estilos de texto.

La paleta lista los estilos, con el actual marcado. Nuevo crea una copia del estilo designado, con un nombre basado en el suyo, y la hace actual; un estilo cambia de nombre en la propia lista, y un nombre ya en uso se rechaza. ISO-25, el estilo actual y un estilo en uso no se pueden suprimir. Bajo la lista, los parámetros del estilo designado se agrupan con los nombres de las fichas del administrador: Líneas (intervalo de línea base, ampliar líneas de cota, desfase desde origen), Símbolos y flechas (tamaño de flecha, tamaño de marca de centro), Texto (altura de texto, desfase de línea de cota), Ajustar (la escala general, y si se dibuja la línea de cota entre las líneas de referencia) y Unidades principales (precisión, separador decimal, ceros a la derecha, precisión angular). Un cambio vuelve a dibujar al instante todas las cotas de ese estilo. Cada cambio, y cada estilo nuevo, cambio de nombre, supresión y cambio de estilo actual, es un paso que Deshacer revierte.

## Missing

El propio cuadro Administrador de estilos de cota: la paleta no tiene vista preliminar, filtro de la lista, modificaciones temporales del estilo, comparación de estilos ni descripción, ni subestilos para un tipo de cota, ni unidades alternativas ni tolerancias, y solo los parámetros listados arriba. Una variable de cota escrita en la línea de comandos, como DIMSCALE, no crea una modificación del estilo actual. Un dibujo nuevo solo tiene ISO-25, sin los estilos Standard y Anotativo que un dibujo métrico nuevo de AutoCAD también contiene.

## Questions

### ¿Cómo se llama el comando DIMSTYLE en español?

ACOESTIL, con los alias `ACES`, `ACOEST`, `AES` y `DCOTA`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_DIMSTYLE`. <Command id="-DIMSTYLE" /> trabaja en la línea de comandos: guarda los parámetros actuales como un estilo nuevo o hace actual un estilo por su nombre.

### ¿Cómo cambio el tamaño del texto de las cotas?

Designa el estilo en la paleta y cambia Altura de texto, en Texto, o Usar escala general, en Ajustar, que multiplica todos los tamaños del estilo, flechas y desfases junto con el texto. Todas las cotas de ese estilo se vuelven a dibujar al instante. Para cambiar solo algunas cotas, dales un estilo propio.

### ¿Cómo aplico un estilo de cota a cotas ya dibujadas?

Designa las cotas y elige el estilo en la fila Estilo de cota de la paleta Propiedades, o haz clic derecho y elígelo en Estilo de cota: un solo paso de deshacer en los dos casos. Las cotas nuevas toman el estilo actual, que se cambia con Definir actual en la paleta.

### ¿Cómo pongo punto en lugar de coma en las cotas?

ISO-25 escribe una coma, como `82,5`. En Unidades principales, cambia Separador decimal a punto o a espacio; Precisión y Suprimir ceros a la derecha están ahí también. La línea de comandos sigue dando la medida con punto, como la de AutoCAD.

### ¿Cómo creo un estilo de cota nuevo?

Designa el estilo del que partes y pulsa Nuevo: la copia toma un nombre basado en el suyo, queda como actual y lista para cambiarle el nombre y los parámetros. Toda cota que dibujes desde entonces usa ese estilo.
