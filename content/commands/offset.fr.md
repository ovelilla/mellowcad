---
title: "Commande DECALER (OFFSET) dans AutoCAD"
description: "Comment fonctionne DECALER (OFFSET, alias DC) d'AutoCAD en français, invite par invite : distance ou Par, Effacer et Calque, un objet à la fois. Essayez-le."
figure: "Un rectangle décalé de 6 vers l'intérieur et un cercle décalé de 6 vers l'extérieur, chacun sélectionné, puis son côté."
sourceHash: "b495af1e1410"
---

DECALER (OFFSET) dessine une copie parallèle d'un objet, à une distance que vous tapez ou par un point que vous cliquez : une ligne donne une ligne parallèle, un cercle ou un arc un cercle ou un arc concentrique, une polyligne un contour à l'intérieur ou à l'extérieur, une ellipse ou une spline une spline qui la suit. Comme dans AutoCAD, elle prend un objet à la fois : vous donnez la distance une fois, puis vous sélectionnez un objet et le côté où placer sa copie, autant de fois que vous voulez. Entrée la termine.

## Options

### Through

Au lieu d'une distance, chaque copie passe par un point que vous cliquez ou tapez. C'est l'option par défaut de la première invite : Entrée la choisit tant qu'aucune distance n'a été donnée ; ensuite, Entrée répète la dernière distance, dans ce dessin.

### Erase

Demande s'il faut effacer chaque objet source une fois décalé, <Keyword id="Yes" /> ou <Keyword id="No" /> (par défaut). Avec <Keyword id="Yes" />, la copie remplace l'objet. Le choix est gardé pour le reste de la session, et la prochaine commande DECALER l'indique dans sa première ligne.

### Layer

Demande où vont les copies : sur le calque <Keyword id="Current" />, ou sur celui de l'objet <Keyword id="Source" /> (par défaut). Ce choix est gardé pour la session, lui aussi.

### Exit

Termine la commande, comme Entrée à l'invite de l'objet.

### Multiple

À l'invite du côté : continue à décaler le même objet sans le sélectionner de nouveau, chaque copie une distance plus loin que la précédente, jusqu'à Entrée ou <Keyword id="Exit" />.

### Undo

Annule la dernière copie, quel que soit l'objet dont elle vient, et redemande un objet. Quand il n'y a plus de copie à annuler, elle le dit.

## Missing

OFFSETGAPTYPE 1 et 2 : les coins d'une polyligne décalée sont toujours fermés comme avec 0, les segments prolongés jusqu'à se rejoindre. Le décalage d'une spline ou d'une ellipse reste dans la tolérance d'AutoCAD, mais ses noeuds tombent là où MellowCAD les place, pas là où AutoCAD les place. L'option <Keyword id="Through" /> sur une spline affiche X et Y dans son info-bulle, pas la distance.

## Questions

### Comment s'appelle la commande OFFSET en français ?

DECALER, avec l'alias `DC`, puis Entrée ou la barre d'espace ; l'alias anglais `O` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_OFFSET`.

### Pourquoi la commande décaler ne fonctionne pas ?

DECALER décale les lignes, arcs, cercles, polylignes 2D, ellipses et splines. Elle refuse les textes, textes multilignes, références de bloc, cotes et hachures avec <Message id="cannotOffsetObject" />, et fait de même quand la distance réduirait à rien un cercle, un arc ou une polyligne. Un objet sur un calque verrouillé ne peut pas être sélectionné, et une polyligne 3D est ignorée.

### Comment décaler plusieurs fois la même ligne ?

Sélectionnez la ligne, puis tapez la lettre de <Keyword id="Multiple" /> à l'invite du côté : chaque clic de ce côté fait une copie de plus, chacune une distance plus loin que la précédente. Ou gardez l'option par défaut et sélectionnez chaque fois la copie la plus récente.

### Comment mettre les copies décalées sur le calque courant ?

Choisissez <Keyword id="Layer" /> à la première invite, puis <Keyword id="Current" />. Dès lors, chaque copie va sur le calque courant, jusqu'à ce que vous choisissiez de nouveau <Keyword id="Source" />.
