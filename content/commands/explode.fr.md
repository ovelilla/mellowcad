---
title: "Commande DECOMPOSER (EXPLODE) dans AutoCAD"
description: "Comment fonctionne DECOMPOSER (EXPLODE, alias DE) d'AutoCAD en français : polyligne en lignes et arcs, bloc en ses objets, texte en lignes. Essayez-le en ligne."
figure: "Un rectangle, une seule polyligne, décomposé en quatre lignes, puis l'une d'elles effacée seule."
sourceHash: "479cf1cd58d9"
---

DECOMPOSER (EXPLODE) décompose un objet composé en ses objets constitutifs. Sélectionnez les objets et appuyez sur Entrée : une polyligne devient des lignes et des arcs le long de son axe, une référence de bloc les objets de son bloc, d'un seul niveau, un texte multiligne un texte sur une ligne pour chaque ligne qu'il affiche, et des hachures à motif les lignes de leur motif. Chaque morceau garde le calque et les propriétés de l'objet ; ceux d'un bloc gardent les leurs. Une polyligne avec une largeur la perd, et DECOMPOSER le signale. Les lignes, cercles, arcs, textes sur une ligne et cotes ne peuvent pas être décomposés : ils sont refusés dès leur sélection, et une spline, une ellipse ou des hachures pleines quand la sélection se termine. La décomposition est une seule étape, qu'Annuler défait.

## Missing

Les cotes, qu'AutoCAD décompose en lignes, flèches et texte, et que MellowCAD refuse. Des hachures dont le motif n'est pas fourni ici sont refusées comme des hachures pleines, et le texte multiligne décomposé se place là où la police le dessine, un rien à côté de la place que lui donne AutoCAD.

## Questions

### Comment s'appelle la commande EXPLODE en français ?

DECOMPOSER, avec les alias `DE` et `DECOMPOS`, puis Entrée ou la barre d'espace ; l'alias anglais `X` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_EXPLODE`.

### Comment annuler une décomposition dans AutoCAD ?

Tapez <Command id="U" /> ou appuyez sur Ctrl+Z tout de suite : la décomposition est une seule étape d'annulation. Plus tard, <Command id="JOIN" /> refait une seule polyligne de lignes et d'arcs qui se touchent bout à bout, et <Command id="BLOCK" /> refait un bloc avec des objets.

### Peut-on décomposer un texte dans AutoCAD ?

Un texte multiligne, oui : chaque ligne devient un texte sur une ligne. Le texte sur une ligne est déjà le plus petit morceau, et DECOMPOSER le refuse.

### Comment décomposer un bloc dans AutoCAD ?

Sélectionnez la référence de bloc et appuyez sur Entrée : elle devient les objets de son bloc, là où la référence les dessinait. Un bloc qu'elle contient reste un bloc : décomposez-le à son tour. Les attributs reviennent sous la forme de leurs définitions, sans les valeurs.
