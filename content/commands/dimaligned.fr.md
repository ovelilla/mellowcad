---
title: "Commande COTALI (DIMALIGNED) dans AutoCAD"
description: "Cotation alignée dans AutoCAD en français : COTALI (DIMALIGNED, alias COTA) cote un côté incliné par deux origines ou un objet, invite par invite. Essayez-le."
figure: "Le côté incliné d'un triangle coté sur sa longueur : ses deux extrémités, puis la position de la ligne de cote."
sourceHash: "243f7657ed7d"
---

COTALI (DIMALIGNED en anglais) mesure la distance réelle entre deux points : sa ligne de cote est parallèle à la droite qui les relie, quel que soit son angle, là où <Command id="DIMLINEAR" /> ne mesure que selon X ou Y. Ses invites sont celles de <Command id="DIMLINEAR" /> : le premier et le second point d'origine des lignes d'attache, ou Entrée et la désignation d'une ligne, d'un arc ou d'un segment de polyligne pour en prendre les deux extrémités, puis la position de la ligne de cote, d'un côté ou de l'autre. Un cercle désigné donne son diamètre passant par le point où vous l'avez désigné. La ligne de commande indique la mesure, et la commande se termine.

## Options

### Text

Demande le texte à écrire à la place de la mesure, qu'elle propose par défaut : Entrée garde la mesure. Dans ce que vous tapez, `<>` représente la mesure.

### Angle

Demande l'angle du texte, qui est alors dessiné selon cet angle au lieu de suivre la ligne de cote. 0 le remet le long de la ligne.

## Missing

textMult : le texte d'une cote tient sur une ligne, réglé avec <Keyword id="Text" /> à la ligne de commande, jamais dans l'éditeur de texte. Avec un angle réglé par <Keyword id="Angle" />, AutoCAD centre le texte sur la ligne de cote ; ici, il reste au-dessus, comme sans angle. Une cote n'est pas associative : elle ne suit pas l'objet qu'elle mesure.

## Questions

### Comment s'appelle la commande DIMALIGNED en français ?

COTALI, raccourci `COTA`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMALIGNED`.

### Quelle est la différence entre COTLIN et COTALI ?

Sur un côté incliné, <Command id="DIMLINEAR" /> donne sa largeur ou sa hauteur, selon que sa ligne de cote est horizontale ou verticale ; COTALI donne sa longueur, avec la ligne parallèle au côté. Sur un côté selon X ou Y, les deux donnent le même nombre.

### Comment coter une ligne inclinée dans AutoCAD ?

Avec COTALI : appuyez sur Entrée à la première invite, désignez la ligne et placez la cote du côté voulu. Ou désignez ses deux extrémités, avec l'accrochage aux objets Extrémité pour que les origines soient exactes.

### Comment écrire mon propre texte sur une cote ?

Choisissez <Keyword id="Text" /> avant de la placer et tapez le texte : `<>` représente la mesure, si bien que `<> mm` l'écrit suivie de son unité, et Entrée sans rien taper garde la mesure seule. Une fois la cote placée, la ligne Remplacement du texte de la palette Propriétés le modifie.
