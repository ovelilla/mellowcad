---
title: "Commande COTRAYON (DIMRADIUS) dans AutoCAD"
description: "Cote de rayon dans AutoCAD en français : COTRAYON (DIMRADIUS, alias COTY) cote un cercle, un arc ou un raccord, le texte R dedans ou dehors. Essayez-le."
figure: "Le coin arrondi d'une plaque coté à l'extérieur et son trou à l'intérieur : chaque courbe désignée, puis le texte placé."
sourceHash: "6b1cdea584be"
---

COTRAYON (DIMRADIUS en anglais) cote le rayon d'un cercle, d'un arc ou d'un segment d'arc de polyligne. Désignez la courbe, et la ligne de commande indique aussitôt la mesure ; placez ensuite la cote, et la commande se termine. Comme dans AutoCAD, son texte est le rayon précédé d'un R, sur une ligne qui suit un rayon et se termine par une flèche sur la courbe, à l'intérieur ou à l'extérieur de la courbe selon l'endroit où vous la placez. À l'extérieur, la ligne continue à travers la courbe jusqu'au centre, comme ISO-25 la dessine.

## Options

### Text

Demande le texte à écrire à la place de la mesure, qu'elle propose par défaut : Entrée garde la mesure. Dans ce que vous tapez, `<>` représente la mesure avec son R, si bien que `<> TYP` écrit `R10 TYP` pour un rayon de 10.

### Angle

Demande l'angle du texte, qui est alors dessiné selon cet angle, son milieu sur la ligne, et la ligne s'arrête au texte. 0 le remet le long de la ligne.

## Missing

textMult : le texte d'une cote tient sur une ligne, réglé avec <Keyword id="Text" /> à la ligne de commande, jamais dans l'éditeur de texte. Sur un arc, la flèche reste entre ses extrémités, là où AutoCAD dessine une ligne d'attache d'arc jusqu'à une cote placée au-delà. Une courbe à l'intérieur d'une référence de bloc ne peut pas être désignée. Les axes du style (une taille de marque de centre négative) ne sont pas dessinés, et ses réglages du texte hors de la courbe ne sont pas proposés : le texte suit toujours la ligne, sans palier, comme ISO-25 le dessine. Une cote n'est pas associative : elle ne suit pas la courbe qu'elle mesure.

## Questions

### Comment s'appelle la commande DIMRADIUS en français ?

COTRAYON, raccourci `COTY`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_DIMRADIUS`.

### Comment coter un raccord ou un angle arrondi ?

Désignez l'arrondi : un raccord est un arc, ou un segment d'arc de polyligne, comme les coins que <Command id="RECTANG" /> arrondit avec son option <Keyword command="RECTANG" id="Fillet" />, et COTRAYON accepte l'un comme l'autre.

### Pourquoi je ne peux pas sélectionner l'objet à coter ?

COTRAYON accepte un cercle, un arc ou un segment d'arc de polyligne, sur un calque verrouillé aussi. Tout autre objet, une ellipse comprise, affiche <Message id="notCircleOrArc" />, et la question revient ; une courbe à l'intérieur d'une référence de bloc ne peut pas encore être désignée.

### Comment ajouter du texte à une cote de rayon ?

Choisissez <Keyword id="Text" /> avant de la placer et tapez `<> TYP` : `<>` est la mesure avec son R, si bien que la cote affiche `R10 TYP`. Une fois la cote placée, la ligne Remplacement du texte de la palette Propriétés le modifie.
