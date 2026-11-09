---
title: "Commande RESEAU (ARRAY) dans AutoCAD"
description: "Comment fonctionne RESEAU (ARRAY, alias RE) d'AutoCAD en français : réseau rectangulaire, polaire ou le long d'une trajectoire. Essayez-le gratuitement."
figure: "Un carré et son cercle mis en réseau avec les valeurs par défaut : Entrée pour un réseau rectangulaire, 4 colonnes et 3 lignes."
sourceHash: "5e0a412c9f13"
---

RESEAU (ARRAY en anglais) copie une sélection selon un motif : en colonnes et en lignes, autour d'un centre, ou le long d'une trajectoire. Elle demande les objets, puis le type de réseau, Entrée choisissant un réseau rectangulaire, et passe la sélection à <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> ou <Command id="ARRAYPATH" />, qui continuent sans redemander les objets. Chacune affiche le réseau aussitôt et le modifie en direct, par ses options et ses poignées, jusqu'à ce qu'Entrée le crée : un seul objet réseau, ou des copies indépendantes si vous avez indiqué qu'il ne doit pas être associatif. Toute l'exécution est une seule étape d'annulation, et Entrée à l'invite de commande répète RESEAU.

## Options

### Rectangular

Des colonnes et des lignes, et des niveaux empilés selon Z si vous le voulez : <Command id="ARRAYRECT" />. Elle commence avec 4 colonnes et 3 lignes, espacées d'une fois et demie la taille de la sélection.

### PAth

Le long d'une ligne, d'un arc, d'un cercle ou d'une polyligne : <Command id="ARRAYPATH" />. Elle demande la courbe de trajectoire, puis dispose les éléments le long de celle-ci, chacun tourné comme tourne la trajectoire.

### POlar

Autour d'un point central : <Command id="ARRAYPOLAR" />. Elle demande le centre et commence avec 6 éléments sur un tour complet.

## Missing

Le type proposé est toujours Rectangulaire : ARRAYTYPE, la variable qui fixe le type par défaut d'AutoCAD, n'est pas lue.

## Questions

### Comment s'appelle la commande ARRAY en français ?

RESEAU, raccourci `RE` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_ARRAY`. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> et <Command id="ARRAYPATH" /> n'ont pas de raccourci et, tapées en entier, elles sautent la question du type.

### Comment faire un réseau circulaire ou polaire ?

Choisissez <Keyword id="POlar" />, ou lancez <Command id="ARRAYPOLAR" />, et désignez le point central : la sélection est copiée autour de lui, 6 éléments au départ. Changez leur nombre avec <Keyword command="ARRAYPOLAR" id="Items" />, et l'angle qu'ils remplissent avec <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### Comment décomposer un réseau ?

Sélectionnez-le et lancez <Command id="EXPLODE" /> : le réseau devient les objets de ses éléments, chaque objet sur son propre calque. Pour obtenir des copies indépendantes dès le départ, répondez <Keyword command="ARRAYRECT" id="No" /> à <Keyword command="ARRAYRECT" id="ASsociative" /> avant d'appuyer sur Entrée.

### Comment modifier un réseau après sa création ?

Sélectionnez-le. Ses poignées le modifient : le carré du point de base le déplace, les flèches règlent les nombres et l'espacement, et un nombre tapé pendant qu'une flèche de nombre est active devient le nombre. La palette Propriétés liste ses colonnes, ses lignes et son espacement, ou ses éléments et ses angles, pour les retaper. MODIFIERRESEAU (ARRAYEDIT) n'y est pas encore.
