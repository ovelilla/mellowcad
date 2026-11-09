---
title: "Commande RETABLIR (REDO) dans AutoCAD"
description: "Comment fonctionne RETABLIR (REDO) d'AutoCAD en français : rétablir ce que U ou ANNULER vient de défaire ; MRETABLIR et Ctrl+Y, étape par étape. Essayez-le."
figure: "Un trou dessiné dans une plaque, défait avec U et rétabli avec RETABLIR."
sourceHash: "be2e44b98ac0"
---

RETABLIR (REDO) inverse la dernière commande <Command id="U" /> ou <Command id="UNDO" /> : ce qu'elle a défait est redessiné, en entier, si bien qu'après un ANNULER de cinq commandes, RETABLIR rétablit les cinq. La commande écrit au passage les noms des commandes, puis <Message id="everythingRedone" /> quand il ne reste rien à rétablir. Elle ne demande rien et n'a pas d'options.

Elle ne fonctionne que juste après l'annulation. À tout autre moment, elle dit <Message id="redoMustFollowUndo" />, et une fois qu'une autre commande s'est exécutée, même une qui ne change rien comme LISTE ou ZOOM, <Message id="nothingToRedo" />. Quand l'annulation est désactivée par l'option Contrôle Aucun d'ANNULER, RETABLIR dit que la commande est désactivée.

<Command id="MREDO" /> rétablit étape par étape : la commande demande un nombre d'actions, ou <Keyword command="MREDO" id="All" /> ou <Keyword command="MREDO" id="Last" />, et rétablit autant d'étapes parmi celles que les annulations ont défaites, quels que soient les U, ANNULER et RETABLIR exécutés depuis ; Dernier est toute la dernière annulation, une seule fois (<Message id="alreadyRedone" />). Ctrl+Y et l'entrée Rétablir du menu contextuel exécutent MRETABLIR avec 1, en annulant la commande en cours.

## Missing

Ctrl+Maj+Z rétablit aussi, sans rien dire, bien qu'AutoCAD n'y associe rien. Les boutons Annuler et Rétablir de la barre supérieure n'écrivent rien dans l'historique, là où la barre d'outils Accès rapide d'AutoCAD écrit ses propres lignes.

## Questions

### Quel est le raccourci pour rétablir dans AutoCAD ?

Ctrl+Y, qui rétablit une étape (MRETABLIR 1). RETABLIR elle-même n'a pas d'alias : tapez `RETABLIR`, ou `_REDO` quelle que soit la langue d'AutoCAD.

### Pourquoi RETABLIR ne fonctionne pas ?

RETABLIR n'inverse que le U ou l'ANNULER qui la précède immédiatement. Après toute autre commande, il n'y a plus rien à rétablir, même si elle n'a rien changé : annulez, puis rétablissez aussitôt.

### Quelle est la différence entre RETABLIR et MRETABLIR ?

RETABLIR rétablit la dernière annulation en entier, et seulement juste après elle. <Command id="MREDO" /> rétablit un nombre donné des étapes défaites, une à une, ou toutes, et fonctionne encore après un RETABLIR.

### Comment répéter la dernière commande dans AutoCAD ?

Appuyez sur Entrée ou sur la barre d'espace à l'invite Commande : la dernière commande redémarre. RETABLIR ne répète aucune commande, mais inverse une annulation.
