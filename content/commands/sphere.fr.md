---
title: "Commande SPHERE dans AutoCAD"
description: "Comment SPHERE d'AutoCAD dessine une sphère 3D, invite par invite : centre et rayon, Diamètre, 3P, 2P et Ttr, et pourquoi elle s'affiche en lignes. Essayez-le."
figure: "Une sphère de rayon 25 donnée par son centre, vue du sud-est dans le style visuel Conceptuel."
sourceHash: "a35a57352d16"
---

SPHERE dessine une sphère, un solide 3D : indiquez le centre, puis le rayon. Un rayon désigné à la souris est lu dans le plan qui passe par le centre, et le dernier rayon est proposé comme valeur par défaut, qu'Entrée accepte, commune à <Command id="CYLINDER" />, <Command id="CONE" /> et aux autres primitives. La sphère est créée sur le calque courant, et Annuler la retire en une seule étape.

En Filaire 2D et en Masqué, elle est dessinée en lignes : des méridiens et des parallèles, autant que l'indique `ISOLINES`, et l'accrochage aux objets n'y trouve rien d'autre que son centre. <Command id="LIST" /> affiche sa position et son rayon, et la palette Propriétés permet de taper le rayon ou le diamètre. Ses poignées la déplacent et, à chaque quart de son équateur, fixent son rayon. C'est un solide 3D pour <Command id="UNION" />, <Command id="SUBTRACT" /> et le reste de la 3D de MellowCAD, qui ne connaît que les solides et reste partielle.

## Options

### 3P

À l'invite du centre : demande trois points, et la sphère est centrée sur le cercle qui passe par eux, avec son rayon.

### 2P

À l'invite du centre : demande les deux extrémités d'un diamètre, n'importe où dans l'espace.

### Ttr

À l'invite du centre : sélectionnez deux lignes, cercles ou arcs, avec l'accrochage Tangente, et indiquez un rayon : le centre se trouve sur le cercle de ce rayon qui les touche tous les deux, à leur hauteur.

### Diameter

À l'invite du rayon : demande plutôt le diamètre, en proposant le double du dernier rayon.

## Missing

<Command id="EXPLODE" /> d'une sphère, qu'AutoCAD transforme en surface : MellowCAD n'a pas de surfaces, et dit donc qu'il n'a pas pu la décomposer. Déplacer, Rotation, Echelle et Miroir depuis une poignée sélectionnée, et les commandes 3D qui lui sont propres (DEPLACER3D, ROTATION3D, ECHELLE3D). La silhouette que dessine `DISPSILH` dans AutoCAD. Les styles visuels qui manquent à <Command id="VSCURRENT" /> au-delà de Filaire 2D, Masqué et Conceptuel.

## Questions

### Comment faire une sphère dans AutoCAD ?

Lancez SPHERE, indiquez le centre, puis le rayon : `0,0,0` et `25` dessinent la sphère de la figure. Faites pivoter la vue pour la voir ronde, avec un coin du ViewCube ou avec <Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />.

### Pourquoi ma sphère ressemble-t-elle à un cercle avec des lignes ?

Filaire 2D et Masqué dessinent une sphère par ses méridiens et ses parallèles ; vus de dessus, ce sont un cercle et des lignes qui le traversent. <Command id="VSCURRENT" /> avec <Keyword command="VSCURRENT" id="Conceptual" /> l'ombre, et `ISOLINES` fixe le nombre de lignes qu'elle montre.

### Comment faire une demi-sphère ?

Dessinez la sphère, puis coupez-la par son centre avec <Command id="SLICE" /> : trois points du plan, ou <Keyword command="SLICE" id="XY" /> et le centre, puis le côté à garder.

### Comment dessiner une sphère par son diamètre ?

À l'invite du rayon, choisissez <Keyword id="Diameter" /> et tapez le diamètre. Avec <Keyword id="2P" />, les deux extrémités d'un diamètre la placent aussi.
