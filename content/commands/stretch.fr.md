---
title: "Commande ETIRER (STRETCH) dans AutoCAD"
description: "Comment fonctionne ETIRER (STRETCH, alias E) d'AutoCAD en français : fenêtre de capture, point de base, second point, et pourquoi il déplace parfois tout."
figure: "Un rectangle et un cercle étirés de 40 vers la droite par une fenêtre de capture sur le côté droit : les coins qu'elle contient se déplacent, et le cercle avec eux."
sourceHash: "de8671fb4290"
---

ETIRER (STRETCH) déplace la partie du dessin qu'attrape une fenêtre de capture et étire ce qui la relie au reste. Sélectionnez avec une fenêtre de capture, tirée de droite à gauche, ou un polygone de capture, les extrémités et les sommets à déplacer ; indiquez ensuite un point de base et un second point, comme dans <Command id="MOVE" />. Ce que la fenêtre attrape se déplace de cette distance : les extrémités d'une ligne, les sommets d'une polyligne, les extrémités d'un arc, le contour de hachures, les origines d'une cote. Ce qui s'y trouve entièrement se déplace en entier ; un cercle, un texte ou une référence de bloc se déplace quand son centre ou son point d'insertion est à l'intérieur. Les objets sélectionnés un par un, ou trouvés par Fenêtre, se déplacent aussi en entier. L'étirement est une seule étape, qu'Annuler défait.

## Options

### Displacement

Choisie à l'invite du point de base, ou par Entrée à cette invite, dont c'est l'option par défaut : demande le déplacement sous forme de vecteur, `40,0` étirant de 40 le long de X. Au second point, Entrée fait de même avec le point de base : ses coordonnées sont le déplacement.

## Missing

Un arc elliptique dont une extrémité est dans la fenêtre, qu'AutoCAD déforme : ici, il se déplace en entier si son centre est dans la fenêtre, et reste en place sinon. Des hachures non associatives attrapées en partie, qu'AutoCAD laisse en place. Le texte d'une cote à sa place par défaut reste en place quand il est seul attrapé.

## Questions

### Comment s'appelle la commande STRETCH en français ?

ETIRER, avec l'alias `E` : tapez-le, puis Entrée ou la barre d'espace. Dans AutoCAD en français, `E` est ETIRER, et non EFFACER, qui est `EF`. Le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_STRETCH`.

### Pourquoi ETIRER ne fait que déplacer les objets ?

Parce que l'objet entier se trouve dans la fenêtre, ou que vous l'avez désigné : ETIRER déplace ces objets en entier. Tirez une fenêtre de capture, de droite à gauche, seulement sur les extrémités à déplacer.

### Comment étirer d'une distance précise ?

Indiquez le point de base, puis tapez le déplacement : `40,0` étire de 40 le long de X, lu par rapport au point de base avec la saisie dynamique activée. Ou orientez le curseur dans la direction voulue, avec le mode Ortho ou le repérage polaire, et tapez seulement la distance.

### Peut-on étirer un bloc dans AutoCAD ?

Une référence de bloc se déplace en entier quand son point d'insertion est dans la fenêtre, et reste en place sinon : son contenu ne s'étire pas. Appliquez-lui d'abord <Command id="EXPLODE" /> pour étirer ses morceaux.
