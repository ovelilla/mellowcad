---
title: "Exercice AutoCAD : une équerre en L"
metaTitle: "Exercice AutoCAD 2D débutant : équerre en L"
description: "Dessinez une équerre en L dans AutoCAD en coordonnées relatives : contour, raccord, deux trous et cotes de ligne de base, résolu pas à pas. Gratuit en ligne."
figure: "L'équerre en L, de 100 sur 80, cotée depuis son coin inférieur gauche."
sourceHash: "5c7cd5d57c92"
---

Dessinez cette équerre, en millimètres : 100 de long, une semelle de 20 de haut et un montant de 30 de large et 80 de haut, le coin intérieur arrondi d'un rayon de 10, un trou de 8 dans la semelle et un de 10 dans le montant, chacun centré dans sa branche. Le contour se dessine d'une seule traite avec <Command id="LINE" />, chaque point tapé comme le déplacement depuis le précédent, et ses cotes partent toutes du coin inférieur gauche.

## Steps

### Dessinez le contour [#outline]

Sur le calque Contour, <Command id="LINE" /> depuis `0,0`, puis chaque point comme un pas depuis le précédent : `100,0`, `0,20`, `-70,0`, `0,60` et `-30,0`. <Keyword command="LINE" id="Close" /> dessine le dernier côté jusqu'au départ et termine la commande.

### Arrondissez le coin intérieur [#fillet]

<Command id="FILLET" /> : choisissez <Keyword command="FILLET" id="Radius" />, tapez `10`, puis désignez les deux lignes qui se rejoignent au coin intérieur, le dessus de la semelle et le flanc du montant.

### Dessinez les trous [#holes]

Deux cercles avec <Command id="CIRCLE" />, chacun par son <Keyword command="CIRCLE" id="Diameter" /> : `8` en `80,10`, dans la semelle, et `10` en `15,65`, dans le montant.

### Cotez-la [#dimensions]

Sur le calque Cotes, <Command id="DIMLINEAR" /> de `0,0` au trou de la semelle, `80,10`, placée en dessous : 80. <Command id="DIMBASELINE" /> continue depuis la même première ligne d'attache : tapez l'extrémité droite, `#100,0`, où # mesure depuis l'origine, puis Entrée deux fois pour terminer la commande. De même en montant le long du côté gauche, jusqu'au trou du haut puis jusqu'au sommet, `#0,80`. <Command id="DIMRADIUS" /> sur le raccord et <Command id="DIMDIAMETER" /> sur chaque trou terminent la cotation.
