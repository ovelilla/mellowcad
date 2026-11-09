---
title: "Commande COPIER (COPY) dans AutoCAD"
description: "Comment fonctionne COPIER (COPY, alias CP) d'AutoCAD en français : un point de base, puis autant de copies que vous en placez. Essayez-le gratuitement."
figure: "Un cercle copié trois fois selon X à partir d'un même point de base, puis Entrée."
sourceHash: "e74bbdabf97c"
---

COPIER (COPY en anglais) place des copies des objets que vous sélectionnez : sélectionnez-les, donnez un point de base, puis un deuxième point pour chaque copie. Comme dans AutoCAD, dont le mode de copie est Multiple par défaut, elle continue d'en demander une de plus jusqu'à ce que vous appuyiez sur Entrée ou choisissiez Quitter, chaque copie étant mesurée à partir du même point de base. Les copies gardent le calque, la couleur et toutes les autres propriétés des objets. Les objets sélectionnés avant la commande sont ceux qu'elle copie, et pendant que vous placez une copie, le jeu suit le curseur.

## Options

### Displacement

Choisi à l'invite du point de base, ou par Entrée à cette invite : demande un seul déplacement sous forme de vecteur, `30,0` plaçant une copie à 30 selon X, et termine. Sa valeur par défaut est le dernier déplacement utilisé par COPIER dans ce dessin.

### Exit

Termine la commande, comme Entrée une fois une copie placée.

### Undo

Annule la dernière copie placée. Annuler la première affiche <Message id="commandCompletelyUndone" /> et redemande le deuxième point.

## Missing

Le mode Unique de COPYMODE (copier une fois et terminer) n'est pas proposé : COPIER est toujours Multiple, si bien que l'invite du point de base ne liste que <Keyword id="Displacement" />. L'option Réseau du deuxième point, la rangée de copies régulièrement espacées d'AutoCAD, n'est pas proposée non plus.

## Questions

### Comment s'appelle la commande COPY en français ?

COPIER, raccourci `CP`, puis Entrée ou la barre d'espace ; dans AutoCAD en français, `CO` n'est pas un raccourci de COPIER. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_COPY`.

### Comment faire plusieurs copies à la fois ?

Continuez à placer des points : chacun fait une copie de plus à partir du même point de base, jusqu'à Entrée. Pour des copies en lignes, en colonnes ou autour d'un centre, <Command id="ARRAY" /> les crée en une seule fois.

### Comment copier un objet à une distance précise ?

Donnez le point de base, puis tapez le deuxième point sous forme de distance : `30,0` le copie à 30 selon X, car la saisie dynamique lit un point après le premier à partir de celui-ci. Ou orientez le curseur dans la direction voulue, avec le mode ortho ou le repérage polaire, et tapez seulement la distance.

### Pourquoi COPIER n'a pas d'option Réseau ?

MellowCAD ne la propose pas encore. Pour une rangée de copies régulièrement espacées, <Command id="ARRAYRECT" /> avec une seule ligne fait la même chose, et les garde dans un seul réseau modifiable.
