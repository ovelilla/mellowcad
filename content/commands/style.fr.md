---
title: "Commande STYLE dans AutoCAD : styles de texte"
description: "Comment STYLE (alias S) d'AutoCAD gère les styles de texte : nouveau, renommer, supprimer, définir courant, hauteur fixe, et leur effet sur TEXTE et TEXTMULT."
figure: "Une plaque nominative : STYLE, puis TEXTE, dont l'option Style, avec ?, liste le style du dessin, Standard en Arial, et le nom de la plaque écrit avec lui."
sourceHash: "5e9a49c82ada"
---

STYLE gère les styles de texte du dessin : ce avec quoi un texte est écrit. Chaque texte, texte multiligne et attribut a un style, et les nouveaux prennent le style courant, Standard dans un nouveau dessin. STYLE ouvre la boîte de dialogue Style de texte, comme dans AutoCAD. Une sélection faite avant la commande est abandonnée, comme la boîte de dialogue l'abandonne, et `'STYLE`, tapé avec une apostrophe à l'intérieur d'une commande, s'ouvre sans terminer celle-ci, qui reprend une fois la boîte de dialogue fermée.

La boîte de dialogue indique le style courant et liste les styles, tous ou seulement ceux en cours d'utilisation. Nouveau... demande un nom, en proposant `style1`, `style2`… le premier libre, et crée une copie du style sélectionné, courante. Définir courant rend courant le style sélectionné ; F2 modifie son nom, et un nom déjà utilisé, en majuscules comme en minuscules, est refusé, comme AutoCAD le refuse. Effacer retire un style, mais jamais Standard, le style courant ni un style utilisé. Hauteur donne à un style une hauteur fixe, appliquée par Appliquer : 0, la valeur par défaut, la laisse libre, si bien que <Command id="TEXT" /> en demande une à chaque fois ; avec une hauteur fixée, TEXTE ne la demande pas. Annuler abandonne une hauteur non appliquée, et devient Fermer dès que quelque chose a changé. Tout ce qui est fait dans la boîte de dialogue est une seule étape que <Command id="U" /> défait. Avec des textes sélectionnés, la ligne Style de la palette Propriétés leur donne un autre style, en une seule étape.

## Missing

L'aperçu de la boîte de dialogue. La police, son style et la grande police, le facteur de largeur, l'angle oblique, et les effets Renversé, Reflété et Vertical : chaque style est dessiné en Arial, droit, avec une largeur de 1. Les styles annotatifs, et le style annotatif qu'un nouveau dessin d'AutoCAD contient à côté de Standard. `-STYLE`, qui demande tout sur la ligne de commande.

## Questions

### Quel est le raccourci de la commande STYLE ?

`S`, puis Entrée ou la barre d'espace ; `DDSTYLE` aussi. Dans AutoCAD en français, `ST` est STYLETABLEAU. `_STYLE` fonctionne quelle que soit la langue d'AutoCAD.

### Comment changer le style de texte dans AutoCAD ?

Pour le nouveau texte, rendez le style courant avec Définir courant dans la boîte de dialogue qu'ouvre STYLE, ou avec l'option <Keyword command="TEXT" id="Style" /> de <Command id="TEXT" />. Pour le texte déjà écrit, sélectionnez-le et choisissez le style dans la ligne Style de la palette Propriétés.

### Comment changer la police d'un style de texte ?

Dans AutoCAD, dans Nom de la police de la boîte de dialogue Style de texte. Pas encore ici : chaque style est dessiné en Arial, et un style ne se distingue que par son nom et sa hauteur.

### Pourquoi TEXTE ne demande pas la hauteur ?

Le style courant a sa propre hauteur. Mettez sa hauteur à 0 dans la boîte de dialogue Style de texte, puis Appliquer, et <Command id="TEXT" /> redemande la hauteur, en proposant la dernière utilisée.
