---
title: "Exercice AutoCAD : une table ronde et ses chaises"
metaTitle: "Exercice AutoCAD : table ronde et six chaises"
description: "Dessinez une table ronde et six chaises dans AutoCAD : une chaise, un réseau polaire autour du centre de la table et les cotes, pas à pas. Gratuit en ligne."
figure: "Une table ronde de 120 et six chaises, en plan, cotée en centimètres."
sourceHash: "1e307bf5e17a"
---

Dessinez une table ronde de 120 et six chaises, en centimètres : chaque chaise, une assise de 44 sur 40 aux coins arrondis à 4 et un dossier de 8 de profondeur, son avant à 8 du bord de la table. Dessinez une chaise au-dessus de la table et laissez un réseau polaire placer les six. L'échelle des cotes du dessin est réglée pour des centimètres.

## Steps

### Dessinez la table [#table]

Sur le calque Contour, <Command id="CIRCLE" /> en `0,0`, <Keyword command="CIRCLE" id="Diameter" /> `120`.

### Dessinez une chaise [#chair]

L'assise, au-dessus de la table : <Command id="RECTANG" /> avec un <Keyword command="RECTANG" id="Fillet" /> de `4`, de `-22,68` à `44,40` plus loin. Puis le dossier, avec le raccord ramené à `0`, de `-22,108` à `44,8` plus loin. <Command id="RECTANG" /> garde son rayon de raccord jusqu'à ce que vous le changiez.

### Disposez les chaises en réseau [#array]

<Command id="ARRAYPOLAR" /> : désignez l'assise et le dossier, appuyez sur Entrée, donnez le centre de la table, `0,0`, puis <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Chaque chaise tourne en étant placée, si bien que les six font face à la table.

### Cotez-la [#dimensions]

Sur le calque Cotes, <Command id="DIMDIAMETER" /> sur la table, placée à l'intérieur, et <Command id="DIMLINEAR" /> pour la largeur de la chaise du haut, 44, et sa profondeur avec le dossier, 48.
