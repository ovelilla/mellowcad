---
title: "Commande RACCORD (FILLET) dans AutoCAD"
description: "Comment fonctionne RACCORD (FILLET, alias RD) d'AutoCAD en français, invite par invite : le rayon, deux lignes, une polyligne, rayon 0, Multiple. Essayez-le."
figure: "Quatre lignes, puis Rayon 15 et Multiple : deux angles arrondis, deux laissés vifs."
sourceHash: "f97d737f74a9"
---

RACCORD (FILLET) arrondit l'angle entre deux objets par un arc du rayon que vous donnez, en ajustant ou en prolongeant chaque objet jusqu'à lui. Sa première ligne indique le mode et le rayon courants ; vous sélectionnez ensuite le premier objet puis le second, chacun du côté à garder, et la commande se termine. Elle accepte les lignes, arcs, cercles, ellipses, splines et les segments d'une polyligne 2D. Deux lignes n'ont pas besoin de se toucher : elles sont prolongées jusqu'à l'arc, comme dans AutoCAD. Avec un rayon 0, ou en maintenant Maj au second objet, elle fait un angle vif à la place.

## Options

### Undo

Annule, un à la fois, ce que ce RACCORD a fait : un raccord, une <Keyword id="Polyline" /> ou un rayon donné. Quand il n'y a plus rien à annuler, elle dit <Message id="commandCompletelyUndone" />

### Polyline

Demande une polyligne 2D et arrondit chaque angle où deux de ses segments se rencontrent, en une seule étape, puis dit combien elle en a raccordé et combien elle en a laissé, parallèles ou trop courts pour le rayon. Un rectangle dessiné avec <Command id="RECTANG" /> est une polyligne de ce genre.

### Radius

Demande le rayon, proposé aussi à la seconde invite. C'est celui du dessin (FILLETRAD) : le RACCORD suivant part de lui, et il est enregistré avec le dessin. 0 fait des angles vifs ; un rayon négatif est refusé.

### Multiple

Redemande le premier objet après chaque raccord : vous arrondissez angle après angle sans relancer la commande, jusqu'à Entrée.

## Missing

<Keyword id="Trim" /> : les objets sont toujours ajustés ou prolongés jusqu'à l'arc, comme avec TRIMMODE 1, la valeur par défaut d'AutoCAD ; ne pas ajuster n'est pas proposé. L'arc ne prend pas l'échelle de type de ligne du second objet, car aucun objet n'en a une à lui ici. Avant le clic, l'info-bulle affiche l'invite plutôt que la raison pour laquelle une paire ne peut pas être raccordée, et aucun cadenas ne signale un objet d'un calque verrouillé. Quelques rares paires d'ellipses ou de splines finissent autrement : une spline fermée avec une ligne au rayon 0, un arc qui ne fait que toucher le décalage d'une ellipse, et une telle paire dans un plan incliné.

## Questions

### Comment s'appelle la commande FILLET en français ?

RACCORD, avec l'alias `RD`, puis Entrée ou la barre d'espace ; l'alias anglais `F` n'existe pas dans AutoCAD en français. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_FILLET`.

### Comment raccorder deux lignes dans AutoCAD ?

Choisissez <Keyword id="Radius" />, tapez-le, puis sélectionnez chaque ligne du côté à garder. Des lignes qui ne se touchent pas sont prolongées jusqu'à l'arc, et des lignes qui se croisent sont ajustées jusqu'à lui. Deux lignes parallèles sont reliées par un demi-cercle, quel que soit le rayon. Une ligne et un segment de polyligne sont réunis en une seule polyligne.

### Que fait un raccord de rayon 0 ?

Il fait un angle vif : chaque ligne est ajustée ou prolongée jusqu'à ce qu'elles se rencontrent, et aucun arc n'est dessiné. Pour un seul angle vif sans changer le rayon, maintenez Maj en sélectionnant le second objet.

### Pourquoi la commande raccord ne fonctionne pas ?

Elle le dit sur la ligne de commande. <Message id="filletRadiusTooLarge" /> veut dire que l'arc ne tient pas entre les lignes ; <Message id="segmentsNotConsecutive" />, que deux segments d'une même polyligne sont trop éloignés. Les textes, blocs, cotes et hachures sont refusés, des objets à des hauteurs différentes sont dits non coplanaires, et un objet d'un calque verrouillé n'est pas pris.

### Comment raccorder les arêtes d'un solide 3D ?

Lancez <Command id="FILLETEDGE" /> : choisissez <Keyword command="FILLETEDGE" id="Radius" /> si le rayon n'est pas celui qu'elle annonce, sélectionnez les arêtes du solide, puis appuyez sur Entrée, et encore sur Entrée pour accepter le raccord. Elle travaille sur les solides 3D, encore partiels ici.
