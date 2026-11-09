---
title: "Exercice AutoCAD 3D : un palier"
metaTitle: "Exercice AutoCAD 3D avancé : un palier"
description: "Modélisez un palier dans AutoCAD 3D : extrusion, union, puis alésage et trous de fixation soustraits en cylindres, pas à pas. Solides 3D gratuits en ligne."
figure: "Le palier en plan, de 100 sur 60, son bossage, son alésage et ses trous cotés."
model: "Le palier en solide, vu du sud-est dans le style visuel Conceptuel."
sourceHash: "5579d6bd5a86"
---

Modélisez ce palier, en millimètres : une semelle de 100 sur 60 aux coins de rayon 10, épaisse de 12 ; un bossage de 40 de diamètre et 40 de haut au milieu ; un alésage de 20 à travers le bossage et deux trous de fixation de 10 à travers la semelle, distants de 76. La semelle et le bossage sont extrudés à partir de leurs contours et unis en un seul solide ; l'alésage et les trous sont des cylindres qu'on en soustrait.

## Steps

### Dessinez le plan [#plan]

Sur le calque Contour, <Command id="RECTANG" /> avec un <Keyword command="RECTANG" id="Fillet" /> de `10`, de `0,0` à `100,60`, et un cercle en son centre, `50,30`, d'un <Keyword command="CIRCLE" id="Diameter" /> de `40`.

### Extrudez la semelle et le bossage [#extrude]

Extrudez avec <Command id="EXTRUDE" /> le contour sur `12` de haut, puis le cercle sur `40` : deux solides.

### Unissez-les [#union]

<Command id="UNION" /> : désignez les deux et appuyez sur Entrée. Ils ne forment plus qu'un solide.

### Dessinez les cylindres [#holes]

L'alésage et un trou de fixation en cylindres, avec <Command id="CYLINDER" /> : l'alésage en `50,30`, <Keyword command="CYLINDER" id="Diameter" /> `20` et `40` de haut ; un trou de fixation en `12,30`, diamètre `10` et `12` de haut. Puis copiez le trou avec <Command id="COPY" /> de `12,30` à `76,0` plus loin.

### Soustrayez-les [#subtract]

<Command id="SUBTRACT" /> : désignez le palier et appuyez sur Entrée, puis les trois cylindres et Entrée. L'alésage et les trous traversent la pièce.

### Faites tourner la vue [#view]

<Command id="-VIEW" /> et <Keyword command="VIEW" id="SEiso" />, <Command id="VSCURRENT" /> et <Keyword command="VSCURRENT" id="Conceptual" />, puis <Command id="ZOOM" /> <Keyword command="ZOOM" id="Extents" /> et 0.8x pour le cadrer.
