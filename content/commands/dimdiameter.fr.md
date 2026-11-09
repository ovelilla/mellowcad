---
title: "Commande COTDIA (DIMDIAMETER) dans AutoCAD"
description: "Cote de diamètre dans AutoCAD en français : COTDIA (DIMDIAMETER, alias CM) cote un cercle ou un arc, le texte dedans ou dehors. Essayez-le gratuitement."
figure: "Un grand cercle coté à l'intérieur et un petit à l'extérieur : chaque cercle désigné, puis le texte placé."
sourceHash: "76537f5f9854"
---

COTDIA (DIMDIAMETER en anglais) cote le diamètre d'un cercle, d'un arc ou d'un segment d'arc de polyligne, avec les invites de <Command id="DIMRADIUS" /> : désignez la courbe, et la ligne de commande indique aussitôt la mesure ; placez ensuite la cote, et la commande se termine. Son texte est le diamètre précédé du symbole de diamètre. Placée à l'intérieur du cercle, une ligne va du texte à une flèche sur le bord ; placée à l'extérieur, la ligne traverse le cercle d'un bord à l'autre, sa flèche opposée pointant vers l'intérieur depuis un court segment, comme ISO-25 la dessine.

## Options

### Text

Demande le texte à écrire à la place de la mesure, qu'elle propose par défaut : Entrée garde la mesure. Dans ce que vous tapez, `<>` représente la mesure avec son symbole, si bien que `<> DEBOUCHANT` écrit le diamètre suivi de DEBOUCHANT.

### Angle

Demande l'angle du texte, qui est alors dessiné selon cet angle, son milieu sur la ligne, et la ligne s'arrête au texte. 0 le remet le long de la ligne.

## Missing

textMult : le texte d'une cote tient sur une ligne, réglé avec <Keyword id="Text" /> à la ligne de commande, jamais dans l'éditeur de texte. Le symbole est dessiné Ø, là où AutoCAD écrit ∅ : la police du dessin n'a pas de ∅. Sur un arc, les flèches restent entre ses extrémités, là où AutoCAD dessine une ligne d'attache d'arc. Comme pour <Command id="DIMRADIUS" />, une courbe à l'intérieur d'une référence de bloc ne peut pas être désignée, les axes du style ne sont pas dessinés et ses réglages du texte hors de la courbe ne sont pas proposés. Une cote n'est pas associative : elle ne suit pas la courbe qu'elle mesure.

## Questions

### Comment s'appelle la commande DIMDIAMETER en français ?

COTDIA, raccourci `CM`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMDIAMETER`.

### Comment coter un petit trou ?

Placez le texte à l'extérieur du cercle : la ligne de cote traverse alors le trou avec une flèche de chaque côté, et le texte reste dégagé. À l'intérieur, le texte a besoin de place dans le cercle.

### COTDIA peut-elle coter un arc ?

Oui : un arc ou un segment d'arc de polyligne, comme un cercle, et elle indique le diamètre du cercle de l'arc. Tout autre objet affiche <Message id="notCircleOrArc" />, et la question revient.

### Comment ajouter DEBOUCHANT ou une note à une cote de diamètre ?

Choisissez <Keyword id="Text" /> avant de la placer et tapez `<> DEBOUCHANT` : `<>` est la mesure avec son symbole. Une fois la cote placée, la ligne Remplacement du texte de la palette Propriétés le modifie.
