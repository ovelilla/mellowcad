---
title: "Commande ESPACECOTES (DIMSPACE) dans AutoCAD"
description: "Aligner et espacer des cotes dans AutoCAD en français : ESPACECOTES (DIMSPACE), espacement égal ou 0 pour les aligner, et Auto. Essayez-le gratuitement."
before: "Le bord supérieur d'une plaque coté par une chaîne de trois cotes, chacune placée à sa propre hauteur, telles qu'elles ont été dessinées."
figure: "ESPACECOTES à partir de la première cote, les deux autres sélectionnées et l'espacement 0 : la chaîne alignée sur une seule ligne."
sourceHash: "7ec7c0eb9883"
---

ESPACECOTES (DIMSPACE en anglais) ajuste l'espace entre des cotes linéaires et alignées parallèles. Vous sélectionnez la cote de base, qui reste où elle est, puis les cotes à espacer ; Entrée termine la sélection et demande l'espacement. La ligne de chaque cote est alors déplacée, en s'éloignant de la base dans l'ordre où les cotes se trouvent, à cette distance de la précédente. Un espacement de 0 les aligne toutes sur la ligne de la base : une chaîne échelonnée telle qu'elle a été dessinée se lit comme une seule. La commande ne change que la position des lignes de cote, en une seule étape que <Command id="U" /> annule.

La base est désignée, tapée sous forme de point ou prise avec `Dernier` ; un objet qui n'est pas une cote affiche <Message id="selectedObjectNotDimension" />, et la question revient. Un jeu sélectionné avant la commande est le jeu à espacer. Une cote inclinée par rapport à la base est comptée et laissée où elle est, et un espacement négatif est refusé avec <Message id="negativeSpacing" />.

## Options

### Auto

La valeur par défaut, par Entrée : un espacement de deux fois la hauteur du texte du style de cote de la base, multiplié par son échelle générale, pour que la pile tienne avec son propre texte.

## Missing

Les cotes angulaires, qu'ESPACECOTES n'espace pas encore. AutoCAD ne déplace une cote que là où c'est nécessaire ; ici, chaque cote sélectionnée est espacée de nouveau.

## Questions

### Comment aligner des cotes dans AutoCAD ?

Lancez ESPACECOTES, désignez la cote sur laquelle les autres doivent s'aligner, sélectionnez-les, appuyez sur Entrée et tapez `0` : chaque ligne de cote vient sur celle de la base.

### Comment rendre l'espacement entre les cotes égal ?

Lancez ESPACECOTES, désignez comme base la cote la plus proche de l'objet, sélectionnez les autres et appuyez deux fois sur Entrée : <Keyword id="Auto" /> les espace de deux fois la hauteur du texte. Ou tapez la distance voulue, par exemple `8`.

### Quel est l'espacement des cotes par défaut dans AutoCAD ?

L'option <Keyword id="Auto" /> d'ESPACECOTES vaut deux fois la hauteur du texte du style de cote. <Command id="DIMBASELINE" /> utilise à la place l'espacement des lignes de base du style, 3.75 dans ISO-25, pour chaque cote qu'elle ajoute.

### Pourquoi ESPACECOTES ne déplace pas une cote ?

Elle n'espace que les cotes parallèles à la base : une cote sous un autre angle est comptée et laissée où elle est. Les cotes angulaires ne sont pas encore espacées.
