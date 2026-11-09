---
title: "Commande POLY3D (3DPOLY) dans AutoCAD"
description: "Comment fonctionne POLY3D (3DPOLY, alias 3P) d'AutoCAD en français : une polyligne 3D de segments droits, chaque point à sa propre Z. Essayez-le gratuitement."
figure: "Une polyligne 3D qui monte de 15 à chaque coin d'un rectangle de 60 sur 40 posé au sol, vue du sud-est."
sourceHash: "b74d0c411c73"
---

POLY3D (3DPOLY en anglais) dessine une polyligne 3D : des segments droits passant par des points qui ont chacun leur propre coordonnée Z, en un seul objet. Spécifiez le point de départ, puis une extrémité pour chaque segment, jusqu'à ce qu'Entrée la termine ; même un point de départ seul est conservé, comme une polyligne d'un sommet. Entrée au point de départ est refusée avec <Message id="invalidPoint" /> : il n'y a pas d'option Continuer, que possède LIGNE. Un point tapé avec sa Z la conserve, `30,0,15` ; un point tapé sans Z, ou cliqué, se place à l'élévation du plan de travail, et un point accroché à un objet prend la Z de l'objet à cet endroit. Les points sont lus dans le SCU courant.

Contrairement à <Command id="PLINE" />, elle n'a ni plan, ni arcs, ni largeurs, ni épaisseur, et elle est dessinée en trait continu quel que soit son type de ligne, qu'elle conserve. La polyligne entière est une seule étape que <Command id="U" /> annule ; Echap conserve ce qui a été dessiné. PEDIT la modifie avec une liste d'options plus courte, et son option courbe Spline lui ajuste une courbe lisse.

## Options

### Close

À partir du deuxième segment : dessine un segment qui revient au point de départ, et termine.

### Undo

Annule le dernier sommet, et reprend à partir du précédent. Quand il ne reste aucun segment : <Message id="all3dSegmentsUndone" />.

## Missing

Une polyligne 3D lissée par une courbe affiche Aucun dans la propriété ajustage/lissage de la palette Propriétés, là où AutoCAD indique Quadratique ou Cubique, et ne peut pas y être modifiée. Elle ne peut servir ni de contour de hachures ni de trajectoire à TRAJECTOIRERESEAU, et la palette n'a pas de ligne Matériau. La saisie dynamique demande le point de départ dans une seule zone, sa Z tapée après une deuxième virgule, là où AutoCAD affiche des champs X, Y et Z. Les menus des poignées au survol : Etirer, Ajouter un sommet, Supprimer le sommet et les autres.

## Questions

### Comment s'appelle la commande 3DPOLY en français ?

POLY3D, et son raccourci est `3P` : tapez-le, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi précédé d'un trait de soulignement : `_3DPOLY`.

### Quelle est la différence entre POLYLIGNE et POLY3D ?

Une polyligne 2D, celle de <Command id="PLINE" />, se trouve dans un seul plan et peut avoir des arcs et des largeurs. Une polyligne 3D n'a que des segments droits, mais chaque sommet peut être à une hauteur différente : le tracé d'une canalisation, l'axe d'une route, un câble.

### Comment dessiner une polyligne 3D à différentes hauteurs ?

Tapez chaque point avec sa Z, `x,y,z`, ou accrochez-vous à des objets situés aux hauteurs voulues. Avec la saisie dynamique, un point après le premier est relatif : `60,0,15` avance de 60 selon X et monte de 15 depuis le précédent.

### Comment lisser une polyligne 3D ?

Modifiez-la avec <Command id="PEDIT" /> et choisissez sa courbe Spline : une courbe lisse que les sommets encadrent. L'option Redresser lui rend ses segments droits.
