---
title: "Commande REPERE (PLAN) dans AutoCAD"
description: "Vue en plan avec REPERE (PLAN) d'AutoCAD en français : la vue en plan du SCU courant, d'un SCU enregistré ou du SCG, et comment y revenir. Essayez-le en ligne."
figure: "La pièce en gradins vue du sud-ouest, son SCU tourné de 30 degrés autour de Z : REPERE et Entrée regardent ce SCU à la verticale, son axe X vers la droite, si bien que la pièce apparaît tournée."
sourceHash: "50d157803309"
---

REPERE (PLAN) regarde à la verticale le plan XY d'un SCU, son axe X pointant vers la droite : la vue en plan, telle que vous avez dessiné. Elle demande quel SCU (le courant, un SCU enregistré ou le SCG) et Entrée prend le courant. Elle cadre ensuite tout le dessin et dit <Message id="regeneratingModel" />.

Rien ne bouge dans le dessin, et le SCU reste tel quel : REPERE ne fait que tourner la vue. C'est une seule étape d'annulation, donc <Command id="U" /> rend la vue, et <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> revient à la vue d'avant. C'est le chemin du retour à la vue en plan après <Command id="3DORBIT" /> ou une vue isométrique de <Command id="VIEW" />. La 3D de MellowCAD se limite aux solides, et reste partielle.

## Options

### Current ucs

La vue en plan du SCU courant, par défaut. Après que <Command id="UCS" /> a tourné le SCU de 30 degrés autour de Z, le dessin apparaît tourné de 30 degrés dans le sens horaire, pour que l'axe X du SCU pointe vers la droite ; après un SCU sur une face inclinée, elle regarde cette face de face.

### Ucs

La vue en plan d'un SCU enregistré avec l'option <Keyword command="UCS" id="NAmed" /> de <Command id="UCS" />, que vous tapez par son nom. Pour un nom qui n'est pas enregistré, elle dit qu'elle ne trouve pas ce SCU et redemande ; <Keyword id="?" /> liste les SCU enregistrés, comme le fait SCU, et redemande aussi. Le SCU courant ne change pas.

### World

La vue en plan du système de coordonnées général : le dessin tel qu'il était au départ, X vers la droite et Y vers le haut, quel que soit le SCU courant, qui reste tel quel.

## Missing

Sans rien de dessiné, REPERE laisse le zoom où il était, là où AutoCAD cadre les limites du dessin.

## Questions

### Comment revenir à la vue en plan dans AutoCAD ?

Tapez `REPERE` et appuyez deux fois sur Entrée : le second appui sur Entrée prend <Keyword id="Current ucs" />. Si le SCU est tourné et que vous voulez la vue en plan du SCG, choisissez plutôt <Keyword id="World" />.

### Quelle est la commande pour la vue en plan du SCU ?

REPERE avec <Keyword id="Current ucs" /> : elle regarde à la verticale le SCU courant, son axe X vers la droite. Tournez d'abord le SCU avec <Command id="UCS" />, puis lancez REPERE et appuyez deux fois sur Entrée : vous dessinez sur la vue en plan tournée comme si elle était droite.

### Pourquoi mon dessin est tourné en vue en plan ?

La vue est la vue en plan d'un SCU tourné. Lancez REPERE et choisissez <Keyword id="World" /> pour revoir le dessin avec le X général vers la droite ; <Command id="UCS" /> puis Entrée remettent aussi le SCU sur le SCG.

### REPERE change-t-elle le SCU ?

Non. Elle ne fait que tourner la vue ; le SCU reste tel quel. Ce sont les vues orthogonales de <Command id="VIEW" /> qui tournent aussi le SCU.
