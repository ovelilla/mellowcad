---
title: "Escala de tipo de línea en AutoCAD: ESCALATL (LTSCALE)"
metaTitle: "Escala de línea en AutoCAD: comando ESCALATL"
description: "Cómo funciona ESCALATL (LTSCALE, alias EC) de AutoCAD en español: la escala de tipo de línea del dibujo, para que se vean los trazos. Pruébalo gratis."
before: "Una placa de 4 metros de largo, con su agujero dibujado en HIDDEN y sus ejes en CENTER, a la escala de tipo de línea por defecto, 1: los trazos, demasiado finos para verse."
figure: "La misma placa tras ESCALATL 20: los trazos del agujero y de los ejes, dibujados 20 veces más largos."
sourceHash: "33b956c956fa"
---

ESCALATL (LTSCALE en inglés) fija el factor de escala global de los tipos de línea: lo largos que son los trazos y los huecos de cada tipo de línea de trazos del dibujo. Pide el nuevo factor y ofrece el actual, 1.0000 en un dibujo nuevo: 2 hace cada trazo el doble de largo; 0.5, la mitad. El factor debe ser mayor que 0; si no, dice <Message id="positiveNonzero" /> y vuelve a preguntar, y `1/2` y `1e3` se leen como números. Un cambio vuelve a dibujar todo el dibujo, <Message id="regeneratingModel" /> como lo dice AutoCAD 2027, y se guarda con el dibujo; es un paso que <Command id="U" /> deshace. Escrito con un apóstrofo dentro de un comando, `'ESCALATL`, el dibujo se vuelve a dibujar cuando ese comando termina.

Los tipos de línea son patrones hechos para un dibujo del tamaño del papel: en un dibujo de 4 metros de ancho, en milímetros, el patrón de CENTER, de unas 51 unidades, se repite unas 80 veces a lo largo de él, demasiado fino para verse, y una línea más corta que un patrón se dibuja continua. La escala que conviene suele ser la del propio dibujo: 20 para un dibujo que se leerá a 1:20, 50 a 1:50.

## Missing

El Administrador de tipos de línea, cuyo Factor de escala global es ESCALATL y su Escala de objeto actual, CELTSCALE. PSLTSCALE y MSLTSCALE, porque no hay espacio papel. Las formas de los tipos de línea complejos como BATTING, que se dibujan como sus huecos.

## Questions

### ¿Cómo se llama el comando LTSCALE en español?

ESCALATL, con el alias `EC`. Como en AutoCAD en español, el nombre inglés también funciona con un guion bajo delante: `_LTSCALE`.

### ¿Por qué mi línea de trazos se ve continua?

Su patrón no se ajusta al dibujo con la escala actual. Una línea más corta que una repetición de su patrón se dibuja continua; una larga con una escala pequeña junta tanto sus trazos que parece continua. Sube ESCALATL en un dibujo grande y bájala en uno pequeño, hasta que se vean los trazos.

### ¿Qué escala de tipo de línea uso en AutoCAD?

La escala del dibujo: en un dibujo en milímetros que se leerá a 1:50, `50`. Para un dibujo del tamaño del papel, 1.

### ¿Qué diferencia hay entre ESCALATL y el tipo de línea?

El tipo de línea, fijado con <Command id="LINETYPE" /> o con la capa, es el patrón: trazos, puntos y huecos. ESCALATL es lo largo que se dibuja ese patrón, el mismo factor para todos los objetos del dibujo.
