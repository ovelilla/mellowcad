---
title: "Commande AJUSTER (TRIM) dans AutoCAD"
description: "Comment fonctionne AJUSTER (TRIM, alias AJ) d'AutoCAD en français, invite par invite : modes Rapide et Standard, arêtes de coupe, trajet et capture. Essayez-le."
figure: "Une ligne ajustée aux deux lignes qui la croisent : chaque extrémité désignée une fois, en mode Rapide."
sourceHash: "fcbf44618cf3"
---

AJUSTER (TRIM) coupe un objet là où d'autres objets le croisent : vous désignez le morceau à enlever, et il disparaît jusqu'au croisement le plus proche de chaque côté. La commande démarre en mode Rapide, comme celle d'AutoCAD : tous les objets sont des arêtes de coupe, et un objet que rien ne croise est supprimé en entier. Maintenir Maj enfoncée en désignant prolonge plutôt l'objet jusqu'à l'arête la plus proche, comme le fait <Command id="EXTEND" />. Chaque désignation est une étape qu'Annuler défait ; Entrée termine la commande.

## Options

### cuTting

Choisit les objets qui coupent : sélectionnez-les, ou appuyez sur Entrée pour prendre tous les objets. Dès lors, seuls ceux-là coupent, quel que soit le mode, jusqu'à la fin de la commande.

### Fence

Demande les points d'une ligne, autant que vous voulez jusqu'à Entrée : chaque objet qu'elle croise est ajusté là où elle le croise, en une seule étape. Le mode Standard la propose ; le mode Rapide l'accepte aussi, et un clic dans le vide y commence de lui-même un trajet de deux points.

### Crossing

Demande les deux coins d'une fenêtre : tout ce que son contour croise est ajusté, en une seule étape. Un objet entièrement à l'intérieur de la fenêtre n'est pas croisé par elle.

### mOde

Bascule entre <Keyword id="Quick" /> et <Keyword id="Standard" />. En mode Standard, AJUSTER demande d'abord les arêtes de coupe (Entrée les prend toutes), laisse un objet qu'aucune arête ne croise avec <Message id="doesNotIntersectCuttingEdge" />, propose Trajet et Arête, et un clic dans le vide commence une fenêtre de capture. Le mode est commun à AJUSTER et à PROLONGER, et dure toute la session.

### Edge

En mode Standard seulement. Avec <Keyword id="Extend" />, une arête coupe aussi là où elle croiserait si elle était prolongée : une ligne dans les deux sens, un arc sur tout son cercle ; <Keyword id="No extend" /> est l'option par défaut.

### eRase

Efface des objets sans quitter la commande : sélectionnez-les, puis Entrée les efface, en une étape d'AJUSTER qu'Annuler peut défaire.

### Undo

Proposée dès que l'invite a reçu une réponse (une désignation, un trajet, une fenêtre) : défait le dernier ajustement, et le dit quand il n'y a plus rien à défaire.

## Missing

Projection : l'option de projection d'AutoCAD (Aucune, Scu, Vue) n'est pas proposée, et tout est calculé en projection sur le plan XY du SCU, ce qui est l'option par défaut d'AutoCAD, Scu. Un trajet ne peut pas encore être tiré avec le curseur, seulement désigné point par point. Le mode d'ajustement et le choix d'Arête durent la session, là où AutoCAD les garde d'une session à l'autre. Un objet incliné par rapport au SCU, sauf une spline, ne coupe pas et n'est pas ajusté.

## Questions

### Comment s'appelle la commande TRIM en français ?

AJUSTER, avec l'alias `AJ` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_TRIM`.

### Pourquoi AJUSTER supprime toute la ligne ?

Parce qu'AJUSTER est en mode Rapide, le mode par défaut d'AutoCAD depuis sa version 2021 : désigner un objet qu'aucune arête ne croise le supprime. Choisissez <Keyword id="mOde" /> puis <Keyword id="Standard" /> pour qu'AJUSTER le laisse et le dise.

### Comment ajuster plusieurs lignes à la fois ?

Cliquez dans un endroit vide et désignez un second point : chaque objet que ce trajet croise est ajusté en une seule étape. Ou choisissez <Keyword id="Crossing" /> et tracez une fenêtre sur les morceaux à enlever.

### Comment prolonger une ligne avec AJUSTER ?

Maintenez Maj enfoncée en désignant la ligne près de l'extrémité à prolonger : elle s'allonge jusqu'à l'arête la plus proche, comme avec <Command id="EXTEND" />, et la désignation suivante sans Maj ajuste de nouveau.
