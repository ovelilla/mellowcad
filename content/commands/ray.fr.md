---
title: "Commande DEMIDROITE (RAY) dans AutoCAD"
metaTitle: "Commande DEMIDROITE (RAY) : ligne à l'infini"
description: "Comment DEMIDROITE (RAY) d'AutoCAD trace des lignes de construction qui partent d'un point vers l'infini, d'un seul côté, et comment les ajuster. Essayez-le."
figure: "Des demi-droites partant d'un même point de départ, par trois points, chacune continuant au-delà du bord de la vue."
sourceHash: "732d6e8c23de"
---

DEMIDROITE (RAY) dessine des demi-droites : des lignes de construction qui partent d'un point et vont à l'infini dans une direction. Cliquez le point de départ, puis un point de passage : la demi-droite part du premier et passe par le second. Chaque point suivant en crée une autre depuis le même départ, jusqu'à ce qu'Entrée termine la commande. Un point de passage sur le départ est refusé avec <Message id="invalid" />. Chaque demi-droite est sur le calque courant avec la couleur, le type de ligne et l'épaisseur de ligne courants.

Une demi-droite traverse la vue quels que soient le panoramique ou le zoom, et l'étendue du dessin la laisse de côté, comme dans AutoCAD. L'accrochage Extrémité trouve son départ ; Le plus proche, Perpendiculaire et Intersection fonctionnent le long de celle-ci. <Command id="TRIM" /> et <Command id="BREAK" /> changent en ligne le tronçon qui contient le départ, et <Command id="EXTEND" /> ramène le départ jusqu'à une arête située derrière lui. <Command id="XLINE" /> dessine des droites qui vont dans les deux sens.

## Missing

MODIFLONG (LENGTHEN) et <Command id="JOIN" /> d'une demi-droite ne sont pas encore vérifiés face à AutoCAD, ni les menus de ses poignées.

## Questions

### Qu'est-ce que la commande DEMIDROITE dans AutoCAD ?

Une ligne de construction avec un départ : elle commence à un point et continue sans fin dans une direction. Servez-vous-en comme repère pour dessiner, puis ajustez-la en ligne ou effacez-la.

### La commande DEMIDROITE a-t-elle un raccourci ?

Non : AutoCAD ne donne aucun alias à DEMIDROITE, tapez donc `DEMIDROITE` en entier. Elle est dans le groupe de fonctions Dessin développé du ruban, et ici dans les outils de Dessin, à côté de Ligne de construction.

### Comment arrêter une demi-droite sur une ligne ?

Ajustez-la : lancez <Command id="TRIM" /> et désignez la partie au-delà de la ligne. Ce qui reste, du départ à la ligne, est un objet ligne.

### Quelle est la différence entre une demi-droite et une ligne ?

Une ligne a deux extrémités ; une demi-droite en a une, son départ, et continue sans fin. Dans un fichier DXF, une demi-droite est enregistrée comme RAY, et s'ouvre comme telle.
