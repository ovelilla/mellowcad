---
title: "Commande CHANFREIN (CHAMFER) dans AutoCAD"
description: "Comment fonctionne CHANFREIN (CHAMFER, alias CF) d'AutoCAD en français : deux écarts, deux lignes ou une polyligne, Multiple, Maj. Essayez-le gratuitement."
figure: "Quatre lignes, puis Distance 10 pour les deux écarts et Multiple : deux angles coupés, deux laissés vifs."
sourceHash: "e43c5b72ffc8"
---

CHANFREIN (CHAMFER en anglais) coupe l'angle formé par deux lignes avec un biseau droit. Désignez la première ligne, puis la deuxième : chacune est ajustée ou prolongée jusqu'au biseau, la première selon le premier écart et la deuxième selon le deuxième, et le biseau les relie. Elle fonctionne sur deux lignes, sur deux segments droits d'une polyligne, ou sur une ligne et une polyligne, qu'elle joint en une seule polyligne. Comme dans AutoCAD, sa première ligne indique les écarts courants, qui sont conservés dans le dessin ; deux écarts à 0, la valeur par défaut, font un angle vif, les lignes se rejoignant. Pendant que vous désignez la deuxième ligne, l'angle qu'elle formerait est affiché par-dessus les lignes.

## Options

### Undo

Annule le dernier chanfrein de cette exécution, et avec lui une modification des écarts.

### Polyline

Demande une polyligne 2D et chanfreine chacun de ses angles, puis indique combien de lignes ont été chanfreinées et pourquoi certaines ne l'ont pas été.

### Distance

Demande le premier et le deuxième écart du chanfrein. Le deuxième propose le premier, si bien qu'Entrée à cette invite rend le biseau régulier, à 45 degrés sur un angle droit.

### Multiple

Redemande une première ligne après chaque chanfrein, jusqu'à Entrée ou Echap.

## Missing

Angle, qui définit le biseau par un écart et un angle, Méthode et Ajuster : CHANFREIN travaille toujours avec deux écarts et ajuste toujours les lignes. Dans AutoCAD, le biseau prend l'échelle du type de ligne de la deuxième ligne ; ici, non.

## Questions

### Comment s'appelle la commande CHAMFER en français ?

CHANFREIN, raccourci `CF`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_CHAMFER`.

### Comment faire un chanfrein à 45 degrés dans AutoCAD ?

Choisissez <Keyword id="Distance" />, tapez l'écart et appuyez sur Entrée au deuxième : sur un angle droit, deux écarts égaux font un biseau à 45 degrés.

### Quelle est la différence entre CHANFREIN et RACCORD ?

CHANFREIN relie deux lignes par un biseau droit ; <Command id="FILLET" />, par un arc tangent aux deux. Les deux ajustent ou prolongent les lignes jusqu'à lui, et les deux font un angle vif avec 0 ou en maintenant Maj enfoncée sur la deuxième ligne.

### Pourquoi la commande chanfrein ne fonctionne pas ?

Elle dit pourquoi : <Message id="chamferDistanceTooLarge" /> quand un écart dépasse l'extrémité de sa ligne, <Message id="linesParallel" /> pour des lignes parallèles, et <Message id="chamferRequiresLines" /> pour un arc ou un cercle. Avec les deux écarts à 0, elle fait un angle, et non un biseau.

### Comment chanfreiner tous les angles d'un rectangle ?

Un rectangle est une polyligne : choisissez <Keyword id="Polyline" /> et désignez-le, et chaque angle est chanfreiné avec les écarts courants.
