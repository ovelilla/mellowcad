---
title: "Commande DIST dans AutoCAD"
description: "Mesurer une distance avec DIST (DI) d'AutoCAD en français : deux points, angles et deltas X, Y, Z, ou une suite de points. Essayez-le gratuitement en ligne."
figure: "DIST le long de la diagonale d'une plaque de 100 par 60 : la distance, l'angle dans le plan XY et les deltas."
sourceHash: "31fbe420bc43"
---

DIST mesure la distance entre deux points. Cliquez ou tapez le premier point, puis le second, avec l'accrochage aux objets si besoin : elle écrit sur la ligne de commande la distance, l'angle dans le plan XY et l'angle avec ce plan, et les deltas X, Y et Z, puis se termine. Chaque point est mesuré là où il est, Z compris : la distance est donc la vraie distance dans l'espace. Entrée au premier point part du dernier point donné, et au second mesure jusqu'au premier. Les nombres suivent la précision du dessin, et les angles AUPREC.

## Options

### Multiple

<Keyword id="Multiple" />, à la deuxième invite : une suite de points au lieu d'un seul segment, la distance cumulée écrite avant chaque point suivant et affichée au-dessus du curseur, jusqu'à Entrée ou <Keyword id="Total" />.

### Arc

Mesure le long d'arcs, avec les options d'arc de <Command id="PLINE" /> : <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. La longueur de chaque arc s'ajoute à la suite.

### Close

Revient au premier point, ajoute ce dernier segment, écrit le total et se termine.

### Length

Ajoute un segment de la longueur que vous tapez, dans la direction du dernier.

### Undo

Annule le dernier point de la suite.

### Total

Écrit le total de la suite et se termine ; Entrée fait de même.

## Missing

MESURERGEOM (MEASUREGEOM), les outils Mesurer du ruban, qui posent les invites de DIST dans une boucle avec Rayon, Angle, Aire, Volume et Rapide : ici, le bouton Distance du ruban lance DIST. Au <Keyword id="Center" /> de l'option Arc, l'angle décrit se lit en degrés, là où AutoCAD 2027 y lit un nombre comme une distance dans la direction du curseur.

## Questions

### Quelle est la commande pour mesurer une distance dans AutoCAD ?

DIST, avec le raccourci `DI`, puis Entrée ou la barre d'espace. Elle porte le même nom dans AutoCAD en français et en anglais, et `_DIST` fonctionne dans toutes les langues d'AutoCAD.

### Comment mesurer une distance dans AutoCAD ?

Tapez `DI`, puis cliquez les deux points, avec l'accrochage aux objets pour tomber sur les extrémités ou les centres des objets. La distance s'écrit sur la ligne de commande avec l'angle et les deltas.

### Comment mesurer la longueur totale de plusieurs segments ?

Au deuxième point, choisissez <Keyword id="Multiple" /> et continuez à cliquer : la distance cumulée s'affiche à chaque point, et Entrée écrit le total.

### Comment mesurer une distance en 3D ?

Donnez les points avec leur Z, ou prenez-les sur des objets à leur hauteur avec l'accrochage aux objets : DIST mesure la vraie distance dans l'espace et écrit l'angle avec le plan XY et le delta Z.

### Pourquoi DIST n'affiche pas assez de décimales ?

Elle écrit les longueurs à la précision du dessin, deux décimales dans un nouveau dessin ici. Augmentez-la dans <Command id="UNITS" />, jusqu'à huit.
