---
title: "Commande CORRESPROP (MATCHPROP) dans AutoCAD"
description: "CORRESPROP (MATCHPROP, alias COR) d'AutoCAD en français : un objet source, puis les objets qui prennent son calque, sa couleur, ses styles. Essayez-le en ligne."
figure: "Une plaque et son trou, un axe vertical rouge en CENTER sur son calque, et une ligne horizontale sur le calque 0 que CORRESPROP transforme en ce même axe."
sourceHash: "603d5ab849b1"
---

CORRESPROP (MATCHPROP) copie les propriétés d'un objet sur d'autres : le pinceau Copier les propriétés d'AutoCAD. Sélectionnez l'objet source, ou sélectionnez-en un avant la commande ; elle en accepte un sur un calque verrouillé aussi. Elle dit ensuite quelles propriétés elle copie, <Message id="matchpropSettings" />, et demande les objets de destination : chaque sélection ou fenêtre les peint aussitôt, jusqu'à ce qu'Entrée la termine. Une destination sur un calque verrouillé reste telle quelle, avec <Message id="matchpropLockedDestination" />. Le curseur porte le pinceau d'AutoCAD, et toute l'exécution est une seule étape que <Command id="U" /> annule. Tapée avec une apostrophe, `'CORRESPROP`, elle s'exécute à l'intérieur d'une autre commande.

Ce qu'elle copie, ce sont les propriétés cochées par défaut dans les paramètres des propriétés : le calque, la couleur et l'épaisseur de ligne ; le type de ligne, sauf vers des hachures, du texte multiligne et des définitions d'attribut ; la hauteur d'extrusion ; entre textes, le style, la hauteur et la rotation, et d'un texte sur une ligne à un autre, la justification aussi ; entre cotes, le style de cote ; entre hachures, le motif, l'échelle et l'angle, mais pas l'origine.

## Missing

L'option Paramètres et sa boîte de dialogue Paramètres des propriétés : toutes les propriétés qu'elle connaît sont toujours copiées, et la première invite ne propose pas cette option. L'échelle de type de ligne, la transparence et le style de tracé, que les objets n'ont pas ici ; les largeurs d'une polyligne, le facteur de largeur et l'angle oblique d'un texte, et les propriétés annotatives. L'aperçu d'AutoCAD du changement sous le curseur.

## Questions

### Comment s'appelle la commande MATCHPROP en français ?

CORRESPROP, avec les alias `COR` et `COPIERPROP`, puis Entrée ou la barre d'espace ; l'alias anglais `MA` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_MATCHPROP`.

### Comment copier les propriétés d'une ligne sur une autre ?

Lancez CORRESPROP, sélectionnez la ligne dont vous voulez les propriétés, puis les lignes qui doivent les prendre, et appuyez sur Entrée. Elles passent sur son calque, avec sa couleur, son type de ligne et son épaisseur de ligne.

### Pourquoi Copier les propriétés ne fonctionne pas ?

Une destination sur un calque verrouillé n'est pas modifiée : déverrouillez d'abord le calque. Une propriété n'est copiée qu'entre objets qui l'ont : un style de cote seulement vers des cotes, un style de texte seulement vers des textes, un motif seulement vers des hachures. Et un type de ligne n'est pas copié vers des hachures ou du texte multiligne, comme dans AutoCAD.

### Comment copier les propriétés d'une cote ou de hachures ?

Sélectionnez une cote comme source et d'autres cotes comme destinations : elles prennent son style de cote, avec son calque et sa couleur. Des hachures transmettent leur motif, leur échelle et leur angle à d'autres hachures, et chacune garde sa propre origine.
