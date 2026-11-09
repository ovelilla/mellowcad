---
title: "Commande POLYLIGNE (PLINE) dans AutoCAD"
description: "Comment fonctionne POLYLIGNE (PLINE, alias PO) d'AutoCAD en français, invite par invite : lignes et arcs, Largeur et Demi-larg, Longueur, Clore. Essayez-le."
figure: "Une ligne, un arc tangent et une ligne de retour, puis une pointe de largeur 10 effilée jusqu'à 0 : une seule polyligne."
sourceHash: "216b83656483"
---

POLYLIGNE (PLINE) dessine une polyligne : un seul objet fait de segments droits et d'arcs reliés bout à bout, chacun avec une largeur. Après le point de départ, elle indique la largeur courante ; chaque point ajoute ensuite un segment, jusqu'à ce qu'Entrée ou <Keyword id="Close" /> la termine. Comme dans AutoCAD, elle commence par des lignes : <Keyword id="Arc" /> passe aux arcs, chacun tangent au segment précédent, et <Keyword id="Line" /> revient aux lignes. Entrée au point de départ repart de l'extrémité de la dernière ligne, du dernier arc ou de la dernière polyligne dessinés.

## Options

### Arc

Mode arc : chaque extrémité dessine un arc tangent au dernier segment ou, pour le premier segment, qui part dans la direction où se termine la dernière ligne, le dernier arc ou la dernière polyligne dessinés. Maintenez Ctrl enfoncée pour changer son sens. Les options ci-dessous façonnent l'arc suivant.

### Close

Proposée dès qu'il y a un segment : ferme la polyligne jusqu'à son départ et termine la commande ; en mode arc, par un arc tangent.

### Halfwidth

Comme <Keyword id="Width" />, mais chaque largeur se mesure du milieu du segment à son bord.

### Length

Une ligne de la longueur que vous donnez, dans la direction de la polyligne : le long du dernier segment, ou tangente au dernier arc. Une longueur négative revient en arrière.

### Undo

Annule le dernier segment et continue dans le mode du précédent. Quand il n'en reste aucun, elle dit <Message id="allSegmentsUndone" />

### Width

La largeur de départ, puis la largeur de fin, chacune tapée ou cliquée depuis le dernier sommet : de 10 à 0, le segment s'effile en pointe, comme une flèche. La largeur de fin se poursuit sur les segments suivants et, comme PLINEWID, sur la POLYLIGNE suivante.

### Angle

Mode arc : l'angle décrit de l'arc, puis son extrémité, son centre ou son rayon.

### Center

Mode arc : le centre de l'arc, puis son extrémité, son angle décrit ou la longueur de sa corde.

### Direction

Mode arc : la direction dans laquelle l'arc quitte le dernier sommet, à la place de la tangente, puis son extrémité.

### Line

Mode arc : retour aux segments droits.

### Radius

Mode arc : le rayon de l'arc, puis son extrémité ou son angle décrit. Un rayon négatif dessine le grand arc.

### Second pt

Mode arc : un point par lequel passe l'arc, puis son extrémité : un arc par trois points.

## Missing

PLINEGEN : une nouvelle polyligne pose son type de ligne segment par segment, comme avec PLINEGEN 0 (l'option <Keyword command="PEDIT" id="Ltype gen" /> de <Command id="PEDIT" /> l'active pour une polyligne). Un type de ligne discontinu sur un segment large est dessiné continu. L'aperçu d'un segment large n'est pas dessiné dans une teinte plus pâle, et l'invite de l'arc s'écrit sur une ligne là où AutoCAD la coupe en deux.

## Questions

### Comment s'appelle la commande PLINE en français ?

POLYLIGNE, avec les alias `PO` et `POLYLIGN`, puis Entrée ou la barre d'espace ; dans AutoCAD en français, `PL` lance <Command id="LAYER" />. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_PLINE`.

### Comment dessiner une polyligne courbe ?

Choisissez <Keyword id="Arc" /> : chaque point termine alors un arc tangent au segment précédent, jusqu'à <Keyword id="Line" />. Pour lisser par ses sommets une polyligne déjà dessinée, utilisez <Command id="PEDIT" /> et son option <Keyword command="PEDIT" id="Fit" /> ou <Keyword command="PEDIT" id="Spline" />.

### Pourquoi ma polyligne est dessinée épaisse ?

Une largeur donnée dans une POLYLIGNE précédente est gardée, et la polyligne suivante commence avec elle, comme le dit la ligne qui suit son point de départ. Choisissez <Keyword id="Width" /> et donnez 0 deux fois pour dessiner fin de nouveau. Avec <Command id="FILL" /> désactivé, les polylignes larges s'affichent en contour.

### Comment joindre des lignes en une polyligne ?

Lancez <Command id="JOIN" /> et sélectionnez des lignes, arcs et polylignes qui se touchent bout à bout : chaque chaîne devient une polyligne. Ou lancez <Command id="PEDIT" /> sur une ligne, répondez <Keyword command="PEDIT" id="Yes" /> pour la transformer en polyligne, et ajoutez les autres avec <Keyword command="PEDIT" id="Join" />.

### Comment connaître l'aire ou la longueur d'une polyligne ?

Lancez <Command id="AREA" />, appuyez sur Entrée pour <Keyword command="AREA" id="Object" /> et sélectionnez la polyligne : une polyligne fermée donne son aire et son périmètre, une ouverte sa longueur.
