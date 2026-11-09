---
title: "Commande BISEAU (WEDGE) dans AutoCAD"
description: "Comment BISEAU (WEDGE, alias BI) d'AutoCAD dessine un biseau 3D, invite par invite : deux coins et une hauteur, Centre, Cube, Longueur et 2Point. Essayez-le."
figure: "Un biseau de 60 sur 40 sur 25, donné par deux coins et une hauteur, sa pente descendant depuis le côté du premier coin, vu du sud-est dans le style visuel Masqué."
sourceHash: "06fba2eeb7be"
---

BISEAU (WEDGE) dessine un biseau, un solide 3D : une boîte dont le dessus descend en pente d'une extrémité à l'autre. La commande demande ce que demande <Command id="BOX" /> : le premier coin, l'autre coin, puis la hauteur. Le côté haut est au premier coin, et la pente descend le long de l'axe X du SCU vers le côté de l'autre coin ; un coin à un X plus petit la retourne. La hauteur monte le long de l'axe Z du SCU, une hauteur négative descend. La longueur, la largeur et la hauteur sont les valeurs par défaut de <Command id="BOX" />, qu'Entrée accepte. Le biseau est créé sur le calque courant, et Annuler le retire en une seule étape.

<Command id="LIST" /> affiche sa position, sa longueur, sa largeur, sa hauteur et sa rotation, et la palette Propriétés permet de les taper. Ses poignées sont celles de <Command id="BOX" />. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui ne connaît que les solides et reste partielle ; <Command id="EXPLODE" /> le transforme en une région par face.

## Options

### Center

À la première invite : demande le centre, puis un coin, <Keyword id="Cube" /> ou <Keyword id="Length" />. Le biseau est centré sur le point, en hauteur aussi, son côté haut à l'opposé du coin donné.

### Cube

À l'invite de l'autre coin : demande une longueur et crée un biseau dont tous les côtés ont cette longueur. Contrairement à celui de <Command id="BOX" />, il s'étend le long de l'axe X du SCU, vers l'arrière quand la longueur est négative.

### Length

À l'invite de l'autre coin : demande la longueur, le long de l'axe X du SCU, puis la largeur, le long de son Y ; une valeur négative va vers l'arrière. Un point ne donne que sa distance, jamais sa direction.

### 2Point

À l'invite de la hauteur : demande deux points, et la hauteur est la distance qui les sépare.

## Missing

Ce qui manque à <Command id="BOX" /> : Déplacer, Rotation, Echelle et Miroir depuis une poignée sélectionnée, les commandes 3D qui lui sont propres, les cotes en pointillé pendant que vous indiquez le coin, et les styles visuels qui manquent à <Command id="VSCURRENT" />. En vue en plan, l'accrochage Extrémité sous le côté haut trouve le coin du dessus, là où AutoCAD trouve celui de la base.

## Questions

### Comment s'appelle la commande WEDGE en français ?

BISEAU, avec l'alias `BI` : tapez-le, puis Entrée ou la barre d'espace, et indiquez le premier coin, l'autre coin et la hauteur : `0,0`, `60,40` et `25` dessinent le biseau de la figure. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_WEDGE`.

### Dans quel sens le biseau est-il incliné ?

Il descend depuis le côté du premier coin, le long de l'axe X du SCU. Pour le retourner, indiquez l'autre coin à un X plus petit, ce qui le fait pivoter de 180°, ou faites-le pivoter ensuite avec <Command id="ROTATE" />.

### Comment dessiner un prisme triangulaire ?

Un biseau en est un : un triangle rectangle à chaque bout, étiré sur la largeur. Pour tout autre triangle, dessinez-le fermé avec <Command id="PLINE" /> et extrudez-le avec <Command id="EXTRUDE" />.

### Comment dessiner un biseau à partir de son centre ?

Choisissez <Keyword id="Center" /> et indiquez le centre, puis un coin, <Keyword id="Cube" /> ou <Keyword id="Length" /> : le biseau est centré sur le point, en hauteur aussi.
