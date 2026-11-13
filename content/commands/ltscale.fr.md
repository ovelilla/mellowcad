---
title: "Commande ECHLTP (LTSCALE) dans AutoCAD"
description: "Échelle de type de ligne avec ECHLTP (LTSCALE, alias ECT) d'AutoCAD en français : un facteur pour tout le dessin, pour que les pointillés se voient. Essayez-le."
before: "Une plaque de 4 mètres de long, son trou dessiné avec HIDDEN et ses axes avec CENTER, à l'échelle de type de ligne par défaut de 1 : les tirets trop fins pour être vus."
figure: "La même plaque après ECHLTP 20 : les tirets du trou et des axes dessinés 20 fois plus longs."
sourceHash: "33b956c956fa"
---

ECHLTP (LTSCALE) règle le facteur d'échelle global des types de ligne : la longueur des tirets et des espaces de chaque type de ligne discontinu du dessin. Elle demande le nouveau facteur, en proposant le facteur courant, 1.0000 dans un nouveau dessin : 2 rend chaque tiret deux fois plus long, 0.5 deux fois plus court. Le facteur doit être supérieur à 0, sinon elle dit <Message id="positiveNonzero" /> et redemande, et `1/2` et `1e3` sont lus comme des nombres. Un changement redessine tout le dessin, <Message id="regeneratingModel" /> comme le dit AutoCAD 2027, et il est enregistré avec le dessin ; c'est une étape que <Command id="U" /> annule. Tapée avec une apostrophe à l'intérieur d'une commande, `'ECHLTP` ne redessine le dessin qu'à la fin de cette commande.

Les types de ligne sont des motifs faits pour un dessin à la taille du papier : dans un dessin de 4 mètres de large, en millimètres, le motif de CENTER, long d'environ 51 unités, se répète quelque 80 fois sur sa largeur, trop fin pour être vu, et une ligne plus courte qu'un motif est dessinée continue. L'échelle à utiliser est souvent celle du dessin lui-même : 20 pour un dessin à lire au 1:20, 50 au 1:50.

## Missing

Le Gestionnaire des types de ligne, dont le Facteur d'échelle global est ECHLTP et l'Echelle de l'objet courant CELTSCALE. PSLTSCALE et MSLTSCALE, car il n'y a pas d'espace papier. Les formes des types de ligne complexes comme BATTING, dessinées comme leurs espaces.

## Questions

### Comment s'appelle la commande LTSCALE en français ?

ECHLTP, avec l'alias `ECT`, puis Entrée ou la barre d'espace ; l'alias anglais `LTS` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_LTSCALE`.

### Pourquoi ma ligne en pointillés apparaît continue ?

Son motif ne s'accorde pas au dessin à l'échelle courante. Une ligne plus courte qu'une répétition de son motif est dessinée continue ; une ligne longue à une petite échelle serre tant ses tirets qu'elle paraît continue. Augmentez ECHLTP pour un grand dessin, diminuez-la pour un petit, jusqu'à ce que les tirets apparaissent.

### Quelle échelle de type de ligne utiliser dans AutoCAD ?

L'échelle du dessin : dans un dessin en millimètres à lire au 1:50, `50`. Pour un dessin à la taille du papier, 1.

### Quelle est la différence entre ECHLTP et le type de ligne ?

Le type de ligne, réglé avec <Command id="LINETYPE" /> ou par le calque, est le motif : tirets, points et espaces. ECHLTP est la longueur à laquelle ce motif est dessiné, le même facteur pour tous les objets du dessin.
