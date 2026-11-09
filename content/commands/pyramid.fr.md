---
title: "Commande PYRAMIDE (PYRAMID) dans AutoCAD"
description: "Comment PYRAMIDE (PYRAMID, alias PYR) d'AutoCAD dessine une pyramide 3D, invite par invite : côtés, hauteur, Arête, Inscrit et rayon supérieur. Essayez-le."
figure: "Une pyramide à six côtés, à 25 du centre de sa base au milieu de chaque côté et haute de 40, vue du sud-est dans le style visuel Masqué."
sourceHash: "acbc5ffa71cb"
---

PYRAMIDE (PYRAMID) dessine une pyramide, un solide 3D : sa première ligne dit combien de côtés a la base et comment son rayon est lu, puis la commande demande le centre de la base, le rayon et la hauteur. La base est un polygone régulier, tel que le dessine <Command id="POLYGON" />, de 4 côtés au départ : un rayon tapé l'oriente vers le curseur, un point vers lui-même. La hauteur monte le long de l'axe Z du SCU, une hauteur négative descend, et un point la donne par sa distance à la base. Le nombre de côtés et la façon de lire le rayon sont gardés pour la PYRAMIDE suivante ; le rayon et la hauteur sont les valeurs par défaut communes aux primitives. La pyramide est créée sur le calque courant, et Annuler la retire en une seule étape.

<Command id="LIST" /> affiche sa position, les deux rayons, inscrit et circonscrit, de la base et du dessus, sa hauteur, sa rotation et son nombre de côtés, et la palette Propriétés permet de taper les rayons, les côtés et la hauteur. Ses poignées la déplacent, fixent sa hauteur et dimensionnent la base depuis un sommet ou depuis le milieu d'un côté. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui ne connaît que les solides et reste partielle ; <Command id="EXPLODE" /> la transforme en une région par face.

## Options

### Edge

À l'invite du centre de la base : demande les deux extrémités d'un côté de la base, qui est dessinée à gauche de ce côté.

### Sides

À l'invite du centre de la base : demande le nombre de côtés, de 3 à 32, puis de nouveau le centre.

### Inscribed

À l'invite du rayon : lit le rayon jusqu'à un sommet de la base, le polygone inscrit dans ce cercle, et le redemande.

### Circumscribed

À l'invite du rayon, une fois <Keyword id="Inscribed" /> choisi : lit le rayon jusqu'au milieu d'un côté, le polygone circonscrit à ce cercle, comme au départ, et le redemande.

### 2Point

À l'invite de la hauteur : demande deux points, et la hauteur est la distance qui les sépare.

### Axis

À l'invite de la hauteur : demande l'extrémité de l'axe, le sommet de la pyramide. La pyramide va du centre de la base à ce point, dans n'importe quelle direction, sa base perpendiculaire à l'axe.

### Top

À l'invite de la hauteur : demande le rayon supérieur, lu comme celui de la base, puis de nouveau la hauteur. La pyramide se termine par un polygone plus petit au lieu d'une pointe, un tronc de pyramide ; un dessus aussi grand que la base donne un prisme.

## Missing

Ce qui manque à <Command id="BOX" /> : Déplacer, Rotation, Echelle et Miroir depuis une poignée sélectionnée, les commandes 3D qui lui sont propres, et les styles visuels qui manquent à <Command id="VSCURRENT" />. Son type, inscrit ou circonscrit, saisi dans la palette Propriétés. Les cotes en pointillé qu'AutoCAD dessine pendant que vous indiquez le rayon et une arête.

## Questions

### Quel est le raccourci de la commande PYRAMIDE ?

`PYR`. Tapez-le et appuyez sur Entrée ou sur la barre d'espace, puis indiquez le centre de la base, le rayon et la hauteur. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_PYRAMID`.

### Comment dessiner une pyramide hexagonale ?

Choisissez <Keyword id="Sides" /> avant le centre de la base et tapez `6`, puis indiquez le centre, le rayon et la hauteur : `0,0`, `25` et `40` dessinent la pyramide de la figure. La PYRAMIDE suivante garde les six côtés.

### Comment dessiner une pyramide à partir du côté de sa base ?

Choisissez <Keyword id="Edge" /> et indiquez les deux extrémités d'un côté : un côté de `0,0` à `50,0` donne une base carrée de 50, avec les 4 côtés par défaut.

### Comment dessiner un tronc de pyramide ?

À l'invite de la hauteur, choisissez <Keyword id="Top" />, tapez le rayon supérieur, puis la hauteur. La pyramide se termine par un polygone plus petit, qui a autant de côtés que la base.
