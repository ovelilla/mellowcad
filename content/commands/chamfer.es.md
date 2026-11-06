---
title: "Chaflán en AutoCAD: CHAFLAN (CHAMFER)"
metaTitle: "Chaflán en AutoCAD: comando CHAFLAN (CHAMFER)"
description: "Cómo funciona CHAFLAN (CHAMFER, alias CH) de AutoCAD en español: dos distancias, dos líneas o una polilínea, múLtiple y Mayús. Pruébalo gratis online."
figure: "Cuatro líneas, después Distancia 10 para las dos y múLtiple: dos esquinas achaflanadas y dos que quedan vivas."
sourceHash: "e43c5b72ffc8"
---

CHAFLAN (CHAMFER en inglés) corta la esquina entre dos líneas con un bisel recto. Designa la primera línea y después la segunda: cada una se recorta o se alarga hasta el bisel, la primera según la primera distancia y la segunda según la segunda, y el bisel las une. Funciona con dos líneas, con dos tramos rectos de una polilínea, o con una línea y una polilínea, que une en una sola polilínea. Como en AutoCAD, su primera línea dice las distancias actuales, que se guardan en el dibujo; con las dos a 0, como al empezar, hace una esquina viva, las líneas encontrándose. Mientras designas la segunda línea, la esquina que haría se muestra sobre las líneas.

## Options

### Undo

Deshace el último chaflán de esta ejecución, y con él un cambio de las distancias.

### Polyline

Pide una polilínea 2D y achaflana todas sus esquinas; después dice cuántas líneas se han unido con chaflán y por qué alguna no.

### Distance

Pide la primera y la segunda distancia de chaflán. La segunda propone la primera, así que Intro en ella hace el bisel igual, a 45 grados en una esquina en escuadra.

### Multiple

Vuelve a pedir una primera línea después de cada chaflán, hasta Intro o Esc.

## Missing

Ángulo, que fija el bisel con una distancia y un ángulo, Método y Recortar: CHAFLAN siempre trabaja con dos distancias y siempre recorta las líneas. En AutoCAD el bisel toma la escala de tipo de línea de la segunda línea; aquí no.

## Questions

### ¿Cómo se llama el comando CHAMFER en español?

CHAFLAN, con el alias `CH`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_CHAMFER`.

### ¿Cómo hago un chaflán a 45 grados en AutoCAD?

Elige <Keyword id="Distance" />, escribe la distancia y pulsa Intro en la segunda: en una esquina en escuadra, dos distancias iguales dan un bisel a 45 grados.

### ¿Qué diferencia hay entre chaflán y empalme?

CHAFLAN une dos líneas con un bisel recto; <Command id="FILLET" />, con un arco tangente a las dos. Los dos recortan o alargan las líneas hasta él, y los dos hacen una esquina viva con 0 o manteniendo pulsada Mayús al designar la segunda línea.

### ¿Por qué no funciona el chaflán?

Dice por qué: <Message id="chamferDistanceTooLarge" /> cuando una distancia pasa del final de su línea, <Message id="linesParallel" /> con líneas paralelas, y <Message id="chamferRequiresLines" /> con un arco o un círculo. Con las dos distancias a 0 hace una esquina, no un bisel.

### ¿Cómo achaflano todas las esquinas de un rectángulo?

Un rectángulo es una polilínea: elige <Keyword id="Polyline" /> y desígnalo, y todas las esquinas se achaflanan con las distancias actuales.
