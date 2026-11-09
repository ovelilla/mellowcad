---
title: "Commande TORE (TORUS) dans AutoCAD"
description: "Comment TORE (TORUS, alias TOR) d'AutoCAD dessine un anneau 3D, invite par invite : centre, rayon du tore, rayon du tube, Diamètre, 3P, 2P et Ttr. Essayez-le."
figure: "Un tore de rayon 30 autour d'un tube de rayon 8, vu du sud-est dans le style visuel Conceptuel."
sourceHash: "a19600f3e357"
---

TORE (TORUS) dessine un anneau, un solide 3D en forme de beignet : indiquez le centre, puis le rayon du tore, du centre au milieu du tube, puis le rayon du tube. L'anneau se trouve dans le plan XY du SCU, au Z du centre. Un point à l'invite du tube est mesuré depuis le point de l'anneau, celui où le rayon a été donné. Le rayon du tore est la valeur par défaut commune aux primitives, et le rayon du tube a sa propre valeur par défaut, qu'Entrée accepte. Le tore est créé sur le calque courant, et Annuler le retire en une seule étape.

Un rayon de tore négatif avec un tube plus large donne une forme de ballon de rugby, aux extrémités pointues ; un anneau plus étroit que son tube, une pomme. En Filaire 2D et en Masqué, il est dessiné par des lignes autour du tube et autour de l'anneau, autant que l'indique `ISOLINES`. <Command id="LIST" /> affiche sa position, sa normale, le rayon du tore et le rayon du tube, et la palette Propriétés permet de taper les deux. Ses poignées le déplacent, fixent le rayon de l'anneau et celui du tube. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui ne connaît que les solides et reste partielle.

## Options

### 3P

À l'invite du centre : demande trois points, et l'anneau est le cercle qui passe par eux, dans leur plan.

### 2P

À l'invite du centre : demande les deux extrémités du diamètre de l'anneau.

### Ttr

À l'invite du centre : sélectionnez deux lignes, cercles ou arcs, avec l'accrochage Tangente, et indiquez un rayon : l'anneau touche les deux, à leur hauteur.

### Diameter

À l'invite du rayon du tore : demande plutôt le diamètre du tore. À celle du tube : demande le diamètre du tube. Chacune propose le double de sa valeur par défaut.

### 2Point

À l'invite du rayon du tube : demande deux points, et le rayon du tube est la distance qui les sépare.

## Missing

<Command id="EXPLODE" /> d'un tore, qu'AutoCAD transforme en surface : MellowCAD n'a pas de surfaces, et dit donc qu'il n'a pas pu le décomposer. Déplacer, Rotation, Echelle et Miroir depuis une poignée sélectionnée, et la silhouette que dessine `DISPSILH` dans AutoCAD.

## Questions

### Comment s'appelle la commande TORUS en français ?

TORE, avec l'alias `TOR` : tapez-le, puis Entrée ou la barre d'espace, et indiquez le centre, le rayon du tore et celui du tube : `0,0,0`, `30` et `8` dessinent le tore de la figure. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_TORUS`.

### Quelle est la différence entre le rayon et le rayon du tube ?

Le rayon va du centre du tore au milieu du tube ; le rayon du tube est celui du tube lui-même. Un tore de 76 de diamètre extérieur avec un tube de 16 d'épaisseur a un rayon de 30 et un rayon de tube de 8.

### Comment dessiner un tore en forme de ballon de rugby ?

Indiquez un rayon négatif, puis un rayon de tube plus grand que sa valeur absolue : `-5` et `8` donnent une forme fermée, pointue aux deux bouts. Un rayon de tube qui ne la dépasse pas est refusé, et redemandé.

### Pourquoi mon tore ressemble-t-il à deux cercles ?

Vous le regardez d'en haut, en vue de dessus. Faites pivoter la vue : un coin du ViewCube, <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />. <Command id="VSCURRENT" /> avec <Keyword command="VSCURRENT" id="Conceptual" /> l'ombre.
