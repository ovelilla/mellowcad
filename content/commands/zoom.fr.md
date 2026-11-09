---
title: "Commande ZOOM dans AutoCAD"
description: "Comment fonctionne ZOOM (Z) d'AutoCAD en français : Etendu, Fenêtre, Précédent, Echelle avec nX, Objet et Tout, la molette de la souris, le zoom transparent."
figure: "Une plaque avec un petit trou près de son coin : ZOOM Etendu, puis une fenêtre autour du trou, qui remplit alors la vue."
sourceHash: "cd72af4956e4"
---

ZOOM agrandit ou réduit la vue ; rien ne bouge ni ne change de taille dans le dessin. Sa première invite accepte un coin, qui commence une fenêtre, un facteur d'échelle, ou une option. Tapée avec une apostrophe, `'ZOOM` ou `'Z`, la commande fonctionne à l'intérieur d'une autre commande, qui reprend ensuite. La molette de la souris fait un zoom avant ou arrière autour du curseur, et un double-clic sur le bouton de la molette fait un ZOOM Etendu. Chaque ZOOM est une étape d'annulation, des ZOOM consécutifs une seule, si bien que <Command id="U" /> défait aussi la vue.

## Options

### All

Cadre tout ce qui est dessiné, comme <Keyword id="Extents" />.

### Extents

Cadre tout ce qui est dessiné, aussi grand que la fenêtre le permet. Sans rien de dessiné, il affiche <Message id="regeneratingModel" />, et tapé à l'intérieur d'une autre commande, il refuse avec <Message id="requiresRegen" />, comme celui d'AutoCAD.

### Previous

Revient à la vue précédente, jusqu'à 20 vues en arrière. Quand il n'en reste plus : <Message id="noPreviousView" />.

### Scale

Un facteur : `2X` zoome deux fois plus près que la vue courante, `0.5X` deux fois moins près, et `2` sans le X au double de l'échelle de la vue de ZOOM Tout. `nXP`, le facteur de l'espace papier, est lu comme `nX` : il n'y a ici que l'espace objet. Un facteur tapé à la première invite fait de même sans choisir l'option.

### Window

Deux coins, désignés ou tirés, cadrent ce rectangle. Un coin désigné à la première invite fait de même.

### Object

Cadre les objets que vous sélectionnez, ou ceux sélectionnés avant ZOOM.

## Missing

Temps réel : Entrée à la première invite termine ZOOM, là où AutoCAD commence un zoom à la souris ; ici, c'est la molette qui le fait. DYnamique, Centre, et les options cachées Gauche et FMax.

## Questions

### Quel est le raccourci de ZOOM dans AutoCAD ?

`Z`, puis Entrée ou la barre d'espace. La commande porte le même nom dans AutoCAD en français, et `_ZOOM` fonctionne quelle que soit la langue. `Z` puis `ET` donne le ZOOM Etendu.

### Comment faire un zoom sur tout le dessin ?

<Keyword id="Extents" /> : tapez `Z`, Entrée, `ET`, Entrée. Ou double-cliquez sur le bouton de la molette.

### Que signifie ZOOM XP dans AutoCAD ?

`nXP` zoome une fenêtre de présentation à une échelle relative à l'espace papier : `1/50XP` montre le modèle à 1:50 sur la feuille. MellowCAD n'a pas de présentations, donc `XP` est lu comme `X`.

### Comment zoomer sur un objet dans AutoCAD ?

Choisissez <Keyword id="Object" /> et sélectionnez-le, ou sélectionnez-le d'abord, puis lancez ZOOM Objet : la vue le cadre.

### Comment revenir à la vue précédente ?

<Keyword id="Previous" />, encore et encore pour les vues d'avant, jusqu'à 20.
