---
title: "Exercice AutoCAD : un escalier en plan"
metaTitle: "Exercice AutoCAD architecture : escalier en plan"
description: "Dessinez un escalier droit en plan dans AutoCAD : dix marches avec une ligne et un réseau rectangulaire, la flèche de montée et les cotes. Gratuit, pas à pas."
figure: "Un escalier droit en plan, de 280 sur 100 centimètres, sa flèche pointant vers le haut de la volée."
sourceHash: "ff6e60262cd9"
---

Dessinez un escalier droit en plan, en centimètres : 280 de long et 100 de large, dix marches de 28 et la flèche qui indique le sens de la montée. L'échelle des cotes du dessin est réglée pour un plan en centimètres, si bien que ses cotes se lisent à cette taille. On dessine le nez d'une marche ; un réseau rectangulaire place les autres.

## Steps

### Dessinez le contour [#outline]

Sur le calque Contour, <Command id="RECTANG" /> de `0,0` à `280,100` : le contour de la volée.

### Dessinez la première marche [#tread]

Le nez de la première marche, une <Command id="LINE" /> depuis `28,0`, `0,100` vers le haut, et Entrée.

### Disposez les marches en réseau [#array]

<Command id="ARRAYRECT" /> copie cette ligne le long de la volée : désignez-la et appuyez sur Entrée, puis choisissez <Keyword command="ARRAYRECT" id="COUnt" />, `9` colonnes et `1` rangée, et <Keyword command="ARRAYRECT" id="Spacing" />, `28` entre les colonnes et `1` entre les rangées, ce qui ne change rien avec une seule rangée. Avec <Keyword command="ARRAYRECT" id="eXit" />, les marches restent un réseau associatif, modifiable ensuite par ses poignées.

### Dessinez la flèche [#arrow]

<Command id="PLINE" /> depuis `14,50`, le long de la volée jusqu'à `226,0` plus loin ; puis <Keyword command="PLINE" id="Width" />, `10` au départ et `0` à la fin, et un dernier segment de `24,0` : la pointe de la flèche. Entrée la termine.

### Cotez-le [#dimensions]

Sur le calque Cotes, <Command id="DIMLINEAR" /> trois fois : la longueur en dessous, la largeur à droite et une marche, 28, au-dessus.
