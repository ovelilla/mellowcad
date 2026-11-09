---
title: "Commande ANNULER (UNDO) dans AutoCAD"
description: "Comment fonctionne ANNULER (UNDO) d'AutoCAD en français : un nombre d'étapes, Marque et Retour, Début et Fin, Contrôle, et sa différence avec U et Ctrl+Z."
before: "Une plaque percée de deux trous et une ligne qui la traverse, dessinées par quatre commandes : RECTANGLE, CERCLE deux fois et LIGNE."
figure: "ANNULER 2 : les deux dernières commandes sont annulées, la ligne et le second trou, et la plaque garde son premier trou."
sourceHash: "b4fed2178b6a"
---

ANNULER (UNDO) annule des commandes. Une étape est une commande entière : tout ce qu'a dessiné une LIGNE disparaît d'un coup, quel que soit son nombre de segments, de même que ce qu'une commande a réglé, comme ECHLTP. ANNULER écrit ses paramètres courants, puis demande le nombre d'opérations à annuler ou une option ; Entrée en annule une. La commande écrit sur une ligne les noms des commandes annulées, `CERCLE LIGNE`, et <Message id="everythingUndone" /> quand il n'y en a plus ; ensuite, <Message id="nothingToUndo" />. Une commande qui n'a rien changé, comme ID ou LISTE, est aussi une étape, de même que ce que ZOOM et PAN ont fait à la vue.

<Command id="U" /> est la forme courte : une étape en arrière, sans question. Ctrl+Z à l'invite Commande lance U ; à l'intérieur d'une commande, c'est l'option annUler de cette commande, comme la tape la macro d'AutoCAD : LIGNE annule son dernier segment et continue. <Command id="REDO" />, juste après, rétablit ce qu'a défait le dernier U ou ANNULER.

## Options

### Auto

Demande <Keyword id="ON" /> ou <Keyword id="OFF" />, en proposant le réglage courant, que la ligne des paramètres affiche ensuite. Dans AutoCAD, l'option fait une seule étape des commandes qu'exécute un élément de menu ; ici, aucun menu n'en exécute plus d'une, si bien qu'elle ne regroupe rien.

### Control

Demande quelle part de l'annulation garder, <Keyword id="All" /> par défaut. <Keyword id="None" /> abandonne toutes les étapes gardées et désactive l'annulation : U dit alors <Message id="uDisabled" />, et ANNULER demande aussitôt Contrôle. <Keyword id="One" /> ne garde que la dernière étape, et ANNULER demande alors 1 ou Contrôle. Tout réactive l'annulation complète. <Keyword id="Combine" /> dit si des ZOOM et des PAN consécutifs forment une seule étape, et <Keyword id="Layer" /> si c'est le cas de modifications consécutives dans le Gestionnaire des propriétés des calques, Oui par défaut pour les deux. Ces réglages sont ceux du dessin, et ne sont pas enregistrés avec lui : un dessin nouveau ou ouvert commence à Tout, Associer Oui et Calque Oui.

### BEgin

Ouvre un groupe : les commandes exécutées jusqu'à <Keyword id="End" /> forment une étape, que U annule en entier et nomme `GROUPE` avec elles. Tant qu'un groupe est ouvert, U, un nombre et Retour s'arrêtent à son début. Début avec un groupe ouvert le ferme d'abord.

### End

Ferme le groupe qu'a ouvert Début.

### Mark

Laisse une marque parmi les étapes. Retour, U et un nombre s'y arrêtent, avec <Message id="markEncountered" />.

### Back

Annule toutes les étapes jusqu'à la dernière marque, et la marque avec elles. Sans marque, demande s'il faut tout annuler, Oui par défaut.

## Missing

Auto ne regroupe rien, puisqu'aucun menu n'exécute ici plus d'une commande. Associer et Calque durent le temps de la session du navigateur, là où AutoCAD les garde d'une session à l'autre. Les boutons Annuler et Rétablir de la barre supérieure n'écrivent rien dans l'historique, là où la barre d'outils Accès rapide d'AutoCAD écrit ses propres lignes. Ctrl+Maj+Z rétablit aussi, sans rien dire, bien qu'AutoCAD n'y associe rien.

## Questions

### Quel est le raccourci pour annuler dans AutoCAD ?

Ctrl+Z, ou `U` puis Entrée : une étape en arrière. ANNULER n'a pas d'alias ; tapez-la en entier pour un nombre d'étapes ou pour ses options, ou `_UNDO` quelle que soit la langue d'AutoCAD.

### Quelle est la différence entre U et ANNULER ?

<Command id="U" /> annule la dernière commande et ne demande rien. ANNULER demande combien en annuler, et offre Marque et Retour pour revenir à un point marqué, Début et Fin pour faire de plusieurs commandes une seule étape, et Contrôle pour limiter l'annulation ou la désactiver.

### Comment annuler plusieurs commandes à la fois ?

Tapez `ANNULER` et le nombre de commandes, par exemple `5`. Ou choisissez <Keyword id="Mark" /> avant une série que vous voudrez peut-être abandonner, et <Keyword id="Back" /> pour y revenir.

### Pourquoi la commande annuler ne fonctionne pas ?

L'annulation a été désactivée avec Contrôle <Keyword id="None" /> : U le dit, et ANNULER demande Contrôle. Répondez <Keyword id="All" /> pour la réactiver. Les étapes faites avant sont perdues.

### Comment rétablir ce que j'ai annulé ?

<Command id="REDO" />, juste après U ou ANNULER, le rétablit en entier. Ctrl+Y rétablit une étape à la fois.
