---
title: "Exercice AutoCAD : une biellette et ses tangentes"
metaTitle: "Exercice AutoCAD avancé : biellette et tangentes"
description: "Dessinez une biellette dans AutoCAD : deux bossages reliés par des tangentes avec l'accrochage Tangente, les arcs entre elles ajustés, et ses cotes. Gratuit."
figure: "Une biellette à deux bossages distants de 90, reliés par des lignes tangentes, cotée."
sourceHash: "383984af61b7"
---

Dessinez cette biellette, en millimètres : deux bossages distants de 90, de rayon 20 et 12, alésés aux rayons 10 et 6, reliés par des lignes tangentes aux deux, les arcs entre les lignes étant supprimés. Les lignes tangentes prennent l'accrochage aux objets Tangente à leurs deux extrémités ; <Command id="TRIM" /> transforme ensuite le cercle de chaque bossage en arc.

## Steps

### Dessinez les bossages [#bosses]

Sur le calque Contour, quatre cercles avec <Command id="CIRCLE" />, chacun par son rayon : `20` et `10` en `0,0`, `12` et `6` en `90,0`.

### Dessinez les lignes tangentes [#tangents]

<Command id="LINE" />, puis tapez `_TAN`, l'accrochage aux objets Tangente pour un seul point, et désignez le grand cercle près de son sommet ; `_TAN` de nouveau, et désignez le petit près de son sommet. La ligne touche les deux. De même le long du bas.

### Ajustez les arcs [#trim]

<Command id="TRIM" /> : désignez chaque bossage entre les deux lignes, du côté qui fait face à l'autre. Les arcs intérieurs disparaissent et chaque cercle devient un arc.

### Dessinez les axes [#centreLines]

Sur le calque Axes, l'axe qui passe par les deux centres et une ligne en travers de chaque bossage.

### Cotez-la [#dimensions]

Sur le calque Cotes, l'entraxe avec <Command id="DIMLINEAR" />, les rayons des bossages avec <Command id="DIMRADIUS" /> et leurs alésages avec <Command id="DIMDIAMETER" />.
