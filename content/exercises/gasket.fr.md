---
title: "Exercice AutoCAD : un joint plat"
metaTitle: "Exercice AutoCAD débutant : un joint plat"
description: "Dessinez un joint plat dans AutoCAD : plaque aux coins arrondis, trou central, quatre trous copiés d'un seul, axes et cotes, résolu pas à pas. Gratuit en ligne."
figure: "Le joint, de 120 sur 80, coté."
sourceHash: "dc5c0e2b45b8"
---

Dessinez ce joint, en millimètres : une plaque de 120 sur 80 aux coins arrondis d'un rayon de 10, un trou central de 40 et quatre trous de 10, leurs centres à 12 des bords, avec les axes du trou central et les cotes. Tout est tapé : le premier point d'une commande est là où vous le tapez, et chaque point suivant se mesure depuis le précédent. Le contour, les axes et les cotes vont chacun sur leur propre calque.

## Steps

### Dessinez le contour [#outline]

Rendez le calque Contour courant dans la liste déroulante des calques. <Command id="RECTANG" /> dessine la plaque d'un seul coup : choisissez <Keyword command="RECTANG" id="Fillet" /> et tapez le rayon, `10`, puis le premier coin, `0,0`, et l'autre coin, `120,80`, mesuré depuis le premier.

### Dessinez le trou central [#bore]

<Command id="CIRCLE" /> au milieu de la plaque, `60,40` : choisissez <Keyword command="CIRCLE" id="Diameter" /> et tapez `40`.

### Copiez les trous [#holes]

Dessinez un trou, un cercle en `12,12` d'un <Keyword command="CIRCLE" id="Diameter" /> de `10`, puis copiez-le avec <Command id="COPY" /> : désignez le cercle, appuyez sur Entrée, prenez son centre, `12,12`, comme point de base, et tapez où va chaque copie à partir de là : `96,0`, puis `96,56`, puis `0,56`. Entrée termine les copies.

### Dessinez les axes [#centreLines]

Rendez le calque Axes courant. Deux lignes avec <Command id="LINE" /> se croisent au centre du trou central et dépassent son bord de 6 : depuis `60,14`, `0,52` vers le haut ; depuis `34,40`, `52,0` à l'horizontale. Entrée termine chacune d'elles.

### Cotez-le [#dimensions]

Rendez le calque Cotes courant. <Command id="DIMLINEAR" /> prend deux points, puis l'emplacement de la ligne de cote : la longueur, de `0,10` à `120,0` plus loin, placée en dessous ; la hauteur, à droite ; l'entraxe des trous, 96 et 56. Un point tapé à ses invites ne touche aucun objet, si bien que chacune de ces cotes est créée non associative, et la ligne de commande le signale. Avec <Command id="DIMDIAMETER" />, désignez un cercle et placez son diamètre : celui du trou central, puis celui d'un trou.
