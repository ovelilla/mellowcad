---
title: "Commande DROITE (XLINE) dans AutoCAD"
metaTitle: "Commande DROITE (XLINE) : ligne de construction"
description: "Tracer des lignes de construction infinies avec DROITE (XLINE, alias DO) d'AutoCAD : par deux points, horizontales, verticales, bissectrices. Essayez-le."
figure: "Des droites par un point, une horizontale et la bissectrice de l'angle entre deux lignes, chacune traversant toute la vue."
sourceHash: "5b81d2c75993"
---

DROITE (XLINE) dessine des lignes de construction : des droites de longueur infinie, qui traversent toute la vue quels que soient le panoramique ou le zoom, pour mettre en place un dessin avant que les vraies lignes n'arrivent. Cliquez un point, puis un point de passage : la droite passe par les deux, et chaque point suivant en crée une autre par le premier, jusqu'à ce qu'Entrée termine la commande. Un point de passage sur le premier point est refusé avec <Message id="invalid" />. Chaque droite est sur le calque courant avec la couleur, le type de ligne et l'épaisseur de ligne courants.

Une droite n'a pas d'extrémités : un zoom sur l'étendue du dessin la laisse de côté, comme dans AutoCAD. L'accrochage Milieu trouve le point par lequel elle a été tracée ; Le plus proche, Perpendiculaire et Intersection fonctionnent le long de celle-ci, et <Command id="TRIM" /> ou <Command id="BREAK" /> la changent en demi-droite, ou en deux, et c'est ainsi que les lignes de construction deviennent des lignes du dessin. <Command id="RAY" /> dessine la moitié qui part d'un point.

## Options

### Hor

Des droites horizontales, le long de l'axe X du SCU, chacune par un point que vous donnez, jusqu'à Entrée.

### Ver

Des droites verticales, le long de l'axe Y du SCU, chacune par un point que vous donnez.

### Ang

Des droites inclinées : tapez l'angle, ou donnez deux points, puis les points de passage. Entrée à l'angle prend 0. <Keyword id="Reference" /> mesure l'angle depuis une ligne que vous sélectionnez, une ligne, une droite ou une demi-droite, dans le sens inverse des aiguilles d'une montre : tout autre objet est refusé avec <Message id="noUsableObjectSelected" />.

### Bisect

La droite qui coupe un angle en deux : donnez son sommet, un point sur son premier côté, puis un point sur son second côté, et la bissectrice passe par le sommet. Chaque point suivant sur le second côté crée une autre bissectrice du même premier côté.

### Offset

Des droites parallèles à un objet linéaire, une ligne, une droite ou une demi-droite : donnez la distance, sélectionnez l'objet et cliquez le côté, encore et encore jusqu'à Entrée. <Keyword id="Through" /> fait plutôt passer chacune par un point que vous donnez. La distance est celle que <Command id="OFFSET" /> mémorise, et celle qu'elle propose ensuite.

## Missing

MODIFLONG (LENGTHEN) et <Command id="JOIN" /> d'une droite ne sont pas encore vérifiés face à AutoCAD, ni les menus de ses poignées.

## Questions

### Comment s'appelle la commande XLINE en français ?

DROITE, avec l'alias `DO`, puis Entrée ou la barre d'espace. Le ruban l'appelle Ligne de construction, dans le groupe de fonctions Dessin développé ; ici, elle est dans les outils de Dessin, à côté de Demi-droite.

### Comment tracer une ligne de construction horizontale ou verticale ?

Lancez DROITE, tapez la lettre de <Keyword id="Hor" /> ou celle de <Keyword id="Ver" />, puis cliquez les points par lesquels elle passe. L'horizontale et la verticale sont celles du SCU courant.

### Comment ajuster une droite ?

Avec <Command id="TRIM" />, comme n'importe quelle ligne : coupée d'un côté, une droite devient une demi-droite ; coupée des deux, une ligne. Il en va de même avec <Command id="BREAK" />.

### Pourquoi le ZOOM Etendu ignore-t-il mes droites ?

Une droite n'a pas d'étendue : elle va à l'infini dans les deux sens. AutoCAD laisse les droites et les demi-droites hors de l'étendue du dessin, et MellowCAD aussi.

### Quelle est la différence entre DROITE et DEMIDROITE ?

Une droite va à l'infini dans les deux sens ; une demi-droite, celle de <Command id="RAY" />, part d'un point et ne va que dans un sens.
