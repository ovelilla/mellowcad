---
title: "Commande PAN dans AutoCAD"
description: "Panoramique avec PAN (alias P) d'AutoCAD en français : glissez la vue avec la main ou la molette, -PAN par deux points, PAN dans une commande. Essayez-le."
figure: "PAN glissé vers la droite et vers le bas, puis Entrée : la plaque glisse dans la vue, ses coordonnées inchangées."
sourceHash: "0ca3050831f3"
---

PAN fait glisser la vue ; rien ne bouge dans le dessin. Elle commence par <Message id="panExit" /> et ne demande rien d'autre : le curseur devient une main, et un glissement avec le bouton gauche déplace la vue avec lui, autant de fois que vous voulez, jusqu'à ce qu'Entrée ou Echap la termine. Sans PAN, un glissement avec le bouton de la molette fait un panoramique à tout moment, même au milieu d'une commande. Chaque PAN est une étape d'annulation, réunie avec les ZOOM et les PAN qui l'entourent, de sorte que <Command id="U" /> rend la vue. Tapée avec une apostrophe, `'PAN` ou `'P`, elle fonctionne à l'intérieur d'une autre commande, qui reprend ensuite.

<Command id="-PAN" /> fait le panoramique par deux points : un point de base et un deuxième point, la vue se déplaçant de la distance qui les sépare ; ou un déplacement tapé à la première invite, comme `50,0`, et Entrée à la seconde. Elle est transparente elle aussi, et forme sa propre étape d'annulation.

## Missing

Le menu contextuel qu'AutoCAD affiche au clic droit pendant un panoramique, avec Quitter, Panoramique, Zoom, Orbite 3D, Fenêtre de zoom, Zoom original et Zoom vers l'étendue.

## Questions

### Quel est le raccourci de la commande PAN dans AutoCAD ?

`P`, puis Entrée ou la barre d'espace. Ou aucune commande : maintenez la molette enfoncée et faites glisser. Le nom complet fonctionne aussi, le même dans AutoCAD en français, et `_PAN` dans toutes les langues d'AutoCAD.

### Comment faire un panoramique avec la souris dans AutoCAD ?

Maintenez le bouton de la molette enfoncé et faites glisser : la vue suit le curseur. Faites tourner la molette pour zoomer et dézoomer autour du curseur. Sur un pavé tactile, lancez PAN et faites glisser avec le bouton gauche.

### Comment faire un panoramique pendant que je dessine ?

Faites glisser avec le bouton de la molette, ou tapez `'P` à l'invite de la commande : la commande attend pendant le panoramique, puis repose sa question là où elle en était.

### Comment faire un panoramique d'une distance précise ?

Utilisez <Command id="-PAN" /> : tapez le déplacement, comme `100,0`, et appuyez sur Entrée au deuxième point. La vue se déplace de 100 unités le long de X.
