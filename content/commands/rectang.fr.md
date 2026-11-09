---
title: "Commande RECTANGLE (RECTANG) dans AutoCAD"
description: "Comment RECTANGLE (RECTANG, alias REC) dessine un rectangle dans AutoCAD : deux coins, Cotes, Aire et Rotation, coins arrondis ou chanfreinés. Essayez-le."
figure: "Deux rectangles par deux coins, le second tapé par rapport au premier : l'un avec Raccord 8, le suivant avec Chanfrein 8."
sourceHash: "a5d4e90c06aa"
---

RECTANGLE (RECTANG) dessine un rectangle à partir de deux coins opposés, désignés ou tapés : `0,0` puis `100,50`, relatif au premier avec la saisie dynamique, en fait un de 100 sur 50. C'est une seule polyligne fermée de quatre sommets, créée sur le calque courant. Les options de la première invite fixent la façon dont les rectangles suivants sont dessinés, et chacune garde sa valeur pour le reste de la session : la commande RECTANGLE suivante dit sur sa première ligne celles qui sont en vigueur. Son option de largeur donne à chaque côté une largeur de polyligne. Pendant que vous placez l'autre coin, le rectangle suit le curseur ; avec la saisie dynamique activée, vous pouvez taper sa longueur, Tab, puis sa largeur.

## Options

### Chamfer

Demande une première et une seconde distance de chanfrein, et coupe chaque coin de ces distances : huit sommets. Une distance de 0 le désactive. Il remplace le raccord.

### Elevation

Demande l'élévation du rectangle, le Z auquel il est dessiné.

### Fillet

Demande un rayon et arrondit chaque coin de ce rayon. Un rayon de 0 le désactive. Il remplace le chanfrein.

### Thickness

Demande une hauteur : le rectangle s'élève d'autant, comme un mur, dans une vue 3D.

### Area

À l'invite de l'autre coin : demande l'aire, puis s'il faut donner la <Keyword id="Length" /> ou la <Keyword id="Width" />, puis ce côté. L'autre côté est calculé, coins compris, et le rectangle est créé aussitôt.

### Dimensions

À l'invite de l'autre coin : demande la longueur et la largeur, puis un point qui fixe de quel côté du premier coin se trouve le rectangle.

### Rotation

À l'invite de l'autre coin : demande l'angle de rotation du rectangle, tapé ou donné par un point depuis le premier coin, ou par deux points avec <Keyword id="Pick" />. L'angle est gardé pour la session.

## Missing

Une longueur ou une largeur de 0 avec <Keyword id="Area" />, qui ici ne dessine rien et dans AutoCAD dessine une polyligne brisée. Après une réponse refusée à l'invite de rotation, MellowCAD répète l'invite en entier, là où AutoCAD n'écrit rien de plus.

## Questions

### Quel est le raccourci de la commande RECTANGLE ?

`REC`, puis Entrée ou la barre d'espace ; `RECTANG` fonctionne aussi. Le nom complet également, et `_RECTANG` quelle que soit la langue d'AutoCAD.

### Comment dessiner un rectangle de dimensions précises ?

Indiquez le premier coin, puis tapez l'autre par rapport à lui : `100,50` avec la saisie dynamique activée, comme au départ, ou `@100,50` sans elle, le fait de 100 de long et de 50 de large. Ou choisissez <Keyword id="Dimensions" /> et tapez les deux côtés.

### Comment dessiner un rectangle aux coins arrondis ?

Choisissez <Keyword id="Fillet" /> à la première invite et tapez le rayon, puis indiquez les deux coins.

### Pourquoi mon rectangle a-t-il des coins arrondis ou coupés ?

RECTANGLE garde le raccord et le chanfrein pour la session : un rectangle dessiné après un autre qui en avait en a aussi, et sa première ligne le dit. Choisissez <Keyword id="Fillet" /> et tapez `0` pour revenir à des coins vifs.

### Un rectangle est-il une polyligne dans AutoCAD ?

Oui : une seule polyligne fermée. <Command id="EXPLODE" /> la décompose en quatre lignes, et <Command id="OFFSET" /> la décale tout entière.
