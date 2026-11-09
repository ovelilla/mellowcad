---
title: "Commande INSERER (INSERT) dans AutoCAD"
description: "Insérer un bloc avec INSERER (INSERT, alias I) d'AutoCAD en français : la palette Blocs, ou -INSERER avec échelle, rotation et attributs. Essayez-le en ligne."
figure: "Une chaise transformée en bloc, puis insérée deux fois à une table : tournée de 180 après son point, puis de 90 par Rotation avant lui."
sourceHash: "e9859c7871f3"
---

INSERER (INSERT) place un bloc défini dans le dessin sous forme de référence : une copie de plus, avec son propre point, sa propre échelle et sa propre rotation, dessinée à partir de l'unique définition qu'a créée <Command id="BLOCK" />. Comme dans AutoCAD 2027, elle ouvre la palette Blocs, qui montre les blocs du dessin ; cliquez sur l'un d'eux et la ligne de commande demande son point d'insertion, le bloc entraîné sous le curseur, puis son échelle et sa rotation. La palette reste ouverte : un bloc après l'autre, c'est un clic sur chacun.

<Command id="-INSERT" /> demande tout sur la ligne de commande : le nom du bloc (Entrée prend celui qui est proposé : le dernier bloc inséré, ou à défaut le dernier défini), le point d'insertion, puis le facteur d'échelle X, le facteur d'échelle Y (Entrée reprend celui de X) et l'angle de rotation. Un facteur négatif fait une symétrie du bloc, et des facteurs inégaux l'étirent : un cercle qu'il contient est dessiné comme une ellipse. Un bloc avec attributs demande ensuite chaque valeur par son invite, en proposant sa valeur par défaut. Les objets du bloc sur le calque 0 prennent le calque de la référence, les autres gardent le leur. Chaque insertion est une étape qu'Annuler reprend.

## Options

### ?

Au nom du bloc : liste les blocs du dessin, comme le fait <Command id="BLOCK" />, et se termine.

### Scale

Au point d'insertion : demande un seul facteur pour les deux axes, puis redemande le point, le bloc entraîné à cette taille. Après le point, les facteurs X et Y ne sont pas demandés.

### Rotate

Au point d'insertion : demande l'angle, tapé ou donné par deux points, puis redemande le point, le bloc entraîné déjà tourné. Après le point, la rotation n'est pas demandée.

## Missing

Insérer un autre fichier de dessin : seuls les blocs définis dans le dessin peuvent être insérés, et un nom qu'il ne contient pas est refusé. Au point d'insertion, Pointdebase, X, Y, Z, Décomposer et Répéter ; à l'échelle X, Coin et XYZ, et un point cliqué pour le coin opposé. Avec des facteurs X et Y inégaux, un texte ou un attribut est dessiné à la taille de X au lieu d'être étiré, et l'arc d'une polyligne reste un arc ; un X négatif n'écrit pas un texte à l'envers. ATTDIA 1, la boîte de dialogue Editer les attributs à l'insertion, et ATTREQ 0. Les propriétés Annotatif, Unité du bloc et Facteur d'unité de la palette Propriétés. DuBloc : un objet dans un bloc ne peut pas prendre la couleur, le type de ligne ou l'épaisseur de ligne propres de la référence, comme le fait dans AutoCAD un objet dessiné DuBloc.

## Questions

### Comment s'appelle la commande INSERT en français ?

INSERER, avec l'alias `I`, puis Entrée ou la barre d'espace : elle ouvre la palette Blocs, comme dans AutoCAD 2027. `-I` est <Command id="-INSERT" />, qui pose ses questions sur la ligne de commande. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_INSERT`.

### Comment insérer un bloc depuis la ligne de commande ?

Tapez `-I` et le nom du bloc, puis cliquez le point d'insertion et répondez à l'échelle et à la rotation, Entrée gardant chaque valeur par défaut. <Keyword id="?" /> au nom liste les blocs du dessin.

### Comment insérer un bloc à une autre échelle ?

Tapez le facteur d'échelle X après le point d'insertion, et Entrée au facteur Y pour les garder égaux ; ou choisissez <Keyword id="Scale" /> avant le point et tapez un seul facteur pour les deux. Un facteur négatif fait une symétrie du bloc.

### Comment insérer un bloc d'un autre dessin ?

Pas depuis son fichier : INSERER ne place que les blocs définis dans le dessin. Copiez plutôt une de ses références (Ctrl+C), ouvrez le dessin où vous la voulez et collez-la (Ctrl+V) : son bloc vient avec elle, sauf si ce dessin a déjà un bloc de ce nom, dont la définition est gardée.
