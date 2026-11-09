---
title: "Commande EPAISSLIGNE (LWEIGHT) dans AutoCAD"
description: "Épaisseur de ligne avec EPAISSLIGNE (LWEIGHT, alias EPL) d'AutoCAD en français : en millimètres, les 24 valeurs standard, DuCalque, et à l'écran. Essayez-le."
figure: "Une plaque contournée à 0.70 mm, puis 0.1 tapé pour son trou, arrondi à 0.09 mm : les deux épaisseurs telles que l'écran les montre."
sourceHash: "154784b2b402"
---

EPAISSLIGNE (LWEIGHT) règle l'épaisseur de ligne avec laquelle les nouveaux objets sont dessinés, en millimètres. AutoCAD ouvre la boîte de dialogue Paramètres d'épaisseur de ligne ; MellowCAD n'en a pas encore, donc EPAISSLIGNE lance la forme en ligne de commande qu'AutoCAD a aussi, <Command id="-LWEIGHT" />. Elle indique l'épaisseur de ligne courante, `DUCALQUE` au départ, et en demande une nouvelle : l'une des 24 valeurs standard d'AutoCAD, de 0.00 à 2.11 mm. Toute autre valeur est ramenée à la valeur standard la plus proche, avec un message, et une valeur négative est refusée avec <Message id="invalidLineweightNumber" />. Entrée garde l'épaisseur courante. Chaque changement est une étape que <Command id="U" /> annule.

Ici, les épaisseurs de ligne s'affichent à l'écran dès le départ : AutoCAD ne les montre qu'une fois activé le bouton Afficher/Masquer les épaisseurs des lignes de la barre d'état (LWDISPLAY), mais sans présentations ni traçage dans MellowCAD, l'écran est le seul endroit où elles peuvent apparaître. Le bouton les masque et les affiche. Une polyligne avec une largeur montre sa largeur en plan, pas son épaisseur de ligne.

## Options

### ?

Liste les valeurs acceptées, DuCalque et les 24 épaisseurs standard, puis redemande.

### BYLAYER

Les nouveaux objets prennent l'épaisseur de ligne de leur calque, comme au départ.

## Missing

DuBloc et Par défaut (LWDEFAULT), les épaisseurs en pouces, la boîte de dialogue Paramètres d'épaisseur de ligne et l'entrée Paramètres d'épaisseur de ligne… de la liste déroulante.

## Questions

### Comment s'appelle la commande LWEIGHT en français ?

EPAISSLIGNE, avec les alias `EPL` et `EPLIGNE`, puis Entrée ou la barre d'espace ; l'alias anglais `LW` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_LWEIGHT`.

### Pourquoi l'épaisseur de ligne ne s'affiche pas dans AutoCAD ?

Dans AutoCAD, les épaisseurs ne s'affichent à l'écran qu'avec le bouton Afficher/Masquer les épaisseurs des lignes de la barre d'état activé (LWDISPLAY 1), désactivé au départ. Ici, il est activé au départ. Les épaisseurs fines se dessinent toutes comme la ligne la plus fine de l'écran, donc la différence se voit sur les plus épaisses ; et un objet dont l'épaisseur est DuCalque prend celle de son calque.

### Comment changer l'épaisseur de ligne d'un objet existant ?

Sélectionnez-le et choisissez l'épaisseur dans la ligne Epaisseur de ligne de la palette Propriétés, ou changez l'épaisseur de son calque dans le Gestionnaire des propriétés des calques si l'objet est DuCalque. EPAISSLIGNE ne règle que l'épaisseur des objets dessinés après.

### Quelles épaisseurs de ligne existent dans AutoCAD ?

24 valeurs fixes en millimètres : 0.00, 0.05, 0.09, 0.13, 0.15, 0.18, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.53, 0.60, 0.70, 0.80, 0.90, 1.00, 1.06, 1.20, 1.40, 1.58, 2.00 et 2.11. Tapez-en une autre, 0.45 par exemple, et EPAISSLIGNE prend la plus proche, la plus fine en cas d'égalité.
