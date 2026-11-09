---
title: "Commande JOINDRE (JOIN) dans AutoCAD"
description: "Comment fonctionne JOINDRE (JOIN, alias J) d'AutoCAD en français : lignes et arcs en polyligne, lignes alignées en une seule, arcs en cercle. Essayez-le."
figure: "Trois lignes jointes en une seule polyligne, qu'une seule sélection de DECALER suit ensuite en entier."
sourceHash: "c4f26ede4174"
---

JOINDRE (JOIN) fait un seul objet de plusieurs. Sélectionnez-les, autant que vous voulez, et appuyez sur Entrée : les lignes et les arcs qui se touchent bout à bout deviennent une polyligne, jointe à une polyligne parmi eux s'il y en a une ; des lignes sur une même droite deviennent une seule ligne, par-dessus tout écart ; des arcs d'un même cercle deviennent un seul arc, et quand ils le ferment, JOINDRE demande s'il faut en faire un cercle, <Keyword id="Yes" /> par défaut, ou le garder comme arc avec <Keyword id="No" />. Des arcs elliptiques d'une même ellipse deviennent un seul arc, et une spline ou un arc elliptique parmi des courbes qui se touchent donne une spline. Elle dit ensuite ce qu'elle a créé, et combien d'objets elle a écartés. Une polyligne ne se joint que par ses extrémités, et une polyligne fermée ne se joint à rien. La jonction est une seule étape, qu'Annuler défait.

## Options

### cLose

Quand l'objet source est un arc elliptique, sélectionné seul : complète son ellipse.

## Missing

L'étape propre à AutoCAD quand l'objet source est une seule ligne, un seul arc ou une seule polyligne, sélectionné seul (`Sélectionnez les lignes à joindre à la source:`) : ici, rien n'est joint. Un objet fermé sélectionné seul, qu'AutoCAD redemande. Les hélices, les objets dans un plan incliné ou à l'envers, et les lignes qui ne sont pas dans un même plan, qu'AutoCAD joint en une polyligne 3D ou aplatit en une polyligne.

## Questions

### Comment s'appelle la commande JOIN en français ?

JOINDRE, avec l'alias `J`, le même qu'en anglais, puis Entrée ou la barre d'espace. Comme dans AutoCAD en français, le nom anglais fonctionne aussi, précédé d'un trait de soulignement : `_JOIN`.

### Comment joindre des lignes en une polyligne dans AutoCAD ?

Lancez JOINDRE, sélectionnez les lignes, par une fenêtre si vous voulez, et appuyez sur Entrée : celles qui se touchent bout à bout deviennent une seule polyligne.

### Pourquoi la commande joindre ne fonctionne pas ?

Les objets doivent se toucher exactement, bout à bout et dans un même plan : un écart ou un croisement les laisse de côté, et JOINDRE dit combien elle en a écartés. Seules les lignes alignées, les arcs d'un même cercle et ceux d'une même ellipse se joignent par-dessus un écart. Une polyligne fermée ne se joint à rien.

### Comment joindre des arcs en un cercle ?

Sélectionnez des arcs d'un même cercle qui le couvrent entièrement, et appuyez sur Entrée : JOINDRE demande s'il faut les convertir en cercle, et <Keyword id="Yes" />, l'option par défaut, le fait.
