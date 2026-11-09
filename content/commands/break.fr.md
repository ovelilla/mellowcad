---
title: "Commande COUPURE (BREAK) dans AutoCAD"
description: "Couper une ligne dans AutoCAD en français : COUPURE (BREAK, alias CU), entre deux points ou en un point, invite par invite. Essayez-le gratuitement en ligne."
figure: "Une ligne coupée entre deux points donnés avec Premier point, et un cercle coupé depuis l'endroit où il a été désigné, dans le sens inverse des aiguilles d'une montre, jusqu'à un deuxième point."
sourceHash: "f351112ef2fc"
---

COUPURE (BREAK en anglais) retire un tronçon d'un objet, ou le coupe en deux. Sélectionnez l'objet : comme dans AutoCAD, le point où vous l'avez désigné est le premier point de coupure, si bien que l'invite suivante ne demande que le deuxième, et la partie située entre les deux est supprimée. Une ligne, un arc, une polyligne ouverte, un arc elliptique ou une spline perd la partie située entre les points et devient deux objets ; un cercle ou une ellipse perd la partie qui va du premier point au deuxième dans le sens inverse des aiguilles d'une montre, et une polyligne fermée la partie située entre eux dans l'ordre de ses sommets : chacun devient un seul objet ouvert. Un point hors de l'objet est pris à son point le plus proche, et un point au-delà d'une extrémité coupe jusqu'à cette extrémité. Pendant que vous donnez le deuxième point, la partie que COUPURE conserverait est affichée par-dessus l'objet. La coupure forme une seule étape d'annulation.

## Options

### First point

Au deuxième point de coupure : donnez de nouveau le premier point, puis le deuxième, quand l'endroit où vous avez désigné l'objet n'est pas celui où commence l'espace à retirer.

## Missing

Un arc, un cercle ou une ellipse qui ne se trouve pas à plat dans le SCU, qu'AutoCAD coupe et que MellowCAD ne trouve pas. Une ellipse entière que <Command id="MIRROR" /> a retournée, qu'AutoCAD coupe dans l'autre sens.

## Questions

### Comment s'appelle la commande BREAK en français ?

COUPURE, raccourci `CU`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_BREAK`.

### Comment couper une ligne en un point ?

Lancez <Command id="BREAKATPOINT" />, sélectionnez la ligne et donnez le point : elle devient deux lignes qui se touchent à cet endroit. Dans COUPURE, tapez `@` au deuxième point de coupure pour obtenir la même chose.

### Comment couper une ligne entre deux points ?

Sélectionnez la ligne, choisissez <Keyword id="First point" />, puis donnez le premier et le deuxième point : la partie située entre eux est supprimée. Ou désignez la ligne au premier point, et donnez seulement le deuxième.

### Pourquoi je ne peux pas couper un bloc ou un texte ?

COUPURE coupe les lignes, les arcs, les cercles, les polylignes, les ellipses et les splines. Une référence de bloc affiche <Message id="cannotBreakBlock" />, et un texte, une cote ou des hachures <Message id="objectCannotBeBroken" /> ; décomposez d'abord un bloc avec <Command id="EXPLODE" /> pour couper ses morceaux.

### Dans quel sens COUPURE coupe-t-elle un cercle ?

Dans le sens inverse des aiguilles d'une montre, du premier point au deuxième, comme dans AutoCAD. Donnez les points dans l'autre ordre pour garder l'autre partie.
