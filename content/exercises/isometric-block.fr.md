---
title: "Exercice AutoCAD isométrique : un bloc étagé"
metaTitle: "Dessin isométrique AutoCAD : un bloc étagé"
description: "Dessinez un bloc étagé en isométrique dans AutoCAD avec LIGNE (LINE), en coordonnées polaires sur les axes à 30°, 90° et 150°, et cotez-le. Gratuit, pas à pas."
figure: "Un bloc étagé en isométrique, de 60 de long, 40 de profondeur et 40 de haut, ses dimensions cotées le long de ses arêtes."
sourceHash: "c1039d3b5e97"
---

Dessinez ce bloc étagé en isométrique, en millimètres : 60 de long, 40 de profondeur et 40 de haut, avec une marche de 20 de profondeur et 20 de haut le long de sa face avant. Chaque arête suit l'un des axes isométriques : 30° et 210° pour la longueur, 150° et 330° pour la profondeur, 90° et 270° pour la hauteur. MellowCAD n'a pas encore le dessin isométrique d'AutoCAD, sa résolution isométrique et ses isocercles, si bien que les arêtes sont des lignes tapées en coordonnées polaires, une longueur et un angle.

## Steps

### Dessinez la face avant de la marche [#front]

Sur le calque Contour, <Command id="LINE" /> depuis `0,0`, le coin avant inférieur : `60<30`, `20<90`, `60<210`, puis <Keyword command="LINE" id="Close" />.

### Dessinez le côté [#side]

De nouveau depuis `0,0`, le côté gauche : `40<150`, `40<90`, `20<330`, `20<270` et `20<330`. Entrée termine la ligne sur l'arête avant de la marche.

### Dessinez le dessus [#top]

Le reste part de coins déjà dessinés : tapez `_END`, l'accrochage aux objets Extrémité pour un seul point, et désignez le coin. Depuis le coin supérieur droit de la face avant : `20<150`, `20<90`, `20<150` et `60<210`. Puis deux lignes de `60<210`, depuis le pied de la contremarche et depuis son sommet.

### Cotez-le [#dimensions]

Sur le calque Cotes, <Command id="DIMALIGNED" /> le long des arêtes, chaque cote placée à côté de la sienne : 60 et 40 en bas, 40 en montant à gauche, 20 en montant à droite.
