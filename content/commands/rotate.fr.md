---
title: "Commande ROTATION (ROTATE) dans AutoCAD"
description: "Comment fonctionne ROTATION (ROTATE, alias RI) d'AutoCAD en français, invite par invite : point de base et angle, Copier et Référence. Essayez-le gratuitement."
figure: "Un rectangle pivoté de 30° autour de son coin avec Copier : l'original est conservé."
sourceHash: "0e5ae021e108"
---

ROTATION (ROTATE) fait pivoter les objets sélectionnés autour d'un point de base : sélectionnez-les, indiquez le point de base, puis l'angle, tapé ou donné par un point dont la direction depuis le point de base est l'angle. Sa première ligne dit quel sens est positif, le sens trigonométrique par défaut (ANGDIR), et où se trouve le 0 (ANGBASE). Entrée à l'invite de l'angle répète la dernière rotation, 0 dans un nouveau dessin. Les objets pivotent autour d'un axe parallèle au Z du SCU passant par le point de base : en 3D, ils gardent donc leur hauteur. La rotation est une seule étape, qu'Annuler défait.

## Options

### Copy

Fait pivoter une copie et laisse les objets où ils étaient, en disant <Message id="rotatingCopy" />. L'invite redemande ensuite l'angle.

### Reference

Fait pivoter d'un angle que vous avez vers celui que vous voulez : demande l'angle de référence (tapé, ou deux points qui le mesurent), puis le nouvel angle, et fait pivoter de la différence. Pour mettre à l'horizontale une arête inclinée, désignez ses deux extrémités comme référence et tapez 0.

### Points

À l'invite du nouvel angle de Référence : le nouvel angle est celui d'une ligne entre deux points que vous désignez, si bien que les objets s'alignent sur une arête déjà dessinée.

## Missing

Pendant que vous indiquez l'angle, le jeu pivoté suit le curseur dans la couleur de chaque objet, mais pas dans son type de ligne ni son épaisseur de ligne.

## Questions

### Comment s'appelle la commande ROTATE en français ?

ROTATION, avec l'alias `RI` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_ROTATE`.

### Comment faire pivoter un objet pour l'aligner sur un autre ?

Choisissez <Keyword id="Reference" />, désignez deux points le long de l'arête de l'objet, puis choisissez <Keyword id="Points" /> et désignez deux points le long de la ligne qu'il doit suivre.

### Comment faire pivoter un objet en gardant l'original ?

Choisissez <Keyword id="Copy" /> avant d'indiquer l'angle : la copie pivote et l'original reste en place.

### Pourquoi ROTATION tourne dans le mauvais sens ?

Un angle positif tourne dans le sens trigonométrique, inverse des aiguilles d'une montre, comme le dit ANGDIR sur la première ligne. Tapez un angle négatif, `-30`, pour tourner dans le sens horaire.
