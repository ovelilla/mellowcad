---
title: "Exercice AutoCAD : une bride"
metaTitle: "Exercice AutoCAD 2D : bride, rainure de clavette"
description: "Dessinez une bride dans AutoCAD : alésage et rainure de clavette ajustée, huit trous en réseau polaire, axes et diamètres, résolu pas à pas. Gratuit en ligne."
figure: "La bride, de 140 de diamètre, avec sa rainure de clavette, ses huit trous et ses diamètres."
sourceHash: "32f94d57ae25"
---

Dessinez cette bride, en millimètres : 140 de diamètre, un alésage de 60 avec une rainure de clavette de 16 de large dont le côté supérieur est à 36 du centre, huit trous de 14 sur un cercle de perçage de 110, et ses axes. La rainure de clavette est un rectangle ajusté dans l'alésage ; les trous sont un cercle et un réseau polaire.

## Steps

### Dessinez les cercles [#circles]

Sur le calque Contour, deux cercles en `0,0`, chacun par son <Keyword command="CIRCLE" id="Diameter" /> : `140` et `60`.

### Découpez la rainure de clavette [#keyway]

<Command id="RECTANG" /> de `-8,20` à `16,16` plus loin : le rectangle traverse l'alésage. <Command id="TRIM" /> coupe un objet là où les autres le croisent : désignez l'arc de l'alésage entre les côtés du rectangle, puis le bas du rectangle, à l'intérieur de l'alésage. Ce qui reste est la rainure de clavette, ses deux flancs et son côté supérieur.

### Disposez les trous en réseau [#holes]

Un trou sur le cercle de perçage : un cercle en `55<22.5`, à 55 de l'origine, à 22,5°, d'un <Keyword command="CIRCLE" id="Diameter" /> de `14`. <Command id="ARRAYPOLAR" /> : désignez-le, appuyez sur Entrée et donnez le centre, `0,0` ; <Keyword command="ARRAYPOLAR" id="ASsociative" /> et <Keyword command="ARRAYPOLAR" id="No" /> laissent huit cercles distincts, qu'une cote peut désigner, et <Keyword command="ARRAYPOLAR" id="Items" />, `8`, les répartit sur tout le tour. Puis, sur le calque Axes, le cercle de perçage en `0,0`, de diamètre `110`.

### Dessinez les axes [#centreLines]

Toujours sur le calque Axes, deux lignes avec <Command id="LINE" /> passant par le centre, longues de 156 : depuis `-78,0`, `156,0` à l'horizontale ; depuis `0,-78`, `0,156` vers le haut.

### Cotez-la [#dimensions]

Sur le calque Cotes, <Command id="DIMDIAMETER" /> sur l'alésage, un trou, le cercle de perçage et le contour, chacun désigné là où aucune cote ne le croise encore, puis <Command id="DIMLINEAR" /> sur le côté supérieur de la rainure de clavette : 16.
