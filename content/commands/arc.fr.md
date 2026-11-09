---
title: "Commande ARC dans AutoCAD"
description: "Comment fonctionne ARC (alias A) d'AutoCAD en français, invite par invite : trois points ou un centre, et Ctrl pour le sens horaire. Essayez-le gratuitement."
figure: "Trois arcs : par trois points, d'un départ autour d'un Centre jusqu'à une fin, et à partir d'un Centre, son départ, puis sa fin."
sourceHash: "af9b22e35456"
---

La commande ARC dessine par défaut un arc passant par trois points : son départ, un point par lequel il passe et sa fin. Elle peut aussi en dessiner un autour d'un centre, d'un point de départ à une fin, comme le font les boutons Départ, centre, fin et Centre, départ, fin du ruban. Comme dans AutoCAD, un arc défini par son centre va dans le sens inverse des aiguilles d'une montre depuis son départ, et l'extrémité indique seulement où il s'arrête : elle n'a pas besoin d'être sur l'arc. Pendant que vous placez les points, l'arc suit le curseur, avec une ligne en pointillés ambre depuis le départ ou le centre. L'arc se trouve dans le plan de son premier point. Un arc impossible, trois points alignés ou une extrémité sur le départ, affiche <Message id="invalid" /> et rien n'est dessiné.

## Options

### Center

À la première invite : donnez d'abord le centre, puis le point de départ et l'extrémité. À la deuxième invite, après le départ : le centre vient ensuite, puis l'extrémité. À la fin de l'une ou l'autre méthode, maintenez Ctrl enfoncée pour que l'arc aille dans le sens des aiguilles d'une montre.

## Missing

Les options qui terminent un arc par son angle, la longueur de sa corde, une direction ou un rayon au lieu d'une extrémité, et pt Final au deuxième point, qui y mène ; les boutons du ruban pour ces méthodes manquent aussi. Continuer : Entrée à la première invite, qui dans AutoCAD dessine un arc tangent à la dernière ligne ou au dernier arc, termine ARC ici. La zone de l'angle décrit que la saisie dynamique affiche à la fin d'une méthode par le centre.

## Questions

### Quel est le raccourci de la commande ARC dans AutoCAD ?

`A`, puis Entrée ou la barre d'espace. Le nom complet fonctionne aussi, ARC en français comme en anglais, et `_ARC` dans toutes les langues d'AutoCAD.

### Comment dessiner un arc par trois points dans AutoCAD ?

Lancez ARC et donnez trois points : le départ, un point quelconque par lequel passe l'arc, et la fin. C'est la méthode par défaut, sans option à choisir.

### Pourquoi mon arc est-il dans le mauvais sens ?

Un arc dessiné par son centre va dans le sens inverse des aiguilles d'une montre depuis son départ, comme dans AutoCAD. Inversez le départ et la fin, ou maintenez Ctrl enfoncée en donnant l'extrémité pour qu'il aille dans le sens des aiguilles d'une montre.

### Comment dessiner un arc tangent à deux lignes ?

Utilisez <Command id="FILLET" /> avec un rayon : la commande dessine l'arc tangent aux deux lignes et ajuste celles-ci jusqu'à lui. Pour un arc tangent au segment qui le précède, dessinez-le dans une polyligne, avec l'option arc de <Command id="PLINE" />.
