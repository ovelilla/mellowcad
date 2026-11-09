---
title: "Commande DEPLACER (MOVE) dans AutoCAD"
description: "Comment fonctionne DEPLACER (MOVE, alias DP) d'AutoCAD en français, invite par invite : un point de base puis un deuxième, ou un déplacement X,Y,Z. Essayez-le."
figure: "Un cercle déplacé de 50 vers la droite : sélectionné, son centre comme point de base, le deuxième point tapé."
sourceHash: "753ca38448bf"
---

DEPLACER (MOVE) emmène les objets que vous sélectionnez d'un endroit à un autre : sélectionnez-les, donnez un point de base, puis un deuxième point, et ils se déplacent de la distance et dans la direction qui vont du premier au second. Rien d'autre ne change en eux. Comme dans AutoCAD, des objets sélectionnés avant la commande sont ceux qu'elle déplace, un point peut être cliqué, pris avec l'accrochage aux objets ou tapé, et pendant que vous choisissez le deuxième point, le jeu suit le curseur, avec une ligne depuis le point de base. Le déplacement est une seule étape, qu'Annuler reprend.

## Options

### Displacement

Choisie à l'invite du point de base, ou par Entrée à cette invite, dont c'est l'option par défaut : demande le déplacement sous forme de vecteur, `10,5` déplaçant de 10 le long de X et de 5 le long de Y, avec pour valeur par défaut le dernier déplacement que DEPLACER a utilisé dans ce dessin. Au deuxième point, Entrée fait de même avec le point de base : ses coordonnées sont le déplacement.

## Missing

Deux des modes de sélection d'AutoCAD à l'invite des objets, Groupe et Multiple, et la sélection avec Ctrl des faces, arêtes ou sommets d'un solide pour le remodeler. Pendant que le jeu suit le curseur, il prend la couleur de chaque objet, mais pas son type de ligne ni son épaisseur de ligne, et les objets d'une référence de bloc prennent tous la couleur de la référence.

## Questions

### Comment s'appelle la commande MOVE en français ?

DEPLACER, avec l'alias `DP`, puis Entrée ou la barre d'espace ; l'alias anglais `M` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_MOVE`.

### Comment déplacer un objet d'une distance précise ?

Donnez le point de base, puis tapez le déplacement comme deuxième point : `50,0` déplace de 50 le long de X. Avec la saisie dynamique activée, comme au départ, un point après le premier est relatif à lui, et l'historique l'écrit donc `@50,0`. Ou orientez le curseur dans la direction voulue, avec le mode ortho ou le repérage polaire, et tapez seulement la distance.

### Comment déplacer des objets vers le haut en 3D ?

Donnez un Z au déplacement : `0,0,5` comme deuxième point, ou comme <Keyword id="Displacement" />, soulève le jeu de 5. Un point tapé sans Z se place à l'élévation courante.

### Quelle est la différence entre DEPLACER et ETIRER ?

DEPLACER déplace des objets entiers. <Command id="STRETCH" /> ne déplace que les extrémités et les sommets compris dans sa fenêtre de capture, et étire les objets auxquels ils appartiennent.
