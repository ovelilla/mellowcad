---
title: "Commande LISTE (LIST) dans AutoCAD"
description: "Comment fonctionne LISTE (LIST, alias LS) d'AutoCAD en français : sélectionnez des objets, lisez type, calque, couleur, points, longueur et aire. Essayez-le."
figure: "LISTE du trou d'une plaque : le calque, le centre, le rayon, la circonférence et l'aire du cercle."
sourceHash: "d0ebcf466ff5"
---

LISTE (LIST) écrit sur la ligne de commande un rapport sur chaque objet que vous sélectionnez, avec les colonnes et les mots d'AutoCAD 2027. Chacun commence par son type, son calque et son espace, puis sa couleur, son type de ligne, son épaisseur de ligne et son épaisseur quand elles ne sont pas DuCalque ou nulles, puis ce qui est propre au type : les extrémités, la longueur, l'angle et les deltas d'une ligne ; le centre, le rayon, la circonférence et l'aire d'un cercle ; les angles et la longueur d'un arc ; les sommets, les largeurs, l'aire et la longueur d'une polyligne ; les points de contrôle et d'ajustement d'une spline ; le style, la hauteur et la justification d'un texte ; le type, les points et le style d'une cote ; le motif, l'échelle et l'aire de hachures ; le nom, le point d'insertion, les échelles et les attributs d'une référence de bloc ; les rangées et les éléments d'un réseau ; l'aire, le périmètre et la zone de contour d'une région.

Les points sont dans le SCU courant, les longueurs à la précision du dessin et les angles à AUPREC. Les objets sélectionnés avant LISTE sont listés aussitôt, sans l'invite, et Entrée sans rien de sélectionné la termine sans un mot. Toutes les lignes arrivent d'un coup : la fenêtre de texte d'AutoCAD s'arrête à `Appuyez sur ENTREE pour continuer:` à chaque écran plein, alors qu'ici l'historique défile. Il n'y a pas de ligne pour le maintien (handle) de l'objet : ici, les objets n'en ont pas.

## Missing

L'aire d'une polyligne ouverte lissée par <Keyword command="PEDIT" id="Fit" /> : ici, c'est l'aire de la courbe fermée par sa corde, et celle d'AutoCAD est plus grande. La longueur d'une spline est exacte ici, là où celle d'AutoCAD est une approximation proche. Une COTANG (DIMANGULAR) faite à partir de deux lignes est listée par ses trois points, et aucune cote n'est jamais listée comme associative. La pause et la fenêtre de texte d'AutoCAD. Ce que les objets n'ont pas ici : DuBloc, une épaisseur de ligne Par défaut, une échelle de type de ligne propre, la transparence et les groupes.

## Questions

### Comment s'appelle la commande LIST en français ?

LISTE, avec les alias `LS`, `LST` et `AFFMAT`, puis Entrée ou la barre d'espace ; dans AutoCAD en français, `LI` lance COTLIN (DIMLINEAR). Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_LIST`.

### Qu'affiche la commande LISTE ?

Tout ce que la LISTE d'AutoCAD dit de l'objet : son type, son calque, son espace et ses propriétés qui ne sont pas DuCalque, puis sa géométrie, chaque point et chaque longueur en chiffres. Sélectionnez plusieurs objets, et chacun a son rapport.

### Comment connaître la longueur ou l'aire d'un objet ?

Passez-le à LISTE : la longueur d'une ligne, la circonférence et l'aire d'un cercle, la longueur ou le périmètre et l'aire d'une polyligne. Pour additionner plusieurs aires, utilisez <Command id="AREA" />.

### Comment voir les coordonnées des extrémités d'une ligne ?

Passez la ligne à LISTE : elle écrit son point de départ et son point d'arrivée, dans le SCU courant. Pour un seul point, <Command id="ID" /> avec un accrochage aux objets.

### Quelle est la différence entre LISTE et PROPRIETES ?

LISTE écrit un rapport que vous lisez et copiez depuis l'historique. <Command id="PROPERTIES" /> affiche les mêmes valeurs dans une palette, où vous pouvez les modifier.
