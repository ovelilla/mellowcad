---
title: "Commande PROPRIETES (PROPERTIES) dans AutoCAD"
description: "La palette PROPRIETES (PROPERTIES, Ctrl+1) d'AutoCAD en français : Général et Géométrie, *VARIE*, un type d'objet à la fois. Essayez-le en ligne."
figure: "Un cercle sélectionné à l'invite Commande, ses poignées affichées, puis PROPRIETES : la palette s'ouvre à côté du dessin sur les lignes du cercle."
sourceHash: "14d097ac5b0b"
---

PROPRIETES (PROPERTIES) ouvre la palette Propriétés. Comme dans AutoCAD, c'est une palette, pas une boîte de dialogue : elle reste ouverte à côté du dessin, ici comme un onglet du panneau des palettes, pendant que vous sélectionnez et dessinez, jusqu'à ce que <Command id="PROPERTIESCLOSE" /> la ferme. Ctrl+1 l'affiche et la masque, et, tapée avec une apostrophe, `'PROPRIETES`, elle s'ouvre à l'intérieur d'une commande en cours. Dans une fenêtre large, elle est ouverte dès le départ.

Avec des objets sélectionnés, elle montre leurs propriétés, et vous en changez une en tapant ou en choisissant une nouvelle valeur dans sa ligne. Général vient d'abord, dans l'ordre d'AutoCAD : Couleur, Calque, Type de ligne, Epaisseur de ligne et Epaisseur, avec `*VARIE*` là où les objets sélectionnés diffèrent. En dessous, les lignes propres à chaque type : le point de départ et l'extrémité d'une ligne, sa longueur et son angle ; le centre, le rayon, le diamètre, la circonférence et l'aire d'un cercle ; celles d'un arc, d'une ellipse, les sommets et les largeurs d'une polyligne, les points d'une spline, celles d'un texte, d'une référence de bloc. Les coordonnées sont dans le SCU courant, et les lignes qui ne font qu'informer, comme la longueur d'une ligne, sont grisées. La liste déroulante du haut propose `Tout` et chaque type avec son nombre : choisissez-en un pour ne voir et ne modifier que ce type. Sans rien de sélectionné, Général montre le calque, la couleur, le type de ligne et l'épaisseur de ligne courants, que vous y réglez pour les nouveaux objets. Chaque modification est une étape que <Command id="U" /> annule.

## Missing

Dans Général, Echelle du type de ligne pour plusieurs objets à la fois ou, sans rien de sélectionné, pour les nouveaux (CELTSCALE) ; Style de tracé, Transparence et Lien hypertexte, et le matériau. Les lignes de géométrie de plusieurs objets d'un même type à la fois, le contenu d'un texte et les valeurs d'attributs ne se modifient pas ici. La Sélection rapide, le bouton PICKADD, le masquage automatique, l'ancrage de la palette et la palette flottante.

## Questions

### Quel est le raccourci de la palette Propriétés dans AutoCAD ?

Ctrl+1, qui masque aussi la palette. Au clavier : PROPRIETES, ou `PROP` et `PROPS`, puis Entrée ou la barre d'espace ; dans AutoCAD en français, `PR` lance PROLONGER et `MO` MODIFTEXTE, et `CH` n'existe pas. `_PROPERTIES` fonctionne dans toutes les langues d'AutoCAD.

### La palette Propriétés a disparu : comment la retrouver ?

Appuyez sur Ctrl+1 ou tapez `PROP` : la palette réapparaît, comme un onglet du panneau des palettes à côté du dessin. Ctrl+1 pressé pendant qu'elle s'affiche la masque, et c'est souvent ainsi qu'elle a disparu.

### Comment modifier les propriétés de plusieurs objets à la fois ?

Sélectionnez-les tous, puis changez la ligne : chaque objet sélectionné prend la nouvelle valeur. Une ligne dont les valeurs diffèrent indique `*VARIE*` jusqu'à ce que vous la régliez. Pour ne changer que les cercles parmi eux, par exemple, choisissez ce type dans la liste déroulante du haut.

### Quelle est la différence entre PROPRIETES et CORRESPROP ?

PROPRIETES affiche et règle les valeurs des objets sélectionnés. <Command id="MATCHPROP" /> les copie d'un objet sur d'autres, sans taper de valeur.
