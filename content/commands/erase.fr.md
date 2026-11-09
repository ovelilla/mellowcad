---
title: "Commande EFFACER (ERASE) dans AutoCAD"
description: "Comment fonctionne EFFACER (ERASE, alias EF) d'AutoCAD en français : sélectionner, Entrée, effacé ; la touche Suppr, tout effacer, récupérer. Essayez-le."
figure: "Un rectangle et ses deux diagonales : une diagonale sélectionnée, puis Entrée, et elle est effacée."
sourceHash: "2de33971060a"
---

EFFACER (ERASE) retire du dessin les objets que vous sélectionnez. Sélectionnez-les à `Sélectionnez des objets:`, en cliquant dessus ou avec n'importe quel mode de sélection d'AutoCAD, dont la fenêtre et la capture, puis appuyez sur Entrée ou sur la barre d'espace : ils disparaissent, et la commande n'en dit pas plus. Echap la termine sans rien effacer. Comme dans AutoCAD, les objets sélectionnés avant la commande sont effacés aussitôt, et la touche Suppr, avec des objets sélectionnés, lance EFFACER sur eux. Pendant la sélection, l'objet sous le curseur et ceux déjà choisis s'affichent estompés, comme AutoCAD montre d'avance ce qu'il va effacer. L'effacement entier est une seule étape, qu'Annuler reprend.

## Missing

REPRISE (OOPS), qui dans AutoCAD rend le dernier jeu effacé par EFFACER, même après d'autres commandes. Ici, <Command id="U" /> ou Ctrl+Z annule l'effacement, avec tout ce qui l'a suivi.

## Questions

### Comment s'appelle la commande ERASE en français ?

EFFACER, avec les alias `EF` et `DELETE` ; dans AutoCAD en français, `E` lance ETIRER (STRETCH). Ou sélectionnez les objets à `Commande:` et appuyez sur la touche Suppr. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_ERASE`.

### Comment tout effacer dans un dessin AutoCAD ?

Lancez EFFACER, tapez `TOUT` à `Sélectionnez des objets:` (ou `_ALL`, qui fonctionne dans toutes les langues), puis Entrée. Les objets d'un calque verrouillé restent à l'écart, et la sélection dit combien il y en avait.

### Comment récupérer un objet effacé dans AutoCAD ?

Tapez <Command id="U" /> ou appuyez sur Ctrl+Z tout de suite : l'effacement est une seule étape d'annulation. REPRISE, qui rend le dernier jeu effacé même après d'autres commandes, n'existe pas encore.

### Quelle est la différence entre EFFACER et AJUSTER ?

EFFACER supprime des objets entiers. <Command id="TRIM" /> supprime seulement la partie d'un objet qui dépasse les arêtes qu'il rencontre, et garde le reste.
