---
title: "Commande MODIFTEXTE (TEXTEDIT) dans AutoCAD"
description: "Comment MODIFTEXTE (TEXTEDIT, alias ED) d'AutoCAD modifie textes, textes multilignes et définitions d'attributs, l'un après l'autre, avec Mode. Essayez-le."
figure: "Le PALTE mal orthographié d'une plaque nominative, sélectionné avec MODIFTEXTE et retapé PLATE, puis Echap pour terminer la commande."
sourceHash: "2d0ed6fe5acc"
---

MODIFTEXTE (TEXTEDIT) modifie les objets d'annotation : elle dit le mode d'édition courant, Multiple au départ, et vous demande d'en sélectionner un. Un texte sur une ligne s'ouvre pour être retapé là où il est, un texte multiligne dans l'éditeur de <Command id="MTEXT" />, une définition d'attribut avec son étiquette, son invite et sa valeur par défaut. En mode Multiple, la commande demande ensuite l'objet suivant, jusqu'à ce qu'Echap ou Entrée la termine, et toute l'exécution est une seule étape, que <Command id="U" /> défait. Un double-clic sur un texte ou sur une définition d'attribut lance MODIFTEXTE, et sur un texte multiligne il ouvre l'éditeur pour ce seul objet.

Echap dans l'éditeur d'un texte sur une ligne abandonne cette modification et demande l'objet suivant ; un second Echap termine la commande. Un objet sur un calque verrouillé affiche <Message id="objectOnLockedLayer" /> et la commande redemande, et un clic sur tout autre objet redemande sans rien dire. Un texte sélectionné avant la commande s'ouvre aussitôt.

## Options

### Undo

Défait la dernière modification de cette exécution et redemande ; quand il n'en reste plus, la commande dit qu'elle a été annulée complètement.

### Mode

Demande le mode d'édition : <Keyword id="Single" /> termine la commande après un objet, <Keyword id="Multiple" /> en demande un autre. Le mode est gardé pour la commande MODIFTEXTE suivante, dans tous les dessins.

## Missing

Le texte des cotes : MODIFTEXTE ne modifie pas le texte d'une cote, que l'option Texte de <Command id="DIMLINEAR" /> fixe au moment de la placer. La modification du contenu d'un texte dans la palette Propriétés. EDITEXTMULT (MTEDIT), tapée, et -EDITEXTMULT. Pendant que l'éditeur est ouvert, la ligne de commande affiche `MODIFTEXTE:`, là où AutoCAD modifie sur place et ne demande rien.

## Questions

### Comment s'appelle la commande TEXTEDIT en français ?

MODIFTEXTE, avec l'alias `ED`, puis Entrée ou la barre d'espace ; `DDEDIT`, l'ancien nom d'AutoCAD, et `MO` aussi. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_TEXTEDIT`.

### Comment modifier un texte dans AutoCAD ?

Double-cliquez dessus, ou tapez `ED` et sélectionnez-le ; retapez-le et appuyez sur Entrée. MODIFTEXTE demande ensuite le texte suivant à modifier, jusqu'à Echap. Sa hauteur et sa rotation sont des lignes de la palette Propriétés, et son style la ligne Style.

### Comment modifier plusieurs textes l'un après l'autre ?

Laissez MODIFTEXTE en mode <Keyword id="Multiple" />, son mode par défaut : après chaque texte, la commande demande le suivant. <Keyword id="Mode" /> puis <Keyword id="Single" /> la font s'arrêter après un seul, comme le fait un double-clic.

### Pourquoi le double-clic ne modifie pas mon texte ?

Le texte est peut-être sur un calque verrouillé : déverrouillez le calque dans le Gestionnaire des propriétés des calques. MODIFTEXTE ne modifie pas encore le texte d'une cote, et les valeurs d'attribut d'un bloc ouvrent <Command id="EATTEDIT" />.
