---
title: "Commande EDITSPLINE (SPLINEDIT) dans AutoCAD"
description: "Comment fonctionne EDITSPLINE (SPLINEDIT, alias ESI) d'AutoCAD en français : Clore, Joindre, Lissée, Modif-sommet, convertir en Polyligne, Inverser."
figure: "Une spline passant par cinq points de lissage, fermée par EDITSPLINE : une boucle lisse qui passe par tous."
sourceHash: "bedcaab2fac3"
---

EDITSPLINE (SPLINEDIT) modifie une spline. Sélectionnez-en une à l'invite `Sélectionnez une spline:`, ou avant la commande ; un double-clic sur une spline lance aussi EDITSPLINE sur elle. Tout autre objet affiche <Message id="objectNotSpline" /> et la commande redemande ; une polyligne lissée par l'option Spline de PEDIT est convertie, sans un mot, en une spline de la même courbe. La commande demande ensuite une option, encore et encore, chacune appliquée aussitôt, jusqu'à <Keyword id="eXit" /> ou Entrée. La spline affiche les poignées de ses points de lissage et, pendant que vous modifiez ses sommets, ses sommets de contrôle et son cadre. Toute la modification est une seule étape, que <Command id="U" /> défait. `'ZOOM` tapé fonctionne à chacune de ses invites.

## Options

### Close

Ferme la spline sans angle : une spline par ajustement en passant par ses points de lissage, une spline SC sur ses sommets. Sur une spline fermée, l'option devient <Keyword id="Open" />, et Joindre n'est pas proposée.

### Join

Joint les courbes ouvertes qui touchent ses extrémités, selon les règles de JOINDRE pour une spline, et dit combien de courbes ont été jointes.

### Fit data

Modifie les points par lesquels passe la spline. Une spline SC, qui n'en a pas, reçoit d'abord des points de lissage sur sa courbe. Ses options : <Keyword id="Add" /> désigne un point de lissage et en ajoute de nouveaux après lui, encore et encore (au premier point d'une spline ouverte, <Keyword id="After" /> ou <Keyword id="Before" />) ; <Keyword id="Delete" /> supprime des points de lissage, jusqu'à deux, trois sur une spline fermée (<Message id="cannotDeleteBeyond" />) ; <Keyword id="Move" /> parcourt les points de lissage avec <Keyword id="Next" /> et <Keyword id="Previous" />, ou <Keyword id="Select point" />, et déplace le point courant au point que vous indiquez ; <Keyword id="Purge" /> abandonne les données de lissage, ce qui laisse une spline SC ; <Keyword id="Tangents" /> fixe les directions de départ et de fin, ou <Keyword id="System default" /> ; <Keyword id="Close" /> et <Keyword id="eXit" />, comme à la première invite. Un point désigné qui n'est pas un point de lissage affiche <Message id="notAFitPoint" />.

### Edit vertex

Modifie les sommets de contrôle ; une spline par ajustement perd ses données de lissage à la première modification. <Keyword id="Add" /> place un sommet au point que vous désignez sur la spline ; <Keyword id="Delete" /> en supprime un, jusqu'à deux, trois sur une spline fermée ; <Keyword id="Elevate order" /> augmente l'ordre, jusqu'à 26, jamais vers le bas ; <Keyword id="Move" /> déplace des sommets, en les parcourant comme le fait l'option Déplacer des données de lissage ; <Keyword id="Weight" /> fixe le poids d'un sommet, après <Message id="splineMadeRational" />, pour que la courbe s'en approche ou s'en éloigne. Un point désigné qui n'est pas un sommet affiche <Message id="notAControlVertex" />.

### convert to Polyline

Demande une précision de 0 à 99, 10 par défaut, et remplace la spline par une polyligne de segments droits, d'autant plus nombreux que la précision est élevée ; une polyligne 3D là où la spline n'est pas à plat, parallèle au plan XY. Termine la commande. La précision est gardée pour la session, et la conversion de PEDIT l'utilise aussi.

### Reverse

Inverse le sens de la spline, son premier point devenant le dernier : <Message id="splineReversed" />.

### Undo

Défait la dernière option ; tout un passage par les données de lissage ou par la modification des sommets est défait d'un seul coup. Quand il n'en reste plus : <Message id="commandCompletelyUndone" />.

### eXit

Termine la commande, comme Entrée.

## Missing

Boucle (Kink), qui met un angle vif en un point de lissage ou un sommet ; TOlérance, qui relisse la spline dans une tolérance ; TAngentes d'une spline fermée. Convertir en polyligne crée bien plus de sommets qu'AutoCAD à partir d'une spline par ajustement, jamais d'arcs, et remplace toujours la spline. Groupe à l'invite `Sélectionnez une spline:`. Le `+` qu'AutoCAD dessine sur le point courant pendant que vous parcourez les points.

## Questions

### Comment s'appelle la commande SPLINEDIT en français ?

EDITSPLINE, avec l'alias `ESI`, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_SPLINEDIT`. Un double-clic sur une spline la lance aussi.

### Comment convertir une spline en polyligne ?

Lancez EDITSPLINE, sélectionnez la spline et choisissez <Keyword id="convert to Polyline" /> ; une précision de 10 donne une polyligne lisse. <Command id="PEDIT" /> sur une spline propose aussi de la convertir.

### Comment ajouter ou déplacer des points sur une spline ?

Choisissez <Keyword id="Fit data" /> pour travailler sur les points par lesquels elle passe, puis <Keyword id="Add" /> ou <Keyword id="Move" />. Choisissez <Keyword id="Edit vertex" /> pour travailler sur les sommets de contrôle qui l'encadrent.

### Comment fermer une spline ?

Choisissez <Keyword id="Close" /> : elle se ferme sans angle là où elle se rejoint. <Keyword id="Open" /> la rouvre.

### Comment joindre deux splines ?

Choisissez <Keyword id="Join" /> et sélectionnez la spline dont l'extrémité touche celle-ci, ou utilisez <Command id="JOIN" />.
