---
title: "Commande CONE dans AutoCAD"
description: "Comment CONE d'AutoCAD en français dessine un cône ou un tronc de cône : base, rayon, hauteur, rayon supérieur, Elliptique. Essayez-le gratuitement en ligne."
figure: "Un cône de rayon 20 et de hauteur 40, à partir du centre de sa base, vu du sud-est dans le style visuel Masqué."
sourceHash: "1c40f02e6b3c"
---

CONE dessine un cône, un solide 3D : donnez le centre de sa base, puis le rayon, puis la hauteur, et le cône se rétrécit jusqu'à une pointe. La commande demande ce que demande <Command id="CYLINDER" />, avec <Keyword id="Top" /> à la hauteur pour un cône tronqué. La base se trouve dans le plan XY du SCU, à la Z du centre, et la hauteur monte selon son axe Z ; une hauteur négative le fait pointer vers le bas, et un point la donne par sa distance à la base. Le rayon et la hauteur sont proposés comme valeurs par défaut qu'Entrée accepte, partagées avec les autres primitives. Le cône est créé sur le calque courant, et Annuler le supprime en une seule étape.

<Command id="LIST" /> affiche sa position, sa normale, le rayon de la base, le rayon supérieur et la hauteur, et la palette Propriétés permet de les taper. Ses poignées le déplacent, règlent sa hauteur, le rayon de sa base à chaque quart de la base, et son rayon supérieur. L'accrochage Extrémité trouve son sommet. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui se limite aux solides et reste partielle.

## Options

### 3P

Au centre de la base : demande trois points, et la base est le cercle qui passe par eux, dans leur plan.

### 2P

Au centre de la base : demande les deux extrémités du diamètre de la base.

### Ttr

Au centre de la base : désignez deux lignes, cercles ou arcs, avec l'accrochage Tangente, et donnez un rayon : la base touche les deux.

### Elliptical

Au centre de la base : la base est une ellipse, donnée par les deux extrémités de son premier axe et l'extrémité du second, ou avec <Keyword id="Center" /> à partir de son centre. Un rayon supérieur réduit la même ellipse.

### Diameter

Au rayon : demande plutôt le diamètre, en proposant le double du dernier rayon.

### 2Point

À la hauteur : demande deux points, et la hauteur est la distance qui les sépare.

### Axis

À la hauteur : demande le sommet. Le cône va du centre de la base à ce point, dans n'importe quelle direction, sa base perpendiculaire à l'axe.

### Top

À la hauteur : demande le rayon supérieur, puis de nouveau la hauteur. Le cône se termine par un cercle au lieu d'une pointe, un tronc de cône ; un haut aussi large que la base donne les flancs d'un cylindre, un haut plus large un cône qui s'évase vers le haut. La commande propose le rayon supérieur du dernier cône, 0 au départ.

## Missing

<Command id="EXPLODE" /> d'un cône, qu'AutoCAD transforme en sa base et une surface : MellowCAD n'a pas de surfaces, il indique donc qu'il n'a pas pu le décomposer. Transformer un cône rond en cône elliptique en tapant dans la palette Propriétés. Avec `ISOLINES` à 0, le point qu'AutoCAD dessine au sommet. Et ce qui manque à <Command id="CYLINDER" /> : Déplacer, Rotation, Echelle et Miroir depuis une poignée active, les cotes en pointillés pendant que vous donnez le rayon, et les styles visuels qui manquent à <Command id="VSCURRENT" />.

## Questions

### Comment dessiner un cône dans AutoCAD ?

Lancez CONE, donnez le centre de la base, le rayon et la hauteur : `0,0`, `20` et `40` dessinent le cône de la session. Tournez la vue pour le voir, avec un coin du ViewCube ou avec <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />.

### Comment dessiner un tronc de cône ?

À la hauteur, choisissez <Keyword id="Top" />, tapez le rayon supérieur, puis la hauteur. Le cône se termine par un cercle de ce rayon.

### Comment dessiner un cône à l'envers ?

Tapez une hauteur négative : le cône pointe vers le bas depuis sa base. Ou choisissez <Keyword id="Axis" /> et placez le sommet où vous voulez.

### La base d'un cône peut-elle être une ellipse ?

Oui : choisissez <Keyword id="Elliptical" /> au centre de la base et donnez ses axes. Un rayon supérieur fait du haut la même ellipse, plus petite.
