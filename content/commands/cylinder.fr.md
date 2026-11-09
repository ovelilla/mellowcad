---
title: "Commande CYLINDRE (CYLINDER) dans AutoCAD"
description: "CYLINDRE (CYLINDER, alias CYL) d'AutoCAD en français dessine un cylindre 3D : base, rayon, hauteur, 3P, 2P, Ttr, Elliptique et extrémité d'axe. Essayez-le."
figure: "Un cylindre de rayon 20 et de hauteur 40, à partir du centre de sa base, vu du sud-est dans le style visuel Masqué."
sourceHash: "ce397d8dcb5d"
---

CYLINDRE (CYLINDER en anglais) dessine un cylindre, un solide 3D : donnez le centre de sa base, puis le rayon, puis la hauteur. La base se trouve dans le plan XY du SCU, à la Z du centre, et la hauteur monte selon son axe Z ; une hauteur négative descend, et un point la donne par sa distance à la base, comme pour <Command id="BOX" />. Le rayon et la hauteur sont proposés comme valeurs par défaut qu'Entrée accepte, partagées avec les autres primitives et <Command id="EXTRUDE" />. Le cylindre est créé sur le calque courant, et Annuler le supprime en une seule étape.

Le cylindre garde ses dimensions : <Command id="LIST" /> affiche sa position, sa normale, son rayon et sa hauteur, et la palette Propriétés permet de taper le rayon et la hauteur. Ses poignées le déplacent, règlent sa hauteur et, à chaque quart de la base, son rayon. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui se limite aux solides et reste partielle.

## Options

### 3P

Au centre de la base : demande trois points, et la base est le cercle qui passe par eux, dans leur plan. Avec trois points dans le plan XY du SCU, le cylindre monte toujours selon Z.

### 2P

Au centre de la base : demande les deux extrémités du diamètre de la base ; la seconde est lue dans le plan de la première.

### Ttr

Au centre de la base : désignez deux lignes, cercles ou arcs, avec l'accrochage Tangente, et donnez un rayon : la base touche les deux, au plus près des points désignés, à leur hauteur.

### Elliptical

Au centre de la base : la base est une ellipse. Donnez les deux extrémités de son premier axe, puis l'extrémité du second ; ou choisissez <Keyword id="Center" /> et donnez son centre, la demi-longueur du premier axe, puis l'extrémité du second axe.

### Diameter

Au rayon : demande plutôt le diamètre, en proposant le double du dernier rayon.

### 2Point

À la hauteur : demande deux points, et la hauteur est la distance qui les sépare.

### Axis

À la hauteur : demande l'autre extrémité de l'axe. Le cylindre va du centre de la base à ce point, dans n'importe quelle direction, sa base perpendiculaire à l'axe.

## Missing

<Command id="EXPLODE" /> d'un cylindre, qu'AutoCAD transforme en ses deux bases et une surface : MellowCAD n'a pas de surfaces, il indique donc qu'il n'a pas pu le décomposer. Déplacer, Rotation, Echelle et Miroir depuis une poignée active, et une hauteur tirée au-delà de la base. Les cotes en pointillés qu'AutoCAD dessine pendant que vous donnez le rayon, les points de l'ellipse et l'axe. Transformer un cylindre rond en cylindre elliptique en tapant dans la palette Propriétés. Les silhouettes que dessine `DISPSILH` dans AutoCAD. En plan, là où le cercle du haut cache celui de la base, l'accrochage Le plus proche trouve le cercle de la base, là où AutoCAD trouve celui du haut. Les styles visuels qui manquent à <Command id="VSCURRENT" /> au-delà de Filaire 2D, Masqué et Conceptuel.

## Questions

### Quel est le raccourci de CYLINDRE dans AutoCAD ?

`CYL`, le raccourci de CYLINDRE (CYLINDER en anglais). Tapez-le et appuyez sur Entrée ou sur la barre d'espace, puis donnez le centre de la base, le rayon et la hauteur : `0,0`, `20` et `40` dessinent le cylindre de la session.

### Comment dessiner un cylindre horizontal ?

Choisissez <Keyword id="Axis" /> à la hauteur et donnez l'autre extrémité de l'axe : à partir d'une base en `0,0,0`, le point `60,0,0` couche le cylindre selon X.

### Comment faire un cylindre creux ou un tube ?

Dessinez deux cylindres de même centre, celui de l'intérieur plus étroit, puis lancez <Command id="SUBTRACT" /> : désignez celui de l'extérieur, Entrée, celui de l'intérieur, Entrée.

### Pourquoi mon cylindre ressemble à un cercle ?

Vous le regardez de dessus, en plan. Tournez la vue : un coin du ViewCube, <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />, ou <Command id="3DORBIT" />.
