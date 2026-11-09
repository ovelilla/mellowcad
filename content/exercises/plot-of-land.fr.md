---
title: "Exercice AutoCAD : une parcelle de terrain"
metaTitle: "Exercice AutoCAD génie civil : aire d'un terrain"
description: "Dessinez une parcelle dans AutoCAD en coordonnées polaires, d'après la longueur et l'angle de ses côtés, puis mesurez son aire et cotez-la. Gratuit, en ligne."
figure: "Une parcelle de cinq côtés, en mètres, avec la cote de chaque côté et d'un angle."
sourceHash: "f5542a75eef7"
---

Dessinez cette parcelle, en mètres, d'après la longueur et la direction de ses côtés : 40 à 0°, 30 à 80°, 35 à 155° et 25 à 230°, puis retour au départ. Mesurez son aire et son périmètre, et cotez chaque côté ainsi que l'angle à son deuxième sommet. Les coordonnées polaires, une longueur et un angle, dessinent chaque côté depuis la fin du précédent. L'échelle des cotes du dessin est réglée pour des mètres.

## Steps

### Dessinez le contour [#boundary]

Sur le calque Contour, <Command id="PLINE" /> depuis `0,0`, puis chaque côté par sa longueur et son angle : `40<0`, `30<80`, `35<155` et `25<230`, chacun mesuré depuis le dernier point. <Keyword command="PLINE" id="Close" /> dessine le cinquième côté et ferme le contour : un seul objet, que <Command id="AREA" /> peut mesurer.

### Mesurez son aire [#area]

<Command id="AREA" />, puis <Keyword command="AREA" id="Object" />, et désignez le contour : la ligne de commande donne son aire, en mètres carrés, et son périmètre.

### Cotez-la [#dimensions]

Sur le calque Cotes, <Command id="DIMALIGNED" /> et Entrée à sa première invite : elle demande alors un objet, et un clic sur un côté cote ce côté, parallèlement à lui. Placez chaque cote à l'extérieur de la parcelle. <Command id="DIMANGULAR" /> sur les deux côtés qui se rejoignent en `40,0` donne l'angle entre eux, 100°.
