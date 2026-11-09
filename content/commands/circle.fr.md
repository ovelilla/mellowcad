---
title: "Commande CERCLE (CIRCLE) dans AutoCAD"
description: "Comment fonctionne CERCLE (CIRCLE, alias C) d'AutoCAD en français, invite par invite : centre et rayon ou Diamètre, 2P, 3P et Ttr. Essayez-le gratuitement."
figure: "Trois cercles : centre et rayon, deux extrémités d'un diamètre (2P), centre et Diamètre."
sourceHash: "62e25bc029f9"
---

CERCLE (CIRCLE en anglais) dessine un cercle à partir de son centre et de son rayon, tapé ou donné par un point du cercle, ou de l'une des autres manières que propose sa première invite. Entrée au rayon reprend la taille du dernier cercle, conservée pour le dessin. Pendant que vous donnez le rayon, une ligne en pointillés ambre va du centre au curseur, et dépasse le bord quand vous donnez le diamètre, comme AutoCAD la dessine. Le cercle se trouve dans le plan de son premier point, à l'élévation courante si le point n'a pas de Z propre.

## Options

### 3P

Par trois points. Tapée avec des accrochages Tangente, `_TAN` à chacun, c'est le Tan, tan, tan d'AutoCAD : le cercle qui touche trois objets.

### 2P

Par les deux extrémités d'un diamètre.

### Ttr

Tangent à deux objets, avec un rayon : désignez chaque ligne, cercle ou arc près de l'endroit où le cercle doit le toucher, puis donnez le rayon. Parmi les cercles possibles, elle dessine celui qui touche au plus près de vos désignations ; quand aucun ne convient, elle affiche <Message id="circleDoesNotExist" />.

### Diameter

À l'invite du rayon : donnez plutôt le diamètre, tapé ou par un point.

## Missing

Ttr sur un segment de polyligne, qu'AutoCAD accepte et que MellowCAD refuse ; l'entrée Tan, tan, tan de la palette d'outils (la taper, 3P avec trois accrochages Tangente, fonctionne) ; les Propriétés rapides au double-clic sur un cercle.

## Questions

### Comment s'appelle la commande CIRCLE en français ?

CERCLE, raccourci `C`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_CIRCLE`.

### Comment dessiner un cercle tangent à deux lignes ?

Choisissez <Keyword id="Ttr" />, désignez la première ligne, puis la deuxième, près de l'endroit où le cercle doit les toucher, et tapez le rayon.

### Comment dessiner un cercle tangent à trois objets ?

Choisissez <Keyword id="3P" /> et tapez `_TAN` avant chacun des trois points, en désignant chaque objet près de l'endroit où le cercle doit le toucher.

### Comment dessiner un cercle par son diamètre ?

Donnez le centre, puis choisissez <Keyword id="Diameter" /> et tapez-le. Ou choisissez <Keyword id="2P" /> et donnez les deux extrémités du diamètre.
