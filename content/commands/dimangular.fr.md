---
title: "Commande COTANG (DIMANGULAR) dans AutoCAD"
description: "Cotation angulaire dans AutoCAD en français : COTANG (DIMANGULAR, alias CAN), deux lignes, un arc, un cercle ou trois points, puis l'arc. Essayez-le."
figure: "Deux lignes qui se rejoignent à 30 degrés : chaque ligne désignée, puis l'arc de cote placé entre elles."
sourceHash: "30943abd60f6"
---

COTANG (DIMANGULAR en anglais) cote un angle avec un arc pour ligne de cote. Ce que vous désignez en premier décide de la suite, comme dans AutoCAD : une ligne fait demander une deuxième ligne, deux segments d'une même polyligne compris ; un arc est mesuré d'une extrémité à l'autre autour de son centre ; un cercle, du point où vous l'avez désigné à un deuxième point que vous donnez ; et Entrée fait demander à la place le sommet de l'angle, puis ses deux extrémités. Placez ensuite l'arc : l'endroit où vous le mettez choisit l'angle mesuré. Entre deux lignes, c'est celui de leurs quatre secteurs qui le contient ; sinon, l'angle ou, de l'autre côté de ses côtés, l'angle rentrant au-delà de 180°. La ligne de commande indique la mesure en degrés, et la commande se termine.

## Options

### Text

Demande le texte à écrire à la place de la mesure, qu'elle propose par défaut : Entrée garde la mesure. Dans ce que vous tapez, `<>` représente la mesure.

### Angle

Demande l'angle du texte, qui est alors dessiné selon cet angle au lieu de suivre l'arc de cote. 0 le remet le long de l'arc.

## Missing

textMult : le texte d'une cote tient sur une ligne, réglé avec <Keyword id="Text" /> à la ligne de commande. Quadrant, qui verrouille la cote sur un secteur pour que son texte puisse aller à l'extérieur. Les unités d'angle autres que les degrés décimaux (DIMAUNIT). Une cote angulaire ne peut être ni enchaînée ni espacée : <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> et <Command id="DIMSPACE" /> ne prennent que les cotes linéaires et alignées. Une ligne ou un arc à l'intérieur d'une référence de bloc ne peut pas être désigné. Entre deux lignes, la cote garde les points où son arc les rencontrait, et non les lignes : si elle est déplacée par la suite, son arc garde ses lignes d'attache à partir de ces points, là où AutoCAD mesure de nouveau par rapport aux lignes. Une cote n'est pas associative : elle ne suit pas les objets qu'elle mesure.

## Questions

### Comment s'appelle la commande DIMANGULAR en français ?

COTANG, raccourci `CAN`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMANGULAR`.

### Comment coter un angle de plus de 180 degrés ?

Appuyez sur Entrée à la première invite, donnez le sommet et les deux extrémités, puis placez l'arc à l'extérieur de l'angle qu'ils forment : la cote mesure l'angle rentrant, 360° moins l'autre. Un arc ou un cercle fonctionne de la même façon. Entre deux lignes, l'angle est toujours inférieur à 180°.

### Comment coter l'angle d'un arc ?

Désignez l'arc à la première invite : son centre est le sommet et ses extrémités les origines des lignes d'attache, si bien que la question suivante est déjà l'emplacement de la cote.

### Pourquoi COTANG dit que les lignes sont parallèles ?

Deux lignes parallèles, ou la même ligne désignée deux fois, ne forment pas d'angle : <Message id="dimLinesParallel" />, et la commande se termine.

### Comment changer les décimales d'une cote angulaire ?

Dans le style de cote : <Command id="DIMSTYLE" /> (`CST`) l'ouvre dans la palette Styles, où la précision angulaire des Unités principales les règle, 0 dans ISO-25. Toutes les cotes angulaires de ce style suivent.
