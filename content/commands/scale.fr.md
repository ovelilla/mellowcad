---
title: "Commande ECHELLE (SCALE) dans AutoCAD"
description: "Comment ECHELLE (SCALE, alias EH) d'AutoCAD met des objets à l'échelle, invite par invite : point de base, facteur, Copier et Référence. Essayez-le en ligne."
figure: "Une plaque et son trou mis à l'échelle sur une copie par Référence, autour de son coin : l'arête de 40 désignée, puis portée à 60."
sourceHash: "005829bf17ad"
---

ECHELLE (SCALE) agrandit ou réduit les objets sélectionnés par rapport à un point de base, qui reste en place : un facteur de 2 les double, 0.5 les réduit de moitié, de la même façon dans toutes les directions. Sélectionnez les objets, désignez le point de base, puis tapez le facteur, ou déplacez le curseur et cliquez : les objets le suivent. Entrée à cette invite, sans rien taper, applique le dernier facteur utilisé. Chaque exécution est une seule étape, qu'Annuler défait.

La commande met à l'échelle tout ce qu'elle prend, comme AutoCAD : le motif des hachures grandit avec leur contour, une cote mesure sa nouvelle longueur, et un objet situé au-dessus du plan est aussi mis à l'échelle en Z par rapport au point de base.

## Options

### Copy

Met à l'échelle une copie et laisse les objets tels quels : la commande dit <Message id="scalingCopy" /> et redemande le facteur, <Keyword id="Copy" /> toujours proposé.

### Reference

Demande une longueur de référence, tapée ou désignée par deux points, puis la longueur qu'elle doit avoir : le facteur est la nouvelle longueur divisée par la référence. La nouvelle longueur est tapée, ou donnée par un point dont elle est la distance au point de base ; <Keyword id="Points" /> demande plutôt deux points et mesure entre eux. Les deux longueurs proposent les dernières données, 1 dans un nouveau dessin.

## Missing

Entrée au premier ou au second point de <Keyword id="Points" /> termine la commande sans mise à l'échelle, là où AutoCAD applique ce qu'indique alors le curseur. Un facteur minuscule est appliqué sans rien dire, là où AutoCAD dit qu'il l'ignore. Les objets entraînés sont dessinés comme <Command id="MOVE" /> les entraîne, dans leur seule couleur.

## Questions

### Comment s'appelle la commande SCALE en français ?

ECHELLE, avec l'alias `EH` : tapez-le, puis Entrée ou la barre d'espace (dans AutoCAD en français, `SC` est GESTSCU). `_SCALE` fonctionne quelle que soit la langue d'AutoCAD.

### Comment mettre à l'échelle avec une référence dans AutoCAD ?

Choisissez <Keyword id="Reference" /> à l'invite du facteur, désignez les deux extrémités d'une arête dont vous connaissez la longueur, puis tapez la longueur qu'elle doit avoir. Tout ce qui est sélectionné est mis à l'échelle du rapport entre la nouvelle longueur et l'ancienne : un dessin à la mauvaise taille se corrige à partir d'une seule cote connue.

### Comment mettre un objet à l'échelle en gardant l'original ?

Choisissez <Keyword id="Copy" /> à l'invite du facteur : la copie est mise à l'échelle, l'original reste où il était.

### Comment changer l'échelle des types de ligne ?

Pas avec ECHELLE, qui redimensionne les objets : <Command id="LTSCALE" /> fixe la longueur à laquelle sont dessinés les tirets et les espaces de tous les types de ligne.

### Comment mettre un plan à l'échelle pour l'impression ?

MellowCAD n'a ni présentations, ni fenêtres, ni traçage : vous dessinez en grandeur réelle dans l'espace objet, et ECHELLE change la taille des objets eux-mêmes, pas la façon dont ils seraient imprimés.
