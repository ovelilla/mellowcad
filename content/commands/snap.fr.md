---
title: "Commande RESOL (SNAP) dans AutoCAD"
description: "Comment fonctionne RESOL (SNAP, alias RL, F9) d'AutoCAD : le curseur retenu sur une grille à l'espacement choisi, Aspect pour X et Y, et l'accrochage polaire."
figure: "RESOL 10 avec la grille affichée, puis LIGNE désignée hors de la grille d'accrochage : chaque point y tombe, et le curseur aussi."
sourceHash: "a1089484f2f1"
---

Le mode Résolution retient le curseur sur une grille d'accrochage : chaque point désigné tombe sur le plus proche de ses points, si bien qu'avec un espacement de 10, un clic en 13,7 donne 10,10. Cette grille est celle du SCU courant, depuis son origine le long de ses axes. F9 active et désactive le mode Résolution en écrivant `<Résolution activée>` ou `<Résolution désactivée>`, de même que son bouton dans la barre d'état. Seuls les points désignés sont arrondis : une coordonnée tapée est prise telle quelle, et un accrochage aux objets l'emporte sur la grille d'accrochage. La grille (F7) dessine son propre quadrillage, et l'affiche que le mode Résolution soit actif ou non.

La commande RESOL (SNAP) fixe l'espacement : tapez-le, ou indiquez deux points séparés de cette distance, et le mode Résolution s'active avec cet espacement en X et en Y. Entrée l'active tel quel. Un espacement de 0 ou moins est refusé avec <Message id="positiveNonzero" />. Tapée avec une apostrophe, `'RESOL`, elle fonctionne à l'intérieur d'une autre commande. Le mode Résolution et son espacement sont enregistrés avec le dessin, et U défait un RESOL.

Le menu du mode Résolution, dans la barre d'état, choisit à la place l'accrochage polaire : le long d'un chemin de repérage polaire, le curseur avance par pas de POLARDIST ou, tant que POLARDIST vaut 0, de l'espacement X de l'accrochage.

## Options

### ON

Active le mode Résolution avec l'espacement courant, comme Entrée.

### OFF

Désactive le mode Résolution ; l'espacement est conservé.

### Aspect

Demande un espacement horizontal, puis un vertical, et active le mode Résolution : une grille d'accrochage plus haute ou plus large que carrée. L'option par défaut de l'invite devient alors Aspect, si bien qu'Entrée les redemande.

## Missing

Style, l'accrochage isométrique, et Type, grille ou polaire, à l'invite : c'est le menu de la barre d'état qui choisit le type. Hérité, l'option cachée Rotation (SNAPANG) et SNAPBASE. Une valeur négative de POLARDIST, dont l'accrochage polaire d'AutoCAD prend la valeur absolue : −10 avance de 10.

## Questions

### Quel est le raccourci du mode Résolution (SNAP) ?

F9 active et désactive le mode Résolution. La commande est `RL`, puis Entrée ou la barre d'espace, pour fixer l'espacement ; le nom complet RESOL fonctionne aussi, et `_SNAP` quelle que soit la langue d'AutoCAD.

### Quelle est la différence entre RESOL et l'accrochage aux objets ?

Le mode Résolution arrondit le curseur à une grille de points dans l'espace. L'accrochage aux objets (F3) le fixe sur des points des objets : extrémités, milieux, centres. Les deux fonctionnent ensemble, et l'accrochage aux objets l'emporte là où tous deux trouvent un point.

### Pourquoi mon curseur avance-t-il par sauts ?

Le mode Résolution est actif : appuyez sur F9, ou sur son bouton dans la barre d'état, pour le désactiver. Fixez un espacement plus petit avec RESOL si vous voulez des pas plus fins.

### Comment définir des espacements X et Y différents ?

Lancez RESOL, choisissez <Keyword id="Aspect" />, et indiquez l'espacement horizontal, puis le vertical.

### Existe-t-il un accrochage isométrique ?

Pas encore : l'option Style de RESOL, qui tourne la grille d'accrochage pour le dessin isométrique, n'est pas proposée.
