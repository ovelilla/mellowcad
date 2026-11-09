---
title: "Commande COTLIN (DIMLINEAR) dans AutoCAD"
description: "Cotation dans AutoCAD en français : COTLIN (DIMLINEAR, alias LI), deux origines ou un objet, puis la ligne de cote, horizontale ou verticale. Essayez-le."
figure: "Un rectangle coté deux fois : son côté supérieur par ses deux coins, son côté droit par Entrée et sa désignation."
sourceHash: "e48a0a6f18c9"
---

COTLIN (DIMLINEAR en anglais) mesure la distance entre deux points selon X ou selon Y et la dessine sous forme de cote : deux lignes d'attache, une ligne de cote avec ses flèches, et la mesure au-dessus. Vous donnez le premier et le second point d'origine des lignes d'attache, puis la position de la ligne de cote, et l'endroit où vous la placez choisit la direction, comme dans AutoCAD : au-dessus ou au-dessous des deux points, elle mesure horizontalement ; à côté d'eux, verticalement. Appuyez plutôt sur Entrée à la première invite et désignez une ligne, un arc, un segment de polyligne ou un cercle : ses deux extrémités, ou le diamètre du cercle, sont les origines. La ligne de commande indique alors la mesure, et la commande se termine.

La cote est dessinée dans le style de cote courant, ISO-25 dans un nouveau dessin : une virgule pour les décimales et pas de zéros de fin, comme l'écrivent les dessins métriques d'AutoCAD. <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> et <Command id="DIMROTATED" />, disponibles seulement en les tapant, sont COTLIN limitée à une direction.

## Options

### Text

Demande le texte à écrire à la place de la mesure, qu'elle propose par défaut : Entrée garde la mesure. Dans ce que vous tapez, `<>` représente la mesure, si bien que `<> mm` l'écrit suivie de son unité.

### Angle

Demande l'angle du texte, qui est alors dessiné selon cet angle au lieu de suivre la ligne de cote. 0 le remet le long de la ligne.

### Horizontal

Mesure selon X où que vous placiez la ligne de cote, qui reste horizontale ; l'invite ne propose alors que <Keyword id="Text" /> et <Keyword id="Angle" />.

### Vertical

Mesure selon Y où que vous placiez la ligne de cote, qui reste verticale.

### Rotated

Demande l'angle de la ligne de cote, `0` par défaut, et mesure selon cet angle la distance entre les origines. Sur un côté incliné, son propre angle donne sa longueur, comme le fait <Command id="DIMALIGNED" />.

## Missing

textMult : le texte d'une cote tient sur une ligne, réglé avec <Keyword id="Text" /> à la ligne de commande, jamais dans l'éditeur de texte. Avec un angle réglé par <Keyword id="Angle" />, AutoCAD centre le texte sur la ligne de cote ; ici, il reste au-dessus, comme sans angle. Une cote n'est pas associative : elle ne suit pas l'objet qu'elle mesure.

## Questions

### Comment s'appelle la commande DIMLINEAR en français ?

COTLIN, raccourci `LI`, puis Entrée ou la barre d'espace ; `COTHOR`, `COTVERTICAL` et `COTROTATION` la lancent aussi. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMLINEAR`.

### Quelles sont les commandes de cotation dans AutoCAD ?

<Command id="DIMLINEAR" /> pour les distances horizontales et verticales, <Command id="DIMALIGNED" /> pour une distance le long d'un côté incliné, <Command id="DIMRADIUS" /> et <Command id="DIMDIAMETER" /> pour les arcs et les cercles, <Command id="DIMANGULAR" /> pour les angles, <Command id="DIMCONTINUE" /> et <Command id="DIMBASELINE" /> pour les chaînes de cotes, <Command id="DIMSPACE" /> pour en égaliser l'espacement et <Command id="DIMSTYLE" /> pour leur apparence. COTE (DIM), qui crée tout type de cote depuis une seule invite, et COTRAP (QDIM), qui cote de nombreux objets à la fois, ne sont pas encore dans MellowCAD.

### Pourquoi la cote ne suit pas l'objet quand je le modifie ?

Les cotes de MellowCAD ne sont pas encore associatives, comme l'indique <Message id="nonAssociativeDimension" /> : une cote garde les points qui lui ont été donnés. Étirez-les ensemble : prenez l'extrémité que vous déplacez et l'origine de la cote qui s'y trouve dans une même fenêtre de capture d'<Command id="STRETCH" />, et la mesure est recalculée ; ou faites glisser la poignée de l'origine jusqu'à sa nouvelle place.

### Comment changer la taille du texte et des flèches des cotes ?

Dans le style de cote, comme dans AutoCAD : <Command id="DIMSTYLE" /> (`CST`) ouvre les styles de cote, ici dans la palette Styles, là où AutoCAD a le Gestionnaire des styles de cote. La hauteur du texte, la taille des flèches, l'échelle générale et les décimales du style courant s'y règlent, et toutes les cotes de ce style suivent.
