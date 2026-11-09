---
title: "Commande -ACCROBJ (-OSNAP) dans AutoCAD"
description: "L'accrochage aux objets d'AutoCAD en français : -ACCROBJ (-OSNAP) fixe les modes, F3 l'active, MIL ou Maj + clic droit en force un. Essayez-le gratuitement."
figure: "-ACCROBJ définit Milieu et Centre comme accrochages actifs ; LIGNE va ensuite du milieu d'un côté au centre du cercle, et le côté du haut montre son marqueur Milieu."
sourceHash: "acf7c6b99589"
---

Les accrochages aux objets placent un point désigné exactement sur un point d'un objet : une extrémité, un milieu, un centre. Avec l'accrochage aux objets activé, le curseur près d'un tel point affiche son marqueur, en vert, et son nom dans une info-bulle ; un clic tombe alors sur ce point, et non là où se trouve le curseur. Les accrochages aux objets actifs sont les modes à l'œuvre à chaque invite de point : au départ Extrémité, Centre, Intersection et Extension, comme dans AutoCAD. F3 active et désactive l'accrochage aux objets en écrivant `<Accrobj actif>` ou `<Accrobj inactif>`, tout comme le bouton Accrochage aux objets de la barre d'état, dont le menu a une case à cocher pour chaque mode. Avec plusieurs accrochages sous le curseur, le plus proche l'emporte, et Tab parcourt les autres. Le mode ortho, le repérage polaire et le mode Résolution ne dévient jamais un point accroché.

-ACCROBJ (-OSNAP en anglais) définit les accrochages actifs à la ligne de commande. Elle affiche les modes actifs, puis demande une liste de modes : chacun par ses majuscules, séparés par des virgules, comme `MIL,CEN,INT`, ou `_END,_MID` dans toutes les langues d'AutoCAD. La liste remplace les accrochages actifs et active l'accrochage aux objets ; <Keyword id="NONe" />, <Keyword id="OFF" /> ou Entrée seule les effacent tous. Un mode qu'elle ne connaît pas affiche <Message id="invalidOsnapModes" />, et la question revient. Tapée avec une apostrophe devant, `'-ACCROBJ`, elle fonctionne à l'intérieur d'une autre commande. Les accrochages actifs durent jusqu'au rechargement de la page, puis redeviennent les quatre d'AutoCAD : comme dans AutoCAD, le dessin ne les conserve pas.

Pour un seul point, utilisez un remplacement d'accrochage aux objets : tapez les majuscules d'un mode à une invite de point, `MIL` ou `_MID`, ou maintenez Maj enfoncée et faites un clic droit pour le choisir dans un menu. Seul cet accrochage est recherché, quels que soient les accrochages actifs, et pour ce point uniquement ; s'il ne trouve rien, le point est refusé et redemandé. Tapé par ses majuscules, <Keyword id="NONe" /> désactive l'accrochage pour un seul point. Le même menu propose <Command id="FROM" /> : un point de base, puis un décalage à partir de celui-ci, si bien que `@10,0` se trouve à 10 à sa droite.

## Options

### ENDpoint

L'extrémité la plus proche d'une ligne, d'un arc, d'un segment de polyligne, d'un arc elliptique ou d'une spline : les coins d'un rectangle, les sommets d'un polygone. Son marqueur est un carré.

### MIDpoint

Le milieu d'une ligne, d'un arc, d'un segment de polyligne, d'un arc elliptique ou d'une spline. Un triangle.

### CENter

Le centre d'un cercle, d'un arc ou d'un arc de polyligne. Passez le curseur sur la courbe elle-même : au centre, il n'y a rien à accrocher. Un cercle.

### QUAdrant

Les points d'un cercle ou d'un arc à 0°, 90°, 180° et 270°, selon les axes X et Y du SCU, et les extrémités des axes d'une ellipse. Un losange.

### INTersection

Là où deux objets se croisent, ou là où un chemin d'alignement du repérage polaire croise un objet. Une croix.

### EXTension

Au-delà de l'extrémité d'une ligne, d'un arc ou d'un segment droit de polyligne : passez le curseur sur l'extrémité, puis éloignez-vous dans le prolongement de l'objet. Un chemin en pointillés part de l'extrémité, et une distance tapée se mesure le long de celui-ci. Un signe plus.

### INSertion

Le point d'insertion d'un texte, d'une définition d'attribut ou d'une référence de bloc.

### PERpendicular

Le pied de la perpendiculaire menée du dernier point à une ligne, au-delà de ses extrémités aussi, à un cercle, à un arc ou à un segment de polyligne. Au premier point de <Command id="LINE" />, il attend le point suivant : la ligne part perpendiculaire à l'objet. Un angle droit.

### TANgent

Le point d'un cercle ou d'un arc où le touche une ligne menée du dernier point. Au premier point de <Command id="LINE" />, il attend le point suivant : la ligne part tangente à la courbe. Un cercle avec une barre.

### NEArest

Le point d'un objet le plus proche du curseur. Un sablier.

### APParent

Intersection projetée : là où deux objets se croisent dans la vue, bien qu'ils soient à des hauteurs différentes ; là où ils se rencontrent vraiment, c'est leur intersection.

### PARallel

Maintenez un instant le curseur sur une ligne, puis déplacez-vous dans sa direction à partir du dernier point : un chemin parallèle à la ligne retient le point suivant.

### NONe

Aucun accrochage actif : l'accrochage aux objets ne trouve rien tant qu'un mode n'est pas de nouveau défini.

### OFF

Comme <Keyword id="NONe" /> : les accrochages actifs sont effacés.

## Missing

La boîte de dialogue Paramètres de dessin qu'ouvrent ACCROBJ et AC dans AutoCAD (OSNAP et OS en anglais) : ici, ce sont des commandes inconnues, et le menu de la barre d'état définit les modes. Noeud et Centre géométrique, comme modes et dans les menus. Milieu entre 2 points, le point de repérage temporaire et les touches maintenues enfoncées pour un accrochage d'un seul point (Maj + A, Maj + Q…). Intersection, Perpendiculaire et Tangente sur les ellipses, Perpendiculaire et Tangente sur les splines, et Extension depuis l'extrémité d'un arc de polyligne, ou avec sa distance et son angle dans l'info-bulle. Une Perpendiculaire ou une Tangente qui attend l'autre point au début d'une autre commande que <Command id="LINE" /> et <Command id="CIRCLE" />. Les réglages de la zone de visée et du marqueur, APERTURE et AUTOSNAP.

## Questions

### Comment s'appelle la commande OSNAP en français ?

ACCROBJ, raccourci `AC` : dans AutoCAD, elle ouvre la boîte de dialogue Paramètres de dessin à l'onglet Accrochage aux objets, pour choisir les accrochages actifs. MellowCAD n'a pas cette boîte de dialogue : tapez `-ACCROBJ` ou `-AC` et une liste de modes, ou cochez-les dans le menu du bouton Accrochage aux objets de la barre d'état. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_-OSNAP`.

### Quelle touche active l'accrochage aux objets ?

F3 l'active et le désactive, comme dans AutoCAD ; le bouton Accrochage aux objets de la barre d'état fait de même. Maj + clic droit à une invite de point ouvre le menu des accrochages pour un seul point.

### Pourquoi l'accrochage aux objets ne fonctionne pas ?

F3 l'a peut-être désactivé : son bouton dans la barre d'état l'indique. Ou le mode n'est pas actif : définissez-le avec `-ACCROBJ` ou avec le menu du bouton. Le curseur doit s'approcher à environ 10 pixels du point et, pour un centre, passer sur le cercle ou l'arc lui-même. Les accrochages ne fonctionnent que lorsqu'une commande demande un point.

### Comment forcer un accrochage aux objets pour un seul point ?

À l'invite de point, tapez les majuscules du mode, comme `MIL` ou `TAN`, ou choisissez-le dans le menu de Maj + clic droit. Il ne vaut que pour ce point, que ce mode soit actif ou non.

### Les paramètres d'accrochage aux objets sont-ils conservés ?

Jusqu'au rechargement de la page ; ensuite, ce sont de nouveau Extrémité, Centre, Intersection et Extension. AutoCAD ne les enregistre pas non plus dans le dessin.
